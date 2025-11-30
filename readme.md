# ⚽ Sport Photography Job Manager

<div align="center">
  <img src="https://ghazabegins.cyou/tj/logo.PNG" alt="Logo" width="150">
  <br>
  <b>Sistem Manajemen Jadwal Motret Sepakbola Berbasis Web</b>
  <br><br>
  
  ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
  ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
  ![Google Sheets](https://img.shields.io/badge/google_sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)
</div>

---

## 📖 Deskripsi

Aplikasi web sederhana namun *powerful* untuk mengatur jadwal pekerjaan fotografi (khususnya sepakbola). Aplikasi ini menggunakan **Google Spreadsheet** sebagai database (backend), sehingga data aman, gratis, dan bisa diakses dari mana saja.

Didesain dengan pendekatan **Mobile-First**, aplikasi ini sangat nyaman digunakan melalui Handphone maupun Desktop, lengkap dengan fitur **Dark Mode** dan sistem keamanan sederhana.

## ✨ Fitur Unggulan

* **🔒 Keamanan Simpel:** Halaman login sederhana untuk mencegah akses tanpa izin.
* **🌓 Dark Mode & Light Mode:** Otomatis mengikuti preferensi atau bisa di-switch manual. Tersimpan di memori browser.
* **📱 Responsif Total:** Tampilan optimal di layar HP (tabel bisa digeser, tombol jari-friendly).
* **⚡ Input Cerdas:**
    * Otomatis mendeteksi "Hari" dari tanggal yang dipilih.
    * Fitur "Time Picker" yang otomatis menambahkan durasi +2 Jam dari waktu Kickoff.
* **📊 Dashboard Informatif:** Widget "Jadwal Hari Ini" yang muncul otomatis jika ada job di hari tersebut.
* **📝 CRUD Lengkap:** Input data, Lihat Laporan, Edit Jadwal, Hapus, dan Tandai Selesai (*Mark as Done*).
* **🖨️ Cetak Laporan:** Mode print-friendly untuk mencetak laporan jadwal tanpa tombol-tombol yang mengganggu.

---

## 📂 Struktur File

| Nama File | Fungsi |
| :--- | :--- |
| `index.html` | **Dashboard Utama.** Menampilkan widget jadwal hari ini dan menu navigasi. |
| `login.html` | **Halaman Masuk.** Gerbang keamanan password sebelum mengakses aplikasi. |
| `jadwal_bola.html` | **Form Input.** Halaman untuk memasukkan data jadwal pertandingan baru. |
| `kelola_jadwal.html`| **Laporan & Aksi.** Tabel data lengkap dengan fitur filter, edit, hapus, dan print. |

---

## 🚀 Cara Instalasi & Penggunaan

Ikuti langkah ini agar aplikasi berjalan dengan database Google Sheet milikmu sendiri.

### Langkah 1: Siapkan Google Spreadsheet

1.  Buka [Google Spreadsheet](https://sheets.new) baru.
2.  Beri nama file, misal: `Database Jadwal Bola`.
3.  Di **Baris 1**, buat Judul Kolom persis seperti ini (Huruf Besar/Kecil berpengaruh):
    * `A1`: **Waktu Input**
    * `B1`: **Tanggal**
    * `C1`: **Hari**
    * `D1`: **Waktu**
    * `E1`: **Tim**
    * `F1`: **Venue**
    * `G1`: **Status**

### Langkah 2: Pasang Google Apps Script

1.  Di Spreadsheet, klik menu **Extensions (Ekstensi)** > **Apps Script**.
2.  Hapus semua kode yang ada, ganti dengan kode backend yang sudah disiapkan.
3.  Klik **Deploy** > **New Deployment**.
4.  Pilih type: **Web App**.
5.  Isi konfigurasi:
    * Description: `Versi 1`
    * Execute as: **Me** (Email kamu)
    * Who has access: **Anyone** (Siapa saja) -> *Penting agar aplikasi web bisa kirim data.*
6.  Klik **Deploy** dan salin **Web App URL** yang muncul.

### Langkah 3: Konfigurasi Frontend

1.  Download/Clone repository ini.
2.  Buka file `index.html`, `jadwal_bola.html`, dan `kelola_jadwal.html` menggunakan Text Editor (VS Code/Notepad).
3.  Cari baris kode berikut:
    ```javascript
    const scriptURL = 'PASTE_URL_WEB_APP_GOOGLE_SCRIPT_DISINI';
    ```
4.  Ganti tulisan di dalam kutip dengan **URL Web App** yang kamu dapat dari Langkah 2.
5.  **Setting Password:** Buka `login.html`, cari dan ubah:
    ```javascript
    const PASSWORD_RAHASIA = "admin123"; // Ganti dengan passwordmu
    ```

### Langkah 4: Jalankan!

Kamu bisa membuka file `index.html` langsung di browser (klik 2x), atau upload semua file ke hosting gratis seperti **GitHub Pages** atau **Netlify** agar bisa diakses online dari HP.

---

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Variables), JavaScript (Vanilla).
* **Backend:** Google Apps Script.
* **Database:** Google Spreadsheet.

## 🤝 Kontribusi

Dibuat untuk mempermudah manajemen jadwal fotografi olahraga. Jika ada saran atau perbaikan, silakan buat *Pull Request* atau *Issue*.

---
&copy; 2025 Sport Photography Management.
