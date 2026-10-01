<?php
declare(strict_types=1);

// Load optional local settings, such as email delivery, from an untracked .env file.
function load_local_env(): void
{
    static $loaded = false;
    if ($loaded) return;
    $loaded = true;

    $candidatePaths = [
        __DIR__ . DIRECTORY_SEPARATOR . '.env',
        __DIR__ . DIRECTORY_SEPARATOR . '.env.local',
        __DIR__ . DIRECTORY_SEPARATOR . '.env.txt',
    ];

    foreach ($candidatePaths as $path) {
        if (!is_file($path)) continue;

        foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) continue;
            [$key, $value] = explode('=', $line, 2);
            $key = trim($key); $value = trim($value);
            if ($value !== '' && (($value[0] ?? '') === '"' || ($value[0] ?? '') === "'")) $value = trim($value, "\"'");
            if ($key === '') continue;
            $runtimeValue = getenv($key);
            if ($runtimeValue === false || $runtimeValue === '') {
                putenv($key . '=' . $value);
                $_ENV[$key] = $value;
                $_SERVER[$key] = $value;
            }
        }
        break;
    }
}

function db(): PDO
{
    load_local_env();
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    try {
        $configuredPath = getenv('EASYSCHED_DB_PATH') ?: '';
        $databasePath = $configuredPath !== '' ? $configuredPath : (__DIR__ . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'easysched.sqlite');
        $dataDir = dirname($databasePath);
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0770, true);
        }

        $pdo = new PDO('sqlite:' . $databasePath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        $pdo->exec('PRAGMA foreign_keys = ON');
        $pdo->exec('PRAGMA journal_mode = WAL');
        $pdo->exec('PRAGMA busy_timeout = 5000');

        $schema = file_get_contents(__DIR__ . DIRECTORY_SEPARATOR . 'schema.sql');
        if ($schema === false) {
            throw new RuntimeException('Database schema is unavailable.');
        }
        
        // Execute schema - wrap in transaction
        try {
            $pdo->exec($schema);
        } catch (Throwable $e) {
            error_log('Schema execution error: ' . $e->getMessage());
            // Schema might already exist, that's ok
        }
        
        // Initialize database
        seed_database($pdo);
        normalize_instructor_catalog($pdo);
        normalize_class_assignment_instructors($pdo);
        normalize_institution_branding($pdo);
        normalize_program_catalog($pdo);
        normalize_section_catalog($pdo);
        normalize_room_catalog($pdo);
        normalize_subject_catalog($pdo);
        ensure_section_offerings($pdo);
        normalize_catalog_offering_meetings($pdo);
        normalize_time_slot_catalog($pdo);
        ensure_schedule_request_date($pdo);
        
        return $pdo;
    } catch (Throwable $e) {
        error_log('Database initialization error: ' . $e->getMessage());
        throw $e;
    }
}

function ensure_schedule_request_date(PDO $pdo): void
{
    $columns = $pdo->query('PRAGMA table_info(schedule_requests)')->fetchAll();
    if (array_filter($columns, static fn(array $column): bool => $column['name'] === 'request_date') === []) {
        $pdo->exec('ALTER TABLE schedule_requests ADD COLUMN request_date TEXT');
    }
    if (array_filter($columns, static fn(array $column): bool => $column['name'] === 'requested_end_time') === []) {
        $pdo->exec('ALTER TABLE schedule_requests ADD COLUMN requested_end_time TEXT');
    }
    $entryColumns = $pdo->query('PRAGMA table_info(schedule_entries)')->fetchAll();
    if (array_filter($entryColumns, static fn(array $column): bool => $column['name'] === 'end_time_override') === []) {
        $pdo->exec('ALTER TABLE schedule_entries ADD COLUMN end_time_override TEXT');
    }
    $pdo->exec("CREATE TRIGGER IF NOT EXISTS trg_schedule_request_date_marker AFTER INSERT ON schedule_requests WHEN NEW.request_date IS NULL AND NEW.note LIKE '[REQUEST_DATE:%' BEGIN UPDATE schedule_requests SET request_date = substr(NEW.note, 15, 10) WHERE id = NEW.id; END");
    $pdo->exec("CREATE TRIGGER IF NOT EXISTS trg_schedule_request_end_marker AFTER INSERT ON schedule_requests WHEN NEW.requested_end_time IS NULL AND instr(NEW.note, '[REQUEST_END:') > 0 BEGIN UPDATE schedule_requests SET requested_end_time = substr(NEW.note, instr(NEW.note, '[REQUEST_END:') + 13, 5), note = trim(replace(NEW.note, substr(NEW.note, instr(NEW.note, '[REQUEST_END:') - 1, 20), '')) WHERE id = NEW.id; END");
}

