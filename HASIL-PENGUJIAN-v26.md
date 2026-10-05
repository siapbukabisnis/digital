# Hasil pengujian SBB v26

Diuji pada 5 Oktober 2026. Pemeriksaan lokal lulus pada Node.js 24.19.0.

## Otomatis

- Uji logika seluruh modul.
- 26 skenario regresi memakai controller dan penyimpanan terisolasi: anggaran nominal, rupiah, konflik antar-tab, sesi, kegagalan simpan/pemulihan beberapa kunci, transaksi lama, tanggal, data contoh, profil digital, centang tindakan, checksum backup lama/baru, riwayat kesehatan, kode akses, data kalkulator rusak, serta cache/offline.
- Validasi statis: 299 ID unik, delapan rujukan aset utama, lima WebMCP tool, ekspor modul, sintaks JavaScript, dan manifest.
- Audit numerik: 51 kalkulator × 250 skenario = 12.750 skenario; termasuk rekonsiliasi omzet, biaya, laba, BEP, target volume, dan margin.
- Logo/ikon PNG dibandingkan dengan ZIP asal; byte tetap sama. Warna dasar dan sepuluh kunci penyimpanan dipertahankan.

## Browser

Preview lokal memakai data QA buatan, tanpa mengubah aplikasi produksi Cloudflare.

- Transaksi disimpan dan saldo/riwayat diperiksa.
- Pengetikan anggaran Rp975.000 tersimpan dengan fokus tetap pada kontrol berikutnya.
- SBB Start dan SBB Health dijalankan; simpan kesehatan dua kali tetap menyisakan satu pemeriksaan untuk periode yang sama.
- Kalkulator dijalankan, biaya ditambah, nama usaha diubah, dan reset dibatalkan; isian tetap tersimpan. Dialog reset tampil di layar utama.
- 26 pertanyaan digital pada profil pengujian diselesaikan; diagnosis dan rencana muncul.
- Centang tindakan bertahan saat berpindah halaman dan muat ulang.
- Satu kode demo dibuat dari admin; konten digital berhasil disimpan. Input Rp750.000 tidak lagi melanggar validasi browser.
- Perubahan sesi admin terlihat pada tab lain.
- Desktop serta ponsel diperiksa; pengukuran memperhitungkan scrollbar. Minimum lebar dan tinggi iframe kalkulator diperbaiki untuk layar kecil.
- Tidak ditemukan galat aplikasi pada alur yang diperiksa. Galat ekstensi browser dipisahkan dari galat aplikasi.

## Batas verifikasi

Pengujian tidak menjamin seluruh kemungkinan input/perangkat bebas bug. Deployment pada akun Cloudflare serta workflow jarak jauh belum dijalankan. Integrasi server/OAuth/pembayaran tetap demo lokal.

Tombol backup menjalankan ekspor dan menampilkan status. Browser pengujian tidak mengembalikan berkas unduhan, sehingga penyelesaian unduhan file melalui browser belum dapat diverifikasi. Serialisasi, checksum, kompatibilitas backup, serta impor/pemulihan data diuji otomatis dalam lingkungan terisolasi.

## Mengulang

```bash
npm run check
```

Untuk pemeriksaan browser, jalankan `npm run dev` dan gunakan data uji.
