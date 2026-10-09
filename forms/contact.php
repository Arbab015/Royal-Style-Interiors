<?php
/**
 * Contact form handler - Royal Style Interiors
 * Works on Hostinger shared hosting (uses PHP mail()).
 * Returns the plain text "OK" on success, which the template's
 * assets/vendor/php-email-form/validate.js expects.
 *
 * Optional: for best deliverability create a mailbox such as
 * no-reply@yourdomain.com on Hostinger and set the SMTP block below.
 */

// ------------------------------------------------------------------
// Settings
// ------------------------------------------------------------------
$receiving_email_address = 'arbabr225@gmail.com';   // where messages are delivered

// ------------------------------------------------------------------
header('Content-Type: text/plain; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo 'Invalid request method.';
    exit;
}

// Honeypot: real users never fill this hidden field.
if (!empty($_POST['website'])) {
    echo 'OK';
    exit;
}

// Strip header-injection characters, tags and extra whitespace.
function rsi_clean($value)
{
    $value = strip_tags((string) $value);
    $value = str_replace(array("\r", "\n", "%0a", "%0d"), ' ', $value);
    return trim($value);
}

$name    = rsi_clean($_POST['name'] ?? '');
$email   = rsi_clean($_POST['email'] ?? '');
$subject = rsi_clean($_POST['subject'] ?? '');
$message = trim(strip_tags((string) ($_POST['message'] ?? '')));

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    http_response_code(422);
    echo 'Please fill in all required fields.';
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(422);
    echo 'Please enter a valid email address.';
    exit;
}

// Build a From address on the domain that is actually hosting the site,
// so Hostinger/Gmail SPF checks pass more often.
$host        = $_SERVER['HTTP_HOST'] ?? 'localhost';
$host        = preg_replace('/^www\./i', '', $host);
$from_email  = 'no-reply@' . $host;
$mail_subject = 'New website enquiry: ' . $subject;

$body  = "You have received a new message from the Royal Style Interiors website.\n\n";
$body .= "Name:    {$name}\n";
$body .= "Email:   {$email}\n";
$body .= "Subject: {$subject}\n\n";
$body .= "Message:\n{$message}\n";

$headers  = 'From: Royal Style Interiors <' . $from_email . '>' . "\r\n";
$headers .= 'Reply-To: ' . $name . ' <' . $email . '>' . "\r\n";
$headers .= 'MIME-Version: 1.0' . "\r\n";
$headers .= 'Content-Type: text/plain; charset=UTF-8' . "\r\n";
$headers .= 'X-Mailer: PHP/' . phpversion();

$sent = @mail($receiving_email_address, $mail_subject, $body, $headers, '-f' . $from_email);

if ($sent) {
    echo 'OK';
} else {
    error_log('RSI contact form: mail() failed for ' . $receiving_email_address);
    http_response_code(500);
    echo 'Sorry, your message could not be sent right now. Please try again or contact us on WhatsApp.';
}