function normalize_institution_branding(PDO $pdo): void
{
    $stmt = $pdo->prepare("UPDATE system_settings SET setting_value = ? WHERE setting_key = 'institution_name' AND setting_value = ?");
    $stmt->execute(['New Sinai School and Colleges Sta. Rosa, Inc.', 'Sinao Colleges']);

    $demoEmails = [
        'respende@sinao.edu' => 'respende@example.invalid',
        'tuazon@sinao.edu' => 'tuazon@example.invalid',
        'guarino@sinao.edu' => 'guarino@example.invalid',
        'payos@sinao.edu' => 'payos@example.invalid',
        'santos@sinao.edu' => 'santos@example.invalid',
        'cruz@sinao.edu' => 'cruz@example.invalid',
        'admin@sinao.edu' => 'admin@example.invalid',
        'scheduler@sinao.edu' => 'scheduler@example.invalid',
        'student@sinao.edu' => 'student@example.invalid',
    ];
    foreach ($demoEmails as $oldEmail => $newEmail) {
        $updateInstructor = $pdo->prepare('UPDATE instructors SET email = ? WHERE email = ?');
        $updateInstructor->execute([$newEmail, $oldEmail]);
        $updateUser = $pdo->prepare('UPDATE users SET email = ? WHERE email = ?');
        $updateUser->execute([$newEmail, $oldEmail]);
    }
}

function faculty_roster(): array
{
    return [
        'Prof. Caya',
        'Prof. De Borja',
        'Prof. Naval',
        'Prof. Flordeliza',
        'Prof. Banawa',
        'Prof. Galvan',
        'Prof. Aniel',
        'Prof. Sanchez',
        'Prof. Molina',
        'Prof. Azarcon',
        'Prof. Carpena',
        'Prof. Yango',
        'Prof. Nabua',
        'Prof. Villegas',
        'Prof. Abon',
        'Prof. Conag',
        'Prof. Merilles',
        'Prof. Villarama',
        'Prof. Valdez',
        'Prof. Buenviaje',
        'Prof. Alfonso',
        'Prof. Cajumban',
        'Prof. Deblois',
        'Prof. Detera',
        'Prof. Belen',
        'Prof. Dadis',
        'Prof. Ocampo',
        'Prof. Decena',
        'Prof. Collado',
    ];
}

function normalize_instructor_catalog(PDO $pdo): void
{
    $pdo->exec('UPDATE instructors SET active = 0 WHERE active <> 0');
    $findByName = $pdo->prepare('SELECT id FROM instructors WHERE name = ? ORDER BY id LIMIT 1');
    $activate = $pdo->prepare('UPDATE instructors SET active = 1 WHERE id = ?');
    $findByEmployeeNo = $pdo->prepare('SELECT 1 FROM instructors WHERE employee_no = ? LIMIT 1');
    $insert = $pdo->prepare('INSERT INTO instructors (employee_no, name, email, max_hours_day, active) VALUES (?, ?, NULL, 6, 1)');

    foreach (faculty_roster() as $index => $name) {
        $findByName->execute([$name]);
        $id = $findByName->fetchColumn();
        if ($id !== false) {
            $activate->execute([$id]);
            continue;
        }

        $employeeNoIndex = $index + 1;
        do {
            $employeeNo = 'FAC-' . str_pad((string) $employeeNoIndex, 3, '0', STR_PAD_LEFT);
            $findByEmployeeNo->execute([$employeeNo]);
            $employeeNoIndex++;
        } while ($findByEmployeeNo->fetchColumn() !== false);

        $insert->execute([$employeeNo, $name]);
    }
}

function normalize_class_assignment_instructors(PDO $pdo): void
{
    $termId = $pdo->query('SELECT id FROM academic_terms WHERE is_active = 1 ORDER BY id DESC LIMIT 1')->fetchColumn();
    if ($termId === false) {
        return;
    }

    $replacements = [
        'Prof. Cruz' => 'Prof. Caya',
        'Prof. Guarino' => 'Prof. De Borja',
        'Prof. Payos' => 'Prof. Naval',
        'Prof. Respende' => 'Prof. Flordeliza',
        'Prof. Santos' => 'Prof. Banawa',
        'Prof. Tuazon' => 'Prof. Galvan',
    ];
    $findInstructor = $pdo->prepare('SELECT id FROM instructors WHERE name = ? ORDER BY id LIMIT 1');
    $updateOfferings = $pdo->prepare("UPDATE course_offerings SET instructor_id = ? WHERE instructor_id = ? AND term_id = ? AND status = 'ACTIVE'");
    $updateInstructorUsers = $pdo->prepare("UPDATE users SET instructor_id = ?, display_name = ? WHERE instructor_id = ? AND role = 'instructor'");
    $updateScheduleRequests = $pdo->prepare('UPDATE schedule_requests SET instructor_id = ? WHERE instructor_id = ? AND term_id = ?');

    foreach ($replacements as $oldName => $newName) {
        $findInstructor->execute([$oldName]);
        $oldId = $findInstructor->fetchColumn();
        $findInstructor->execute([$newName]);
        $newId = $findInstructor->fetchColumn();
        if ($oldId !== false && $newId !== false) {
            $updateOfferings->execute([$newId, $oldId, $termId]);
            $updateInstructorUsers->execute([$newId, $newName, $oldId]);
            $updateScheduleRequests->execute([$newId, $oldId, $termId]);
        }
    }
}

