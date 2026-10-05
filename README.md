# SBB — Siap Buka Bisnis · v26

Paket lengkap aplikasi untuk Cloudflare Worker **digital**. Folder `dist` berisi seluruh aplikasi. Logo, ikon, warna identitas, dan sepuluh kunci penyimpanan lama dipertahankan.

## Perbaikan v26

- Anggaran dan target tabungan dalam rupiah; saran kelebihan anggaran memakai nominal dan mendahulukan defisit aktual.
- Tempelan `1.000.000,00` terbaca benar. Pemisah ribuan, posisi kursor, fokus keyboard, dan klik pada kolom anggaran diperbaiki.
- Centang tindakan SBB Digital tersimpan saat navigasi, muat ulang, edit profil, serta backup. Kemajuan menunjukkan jumlah selesai.
- Admin dapat menyimpan konten digital dengan angka bawaan Rp750.000.
- Data dan sesi disinkronkan antar-tab. Penyimpanan mendeteksi tab lama agar tidak menimpa perubahan baru.
- Simpan kesehatan memperbarui satu pemeriksaan untuk usaha/sektor/periode yang sama. Profil dan riwayat disimpan bersama dengan pemulihan jika gagal.
- Reset kalkulator meminta konfirmasi yang terlihat pada layar utama; pembatalan mempertahankan isian.
- Kalkulator menangani bentuk data rusak, perubahan antar-tab, serta ukuran iframe ponsel tanpa gulir ganda.
- Kode non-Lifetime membutuhkan tanggal berlaku yang valid dan belum lewat.
- Cache v26, header pemeriksaan ulang aset, dan `version.json` disertakan.
- Workflow `deploy.yml` menargetkan Cloudflare Worker digital. GitHub Pages menjadi opsi terpisah.

Perbaikan v25 tetap disertakan: pemulihan simpan yang gagal, backup berintegritas, data contoh tanpa duplikasi, perlindungan tanggal/nominal, dan offline kalkulator.

## Isi aplikasi

| Modul | Fungsi |
| --- | --- |
| Atur Uang | Transaksi, tabungan, kalender, anggaran nominal, riwayat, tahunan, Excel/CSV |
| SBB Start | Tiga langkah kesiapan dana darurat/modal dan ide usaha |
| SBB Business | 51 kalkulator harga, margin, biaya, laba, BEP, dan target volume |
| SBB Health | Lima langkah pemeriksaan, skor, bukti, skenario, riwayat, dan tren |
| SBB Digital | Profil, pertanyaan adaptif, diagnosis, centang tindakan, rencana 90 hari, dan brief |
| Admin Demo | Kode, pengguna, paket, konten, visual, integrasi, kebijakan fitur, dan audit |

## Menjalankan dan menguji

Node.js 20 atau lebih baru. Aplikasi tidak memerlukan dependensi npm untuk dijalankan atau diuji.

```bash
npm run dev
```

Buka `http://localhost:4173`.

```bash
npm run check
```

Pemeriksaan mencakup uji logika, **26 skenario regresi**, validasi antarmuka/aset, dan **12.750 skenario numerik untuk 51 kalkulator**. Lihat **HASIL-PENGUJIAN-v26.md** untuk pengujian browser dan batas verifikasi.

## Cloudflare

Ekstrak ZIP dan gunakan seluruh isinya. Ikuti **PANDUAN-CLOUDFLARE-v26.md** untuk Worker `digital` atau **PANDUAN-UPDATE-v26.md** untuk unggah repository. Build command: `npm run check`. Deploy command: `npx --yes wrangler@4 deploy`. Direktori aset: `./dist`, sudah ditentukan di `wrangler.jsonc`.

Setelah deployment, buka `/version.json` pada alamat aplikasi; nomor versi harus **26.0.0**. Simpan backup sebelum pembaruan. Gunakan domain dan profil browser yang sama untuk membaca data lokal lama. Jangan menghapus data situs sebagai langkah pembaruan.

## Status integrasi

Aplikasi ini memakai penyimpanan lokal dan mendukung offline. Google login, peran/kode admin, serta lisensi masih demo lokal. API autentikasi server, D1, pembayaran, dan email transaksional belum terhubung. Konfigurasi publik di panel integrasi tidak otomatis mengaktifkan layanan tersebut. Secret tidak boleh dimasukkan ke frontend.
