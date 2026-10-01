# Optional email on localhost

EasySched's website and SQLite database run locally without a hosting account. Registration verification and password recovery still need internet access and an email provider. Existing accounts can sign in, change their passwords, and use scheduling without email. Administrators can create accounts through Academic setup.

1. Copy .env.example to .env in the EasySched folder. Keep .env private.
2. Uncomment the SMTP settings and enter your email address and app password, or configure Resend with an API key and verified sender. Do not use your normal email password as an app password.
3. For SMTP TLS, enable PHP OpenSSL; for Resend, enable PHP curl in XAMPP. Restart Apache after changing PHP extensions.
4. Open EasySched on localhost. The SQLite schema, including the OTP table, is initialized automatically.

Without email configuration, code requests report that delivery is not configured; verification is never bypassed. OTP codes expire after ten minutes, allow five attempts, and can be requested only once per minute. Only their hashes are stored.
