# Project Rules & Instructions — Discord Mobile App

## 📌 Acuan Utama & Mutlak (Primary Absolute Rule)
1. **Setiap ada instruksi tambahan, langsung catat ke `.agents/RULES.md` dan jadikan file instruksi itu sebagai acuan utama dan mutlak selalu benar.**
2. **File `ai-anti-patterns.md` adalah SUMBER UTAMA & MUTLAK di seluruh sesi percakapan dan proyek: Dilarang membuat badge/tag/pill tanpa perintah eksplisit, dan dilarang membuat komponen apa pun di luar instruksi (WAJIB HANYA membuat komponen yang secara spesifik disebutkan dalam instruksi).**

---

## 📝 Log Instruksi Tambahan (Project Instructions Record)
*Catat setiap instruksi baru dari user di bawah ini secara kronologis:*

- **[2026-10-12] Inisialisasi Proyek Mobile Discord App**:
  - **Spesifikasi Stack**:
    * Frontend: React.js (React 19)
    * Styling: Tailwind CSS
    * Language: TypeScript 7 (v7.0.2)
    * Bundler: Vite (v8)
    * Smooth Scroll / Physics: Lenis
    * Motion: Framer Motion
  - **Design Guidelines & Skills**:
    * `/premium` (Apple-inspired precision, tactile feedback, typography scale, 8pt grid)
    * `/impeccable` (Production-grade craft, mode Operate, zero shortcuts)
    * `/ui-ux-pro-max` (Design intelligence, accessibility WCAG 2.2 AA, mobile ergonomics, 44x44px touch targets)
    * Discord Design System MD (`DESIGN.md`)
  - **Asset & Media Sumber**:
    * Local Asset Path: `/home/fatihfarhat/Downloads/discord asset` (disalin ke `src/assets/discord` dan `public/discord-assets`)
    * Figma URL: `https://www.figma.com/design/PDTzEvCwsI2WfehTMzjn5a/Discord-assets--icons-and-images---Community-?t=tzw0EdEb9dlwWThO-0`
    * Splash Screen: `https://i.redd.it/lufiuaku68361.gif` (disimpan di `public/splash/splash.gif` & `src/assets/splash.gif`)
  - **Status Halaman Awal**:
    * Halaman kosong bersih (clean/minimal mobile canvas shell) sesuai aturan anti-patterns (tidak membuat badge/tag/pill/komponen tanpa perintah).
  - **Jaringan & Server**:
    * Mengaktifkan server pada `localhost` dan `localhost network` (host `0.0.0.0`).

- **[2026-10-12] Arsitektur Aplikasi Discash & Spesifikasi Header + Splash Screen**:
  - **Konsep Produk (Discash)**:
    * Fungsi utama: Pencatatan tabungan / celengan untuk target/goals tertentu (Piggy bank / Savings goal tracker).
    * Mata uang: IDR (contoh penulisan: `IDR 20,000`).
    * Bahasa UI aplikasi: English (seluruh label, pesan, dan teks dalam bahasa Inggris).
    * Manajemen Goals: Tambah, edit, dan hapus goals.
    * Struktur Data Goal: Nama goal, icon goal (bisa memilih dari icon set referensi atau upload custom foto), target IDR goal, progress bar dengan persentase (%), fitur arsip (archive goal), dan sematkan (pin goal).
    * Mutasi & Transaksi: Fitur tambah pemasukan ke goal tertentu. Setiap mutasi wajib memiliki catatan (*note*), serta riwayat mutasi/transaksi dapat diedit dan dihapus.
    * Dasbor Analitik: Menampilkan statistik total goals, total IDR terkumpul, dan distribusi alokasi budget.
    * Desain & Aset: Seluruh komponen UI custom mengikuti Discord Design Tokens (`DESIGN.md`), icon set dari folder referensi (`src/assets/discord`), dan tipografi khas Discord (`gg sans`).
  - **Splash Screen (Reload / Initial Load)**:
    * Saat aplikasi dimuat/direload: Menampilkan animasi splash loading layar penuh (*full screen*) menggunakan GIF yang disediakan (`/splash/splash.gif`).
    * Background splash disesuaikan persis dengan warna background GIF yaitu `#000000` (Pure Black).
    * Transisi fade out yang halus setelah loading selesai menuju tampilan utama.
  - **Fokus Tahap Sekarang (WAJIB DIPATUHI - STAGE LIMITATION)**:
    * **HANYA membuat Header saja dulu**, sifatnya sticky di bagian atas (`sticky top-0`).
    * Elemen Header:
      - Sisi kiri: Logo Discord.
      - Di samping logo: Teks **"Discash"** berbobot bold / heavy menggunakan font khas logo Discord.
      - Warna teks: **Dilarang pure putih (`#ffffff`)**, gunakan warna off-white Discord yang nyaman (`#E0E1E5` / `#DBDEE1`).
    * **PANTANGAN KETAT (`ai-anti-patterns.md`)**: Dilarang membuat badge/tag/pill tanpa perintah, dan DILARANG membuat komponen apa pun di luar Header dan Splash Screen yang diminta pada tahap ini.

- **[2026-10-12] Pembuatan Bottom Navigation Bar (Navbar Bawah)**:
  - **Karakteristik & Posisi**:
    * Sederhana (simple) dan posisinya di bagian bawah layar mobile (sticky / fixed bottom on top of safe area).
    * Background konsisten dengan Discord surface (`#1E1F22` / `#232428`) dengan border atas halus.
  - **Elemen & Tombol Navigasi**:
    * Seluruh tab menggunakan **icon saja** (tanpa text label di luar icon).
    * Susunan 5 tombol simetris: `[Dashboard]` `[Goal]` `[CTA +]` `[User Profile]` `[Settings]`.
    * Di bagian tengah terdapat **CTA bulat warna ungu Discord (`#5865F2` Blurple) dengan icon plus (`+`)**.
  - **Aturan Warna State Icon**:
    * **Nonactive**: Warna putih transparan (`rgba(255, 255, 255, 0.45)` / `text-white/45`).
    * **Active**: Warna putih bersih (`#FFFFFF` / `text-white`).
    * **CTA Tengah**: Bulat ungu Discord (`#5865F2`), hover/active state interaktif, icon plus warna putih.
    * **Posisi CTA**: Posisi tombol plus dinaikkan ke atas (elevated floating button / menonjol keluar di atas batas navbar) dengan border atau ring yang kontras dan bayangan tegas.

- **[2026-10-12] Perancangan Dasbor — Kartu Total IDR (Paling Atas)**:
  - **Letak & Hirarki**: Berada di posisi paling atas pada area konten Dasbor (`main`).
  - **Fungsi & Konten**: Menampilkan total saldo akumulasi celengan dalam format mata uang IDR (misal: `IDR 24,500,000`).
  - **Desain & Gaya**:
    * Mengikuti estetika kartu Discord (`bg-[#2B2D31]` / border `#1F2023]/60` atau `#232428`).
    * Label teks rapi, angka nominal besar tegas (`font-black` / `font-extrabold text-[#E0E1E5]` / off-white Discord).
    * Menggunakan format mata uang IDR standar Indonesia.
  - **Kepatuhan Anti-Patterns**: WAJIB HANYA membuat kartu Total IDR di paling atas, dilarang menambahkan badge, tag, pill, atau kartu statistik/grafik lain di luar perintah.
  - **Inisialisasi Nilai Saldo (Zero State)**:
    * Total IDR tidak di-hardcode ke angka dummy/contoh.
    * Nilai saldo awal wajib dimulai dari 0 (`IDR 0`) karena belum ada data goals atau mutasi tabungan yang tercatat.

- **[2026-10-12] Pembuatan Halaman Goals & Empty State**:
  - **Letak & Navigasi**: Muncul saat tab `goal` aktif di bottom navbar.
  - **Kondisi Empty State**:
    * Jika belum ada data goal (`goals.length === 0`), menampilkan tampilan **Empty State** khas Discord.
    * Bahasa UI: Bahasa Inggris (e.g. Title: "No Goals Yet", Description: "Tap the + button to create your first savings goal").
    * Menggunakan icon / ilustrasi referensi Discord dengan latar belakang bersih.
    * Kepatuhan Anti-Patterns: Dilarang keras menambahkan badge, tag, pill, atau tombol/elemen yang tidak diinstruksikan.
    * **Aturan Mutlak Icon Empty State**:
      - **DILARANG KERAS membungkus icon empty state dengan box/container/lingkaran background**. Icon harus berdiri sendiri secara bebas (*naked icon / free-standing*).
      - **DILARANG KERAS menggunakan warna ungu** pada icon empty state. Gunakan warna netral/muted (misal `#949BA4`, `#4E5058`, atau `#80848E`).