function normalize_program_catalog(PDO $pdo): void
{
    $programs = [
        ['BSRT', 'Bachelor of Science in Radiologic Technology', 'BSIT'],
        ['BSP', 'Bachelor of Science in Psychology', 'BSED'],
        ['BSN', 'Bachelor of Science in Nursing', null],
        ['BSMT', 'Bachelor of Science in Medical Technology', null],
    ];

    foreach ($programs as [$code, $name, $legacyCode]) {
        $stmt = $pdo->prepare('SELECT id FROM programs WHERE code = ? LIMIT 1');
        $stmt->execute([$code]);
        $id = $stmt->fetchColumn();

        if (!$id && $legacyCode !== null) {
            $stmt->execute([$legacyCode]);
            $id = $stmt->fetchColumn();
        }

        if ($id) {
            $update = $pdo->prepare('UPDATE programs SET code = ?, name = ?, active = 1 WHERE id = ?');
            $update->execute([$code, $name, $id]);
        } else {
            $insert = $pdo->prepare('INSERT INTO programs (code, name, active) VALUES (?, ?, 1)');
            $insert->execute([$code, $name]);
        }
    }

    $pdo->exec("UPDATE programs SET active = 0 WHERE code IN ('BSIT', 'BSED')");
}

function normalize_section_catalog(PDO $pdo): void
{
    $termId = $pdo->query('SELECT id FROM academic_terms WHERE is_active = 1 ORDER BY id DESC LIMIT 1')->fetchColumn();
    if (!$termId) return;

    $migrationKey = 'single_section_catalog_v1';
    $migration = $pdo->prepare('SELECT setting_value FROM system_settings WHERE setting_key = ?');
    $migration->execute([$migrationKey]);
    if ($migration->fetchColumn() !== '1') {
        $pdo->prepare("UPDATE schedule_runs SET status = 'ARCHIVED' WHERE term_id = ? AND status <> 'ARCHIVED'")->execute([(int) $termId]);
    }

    $programs = $pdo->query("SELECT id, code FROM programs WHERE active = 1 AND code IN ('BSN', 'BSP', 'BSRT', 'BSMT') ORDER BY code")->fetchAll();
    $canonical = [];
    foreach ($programs as $program) {
        for ($year = 1; $year <= 4; $year++) {
            foreach (['A'] as $suffix) {
                $code = $program['code'] . '-' . $year . $suffix;
                $stmt = $pdo->prepare('SELECT id FROM sections WHERE term_id = ? AND code = ? LIMIT 1');
                $stmt->execute([$termId, $code]);
                $id = $stmt->fetchColumn();
                if ($id) {
                    $pdo->prepare('UPDATE sections SET program_id = ?, year_level = ?, student_count = ?, active = 1 WHERE id = ?')->execute([(int) $program['id'], $year, 40, $id]);
                } else {
                    $pdo->prepare('INSERT INTO sections (program_id, term_id, code, year_level, student_count, active) VALUES (?, ?, ?, ?, ?, 1)')->execute([(int) $program['id'], $termId, $code, $year, 40]);
                    $id = $pdo->lastInsertId();
                }
                $canonical[(int) $program['id'] . ':' . $year . ':' . $suffix] = (int) $id;
            }
        }
    }

    foreach ($programs as $program) {
        for ($year = 1; $year <= 4; $year++) {
            $stmt = $pdo->prepare('SELECT id, code FROM sections WHERE program_id = ? AND term_id = ? AND year_level = ? AND active = 1');
            $stmt->execute([(int) $program['id'], $termId, $year]);
            foreach ($stmt->fetchAll() as $section) {
                $suffix = in_array(substr((string) $section['code'], -1), ['A', 'B'], true) ? substr((string) $section['code'], -1) : null;
                $targetId = $canonical[(int) $program['id'] . ':' . $year . ':A'] ?? null;
                if ($targetId && (int) $section['id'] !== $targetId) {
                    $offerings = $pdo->prepare('SELECT id, subject_id, instructor_id, enrollment, required_meetings FROM course_offerings WHERE section_id = ? AND status = "ACTIVE"');
                    $offerings->execute([(int) $section['id']]);
                    $duplicate = $pdo->prepare('SELECT id, status FROM course_offerings WHERE term_id = ? AND subject_id = ? AND section_id = ? LIMIT 1');
                    foreach ($offerings->fetchAll() as $offering) {
                        $duplicate->execute([$termId, (int) $offering['subject_id'], $targetId]);
                        $existing = $duplicate->fetch();
                        if ($existing && $existing['status'] === 'ACTIVE') {
                            $pdo->prepare('UPDATE course_offerings SET status = "INACTIVE" WHERE id = ?')->execute([(int) $offering['id']]);
                        } elseif ($existing) {
                            $pdo->prepare('UPDATE course_offerings SET instructor_id = ?, enrollment = ?, required_meetings = ?, status = "ACTIVE" WHERE id = ?')->execute([(int) $offering['instructor_id'], (int) $offering['enrollment'], (int) $offering['required_meetings'], (int) $existing['id']]);
                            $pdo->prepare('UPDATE course_offerings SET status = "INACTIVE" WHERE id = ?')->execute([(int) $offering['id']]);
                        } else {
                            $pdo->prepare('UPDATE course_offerings SET section_id = ? WHERE id = ?')->execute([$targetId, (int) $offering['id']]);
                        }
                    }
                    $pdo->prepare('UPDATE pending_registrations SET section_id = ? WHERE section_id = ?')->execute([$targetId, (int) $section['id']]);
                    $pdo->prepare('UPDATE users SET section_id = ? WHERE role = "student" AND section_id = ?')->execute([$targetId, (int) $section['id']]);
                    $pdo->prepare('UPDATE sections SET active = 0 WHERE id = ?')->execute([(int) $section['id']]);
                } elseif (!$targetId) {
                    $pdo->prepare('UPDATE sections SET active = 0 WHERE id = ?')->execute([(int) $section['id']]);
                }
            }
        }
    }

    $pdo->prepare("INSERT INTO system_settings (setting_key, setting_value) VALUES (?, '1') ON CONFLICT(setting_key) DO UPDATE SET setting_value = excluded.setting_value")->execute([$migrationKey]);

    $staleStudents = $pdo->query('SELECT id, section_id FROM users WHERE role = "student" AND active = 1')->fetchAll();
    foreach ($staleStudents as $userRow) {
        $currentSection = (int) $userRow['section_id'];
        $validCheck = $pdo->prepare("SELECT sec.id FROM sections sec JOIN course_offerings co ON co.section_id = sec.id AND co.term_id = ? AND co.status = 'ACTIVE' WHERE sec.id = ? AND sec.active = 1 GROUP BY sec.id LIMIT 1");
        $validCheck->execute([$termId, $currentSection]);
        if ($validCheck->fetchColumn() !== false) {
            continue;
        }

        $canonicalSectionId = $pdo->prepare("SELECT sec.id FROM sections sec JOIN course_offerings co ON co.section_id = sec.id AND co.term_id = ? AND co.status = 'ACTIVE' WHERE sec.active = 1 GROUP BY sec.id ORDER BY sec.id LIMIT 1");
        $canonicalSectionId->execute([$termId]);
        $fallbackSectionId = $canonicalSectionId->fetchColumn();
        if ($fallbackSectionId === false) {
            $pdo->prepare('UPDATE users SET section_id = NULL WHERE id = ? AND role = "student"')->execute([(int) $userRow['id']]);
            continue;
        }

        $pdo->prepare('UPDATE users SET section_id = ? WHERE id = ? AND role = "student"')->execute([(int) $fallbackSectionId, (int) $userRow['id']]);
    }
}

