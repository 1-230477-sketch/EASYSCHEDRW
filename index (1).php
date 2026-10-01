<?php
declare(strict_types=1);

require_once __DIR__ . DIRECTORY_SEPARATOR . 'security.php';
easysched_load_local_env();
easysched_start_session();
easysched_send_security_headers();

$contactEmail = easysched_contact_email();

/**
 * Inline icon set. The content security policy allows no external assets, so
 * icons ship as inline SVG paths reused through this helper.
 */
function easysched_icon(string $name, string $size = '20'): string
{
    static $paths = [
        'menu' => '<path d="M4 7h16M4 12h16M4 17h16"/>',
        'search' => '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
        'sun' => '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7"/>',
        'moon' => '<path d="M20.5 14.6A8.6 8.6 0 019.4 3.5a8.6 8.6 0 1011.1 11.1z"/>',
        'logout' => '<path d="M9.5 4H6.5A2.5 2.5 0 004 6.5v11A2.5 2.5 0 006.5 20h3"/><path d="M15.5 8.5l3.5 3.5-3.5 3.5"/><path d="M19 12H9"/>',
        'close' => '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
        'refresh' => '<path d="M20 12a8 8 0 11-2.4-5.7"/><path d="M20 3.5V8h-4.5"/>',
        'shield' => '<path d="M12 3l7.5 3v5.6c0 4.4-3 8-7.5 9.4-4.5-1.4-7.5-5-7.5-9.4V6z"/><path d="M9 12.2l2.1 2.1L15.2 10"/>',
        'lock' => '<rect x="4.5" y="10.5" width="15" height="9.5" rx="2.2"/><path d="M8 10.5V7.8a4 4 0 018 0v2.7"/>',
        'info' => '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.4M12 7.9h.01"/>',
        'inbox' => '<path d="M3.5 13.5h4l1.5 2.5h6l1.5-2.5h4"/><path d="M3.5 13.5L6 5.2h12l2.5 8.3v4.3a1.7 1.7 0 01-1.7 1.7H5.2a1.7 1.7 0 01-1.7-1.7z"/>',
        'printer' => '<path d="M7 9V4h10v5"/><rect x="4" y="9" width="16" height="7" rx="1.8"/><path d="M7 16h10v4H7z"/>',
        'download' => '<path d="M12 3.5v10.5"/><path d="M8 10.5l4 4 4-4"/><path d="M4.5 18.5h15"/>',
        'sparkle' => '<path d="M12 3.5l1.9 4.9 4.9 1.9-4.9 1.9L12 17.1l-1.9-4.9L5.2 10.3l4.9-1.9z"/><path d="M18.5 16.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
        'calendar' => '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M7.5 3v4M16.5 3v4M3.5 9.5h17M8 13h2M14 13h2M8 16.5h2"/>',
        'users' => '<path d="M16 20v-1.5a4 4 0 00-4-4H7a4 4 0 00-4 4V20"/><circle cx="9.5" cy="7" r="3.5"/><path d="M17 11a3.5 3.5 0 000-7M21 20v-1.5a4 4 0 00-3-3.87"/>',
        'chart' => '<path d="M4 20V11M10 20V5M16 20v-7M22 20H2"/>',
        'list' => '<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>',
        'settings' => '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.34 1.88l.06.06-1.7 2.94-.08-.02a1.7 1.7 0 00-1.78.65l-.05.07h-3.4l-.04-.08a1.7 1.7 0 00-1.53-1.02 1.7 1.7 0 00-.83.22l-.08.04-2.94-1.7.02-.08a1.7 1.7 0 00-.65-1.78l-.07-.05v-3.4l.08-.04a1.7 1.7 0 001.02-1.53 1.7 1.7 0 00-.22-.83l-.04-.08 1.7-2.94.08.02a1.7 1.7 0 001.78-.65l.05-.07h3.4l.04.08a1.7 1.7 0 001.53 1.02 1.7 1.7 0 00.83-.22l.08-.04 2.94 1.7-.02.08a1.7 1.7 0 00.65 1.78l.07.05v3.4l-.08.04A1.7 1.7 0 0019.4 15z"/>',
        'eye' => '<path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6z"/><circle cx="12" cy="12" r="2.5"/>',
        'check' => '<path d="M5 12.5l4.2 4.2L19 7"/>',
        'clock' => '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
        'school' => '<path d="M2.5 9.5L12 4l9.5 5.5L12 15zM6 12v5c3.8 2.5 8.2 2.5 12 0v-5M21.5 9.5v6"/>',
    ];

    $body = $paths[$name] ?? '';

    return '<svg viewBox="0 0 24 24" width="' . $size . '" height="' . $size . '" fill="none" stroke="currentColor"'
        . ' stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
        . $body . '</svg>';
}

