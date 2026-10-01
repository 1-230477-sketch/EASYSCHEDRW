param(
    [int]$Port = 0,
    [string]$Php = 'C:\xampp\php\php.exe'
)

$ErrorActionPreference = 'Stop'
$source = Split-Path -Parent $PSScriptRoot
$temp = Join-Path $env:TEMP ('EasySched-Smoke-' + [guid]::NewGuid().ToString('N'))
$server = $null

function Assert-True([bool]$Condition, [string]$Message) {
    if (-not $Condition) { throw "FAIL: $Message" }
}

function Assert-ApiFailure {
    param(
        [string]$Action,
        [ValidateSet('GET', 'POST')][string]$Method = 'GET',
        [hashtable]$Body = @{},
        [string]$Csrf = '',
        [string]$Expected = '401|403|409|419|422'
    )
    $failed = $false
    try {
        Invoke-Api -Action $Action -Method $Method -Body $Body -Csrf $Csrf | Out-Null
    } catch {
        $failed = $true
        Assert-True ($_.Exception.Message -match $Expected) "Action '$Action' failed for an unexpected reason: $($_.Exception.Message)"
    }
    Assert-True $failed "Action '$Action' unexpectedly succeeded."
}

function Invoke-Api {
    param(
        [string]$Action,
        [ValidateSet('GET', 'POST')][string]$Method = 'GET',
        [hashtable]$Body = @{},
        [string]$Csrf = ''
    )
    $uri = "http://127.0.0.1:$Port/api.php?action=$Action"
    $headers = @{}
    if ($Csrf) { $headers['X-CSRF-Token'] = $Csrf }
    $params = @{ Uri = $uri; Method = $Method; WebSession = $script:Session; UseBasicParsing = $true }
    if ($headers.Count) { $params.Headers = $headers }
    if ($Method -eq 'POST') {
        $params.ContentType = 'application/json'
        $params.Body = ($Body | ConvertTo-Json -Depth 10)
    }
    try {
        $response = Invoke-WebRequest @params
        try {
            $payload = $response.Content | ConvertFrom-Json
        } catch {
            $preview = [string]$response.Content
            if ($preview.Length -gt 500) { $preview = $preview.Substring(0, 500) }
            throw "Action '$Action' returned non-JSON output: $preview"
        }
    } catch {
        $response = $_.Exception.Response
        if ($null -ne $response) {
            $content = [string]$_.ErrorDetails.Message
            if (-not $content) {
                $reader = New-Object IO.StreamReader($response.GetResponseStream())
                $content = $reader.ReadToEnd()
                $reader.Dispose()
            }
            try {
                $payload = $content | ConvertFrom-Json
                throw "HTTP $([int]$response.StatusCode): $($payload.error)"
            } catch [System.ArgumentException] {
                throw "HTTP $([int]$response.StatusCode): $content"
            }
        }
        throw
    }
    Assert-True ([bool]$payload.ok) "API action '$Action' returned an error: $($payload.error)"
    return $payload.data
}