function normalize_room_catalog(PDO $pdo): void
{
    $lectureCapacity = max(40, (int) ($pdo->query('SELECT COALESCE(MAX(student_count), 40) FROM sections WHERE active = 1')->fetchColumn() ?: 40));
    $rooms = [
        ['RLE', 'Related Learning Experience (RLE)', 'SPECIAL', 40, ['Projector']],
        ['NSL', 'Nursing Skills Laboratory', 'LAB', 40, ['Projector']],
        ['MTL', 'Medical Technology Laboratory', 'LAB', 40, ['Computers', 'Projector']],
        ['RTL', 'Radiologic Technology Laboratory', 'LAB', 40, ['Projector']],
        ['PSL', 'Psychology Laboratory', 'LAB', 40, ['Projector']],
        ['COMLAB', 'Computer Laboratory', 'LAB', 40, ['Computers', 'Projector']],
        ['LR', 'Lecture Room', 'LECTURE', $lectureCapacity, ['Projector']],
        ['LR-1', 'Lecture Room 1', 'LECTURE', $lectureCapacity, ['Projector']],
        ['LR-2', 'Lecture Room 2', 'LECTURE', $lectureCapacity, ['Projector']],
        ['LR-3', 'Lecture Room 3', 'LECTURE', $lectureCapacity, ['Projector']],
        ['LR-4', 'Lecture Room 4', 'LECTURE', $lectureCapacity, ['Projector']],
    ];
    $legacyCodes = ['ROOM-201', 'COMLAB-1', 'COMLAB-2', 'COMLAB-3', 'ROOM-202', 'LH-A', 'LH-B'];

    foreach ($rooms as $index => [$code, $name, $type, $capacity, $features]) {
        $stmt = $pdo->prepare('SELECT id FROM rooms WHERE code = ? LIMIT 1');
        $stmt->execute([$code]);
        $id = $stmt->fetchColumn();
        if (!$id && isset($legacyCodes[$index])) {
            $stmt->execute([$legacyCodes[$index]]);
            $id = $stmt->fetchColumn();
        }
        if ($id) {
            $update = $pdo->prepare('UPDATE rooms SET code = ?, name = ?, capacity = ?, room_type = ?, features_json = ?, active = 1 WHERE id = ?');
            $update->execute([$code, $name, $capacity, $type, json_encode($features, JSON_THROW_ON_ERROR), $id]);
        } else {
            $insert = $pdo->prepare('INSERT INTO rooms (code, name, capacity, room_type, features_json, active) VALUES (?, ?, ?, ?, ?, 1)');
            $insert->execute([$code, $name, $capacity, $type, json_encode($features, JSON_THROW_ON_ERROR)]);
        }
    }
}