$assetVersion = filemtime(__DIR__ . DIRECTORY_SEPARATOR . 'script.js') . '-' . filemtime(__DIR__ . DIRECTORY_SEPARATOR . 'styles.css');
const EASYSCHED_SCHOOL = 'New Sinai School and Colleges Sta. Rosa, Inc.';
?><!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light dark">
    <meta name="theme-color" content="#faf9f6" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="#1a1917" media="(prefers-color-scheme: dark)">
    <meta name="description" content="<?= EASYSCHED_SCHOOL ?> automated class scheduling system">
    <title>EasySched | <?= EASYSCHED_SCHOOL ?></title>
    <link rel="icon" href="assets/school-logo.png">
    <link rel="apple-touch-icon" href="assets/school-logo.png">
    <link rel="stylesheet" href="styles.css?v=<?= $assetVersion ?>">
</head>
<body>
    <a class="skip-link" href="#mainContent">Skip to content</a>

    <noscript>
        <p class="noscript-banner">EasySched needs JavaScript enabled to load schedules. Please enable it and reload this page.</p>
    </noscript>

    <main class="public-home" id="publicHome">
        <header class="home-header">
            <a class="home-brand" href="#homeTop" aria-label="EasySched home">
                <img src="assets/school-logo.png" alt="">
                <span>EasySched</span>
            </a>
            <nav class="home-nav" aria-label="Main navigation">
                <a href="#homeTop">Home</a>
                <a href="#homeFeatures">Features</a>
                <a href="#homeAbout">About</a>
                <a href="#homeContact">Contact</a>
            </nav>
            <button class="home-login" type="button" data-show-login>Login <span aria-hidden="true">&rarr;</span></button>
        </header>

        <section class="home-hero" id="homeTop" aria-labelledby="homeTitle">
            <div class="home-hero-photo" aria-hidden="true"></div>
            <div class="home-hero-content">
                <p class="home-kicker">Smart scheduling <span>·</span> Better learning <span>·</span> Brighter future</p>
                <h1 id="homeTitle">Automated Class<br>Scheduling <span>System</span></h1>
                <h2>New Sinai School and Colleges Sta. Rosa</h2>
                <p>Simplify scheduling, eliminate conflicts, and make every classroom hour count.</p>
                <div class="home-hero-actions">
                    <button class="home-button home-button-primary" type="button" data-show-login>Login <span aria-hidden="true">&rarr;</span></button>
                    <a class="home-button home-button-outline" href="#homeFeatures">Learn more</a>
                </div>
            </div>
            <a class="home-scroll" href="#homeFeatures" aria-label="Scroll to features"><span></span>Scroll down</a>
        </section>

        <section class="home-section home-features" id="homeFeatures" aria-labelledby="featuresTitle">
            <div class="home-section-heading">
                <p class="home-eyebrow">Features</p>
                <h2 id="featuresTitle">Everything You Need for Smarter Scheduling</h2>
                <p>Powerful features designed to make class scheduling easier, faster, and more efficient.</p>
            </div>
            <div class="home-feature-grid">
                <article class="home-feature"><span class="home-feature-icon" aria-hidden="true"><?= easysched_icon('calendar', '21') ?></span><h3>Automated Scheduling</h3><p>Generate optimal class schedules that balance rooms, faculty, and institutional requirements.</p></article>
                <article class="home-feature"><span class="home-feature-icon" aria-hidden="true"><?= easysched_icon('shield', '21') ?></span><h3>Conflict Detection</h3><p>Automatically detect and resolve scheduling conflicts and instructor overlaps.</p></article>
                <article class="home-feature"><span class="home-feature-icon" aria-hidden="true"><?= easysched_icon('users', '21') ?></span><h3>Instructor Load Management</h3><p>Balance teaching loads fairly and efficiently across all instructors.</p></article>
                <article class="home-feature"><span class="home-feature-icon" aria-hidden="true"><?= easysched_icon('chart', '21') ?></span><h3>Reports</h3><p>View detailed reports and analytics for better decision-making and planning.</p></article>
            </div>
        </section>

        <section class="home-steps" aria-labelledby="stepsTitle">
            <div class="home-section-heading home-section-heading-inverse">
                <p class="home-eyebrow">How it works</p>
                <h2 id="stepsTitle">Get Your Schedule in 4 Simple Steps</h2>
            </div>
            <ol class="home-step-grid">
                <li><span class="home-step-icon" aria-hidden="true"><?= easysched_icon('users', '23') ?></span><h3>Login</h3><p>Access the system with your authorized account.</p></li>
                <li><span class="home-step-icon" aria-hidden="true"><?= easysched_icon('list', '23') ?></span><h3>Set Subjects &amp; Rooms</h3><p>Input subjects, available rooms, and other requirements.</p></li>
                <li><span class="home-step-icon" aria-hidden="true"><?= easysched_icon('settings', '23') ?></span><h3>Generate Schedule</h3><p>Let the system create the optimal class schedule.</p></li>
                <li><span class="home-step-icon" aria-hidden="true"><?= easysched_icon('eye', '23') ?></span><h3>Review &amp; Manage</h3><p>Check, adjust, and manage your schedule as needed.</p></li>
            </ol>
        </section>

        <section class="home-about" id="homeAbout" aria-labelledby="aboutTitle">
            <div class="home-about-copy">
                <p class="home-eyebrow">About the system</p>
                <h2 id="aboutTitle">Built for New Sinai School and Colleges Sta. Rosa</h2>
                <p>The Automated Class Scheduling System is designed specifically for New Sinai School and Colleges Sta. Rosa to streamline academic operations, reduce manual work, and ensure efficient use of resources. It helps administrators, faculty, and staff work together for a more organized and productive learning environment.</p>
                <ul>
                    <li><?= easysched_icon('check', '16') ?>School-focused and easy to use</li>
                    <li><?= easysched_icon('check', '16') ?>Supports faculty, rooms, and subject management</li>
                    <li><?= easysched_icon('check', '16') ?>Designed for higher academic efficiency</li>
                </ul>
            </div>
            <figure class="home-dashboard-preview" id="homeDashboardPreview">
                <img src="assets/dashboard-preview.png" alt="EasySched instructor dashboard showing class metrics and the weekly schedule" decoding="async">
            </figure>
        </section>

        <section class="home-benefits" aria-labelledby="benefitsTitle">
            <div class="home-section-heading home-section-heading-inverse">
                <p class="home-eyebrow">Why choose us</p>
                <h2 id="benefitsTitle">Key Benefits</h2>
            </div>
            <div class="home-benefit-grid">
                <article><span><?= easysched_icon('clock', '20') ?></span><div><h3>Saves Time</h3><p>Automates scheduling and reduces manual work.</p></div></article>
                <article><span><?= easysched_icon('shield', '20') ?></span><div><h3>Reduces Conflicts</h3><p>Prevents room, time, and instructor overlaps.</p></div></article>
                <article><span><?= easysched_icon('chart', '20') ?></span><div><h3>Optimizes Resources</h3><p>Ensures fair and balanced instructor loads.</p></div></article>
                <article><span><?= easysched_icon('check', '20') ?></span><div><h3>Improves Decision Making</h3><p>Access real-time reports and detailed insights.</p></div></article>
            </div>
        </section>

        <section class="home-contact" id="homeContact" aria-labelledby="contactTitle">
            <div class="home-contact-wrap">
                <h1 id="contactTitle">Contact Us</h1>
                <p class="home-contact-intro">We’d love to hear from you! If you have any questions, feedback, or need assistance, please reach out using the email below or fill out our contact form, and we’ll get back to you as soon as possible.</p>

                <div class="home-contact-email-box">
                    <p class="home-contact-kicker">Reach us directly</p>
                    <p class="home-contact-email"><a href="mailto:<?= htmlspecialchars($contactEmail, ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($contactEmail, ENT_QUOTES, 'UTF-8') ?></a></p>
                </div>

                <div class="home-contact-form-box">
                    <p class="home-contact-kicker">Get in touch</p>
                    <h2>Contact Form</h2>
                    <p>Please fill out the form below with your name, email, and message. Our team will review your inquiry and respond promptly.</p>

                    <form class="home-contact-form" action="mailto:<?= htmlspecialchars($contactEmail, ENT_QUOTES, 'UTF-8') ?>" method="post" enctype="text/plain">
                        <div class="home-form-row">
                            <div class="home-form-field">
                                <label for="contactFirstName">First Name</label>
                                <input id="contactFirstName" name="first_name" type="text" placeholder="John" autocomplete="given-name">
                            </div>
                            <div class="home-form-field">
                                <label for="contactLastName">Last Name</label>
                                <input id="contactLastName" name="last_name" type="text" placeholder="Doe" autocomplete="family-name">
                            </div>
                        </div>

                        <div class="home-form-field">
                            <label for="contactEmailInput">Email</label>
                            <input id="contactEmailInput" name="email" type="email" placeholder="example@mail.com" autocomplete="email">
                        </div>

                        <div class="home-form-field">
                            <label for="contactMessage">Message</label>
                            <textarea id="contactMessage" name="message" rows="5" placeholder="Enter your message"></textarea>
                        </div>

                        <button class="home-contact-submit" type="submit">Submit <span aria-hidden="true">✦</span></button>
                    </form>
                </div>
            </div>
        </section>

        <footer class="home-footer">
            <a class="home-brand" href="#homeTop"><img src="assets/school-logo.png" alt=""><span><strong>New Sinai School and Colleges</strong><small>Sta. Rosa, Inc.</small></span></a>
            <nav aria-label="Footer navigation"><a href="#homeTop">Home</a><a href="#homeFeatures">Features</a><a href="#homeAbout">About</a><a href="#homeContact">Contact</a></nav>
            <p>&copy; <?= date('Y') ?> New Sinai School and Colleges Sta. Rosa, Inc.</p>
        </footer>
    </main>

    <section class="login-shell" id="loginView" aria-labelledby="loginTitle" hidden>
        <div class="login-panel">
            <div class="brand-lockup">
                <img class="brand-logo" src="assets/school-logo.png" alt="<?= EASYSCHED_SCHOOL ?> seal">
                <div><strong><?= EASYSCHED_SCHOOL ?></strong><span>EasySched</span></div>
                <button class="button button-ghost login-home-button" id="backToHomeButton" type="button">Home</button>
            </div>
            <p class="eyebrow">Academic scheduling workspace</p>
            <h1 id="loginTitle">Sign in to manage schedules</h1>
            <p class="muted">Secure server sessions, conflict-aware generation, and a published timetable your faculty can trust.</p>
            <form id="loginForm" novalidate>
                <div class="field">
                    <label for="loginUsername">Username</label>
                    <input id="loginUsername" name="username" autocomplete="username" required maxlength="80" spellcheck="false">
                </div>
                <div class="field">
                    <label for="loginPassword">Password</label>
                    <input id="loginPassword" name="password" type="password" autocomplete="current-password" required maxlength="200">
                </div>
                <div class="field" id="loginCaptchaWrap" hidden>
                    <label for="loginCaptcha">Security check &mdash; solve the question</label>
                    <div class="captcha-image-row">
                        <img id="loginCaptchaImage" width="300" height="92" alt="Arithmetic security question">
                        <button class="captcha-refresh" id="refreshLoginCaptcha" type="button" aria-label="Get another security question" title="Get another question"><?= easysched_icon('refresh') ?></button>
                    </div>
                    <input id="loginCaptcha" name="captcha" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="3" placeholder="Enter the answer">
                </div>
                <p class="form-error" id="loginError" role="alert"></p>
                <button class="button button-primary button-wide" type="submit"><?= easysched_icon('lock', '16') ?>Sign in</button>
            </form>
            <p class="login-divider">or</p>
            <button class="button button-ghost button-wide" id="showRegistrationButton" type="button">New student? Request an account</button>
            <button class="button button-ghost button-wide" id="forgotPasswordButton" type="button">Forgot your password?</button>
            <p class="login-note"><?= easysched_icon('info', '16') ?><span>Student requests are reviewed by an administrator before the account can sign in.</span></p>
        </div>

        <div class="login-panel registration-panel" id="registrationView" hidden>
            <div class="brand-lockup">
                <img class="brand-logo" src="assets/school-logo.png" alt="">
                <div><strong>Student registration</strong><span>Request access to EasySched</span></div>
            </div>
            <p class="eyebrow">Enrollment access request</p>
            <h1>Request a student account</h1>
            <p class="muted">Fill in your student details. An administrator approves the request before your first sign-in.</p>
            <form id="registrationForm" novalidate>
                <div class="form-grid">
                    <div class="field"><label for="registrationFirstName">First name</label><input id="registrationFirstName" required maxlength="80" autocomplete="given-name"></div>
                    <div class="field"><label for="registrationMiddleName">Middle name <span class="muted"></span></label><input id="registrationMiddleName" maxlength="80" autocomplete="additional-name"></div>
                    <div class="field"><label for="registrationLastName">Last name</label><input id="registrationLastName" required maxlength="80" autocomplete="family-name"></div>
                    <div class="field"><label for="registrationUsername">Username</label><input id="registrationUsername" required maxlength="80" spellcheck="false" autocomplete="username"></div>
                    <div class="field full">
                        <label for="registrationEmail">Email</label>
                        <div class="field-with-action">
                            <input id="registrationEmail" type="email" maxlength="180" autocomplete="email">
                            <button class="button button-secondary" id="sendRegistrationOtpButton" type="button">Send code</button>
                        </div>
                    </div>
                    <div class="field"><label for="registrationOtp">Email verification code</label><input id="registrationOtp" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="Send the code first, then enter it here"></div>
                    <div class="field"><label for="registrationProgram">Program</label><select id="registrationProgram" required><option value="">Loading programs&hellip;</option></select></div>
                    <div class="field"><label for="registrationYear">Year level</label><select id="registrationYear" required><option value="">Select year level</option><option value="1">1st Year</option><option value="2">2nd Year</option><option value="3">3rd Year</option><option value="4">4th Year</option></select></div>
                    <div class="field"><label for="registrationSection">Section <span class="muted">(optional)</span></label><select id="registrationSection"><option value="">No section assigned yet</option></select></div>
                    <div class="field full"><label for="registrationPassword">Password</label><input id="registrationPassword" type="password" minlength="10" required autocomplete="new-password"><span class="field-hint">At least 10 characters.</span></div>
                </div>
                <p class="form-error" id="registrationError" role="alert"></p>
                <button class="button button-primary button-wide" type="submit">Submit registration</button>
                <button class="button button-ghost button-wide" id="backToLoginButton" type="button">Back to sign in</button>
            </form>
        </div>

        <div class="login-panel registration-panel" id="forgotPasswordView" hidden>
            <div class="brand-lockup">
                <img class="brand-logo" src="assets/school-logo.png" alt="">
                <div><strong>Password recovery</strong><span>Verify your email to reset access</span></div>
            </div>
            <p class="eyebrow">Account recovery</p>
            <h1>Reset your password</h1>
            <p class="muted">We send a one-time code to the email address on file for the account.</p>
            <form id="forgotPasswordForm" novalidate>
                <div class="field">
                    <label for="resetAccount">Username or email</label>
                    <div class="field-with-action">
                        <input id="resetAccount" required maxlength="180" spellcheck="false">
                        <button class="button button-secondary" id="sendResetOtpButton" type="button">Send code</button>
                    </div>
                </div>
                <div class="field"><label for="resetOtp">Verification code</label><input id="resetOtp" inputmode="numeric" maxlength="6" autocomplete="one-time-code"></div>
                <div class="field"><label for="resetPassword">New password</label><input id="resetPassword" type="password" minlength="10" required autocomplete="new-password"></div>
                <div class="field"><label for="resetPasswordConfirm">Confirm new password</label><input id="resetPasswordConfirm" type="password" minlength="10" required autocomplete="new-password"></div>
                <p class="form-error" id="resetError" role="alert"></p>
                <button class="button button-primary button-wide" type="submit">Reset password</button>
                <button class="button button-ghost button-wide" id="backFromResetButton" type="button">Back to sign in</button>
            </form>
        </div>

        <div class="login-aside" id="loginParallax" aria-label="New Sinai campus">
            <div class="campus-frame" aria-hidden="true"><div class="campus-photo"></div></div>
            <div class="login-aside-content">
                <p class="aside-kicker"><?= EASYSCHED_SCHOOL ?></p>
                <h2>Smarter schedules for a stronger academic community.</h2>
                <p>Conflict-aware scheduling built for the people, classrooms, and learning spaces of New Sinai.</p>
                <div class="aside-points">
                    <div><strong>Conflict-free by design</strong><span>Rooms, faculty, sections, and time slots are validated on the server before anything is published.</span></div>
                    <div><strong>Ready on campus</strong><span>Runs on the campus machine and saves schedules locally.</span></div>
                </div>
            </div>
        </div>
    </section>

    <div class="app-shell" id="appView" hidden>
        <div class="sidebar-backdrop" id="sidebarBackdrop"></div>
        <aside class="sidebar" id="sidebar" aria-label="Primary navigation">
            <div class="brand-lockup">
                <img class="brand-logo" src="assets/school-logo.png" alt="<?= EASYSCHED_SCHOOL ?> seal">
                <div><strong><?= EASYSCHED_SCHOOL ?></strong></div>
            </div>
            <div class="user-card">
                <div class="avatar" id="userAvatar" aria-hidden="true">A</div>
                <div><strong id="userName">User</strong><span id="userRole">Role</span></div>
            </div>
            <p class="nav-label">Workspace</p>
            <ul class="nav-list" id="navList"></ul>
            <div class="sidebar-footer"><span>Powered By&nbsp;</span><button class="sidebar-footer-brand" id="brandPopupTrigger" type="button" aria-haspopup="dialog" aria-controls="brandPopup">EasySched</button></div>
        </aside>

        <main class="main-shell" id="mainContent">
            <header class="topbar">
                <div class="topbar-left">
                    <button class="icon-button menu-button" id="menuButton" type="button" aria-label="Open navigation" aria-expanded="false" aria-controls="sidebar"><?= easysched_icon('menu') ?></button>
                    <img class="topbar-brand-logo" src="assets/school-logo.png" alt="New Sinai School and Colleges Sta. Rosa, Inc. seal">
                    <div><p class="eyebrow" id="pageEyebrow">Overview</p><h1 id="pageTitle">Dashboard</h1></div>
                </div>
                <div class="topbar-actions">
                    <label class="search-field" for="globalSearch">
                        <?= easysched_icon('search', '16') ?>
                        <span class="sr-only">Search this view</span>
                        <input id="globalSearch" type="search" placeholder="Search this view" autocomplete="off">
                        <kbd aria-hidden="true">/</kbd>
                    </label>
                    <button class="icon-button outlined" id="themeToggle" type="button" aria-label="Switch to dark theme" title="Switch theme"><?= easysched_icon('moon', '18') ?></button>
                    <span class="topbar-divider" aria-hidden="true"></span>
                    <button class="button button-ghost" id="logoutButton" type="button"><?= easysched_icon('logout', '15') ?><span class="collapsing-label">Sign out</span></button>
                </div>
            </header>

            <div class="page-container">
                <section class="page" id="page-dashboard" data-page="dashboard" aria-labelledby="dashboardHeading">
                    <div class="page-heading">
                        <div><p class="eyebrow"></p><h2 id="dashboardHeading">Scheduling overview</h2><p class="muted">A live view of the active academic term.</p><span class="active-term-label" id="activeTermLabel"></span></div>
                        <div class="page-heading-actions"><button class="button button-primary manage-only" id="dashboardGenerateButton" type="button"><?= easysched_icon('sparkle', '15') ?>Generate schedule</button></div>
                    </div>
                    <div class="metric-grid" id="metricGrid"></div>
                    <div class="dashboard-grid">
                        <article class="panel panel-large">
                            <div class="panel-heading"><div><p class="eyebrow">Latest publication</p><h3>Schedule health</h3></div><span class="badge" id="scheduleHealthBadge">No schedule</span></div>
                            <div id="dashboardHealth" class="health-list"></div>
                        </article>
                        <article class="panel">
                            <div class="panel-heading"><div><p class="eyebrow">At a glance</p><h3>Generation record</h3></div></div>
                            <div id="runSummary" class="summary-list"></div>
                        </article>
                    </div>
                    <article class="panel">
                        <div class="panel-heading"><div><p class="eyebrow">Next on the calendar</p><h3>Upcoming classes</h3></div><button class="button button-ghost" data-navigate="schedules" type="button">Open schedule</button></div>
                        <div class="table-wrap">
                            <table class="data-table compact">
                                <thead><tr><th>Time</th><th>Subject</th><th>Section</th><th>Room</th><th>Instructor</th></tr></thead>
                                <tbody id="upcomingBody"></tbody>
                            </table>
                        </div>
                    </article>
                </section>

                <section class="page" id="page-schedules" data-page="schedules" aria-labelledby="schedulesHeading" hidden>
                    <div class="print-header" aria-hidden="true">
                        <img src="assets/school-logo.png" alt="">
                        <div><strong><?= EASYSCHED_SCHOOL ?></strong><span id="printMeta">Weekly class schedule</span></div>
                    </div>
                    <div class="page-heading">
                        <div><p class="eyebrow"></p><h2 id="schedulesHeading">Weekly schedule</h2><p class="muted">Filter by the audience you need to answer for.</p><span class="active-term-label" id="scheduleTermLabel"></span></div>
                        <div class="page-heading-actions">
                            <button class="button button-ghost" id="printButton" type="button"><?= easysched_icon('printer', '15') ?>Print</button>
                            <button class="button button-secondary" id="exportButton" type="button"><?= easysched_icon('download', '15') ?>Export CSV</button>
                            <button class="button button-primary manage-only" id="generateButton" type="button"><?= easysched_icon('sparkle', '15') ?>Generate schedule</button>
                        </div>
                    </div>
                    <div class="filter-bar">
                        <label class="field-inline">View<select id="scheduleViewFilter"><option value="all">All classes</option><option value="section">By section</option><option value="instructor">By instructor</option><option value="room">By room</option></select></label>
                        <label class="field-inline" id="scheduleFilterValueWrap">Filter<select id="scheduleFilterValue"><option value="all">All</option></select></label>
                        <span class="filter-spacer"></span>
                        <span class="legend"><span class="legend-dot lecture"></span>Lecture <span class="legend-dot lab"></span>Laboratory <span class="legend-dot other"></span>Other</span>
                    </div>
                    <div class="calendar-panel"><div class="calendar-grid" id="calendarGrid"></div></div>
                    <article class="panel schedule-table-panel">
                        <div class="panel-heading"><div><p class="eyebrow">Detailed list</p><h3 id="scheduleCountLabel">0 classes</h3></div><span class="badge badge-neutral" id="conflictBadge">Validated</span></div>
                        <div class="table-wrap">
                            <table class="data-table">
                                <thead><tr><th>Day</th><th>Time</th><th>Subject</th><th>Section</th><th>Instructor</th><th>Room</th><th class="manage-column">Action</th></tr></thead>
                                <tbody id="scheduleTableBody"></tbody>
                            </table>
                        </div>
                    </article>
                    <div class="print-signatures" aria-hidden="true">
                        <div><span class="signature-line"></span>Prepared by</div>
                        <div><span class="signature-line"></span>Checked by</div>
                        <div><span class="signature-line"></span>Approved by</div>
                    </div>
                </section>

                <section class="page" id="page-room-requests" data-page="room-requests" aria-labelledby="roomRequestsHeading" hidden>
                    <div class="page-heading"><div><p class="eyebrow"></p><h2 id="roomRequestsHeading">Room requests</h2><p class="muted">Request a room and time for an assigned class. An administrator must approve it before it is added to the timetable.</p></div></div>
                    <article class="panel instructor-only" id="scheduleRequestPanel" hidden>
                        <div class="panel-heading"><div><p class="eyebrow">Instructor request</p><h3>Request a room and time</h3></div></div>
                        <form id="scheduleRequestForm" class="form-grid">
                            <div class="field"><label for="requestOffering">Class assignment</label><select id="requestOffering" required></select></div>
                            <div class="field"><label for="requestDate">Exact date</label><input id="requestDate" type="date" required></div>
                            <div class="field"><label for="requestStartTime">Start time</label><div class="time-input-group"><input id="requestStartTime" value="08:00" inputmode="numeric" maxlength="5" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" required><select id="requestStartPeriod" aria-label="Start time period"><option>AM</option><option>PM</option></select></div></div>
                            <div class="field"><label for="requestEndTime">End time</label><div class="time-input-group"><input id="requestEndTime" value="09:00" inputmode="numeric" maxlength="5" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" required><select id="requestEndPeriod" aria-label="End time period"><option>AM</option><option>PM</option></select></div></div>
                            <div class="field"><label for="requestRoom">Available room</label><select id="requestRoom" required><option value="">Choose a date and time first</option></select></div>
                            <div class="field full"><p id="roomAvailabilityStatus" class="availability-status muted" role="status" aria-live="polite">Choose a date, start time, and end time to find available rooms.</p></div>
                            <div class="field full"><label for="requestNote">Note <span class="muted">(optional)</span></label><input id="requestNote" maxlength="300" placeholder="Reason for this request"></div>
                            <div class="field full"><button class="button button-primary" id="submitRoomRequestButton" type="submit" disabled>Submit room request</button></div>
                        </form>
                        <div class="table-wrap"><table class="data-table"><thead><tr><th>Class</th><th>Room</th><th>Date</th><th>Day</th><th>Time</th><th>Status</th></tr></thead><tbody id="instructorRequestBody"></tbody></table></div>
                    </article>
                    <article class="panel admin-only" id="scheduleRequestReviewPanel" hidden>
                        <div class="panel-heading"><div><p class="eyebrow">Room requests</p><h3>Pending instructor requests</h3></div><span class="badge badge-warning" id="scheduleRequestCount">0 pending</span></div>
                        <div class="table-wrap"><table class="data-table"><thead><tr><th>Instructor</th><th>Class</th><th>Room</th><th>Date</th><th>Day</th><th>Time</th><th>Note</th><th>Action</th></tr></thead><tbody id="scheduleRequestReviewBody"></tbody></table></div>
                    </article>
                </section>

                <section class="page" id="page-data" data-page="data" aria-labelledby="dataHeading" hidden>
                    <div class="page-heading"><div><p class="eyebrow"></p><h2 id="dataHeading">Academic setup</h2><p class="muted">Maintain the resources the scheduler solves against.</p></div></div>
                    <div class="data-tabs" role="tablist" aria-label="Master data types">
                        <button class="tab-button active" role="tab" aria-selected="true" data-data-tab="rooms" type="button">Rooms</button>
                        <button class="tab-button" role="tab" aria-selected="false" data-data-tab="instructors" type="button">Faculty</button>
                        <button class="tab-button" role="tab" aria-selected="false" data-data-tab="subjects" type="button">Subjects</button>
                        <button class="tab-button" role="tab" aria-selected="false" data-data-tab="programs" type="button">Programs</button>
                        <button class="tab-button" role="tab" aria-selected="false" data-data-tab="sections" type="button">Sections</button>
                        <button class="tab-button" role="tab" aria-selected="false" data-data-tab="offerings" type="button">Class assignments</button>
                        <button class="tab-button admin-only" role="tab" aria-selected="false" data-data-tab="users" type="button">Users</button>
                    </div>
                    <article class="panel">
                        <div class="panel-heading"><div><p class="eyebrow">Current term records</p><h3 id="dataTabTitle">Rooms</h3></div><button class="button button-primary manage-only" id="addRecordButton" type="button">Add record</button></div>
                        <div class="table-wrap"><table class="data-table"><thead id="dataTableHead"></thead><tbody id="dataTableBody"></tbody></table></div>
                    </article>
                    <article class="panel admin-only" id="registrationReviewPanel" hidden>
                        <div class="panel-heading"><div><p class="eyebrow">Enrollment review</p><h3>Pending student registrations</h3></div><span class="badge badge-warning" id="pendingRegistrationCount">0 pending</span></div>
                        <div class="table-wrap">
                            <table class="data-table">
                                <thead><tr><th>Name</th><th>Username</th><th>Program</th><th>Year</th><th>Section</th><th>Action</th></tr></thead>
                                <tbody id="pendingRegistrationBody"></tbody>
                            </table>
                        </div>
                    </article>
                </section>

                <section class="page" id="page-reports" data-page="reports" aria-labelledby="reportsHeading" hidden>
                    <div class="page-heading">
                        <div><p class="eyebrow"></p><h2 id="reportsHeading">Reports</h2><p class="muted">Summaries to present during review and defense.</p></div>
                        <div class="page-heading-actions export-actions">
                            <label class="sr-only" for="reportExportFormat">Export format</label>
                            <select id="reportExportFormat" aria-label="Export format"><option value="csv">CSV spreadsheet</option><option value="pdf">PDF report</option></select>
                            <button class="button button-secondary" id="reportExportButton" type="button"><?= easysched_icon('download', '15') ?>Export</button>
                        </div>
                    </div>
                    <div class="metric-grid" id="reportMetricGrid"></div>
                    <div class="report-grid">
                        <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Latest generation</p><h3>Generation result</h3></div><span class="badge" id="lastGenerationStatus">No run</span></div><div id="lastGenerationReport" class="summary-list"></div></article>
                        <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Constraint validation</p><h3>Hard constraints</h3></div></div><div id="constraintReport" class="constraint-list"></div></article>
                        <article class="panel"><div class="panel-heading"><div><p class="eyebrow">Capacity planning</p><h3>Room utilization</h3></div></div><div id="roomReport" class="bar-list"></div></article>
                    </div>
                </section>

                <section class="page" id="page-profile" data-page="profile" aria-labelledby="profileHeading" hidden>
                    <div class="page-heading">
                        <div><p class="eyebrow">Account</p><h2 id="profileHeading">Profile</h2><p class="muted">Review and update your information.</p></div>
                    </div>
                    <article class="panel profile-verification">
                        <div class="profile-verification-copy">
                            <p class="eyebrow">Verify information</p>
                            <p>Is the information correct? Please make necessary changes if needed.</p>
                            <span id="profileVerificationStatus" role="status"></span>
                        </div>
                        <label class="profile-verify-control"><input id="profileVerified" type="checkbox"><span>I verify that the information is correct</span></label>
                    </article>
                    <div class="profile-sections">
                        <article class="panel profile-section" data-profile-section="basics">
                            <div class="panel-heading"><div><h3>Basic Information</h3></div><button class="button button-ghost button-small" type="button" data-profile-edit="basics">Edit</button></div>
                            <div id="profileBasicsContent"></div>
                        </article>
                        <article class="panel profile-section" data-profile-section="address">
                            <div class="panel-heading"><div><h3>Home Address</h3></div><button class="button button-ghost button-small" type="button" data-profile-edit="address">Edit</button></div>
                            <div id="profileAddressContent"></div>
                        </article>
                        <article class="panel profile-section" data-profile-section="parents">
                            <div class="panel-heading"><div><h3>Parents Information</h3></div><button class="button button-ghost button-small" type="button" data-profile-edit="parents">Edit</button></div>
                            <div id="profileParentsContent"></div>
                        </article>
                    </div>
                </section>

                <section class="page" id="page-settings" data-page="settings" aria-labelledby="settingsHeading" hidden>
                    <div class="page-heading"><div><p class="eyebrow"></p><h2 id="settingsHeading">Settings</h2><p class="muted">Term configuration and account security.</p></div></div>
                    <div class="settings-grid">
                        <article class="panel manage-only">
                            <div class="panel-heading"><div><p class="eyebrow">Academic period</p><h3>Active term</h3></div></div>
                            <form id="settingsForm">
                                <div class="field"><label for="academicYear">Academic year</label><input id="academicYear" pattern="20[0-9]{2}-20[0-9]{2}" required placeholder="2026-2027"><span class="field-hint">Format: 2026-2027.</span></div>
                                <div class="field"><label for="semester">Semester</label><select id="semester"><option>First Semester</option><option>Second Semester</option></select></div>
                                <button class="button button-primary" type="submit">Save term</button>
                            </form>
                        </article>
                        <article class="panel">
                            <div class="panel-heading"><div><p class="eyebrow">Account</p><h3>Change password</h3></div></div>
                            <form id="passwordForm">
                                <div class="field"><label for="currentPassword">Current password</label><input id="currentPassword" type="password" required autocomplete="current-password"></div>
                                <div class="field"><label for="newPassword">New password</label><input id="newPassword" type="password" minlength="10" required autocomplete="new-password"><span class="field-hint">At least 10 characters.</span></div>
                                <div class="field"><label for="confirmPassword">Confirm new password</label><input id="confirmPassword" type="password" minlength="10" required autocomplete="new-password"></div>
                                <button class="button button-primary" type="submit">Change password</button>
                            </form>
                        </article>
                    </div>
                    <article class="panel security-note">
                        <div class="security-icon"><?= easysched_icon('shield', '22') ?></div>
                        <div>
                            <p class="eyebrow">Deployment boundary</p>
                            <h3>Defense build security posture</h3>
                            <p>This build uses server-side sessions, password hashes, CSRF tokens, prepared SQLite queries, role checks, audit logs, and a restrictive content security policy. Use HTTPS and a production database before handling real student records.</p>
                        </div>
                    </article>
                </section>

                <section class="page help-page" id="page-help" data-page="help" aria-labelledby="helpHeading" hidden>
                    <div class="page-heading"><div><p class="eyebrow"></p><h2 id="helpHeading">Help center</h2><p class="muted">A short walkthrough for managing EasySched from setup to a published timetable.</p></div></div>
                    <article class="panel help-hero">
                        <div class="help-slide-count" id="helpSlideCount">1 / 8</div>
                        <div id="helpSlideContent"></div>
                    </article>
                    <div class="help-controls"><button class="button button-ghost" id="helpBackButton" type="button">Back</button><div class="help-dots" id="helpDots" aria-label="Help steps"></div><button class="button button-primary" id="helpNextButton" type="button">Next</button></div>
                </section>
            </div>
        </main>
    </div>

    <div class="modal-backdrop" id="modalBackdrop" hidden>
        <section class="modal" id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
            <div class="modal-header">
                <div><p class="eyebrow" id="modalEyebrow">Record</p><h2 id="modalTitle">Edit record</h2></div>
                <button class="icon-button" id="modalCloseButton" type="button" aria-label="Close dialog"><?= easysched_icon('close', '18') ?></button>
            </div>
            <form id="modalForm">
                <div class="modal-body" id="modalBody"></div>
                <div class="modal-footer">
                    <button class="button button-ghost" id="modalCancelButton" type="button">Cancel</button>
                    <button class="button button-primary" type="submit">Save</button>
                </div>
            </form>
        </section>
    </div>

    <div class="brand-popup" id="brandPopup" hidden>
        <section class="brand-popup-card" role="dialog" aria-modal="true" aria-label="EasySched information">
            <button class="icon-button brand-popup-close" id="brandPopupClose" type="button" aria-label="Close EasySched information"><?= easysched_icon('close', '18') ?></button>
            <img class="brand-popup-image" src="assets/easysched-splash.webp" alt="Powered by EasySched. Automated Scheduling System. More About Us. App Version 1.0. Copyright 2026 Easy Sched.">
        </section>
    </div>

    <div class="toast-stack" id="toastStack" aria-live="polite" aria-atomic="false"></div>
    <div class="sr-only" id="liveRegion" aria-live="polite"></div>
    <script src="script.js?v=<?= $assetVersion ?>" defer></script>
</body>
</html>
