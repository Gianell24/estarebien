<?php
// config.php: written by backend.mjs. Keep it private; it is blocked from the web by .htaccess.
if (!defined('K_BACKEND')) { http_response_code(404); exit; }
return [
  'site_name' => 'Ruway Producciones',
  'owner_email' => 'ruwayproducciones@gmail.com',
  'site_url' => '',
  'from_email' => 'ruwayproducciones@gmail.com',
  'secret' => '2803d6e5866c1b9778a9c5aa1432fdf83bbb8fb275de532e389884463b5cec2b',
  'db_file' => 'inbox-700f2fbc6d1df938.sqlite',
  'setup_code' => 'AXDPC1FD',
];