function normalize_subject_catalog(PDO $pdo): void
{
    $subjects = [
        'Art Appreciation',
        'Basic Finance',
        'Business and Real Estate Taxation',
        'Civic Welfare Training Service 1',
        'Comparative Models in Policing',
        'Dance',
        'Dance (Folk Dance)',
        'Entrepreneur Mind',
        'Environmental Science',
        'Ethical Standards for Real Estate Practice',
        'Experimental Psychology',
        'Financial Accounting and Reporting',
        'Financial Management',
        'First Aid and Water Safety',
        'Foundations of Special and Inclusive Education',
        'Fundamentals of Accounting',
        'Fundamentals of Investigation and Intelligence',
        'Fundamentals of Martial Arts',
        'Fundamentals of Real Estate Management',
        'Gender and Society',
        'Intermediate Accounting 2',
        'Introduction to Criminology',
        'Introduction to Psychology',
        'Law Enforcement Organization and Administration',
        'Law on Obligations and Contracts',
        'Legal Aspects of Real Estate',
        'Life, Works of Rizal',
        'Literacy Training Service 1',
        'Living in the IT Era',
        'LSEI: Love of God',
        'LSEi: Marriage and Family',
        'Macro Perspective of Tourism and Hospitality',
        'Mathematics in the Modern World',
        'Movement Competency Training',
        'MS Project',
        'Obligations and Contracts with Real Property Laws',
        'Organic Chemistry',
        'Philippine Literature',
        'Principles of Management',
        'Purposive Communication',
        'QA Laboratory Only Class',
        'QA Lecture and Laboratory Class',
        'QA Lecture Only Class',
        'Readings in Philippine History',
        "Reserve Officers' Training Corps 1",
        'Risk Management as Applied to Safety, Security & Sanitation',
        'Science, Technology and Society',
        'Strategic Cost Management',
        'The Child and Adolescent and Learning Principles',
        'The Contemporary World',
        'Theories of Crime Causation',
        'Theories of Personality',
        'Understanding the Self',
    ];
    $legacyCodes = ['NURS101', 'NURS102', 'NURS103', 'NURS104', 'PSY101', 'PSY102', 'PSY103', 'PSY104', 'RAD101', 'RAD102', 'RAD103', 'RAD104', 'MT101', 'MT102', 'MT103', 'MT104'];
    $activeCodes = [];

    foreach ($subjects as $index => $name) {
        $code = $legacyCodes[$index] ?? 'OFF-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT);
        $activeCodes[] = $code;
        $stmt = $pdo->prepare('SELECT id FROM subjects WHERE code = ? LIMIT 1');
        $stmt->execute([$code]);
        $id = $stmt->fetchColumn();

        if ($id !== false) {
            $update = $pdo->prepare('UPDATE subjects SET name = ?, active = 1 WHERE id = ?');
            $update->execute([$name, $id]);
        } else {
            $insert = $pdo->prepare('INSERT INTO subjects (code, name, units, hours_per_week, duration_slots, room_type, required_features_json, active) VALUES (?, ?, 3, 2, 2, ?, ?, 1)');
            $insert->execute([$code, $name, 'LECTURE', json_encode(['Projector'], JSON_THROW_ON_ERROR)]);
        }
    }

    $placeholders = implode(', ', array_fill(0, count($activeCodes), '?'));
    $deactivate = $pdo->prepare("UPDATE subjects SET active = 0 WHERE code NOT IN ({$placeholders}) AND active <> 0");
    $deactivate->execute($activeCodes);
}

