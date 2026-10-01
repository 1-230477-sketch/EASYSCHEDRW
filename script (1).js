(() => {
  'use strict';

  const NAV = {
    admin: [
      ['dashboard', 'Overview'], ['schedules', 'Schedule'], ['data', 'Academic setup'], ['room-requests', 'Room requests'], ['reports', 'Reports'], ['profile', 'Profile'], ['settings', 'Settings'], ['help', 'Help']
    ],
    scheduler: [
      ['dashboard', 'Overview'], ['schedules', 'Schedule'], ['data', 'Academic setup'], ['reports', 'Reports'], ['profile', 'Profile'], ['settings', 'Settings'], ['help', 'Help']
    ],
    instructor: [
      ['dashboard', 'Overview'], ['schedules', 'My schedule'], ['room-requests', 'Room requests'], ['profile', 'Profile'], ['settings', 'Settings'], ['help', 'Help']
    ],
    student: [
      ['dashboard', 'Overview'], ['schedules', 'My section'], ['profile', 'Profile'], ['settings', 'Settings'], ['help', 'Help']
    ]
  };
  const PAGE_META = {
    dashboard: ['Overview', 'Command center'],
    schedules: ['Published timetable', 'Timetable'],
    'room-requests': ['Instructor tools', 'Room requests'],
    data: ['Master data', 'Academic records'],
    reports: ['Evidence and review', 'Validation reports'],
    profile: ['Account', 'Profile'],
    settings: ['System controls', 'Account controls'],
    help: ['Quick orientation', 'Getting started']
  };
  // Inline SVG only: the content security policy forbids external assets, and
  // font glyphs render inconsistently across the machines used for review.
  const svgIcon = (body, size = 17) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  const PATH = {
    dashboard: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="4.6" rx="1.6"/><rect x="13.5" y="11.1" width="7" height="9.4" rx="1.6"/><rect x="3.5" y="13.1" width="7" height="7.4" rx="1.6"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 10h17M8 3.2v3.4M16 3.2v3.4"/>',
    calendarCheck: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 10h17M8 3.2v3.4M16 3.2v3.4M9.4 15.1l1.9 1.9 3.7-4"/>',
    database: '<ellipse cx="12" cy="6" rx="7.4" ry="2.7"/><path d="M4.6 6v6c0 1.5 3.3 2.7 7.4 2.7s7.4-1.2 7.4-2.7V6"/><path d="M4.6 12v6c0 1.5 3.3 2.7 7.4 2.7s7.4-1.2 7.4-2.7v-6"/>',
    chart: '<path d="M3.5 20.5h17"/><rect x="5" y="11" width="3.6" height="6.6" rx="1.2"/><rect x="10.2" y="6.4" width="3.6" height="11.2" rx="1.2"/><rect x="15.4" y="9" width="3.6" height="8.6" rx="1.2"/>',
    sliders: '<path d="M6 3.5v6.2M6 14.3v6.2M18 3.5v8.2M18 16.3v4.2"/><circle cx="6" cy="12" r="2.3"/><circle cx="18" cy="14" r="2.3"/>',
    book: '<path d="M12 6.6C10.6 5.2 8.7 4.5 6.2 4.5H4.5v13h1.7c2.5 0 4.4.7 5.8 2.1"/><path d="M12 6.6c1.4-1.4 3.3-2.1 5.8-2.1h1.7v13h-1.7c-2.5 0-4.4.7-5.8 2.1"/><path d="M12 6.6v13"/>',
    users: '<circle cx="9.2" cy="8.4" r="3.2"/><path d="M3.6 19.8a5.6 5.6 0 0111.2 0"/><path d="M16.4 5.6a3.2 3.2 0 010 5.8M17.7 19.8a5.7 5.7 0 00-1.8-4.1"/>',
    building: '<path d="M4.6 20.5V5.2a1.7 1.7 0 011.7-1.7h7.5a1.7 1.7 0 011.7 1.7v15.3"/><path d="M15.5 9.6h2.7a1.7 1.7 0 011.7 1.7v9.2"/><path d="M2.8 20.5h18.4"/><path d="M8.1 7.6h3.6M8.1 11.1h3.6M8.1 14.6h3.6"/>',
    success: '<circle cx="12" cy="12" r="8.6"/><path d="M8.4 12.4l2.4 2.4 4.8-5.2"/>',
    error: '<circle cx="12" cy="12" r="8.6"/><path d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"/>',
    warn: '<path d="M12 4.4l8.4 14.6H3.6z"/><path d="M12 9.9v4M12 16.5h.01"/>',
    close: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    empty: '<path d="M3.5 13.6h4.2l1.6 2.6h5.4l1.6-2.6h4.2"/><path d="M3.5 13.6L6.1 5.4h11.8l2.6 8.2v4.3a1.8 1.8 0 01-1.8 1.8H5.3a1.8 1.8 0 01-1.8-1.8z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/>',
    moon: '<path d="M20.5 14.6A8.6 8.6 0 019.4 3.5a8.6 8.6 0 1011.1 11.1z"/>'
  };
  const ICONS = {
    dashboard: svgIcon(PATH.dashboard),
    schedules: svgIcon(PATH.calendar),
    'room-requests': svgIcon(PATH.calendarCheck),
    data: svgIcon(PATH.database),
    reports: svgIcon(PATH.chart),
    profile: svgIcon(PATH.users),
    settings: svgIcon(PATH.sliders),
    help: svgIcon(PATH.book)
  };
  const METRIC_ICONS = {
    'Active class assignments': PATH.book,
    'Published classes': PATH.calendarCheck,
    Sections: PATH.users,
    Rooms: PATH.building,
    'Faculty used': PATH.users,
    'Rooms used': PATH.building,
    'Sections covered': PATH.dashboard
  };
  const emptyState = (title, detail) => `<div class="empty-state">${svgIcon(PATH.empty, 26)}<strong>${esc(title)}</strong>${esc(detail)}</div>`;
  const state = { snapshot: null, page: 'dashboard', dataTab: 'rooms', scheduleView: 'all', scheduleFilter: 'all', query: '' };
  let roomAvailabilityCheckId = 0;
  let roomAvailabilityTimer = 0;
  let availableRoomsReady = false;
  let roomRequestAllowed = false;
  let brandPopupReturnFocus = null;
  const HELP_SLIDES = {
    admin: [
      ['Administrator orientation', 'You manage the complete EasySched workspace: users, academic data, schedule generation, reports, and security settings.', ['Start with Academic setup and review the active term before making changes.']],
      ['Maintain the academic setup', 'Create and verify programs, sections, subjects, instructors, rooms, and class assignments. These records are the inputs used by the scheduler.', ['Keep enrollment, room capacity, room type, and required features accurate.']],
      ['Generate and publish', 'Use Generate schedule after the master data is ready. The solver validates all hard constraints before publishing a run.', ['A failed generation preserves the last published schedule.']],
      ['Review evidence', 'Use Reports to inspect constraint results, room utilization, and the generation record before presenting the timetable.', ['Export or print the reviewed schedule for approval.']],
      ['Manage accounts and security', 'Use Settings to change your password and administer the deployment boundary. Rotate seed credentials and use HTTPS before production use.', ['Review audit records and restrict database access.']]
    ],
    scheduler: [
      ['Scheduler orientation', 'You prepare academic records, generate schedules, and maintain the published timetable without managing user accounts.', ['Begin by checking the active term and master data.']],
      ['Prepare scheduling inputs', 'Review programs, subjects, faculty, rooms, sections, and Class assignments before generating. Each program has Years 1 through 4 with Sections A and B.', ['Incomplete or conflicting inputs can make generation impossible.']],
      ['Generate a schedule', 'Generate schedule tests hourly room capacity, room type, features, time overlap, availability, section conflicts, and daily teaching limits before publication.', ['Never treat a partial or failed run as a published timetable.']],
      ['Review and edit safely', 'Use the weekly schedule filters to inspect by section, instructor, or room. Manual edits are checked against the same hard constraints.', ['Regenerate when the academic inputs have materially changed.']],
      ['Reports and handoff', 'Use Reports and CSV/print export to document room utilization, validation results, and the final timetable.', ['Keep the published run as the approved reference.']]
    ],
    instructor: [
      ['Instructor orientation', 'Your workspace shows assigned classes, the published timetable, and a dedicated Room requests tab.', ['Use My schedule for confirmed meetings and Room requests for proposed changes.']],
      ['Read the weekly schedule', 'My schedule shows subjects, sections, rooms, exact dates, weekdays, and hourly time slots.', ['Lecture, laboratory, and other room types use different calendar colors.']],
      ['Request a room', 'Room requests let you choose an assigned class, room, exact date, weekday, start time, end time, and optional note.', ['Use the 12-hour HH:MM format with the AM or PM selector.']],
      ['Track approval', 'Your request history shows Pending, Approved, or Rejected. Approved requests are checked against room, instructor, section, and time conflicts.', ['Only approved and validated changes become part of the timetable.']],
      ['Account settings', 'Use Settings to change your password and keep your account secure.', ['Never share your password or use another person’s account.']]
    ],
    student: [
      ['Student orientation', 'Your workspace shows the published timetable for your assigned section.', ['Use My section to find your classes quickly.']],
      ['Read your timetable', 'The weekly schedule shows each subject, instructor, room, exact date, weekday, and hourly time slot for your section.', ['Lecture, laboratory, and other room types use different calendar colors.']],
      ['Understand your section', 'Each program has two sections per year level, such as Section A and Section B, for Years 1 through 4.', ['Your published classes are filtered to your assigned section.']],
      ['Trust the published schedule', 'Schedules are checked for room, instructor, section, capacity, and time conflicts before publication.', ['Ask your program office about corrections or changes.']],
      ['Account settings', 'Use Settings to change your password and keep your account secure.', ['Contact an administrator if your section or account details are wrong.']]
    ]
  };
  const helpSlides = [
    ['Welcome to EasySched', 'Use this workspace to prepare academic data, generate conflict-aware schedules, and publish a timetable your campus can trust.', ['Start with Academic setup, then generate and review the schedule.']],
    ['Know your role', 'Administrators and schedulers maintain data and generate schedules. Instructors view assigned classes. Students view their section schedule.', ['Your account controls which pages and records are available.']],
    ['Prepare the academic setup', 'Maintain the active term, four programs, 16 subjects, faculty, seven room types, sections, and Class assignments before generating.', ['Each program uses Years 1 through 4 with two sections per year.']],
    ['Create Class assignments', 'Connect a subject to a section, instructor, academic term, enrollment count, and meetings per week. These are the actual classes the scheduler places.', ['Subjects define the curriculum; Class assignments define what runs this term.']],
    ['Generate a schedule', 'Open Schedule and choose Generate schedule. EasySched checks hourly room capacity, room type, features, time overlap, availability, and daily teaching limits.', ['A failed generation never replaces the last published schedule.']],
    ['Review the weekly timetable', 'Use the view and filter controls to inspect schedules by section, instructor, or room. The calendar shows hourly slots and colors Lecture, Laboratory, and Other rooms differently.', ['Conflicts are rejected before publication.']],
    ['Publish and manage changes', 'Manual edits are validated against the same conflict rules. Save only approved changes, then review the resulting timetable.', ['Keep the published run stable while testing alternatives.']],
    ['Reports and exports', 'Reports show constraint checks and room utilization. Export the visible schedule as CSV or print a clean timetable for review.', ['Apply filters before exporting when you need a focused report.']],
    ['Account security and support', 'Change your password in Settings. Use HTTPS in deployment, keep database secrets server-side, and contact an administrator when access or data needs review.', ['Return to this Help center any time from the sidebar.']]
  ];
  let helpIndex = 0;
  let modalMode = null;
  let modalRecord = null;
  let modalReturnFocus = null;
  let registrationOpen = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const text = (value) => String(value ?? '').trim();
  const role = () => state.snapshot?.user?.role || '';
  const canManage = () => ['admin', 'scheduler'].includes(role());
  const canSeeGeneration = () => canManage();
  const canAdmin = () => role() === 'admin';
  const days = () => Object.entries(state.snapshot?.days || {}).sort((a, b) => Number(a[0]) - Number(b[0]));
  const slots = () => state.snapshot?.time_slots || [];
  const schedules = () => state.snapshot?.schedules || [];
  const subjectById = (id) => (state.snapshot?.subjects || []).find((item) => Number(item.id) === Number(id));

  async function request(action, options = {}) {
    const method = options.method || 'GET';
    const headers = { Accept: 'application/json' };
    let url = `api.php?action=${encodeURIComponent(action)}`;
    const init = { method, headers, credentials: 'same-origin' };
    if (method !== 'GET') {
      headers['Content-Type'] = 'application/json';
      const payload = { ...(options.body || {}), csrf: state.snapshot?.csrf || '' };
      init.body = JSON.stringify(payload);
    }
    const response = await fetch(url, init);
    const contentType = response.headers.get('content-type') || '';
    if (action === 'export' && !contentType.includes('application/json')) return response;
    let payload;
    try { payload = await response.json(); } catch { throw new Error('The server returned an invalid response.'); }
    if (response.status === 401) {
      state.snapshot = null;
      if (!registrationOpen && action !== 'registration_options' && action !== 'bootstrap') showLogin();
    }
    if (!response.ok || payload.ok === false) {
      const error = new Error(payload.error || 'The request could not be completed.');
      error.details = payload.details || {};
      error.status = response.status;
      throw error;
    }
    return payload.data;
  }

  function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.innerHTML = svgIcon(PATH[type] || PATH.success, 18);

    const body = document.createElement('div');
    body.innerHTML = `<strong>${esc(title)}</strong><p>${esc(message)}</p>`;

    const close = document.createElement('button');
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss notification');
    close.innerHTML = svgIcon(PATH.close, 14);

    let removeTimer = 0;
    const dismiss = () => {
      window.clearTimeout(removeTimer);
      toast.classList.add('leaving');
      window.setTimeout(() => toast.remove(), 200);
    };
    close.addEventListener('click', dismiss);
    toast.addEventListener('pointerenter', () => window.clearTimeout(removeTimer));
    toast.addEventListener('pointerleave', () => { removeTimer = window.setTimeout(dismiss, 2500); });

    toast.append(icon, body, close);
    $('#toastStack').append(toast);
    removeTimer = window.setTimeout(dismiss, type === 'error' ? 8000 : 5000);
  }

  /* ---------------------------------------------------------------------- *
   * Theme. The stylesheet reads `data-theme` on <html>; the choice is
   * remembered per browser and falls back to the operating system setting.
   * ---------------------------------------------------------------------- */
  const THEME_KEY = 'easysched-theme';

  function readStoredTheme() {
    try { return window.localStorage.getItem(THEME_KEY); } catch { return null; }
  }

  function applyTheme(theme) {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const toggle = $('#themeToggle');
    if (!toggle) return;
    toggle.innerHTML = svgIcon(dark ? PATH.sun : PATH.moon, 18);
    const next = dark ? 'light' : 'dark';
    toggle.setAttribute('aria-label', `Switch to ${next} theme`);
    toggle.setAttribute('title', `Switch to ${next} theme`);
  }

  function initTheme() {
    const stored = readStoredTheme();
    if (stored === 'dark' || stored === 'light') return applyTheme(stored);
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    applyTheme(query.matches ? 'dark' : 'light');
    // Keep following the operating system until a theme is chosen explicitly.
    query.addEventListener('change', (event) => { if (!readStoredTheme()) applyTheme(event.matches ? 'dark' : 'light'); });
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { window.localStorage.setItem(THEME_KEY, next); } catch { /* private browsing */ }
    announce(`${next === 'dark' ? 'Dark' : 'Light'} theme enabled.`);
  }

  // Applied at parse end because this file is deferred. The content security
  // policy forbids an inline bootstrap script, so this is the earliest point the
  // stored theme can be restored without showing the wrong palette first.
  initTheme();

  function announce(message) {
    const region = $('#liveRegion');
    if (region) region.textContent = message;
  }

  function showLogin(message = '') {
    registrationOpen = false;
    $('#publicHome').hidden = true;
    $('#loginView').hidden = false; $('#appView').hidden = true;
    $('#loginView').classList.remove('registration-mode');
    $('#registrationView').hidden = true; $('#loginForm').closest('.login-panel').hidden = false;
    $('#forgotPasswordView').hidden = true;
    $('#loginError').textContent = message;
    $('#loginPassword').value = '';
    $('#loginCaptcha').value = '';
    $('#loginUsername').focus();
  }

  function showSignIn() {
    $('#publicHome').hidden = true;
    showLogin();
  }

  function showPublicHome() {
    registrationOpen = false;
    $('#publicHome').hidden = false;
    $('#loginView').hidden = true;
    $('#loginView').classList.remove('registration-mode');
    $('#appView').hidden = true;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }

  async function showRegistration() {
    registrationOpen = true;
    $('#loginView').classList.add('registration-mode'); $('#loginForm').closest('.login-panel').hidden = true; $('#registrationView').hidden = false; $('#registrationError').textContent = '';
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    try {
      const options = await request('registration_options');
      $('#registrationProgram').innerHTML = '<option value="">Select program</option>' + options.programs.map((item) => `<option value="${esc(item.id)}">${esc(item.code)} - ${esc(item.name)}</option>`).join('');
      $('#registrationSection').innerHTML = '<option value="">No section assigned yet</option>' + options.sections.map((item) => `<option value="${esc(item.id)}" data-program="${esc(item.program_id)}" data-year="${esc(item.year_level)}">${esc(item.code)} - Year ${esc(item.year_level)}</option>`).join('');
    } catch (error) { $('#registrationError').textContent = error.message; }
    $('#registrationFirstName').focus();
  }

  async function sendRegistrationOtp() { try { const result = await request('request_registration_otp', { method: 'POST', body: { email: $('#registrationEmail').value } }); showToast('Code sent', result.message); } catch (error) { $('#registrationError').textContent = error.message; } }
  function showForgotPassword() { registrationOpen = true; $('#loginView').classList.add('registration-mode'); $('#loginForm').closest('.login-panel').hidden = true; $('#registrationView').hidden = true; $('#forgotPasswordView').hidden = false; $('#resetError').textContent = ''; $('#resetAccount').focus(); }
  async function sendResetOtp() { try { const result = await request('request_password_reset', { method: 'POST', body: { account: $('#resetAccount').value } }); showToast('Check your email', result.message); } catch (error) { $('#resetError').textContent = error.message; } }
  async function resetPassword(event) { event.preventDefault(); try { const result = await request('reset_password', { method: 'POST', body: { otp: $('#resetOtp').value, password: $('#resetPassword').value, confirm_password: $('#resetPasswordConfirm').value } }); showLogin(); showToast('Password reset', result.message); } catch (error) { $('#resetError').textContent = error.message; } }

  async function registerStudent(event) { event.preventDefault(); $('#registrationError').textContent = ''; const first = text($('#registrationFirstName').value); const middle = text($('#registrationMiddleName').value); const last = text($('#registrationLastName').value); const body = { display_name: [first, middle, last].filter(Boolean).join(' '), username: $('#registrationUsername').value, email: $('#registrationEmail').value, otp: $('#registrationOtp').value, program_id: $('#registrationProgram').value, year_level: $('#registrationYear').value, section_id: $('#registrationSection').value, password: $('#registrationPassword').value }; try { const result = await request('register', { method: 'POST', body }); showLogin(); showToast('Registration submitted', result.message, 'success'); } catch (error) { $('#registrationError').textContent = error.message; } }

  async function reviewRegistration(id, decision) { const label = decision === 'APPROVE' ? 'approve this student registration' : 'reject this student registration'; if (!window.confirm(`Are you sure you want to ${label}?`)) return; const button = $(`.review-registration[data-registration-id="${id}"][data-decision="${decision}"]`); if (button) { button.disabled = true; button.textContent = decision === 'APPROVE' ? 'Approving...' : 'Rejecting...'; } try { const result = await request('review_registration', { method: 'POST', body: { registration_id: id, decision } }); if (result.snapshot) result.snapshot.pending_registrations = (result.snapshot.pending_registrations || []).filter((row) => Number(row.id) !== Number(id)); applySnapshot(result.snapshot); showToast('Registration reviewed', result.message); } catch (error) { if (button) { button.disabled = false; button.textContent = decision === 'APPROVE' ? 'Approve' : 'Reject'; } showToast('Could not review registration', error.message, 'error'); } }

  function updateLoginChallenge(details = {}) {
    const required = Boolean(details.captcha_required);
    $('#loginCaptchaWrap').hidden = !required;
    $('#loginCaptcha').required = required;
    $('#loginCaptcha').value = '';
    if (required) $('#loginCaptchaImage').src = `captcha.php?v=${Date.now()}`;
    else $('#loginCaptchaImage').removeAttribute('src');
  }

  function refreshLoginCaptcha() {
    if ($('#loginCaptchaWrap').hidden) return;
    $('#loginCaptcha').value = '';
    $('#loginCaptchaImage').src = `captcha.php?refresh=1&v=${Date.now()}`;
    $('#loginCaptcha').focus();
  }

  function showApp() {
    $('#publicHome').hidden = true;
    $('#loginView').hidden = true; $('#appView').hidden = false;
    $('#userName').textContent = state.snapshot.user.display_name;
    $('#userRole').textContent = state.snapshot.user.role;
    $('#userAvatar').textContent = state.snapshot.user.display_name.slice(0, 2).toUpperCase();
    buildNavigation();
    renderAll();
  }

  function buildNavigation() {
    const nav = $('#navList');
    nav.replaceChildren();
    (NAV[role()] || []).forEach(([id, label]) => {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button'; button.dataset.navigate = id; button.className = id === state.page ? 'active' : '';
      button.setAttribute('aria-current', id === state.page ? 'page' : 'false');
      button.innerHTML = `<span class="nav-icon" aria-hidden="true">${ICONS[id]}</span><span>${esc(label)}</span>`;
      item.append(button); nav.append(item);
    });
  }

  function navigate(page) {
    if (!(NAV[role()] || []).some(([id]) => id === page)) return;
    if (state.page !== page) {
      state.query = '';
      $('#globalSearch').value = '';
    }
    state.page = page;
    $$('.page').forEach((section) => { section.hidden = section.dataset.page !== page; });
    const activePage = $(`#page-${page}`);
    activePage?.classList.remove('page-enter');
    if (activePage) requestAnimationFrame(() => activePage.classList.add('page-enter'));
    $$('#navList button').forEach((button) => { const active = button.dataset.navigate === page; button.classList.toggle('active', active); button.setAttribute('aria-current', active ? 'page' : 'false'); });
    const [eyebrow, title] = PAGE_META[page]; $('#pageEyebrow').textContent = eyebrow; $('#pageTitle').textContent = title;
    document.title = `${title} | EasySched`;
    announce(`${title} page loaded.`);
    const searchField = $('#globalSearch').closest('.search-field');
    const searchablePage = ['schedules', 'data'].includes(page);
    searchField.hidden = !searchablePage;
    searchField.setAttribute('aria-hidden', String(!searchablePage));
    $('#globalSearch').setAttribute('placeholder', page === 'data' ? 'Search records' : 'Search classes');
    closeSidebar();
    if (page === 'dashboard') renderDashboard();
    if (page === 'schedules') renderSchedules();
    if (page === 'room-requests') renderRoomRequests();
    if (page === 'data') renderData();
    if (page === 'reports') renderReports();
    if (page === 'profile') renderProfile();
    if (page === 'settings') renderSettings();
    if (page === 'help') renderHelp();
  }

  function renderHelp() {
    const slides = HELP_SLIDES[role()] || helpSlides;
    if (helpIndex >= slides.length) helpIndex = 0;
    const slide = slides[helpIndex];
    $('#helpSlideCount').textContent = `${helpIndex + 1} / ${slides.length}`;
    $('#helpSlideContent').innerHTML = `<p class="eyebrow">EASYSCHED ORIENTATION</p><h3>${esc(slide[0])}</h3><p class="help-lead">${esc(slide[1])}</p><ul>${slide[2].map((item) => `<li>${esc(item)}</li>`).join('')}</ul>`;
    $('#helpBackButton').disabled = helpIndex === 0;
    $('#helpNextButton').textContent = helpIndex === slides.length - 1 ? 'Finish' : 'Next';
    $('#helpDots').innerHTML = slides.map((_, i) => `<button type="button" class="help-dot${i === helpIndex ? ' active' : ''}" data-help-index="${i}" aria-label="Step ${i + 1}" aria-current="${i === helpIndex ? 'step' : 'false'}"></button>`).join('');
  }

  function applySnapshot(snapshot) {
    state.snapshot = snapshot;
    if (!snapshot) return showLogin();
    if (!(NAV[snapshot.user.role] || []).some(([id]) => id === state.page)) state.page = 'dashboard';
    showApp();
  }

  function metric(label, value, note) {
    const icon = svgIcon(METRIC_ICONS[label] || PATH.dashboard, 16);
    return `<div class="metric"><div class="metric-top"><span class="metric-icon">${icon}</span><div class="metric-label">${esc(label)}</div></div><div class="metric-value">${esc(value)}</div><div class="metric-note">${esc(note)}</div></div>`;
  }

  function renderDashboard() {
    const snapshot = state.snapshot; const list = schedules(); const run = snapshot.active_run; const validation = snapshot.validation;
    const activeTerm = (snapshot.terms || []).find((term) => Number(term.id) === Number(snapshot.active_term_id));
    const termLabel = activeTerm ? `${activeTerm.academic_year} · ${activeTerm.semester}` : 'No active academic term';
    const termElement = $('#activeTermLabel'); if (termElement) termElement.textContent = `Active term: ${termLabel}`;
    const metricGrid = $('#metricGrid'); if (metricGrid) metricGrid.hidden = false;
    const assigned = run ? Number(run.assigned_tasks) : 0; const total = run ? Number(run.total_tasks) : snapshot.offerings.length;
    const today = new Date().getDay(); const todayDay = today >= 1 && today <= 5 ? today : 1; const todayCount = list.filter((row) => Number(row.day_of_week) === todayDay).length;
    const metrics = canSeeGeneration()
      ? [metric('Active class assignments', snapshot.offerings.length, 'Course-section assignments'), metric('Published classes', list.length, run ? `Run #${run.id}` : 'No published run'), metric('Sections', snapshot.sections.length, 'Current academic term'), metric('Rooms', snapshot.rooms.length, 'Available resources')]
      : [metric('My classes', list.length, role() === 'student' ? 'Classes in your section' : 'Classes assigned to you'), metric("Today's classes", todayCount, 'Scheduled for today'), metric('Rooms', new Set(list.map((row) => row.room_id)).size, 'Rooms in your schedule'), metric('Next class', list[0]?.time_label || 'None', list[0] ? `${list[0].subject_code} · ${list[0].room_code}` : 'No upcoming class')];
    $('#metricGrid').innerHTML = metrics.join('');
    $('#scheduleHealthBadge').className = `badge ${validation?.valid ? '' : run ? 'badge-warning' : 'badge-neutral'}`;
    $('#scheduleHealthBadge').textContent = run ? (validation?.valid ? 'Validated' : 'Review required') : 'No schedule';
    const checks = Object.entries(validation?.checks || {});
    const healthPanel = $('#dashboardHealth')?.closest('.panel'); const runPanel = $('#runSummary')?.closest('.panel');
    if (healthPanel) healthPanel.hidden = role() === 'admin'; if (runPanel) runPanel.hidden = role() === 'admin';
    $('#dashboardHealth').innerHTML = checks.length ? checks.map(([item, passed]) => `<div class="health-row"><span>${esc(item.replaceAll('_', ' '))}</span><strong class="${passed ? 'health-ok' : 'health-error'}">${passed ? 'Passed' : 'Failed'}</strong></div>`).join('') : emptyState('No validation yet', 'Generate a schedule to see the hard-constraint report.');
    $('#runSummary').innerHTML = run ? [`<div class="summary-row"><span>Run status</span><strong>${esc(run.status)}</strong></div>`, `<div class="summary-row"><span>Assigned tasks</span><strong>${assigned} / ${total}</strong></div>`, `<div class="summary-row"><span>Search nodes</span><strong>${Number(run.diagnostics?.search_nodes || 0).toLocaleString()}</strong></div>`].join('') : emptyState('No generation record', 'Run the scheduler to record diagnostics.');
    const upcoming = list.slice(0, 6);
    $('#upcomingBody').innerHTML = upcoming.length ? upcoming.map((row) => `<tr><td><strong>${esc(row.day_name)}</strong><span class="subline">${esc(row.time_label || row.slot_label)}</span></td><td><strong>${esc(row.subject_code)}</strong><span class="subline">${esc(row.subject_name)}</span></td><td>${esc(row.section_code)}</td><td>${esc(row.room_code)}</td><td>${esc(row.instructor_name)}</td></tr>`).join('') : `<tr><td colspan="5">${emptyState('No published schedule', 'Generate a conflict-free timetable to populate this list.')}</td></tr>`;
    $$('.manage-only').forEach((element) => { element.hidden = !canSeeGeneration(); });
  }

  function scheduleRow(row, includeAction = false) {
    const action = includeAction && canManage() ? `<td class="manage-column"><div class="row-actions"><button class="button button-ghost button-small edit-entry" data-entry-id="${Number(row.id)}" type="button">Edit</button><button class="button button-danger button-small cancel-entry" data-entry-id="${Number(row.id)}" type="button">Cancel</button></div></td>` : '';
    return `<tr><td>${esc(row.day_name)}</td><td><strong>${esc(row.time_label || row.slot_label)}</strong></td><td><strong>${esc(row.subject_code)}</strong><span class="subline">${esc(row.subject_name)}</span></td><td>${esc(row.section_code)}<span class="subline">${esc(row.program_code)}</span></td><td>${esc(row.instructor_name)}</td><td>${esc(row.room_code)}<span class="subline">${Number(row.room_capacity)} seats</span></td>${action}</tr>`;
  }

  function visibleScheduleRows() {
    const query = state.query.toLowerCase();
    return schedules().filter((row) => {
      const selected = state.scheduleView === 'all' || state.scheduleFilter === 'all' || (state.scheduleView === 'section' && String(row.section_id) === state.scheduleFilter) || (state.scheduleView === 'instructor' && String(row.instructor_id) === state.scheduleFilter) || (state.scheduleView === 'room' && String(row.room_id) === state.scheduleFilter);
      const searchable = `${row.subject_code} ${row.subject_name} ${row.section_code} ${row.instructor_name} ${row.room_code} ${row.day_name} ${row.slot_label}`.toLowerCase();
      return selected && (!query || searchable.includes(query));
    });
  }

  function renderSchedules() {
    const activeTerm = (state.snapshot.terms || []).find((term) => Number(term.id) === Number(state.snapshot.active_term_id));
    const termLabel = activeTerm ? `${activeTerm.academic_year} · ${activeTerm.semester}` : 'No active academic term';
    $('.schedule-table-panel').hidden = role() === 'student';
    const scheduleTerm = $('#scheduleTermLabel'); if (scheduleTerm) scheduleTerm.textContent = `Active term: ${termLabel}`;
    const printMeta = $('#printMeta'); if (printMeta) printMeta.textContent = `Weekly class schedule · ${termLabel}`;
    renderFilterValues();
    const rows = visibleScheduleRows(); $('#scheduleCountLabel').textContent = `${rows.length} ${rows.length === 1 ? 'class' : 'classes'}`;
    const columnCount = canManage() ? 7 : 6;
    $('#scheduleTableBody').innerHTML = rows.length ? rows.map((row) => scheduleRow(row, true)).join('') : `<tr><td colspan="${columnCount}">${emptyState('No classes match this view', 'Change the filter above, or generate a schedule.')}</td></tr>`;
    const hasRun = Boolean(state.snapshot.active_run);
    const valid = Boolean(state.snapshot.validation?.valid);
    $('#conflictBadge').textContent = hasRun ? (valid ? 'Validated' : 'Conflict found') : 'No run';
    $('#conflictBadge').className = `badge ${hasRun ? (valid ? 'badge-neutral' : 'badge-warning') : 'badge-neutral'}`;
    renderCalendar(rows);
    updatePrintMeta(rows.length);
    $$('.manage-column').forEach((cell) => { cell.hidden = !canManage(); });
  }

  function renderScheduleRequests() {
    const requests = (state.snapshot.schedule_requests || []).map((item) => ({ ...item, slot_label: requestTimeLabel(item) }));
    const instructorPanel = $('#scheduleRequestPanel');
    const reviewPanel = $('#scheduleRequestReviewPanel');
    if (instructorPanel) instructorPanel.hidden = role() !== 'instructor';
    if (reviewPanel) reviewPanel.hidden = !canAdmin();
    if (role() === 'instructor') {
      const offerings = state.snapshot.offerings || [];
      $('#requestOffering').innerHTML = offerings.map((item) => `<option value="${Number(item.id)}">${esc(item.subject_name)} - ${esc(item.section_code)}</option>`).join('') || '<option value="">No assigned classes</option>';
      renderRequestRooms();
      $('#instructorRequestBody').innerHTML = requests.length ? requests.map((item) => `<tr><td>${esc(item.subject_name)} - ${esc(item.section_code)}</td><td>${esc(item.room_code)}</td><td>${esc(requestDateLabel(item))}</td><td>${esc(['','Monday','Tuesday','Wednesday','Thursday','Friday'][Number(item.day_of_week)] || item.day_of_week)}</td><td>${esc(item.slot_label)}</td><td>${esc(item.status)}</td></tr>`).join('') : `<tr><td colspan="6">${emptyState('No room requests', 'Your submitted requests will appear here.')}</td></tr>`;
    }
    if (canAdmin()) {
      $('#scheduleRequestCount').textContent = `${requests.length} pending`;
      $('#scheduleRequestReviewBody').innerHTML = requests.length ? requests.map((item) => `<tr><td>${esc(item.instructor_name)}</td><td>${esc(item.subject_name)} - ${esc(item.section_code)}</td><td>${esc(item.room_code)}</td><td>${esc(requestDateLabel(item))}</td><td>${esc(['','Monday','Tuesday','Wednesday','Thursday','Friday'][Number(item.day_of_week)] || item.day_of_week)}</td><td>${esc(item.slot_label)}</td><td>${esc((item.note || '').replace(/^\[REQUEST_DATE:\d{4}-\d{2}-\d{2}\]\s*/, '') || '-')}</td><td><div class="row-actions"><button class="button button-primary button-small review-schedule-request" data-request-id="${Number(item.id)}" data-decision="APPROVE" type="button">Approve</button><button class="button button-danger button-small review-schedule-request" data-request-id="${Number(item.id)}" data-decision="REJECT" type="button">Reject</button></div></td></tr>`).join('') : `<tr><td colspan="8">${emptyState('No pending room requests', 'Instructor requests will appear here.')}</td></tr>`;
    }
  }

  function renderRequestRooms() {
    const roomSelect = $('#requestRoom');
    if (roomSelect && !roomSelect.dataset.initialized) {
      roomSelect.innerHTML = '<option value="">Choose a date and time first</option>';
      roomSelect.dataset.initialized = 'true';
    }
  }

  function formatTimeInput(input) { const digits = input.value.replace(/\D/g, '').slice(0, 4); input.value = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits; }
  function validTimeInput(value) { return /^(0[1-9]|1[0-2]):[0-5][0-9]$/.test(value); }
  function to24Hour(value, period) {
    const match = /^([0-9]{1,2}):([0-9]{2})$/.exec(value || '');
    if (!match) return null;
    let hour = Number(match[1]);
    const minute = Number(match[2]);
    if (period === 'AM' && hour === 12) hour = 0;
    if (period === 'PM' && hour !== 12) hour += 12;
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }

  function updateRequestDate() { const date = $('#requestDate').value; if (!date) return; const day = new Date(`${date}T00:00:00`).getDay(); if (day === 0 || day === 6) { showToast('Invalid date', 'Choose a Monday through Friday date.', 'error'); $('#requestDate').value = ''; } }
  function requestDateLabel(item) { return item.request_date || (String(item.note || '').match(/^\[REQUEST_DATE:(\d{4}-\d{2}-\d{2})\]/)?.[1] || '-'); }
  function requestTimeLabel(item) { const format = (value) => { const [hours, minutes] = String(value || '').slice(0, 5).split(':').map(Number); if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return ''; const period = hours >= 12 ? 'PM' : 'AM'; return `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${period}`; }; const start = format(item.request_start_time); const end = format(item.requested_end_time); return start && end ? `${start} - ${end}` : item.slot_label || '-'; }
  function roomRequestPayload() { const date = $('#requestDate').value; const start = $('#requestStartTime').value; const end = $('#requestEndTime').value; if (!$('#requestOffering').value || !date || !validTimeInput(start) || !validTimeInput(end)) throw new Error('Choose a class, exact date, and valid start and end times.'); const start24 = to24Hour(start, $('#requestStartPeriod').value); const day = new Date(`${date}T00:00:00`).getDay(); const slotId = Number((slots().find((slot) => slot.start_time === start24) || {}).id || 0); if (day < 1 || day > 5) throw new Error('Choose a Monday through Friday date.'); if (!slotId) throw new Error('Start time must match a configured timetable hour.'); return { offering_id: Number($('#requestOffering').value), room_id: Number($('#requestRoom').value || 0), request_date: date, day_of_week: day, slot_id: slotId, start_time: start, start_period: $('#requestStartPeriod').value, end_time: end, end_period: $('#requestEndPeriod').value }; }
  function setRoomAvailabilityStatus(message, tone = 'muted') { const status = $('#roomAvailabilityStatus'); if (!status) return; status.textContent = message; status.className = `availability-status ${tone}`; $('#submitRoomRequestButton').disabled = tone !== 'health-ok' || !$('#requestRoom').value; }
  function invalidateRoomAvailability() { roomAvailabilityCheckId++; window.clearTimeout(roomAvailabilityTimer); availableRoomsReady = false; roomRequestAllowed = false; $('#requestRoom').innerHTML = '<option value="">Finding available rooms...</option>'; $('#submitRoomRequestButton').disabled = true; try { roomRequestPayload(); roomAvailabilityTimer = window.setTimeout(refreshAvailableRooms, 250); setRoomAvailabilityStatus('Finding available rooms...'); } catch (error) { $('#requestRoom').innerHTML = '<option value="">Choose a date and time first</option>'; setRoomAvailabilityStatus(error.message); } }
  async function refreshAvailableRooms() { const checkId = ++roomAvailabilityCheckId; try { const result = await request('available_rooms', { method: 'POST', body: roomRequestPayload() }); if (checkId !== roomAvailabilityCheckId) return; const rooms = result.rooms || []; const blockers = result.request_blockers || []; const select = $('#requestRoom'); const selectedRoom = select.value; select.innerHTML = rooms.length ? rooms.map((room) => `<option value="${Number(room.id)}">${esc(room.code)} - ${esc(room.name)} (${esc(room.room_type)})</option>`).join('') : '<option value="">No rooms available</option>'; if (rooms.some((room) => Number(room.id) === Number(selectedRoom))) select.value = selectedRoom; availableRoomsReady = rooms.length > 0; roomRequestAllowed = availableRoomsReady && blockers.length === 0; const conflictText = blockers.map((item) => `${item.description} (${requestTimeLabel({ request_start_time: item.start_time, requested_end_time: item.end_time })})`).join('; '); const message = blockers.length ? `${rooms.length ? `${rooms.length} room${rooms.length === 1 ? '' : 's'} are free, but this request cannot be submitted` : 'No rooms available for the selected time'}. ${conflictText}` : rooms.length ? `${rooms.length} room${rooms.length === 1 ? '' : 's'} available for the selected time.` : 'No rooms available for the selected time.'; setRoomAvailabilityStatus(message, roomRequestAllowed ? 'health-ok' : 'health-warn'); } catch (error) { if (checkId === roomAvailabilityCheckId) { availableRoomsReady = false; roomRequestAllowed = false; $('#requestRoom').innerHTML = '<option value="">Availability could not be loaded</option>'; setRoomAvailabilityStatus(error.message, 'health-error'); } } }
  function renderRoomRequests() { renderScheduleRequests(); }

  async function requestSchedule(event) { event.preventDefault(); let payload; try { payload = roomRequestPayload(); } catch (error) { setRoomAvailabilityStatus(error.message, 'health-error'); return; } if (!availableRoomsReady || !payload.room_id) { setRoomAvailabilityStatus('Choose an available room before submitting.', 'health-error'); return; } if (!roomRequestAllowed) { setRoomAvailabilityStatus('Resolve the instructor or class schedule conflict before submitting.', 'health-error'); return; } try { const result = await request('request_schedule', { method: 'POST', body: { ...payload, note: $('#requestNote').value } }); applySnapshot(result.snapshot); showToast('Request submitted', 'Your room request is waiting for administrator approval.'); invalidateRoomAvailability(); } catch (error) { const conflict = error.details?.conflicts?.[0]; const message = conflict ? `Conflict: this room is occupied from ${requestTimeLabel({ request_start_time: conflict.start_time, requested_end_time: conflict.end_time })} (${conflict.description}).` : error.message; availableRoomsReady = false; roomRequestAllowed = false; setRoomAvailabilityStatus(message, 'health-error'); showToast('Could not submit request', message, 'error'); } }
  async function reviewScheduleRequest(id, decision) { if (!window.confirm(`${decision === 'APPROVE' ? 'Approve' : 'Reject'} this room request?`)) return; try { const result = await request('review_schedule_request', { method: 'POST', body: { request_id: id, decision } }); applySnapshot(result.snapshot); showToast('Request reviewed', decision === 'APPROVE' ? 'The room request was approved.' : 'The room request was rejected.'); } catch (error) { showToast('Could not review request', error.message, 'error'); } }

  /* Printed timetables are handed out during review, so the sheet carries its
   * own term, filter and print date rather than relying on browser headers. */
  function updatePrintMeta(count) {
    const target = $('#printMeta');
    if (!target) return;
    const terms = state.snapshot?.terms || [];
    const active = terms.find((term) => Number(term.id) === Number(state.snapshot?.active_term_id)) || terms[0];
    const period = active ? `${active.academic_year} · ${active.semester}` : 'No active term';
    const scope = state.scheduleView === 'all' || state.scheduleFilter === 'all'
      ? 'All classes'
      : text($('#scheduleFilterValue')?.selectedOptions?.[0]?.textContent) || 'Filtered';
    const printed = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    target.textContent = `Weekly class schedule · ${period} · ${scope} · ${count} ${count === 1 ? 'class' : 'classes'} · Printed ${printed}`;
  }

  function renderFilterValues() {
    const select = $('#scheduleFilterValue'); const previous = state.scheduleFilter; let values = [];
    if (state.scheduleView === 'section') values = state.snapshot.sections.map((item) => [item.id, `${item.code} - ${item.program_code}`]);
    if (state.scheduleView === 'instructor') values = state.snapshot.instructors.map((item) => [item.id, item.name]);
    if (state.scheduleView === 'room') values = state.snapshot.rooms.map((item) => [item.id, item.code]);
    $('#scheduleFilterValueWrap').hidden = state.scheduleView === 'all';
    select.innerHTML = `<option value="all">All</option>${values.map(([id, label]) => `<option value="${esc(id)}">${esc(label)}</option>`).join('')}`;
    select.value = values.some(([id]) => String(id) === previous) ? previous : 'all'; state.scheduleFilter = select.value;
  }

  function renderCalendar(rows) {
    const columns = days();
    const timeSlots = slots();
    const slotRows = new Map(timeSlots.map((slot, index) => [String(slot.id), index + 2]));
    const dayColumns = new Map(columns.map(([day], index) => [String(day), index + 2]));
    const byCell = new Map();
    rows.forEach((row) => {
      const key = `${row.day_of_week}:${row.slot_id}`;
      if (!byCell.has(key)) byCell.set(key, []);
      byCell.get(key).push(row);
    });

    let html = '<div class="calendar-cell calendar-head calendar-row-1 calendar-column-1">Time</div>';
    columns.forEach(([, name], index) => {
      html += `<div class="calendar-cell calendar-head calendar-row-1 calendar-column-${index + 2}">${esc(name)}</div>`;
    });
    timeSlots.forEach((slot, index) => {
      const gridRow = index + 2;
      html += `<div class="calendar-cell calendar-time calendar-row-${gridRow} calendar-column-1">${esc(slot.label)}</div>`;
      columns.forEach((_, dayIndex) => {
        html += `<div class="calendar-cell calendar-row-${gridRow} calendar-column-${dayIndex + 2}"></div>`;
      });
    });

    byCell.forEach((entries, key) => {
      const [day, slotId] = key.split(':');
      const gridRow = slotRows.get(slotId);
      const gridColumn = dayColumns.get(day);
      if (!gridRow || !gridColumn) return;
      const cards = entries.map((row) => {
        const subject = subjectById(row.subject_id);
        const roomType = row.room_type || subject?.room_type || 'LECTURE';
        const eventClass = roomType === 'LAB' ? 'lab' : roomType === 'SPECIAL' ? 'other' : 'lecture';
        return `<div class="calendar-event ${eventClass}" title="${esc(`${row.subject_code} | ${row.section_code} | ${row.room_code} | ${row.instructor_name}`)}"><strong>${esc(row.subject_code)}</strong><span>${esc(row.section_code)} · ${esc(row.room_code)}</span><span>${esc(row.instructor_name)}</span></div>`;
      }).join('');
      const stackDensity = entries.length === 1 ? 'calendar-stack-single' : 'calendar-stack-multiple';
      html += `<div class="calendar-event-stack ${stackDensity} calendar-row-${gridRow} calendar-column-${gridColumn} calendar-span-1">${cards}</div>`;
    });

    $('#calendarGrid').innerHTML = html;
  }

  const DATA_META = {
    rooms: { title: 'Rooms', singular: 'Room', headers: ['Code', 'Name', 'Capacity', 'Type', 'Features'], row: (item) => [item.code, item.name, `${item.capacity} seats`, item.room_type, (item.features || []).join(', ')], fields: roomFields },
    instructors: { title: 'Faculty', singular: 'Faculty member', headers: ['Employee no.', 'Name', 'Email', 'Max hours/day'], row: (item) => [item.employee_no, item.name, item.email || '-', `${item.max_hours_day} hours`], fields: instructorFields },
    subjects: { title: 'Subjects', singular: 'Subject', headers: ['Code', 'Name', 'Hours/week', 'Duration', 'Room type'], row: (item) => [item.code, item.name, `${item.hours_per_week} hours`, `${item.duration_slots} slot(s)`, item.room_type], fields: subjectFields },
    programs: { title: 'Programs', singular: 'Program', headers: ['Code', 'Program name'], row: (item) => [item.code, item.name], fields: programFields },
    sections: { title: 'Sections', singular: 'Section', headers: ['Code', 'Program', 'Year', 'Students'], row: (item) => [item.code, item.program_code, `Year ${item.year_level}`, item.student_count], fields: sectionFields },
    offerings: { title: 'Class assignments', singular: 'Class assignment', headers: ['Subject', 'Section', 'Instructor', 'Enrollment', 'Meetings'], row: (item) => [item.subject_name, item.section_code, item.instructor_name, item.enrollment, item.required_meetings], fields: offeringFields },
    users: { title: 'Users', singular: 'User', headers: ['Username', 'Display name', 'Role', 'Assignment'], row: (item) => [item.username, item.display_name, item.role, item.instructor_name || item.section_code || '-'], fields: userFields }
  };

  function renderData() {
    if (state.dataTab === 'users' && !canAdmin()) state.dataTab = 'rooms';
    const meta = DATA_META[state.dataTab]; $('#dataTabTitle').textContent = meta.title; $('#dataTableHead').innerHTML = `<tr>${meta.headers.map((header) => `<th>${esc(header)}</th>`).join('')}<th class="manage-column">Action</th></tr>`;
    $$('.tab-button').forEach((button) => { const active = button.dataset.dataTab === state.dataTab; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); });
    const query = state.query.toLowerCase();
    const source = (state.snapshot[state.dataTab] || []).filter((item) => !query || Object.values(item).some((value) => String(value ?? '').toLowerCase().includes(query)));
    $('#dataTableBody').innerHTML = source.length ? source.map((item) => `<tr>${meta.row(item).map((cell) => `<td>${esc(cell)}</td>`).join('')}<td class="manage-column"><div class="row-actions"><button class="button button-ghost button-small edit-record" data-entity="${state.dataTab}" data-record-id="${Number(item.id || 0)}" type="button">Edit</button><button class="button button-danger button-small delete-record" data-entity="${state.dataTab}" data-record-id="${Number(item.id || 0)}" type="button">Delete</button></div></td></tr>`).join('') : `<tr><td colspan="${meta.headers.length + 1}">${emptyState(query ? 'No matching records' : `No ${meta.title.toLowerCase()} yet`, query ? 'Try a different search term.' : 'Use “Add record” to create the first one.')}</td></tr>`;
    $$('.manage-column').forEach((cell) => { cell.hidden = !canManage(); });
    renderPendingRegistrations();
  }

  function renderPendingRegistrations() { const panel = $('#registrationReviewPanel'); if (!panel) return; panel.hidden = !canAdmin(); if (!canAdmin()) return; const rows = state.snapshot.pending_registrations || []; $('#pendingRegistrationCount').textContent = `${rows.length} pending`; $('#pendingRegistrationCount').className = `badge ${rows.length ? 'badge-warning' : 'badge-neutral'}`; $('#pendingRegistrationBody').innerHTML = rows.length ? rows.map((row) => `<tr><td><strong>${esc(row.display_name)}</strong></td><td>${esc(row.username)}</td><td>${esc(row.program_code)}</td><td>${esc(row.year_level)}</td><td>${esc(row.section_code || 'Unassigned')}</td><td><div class="row-actions"><button class="button button-primary button-small review-registration" data-registration-id="${Number(row.id)}" data-decision="APPROVE" type="button">Approve</button><button class="button button-danger button-small review-registration" data-registration-id="${Number(row.id)}" data-decision="REJECT" type="button">Reject</button></div></td></tr>`).join('') : `<tr><td colspan="6">${emptyState('No pending registrations', 'New student requests will appear here for review.')}</td></tr>`; }

  function renderReports() {
    const rows = schedules(); const roomCounts = new Map(); rows.forEach((row) => roomCounts.set(row.room_code, (roomCounts.get(row.room_code) || 0) + 1)); const max = Math.max(1, ...roomCounts.values());
    const validation = state.snapshot.validation; const run = state.snapshot.last_generation; const diagnostics = run?.diagnostics || {}; const metrics = [metric('Published classes', rows.length, 'Current published run'), metric('Faculty used', new Set(rows.map((row) => row.instructor_id)).size, `of ${state.snapshot.instructors.length}`), metric('Rooms used', new Set(rows.map((row) => row.room_id)).size, `of ${state.snapshot.rooms.length}`), metric('Sections covered', new Set(rows.map((row) => row.section_id)).size, `of ${state.snapshot.sections.length}`)];
    $('#reportMetricGrid').innerHTML = metrics.join('');
    const generationStatus = $('#lastGenerationStatus');
    if (!run) {
      generationStatus.textContent = 'No run'; generationStatus.className = 'badge badge-neutral';
      $('#lastGenerationReport').innerHTML = emptyState('No generation recorded', 'Generate a schedule to record its result here.');
    } else {
      const failures = Object.entries(diagnostics.failures || {});
      const warnings = [...new Set(diagnostics.warnings || [])];
      const successful = diagnostics.hard_constraints || [];
      const explanations = [...new Set([...(diagnostics.preflight_issues || []), ...(diagnostics.explanations || [])])];
      const issueGroups = (items) => {
        const groups = new Map();
        items.forEach((item) => {
          const value = String(item);
          let title = value;
          let fix = 'Review the affected scheduling records.';
          if (value.includes('scheduled hours but the subject requires')) {
            title = 'Scheduled hours do not match subject requirements';
            fix = 'Align meetings per week, duration, and subject hours.';
          } else if (value.includes('no room matching')) {
            title = 'No suitable room is available';
            fix = 'Add a matching room or reduce the class enrollment.';
          } else if (value.includes('no individually valid time')) {
            title = 'No valid time is available';
            fix = 'Review time slots, availability, and daily teaching limits.';
          } else if (value.includes('combined room, instructor, and section constraints')) {
            title = 'Resources are over-constrained together';
            fix = 'Review room, instructor, and section conflicts.';
          } else if (value.startsWith('no_candidate:')) {
            title = 'Some classes have no schedulable candidate';
            fix = 'Review the class requirements and available resources.';
          }
          if (!groups.has(title)) groups.set(title, { count: 0, fix, examples: [] });
          const group = groups.get(title); group.count += 1;
          if (group.examples.length < 3) group.examples.push(value.replace(/^no_candidate:/, ''));
        });
        return [...groups.entries()].sort((left, right) => right[1].count - left[1].count).map(([title, group]) => ({ title, ...group }));
      };
      const issueList = (items, kind) => {
        const groups = issueGroups(items);
        if (!groups.length) return `<div class="generation-clear health-ok">No ${kind === 'warning' ? 'warnings' : 'problems'} recorded.</div>`;
        return `<div class="generation-issues ${kind}"><div class="generation-issues-heading"><strong>${kind === 'warning' ? 'Warnings' : 'Problems to fix'}</strong><span>${items.length} affected</span></div><div class="generation-group-list">${groups.map((group) => `<article class="generation-group"><div class="generation-group-title"><strong>${esc(group.title)}</strong><span>${group.count}</span></div><div class="generation-fix">Fix: ${esc(group.fix)}</div><ul>${group.examples.map((example) => `<li>${esc(example)}</li>`).join('')}</ul></article>`).join('')}</div></div>`;
      };
      generationStatus.textContent = run.status === 'PUBLISHED' ? 'Published' : run.status; generationStatus.className = `badge ${run.status === 'PUBLISHED' ? '' : 'badge-warning'}`;
      $('#lastGenerationReport').innerHTML = [
        `<div class="generation-meta"><span>Run #${Number(run.id)}</span><time>${esc(run.created_at || 'Date unavailable')}</time></div>`,
        `<div class="generation-result"><strong>${Number(run.assigned_tasks)} / ${Number(run.total_tasks)}</strong><span>classes assigned</span></div>`,
        `<div class="generation-stats"><div><strong class="health-ok">${successful.length}</strong><span>checks tracked</span></div><div><strong class="${warnings.length ? 'health-warn' : 'health-ok'}">${warnings.length}</strong><span>warnings</span></div><div><strong class="${failures.length || explanations.length ? 'health-error' : 'health-ok'}">${failures.length + explanations.length}</strong><span>problems</span></div></div>`,
        `<div class="generation-search"><span>Search effort</span><strong>${Number(diagnostics.search_nodes || 0).toLocaleString()} nodes</strong></div>`,
        issueList(warnings, 'warning'),
        failures.length || explanations.length ? issueList([...failures.map(([name, count]) => `${name} (${Number(count)})`), ...explanations], 'problem') : issueList([], 'problem')
      ].join('');
    }
    $('#constraintReport').innerHTML = Object.entries(validation?.checks || {}).map(([item, passed]) => `<div class="constraint-row"><span class="constraint-status ${passed ? '' : 'health-error'}">${passed ? 'PASS' : 'FAIL'}</span><span>${esc(item.replaceAll('_', ' '))}</span></div>`).join('') || emptyState('No published run', 'Constraint evidence appears after a successful generation.');
    $('#roomReport').innerHTML = state.snapshot.rooms.length
      ? state.snapshot.rooms.map((room) => { const count = roomCounts.get(room.code) || 0; return `<div class="bar-row"><span class="bar-label" title="${esc(room.name)}">${esc(room.code)}</span><div class="bar-track"><div class="bar-fill" data-fill="${Math.round((count / max) * 100)}"></div></div><strong>${count}</strong></div>`; }).join('')
      : emptyState('No rooms configured', 'Add rooms under Academic setup to measure utilization.');
    // Widths are applied through the CSSOM: the content security policy has no
    // 'unsafe-inline', so a style="" attribute in this markup would be dropped.
    $$('#roomReport .bar-fill').forEach((bar) => { bar.style.width = `${bar.dataset.fill}%`; });
  }

  function profileSectionMarkup(section, fields, profile) {
    const values = fields.map(([key, label, type, required]) => `<div class="profile-value"><dt>${esc(label)}${required ? ' <span class="required-mark">*</span>' : ''}</dt><dd>${text(profile[key]) ? esc(profile[key]) : '<span class="profile-missing">Not provided</span>'}</dd></div>`).join('');
    const controls = fields.map(([key, label, type, required, maxLength, options = []]) => {
      const id = `profile-${key}`;
      const requiredAttribute = required ? 'required' : '';
      const control = type === 'select'
        ? `<select id="${id}" name="${key}" ${requiredAttribute}><option value="">Choose</option>${options.map((option) => `<option value="${esc(option)}" ${profile[key] === option ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select>`
        : `<input id="${id}" name="${key}" type="${type}" value="${esc(profile[key] || '')}" maxlength="${maxLength}" ${requiredAttribute}>`;
      return `<div class="field"><label for="${id}">${esc(label)}${required ? ' <span class="required-mark">*</span>' : ''}</label>${control}</div>`;
    }).join('');
    return `<dl class="profile-values">${values}</dl><form class="profile-editor" data-profile-form="${section}" hidden><div class="profile-form-grid">${controls}</div><div class="profile-actions"><button class="button button-primary button-small" type="submit">Save changes</button><button class="button button-ghost button-small" type="button" data-profile-cancel="${section}">Cancel</button></div></form>`;
  }

  function renderProfile() {
    const profile = state.snapshot.student_profile || {};
    $('#profileBasicsContent').innerHTML = profileSectionMarkup('basics', [
      ['sex', 'Sex', 'select', true, 20, ['Male', 'Female', 'Other', 'Prefer not to say']],
      ['birthdate', 'Birthdate', 'date', true, 10],
      ['mobile_number', 'Mobile number', 'tel', true, 24],
      ['guardian_first_name', 'Primary guardian first name', 'text', true, 80],
      ['guardian_middle_name', 'Primary guardian middle name', 'text', false, 80],
      ['guardian_last_name', 'Primary guardian last name', 'text', true, 80],
      ['guardian_email', 'Primary guardian email address', 'email', true, 254],
      ['guardian_contact_number', 'Primary guardian contact number', 'tel', true, 24],
      ['guardian_relation', 'Relation to student', 'text', true, 60]
    ], profile);
    $('#profileAddressContent').innerHTML = profileSectionMarkup('address', [
      ['block_lot', 'Block/Lot/No/Village/Subdivision', 'text', true, 120],
      ['street_name', 'Street name', 'text', false, 120],
      ['barangay', 'Barangay', 'text', true, 120],
      ['city_municipality', 'City / Municipality', 'text', true, 120],
      ['province', 'Province', 'text', true, 120],
      ['zip_code', 'ZIP code', 'text', false, 12]
    ], profile);
    $('#profileParentsContent').innerHTML = profileSectionMarkup('parents', [
      ['father_last_name', 'Father last name', 'text', true, 80],
      ['father_first_name', 'Father first name', 'text', true, 80],
      ['father_middle_name', 'Father middle name', 'text', false, 80],
      ['mother_last_name', 'Mother last name (maiden name)', 'text', true, 80],
      ['mother_first_name', 'Mother first name', 'text', true, 80],
      ['mother_middle_name', 'Mother middle name', 'text', false, 80]
    ], profile);
    $('#profileVerified').checked = Boolean(profile.verified_at);
    $('#profileVerificationStatus').textContent = profile.verified_at ? 'Information verified' : '';
  }

  function setProfileSectionEditing(section, editing) {
    const panel = $(`[data-profile-section="${section}"]`);
    if (!panel) return;
    panel.querySelector('.profile-values').hidden = editing;
    panel.querySelector('[data-profile-form]').hidden = !editing;
    panel.querySelector('[data-profile-edit]').hidden = editing;
    if (editing) panel.querySelector('input, select')?.focus();
  }

  function renderSettings() {
    const terms = state.snapshot.terms; const active = terms.find((term) => Number(term.id) === Number(state.snapshot.active_term_id)) || terms[0]; if (active) { $('#academicYear').value = active.academic_year; $('#semester').value = active.semester; } $('#settingsForm').closest('.panel').hidden = !canAdmin();
  }

  function renderAll() { buildNavigation(); $$('.manage-only').forEach((element) => { element.hidden = !canManage(); }); $$('.admin-only').forEach((element) => { element.hidden = !canAdmin(); }); navigate(state.page); }

  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function openModal(title, fields, mode, record = {}) {
    modalMode = mode; modalRecord = record;
    modalReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    $('#modalTitle').textContent = title;
    $('#modalEyebrow').textContent = mode.startsWith('edit') ? 'Update record' : 'New record';
    $('#modalBody').innerHTML = `<div class="form-grid">${fields(record).join('')}</div>`;
    $('#modalBackdrop').hidden = false;
    document.body.classList.add('modal-open');
    // Land on the first field rather than the close button: reviewers fill these
    // dialogs in one pass and should be able to start typing immediately.
    const first = $(FOCUSABLE, $('#modalBody')) || $('#modalCloseButton');
    first.focus();
    if (first instanceof HTMLInputElement && first.type !== 'password') first.select();
    announce(`${title} dialog opened.`);
  }

  /* Tab must not escape an open dialog, otherwise focus walks into the page
   * behind the backdrop where nothing is clickable. */
  function trapModalFocus(event, container = $('#modalBackdrop')) {
    const stops = $$(FOCUSABLE, container).filter((element) => element.offsetParent !== null);
    if (!stops.length) return;
    const first = stops[0]; const last = stops[stops.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !container.contains(active))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
  }

  function openBrandPopup() {
    brandPopupReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    $('#brandPopup').hidden = false;
    document.body.classList.add('modal-open');
    $('#brandPopupClose').focus();
    announce('EasySched information dialog opened.');
  }

  function closeBrandPopup() {
    $('#brandPopup').hidden = true;
    document.body.classList.remove('modal-open');
    if (brandPopupReturnFocus?.isConnected) brandPopupReturnFocus.focus();
    brandPopupReturnFocus = null;
  }

  function inputField(id, label, value, type = 'text', required = true, extra = '') { const full = /(?:^|\s)class="[^"]*\bfull\b/.test(extra); return `<div class="field${full ? ' full' : ''}"><label for="modal-${id}">${esc(label)}</label><input id="modal-${id}" name="${esc(id)}" type="${type}" value="${esc(value)}" ${required ? 'required' : ''} ${extra}></div>`; }
  function selectField(id, label, value, options, required = true) { return `<div class="field"><label for="modal-${id}">${esc(label)}</label><select id="modal-${id}" name="${esc(id)}" ${required ? 'required' : ''}>${options.map(([optionValue, optionLabel]) => `<option value="${esc(optionValue)}" ${String(optionValue) === String(value) ? 'selected' : ''}>${esc(optionLabel)}</option>`).join('')}</select></div>`; }
  function roomFields(row) { return [inputField('code','Room code',row.code || ''), inputField('name','Room name',row.name || ''), inputField('capacity','Capacity',row.capacity || '', 'number', true, 'min="1" max="5000"'), selectField('room_type','Room type',row.room_type || 'LECTURE', [['LECTURE','Lecture'],['LAB','Laboratory'],['SPECIAL','Special']]), inputField('features','Features (comma separated)',(row.features || []).join(', '), 'text', false, 'class="full"')]; }
  function instructorFields(row) { const prefixes = ['', 'Dr.', 'Prof.', 'Engr.', 'Mr.', 'Ms.', 'Mrs.']; const suffixes = ['', 'Jr.', 'Sr.', 'II', 'III', 'IV']; const nameParts = text(row.name).trim().split(/\s+/).filter(Boolean); const prefix = prefixes.includes(nameParts[0]) ? nameParts.shift() : ''; const suffix = suffixes.includes(nameParts[nameParts.length - 1]) ? nameParts.pop() : ''; const firstName = nameParts.shift() || ''; const lastName = nameParts.length ? nameParts.pop() : ''; const middleName = nameParts.join(' '); return [selectField('prefix','Prefix',prefix,[['','None'], ...prefixes.slice(1).map((item) => [item,item])], false), inputField('first_name','First name',firstName), inputField('middle_name','Middle name',middleName, 'text', false), inputField('last_name','Last name',lastName), selectField('suffix','Suffix',suffix,[['','None'], ...suffixes.slice(1).map((item) => [item,item])], false), inputField('employee_no','Employee number',row.employee_no || ''), inputField('email','Email',row.email || '', 'email', false), inputField('max_hours_day','Maximum hours per day',row.max_hours_day || 6, 'number', true, 'min="1" max="16"')]; }
  function subjectFields(row) { return [inputField('code','Subject code',row.code || ''), inputField('name','Subject name',row.name || ''), inputField('units','Units',row.units || 3, 'number', true, 'min="1" max="12"'), inputField('hours_per_week','Hours per week',row.hours_per_week || 2, 'number', true, 'min="1" max="40"'), inputField('duration_slots','Duration in slots',row.duration_slots || 2, 'number', true, 'min="1" max="8"'), selectField('room_type','Room type',row.room_type || 'LECTURE', [['LECTURE','Lecture'],['LAB','Laboratory'],['SPECIAL','Special']]), inputField('required_features','Required features (comma separated)',(row.required_features || []).join(', '), 'text', false, 'class="full"')]; }
  function programFields(row) { return [inputField('code','Program code',row.code || ''), inputField('name','Program name',row.name || '', 'text', true, 'class="full"')]; }
  function sectionFields(row) { return [selectField('program_id','Program',row.program_id || state.snapshot.programs[0]?.id || '', state.snapshot.programs.map((item) => [item.id, `${item.code} - ${item.name}`])), selectField('term_id','Term',row.term_id || state.snapshot.active_term_id, state.snapshot.terms.map((item) => [item.id, `${item.academic_year} - ${item.semester}`])), inputField('code','Section code',row.code || ''), inputField('year_level','Year level',row.year_level || 1, 'number', true, 'min="1" max="4"'), inputField('student_count','Student count',row.student_count || 30, 'number', true, 'min="1" max="5000"')]; }
  function offeringFields(row) { return [selectField('term_id','Term',row.term_id || state.snapshot.active_term_id, state.snapshot.terms.map((item) => [item.id, `${item.academic_year} - ${item.semester}`])), selectField('subject_id','Subject',row.subject_id || state.snapshot.subjects[0]?.id || '', state.snapshot.subjects.map((item) => [item.id, item.name])), selectField('section_id','Section',row.section_id || state.snapshot.sections[0]?.id || '', state.snapshot.sections.map((item) => [item.id, item.code])), selectField('instructor_id','Instructor',row.instructor_id || state.snapshot.instructors[0]?.id || '', state.snapshot.instructors.map((item) => [item.id, item.name])), inputField('enrollment','Enrollment',row.enrollment || 30, 'number', true, 'min="1" max="5000"'), inputField('required_meetings','Meetings per week',row.required_meetings || 1, 'number', true, 'min="1" max="20"')]; }
  function userFields(row) { return [inputField('username','Username',row.username || ''), inputField('display_name','Display name',row.display_name || ''), inputField('email','Email',row.email || '', 'email', false), selectField('role','Role',row.role || 'student',[['admin','Administrator'],['scheduler','Scheduler'],['instructor','Instructor'],['student','Student']]), selectField('instructor_id','Faculty link',row.instructor_id || '', [['','Not linked'], ...state.snapshot.instructors.map((item) => [item.id,item.name])], false), selectField('section_id','Section link',row.section_id || '', [['','Not linked'], ...state.snapshot.sections.map((item) => [item.id,item.code])], false), inputField('password',row.id ? 'New password (leave blank to keep current)' : 'Temporary password','', 'password', !row.id, 'minlength="10" class="full"')]; }

  function openDataRecord(entity, id = 0) { const record = (state.snapshot[entity] || []).find((item) => Number(item.id) === Number(id)) || {}; const mode = id ? `edit-${entity}` : `create-${entity}`; const label = DATA_META[entity].singular; openModal(id ? `Edit ${label}` : `Add ${label}`, DATA_META[entity].fields, mode, record); }

  function closeModal() { const returnFocus = modalReturnFocus; $('#modalBackdrop').hidden = true; document.body.classList.remove('modal-open'); $('#modalBody').replaceChildren(); modalMode = null; modalRecord = null; modalReturnFocus = null; if (returnFocus?.isConnected) returnFocus.focus(); }

  async function submitModal(event) { event.preventDefault(); if (!modalMode) return; const entity = modalMode.replace(/^(create|edit)-/, ''); const formData = new FormData(event.currentTarget); const data = Object.fromEntries(formData.entries()); if (entity === 'instructors') { data.name = [data.prefix, data.first_name, data.middle_name, data.last_name, data.suffix].map((value) => text(value).trim()).filter(Boolean).join(' '); delete data.prefix; delete data.first_name; delete data.middle_name; delete data.last_name; delete data.suffix; } if (['rooms', 'subjects'].includes(entity)) data.features = text(data.features).split(',').map((item) => item.trim()).filter(Boolean); if (entity === 'subjects') data.required_features = text(formData.get('required_features')).split(',').map((item) => item.trim()).filter(Boolean); if (modalRecord?.id) data.id = Number(modalRecord.id); try { const result = await request('save_master', { method: 'POST', body: { entity, data } }); applySnapshot(result.snapshot); closeModal(); showToast('Saved', `${DATA_META[entity].singular} saved successfully.`); } catch (error) { showToast('Could not save', error.message, 'error'); } }

  function openScheduleEditor(entryId) { const row = schedules().find((item) => Number(item.id) === Number(entryId)); if (!row) return; const roomOptions = state.snapshot.rooms.map((item) => [item.id, `${item.code} - ${item.name}`]); const dayOptions = days(); const slotOptions = slots().map((item) => [item.id, item.label]); openModal(`Edit ${row.subject_code}`, () => [selectField('room_id','Room',row.room_id,roomOptions), selectField('day_of_week','Day',row.day_of_week,dayOptions), selectField('slot_id','Start time',row.slot_id,slotOptions)], 'edit-schedule', row); }

  async function submitScheduleEditor(event) { event.preventDefault(); const form = new FormData(event.currentTarget); try { const result = await request('save_schedule', { method: 'POST', body: { entry_id: Number(modalRecord.id), room_id: Number(form.get('room_id')), day_of_week: Number(form.get('day_of_week')), slot_id: Number(form.get('slot_id')) } }); applySnapshot(result.snapshot); closeModal(); showToast('Schedule updated', 'The entry passed hard-constraint validation.'); } catch (error) { showToast('Cannot update schedule', error.message, 'error'); } }

  async function cancelScheduleEntry(entryId) { if (!canManage() || !window.confirm('Cancel this class meeting? The published run will be marked incomplete until regenerated.')) return; try { const result = await request('delete_schedule', { method: 'POST', body: { entry_id: Number(entryId) } }); applySnapshot(result.snapshot); showToast('Class cancelled', 'The meeting was removed while the schedule history was preserved.', 'warn'); } catch (error) { showToast('Cannot cancel class', error.message, 'error'); } }

  async function generate() { const buttons = [$('#generateButton'), $('#dashboardGenerateButton')].filter(Boolean); buttons.forEach((button) => { button.disabled = true; button.textContent = 'Generating...'; }); try { const result = await request('generate', { method: 'POST', body: { term_id: state.snapshot.active_term_id } }); applySnapshot(result.snapshot); showToast('Schedule published', `${result.diagnostics.assigned_tasks} classes passed validation and were published.`); } catch (error) { const details = error.details || {}; const issue = details.preflight_issues?.[0] || details.explanations?.[0] || Object.keys(details.failures || {})[0]; const message = issue ? `${error.message} ${issue.replace(/^no_candidate:/, '')}` : error.message; showToast('Generation failed', message, 'error'); try { applySnapshot(await request('bootstrap')); } catch { /* Keep the current snapshot if the refresh is unavailable. */ } } finally { buttons.forEach((button) => { button.disabled = false; button.textContent = 'Generate schedule'; }); } }

  function exportSchedule() { window.location.href = 'api.php?action=export'; }
  function exportReport() {
    if ($('#reportExportFormat').value === 'csv') return exportSchedule();
    navigate('schedules');
    window.setTimeout(() => window.print(), 120);
  }

  async function deleteRecord(entity, id) { if (!canManage() || !window.confirm('Delete this record from the active system? Existing history will be preserved.')) return; try { const result = await request('save_master', { method: 'POST', body: { entity, id: Number(id), delete: true } }); applySnapshot(result.snapshot); showToast('Deleted', 'The record was removed from the active system. Existing history was preserved.'); } catch (error) { showToast('Cannot delete record', error.message, 'error'); } }

  async function login(event) { event.preventDefault(); const username = text($('#loginUsername').value).toLowerCase(); const password = $('#loginPassword').value; const captcha = $('#loginCaptcha').value; $('#loginError').textContent = ''; try { const result = await request('login', { method: 'POST', body: { username, password, captcha } }); updateLoginChallenge(); applySnapshot(result); showToast('Welcome', `Signed in as ${result.user.display_name}.`); if (result.security_alert?.failed_attempts) showToast('Security notice', `${result.security_alert.failed_attempts} failed login attempt${result.security_alert.failed_attempts === 1 ? '' : 's'} were recorded for this account in the last 24 hours. Change your password if this was not you.`, 'warn'); } catch (error) { $('#loginError').textContent = error.message; updateLoginChallenge(error.details || {}); (error.details?.captcha_required ? $('#loginCaptcha') : $('#loginPassword')).focus(); } }
  async function logout() { try { await request('logout', { method: 'POST', body: {} }); } catch (error) { /* session may already be gone */ } state.snapshot = null; showPublicHome(); }

  async function saveSettings(event) { event.preventDefault(); try { const result = await request('save_settings', { method: 'POST', body: { academic_year: $('#academicYear').value, semester: $('#semester').value } }); applySnapshot(result.snapshot); showToast('Term saved', 'The active academic term was updated.'); } catch (error) { showToast('Cannot save term', error.message, 'error'); } }
  async function saveStudentProfile(event) {
    event.preventDefault();
    const form = event.target;
    const body = Object.fromEntries(new FormData(form).entries());
    body.section = form.dataset.profileForm;
    try {
      const result = await request('save_student_profile', { method: 'POST', body });
      applySnapshot(result.snapshot);
      showToast('Profile saved', 'Your information has been updated. Please verify it again if everything is correct.');
    } catch (error) {
      showToast('Cannot save profile', error.message, 'error');
    }
  }
  async function updateProfileVerification(event) {
    const checkbox = event.target;
    const verified = checkbox.checked;
    try {
      const result = await request('save_student_profile', { method: 'POST', body: { section: 'verification', verified } });
      applySnapshot(result.snapshot);
      showToast(verified ? 'Information verified' : 'Verification removed', verified ? 'Your profile is marked as verified.' : 'Your profile is no longer marked as verified.');
    } catch (error) {
      checkbox.checked = !verified;
      showToast('Cannot verify profile', error.message, 'error');
    }
  }
  async function changePassword(event) { event.preventDefault(); try { const result = await request('change_password', { method: 'POST', body: { current_password: $('#currentPassword').value, new_password: $('#newPassword').value, confirm_password: $('#confirmPassword').value } }); $('#passwordForm').reset(); showToast('Password changed', result.message); } catch (error) { showToast('Cannot change password', error.message, 'error'); } }

  function closeSidebar() { $('#sidebar').classList.remove('open'); $('#sidebarBackdrop').classList.remove('active'); $('#menuButton').setAttribute('aria-expanded', 'false'); }
  function toggleSidebar() { const open = $('#sidebar').classList.toggle('open'); $('#sidebarBackdrop').classList.toggle('active', open); $('#menuButton').setAttribute('aria-expanded', String(open)); }
  function isTypingIn(target) { return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'SELECT', 'TEXTAREA'].includes(target.tagName)); }

  function bindEvents() {
    $('#brandPopupTrigger').addEventListener('click', openBrandPopup);
    $('#brandPopupClose').addEventListener('click', closeBrandPopup);
    $('#brandPopup').addEventListener('mousedown', (event) => { if (event.target === $('#brandPopup')) closeBrandPopup(); });
    document.addEventListener('submit', (event) => { if (event.target.matches('[data-profile-form]')) saveStudentProfile(event); });
    document.addEventListener('change', (event) => { if (event.target.matches('#profileVerified')) updateProfileVerification(event); });
    document.addEventListener('click', (event) => {
      const edit = event.target.closest('[data-profile-edit]');
      if (edit) setProfileSectionEditing(edit.dataset.profileEdit, true);
      const cancel = event.target.closest('[data-profile-cancel]');
      if (cancel) renderProfile();
    });
    $$('[data-show-login]').forEach((button) => button.addEventListener('click', showSignIn));
    $('#backToHomeButton').addEventListener('click', showPublicHome);
    $('#themeToggle').addEventListener('click', toggleTheme);
    $('#refreshLoginCaptcha').addEventListener('click', refreshLoginCaptcha);
    $('#loginForm').addEventListener('submit', login); $('#registrationForm').addEventListener('submit', registerStudent); $('#showRegistrationButton').addEventListener('click', showRegistration); $('#forgotPasswordButton').addEventListener('click', showForgotPassword); $('#backToLoginButton').addEventListener('click', () => showLogin()); $('#backFromResetButton').addEventListener('click', () => showLogin()); $('#sendRegistrationOtpButton').addEventListener('click', sendRegistrationOtp); $('#sendResetOtpButton').addEventListener('click', sendResetOtp); $('#forgotPasswordForm').addEventListener('submit', resetPassword); $('#logoutButton').addEventListener('click', logout); $('#menuButton').addEventListener('click', toggleSidebar); $('#sidebarBackdrop').addEventListener('click', closeSidebar); $('#modalCloseButton').addEventListener('click', closeModal); $('#modalCancelButton').addEventListener('click', closeModal); $('#modalForm').addEventListener('submit', (event) => modalMode === 'edit-schedule' ? submitScheduleEditor(event) : submitModal(event)); $('#generateButton').addEventListener('click', generate); $('#dashboardGenerateButton').addEventListener('click', generate); $('#exportButton').addEventListener('click', exportSchedule); $('#reportExportButton').addEventListener('click', exportReport); $('#printButton').addEventListener('click', () => window.print()); $('#settingsForm').addEventListener('submit', saveSettings); $('#passwordForm').addEventListener('submit', changePassword);
    $('#globalSearch').addEventListener('input', (event) => { state.query = event.target.value; if (state.page === 'schedules') renderSchedules(); if (state.page === 'data') renderData(); }); $('#scheduleViewFilter').addEventListener('change', (event) => { state.scheduleView = event.target.value; state.scheduleFilter = 'all'; renderSchedules(); }); $('#scheduleFilterValue').addEventListener('change', (event) => { state.scheduleFilter = event.target.value; renderSchedules(); }); $('#addRecordButton').addEventListener('click', () => openDataRecord(state.dataTab));
    $('#helpBackButton').addEventListener('click', () => { if (helpIndex > 0) { helpIndex -= 1; renderHelp(); } }); $('#helpNextButton').addEventListener('click', () => { const slides = HELP_SLIDES[role()] || helpSlides; if (helpIndex < slides.length - 1) { helpIndex += 1; renderHelp(); } else navigate('dashboard'); });
    $('#requestOffering').addEventListener('change', invalidateRoomAvailability); $('#requestDate').addEventListener('change', updateRequestDate);
    ['#requestOffering', '#requestDate', '#requestStartTime', '#requestStartPeriod', '#requestEndTime', '#requestEndPeriod'].forEach((selector) => { const field = $(selector); field.addEventListener('input', invalidateRoomAvailability); field.addEventListener('change', invalidateRoomAvailability); });
    $('#requestRoom').addEventListener('change', () => { $('#submitRoomRequestButton').disabled = !availableRoomsReady || !roomRequestAllowed || !$('#requestRoom').value; });
    $('#scheduleRequestForm').addEventListener('submit', requestSchedule); ['#requestStartTime', '#requestEndTime'].forEach((selector) => $(selector).addEventListener('input', (event) => formatTimeInput(event.target))); document.addEventListener('click', (event) => { const navigateButton = event.target.closest('[data-navigate]'); if (navigateButton) navigate(navigateButton.dataset.navigate); const dataTab = event.target.closest('[data-data-tab]'); if (dataTab) { state.dataTab = dataTab.dataset.dataTab; $$('.tab-button').forEach((button) => { const active = button.dataset.dataTab === state.dataTab; button.classList.toggle('active', active); button.setAttribute('aria-selected', String(active)); }); renderData(); } const review = event.target.closest('.review-registration'); if (review) reviewRegistration(Number(review.dataset.registrationId), review.dataset.decision); const scheduleReview = event.target.closest('.review-schedule-request'); if (scheduleReview) reviewScheduleRequest(Number(scheduleReview.dataset.requestId), scheduleReview.dataset.decision); const edit = event.target.closest('.edit-record'); if (edit) openDataRecord(edit.dataset.entity, Number(edit.dataset.recordId)); const del = event.target.closest('.delete-record'); if (del) deleteRecord(del.dataset.entity, Number(del.dataset.recordId)); const editEntry = event.target.closest('.edit-entry'); if (editEntry) openScheduleEditor(Number(editEntry.dataset.entryId)); const cancelEntry = event.target.closest('.cancel-entry'); if (cancelEntry) cancelScheduleEntry(Number(cancelEntry.dataset.entryId)); });
    document.addEventListener('keydown', (event) => {
      const modalOpen = !$('#modalBackdrop').hidden;
      const brandPopupOpen = !$('#brandPopup').hidden;
      if (event.key === 'Escape') { if (modalOpen) closeModal(); if (brandPopupOpen) closeBrandPopup(); closeSidebar(); return; }
      if (modalOpen || brandPopupOpen) { if (event.key === 'Tab') trapModalFocus(event, brandPopupOpen ? $('#brandPopup') : $('#modalBackdrop')); return; }
      // "/" jumps to the view filter, matching the hint rendered beside the field.
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isTypingIn(event.target)) {
        const search = $('#globalSearch'); const field = search?.closest('.search-field');
        if (search && field && !field.hidden) { event.preventDefault(); search.focus(); search.select(); }
      }
    });
    $('#modalBackdrop').addEventListener('mousedown', (event) => { if (event.target === $('#modalBackdrop')) closeModal(); });
    const homePreview = $('#homeDashboardPreview');
    if (homePreview && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      const updateHomeParallax = () => {
        const bounds = homePreview.getBoundingClientRect();
        const distanceFromCenter = (bounds.top + bounds.height / 2 - window.innerHeight / 2) / window.innerHeight;
        const offset = Math.max(-10, Math.min(10, distanceFromCenter * -24));
        homePreview.style.setProperty('--home-parallax-y', `${offset}px`);
      };
      window.addEventListener('scroll', updateHomeParallax, { passive: true });
      window.addEventListener('resize', updateHomeParallax);
      updateHomeParallax();
    }
    const parallax = $('#loginParallax');
    if (parallax && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
      parallax.addEventListener('pointermove', (event) => {
        const rect = parallax.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - .5) * 16;
        const y = ((event.clientY - rect.top) / rect.height - .5) * 12;
        parallax.style.setProperty('--parallax-x', `${x}px`);
        parallax.style.setProperty('--parallax-y', `${y}px`);
      });
      parallax.addEventListener('pointerleave', () => { parallax.style.setProperty('--parallax-x', '0px'); parallax.style.setProperty('--parallax-y', '0px'); });
    }
  }

  async function start() { bindEvents(); try { const result = await request('bootstrap'); if (!registrationOpen) applySnapshot(result); } catch (error) { if (error.status !== 401 && !registrationOpen) showLogin(error.message); } }
  document.addEventListener('DOMContentLoaded', start);
})();