- **[2026-10-12] Animasi Skeleton Loading Antar Tab**:
  - **Pemicu**: Aktif secara otomatis setiap kali pengguna berpindah tab (`tab switch` antar Dashboard, Goal, Profile, Settings).
  - **Durasi & Feel**: Singkat, responsif, dan tactile (sekitar 350ms - 400ms) memberikan efek transisi loading yang mulus (*snappy native mobile feel*).
  - **Desain & Warna**:
    * Menggunakan palet Discord gelap (`bg-[#2B2D31]` / `bg-[#1E1F22]`) dengan efek pulsa/shimmer (`animate-pulse`).
- **[2026-10-12] Gestur Swipe & Animasi Slide Transisi Tab**:
  - **Interaksi Swipe**:
    * Pengguna dapat berpindah tab secara horizontal menggunakan gestur sentuhan/geser (*swipe gesture* ke kiri atau kanan).
    * Geser ke kiri (*swipe left*) menuju tab berikutnya: `Dashboard` → `Goal` → `User Profile` → `Settings`.
    * Geser ke kanan (*swipe right*) menuju tab sebelumnya: `Settings` → `User Profile` → `Goal` → `Dashboard`.
    * Deteksi swipe presisi tanpa mengganggu scrolling vertikal halaman.
  - **Animasi Slide**:
    * Transisi perpindahan halaman/konten menggunakan animasi **slide horizontal** yang mulus (*directional slide with Framer Motion*).
    * Mengadaptasi arah slide secara alami: maju (masuk dari kanan ke kiri), mundur (masuk dari kiri ke kanan).
    * **Tanpa Delay Antar Transisi (Immediate Slide)**: Tidak menggunakan `mode="wait"` atau delay buatan; saat tab lama bergeser keluar, tab baru langsung bergeser masuk secara simultan/seketika (*push & slide together*).

- **[2026-10-12] Pembuatan Halaman Account Profile**:
  - **Letak & Navigasi**: Ditampilkan saat tab `profile` aktif di bottom navbar.
  - **Spesifikasi & Detail Akun**:
    * Nama: `Fatih Farhat`
    * Username: `@zerotwenty`
    * Bio: `Un poco loco`
    * Email: `kazokuhairy@mail.com`
    * Telepon: `(+62) 821-1150-0190`
    * Member Since: `Jun 14, 2018`
    * Status: `Nitro` (disertai logo/icon Nitro resmi di samping nama Fatih).
    * Banner: Discord profile banner di bagian atas (dark Discord banner theme).
    * Avatar: Gambar Wumpus (`https://images.squarespace-cdn.com/content/v1/5d237c57b1d9a000014bd477/53a4109d-dcaf-4f22-8f36-da04e510a8f3/NW_PointRight_1080.png` disimpan lokal di `/wumpus.png`).
    * Desain & Warna: 100% mengikuti token Discord design system (`bg-[#313338]`, panel kartu `#2B2D31` / `#1E1F22`, teks `#E0E1E5` dan `#949BA4`).
  - **ATURAN MUTLAK LAYOUT & CONTAINER (NO BOX IN BOX)**:
    * **DILARANG KERAS membuat box di dalam box (nested box / card inside card).**
    * Detail profil akun (About Me, Member Since, Email, Phone) tidak boleh dibungkus dalam container/box terpisah di dalam kartu profil; seluruh teks dan pemisah harus menyatu langsung pada permukaan utama tanpa inner box.
  - **Asset Spesifik Profil Akun**:
    * **Icon Nitro**: Wajib menggunakan asset SVG resmi Discord Ruby badge (`<img alt="Ruby" src="/assets/2801bd9ef48c1d87.svg" />`).
    * **Icon Idle Avatar**: Wajib menggunakan elemen SVG mask resmi Discord status idle (`<rect width="16" height="16" x="60" y="60" fill="#ffc04e" mask="url(#svg-mask-status-idle)" />`).
    * **Banner Profil**: Menggunakan animasi Wumpus GIF (`https://freight.cargo.site/w/500/q/75/i/G2809482621877646987794935190866/Discord_Wumpus_Flex_2x.gif` disimpan lokal di `/banner.gif` dan `src/assets/banner.gif`). Banner memenuhi area header banner profil akun dengan `object-cover`.
    * **Avatar Wumpus Closeup**: Gambar avatar Wumpus di-zoom in (closeup) lebih dekat ke bagian kepala Wumpus (scale ~1.45x, transform-origin 50% 35%).
    * **Outline Stroke Avatar**: Lingkaran avatar diberi outline stroke/ring tebal khas Discord (`ring-[6px] ring-[#2B2D31]` dengan background `#2B2D31`) untuk memberikan batas pemisah yang jelas dan tegas antara lingkaran avatar dengan banner.
    * **Avatar Decoration (Sinkronisasi Frame Statis & Animasi)**: Gambar statis (`.../static`, lokal: `/avatar-decoration-static.png`) secara identik merupakan Frame 0 (bit-exact 0.0000 diff) dari 60 frame urutan animasi (`.../animated`). Siklus animasi dijalankan secara frame-accurate via canvas spritesheet lossless (`/decoration-spritesheet.webp`) pada 12 FPS: animasi menyelesaikan 1 putaran penuh (frame 0 ke frame 59) dan mendarat secara alami tepat di Frame 0 (pose statis) tanpa lompatan frame (zero snap/glitch), berhenti diam selama jeda 3 detik, lalu melanjutkan siklus berputar kembali secara mulus.
    * **Foto Avatar Kustom (Fatih Farhat)**: Avatar profil diganti menggunakan foto asli pengguna yang diunggah (disimpan di `/avatar.png` dan `src/assets/avatar.png`) dengan framing terpusat pada wajah (`object-cover object-[53%_46%] scale-[1.1]`).

- **[2026-10-12] Fungsionalitas Aplikasi & Panel Sheet Pembuatan Goal Baru (New Goal Sheet)**:
  - **Pemicu (Trigger)**:
    * Ketika pengguna menekan tombol plus (`+`) ungu Discord Blurple (`#5865F2`) pada bottom navbar, membuka **Sheet Panel** dari bawah yang menutup seluruh latar belakang aplikasi.
  - **Karakteristik & Animasi Sheet Panel**:
    * Muncul dari bawah (*slide up from bottom*) menutupi latar (*fullscreen backdrop overlay*).
    * Di bagian atas sheet terdapat **drag handler panel** yang dapat di-drag/swipe ke bawah untuk menutup sheet (*dismissible drag handle*).
    * Animasi keluar dan masuk sheet menggunakan kurva halus *ease-in-out* (`ease: [0.16, 1, 0.3, 1]`).
  - **Form Input Pembuatan Goal**:
    * **Nama Goal**: Otomatis memformat huruf besar di awal kata (*Title Case / Capitalize each word*) saat pengguna mengetik.
    * **Deskripsi**: Bersifat opsional (*optional field*).
    * **Target Budget**: Nominal IDR numerik yang diformat dengan jelas (mata uang Rupiah).
    * **Icon Picker / Upload Custom Photo**: Default menggunakan icon goal (*target icon*). Pengguna dapat memilih icon dari koleksi preset atau mengunggah custom photo sendiri dari perangkat.
  - **Tombol Aksi Sticky di Bawah**:
    * Tombol **Batal** (*Cancel*) dan **Simpan** (*Save Goal*) disusun dalam **satu baris (row)** yang sifatnya **sticky di bagian bawah sheet** (*sticky bottom action bar*).
  - **Kepatuhan Anti-Patterns**:
    * Dilarang membuat badge, tag, pill tanpa perintah.
    * Dilarang membungkus form di dalam box ganda (`RULE: jangan buat box di dalam box`). Seluruh input menyatu langsung di atas permukaan panel sheet Discord (`#2B2D31`).

- **[2026-10-12] Panel Sheet Detail Goal (Bukan Halaman Full), Mutasi Dana (Tambah/Kurang), Edit, Hapus, & Riwayat Transaksi**:
  - **Pemicu (Trigger)**:
    * Ketika pengguna men-tap kartu goal pada daftar Goal, **membuka Panel Sheet dari bawah** (disamakan dengan gaya bottom sheet panel, drag handler di atas, backdrop gelap, animasi kurva halus *ease-in-out*). Bukan berpindah halaman penuh (*not a full page, but a bottom sheet modal*).
  - **Konten & Fitur di Panel Sheet Detail Goal**:
    * **Header & Info Goal**:
      - Drag handler di bagian paling atas (tarik ke bawah untuk menutup).
      - Icon/foto goal, judul goal, deskripsi (jika ada).
      - Progress bar, persentase (%), saldo terkumpul (*current amount*), dan target budget (*target amount*).
      - Tombol **Edit Goal** dan tombol **Delete Goal** (Hapus dengan konfirmasi).
    * **Tombol Tambah & Kurang Budget (Deposit & Withdraw via Dedicated Sheet Baru)**:
      - Tombol **+ Add Funds** (Tambah saldo) dan **- Withdraw** (Kurang saldo).
      - **WAJIB membuka SHEET BARU (Bottom Sheet Panel terpisah/baru)** dari bawah, bukan accordion/inline di dalam sheet detail.
        - Sheet baru memiliki drag handler di atas untuk swipe-down dismiss, kurva animasi halus ease-in-out, backdrop overlay, input nominal IDR, input catatan opsional (*note* - tidak mandatory), dan tombol aksi sticky di bawah.
      - Mengupdate saldo goal secara realtime (tidak boleh minus < 0).
    * **Riwayat Record Mutasi / Transaksi (Transaction History)**:
      - Menampilkan daftar mutasi transaksi untuk goal tersebut secara kronologis.
      - Setiap mutasi menampilkan tipe (+ Tambah / - Kurang), nominal IDR, catatan (*note*), dan waktu transaksi.
      - Fitur hapus catatan mutasi (mengembalikan saldo terkait).
    * **Edit Goal Modal/View**:
      - Mengedit nama (Title Case), deskripsi, target budget, dan icon/foto.
  - **Kepatuhan Anti-Patterns Mutlak**:
    * DILARANG membuat badge/tag/pill tanpa perintah eksplisit.
    * DILARANG membuat box di dalam box (*no nested box inside box*). Seluruh elemen menyatu langsung di atas surface Discord (`#2B2D31`).
    * Icon empty state riwayat transaksi berdiri bebas tanpa container dan tanpa warna ungu.