function ensure_section_offerings(PDO $pdo): void
{
    $subjects = [];
    foreach ($pdo->query("SELECT id, code FROM subjects WHERE active = 1") as $subject) {
        $subjects[(string) $subject['code']] = (int) $subject['id'];
    }
    $instructors = array_map(
        static fn(array $instructor): int => (int) $instructor['id'],
        $pdo->query('SELECT id FROM instructors WHERE active = 1 ORDER BY id')->fetchAll()
    );
    if ($subjects === [] || $instructors === []) {
        return;
    }

    $sections = $pdo->query('SELECT sec.id, sec.code, sec.student_count, p.code AS program_code FROM sections sec JOIN programs p ON p.id = sec.program_id WHERE sec.active = 1 ORDER BY sec.id')->fetchAll();
    $existing = $pdo->query('SELECT subject_id, section_id FROM course_offerings WHERE status = "ACTIVE"')->fetchAll();
    $existingKeys = [];
    foreach ($existing as $offering) {
        $existingKeys[(int) $offering['subject_id'] . ':' . (int) $offering['section_id']] = true;
    }

    $insert = $pdo->prepare('INSERT INTO course_offerings (term_id, subject_id, section_id, instructor_id, enrollment, required_meetings) SELECT sec.term_id, ?, sec.id, ?, sec.student_count, 1 FROM sections sec WHERE sec.id = ?');
    $instructorIndex = 0;
    foreach ($sections as $section) {
        $prefix = match ((string) $section['program_code']) {
            'BSN' => 'NURS',
            'BSP' => 'PSY',
            'BSRT' => 'RAD',
            'BSMT' => 'MT',
            default => null,
        };
        if ($prefix === null) {
            continue;
        }
        foreach (['101', '102', '103', '104'] as $number) {
            $subjectId = $subjects[$prefix . $number] ?? null;
            if ($subjectId === null || isset($existingKeys[$subjectId . ':' . (int) $section['id']])) {
                continue;
            }
            $instructorId = $instructors[$instructorIndex % count($instructors)];
            $insert->execute([$subjectId, $instructorId, (int) $section['id']]);
            $existingKeys[$subjectId . ':' . (int) $section['id']] = true;
            $instructorIndex++;
        }
    }
}

function normalize_catalog_offering_meetings(PDO $pdo): void
{
    $migrationKey = 'catalog_two_hour_block_v1';
    $migration = $pdo->prepare('SELECT setting_value FROM system_settings WHERE setting_key = ?');
    $migration->execute([$migrationKey]);
    if ($migration->fetchColumn() === '1') {
        return;
    }

    $pdo->beginTransaction();
    try {
        $update = $pdo->prepare("UPDATE course_offerings SET required_meetings = 1 WHERE status = 'ACTIVE' AND subject_id IN (SELECT id FROM subjects WHERE code IN ('NURS101', 'NURS102', 'NURS103', 'NURS104', 'PSY101', 'PSY102', 'PSY103', 'PSY104', 'RAD101', 'RAD102', 'RAD103', 'RAD104', 'MT101', 'MT102', 'MT103', 'MT104'))");
        $update->execute();
        $recordMigration = $pdo->prepare('INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)');
        $recordMigration->execute([$migrationKey, '1']);
        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }
}

function normalize_time_slot_catalog(PDO $pdo): void
{
    $slots = [
        ['H01', '7:00 AM - 8:00 AM', '07:00', '08:00', 1],
        ['H02', '8:00 AM - 9:00 AM', '08:00', '09:00', 2],
        ['H03', '9:00 AM - 10:00 AM', '09:00', '10:00', 3],
        ['H04', '10:00 AM - 11:00 AM', '10:00', '11:00', 4],
        ['H05', '11:00 AM - 12:00 PM', '11:00', '12:00', 5],
        ['H06', '12:00 PM - 1:00 PM', '12:00', '13:00', 6],
        ['H07', '1:00 PM - 2:00 PM', '13:00', '14:00', 7],
        ['H08', '2:00 PM - 3:00 PM', '14:00', '15:00', 8],
        ['H09', '3:00 PM - 4:00 PM', '15:00', '16:00', 9],
        ['H10', '4:00 PM - 5:00 PM', '16:00', '17:00', 10],
    ];

    foreach ($slots as [$code, $label, $start, $end, $order]) {
        $stmt = $pdo->prepare('SELECT id FROM time_slots WHERE slot_order = ? LIMIT 1');
        $stmt->execute([$order]);
        $id = $stmt->fetchColumn();
        if ($id) {
            $pdo->prepare('UPDATE time_slots SET code = ?, label = ?, start_time = ?, end_time = ? WHERE id = ?')->execute([$code, $label, $start, $end, $id]);
        } else {
            $pdo->prepare('INSERT INTO time_slots (code, label, start_time, end_time, slot_order) VALUES (?, ?, ?, ?, ?)')->execute([$code, $label, $start, $end, $order]);
        }
    }
}

function db_insert_id(PDO $pdo, string $table): int
{
    return (int) $pdo->lastInsertId();
}

