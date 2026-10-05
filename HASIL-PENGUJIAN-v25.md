# Hasil pemeriksaan SBB v25

Tanggal pemeriksaan: 5 Oktober 2026.

| Pemeriksaan | Hasil |
| --- | --- |
| Logika keuangan, kesiapan, kesehatan, digital, ekspor, lisensi, dan backup | Lulus (`tests.mjs`) |
| Regresi penyimpanan, alur pengguna, dan service worker | 18 skenario lulus (`regression-tests.mjs`) |
| Import JavaScript, referensi elemen, aset, manifest, dan kelengkapan modul | Lulus: 299 ID unik, 8 referensi aset, 5 WebMCP tool |
| Perhitungan 51 kalkulator | 12.750 skenario numerik lulus |
| Respons HTTP dan tipe konten | 8 endpoint utama lulus; akses keluar folder aplikasi ditolak |
| Logo dan ikon aplikasi | 6 berkas PNG identik byte demi byte dengan paket asli |
| Warna dasar dan penyimpanan lama | Warna asli dan 10 kunci penyimpanan dipertahankan |
| Workflow GitHub | Struktur YAML valid; workflow publikasi dijalankan manual |
| Tampilan desktop dan ponsel v25 | Belum diverifikasi ulang; akses browser pengujian terhambat oleh kapasitas peninjauan otomatis |

## Regresi yang diuji

Pengujian menggunakan modul dan controller aplikasi yang sebenarnya dengan penyimpanan terisolasi. Service worker diuji dengan scope subfolder seperti GitHub Pages, respons HTTP, cache, dan simulasi koneksi offline.

- Data pengaturan/sesi/admin rusak tidak menghentikan inisialisasi.
- Anggaran nominal tetap sama saat pendapatan berubah; anggaran persentase lama tetap terbaca.
- Tanggal tidak valid, transaksi masa depan, nominal pecahan, dan angka tak hingga ditolak.
- Kegagalan penulisan satu kunci penyimpanan mengembalikan data dan saldo sebelumnya.
- Batas transaksi baru tidak menghapus catatan lama, dan catatan lama tetap bisa diedit.
- Memuat contoh dua kali tidak menggandakan data atau menimpa contoh yang telah diedit.
- Contoh pada bulan masa depan tidak menambah transaksi ke bulan berjalan.
- Penggantian nama kategori mempertahankan nominal anggaran dan relasi transaksi.
- Mengedit profil digital serta memuat ulang mempertahankan jawaban dan pertanyaan berikutnya.
- Backup profil kosong tetap kosong; backup v1/v2 kompatibel dan perubahan isi terdeteksi.
- Impor backup yang gagal memulihkan seluruh penulisan sebelumnya.
- Membatalkan dialog setelah persetujuan sebelumnya tidak menjalankan penghapusan.
- ID/catatan dari backup di-escape pada tabel transaksi.
- Sesi kedaluwarsa, peran tidak valid, tanggal lisensi tidak valid, dan kode dicabut ditangani.
- Angka kesehatan tidak valid tidak menghasilkan skor tidak valid.
- WebMCP memerlukan sesi, memvalidasi input, dan melaporkan kegagalan simpan.
- Kegagalan simpan kalkulator mempertahankan data sebelumnya dan menampilkan status draf.
- Offline tetap membuka kalkulator yang benar, respons gagal tidak mengganti cache sehat, dan cache aplikasi lain tidak dihapus.

## Menjalankan kembali

```bash
npm run check
```

Workflow **Periksa SBB** menjalankan perintah yang sama setelah kode diunggah ke GitHub. Hasil workflow belum dapat dijalankan pada repository pengguna sebelum paket diunggah.

Untuk verifikasi tampilan, jalankan `npm run dev`, buka aplikasi pada desktop dan ponsel, lalu periksa kelima modul, perubahan anggaran, navigasi keyboard/menu, serta dialog batal. Temuan otomatis sudah diperbaiki; daftar pengujian ini tidak menyatakan bahwa seluruh kemungkinan bug pada semua browser telah terbukti tidak ada.