- **[2026-10-12] SELURUH SHEET PANEL KELUAR MASUK WAJIB PAKAI ANIMASI (MURNI SLIDE, TANPA OPACITY / FADING)**:
  - Seluruh panel sheet dalam aplikasi (`NewGoalSheet`, `GoalDetailSheet`, `GoalMutationSheet`, dan modal/dialog lainnya) **WAJIB menggunakan animasi dua arah murni fisik pergeseran vertikal tanpa fading**:
    * **TIDAK ADA ANIMASI FADING / OPACITY 0>1 ATAU 1>0**: Dilarang keras memberikan animasi opacity pada container atau panel sheet. Panel sheet selalu berbobot opacity penuh (solid).
    * **Animasi Masuk (Enter)**: Murni bergeser meluncur dari bawah (*pure slide up*: `y: '100%'` -> `y: 0`) dengan kurva halus ease-in-out (`[0.32, 0.72, 0, 1]` / `[0.42, 0, 0.58, 1]`).
    * **Animasi Keluar (Exit)**: Murni bergeser meluncur kembali ke bawah (*pure slide down*: `y: 0` -> `y: '100%'`).
  - **Arsitektur Teknis Framer Motion**:
    * Animasi panel sheet dikonfigurasi murni pada sumbu `y` (`initial={{ y: '100%' }}`, `animate={{ y: 0 }}`, `exit={{ y: '100%' }}`) tanpa properti `opacity`.
    * Data objek (`goal`, `type`, dsb) tetap dicache selama siklus exit animation berlangsung (menggunakan `useRef` fallback cache) agar komponen tidak merender `null` sebelum animasi keluar selesai.

- **[2026-10-12] Backdrop Seluruh Sheet Cukup Gelap Saja (DILARANG DIBUAT BLUR)**:
  - Saat sebuah sheet panel terbuka (`NewGoalSheet`, `GoalDetailSheet`, `GoalMutationSheet`, dan seluruh modal sheet):
    * Backdrop overlay **cukup gelap saja** (misal: `bg-black/75` atau `bg-black/70`).
    * **DILARANG KERAS dibuat blur**: Hapus seluruh class `backdrop-blur-*` (seperti `backdrop-blur-sm`, `backdrop-blur-md`, dll.) pada backdrop sheet. Latar belakang di balik sheet hanya digelapkan secara bersih tanpa efek blur.

- **[2026-10-12] Efek Skala Mengecil Layar Utama saat Sheet Terbuka (Scale-Down Background)**:
  - Ketika ada panel sheet yang terbuka (`isNewGoalSheetOpen` atau `isGoalDetailOpen`), layar utama aplikasi di latar belakang (*main app screen container*):
    * Mengecil sedikit secara proporsional (*scale down*, misal: `scale: 0.94` atau `scale: 0.95`, dan sedikit bergeser ke bawah atau tetap di tengah/atas).
    * Memiliki sudut melengkung halus saat mengecil (misal `rounded-2xl` atau `rounded-3xl`) dengan transisi kurva halus ease-in-out (`duration: 0.35`, ease `[0.32, 0.72, 0, 1]`) yang selaras dengan gerakan slide sheet.
    * Ketika seluruh sheet ditutup, layar utama kembali secara mulus ke skala normal (`scale: 1`).

- **[2026-10-12] Optimasi Performa Animasi 60+ FPS (Hardware GPU Acceleration)**:
  - **Larangan Animasi CPU Layout Properties**:
    * **Dilarang menganimasikan `borderRadius` via JavaScript / Framer Motion animate loop** pada container besar karena memaksa browser melakukan recalculate clipping mask dan CPU repaint 60 kali per detik (penyebab drop frame ke ~20 FPS).
    * `rounded-2xl` / `rounded-3xl` wajib didefinisikan secara statis pada CSS dengan `overflow-hidden`.
  - **Akselerasi GPU Compositor**:
    * Wajib menggunakan `transform-gpu will-change-transform` pada container dan seluruh panel sheet agar browser memisahkan layer ke dedicated GPU texture memory.
    * Animasi murni dilakukan pada GPU composited properties (`transform: scale, translateY`).
    * Nilai koordinat translasi sumbu `y` pada state aktif menggunakan angka murni (`y: 0`, `y: 12`) tanpa mencampur format string persen di tengah animasi aktif.
    * Hindari konfigurasi touch-hijacking seperti `syncTouch: true` pada Lenis yang membebani main thread.

- **[2026-10-12] Statistik Dasbor: Total Goals & Distribusi Budget**:
  - Pada tab Dashboard (`activeTab === 'dashboard'`), tambahkan statistik analitik di bawah kartu Total Savings:
    1. **Total Goals**: Menampilkan ringkasan total goal aktif (misal: jumlah goals, completed vs in-progress).
    2. **Budget Distribution (Distribusi Budget)**: Menampilkan breakdown proporsi alokasi budget/dana antar goal (misal persentase atau bar distribusi alokasi masing-masing goal).
  - **Desain & Kepatuhan Anti-Patterns Mutlak**:
    * Mengikuti estetika Discord tokens (`bg-[#2B2D31]`, border `#1F2023]/80`, font khas Discord).
    * DILARANG membuat box di dalam box (*no nested box inside box*). Seluruh baris menyatu langsung di atas surface Discord.
    * DILARANG membuat badge/tag/pill tanpa perintah eksplisit.
    * Tidak menggunakan warna ungu pada icon empty state.
    * Seluruh label teks menggunakan Bahasa Inggris (English UI).

- **[2026-10-12] Implementasi Progressive Web App (PWA)**:
  - **Identitas & Konfigurasi Manifest**:
    * Nama Aplikasi: `Discash`
    * Short Name: `Discash`
    * Deskripsi: `Discord-inspired savings goal tracker & piggy bank.`
    * Start URL: `/`
    * Display: `standalone`
    * Orientation: `portrait`
    * Theme Color: `#1E1F22` (Discord header & navbar background tone)
    * Background Color: `#111214` (Discord deepest dark tone)
  - **Asset Icon PWA**:
    * Icon representatif beresolusi tinggi (192x192, 512x512, apple-touch-icon, maskable).
  - **Service Worker & Offline Support**:
    * Registrasi service worker otomatis untuk precaching core assets (HTML, CSS, JS, font, icon).
    * Dukungan offline caching runtime untuk pengalaman layaknya native mobile app.
  - **Mobile Web App Meta Tags**:
    * `mobile-web-app-capable: yes`, `apple-mobile-web-app-capable: yes`, `apple-mobile-web-app-status-bar-style: black-translucent`.

- **[2026-10-12] Build Aplikasi Menjadi Android APK**:
  - **Spesifikasi & Konfigurasi Build**:
    * Target Platform: Android
    * Format Output: Android Application Package (`.apk`)
    * Package ID / Application ID: `com.discash.app`
    * App Name: `Discash`
    * Framework / Tooling: Capacitor Android / Android SDK toolchain
- **[2026-10-13] Faktur Digital Transaksi & Notifikasi Riwayat Transaksi Global**:
  - **Faktur Digital Transaksi (Digital Invoice/Receipt)**:
    * Dapat diakses saat mengklik item riwayat transaksi (track record).
    * Berupa layar/sheet faktur digital yang menampilkan:
      1. Logo centang/ceklis besar di atas tengah.
      2. Status jenis transaksi (budget masuk / keluar / deposit / withdrawal).
      3. Nominal IDR transaksi (`formatIDR`).
      4. ID Transaksi unik.
      5. Tanggal dan jam transaksi.
      6. Catatan (note) transaksi.
      7. Tombol download faktur ke PNG di bagian bawah.
    * **Mesin Konversi PNG**: Menggunakan `html-to-image` (SVG foreignObject / htmltopng rasterizer), BUKAN `html2canvas`, agar hasil render PNG 100% presisi dan tajam tanpa distorsi CSS canvas.
  - **Ikon Notifikasi di Header**:
    * Terletak di pojok kanan Header.
    * **PANTANGAN KETAT**: DILARANG DIBUNGKUS BOX (ikon berdiri bebas tanpa container box/border/lingkaran background, murni tombol ikon klik).
    * Saat diklik, membuka panel/sheet yang berisi seluruh riwayat transaksi dari SEMUA goals secara global (kronologis).
