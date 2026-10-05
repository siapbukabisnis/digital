# SBB — Siap Buka Bisnis · v25

PWA mandiri untuk mencatat keuangan dan menguji kesiapan bisnis. Seluruh data pengguna disimpan di perangkat melalui `localStorage` dan dapat dipindahkan memakai satu file backup berintegritas.

## Perbaikan v25

- Simpan yang gagal mengembalikan data sebelumnya dan tidak lagi menampilkan pesan keberhasilan palsu. Impor backup memakai pemulihan seluruh modul ketika salah satu penulisan gagal.
- Cache dibatasi pada aplikasi dan lokasi pemasangannya. Kalkulator tidak lagi mematikan service worker; halaman kalkulator tetap tersedia saat offline setelah cache selesai dipasang.
- Anggaran kategori dan target tabungan bisa diedit dalam rupiah; data persentase lama tetap terbaca.
- Data contoh tidak menggandakan transaksi saat dimuat ulang, dan semua data lama di atas batas transaksi tetap dipertahankan.
- Tanggal kalender yang tidak mungkin, transaksi masa depan, nominal pecahan, dan angka tidak valid ditolak saat menambah transaksi.
- Jawaban SBB Digital bertahan saat profil diedit; pemeriksaan yang belum selesai kembali ke pertanyaan berikutnya saat dibuka ulang.
- Formulir menunjukkan langkah yang perlu diperbaiki. Pembatalan dialog hapus tidak menjalankan persetujuan dari dialog sebelumnya.
- Backup membedakan profil contoh dengan hasil pemeriksaan tersimpan. Sesi kedaluwarsa dan data admin rusak ditangani tanpa menghentikan aplikasi.
- ID dan catatan dari backup di-escape sebelum tampil sebagai HTML.
- Workflow pemeriksaan GitHub dan publikasi GitHub Pages manual disertakan.

## Tampilan aplikasi

Tampilan dan alur aplikasi dibangun ulang menjadi ruang usaha yang hangat, modern, dan mudah dipakai. Logo, ikon aplikasi, serta warna identitas SBB tetap menggunakan aset asli. Referensi struktur modul Huniable diterapkan pada pembagian menu dan akses cepat.

- Beranda baru dengan ringkasan uang, diagram arus uang dari transaksi aktual, prioritas hari ini, dan pintasan lima modul.
- Navigasi desktop yang lebih jelas, menu mengambang di ponsel, dan akses bawah untuk Beranda, Uang, Hitung, serta Lainnya.
- SBB Start dengan tiga langkah dan SBB Health dengan lima langkah, memakai kolom serta perhitungan sebelumnya.
- SBB Business dengan alur biaya bertahap, pencarian seluruh 51 kalkulator, dan hasil yang tetap berubah langsung saat input disesuaikan.
- SBB Digital dengan profil dahulu, kemudian satu pertanyaan per layar; hasil mengikuti jawaban pengguna.
- Panel admin, halaman informasi, tabel, formulir, kondisi kosong, serta navigasi keyboard memakai gaya yang konsisten.
- Tombol backup cepat; kunci penyimpanan dan format data lama dipertahankan.

Untuk Worker Cloudflare **digital**, gunakan **PANDUAN-CLOUDFLARE-v25.md**. Konfigurasi paket menargetkan Worker tersebut dan menyajikan folder `dist`.

Panduan unggah GitHub, opsi GitHub Pages, dan pembaruan versi lama tersedia di **PANDUAN-UPDATE-v25.md**. Ekstrak ZIP lalu unggah isinya ke root repository.

## Modul

- **Atur Uang** — pencatatan pemasukan, pengeluaran, tabungan, anggaran kategori, pencarian riwayat, dan ekspor Excel/CSV.
- **SBB Start** — dana darurat, kebutuhan modal, estimasi waktu siap, dan rekomendasi ide bisnis.
- **SBB Business** — 51 kalkulator usaha dengan harga, margin, laba, BEP, modal kerja, target penjualan, dan rekonsiliasi hasil.
- **SBB Health** — skor kesehatan usaha, tren, skenario, peringatan inkonsistensi data, dan riwayat pemeriksaan.
- **SBB Digital** — asesmen kebutuhan digital dan rencana tindakan bertahap.
- **Admin Demo** — kode akses, paket, konten, tampilan, integrasi, kebijakan fitur, audit log, dan ekspor data.

## Menjalankan lokal

Dengan Node.js 20 atau lebih baru, tanpa memasang dependensi:

```bash
npm run dev
```

Buka `http://localhost:4173`. Alternatifnya, sajikan folder `dist` melalui server HTTP statis:

```bash
python3 -m http.server 8080 --directory dist
```

Lalu buka `http://localhost:8080`.

Kode pelanggan demo: `SBB-DEMO-PRO-2026`. Tombol **Coba demo** tersedia pada layar masuk. Untuk admin, gunakan kode khusus admin yang sudah dipakai pada versi sebelumnya.

## Verifikasi

Jalankan seluruh pemeriksaan sebelum rilis:

```bash
npm run check
```

Perintah ini menjalankan uji logika, 18 skenario regresi penyimpanan/alur/offline, validasi statis, dan audit numerik kalkulator. Tidak ada dependensi npm yang perlu dipasang.

`audit.mjs` menguji 51 kalkulator dengan 12.750 skenario deterministik, termasuk rekonsiliasi pendapatan, biaya, laba, BEP, target volume, dan perubahan margin.

## Batas penggunaan

Hasil kalkulator adalah simulasi berdasarkan input pengguna. Hasil ini tidak menggantikan validasi pasar, pajak, perizinan, kondisi lokasi, atau konsultasi profesional. Login Google, validasi kode server, Cloudflare D1, pembayaran, dan email transaksional belum terhubung; panel integrasi menampilkan status tersebut secara eksplisit dan tidak meminta secret.

Versi produksi sebaiknya menggunakan Cloudflare Worker untuk API, D1 untuk hash kode/sesi/audit, Google OAuth dengan PKCE, dan GitHub Actions untuk deployment. Pembayaran perlu memakai akun penyedia yang memenuhi persyaratan usia dan badan usaha penyedia tersebut.

## Cloudflare

`wrangler.jsonc` menargetkan Worker `digital` dan menunjuk ke `dist` sebagai aset statis. Jika memakai Workers Builds, pilih repository `siapbukabisnis/digital`, branch `main`, root repository, build command `npm run check`, dan deploy command `npx wrangler deploy`.

Untuk deploy langsung dari komputer, jalankan dari folder proyek:

```bash
npx wrangler deploy
```

Jangan menaruh token GitHub, client secret Google, atau credential Cloudflare di kode frontend.
