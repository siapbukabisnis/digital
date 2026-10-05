# SBB v25 pada Cloudflare Workers

Paket ini disesuaikan untuk Worker **digital** dan repository **siapbukabisnis/digital**, sesuai screenshot proyek Cloudflare. File `wrangler.jsonc` memakai `name: digital` dan menyajikan folder `dist`.

Ini adalah aplikasi statis lengkap dengan penyimpanan lokal. Lima modul, logo, warna, kunci penyimpanan, dan perbaikan bug v25 tetap sama.

## Melalui repository GitHub yang tertera di Cloudflare

1. Unduh backup data pengguna dari aplikasi lama.
2. Ekstrak ZIP. Unggah **seluruh isi hasil ekstraksi** ke root repository `siapbukabisnis/digital`, branch `main`. Pastikan `package.json`, `wrangler.jsonc`, semua skrip pengujian, dan folder `dist` ikut terunggah. File ZIP saja tidak akan menjadi aplikasi.
3. Pada Cloudflare, buka **Workers & Pages → digital → Settings → Builds** (pada beberapa tampilan disebut **Build**).
4. Jika repository belum terhubung, klik **Connect** dan pilih `siapbukabisnis/digital`. Jika sudah terhubung, periksa pengaturannya tanpa membuat proyek baru.
5. Gunakan pengaturan berikut:

| Pengaturan | Nilai |
| --- | --- |
| Worker | `digital` |
| Repository | `siapbukabisnis/digital` |
| Production branch | `main` |
| Root directory | Root repository (`/`, atau kosong jika default root) |
| Build command | `npm run check` |
| Deploy command | `npx wrangler deploy` |

6. Simpan pengaturan dan commit/push perubahan ke branch `main`. Workers Builds yang telah terhubung akan menjalankan pemeriksaan dan deployment.
7. Periksa hasil pada **Deployments / View build history**. Build yang berhasil saja belum membuktikan halaman bisa dibuka jika alamat Worker masih dinonaktifkan.

Nama Worker pada konfigurasi harus sama dengan nama proyek Cloudflare. Paket ini sudah memakai `digital`; konfigurasi sebelumnya memakai `sbb-finance`.

## Mengaktifkan alamat aplikasi

Pada screenshot, statusnya **No URLs enabled** dan **workers.dev: Disabled**, dengan custom domain dan routes kosong.

1. Buka tab **Domains** di proyek `digital`.
2. Pada `workers.dev`, aktifkan **Enable** jika ingin menggunakan alamat Worker tersebut untuk membuka aplikasi.
3. Buka alamat yang tertera setelah diaktifkan. Bila memakai custom domain, gunakan domain yang telah dipasang untuk aplikasi.

Mengaktifkan alamat memungkinkan aplikasi diakses melalui URL tersebut. Untuk membatasi akses pengunjung, atur Cloudflare Access sesuai kebutuhan.

## Jika tetap ingin deploy langsung dari komputer

Ekstrak paket dan buka terminal pada folder yang berisi `wrangler.jsonc`. Diperlukan Node.js/npm yang mendukung Wrangler:

```bash
npm run check
npx wrangler login
npx wrangler deploy
```

Pilih akun Cloudflare yang memiliki Worker `digital`. Perintah ini menargetkan Worker bernama `digital`; GitHub tidak diperlukan untuk jalur ini. Dashboard Cloudflare tetap digunakan untuk mengecek alamat/domain dan hasil deployment.

## Data lama

Gunakan domain, browser, dan profil yang sama untuk membaca penyimpanan lama. Jika berpindah alamat, impor backup data. Jangan menghapus data situs/browser sebagai langkah pembaruan.

## Dokumentasi resmi

- [Menghubungkan Worker yang sudah ada ke GitHub](https://developers.cloudflare.com/workers/ci-cd/builds/)
- [Konfigurasi build dan deployment](https://developers.cloudflare.com/workers/ci-cd/builds/configuration/)
- [Tab Domains untuk alamat dan routing](https://developers.cloudflare.com/changelog/post/2026-05-14-domains-tab/)