- **[2026-10-13] Detail Tampilan Faktur: Ikon Ceklis Dimensi/Menonjol & Hapus Dot Status**:
  - **Ikon Ceklis Besar di Faktur**:
    * Wajib berlatar belakang **terisi (filled)** hijau solid/gradient, DILARANG outlined/transparan.
    * Memiliki efek **glow hijau** mirip tombol plus di bottom navbar (`shadow-xl shadow-[#23A55A]/45 ring-4 ring-[#1E1F22]`).
    * Memiliki **dimensi fisik/efek menonjol (3D extruded / tactile button)**:
      - Gradient pencahayaan permukaan (`from-[#2ECC71] to-[#1E9550]`).
      - Highlight pantulan cahaya atas (`inset 0 2px 3px rgba(255,255,255,0.4)`).
      - Bevel/tepian bawah fisik yang lebih gelap (`border-b-[3.5px] border-[#166E3B]`).
      - Centang di dalam berwarna putih solid dengan drop shadow tipis.
  - **Teks Status**:
    * Pada baris rincian Status, **DILARANG menggunakan dot hijau** (hanya teks `Success` bersih berwarna hijau tanpa dot).
- **[2026-10-13] Penyelarasan Style Ikon Transaksi (Plus/Minus) Riwayat Transaksi**:
  - Seluruh ikon riwayat transaksi (baik di Goal Detail Sheet maupun di All Transactions / Notifikasi) diselaraskan stylenya dengan ikon ceklis faktur:
    * **Filled 3D gradient background**: `from-[#2ECC71] to-[#1E9550]` (deposit) dan `from-[#FF5C5C] to-[#D83A3E]` (withdrawal).
    * **Dimensi fisik menonjol (tactile)**: Bevel border bawah fisik yang lebih pekat (`border-b-2` / `border-b-[2.5px] border-[#166E3B]` atau `border-[#961D20]`).
    * **Outer Ring & Inset Highlight**: `ring-2 ring-[#2B2D31]` dengan pantulan atas `inset 0 1px 1.5px rgba(255, 255, 255, 0.45)`.
    * **Glow Halus**: `0 4px 12px rgba(35, 165, 90, 0.35)` (deposit) atau `0 4px 12px rgba(242, 63, 67, 0.35)` (withdrawal).
    * **Simbol Dalam**: Putih bersih solid (`stroke="white"` / `text-white`) dengan drop shadow tajam dan `strokeWidth` tebal.
- **[2026-10-13] Penyelarasan Style Tombol Plus Bottom Navbar (3D Tactile Blurple)**:
  - Tombol CTA plus (`+`) tengah di bottom navbar diselaraskan dengan style 3D dimensi fisik faktur, dengan tetap mempertahankan warna ungu Discord:
    * **Warna Tetap Ungu**: Gradien Blurple 3D `from-[#6975F7] to-[#4752C4]`.
    * **Dimensi Fisik Menonjol**: Bevel border bawah fisik `border-b-[3.5px] border-[#363FA0]`.
    * **Socket Ring & Inset Highlight**: `ring-4 ring-[#1E1F22]` dengan pantulan cahaya atas `inset 0 2px 3px rgba(255, 255, 255, 0.45)`.
    * **Glow Ungu**: `0 8px 24px rgba(88, 101, 242, 0.45)`.
    * **Simbol Plus**: Putih solid dengan `drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.3)]` dan stroke tegas.
- **[2026-10-13] Halaman Account Profile: Linked Social Media & Tombol Aksi Akun**:
  - **Linked Social Media**:
    * Menambahkan seksi "Linked Social Media" / "Connections" di halaman Account Profile.
    * Menampilkan 5 akun sosial media: **Instagram**, **Twitter**, **Steam**, **X**, dan **LINE**.
    * Masing-masing menampilkan icon platform asli yang tajam, nama platform, dan handle akun `@zerotwenty` yang terhubung.
    * Mengikuti aturan anti-patterns: Langsung berada di atas surface profil tanpa pembungkus ganda (tanpa box di dalam box) dan tanpa badge/pill/tag.
  - **Tombol Aksi Akun**:
    * Di bawah seksi linked social media, terdapat 3 tombol aksi akun:
      1. **Switch Account**: Tombol untuk berganti akun.
      2. **Purge Account**: Tombol aksi berbahaya (*danger action*) untuk membersihkan seluruh data akun/tabungan dengan modal konfirmasi keamanan.
      3. **Logout**: Tombol keluar akun dengan dialog konfirmasi.
    * Tombol dirancang ergonomis (min touch target 44px) dengan visual Discord mobile yang bersih dan interaktif.
- **[2026-10-13] Penataan Urutan & Style 3D Tombol Manajemen Akun**:
  - **Urutan Tombol**:
    1. **Paling Atas**: Switch Account
    2. **Tengah**: Log Out
    3. **Paling Bawah**: Purge Account
  - **Penyelarasan Style 3D Tactile**:
    * Seluruh tombol menggunakan style 3D dimensional yang sama (gradien permukaan, bevel border-b, inset reflection highlight, glow berwarna, drop shadow teks/ikon, dan efek physical press saat ditekan) dengan warna masing-masing:
      1. **Switch Account**: Ungu Discord Blurple (`bg-gradient-to-b from-[#6975F7] to-[#4752C4]`, `border-b-[3.5px] border-[#363FA0]`, glow ungu).
      2. **Log Out**: Abu-abu Slate Discord (`bg-gradient-to-b from-[#4E5058] to-[#35373C]`, `border-b-[3.5px] border-[#232428]`, shadow netral).
      3. **Purge Account**: Merah Destructive Discord (`bg-gradient-to-b from-[#FF5C5C] to-[#DA373C]`, `border-b-[3.5px] border-[#961D20]`, glow merah).
- **[2026-10-13] Nomenklatur Desain: Tactile 3D Button (Tactile 3D / Pushable 3D)**:
  - Nama resmi style ini adalah **"Tactile 3D"** (atau **"Tactile 3D Button"** / **"Pushable 3D"**).
  - Karakteristik baku:
    * Gradien permukaan atas ke bawah (pencahayaan arah atas).
    * Bevel ketebalan fisik di bibir bawah (`border-b-[3.5px]` warna lebih pekat/gelap).
    * Inset specular highlight di tepi atas (`inset 0 1.5px 2px rgba(255,255,255,0.4)`).
    * Outer ring penahan / socket (`ring-2` atau `ring-4`).
    * Ambient glow berwarna di bawah tombol.
    * Animasi tekan mekanik saat diklik (`active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]`).
- **[2026-10-13] Penerapan Style Tactile 3D pada Kartu Total Savings (Dasbor)**:
  - Kartu "Total Savings" / Total IDR di bagian paling atas dasbor ditransformasikan menggunakan style **Tactile 3D**:
    * **Surface Gradient**: Gradien Discord Dark Surface (`from-[#36393F] via-[#2B2D31] to-[#222428]`).
    * **Bevel Fisik Bawah**: Ketebalan terekstrusi nyata di sisi bawah (`border-b-[4.5px] border-[#16171A]`).
    * **Highlight Refleksi Atas**: `inset 0 1.5px 2px rgba(255, 255, 255, 0.18)` untuk kilauan permukaan atas.
    * **Socket Ring & Ambient Glow**: `ring-2 ring-[#17181B]` dengan bayangan elevasi tebal dan pendaran Blurple lembut (`0 10px 28px rgba(0,0,0,0.45), 0 2px 10px rgba(88,101,242,0.18)`).
    * **Tipografi Dimensional**: Angka nominal IDR dengan drop shadow berbobot.