function seed_database(PDO $pdo): void
{
    $hasUser = (int) $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn() > 0;
    if ($hasUser) {
        return;
    }

    $pdo->beginTransaction();
    try {
        $term = $pdo->prepare('INSERT INTO academic_terms (academic_year, semester, is_active) VALUES (?, ?, 1)');
        $term->execute(['2026-2027', 'First Semester']);
        $termId = db_insert_id($pdo, 'academic_terms');

        $program = $pdo->prepare('INSERT INTO programs (code, name) VALUES (?, ?)');
        $program->execute(['BSRT', 'Bachelor of Science in Radiologic Technology']);
        $bsrt = db_insert_id($pdo, 'programs');
        $program->execute(['BSP', 'Bachelor of Science in Psychology']);
        $bsp = db_insert_id($pdo, 'programs');
        $program->execute(['BSN', 'Bachelor of Science in Nursing']);
        $bsn = db_insert_id($pdo, 'programs');
        $program->execute(['BSMT', 'Bachelor of Science in Medical Technology']);
        $bsmt = db_insert_id($pdo, 'programs');

        $instructor = $pdo->prepare('INSERT INTO instructors (employee_no, name, email, max_hours_day) VALUES (?, ?, NULL, 6)');
        $instructors = faculty_roster();
        $instructorIds = [];
        foreach ($instructors as $index => $name) {
            $employeeNo = 'FAC-' . str_pad((string) ($index + 1), 3, '0', STR_PAD_LEFT);
            $instructor->execute([$employeeNo, $name]);
            $instructorIds[] = db_insert_id($pdo, 'instructors');
        }

        $room = $pdo->prepare('INSERT INTO rooms (code, name, capacity, room_type, features_json) VALUES (?, ?, ?, ?, ?)');
        $rooms = [
            ['RLE', 'Related Learning Experience (RLE)', 40, 'SPECIAL', ['Projector']],
            ['NSL', 'Nursing Skills Laboratory', 40, 'LAB', ['Projector']],
            ['MTL', 'Medical Technology Laboratory', 40, 'LAB', ['Computers', 'Projector']],
            ['RTL', 'Radiologic Technology Laboratory', 40, 'LAB', ['Projector']],
            ['PSL', 'Psychology Laboratory', 40, 'LAB', ['Projector']],
            ['COMLAB', 'Computer Laboratory', 40, 'LAB', ['Computers', 'Projector']],
            ['LR', 'Lecture Room', 40, 'LECTURE', ['Projector']],
        ];
        foreach ($rooms as [$code, $name, $capacity, $type, $features]) {
            $room->execute([$code, $name, $capacity, $type, json_encode($features, JSON_THROW_ON_ERROR)]);
        }

        $slot = $pdo->prepare('INSERT INTO time_slots (code, label, start_time, end_time, slot_order) VALUES (?, ?, ?, ?, ?)');
        $slots = [
            ['H01', '7:00 AM - 8:00 AM', '07:00', '08:00', 1],
            ['H02', '8:00 AM - 9:00 AM', '08:00', '09:00', 2],
            ['H03', '9:00 AM - 10:00 AM', '09:00', '10:00', 3],
            ['H04', '10:00 AM - 11:00 AM', '10:00', '11:00', 4],
            ['H05', '11:00 AM - 12:00 PM', '11:00', '12:00', 5],
            ['H06', '12:00 PM - 1:00 PM', '12:00', '13:00', 6],
            ['H07', '1:00 PM - 2:00 PM', '13:00', '14:00', 7],
            ['H08', '2:00 PM - 3:00 PM', '14:00', '15:00', 8],
            ['H09', '3:00 PM - 4:00 PM', '15:00', '16:00', 9],
            ['H10', '4:00 PM - 5:00 PM', '16:00', '17:00', 10],
        ];
        foreach ($slots as $row) {
            $slot->execute($row);
        }

        $subject = $pdo->prepare('INSERT INTO subjects (code, name, units, hours_per_week, duration_slots, room_type, required_features_json) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $subjects = [
            ['NURS101', 'Fundamentals of Nursing', 3, 2, 2, 'LECTURE', ['Projector']],
            ['NURS102', 'Anatomy and Physiology', 3, 2, 2, 'LECTURE', ['Projector']],
            ['NURS103', 'Health Assessment', 3, 2, 2, 'LECTURE', ['Projector']],
            ['NURS104', 'Nursing Informatics', 3, 2, 2, 'LECTURE', ['Projector']],
            ['PSY101', 'General Psychology', 3, 2, 2, 'LECTURE', ['Projector']],
            ['PSY102', 'Developmental Psychology', 3, 2, 2, 'LECTURE', ['Projector']],
            ['PSY103', 'Social Psychology', 3, 2, 2, 'LECTURE', ['Projector']],
            ['PSY104', 'Abnormal Psychology', 3, 2, 2, 'LECTURE', ['Projector']],
            ['RAD101', 'Anatomy and Physiology', 3, 2, 2, 'LECTURE', ['Projector']],
            ['RAD102', 'Radiologic Procedures', 3, 2, 2, 'LECTURE', ['Projector']],
            ['RAD103', 'Radiologic Physics', 3, 2, 2, 'LECTURE', ['Projector']],
            ['RAD104', 'Radiation Protection', 3, 2, 2, 'LECTURE', ['Projector']],
            ['MT101', 'General Chemistry', 3, 2, 2, 'LECTURE', ['Projector']],
            ['MT102', 'Clinical Chemistry', 3, 2, 2, 'LECTURE', ['Projector']],
            ['MT103', 'Hematology', 3, 2, 2, 'LECTURE', ['Projector']],
            ['MT104', 'Microbiology', 3, 2, 2, 'LECTURE', ['Projector']],
        ];
        $subjectIds = [];
        foreach ($subjects as [$code, $name, $units, $hours, $duration, $type, $features]) {
            $subject->execute([$code, $name, $units, $hours, $duration, $type, json_encode($features, JSON_THROW_ON_ERROR)]);
            $subjectIds[] = db_insert_id($pdo, 'subjects');
        }

        $section = $pdo->prepare('INSERT INTO sections (program_id, term_id, code, year_level, student_count) VALUES (?, ?, ?, ?, ?)');
        $sectionRows = [];
        foreach ([[$bsn, 'BSN'], [$bsp, 'BSP'], [$bsrt, 'BSRT'], [$bsmt, 'BSMT']] as [$programId, $programCode]) {
            for ($year = 1; $year <= 4; $year++) {
                foreach (['A', 'B'] as $suffix) {
                    $sectionRows[] = [$programId, $termId, $programCode . '-' . $year . $suffix, $year, 40];
                }
            }
        }
        $sectionIds = [];
        foreach ($sectionRows as $row) {
            $section->execute($row);
            $sectionIds[] = db_insert_id($pdo, 'sections');
        }

        $offering = $pdo->prepare('INSERT INTO course_offerings (term_id, subject_id, section_id, instructor_id, enrollment, required_meetings) VALUES (?, ?, ?, ?, ?, ?)');
        $offeringRows = [
            [$termId, $subjectIds[0], $sectionIds[0], $instructorIds[0], 40, 1],
            [$termId, $subjectIds[1], $sectionIds[1], $instructorIds[1], 38, 1],
            [$termId, $subjectIds[2], $sectionIds[2], $instructorIds[2], 40, 1],
            [$termId, $subjectIds[3], $sectionIds[3], $instructorIds[3], 35, 1],
            [$termId, $subjectIds[4], $sectionIds[4], $instructorIds[4], 40, 1],
            [$termId, $subjectIds[5], $sectionIds[5], $instructorIds[5], 32, 1],
            [$termId, $subjectIds[6], $sectionIds[0], $instructorIds[4], 40, 1],
            [$termId, $subjectIds[7], $sectionIds[1], $instructorIds[5], 38, 1],
            [$termId, $subjectIds[8], $sectionIds[2], $instructorIds[2], 40, 1],
            [$termId, $subjectIds[9], $sectionIds[3], $instructorIds[3], 35, 1],
            [$termId, $subjectIds[10], $sectionIds[4], $instructorIds[4], 32, 1],
            [$termId, $subjectIds[11], $sectionIds[5], $instructorIds[5], 32, 1],
        ];
        foreach ($offeringRows as $row) {
            $offering->execute($row);
        }

        $studentSectionId = (int) $pdo->query("SELECT sec.id FROM sections sec JOIN course_offerings co ON co.section_id = sec.id WHERE co.term_id = {$termId} AND co.status = 'ACTIVE' GROUP BY sec.id ORDER BY sec.id LIMIT 1")->fetchColumn();
        if ($studentSectionId < 1) {
            $studentSectionId = (int) $sectionIds[0];
        }

        $user = $pdo->prepare('INSERT INTO users (username, password_hash, display_name, email, role, instructor_id, section_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
        $user->execute(['admin', password_hash('Admin123!', PASSWORD_DEFAULT), 'System Administrator', 'admin@example.invalid', 'admin', null, null]);
        $user->execute(['scheduler', password_hash('Scheduler123!', PASSWORD_DEFAULT), 'Scheduling Coordinator', 'scheduler@example.invalid', 'scheduler', null, null]);
        $user->execute(['instructor', password_hash('Instructor123!', PASSWORD_DEFAULT), 'Prof. Respende', 'respende@example.invalid', 'instructor', $instructorIds[0], null]);
        $user->execute(['student', password_hash('Student123!', PASSWORD_DEFAULT), 'BSIT Student', 'student@example.invalid', 'student', null, $studentSectionId]);

        $settings = $pdo->prepare('INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?)');
        $settings->execute(['institution_name', 'New Sinai School and Colleges Sta. Rosa, Inc.']);
        $settings->execute(['system_name', 'EasySched']);
        $settings->execute(['active_term_id', (string) $termId]);
        $settings->execute(['generation_node_limit', '100000']);

        $pdo->commit();
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }
}

function json_array(?string $value): array
{
    if ($value === null || $value === '') {
        return [];
    }
    $decoded = json_decode($value, true);
    return is_array($decoded) ? array_values($decoded) : [];
}

function encode_json(mixed $value): string
{
    return json_encode($value, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
}
