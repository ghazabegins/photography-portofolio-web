<?php
// tracker.php
// Script untuk mencatat IP pengunjung ke file teks

// 1. Ambil Data Pengunjung
$ip_address = $_SERVER['REMOTE_ADDR'];
$time = date("d-m-Y H:i:s");
$browser = $_SERVER['HTTP_USER_AGENT'];
$page = isset($_SERVER['HTTP_REFERER']) ? $_SERVER['HTTP_REFERER'] : 'Langsung/Unknown';

// 2. Format Data Log
// Contoh: [06-12-2025 18:30:00] IP: 192.168.1.1 | Page: index.html | Browser: Chrome...
$log_entry = "[$time] IP: $ip_address | Page: $page | Browser: $browser" . PHP_EOL;

// 3. Simpan ke File 'visitors.txt'
// FILE_APPEND artinya data baru akan ditambahkan di bawah data lama (tidak menimpa)
$file_log = 'visitors.txt';
file_put_contents($file_log, $log_entry, FILE_APPEND);

// (Opsional) Kirim respon kosong agar tidak mengganggu browser
header('Content-Type: text/plain');
echo "Recorded";
?>