- **[2026-10-13] Halaman Settings Fungsional: Mata Uang, Simbol, Kurs USD & Toggle Desimal**:
  - **Halaman Settings (`SettingsPage.tsx`)**:
    * Diintegrasikan ke tab `settings` pada Bottom Navigation Bar.
    * **BATASAN KETAT (Anti-Patterns)**: HANYA membuat opsi yang diinstruksikan (tidak menambahkan opsi di luar perintah):
      1. **Pemilihan Mata Uang**: Pilihan antara **IDR** (Rupiah) dan **USD** (Dolar AS).
      2. **Pemilihan Simbol**: Format tampilan simbol mata uang:
         - Untuk IDR: Pilihan antara `IDR` (kode) atau `Rp` (simbol).
         - Untuk USD: Pilihan antara `USD` (kode) atau `$` (simbol).
      3. **Kurs USD**: Konfigurasi nilai tukar 1 USD terhadap IDR (default `16,000`).
      4. **Toggle Desimal**: Switch interaktif untuk mengaktifkan/menonaktifkan desimal (misal: `...,00` / `.00` vs pembulatan utuh).
    * **Integrasi Global**: Seluruh nominal di Dasbor, Halaman Goals, Faktur, dan Riwayat Transaksi secara otomatis mengikuti pengaturan mata uang yang aktif.
    * **Kepatuhan Anti-Patterns**: Menggunakan surface bersih Discord (`bg-[#2B2D31]`), tanpa box dalam box ganda, dan tanpa badge/pill/tag yang tidak diminta.
- **[2026-10-13] Ekspor PNG Ringkasan Goal di Goal Detail Sheet**:
  - Menambahkan tombol icon **Download PNG** di barisan tombol header GoalDetailSheet (berjejer dengan edit, hapus, dan tutup).
  - Berfungsi mengunduh gambar PNG berkualitas tinggi (`html-to-image`) dari ringkasan progres goal dan maksimal **3 transaksi terbaru**.
  - **PANTANGAN KETAT HASIL EKSPOR**:
    * Hasil ekspor PNG **TIDAK BOLEH** memuat tombol "Add Funds" dan "Withdraw" (budget actions).
    * Hasil ekspor PNG **TIDAK BOLEH** memuat tombol kontrol header/handler (drag handle, tombol edit, hapus, download, atau close).

- **[2026-10-13] Perbaikan Hasil Ekspor PNG Blank / Putih Total**:
  - **Penyebab**:
    1. Node ekspor diberi style `position: fixed; left: -9999px;` langsung pada target `ref`, sehingga saat di-clone ke dalam SVG `foreignObject` viewBox `[0, 0, width, height]`, konten dirender di koordinat x = -9999px (jauh di luar canvas) menghasilkan canvas kosong/putih.
    2. `html-to-image` secara default mencoba membaca `document.styleSheets[i].cssRules` untuk meng-embed font eksternal (`https://fonts.cdnfonts.com/...` dan Google Fonts). Browser melempar `SecurityError: Failed to read the 'cssRules' property from 'CSSStyleSheet': Cannot access rules` karena CORS.
  - **Solusi Baku**:
    1. Pembungkus offscreen dipisahkan: div wrapper luar menahan posisi offscreen (`position: fixed; left: -9999px; top: 0;`), sedangkan div card yang di-capture (`ref={exportCardRef}`) memiliki posisi normal (`position: relative; left: 0; top: 0; width: 400px;`).
    2. Pada opsi `toPng`, wajib menyertakan `skipFonts: true` untuk menghindari `SecurityError` stylesheet eksternal, `backgroundColor: '#2B2D31'`, dan override `style: { position: 'static', left: '0', top: '0', margin: '0', transform: 'none' }`.
    3. Terapkan juga `skipFonts: true` pada `TransactionReceiptSheet.tsx` agar kebal terhadap error CORS font eksternal.

- **[2026-10-13] Ikon Medsos Profil Akun Menggunakan PNG Resmi Berkualitas Tinggi & Seragam**:
  - **Spesifikasi**:
    * Seluruh ikon media sosial di halaman Account Profile (`Instagram`, `Twitter`, `Steam`, `X`, `LINE`) wajib menggunakan file gambar **PNG resmi (official brand logos)** berkualitas tinggi dari internet.
    * **Konsistensi Style Mutlak**: Semua ikon wajib se-style dan seragam (apabila colored/berwarna resmi maka colored semua; apabila filled/badge maka seragam semua).
    * Gambar PNG disimpan lokal (misalnya di `public/icons/social/` atau `src/assets/social/`) dan memiliki rasio 1:1, latar belakang transparan (atau badge squircle berlatar transparan), dan resolusi tajam (crisp).
    * Tetap patuh pada `ai-anti-patterns.md`: dilarang menambahkan badge/tag/pill tanpa instruksi.

- **[2026-10-13] Angka Persentase Goal Dapat Melebihi 100% (>100%)**:
  - Jika saldo terkumpul (*collected*) pada suatu savings goal melebihi target tabungan (*target budget*), angka persentase **TIDAK DIBATASI** / tidak di-cap pada 100%.
  - Teks persentase menampilkan nilai perhitungan aslinya (misal: `110%`, `150%`, `200%`, dst.).
  - Lebar visual track progress bar (`style={{ width: ... }}`) dibatasi maksimal `100%` (`Math.min(100, percent)%`) agar tidak meluap keluar dari kontainer track progress bar.
- **[2026-10-13] Settings: Ikon Ceklis di Kiri, Tombol & Toggle Bergaya Tactile 3D Warna Ungu**:
  - **Tombol Pilihan Mata Uang & Simbol**:
    * Ikon ceklis (`✓`) diletakkan di **sebelah kiri** teks label (bukan di kanan).
    * Saat aktif/terpilih, tombol menggunakan gaya **Tactile 3D warna ungu Discord (Blurple)**:
      - Gradien permukaan atas-ke-bawah (`bg-gradient-to-b from-[#6975F7] to-[#4752C4]`).
      - Bevel ketebalan fisik di tepi bawah (`border-b-[3.5px] border-[#363FA0]`).
      - Inset specular reflection highlight di tepi atas (`boxShadow: 'inset 0 1.5px 2px rgba(255, 255, 255, 0.45), 0 4px 16px rgba(88, 101, 242, 0.4)'`).
      - Efek tekan mekanik saat disentuh (`active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]`).
      - Ikon ceklis putih tebal dengan drop shadow halus.
    * Saat tidak aktif: menggunakan surface gelap Discord (`bg-[#1E1F22]`, border `#111214]/80`, teks `#949BA4`).
  - **Toggle Switch Desimal**:
    * Menggunakan gaya **Tactile 3D warna ungu** saat aktif (ON):
      - Track switch menggunakan warna ungu Blurple (`bg-gradient-to-b from-[#6975F7] to-[#4752C4]`, border `#363FA0` / inset shadow).
      - Knob/thumb switch bergaya dimensional 3D tactile (lingkaran putih dengan bevel border-b, inset reflection highlight, dan drop shadow menonjol).
    * Saat tidak aktif (OFF): track surface gelap dengan knob tactile netral.

- **[2026-10-13] Bottom Navbar: Icon SVG Itu Sendiri yang Tactile 3D (Dilarang Dibungkus Box/Kotak)**:
  - **PANTANGAN KETAT**:
    * **Dilarang membungkus icon navbar dalam box/kotak/button 3D tactile**.
    * Seluruh tombol tab di navbar berlatar transparan bersih tanpa card/box di sekeliling icon.
  - **Gaya 3D Tactile Murni pada Vektor SVG (Bukan Box)**:
    * Ketika tab aktif (`activeTab === tab`), **elemen glyph/path SVG itu sendiri** yang tampil dengan gaya **Tactile 3D warna ungu (Discord Blurple)**:
      - Gradien warna ungu Blurple langsung pada SVG fill/stroke (`#5865F2` / gradien `#6975F7` ke `#4752C4`).
      - Bevel bayangan fisik tebal terekstrusi ke bawah pada glyph itu sendiri via drop-shadow berlapis: `drop-shadow(0 2.5px 0 #363FA0) drop-shadow(0 5px 10px rgba(88, 101, 242, 0.55))`.
      - Highlight refleksi atas pada vektor.
      - Efek tekan mekanis: saat disentuh/diklik, icon sedikit tertekan (`active:translate-y-0.5 active:scale-95`).
    * Ketika tab tidak aktif: icon SVG berwarna abu-abu netral semi-transparan khas Discord (`text-white/40 hover:text-white/75`).
  - **Animasi Dinamis Anatomi Internal SVG (Bukan Animasi Kesatuan/Container)**:
    * Animasi terjadi secara spesifik pada elemen path/vektor di **dalam** SVG menggunakan `framer-motion` (`motion.rect`, `motion.path`, dsb.) saat tab dibuka/aktif:
      1. **Tab Dashboard**:
         - Kotak-kotak/bar grid bento di dalam SVG bergerak dinamis memanjang dan memendek (kotak yang panjang memendek, kotak yang pendek memanjang), lalu kembali ke ukuran semula sehingga **frame awal dan frame akhir memiliki state/posisi yang sama persis** (*seamless keyframe loop / intro rebound*).
      2. **Tab Goals**:
         - Animasi Denyut Gelombang Radar / Ripple: Lingkaran target (titik pusat, lingkaran tengah, dan lingkaran luar) membesar-mengecil berdenyut secara elastis bergelombang berturut-turut dari pusat merambat ke luar (*propagating concentric ripple wave*), bergetar elastis seperti riak air di atas target, lalu kembali tenang ke ukuran awal.
      3. **Tab Account Profile**:
         - **Asset Wajib**: Menggunakan aset resmi Discord (`public/discord-assets/my-account.svg`), DILARANG membuat icon baru.
         - **Animasi Tangan Melambai Natural**: Siluet tubuh dan kepala avatar resmi Discord tetap solid dan utuh. Lengan kanan bertransisi secara mulus dari posisi istirahat di samping badan -> terangkat ke samping kepala dan melambai (👋) ke kanan dan kiri secara natural dan proporsional -> kembali turun ke posisi istirahat awal. Frame awal dan frame akhir 100% bit-exact identik dengan siluet asli `my-account.svg`.
      4. **Tab Settings**:
         - Gerigi roda gigi (*gear / cogwheel*) di dalam SVG berputar (*smooth rotating gear animation*) secara presisi di titik pusatnya (`transformOrigin: '50px 50px'`).

