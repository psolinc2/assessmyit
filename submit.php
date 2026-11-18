<?php
// Receives scorecard submissions. Sends to HubSpot (Forms API) and emails a notification.
// Fill in the settings below, then upload. No API key is needed for the HubSpot public form endpoint.

$HUBSPOT_PORTAL_ID = '';   // e.g. 12345678
$HUBSPOT_FORM_GUID = '';   // the form GUID from HubSpot > Marketing > Forms
$NOTIFY_EMAIL      = '';   // where lead alerts go, e.g. ari@promisingsolutions.com
$FROM_EMAIL        = 'noreply@assessmyit.com';

header('Content-Type: application/json');

function fail($msg) { echo json_encode(['ok' => false, 'error' => $msg]); exit; }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Invalid request.');
if (!empty($_POST['website'])) { echo json_encode(['ok' => true]); exit; } // honeypot

function clean($v, $max = 200) {
    $v = trim((string)$v);
    $v = preg_replace('/[\r\n]+/', ' ', $v);
    return mb_substr($v, 0, $max);
}

$email = filter_var(clean($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
if (!$email) fail('Please enter a valid email address.');

$name    = clean($_POST['name'] ?? '');
$firm    = clean($_POST['firm'] ?? '');
$users   = clean($_POST['users'] ?? '', 20);
$renewal = clean($_POST['renewal'] ?? '', 20);
$score   = (int)($_POST['score'] ?? 0);
$tier    = clean($_POST['tier'] ?? '', 40);
$flags   = clean($_POST['flags'] ?? '', 40);
$page    = clean($_POST['page'] ?? '', 100);
$answers = clean($_POST['answers'] ?? '', 200);

$summary = "Scorecard: $score/48 ($tier). Priority flags: " . ($flags ?: 'none') .
           ". Users: $users. Contract renewal: " . ($renewal ?: 'not given') .
           ". Answers: $answers. Page: $page";

$ok = true;

if ($HUBSPOT_PORTAL_ID && $HUBSPOT_FORM_GUID) {
    $parts = explode(' ', $name, 2);
    $payload = [
        'fields' => [
            ['name' => 'email', 'value' => $email],
            ['name' => 'firstname', 'value' => $parts[0] ?? ''],
            ['name' => 'lastname', 'value' => $parts[1] ?? ''],
            ['name' => 'company', 'value' => $firm],
            ['name' => 'message', 'value' => $summary],
        ],
        'context' => ['pageUri' => 'https://assessmyit.com' . $page, 'pageName' => 'Scorecard'],
    ];
    $ch = curl_init("https://api.hsforms.com/submissions/v3/integration/submit/$HUBSPOT_PORTAL_ID/$HUBSPOT_FORM_GUID");
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
    ]);
    curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code < 200 || $code >= 300) $ok = false;
}

if ($NOTIFY_EMAIL) {
    $body = "New scorecard submission\n\nName: $name\nFirm: $firm\nEmail: $email\n\n$summary\n";
    @mail($NOTIFY_EMAIL, "Assess My IT lead: $firm ($score/48)", $body,
          "From: $FROM_EMAIL\r\nReply-To: $email\r\n");
}

if (!$HUBSPOT_PORTAL_ID && !$NOTIFY_EMAIL) {
    // Not configured yet: don't lose the lead silently.
    @file_put_contents(__DIR__ . '/leads.log', date('c') . " $email | $firm | $summary\n", FILE_APPEND | LOCK_EX);
}

echo json_encode(['ok' => $ok, 'error' => $ok ? null : 'Could not save. Please try again.']);
