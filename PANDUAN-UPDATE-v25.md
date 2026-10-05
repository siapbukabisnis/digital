# Memasang SBB v25

Paket ini memuat seluruh aplikasi, lima modul, 51 kalkulator, pengujian, dan alur GitHub. Logo, ikon, warna identitas, sepuluh kunci penyimpanan, serta backup v1/v2 tetap kompatibel.

## Mengunggah ke GitHub

1. Ekstrak `SBB-Siap-Buka-Bisnis-v25-GitHub.zip`.
2. Unggah **isi hasil ekstraksi** ke root repository: `README.md`, `package.json`, skrip pemeriksaan, folder `dist`, dan folder workflow `.github`. Jangan hanya mengunggah file ZIP.
3. Pastikan folder workflow ikut terunggah. Aktifkan tampilan berkas tersembunyi pada komputer jika folder tersebut tidak terlihat.
4. Commit perubahan. Workflow **Periksa SBB** menjalankan semua pemeriksaan pada Node.js 20, 22, dan 24.

ZIP berada langsung pada root proyek sehingga tidak perlu memindahkan folder aplikasi lain. Berkas data pribadi dan fixture pengujian tidak disertakan.

## Menampilkan aplikasi dengan GitHub Pages

1. Buka repository → **Settings → Pages**.
2. Pada **Build and deployment**, pilih **Source: GitHub Actions**.
3. Buka **Actions → Terbitkan SBB ke GitHub Pages → Run workflow** dan pilih branch yang memuat paket ini.
4. Setelah pemeriksaan dan deployment berhasil, buka URL pada hasil deployment.

Workflow menerbitkan hanya folder `dist`. Aset, iframe kalkulator, manifest, dan service worker menggunakan jalur relatif sehingga mendukung alamat `https://nama.github.io/nama-repository/`. Publication dilakukan saat workflow dijalankan; mengunggah kode saja belum menyalakan situs.

Dokumentasi resmi: [GitHub Actions untuk Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs) dan [workflow GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Memperbarui aplikasi lama tanpa kehilangan data

1. Unduh **Backup data SBB** dari aplikasi lama dan simpan file tersebut.
2. Untuk hosting yang sudah ada, ganti seluruh isi aplikasi yang disajikan dengan **seluruh isi `dist`** dari paket baru. Sertakan subfolder `business`, semua modul, CSS, service worker, dan gambar.
3. Buka melalui HTTP/HTTPS pada domain, browser, dan profil yang sama. Muat ulang halaman; cache v25 akan dipasang tanpa menghapus transaksi.
4. Periksa setiap modul. Jika pindah domain atau perangkat, impor file backup melalui pengelolaan data dan konfirmasi penggantian data.

Data berada pada browser, bukan dalam ZIP. Jangan menghapus data situs untuk memasang pembaruan. GitHub Pages pada domain baru membutuhkan impor backup. Pengaturan warna, logo, dan konten yang sudah dikustomisasi melalui Admin tetap dihormati.

Anggaran lama yang menggunakan persentase tetap dihitung seperti sebelumnya. Ketika batas kategori atau target tabungan diubah, nominal rupiah tersebut menjadi nilai tetap dan tidak berubah saat pendapatan berubah.

## Pemeriksaan lokal

Diperlukan Node.js 20 atau lebih baru. Tanpa memasang dependensi:

```bash
npm run check
npm run dev
```

Buka `http://localhost:4173` dan klik **Coba demo**. Jangan membuka `index.html` langsung sebagai file lokal.

## Status integrasi

Login, kode akses, dan Admin masih merupakan demo lokal. Google OAuth, database server, pembayaran, dan email membutuhkan backend terpisah. Paket GitHub Pages menyajikan aplikasi statis beserta penyimpanan lokalnya.