- **[2026-10-13] Goal Detail Sheet: Tombol Add Funds & WD di Bawah Sheet (3D Tactile, WD Oranye Terang, No Label) & Progress Bar 3D Tactile**:
  - **Penempatan Tombol Add Funds & Withdraw**:
    * Dipindahkan dari bagian atas ke **bagian bawah sheet** (`sticky bottom-0`).
    * **PANTANGAN KETAT**: **DILARANG menggunakan label "Budget Actions"** atau teks header di atas tombol.
  - **Gaya Tactile 3D Tombol**:
    * **Tombol Withdraw (WD)**: Wajib berwarna **oranye terang** (`bg-gradient-to-b from-[#FFA133] via-[#FF7A00] to-[#E56200]`, bevel bawah `border-b-[3.5px] border-[#A84400]`, inset specular highlight `inset 0 1.5px 2px rgba(255, 255, 255, 0.45)`, glow oranye `0 4px 16px rgba(255, 122, 0, 0.4)`, efek tekan `active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]`).
    * **Tombol Add Funds**: Bergaya Tactile 3D warna hijau (`bg-gradient-to-b from-[#2ECC71] via-[#23A55A] to-[#1E9550]`, bevel bawah `border-b-[3.5px] border-[#166E3B]`, inset specular highlight, glow hijau, efek tekan).
  - **SELURUH Progress Bar di Aplikasi Bergaya 3D Tactile**:
    * Berlaku seragam di Goal Detail Sheet, Goal Page Card, Budget Distribution Card, dan Export PNG Card.
    * **Track / Saluran**: Bergaya sunken/recessed channel (`bg-[#1A1B1E] border border-[#141517] p-[1.5px] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)]`).
    * **Pill Isi Progress**: Bergaya 3D raised tactile pill (`bg-gradient-to-b from-[#7983F5] via-[#5865F2] to-[#4752C4]`, bevel bawah `border-b-[2px] border-[#31378A]`, inset highlight refleksi atas `inset 0 1.5px 1px rgba(255, 255, 255, 0.55)`, pendaran Blurple `0 2px 8px rgba(88, 101, 242, 0.45)` / segment shadow).

- **[2026-10-13] Seluruh Tombol Besar / Aksi Utama di Aplikasi Bergaya Tactile 3D**:
  - Seluruh tombol berukuran besar / tombol aksi utama di seluruh aplikasi (`New Goal Sheet`, `Goal Mutation Sheet`, `Goal Detail Sheet` edit & delete modal, `Transaction Receipt Sheet` download, `Account Profile` konfirmasi modal, dsb.) WAJIB menggunakan style **Tactile 3D**:
    * **Surface Gradient**: Gradien pencahayaan atas ke bawah sesuai warna semantik.
    * **Physical Bevel**: Bevel ketebalan fisik di bibir bawah (`border-b-[3.5px]` warna lebih pekat/gelap).
    * **Specular Highlight**: Inset specular reflection highlight di tepi atas (`inset 0 1.5px 2px rgba(255, 255, 255, 0.45)` atau 0.25 untuk abu-abu).
    * **Socket Ring**: `ring-2 ring-[#1E1F22]`.
    * **Ambient Glow**: Pendaran warna semantik tombol (`0 4px 16px ...`).
    * **Mechanical Press**: Respons gerak mekanik saat ditekan (`active:translate-y-0.5 active:border-b-[1.5px] active:scale-[0.99]`).
    * **Kategori Warna Semantik**:
      - Primary / Save: Blurple (`from-[#6975F7] to-[#4752C4]`, border `#363FA0`)
      - Add Funds / Deposit: Green (`from-[#2ECC71] via-[#23A55A] to-[#1E9550]`, border `#166E3B`)
      - Withdraw / WD: Bright Orange (`from-[#FFA133] via-[#FF7A00] to-[#E56200]`, border `#A84400`)
      - Destructive / Delete / Purge: Red (`from-[#FF5C5C] to-[#DA373C]`, border `#961D20`)

- **[2026-10-13] Drag Handler Seluruh Panel Sheet Bergaya Tactile 3D & Memanjang Halus saat Hold/Drag**:
  - Drag handler di bagian atas seluruh panel sheet (`GoalDetailSheet`, `NewGoalSheet`, `GoalMutationSheet`, `TransactionReceiptSheet`, `NotificationHistorySheet`) WAJIB menggunakan style **Tactile 3D**:
    * **Dimensi Awal**: Bentuk kapsul pill ergonomis (`w-12 h-2 rounded-full`).
    * **Animasi Memanjang Halus (Dynamic Hold & Drag Elongation)**:
      - Ketika handler disentuh / di-hold / di-drag oleh user, kapsul memanjang secara halus dari `w-12` (48px) menjadi `w-20` (80px) dengan transisi elastis/smooth (`transition-all duration-250 ease-out`).
      - Saat dilepas (*release / drag end*), kapsul kembali mengecil secara mulus ke ukuran awal `w-12`.
      - Permukaan menjadi sedikit lebih terang saat di-hold (`from-[#727782] to-[#454852]`) sebagai feedback tactile langsung.
    * **Surface Gradient**: Gradien pencahayaan atas ke bawah (`bg-gradient-to-b from-[#5E626B] to-[#383A40]`).
    * **Physical Bevel**: Bevel ketebalan fisik di bibir bawah (`border-b-[2px] border-[#1C1D20]`).
    * **Highlight Refleksi Atas**: Inset specular reflection highlight `inset 0 1px 1.5px rgba(255, 255, 255, 0.4)` dengan drop shadow `0 2px 5px rgba(0, 0, 0, 0.5)`.
    * **Outer Ring Socket**: `ring-1 ring-[#17181B]`.

- **[2026-10-13] Header Teks di Setiap Halaman Tab Bergaya Tactile 3D Tanpa Dibungkus Box**:
  - Di setiap halaman tab (`Dashboard`, `Goals`, `Account Profile`, `Settings`), terdapat teks judul header di bagian paling atas konten:
    * **PANTANGAN KETAT**: **DILARANG dibungkus box/container/card/border**. Teks header berdiri bebas (*naked typography*) langsung di atas canvas permukaan halaman tab.
    * **Gaya Tactile 3D pada Teks**:
      - Tipografi: `discord-wordmark font-black text-2xl tracking-tight`.
      - Surface Gradient: Gradien pencahayaan atas ke bawah pada huruf (`bg-gradient-to-b from-white via-[#E8EAED] to-[#B5BAC1] bg-clip-text text-transparent`).
      - Bevel & Ekstrusi Fisik 3D: Multi-layer drop-shadow tebal (`filter: drop-shadow(0 2px 0 #18191C) drop-shadow(0 3.5px 0 #111214) drop-shadow(0 6px 12px rgba(0, 0, 0, 0.55))`).
    * **Judul Tab**:
      - Dashboard: "Dashboard"
      - Goals: "Goals"
      - Profile: "Account Profile"
      - Settings: "Settings"

- **[2026-10-13] Halaman Goals: Searchbar Global, Fitur Sorting (Created, Updated, Alphabetical, Progress) & Pin Goals**:
  - **Searchbar Global di Halaman Goals**:
    * Terletak di bawah header Goals pada tab Goals (`GoalPage.tsx`).
    * Memungkinkan pencarian cepat dan responsif berdasarkan nama (*title*) dan deskripsi goal.
    * Bergaya Discord surface input (`bg-[#1E1F22]`, border `#1F2023]`, placeholder text muted, ikon kaca pembesar, dan tombol clear).
    * PANTANGAN KETAT: Dilarang membungkus form di dalam kartu/box ganda (*no box in box*).
  - **Fitur Sorting Goals**:
    * Opsi pengurutan:
      1. **Created Date**: Kapan dibuat (terbaru / terlama).
      2. **Updated Date**: Kapan terakhir diperbarui (aktivitas / transaksi terakhir).
      3. **Alphabetical**: Berdasarkan alfabet nama (A-Z / Z-A).
      4. **Progress**: Berdasarkan persentase progress tabungan (tertinggi / terendah).
    * Goal yang disematkan (*pinned*) selalu diprioritaskan di urutan teratas daftar (*pinned to top*).
  - **Fitur Pin / Unpin Goal di Goal Detail Sheet**:
    * Pada panel `GoalDetailSheet.tsx`, terdapat tombol toggle Pin/Unpin (ikon pin Discord) di barisan tombol header (berdampingan dengan Download PNG, Edit, Delete, Close).
    * Saat suatu goal di-pin (`isPinned = true`), tombol berubah menjadi state aktif dan goal disematkan di paling atas daftar Goals dengan indikator ikon pin Discord yang bersih.