try {
    Assert-True (Test-Path -LiteralPath $Php) "PHP executable was not found at $Php"
    if ($Port -le 0) {
        $listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, 0)
        $listener.Start()
        $Port = $listener.LocalEndpoint.Port
        $listener.Stop()
    }
    New-Item -ItemType Directory -Path $temp -Force | Out-Null
    Copy-Item -Path (Join-Path $source '*') -Destination $temp -Recurse -Force -Exclude 'data','.env'
    New-Item -ItemType Directory -Path (Join-Path $temp 'data') -Force | Out-Null
    $sessionPath = Join-Path $temp 'sessions'
    New-Item -ItemType Directory -Path $sessionPath -Force | Out-Null
    $database = Join-Path $temp 'data\easysched.sqlite'
    if (Test-Path -LiteralPath $database) { Remove-Item -LiteralPath $database -Force }

    $server = Start-Process -FilePath $Php -ArgumentList @('-d', "session.save_path=$sessionPath", '-S', "127.0.0.1:$Port", '-t', $temp) -WorkingDirectory $temp -PassThru -WindowStyle Hidden
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $health = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/index.php" -UseBasicParsing -TimeoutSec 2
            if ($health.StatusCode -eq 200) { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 250 }
    }
    Assert-True $ready 'PHP local server did not become ready.'

    $script:Session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    Assert-ApiFailure -Action 'bootstrap' -Expected '401|Authentication'

    $login = Invoke-Api -Action 'login' -Method POST -Body @{ username = 'admin'; password = 'Admin123!' }
    Assert-True ($login.user.role -eq 'admin') 'Admin login did not return the admin role.'
    Assert-True ($login.sections.Count -gt 0) 'Bootstrap did not return seeded sections.'
    $csrf = [string]$login.csrf
    $adminSession = $script:Session
    Assert-ApiFailure -Action 'generate' -Method POST -Body @{ term_id = [int]$login.active_term_id } -Expected '419|token'

    $programCode = 'QA' + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
    $program = Invoke-Api -Action 'save_master' -Method POST -Csrf $csrf -Body @{ entity = 'programs'; data = @{ code = $programCode; name = 'Smoke Test Program' } }
    Assert-True (@($program.snapshot.programs | Where-Object { $_.code -eq $programCode }).Count -eq 1) 'Program creation did not appear in bootstrap data.'
    $programId = [int]$program.id
    $deactivated = Invoke-Api -Action 'save_master' -Method POST -Csrf ([string]$program.snapshot.csrf) -Body @{ entity = 'programs'; id = $programId; delete = $true }
    Assert-True (@($deactivated.snapshot.programs | Where-Object { [int]$_.id -eq $programId }).Count -eq 0) 'Program deactivation did not remove it from active bootstrap data.'

    $newUser = Invoke-Api -Action 'save_master' -Method POST -Csrf ([string]$deactivated.snapshot.csrf) -Body @{
        entity = 'users'
        data = @{
            username = 'defense_test'
            display_name = 'Defense Test Student'
            email = 'defense.test@example.invalid'
            role = 'student'
            instructor_id = ''
            section_id = [int]$login.sections[0].id
            password = 'Defense123!'
        }
    }
    Assert-True (@($newUser.snapshot.users | Where-Object { $_.username -eq 'defense_test' }).Count -eq 1) 'Administrator could not create a user account.'
    $newUserId = [int]$newUser.id
    $csrf = [string]$newUser.snapshot.csrf

    $generated = Invoke-Api -Action 'generate' -Method POST -Csrf $csrf -Body @{ term_id = [int]$login.active_term_id }
    Assert-True ($generated.diagnostics.assigned_tasks -eq $generated.diagnostics.total_tasks) 'Generation did not assign every task.'
    Assert-True ($generated.snapshot.active_run.status -eq 'PUBLISHED') 'A successful generation was not published.'
    Assert-True ($generated.snapshot.schedules.Count -gt 0) 'Published schedule is empty.'
    $publishedRunId = [int]$generated.snapshot.active_run.id

    $entries = @($generated.snapshot.schedules)
    Assert-True ($entries.Count -ge 2) 'The seeded schedule did not contain enough entries for conflict testing.'
    $target = $entries[0]
    $blocker = $entries[1]
    Assert-ApiFailure -Action 'save_schedule' -Method POST -Csrf ([string]$generated.snapshot.csrf) -Body @{
        entry_id = [int]$target.id
        room_id = [int]$blocker.room_id
        day_of_week = [int]$blocker.day_of_week
        slot_id = [int]$blocker.slot_id
    } -Expected '409|constraint|conflict'
    $afterRejectedEdit = Invoke-Api -Action 'bootstrap'
    $unchanged = @($afterRejectedEdit.schedules | Where-Object { [int]$_.id -eq [int]$target.id })[0]
    Assert-True ($null -ne $unchanged) 'Rejected manual edit removed the schedule entry.'
    Assert-True ([int]$unchanged.room_id -eq [int]$target.room_id -and [int]$unchanged.day_of_week -eq [int]$target.day_of_week -and [int]$unchanged.slot_id -eq [int]$target.slot_id) 'Rejected manual edit changed the published entry.'

    $export = Invoke-WebRequest -Uri "http://127.0.0.1:$Port/api.php?action=export" -WebSession $script:Session -UseBasicParsing
    Assert-True ($export.Content -match 'Subject Code') 'CSV export did not contain the expected header.'

    & $Php (Join-Path $source 'tests\assert_database.php') $database
    if ($LASTEXITCODE -ne 0) { throw 'Database integrity assertions failed.' }

    $adminRequestSetup = Invoke-Api -Action 'bootstrap'
    $usedInstructorIds = @($adminRequestSetup.offerings | ForEach-Object { [int]$_.instructor_id } | Sort-Object -Unique)
    $durationInstructorRecord = @($adminRequestSetup.instructors | Where-Object { $usedInstructorIds -notcontains [int]$_.id } | Select-Object -First 1)[0]
    Assert-True ($null -ne $durationInstructorRecord) 'No unassigned faculty record was available for the room-request duration test.'
    $durationSection = $adminRequestSetup.sections[0]
    $usedSectionSubjectIds = @($adminRequestSetup.offerings | Where-Object { [int]$_.section_id -eq [int]$durationSection.id } | ForEach-Object { [int]$_.subject_id })
    $durationSubject = @($adminRequestSetup.subjects | Where-Object { $_.code -like 'OFF-*' -and $usedSectionSubjectIds -notcontains [int]$_.id } | Select-Object -First 1)[0]
    Assert-True ($null -ne $durationSubject) 'No unused official subject was available for the room-request duration test.'

    $durationRoom = Invoke-Api -Action 'save_master' -Method POST -Csrf ([string]$adminRequestSetup.csrf) -Body @{
        entity = 'rooms'
        data = @{ code = 'QAR' + [DateTimeOffset]::UtcNow.ToUnixTimeSeconds(); name = 'Room Request Duration Test'; capacity = 40; room_type = 'LECTURE'; features = @() }
    }
    $durationFacultyUser = Invoke-Api -Action 'save_master' -Method POST -Csrf ([string]$durationRoom.snapshot.csrf) -Body @{
        entity = 'users'
        data = @{ username = 'duration_test'; display_name = 'Duration Test Instructor'; email = 'duration.test@example.invalid'; role = 'instructor'; instructor_id = [int]$durationInstructorRecord.id; section_id = ''; password = 'Duration123!' }
    }
    $durationOffering = Invoke-Api -Action 'save_master' -Method POST -Csrf ([string]$durationFacultyUser.snapshot.csrf) -Body @{
        entity = 'offerings'
        data = @{ term_id = [int]$durationFacultyUser.snapshot.active_term_id; subject_id = [int]$durationSubject.id; section_id = [int]$durationSection.id; instructor_id = [int]$durationInstructorRecord.id; enrollment = 1; required_meetings = 1 }
    }

    $durationSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $script:Session = $durationSession
    $durationInstructor = Invoke-Api -Action 'login' -Method POST -Body @{ username = 'duration_test'; password = 'Duration123!' }
    $onePmSlot = @($durationInstructor.time_slots | Where-Object { $_.start_time -eq '13:00' })[0]
    Assert-True ($null -ne $onePmSlot) 'The 1:00 PM timetable slot was not available for the room-request duration test.'
    $durationRequestBody = @{
        offering_id = [int]$durationOffering.id
        room_id = [int]$durationRoom.id
        day_of_week = 1
        slot_id = [int]$onePmSlot.id
        request_date = '2026-10-05'
        start_time = '01:00'
        start_period = 'PM'
        end_time = '04:00'
        end_period = 'PM'
        note = '[REQUEST_DATE:2026-10-05] Duration smoke test'
    }
    $durationRequest = $null
    $availableCheck = $null
    $testMonday = [DateTime]::ParseExact('2026-10-05', 'yyyy-MM-dd', [Globalization.CultureInfo]::InvariantCulture)
    foreach ($requestDay in 1..5) {
        $requestDate = $testMonday.AddDays($requestDay - 1).ToString('yyyy-MM-dd')
        $durationRequestBody.day_of_week = $requestDay
        $durationRequestBody.request_date = $requestDate
        $durationRequestBody.note = "[REQUEST_DATE:$requestDate] Duration smoke test"
        $availableCheck = Invoke-Api -Action 'check_room_availability' -Method POST -Csrf ([string]$durationInstructor.csrf) -Body $durationRequestBody
        if ($availableCheck.available) {
            try {
                $durationRequest = Invoke-Api -Action 'request_schedule' -Method POST -Csrf ([string]$durationInstructor.csrf) -Body $durationRequestBody
                break
            } catch {
                if ($_.Exception.Message -match 'HTTP 409|conflicts with an existing') { continue }
                throw
            }
        }
    }
    Assert-True ($null -ne $durationRequest) 'Could not find a conflict-free day for the 1:00 PM to 4:00 PM room-request test.'
    Assert-True ($availableCheck.available) 'The availability endpoint did not report the free test room as available.'
    $availableRoomOptions = Invoke-Api -Action 'available_rooms' -Method POST -Csrf ([string]$durationInstructor.csrf) -Body $durationRequestBody
    Assert-True (@($availableRoomOptions.rooms | Where-Object { [int]$_.id -eq [int]$durationRoom.id }).Count -eq 1) 'The available-room list omitted a free room.'
    $storedDurationRequest = @($durationRequest.snapshot.schedule_requests | Where-Object { [int]$_.offering_id -eq [int]$durationOffering.id })[0]
    Assert-True ($null -ne $storedDurationRequest) 'The submitted duration request was not returned as one request row.'
    Assert-True ($storedDurationRequest.request_start_time -eq '13:00' -and $storedDurationRequest.requested_end_time -eq '16:00') 'The room request did not preserve its complete 1:00 PM to 4:00 PM interval.'
    $occupiedCheck = Invoke-Api -Action 'check_room_availability' -Method POST -Csrf ([string]$durationRequest.snapshot.csrf) -Body $durationRequestBody
    Assert-True (-not $occupiedCheck.available -and $occupiedCheck.conflicts.Count -gt 0) 'The availability endpoint did not report the pending request as a conflict.'
    Assert-True ($occupiedCheck.conflicts[0].start_time -eq '13:00' -and $occupiedCheck.conflicts[0].end_time -eq '16:00') 'The conflict response did not include the complete request interval.'
    $filteredRoomOptions = Invoke-Api -Action 'available_rooms' -Method POST -Csrf ([string]$durationRequest.snapshot.csrf) -Body $durationRequestBody
    Assert-True (@($filteredRoomOptions.rooms | Where-Object { [int]$_.id -eq [int]$durationRoom.id }).Count -eq 0) 'The available-room list included a room occupied by a pending request.'
    $otherRoom = @($durationRequest.snapshot.rooms | Where-Object { [int]$_.id -ne [int]$durationRoom.id } | Select-Object -First 1)[0]
    Assert-True ($null -ne $otherRoom) 'No second active room was available to verify instructor conflicts.'
    $otherRoomBody = $durationRequestBody.Clone()
    $otherRoomBody.room_id = [int]$otherRoom.id
    $instructorConflictCheck = Invoke-Api -Action 'check_room_availability' -Method POST -Csrf ([string]$durationRequest.snapshot.csrf) -Body $otherRoomBody
    Assert-True (@($instructorConflictCheck.conflicts | Where-Object { $_.resource -eq 'Instructor' }).Count -gt 0) 'A pending request did not conflict for the instructor when checking a different room.'
    Assert-ApiFailure -Action 'request_schedule' -Method POST -Csrf ([string]$durationRequest.snapshot.csrf) -Body $durationRequestBody -Expected '409|occupied'
    $invalidDurationBody = $durationRequestBody.Clone()
    $invalidDurationBody.end_time = '06:30'
    $invalidDurationBody.end_period = 'PM'
    Assert-ApiFailure -Action 'request_schedule' -Method POST -Csrf ([string]$durationRequest.snapshot.csrf) -Body $invalidDurationBody -Expected '422|fit fully'
    $durationAfterInvalid = Invoke-Api -Action 'bootstrap'
    Assert-True (@($durationAfterInvalid.schedule_requests | Where-Object { [int]$_.offering_id -eq [int]$durationOffering.id }).Count -eq 1) 'An invalid partial-coverage request was persisted.'

    $instructorSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $script:Session = $instructorSession
    $instructor = Invoke-Api -Action 'login' -Method POST -Body @{ username = 'instructor'; password = 'Instructor123!' }
    Assert-True ($instructor.user.role -eq 'instructor') 'Instructor login did not return the instructor role.'
    Assert-True (@($instructor.schedules | Where-Object { [int]$_.instructor_id -ne [int]$instructor.user.instructor_id }).Count -eq 0) 'Instructor schedule included another instructor.'
    $instructorProfile = Invoke-Api -Action 'save_student_profile' -Method POST -Csrf ([string]$instructor.csrf) -Body @{
        section = 'basics'; sex = 'Prefer not to say'; birthdate = '1990-01-01'; mobile_number = '09123456789'
        guardian_first_name = 'N/A'; guardian_middle_name = ''; guardian_last_name = 'N/A'
        guardian_email = 'guardian@example.invalid'; guardian_contact_number = '09123456789'; guardian_relation = 'N/A'
    }
    Assert-True ($instructorProfile.snapshot.student_profile.mobile_number -eq '09123456789') 'Instructor could not save their own profile.'

    $studentSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $script:Session = $studentSession
    $student = Invoke-Api -Action 'login' -Method POST -Body @{ username = 'student'; password = 'Student123!' }
    Assert-True ($student.user.role -eq 'student') 'Student login did not return the student role.'
    Assert-True ($null -eq $student.student_profile) 'A new student unexpectedly had saved profile details.'
    Assert-ApiFailure -Action 'save_student_profile' -Method POST -Csrf ([string]$student.csrf) -Body @{ section = 'verification'; verified = $true } -Expected '422|Complete'
    $profileBasics = Invoke-Api -Action 'save_student_profile' -Method POST -Csrf ([string]$student.csrf) -Body @{
        section = 'basics'; sex = 'Female'; birthdate = '2004-11-29'; mobile_number = '09117653921'
        guardian_first_name = 'Nerica'; guardian_middle_name = 'Ilag'; guardian_last_name = 'Caraig'
        guardian_email = 'guardian@example.invalid'; guardian_contact_number = '09557738286'; guardian_relation = 'Mother'
    }
    $student = $profileBasics.snapshot
    $profileAddress = Invoke-Api -Action 'save_student_profile' -Method POST -Csrf ([string]$student.csrf) -Body @{
        section = 'address'; block_lot = 'Purok 3'; street_name = ''; barangay = 'Macabling'
        city_municipality = 'Santa Rosa City'; province = 'Laguna'; zip_code = '4026'
    }
    $student = $profileAddress.snapshot
    $profileParents = Invoke-Api -Action 'save_student_profile' -Method POST -Csrf ([string]$student.csrf) -Body @{
        section = 'parents'; father_last_name = 'Caraig'; father_first_name = 'Joselito'; father_middle_name = 'Baybay'
        mother_last_name = 'Ilag'; mother_first_name = 'Nerica'; mother_middle_name = 'Diona'
    }
    $student = $profileParents.snapshot
    $verifiedProfile = Invoke-Api -Action 'save_student_profile' -Method POST -Csrf ([string]$student.csrf) -Body @{ section = 'verification'; verified = $true }
    $student = $verifiedProfile.snapshot
    Assert-True ([bool]$student.student_profile.verified_at) 'Student profile verification was not saved.'
    $updatedBasics = Invoke-Api -Action 'save_student_profile' -Method POST -Csrf ([string]$student.csrf) -Body @{
        section = 'basics'; sex = 'Female'; birthdate = '2004-11-29'; mobile_number = '09999999999'
        guardian_first_name = 'Nerica'; guardian_middle_name = 'Ilag'; guardian_last_name = 'Caraig'
        guardian_email = 'guardian@example.invalid'; guardian_contact_number = '09557738286'; guardian_relation = 'Mother'
    }
    Assert-True ($null -eq $updatedBasics.snapshot.student_profile.verified_at) 'Editing a verified profile did not clear verification.'
    Assert-True ($student.schedules.Count -gt 0) 'Student did not receive the section-scoped schedule.'
    Assert-True (@($student.schedules | Where-Object { [int]$_.section_id -ne [int]$student.user.section_id }).Count -eq 0) 'Student schedule included another section.'
    Assert-True (@($student.sections | Where-Object { [int]$_.id -ne [int]$student.user.section_id }).Count -eq 0) 'Student bootstrap exposed another section.'
    Assert-True (@($student.offerings | Where-Object { [int]$_.section_id -ne [int]$student.user.section_id }).Count -eq 0) 'Student bootstrap exposed another offering.'
    Assert-ApiFailure -Action 'generate' -Method POST -Csrf ([string]$student.csrf) -Body @{ term_id = [int]$student.active_term_id } -Expected '403|permission'
    Assert-ApiFailure -Action 'save_master' -Method POST -Csrf ([string]$student.csrf) -Body @{ entity = 'programs'; id = 1; data = @{ code = 'HACK'; name = 'Unauthorized' } } -Expected '403|permission'
    Assert-ApiFailure -Action 'save_schedule' -Method POST -Csrf ([string]$student.csrf) -Body @{ entry_id = [int]$target.id; room_id = [int]$target.room_id; day_of_week = [int]$target.day_of_week; slot_id = [int]$target.slot_id } -Expected '403|permission'
    Assert-ApiFailure -Action 'sync_cloud' -Method POST -Csrf ([string]$student.csrf) -Body @{} -Expected '404|Unknown'

    $createdStudentSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $script:Session = $createdStudentSession
    $createdStudent = Invoke-Api -Action 'login' -Method POST -Body @{ username = 'defense_test'; password = 'Defense123!' }
    Assert-True ($createdStudent.user.role -eq 'student') 'The administrator-created account could not sign in.'
    Assert-True (@($createdStudent.schedules | Where-Object { [int]$_.section_id -ne [int]$createdStudent.user.section_id }).Count -eq 0) 'The administrator-created student account escaped its section scope.'

    $script:Session = $adminSession
    $admin = Invoke-Api -Action 'bootstrap'
    $csrf = [string]$admin.csrf
    $disabledUser = Invoke-Api -Action 'save_master' -Method POST -Csrf $csrf -Body @{ entity = 'users'; id = $newUserId; delete = $true }
    Assert-True (@($disabledUser.snapshot.users | Where-Object { [int]$_.id -eq $newUserId }).Count -eq 0) 'User deactivation did not remove the account from active users.'

    $schedulerSession = New-Object Microsoft.PowerShell.Commands.WebRequestSession
    $script:Session = $schedulerSession
    $scheduler = Invoke-Api -Action 'login' -Method POST -Body @{ username = 'scheduler'; password = 'Scheduler123!' }
    Assert-ApiFailure -Action 'save_master' -Method POST -Csrf ([string]$scheduler.csrf) -Body @{ entity = 'users'; data = @{ username = 'escalation'; display_name = 'Unauthorized'; role = 'admin'; password = 'Defense123!' } } -Expected '403|permission'
    Assert-ApiFailure -Action 'save_settings' -Method POST -Csrf ([string]$scheduler.csrf) -Body @{ academic_year = '2027-2028'; semester = 'First Semester' } -Expected '403|permission'

    $script:Session = $adminSession

    $impossibleSection = $disabledUser.snapshot.sections[0]
    $assignedSubjectIds = @($disabledUser.snapshot.offerings | Where-Object { [int]$_.section_id -eq [int]$impossibleSection.id } | ForEach-Object { [int]$_.subject_id })
    $impossibleSubjectRecord = @($disabledUser.snapshot.subjects | Where-Object { $_.code -like 'OFF-*' -and $assignedSubjectIds -notcontains [int]$_.id } | Select-Object -First 1)[0]
    Assert-True ($null -ne $impossibleSubjectRecord) 'No unused official subject was available for the impossible-room test section.'
    $impossibleSubject = Invoke-Api -Action 'save_master' -Method POST -Csrf ([string]$disabledUser.snapshot.csrf) -Body @{
        entity = 'subjects'
        id = [int]$impossibleSubjectRecord.id
        data = @{ code = $impossibleSubjectRecord.code; name = $impossibleSubjectRecord.name; units = [int]$impossibleSubjectRecord.units; hours_per_week = [int]$impossibleSubjectRecord.hours_per_week; duration_slots = 1; room_type = 'SPECIAL'; required_features = @('QA-impossible-feature') }
    }
    $impossibleOffering = Invoke-Api -Action 'save_master' -Method POST -Csrf ([string]$impossibleSubject.snapshot.csrf) -Body @{
        entity = 'offerings'
        data = @{
            term_id = [int]$impossibleSubject.snapshot.active_term_id
            subject_id = [int]$impossibleSubject.id
            section_id = [int]$impossibleSection.id
            instructor_id = [int]$impossibleSubject.snapshot.instructors[0].id
            enrollment = 1
            required_meetings = 1
        }
    }
    Assert-ApiFailure -Action 'generate' -Method POST -Csrf ([string]$impossibleOffering.snapshot.csrf) -Body @{ term_id = [int]$impossibleOffering.snapshot.active_term_id } -Expected '422|eligible room|SPECIAL|complete conflict-free'
    $preserved = Invoke-Api -Action 'bootstrap'
    Assert-True ([int]$preserved.active_run.id -eq $publishedRunId) 'Failed generation replaced the previously published schedule.'

    Write-Output 'PASS: EasySched HTTP smoke test'
} finally {
    if ($server) { Stop-Process -Id $server.Id -Force -ErrorAction SilentlyContinue }
    $resolvedTemp = [IO.Path]::GetFullPath($temp)
    $allowedTemp = [IO.Path]::GetFullPath($env:TEMP).TrimEnd('\') + '\'
    if (-not $resolvedTemp.StartsWith($allowedTemp, [StringComparison]::OrdinalIgnoreCase) -or (Split-Path -Leaf $resolvedTemp) -notmatch '^EasySched-Smoke-[a-f0-9]{32}$') { throw 'Unsafe smoke-test cleanup path.' }
    if (Test-Path -LiteralPath $resolvedTemp) { Remove-Item -LiteralPath $resolvedTemp -Recurse -Force -ErrorAction SilentlyContinue }
}