- **[2026-10-13] Header Goal Detail Sheet: Tombol Close Tactile 3D Merah & Menu Titik Tiga (Action Picker)**:
  - Pada barisan tombol aksi di header `GoalDetailSheet.tsx`:
    1. **Tombol Close (X)**:
       - Menggunakan style **Tactile 3D warna merah** (`bg-gradient-to-b from-[#FF5C5C] to-[#DA373C]`, bevel bawah `border-b-[2.5px] border-[#961D20]`, ring `ring-2 ring-[#1E1F22]`, specular highlight `inset 0 1px 1.5px rgba(255,255,255,0.45)`, glow merah `0 3px 10px rgba(242,63,67,0.4)`, active press `active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95]`).
       - Ikon silang (X) warna putih tebal.
    2. **Tombol Titik Tiga (`...` More Actions)**:
       - Berdampingan dengan tombol Close merah.
       - Ikon tiga titik (`More Options`).
    3. **Option Action Picker**:
       - Saat tombol titik tiga ditekan, memunculkan action picker modal/sheet:
         * **Pin / Unpin Goal**: Menyematkan atau melepas sematan goal.
         * **Download Summary (PNG)**: Mengunduh ringkasan progres PNG.
         * **Edit Goal**: Masuk ke mode edit info goal.
         * **Delete Goal**: Membuka konfirmasi penghapusan goal.
       - Seluruh aksi sampingan (Pin, Download, Edit, Delete) dipusatkan di dalam picker ini sehingga header tetap bersih, ringkas, dan fokus.

- **[2026-10-13] Tombol Titik Tiga & Seluruh Ikon Tactile 3D + Option Action Picker Berbentuk Sheet Panel**:
  - **Tombol Titik Tiga 3D Tactile**:
    * Menggunakan style **Tactile 3D** (surface slate Discord `bg-gradient-to-b from-[#4E5058] to-[#35373C]`, bevel bawah `border-b-[2.5px] border-[#232428]`, specular highlight `inset 0 1px 1.5px rgba(255,255,255,0.25)`, drop shadow, ring `ring-2 ring-[#1E1F22]`, active press `active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95]`).
    * Tiga titik putih/off-white dengan drop-shadow lembut.
  - **Ikon-Ikon Tactile 3D**:
    * Seluruh ikon dalam sheet picker (Pin/Unpin, Download Summary, Edit Goal, Delete Goal) dan ikon terkait dibungkus dalam wadah ikon bergaya **Tactile 3D**:
      - Pin Goal: Tactile Blurple (`from-[#6975F7] to-[#4752C4]`, bevel `border-b-[2px] border-[#363FA0]`, inset highlight).
      - Download Summary: Tactile Cyan/Teal atau Slate (`from-[#4E5058] to-[#35373C]`, bevel `border-b-[2px] border-[#232428]`, inset highlight).
      - Edit Goal: Tactile Slate/Dark (`from-[#4E5058] to-[#35373C]`, bevel `border-b-[2px] border-[#232428]`, inset highlight).
      - Delete Goal: Tactile Red (`from-[#FF5C5C] to-[#DA373C]`, bevel `border-b-[2px] border-[#961D20]`, inset highlight).
  - **Option Action Picker Wajib Berbentuk Sheet Panel (Bottom Sheet Panel)**:
    * Option Picker BUKAN dialog popup di tengah, melainkan **Bottom Sheet Panel** yang meluncur naik dari bawah (`fixed bottom-0` / `absolute bottom-0 w-full rounded-t-3xl`).
    * Memiliki **Drag Handler Tactile 3D** di bagian atasnya dengan animasi memanjang halus saat di-hold/drag (`w-12` -> `w-20`).
    * Gestur drag-down untuk menutup sheet (`drag="y" dragConstraints={{ top: 0 }}`).
- **[2026-10-13] Goal >= 100%: Progress Bar Warna Hijau & Badge Ceklis 3D Tactile "ACHIEVED" di Samping Nama Goal**:
  - **Progress Bar Hijau untuk Goal >= 100%**:
    * Pada semua komponen yang menampilkan progress bar goal (`GoalPage.tsx`, `GoalDetailSheet.tsx`, `DashboardPage.tsx`, dll), jika progress goal telah mencapai atau melebihi 100% (`progress >= 100`):
      - Warna fill progress bar berganti menjadi **Tactile 3D Green**:
        `bg-gradient-to-r from-[#2ECC71] via-[#23A55A] to-[#1E9550]` dengan bevel `border-b-[2px] border-[#166E3B]`, highlight specular `inset 0 1px 1px rgba(255,255,255,0.45)`, dan drop-shadow glow hijau `0 2px 8px rgba(35, 165, 90, 0.4)`.
  - **Badge Ceklis 3D Tactile "ACHIEVED" di Samping Nama Goal**:
    * **Instruksi Eksplisit**: User secara spesifik meminta penambahan badge ini jika goal >= 100%.
    * Ditampilkan persis di samping nama goal (baik pada kartu daftar goal di `GoalPage.tsx`, header & card detail di `GoalDetailSheet.tsx`, maupun widget goal di `DashboardPage.tsx` jika ada nama goal).
    * **Spesifikasi Style 3D Tactile**:
      - Bentuk: Badge pill/rounded micro ergonomis (`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md`).
      - Background: `bg-gradient-to-b from-[#2ECC71] to-[#1E9550]`.
      - Bevel Fisik Bawah: `border-b-[2px] border-[#166E3B]`.
      - Socket Ring: `ring-1 ring-[#146034]`.
      - Specular Highlight: `shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_6px_rgba(35,165,90,0.35)]`.
      - Teks: Font bold / heavy `font-black text-[10px] text-white tracking-wider uppercase` dengan teks `"ACHIEVED"`.
- **[2026-10-13] Dialog Konfirmasi Saat Menghapus Track Record Transaksi**:
  - Saat pengguna menekan tombol hapus/delete pada riwayat transaksi (baik di `GoalDetailSheet.tsx` maupun invoice `TransactionReceiptSheet.tsx`):
    * **Wajib memunculkan dialog konfirmasi**: Dilarang langsung menghapus transaksi tanpa persetujuan user.
    * **Desain Dialog Konfirmasi**:
      - Backdrop gelap bersih tanpa blur (`bg-black/75` / `bg-black/80`).
      - Dialog card Discord dark surface (`bg-[#313338] border border-[#1F2023] rounded-2xl p-5 shadow-2xl`).
      - Judul jelas: "Delete Transaction?"
      - Pesan informatif yang menerangkan bahwa saldo akan direvert kembali sesuai jenis transaksi (deposit/withdrawal).
      - Dua tombol aksi bergaya **Tactile 3D**:
        1. **Cancel / Batal**: Tactile 3D Slate (`from-[#4E5058] to-[#35373C]`, border `#232428`, specular highlight).
        2. **Delete / Hapus**: Tactile 3D Destructive Red (`from-[#FF5C5C] to-[#DA373C]`, border `#961D20`, red glow & specular highlight).

- **[2026-10-13] File APK Hasil Build Dipindahkan ke Root Folder**:
  - Setiap kali APK selesai di-build (`bun run build:apk`), file APK wajib disalin/dipindahkan ke root folder (`/media/fatihfarhat/New Volume1/PROJECTS/Discash.apk` dan project root `discord-mobile/Discash.apk`) agar mudah diakses langsung oleh user.

- **[2026-10-13] Ikon Goal di Halaman Goals Bergaya Tactile 3D & Custom Photo Tampil Penuh (Full)**:
  - **Wadah Ikon Goal Tactile 3D pada Halaman Goals (`GoalPage.tsx`)**:
    * Menggunakan style **Tactile 3D**:
      - Bentuk: `w-11 h-11 rounded-2xl` (squircle token Discord).
      - Bevel fisik bawah: `border-b-[2.5px]`.
      - Socket Ring: `ring-2 ring-[#1E1F22]`.
      - Specular Highlight refleksi: `shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35),0_3px_8px_rgba(0,0,0,0.35)]`.
      - Warna Preset Ikon:
        * Jika goal >= 100%: Tactile 3D Green (`bg-gradient-to-b from-[#2ECC71] to-[#1E9550]`, border `#166E3B`).
        * Normal (< 100%): Tactile 3D Blurple (`bg-gradient-to-b from-[#6975F7] to-[#4752C4]`, border `#363FA0`).
  - **Custom Photo Tampil Penuh (Full Image)**:
    * Ketika suatu goal menggunakan foto kustom (`customPhoto` / `icon === 'custom'`), gambar foto wajib mengisi wadah secara **PENUH / FULL** (`w-full h-full object-cover`), bukan mengecil di tengah dengan padding.
    * Wadah foto kustom tetap memiliki bevel fisik 3D, ring socket, dan lapisan specular highlight (`shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.45)]`) sehingga foto kustom tetap tampil berkarakter Tactile 3D fisik.

- **[2026-10-13] Tap and Hold Kartu Goals Membuka Sheet Panel Action Picker**:
  - **Interaksi Tap and Hold (Long Press)**:
    * Pada halaman goals (`GoalPage.tsx`), saat pengguna melakukan gesture tap and hold / long press pada kartu goal (durasi ~500ms):
      - Menampilkan efek tactile feedback / visual hold.
      - Membuka **Sheet Panel Action Picker** khusus untuk goal tersebut (Bottom Sheet Panel).
      - Mencegah aksi klik biasa (tidak membuka GoalDetailSheet jika dipicu via hold).
      - Mencegah pop-up default browser context menu (`preventDefault` on contextmenu).
      - Menghindari trigger hold yang tidak disengaja saat pengguna sedang melakukan scroll vertikal (threshold pergerakan jari ~8-10px).
  - **Desain & Fitur Sheet Panel Action Picker**:
    * Berbentuk **Bottom Sheet Panel** dengan animasi meluncur naik dari bawah.
    * **Dilarang keras menggunakan backdrop blur** (`backdrop-blur-*`), gunakan backdrop gelap bersih (`bg-black/75` atau `bg-black/80`).
    * Memiliki **Drag Handle Tactile 3D** di bagian atas (animasi stretch saat di-hold/drag).
    * Header picker menampilkan icon goal Tactile 3D (custom photo full bleed jika ada), judul goal, badge "ACHIEVED" jika >= 100%, serta **Tombol Close Tactile 3D warna merah**.
    * Opsi Aksi di dalam picker:
      1. **Pin / Unpin Goal**: Mengubah status pin goal di posisi paling atas daftar.
      2. **Download Summary (PNG)**: Mengunduh gambar ringkasan progres goal.
      3. **Edit Goal**: Membuka mode edit pada goal.
      4. **Delete Goal**: Menghapus goal dengan penjagaan dialog konfirmasi modal Tactile 3D.
      5. **Move to Archive / Archive Goal**: Mengarsipkan goal (`isArchived = true`). Goal yang diarsipkan otomatis dipindahkan dari daftar goal aktif ke halaman arsip.

- **[2026-10-13] Tombol Ikon Arsip & Halaman Goals Archive Fullscreen**:
  - **Tombol Ikon Arsip di Header Halaman Goals (`GoalPage.tsx`)**:
    * Terletak di baris judul header halaman (`TabHeader title="Goals"`) di sebelah kanan.
    * Tombol bergaya **Tactile 3D**: `w-10 h-10 rounded-2xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95]`.
    * Memuat ikon arsip / drawer yang bersih tanpa badge (dilarang menambah badge/tag/pill tanpa instruksi).
    * Saat ditekan, membuka halaman **Goals Archive**.
  - **Halaman Goals Archive (Fullscreen Slide In - Slide Out)**:
    * **Cakupan Layar**: Menutupi seluruh layar secara penuh (*fullscreen* `fixed inset-0 z-[60] bg-[#313338]`), termasuk menutupi sticky header utama dan bottom navbar.
    * **Animasi Transisi**: Transisi halus *slide in* dari kanan (`x: '100%' -> 0`) saat dibuka, dan *slide out* ke kanan (`x: '100%'`) saat ditutup (`AnimatePresence`).
    * **Header Halaman Arsip**:
      - **Tombol Back 3D Tactile**: Berada di samping judul header, bergaya Tactile 3D (`w-10 h-10 rounded-2xl bg-gradient-to-b from-[#4E5058] to-[#35373C] border-b-[2.5px] border-[#232428] ring-2 ring-[#1E1F22] text-[#DBDEE1] shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25),0_3px_8px_rgba(0,0,0,0.35)] active:translate-y-0.5 active:border-b-[1px] active:scale-[0.95]`), ikon panah kiri / chevron-left drop-shadow.
      - **Judul Header**: Judul "Archived Goals" menggunakan gaya tipografi 3D tactile TabHeader.
    * **Konten & Daftar Goals Terarsip**:
      - Menampilkan kartu goals yang memiliki `isArchived === true`.
      - Kartu menampilkan ikon goal Tactile 3D (custom photo full bleed jika ada), judul goal, deskripsi, progress bar, nominal, dan badge "ACHIEVED" jika >= 100%.
      - Tombol aksi pada setiap item kartu atau dialog: **Unarchive / Restore** (mengembalikan ke daftar aktif) dan **Delete** (hapus permanen dengan konfirmasi modal 3D).
      - **Empty State**: Jika belum ada goal yang diarsipkan, menampilkan pesan bersih tanpa box berlebihan ("No Archived Goals", "Goals you archive will appear here").
    * **Pantangan Mutlak**: Dilarang blur (`backdrop-blur-*`), dilarang badge/tag/pill di luar instruksi.

- **[2026-10-13] APK Non-Fullscreen (Status Bar & Navbar Sistem Terlihat) & Optimasi Performa 60+ FPS**:
  - **Tampilan APK Non-Fullscreen**:
    * DILARANG membuat aplikasi immersive / fullscreen yang menyembunyikan statusbar atau navigation bar sistem Android.
    * Status bar sistem di bagian atas WAJIB terlihat (warna background disesuaikan dengan header Discord `#1E1F22`, teks/ikon status bar terang/light).
    * Navigation bar sistem Android di bagian bawah WAJIB terlihat.
    * Menjaga safe area insets agar layout aplikasi tidak tertutup status bar atau navigasi sistem.
  - **Optimasi Performa 60+ FPS (Bebas Stutter / Lag)**:
    * WebView Hardware Acceleration di Android wajib aktif (`android:hardwareAccelerated="true"`).
    * Disable Lenis smooth scroll pada perangkat mobile/Android WebView (Lenis bentrok dengan native touch scrolling di Android WebView sehingga mengakibatkan framerate drop ke ~20 FPS). Gunakan smooth native momentum scrolling (`-webkit-overflow-scrolling: touch; overscroll-behavior: contain;`).
    * Optimasi filter grafis berat: ganti drop-shadow berulang yang berat pada CSS/SVG dengan bayangan performan ramah GPU.
    * Optimasi animasi Framer Motion: gunakan GPU-accelerated CSS transforms (`x`, `y`, `opacity`) dengan kurva transisi yang efisien (menghindari spring physics berlebih yang membebani CPU WebView).
    * Pastikan seluruh render loop berjalan stabil pada 60-120 FPS di perangkat mobile Android.

- **[2026-10-13] Tombol Filter/Sorting di Halaman Goals Wajib Bergaya 3D Tactile**:
  - DILARANG membuat tombol filter/sorting (Created, Updated, A-Z, Progress) berbentuk flat 2D biasa.
  - Seluruh tombol sorting wajib menggunakan style **Tactile 3D**:
    * **State Aktif**: Gradient Blurple `bg-gradient-to-b from-[#6975F7] to-[#4752C4]`, bevel bawah `border-b-[2px] border-[#363FA0]`, specular highlight `shadow-[inset_0_1px_1px_rgba(255,255,255,0.45),0_2px_5px_rgba(88,101,242,0.35)]`, ring `ring-1 ring-[#1E1F22]`, teks putih ber-drop shadow, active press `active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]`.
    * **State Inaktif**: Gradient Dark Slate `bg-gradient-to-b from-[#4E5058] to-[#35373C]`, bevel bawah `border-b-[2px] border-[#232428]`, specular highlight `shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_2px_4px_rgba(0,0,0,0.3)]`, ring `ring-1 ring-[#1E1F22]`, teks `#DBDEE1` ber-drop shadow, active press `active:translate-y-0.5 active:border-b-[1px] active:scale-[0.98]`.

- **[2026-10-14] Git Commit & Push ke GitHub**:
  - Remote repository: `https://github.com/imanecdoche/discash.git`
  - Mengikuti standar Conventional Commits, menjaga kebersihan commit (tidak men-commit build binaries, node_modules, .apk, atau cache gradle).

- **[2026-10-14] README.md dalam Bahasa Inggris dengan Logo & Tags**:
  - Menyusun `README.md` komprehensif dalam bahasa Inggris.
  - Memuat logo di bagian atas dan tags/badges teknologi terkait proyek (React, TypeScript, Tailwind CSS, Capacitor, PWA, Framer Motion).
