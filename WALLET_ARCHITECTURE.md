# Discash — Wallet (Unallocated Assets) Architecture & Flow Specification

> **Status Dokumen**: Rancangan Arsitektur (Draft Review).  
> Silakan baca dan edit bagian mana pun dari dokumen ini jika ada penyesuaian. Kode baru akan dieksekusi setelah rancangan ini Anda setujui.

---

## 1. Konsep & Tujuan Fitur Wallet (Assets)
Fitur **Wallet (Assets)** memungkinkan pengguna mencatat saldo bebas (*unallocated funds*) yang belum dimasukkan ke dalam *Savings Goal* mana pun.
- Pengguna dapat membuat **lebih dari 1 Wallet** (misal: `BCA`, `Mandiri`, `GoPay`, `Cash`, `Bibit`) dengan saldo masing-masing.
- Ketika pengguna ingin menambah dana (*Deposit / Add Funds*) atau menarik dana (*Withdraw*) pada suatu Goal, pengguna dapat memilih:
  1. **Dari / Ke Wallet tertentu** (memotong atau menambah saldo wallet secara otomatis & terintegrasi).
  2. **External / Direct** (pemasukan atau penarikan langsung dari luar tanpa mengubah saldo wallet yang ada).

---

## 2. Penempatan UI & Navigasi (Anti-Clutter & Zero Box-in-Box)
Agar `BottomNavbar` tetap bersih dengan 5 tombol simetris (`Dashboard`, `Goal`, `CTA +`, `Profile`, `Settings`), halaman Wallets ditempatkan dengan pola yang 100% konsisten dengan `GoalArchivePage`:

### A. Entry Point di Dashboard (`activeTab === 'dashboard'`)
1. **Tombol Ikon Wallet Tactile 3D di Header Dashboard**:
   - Berada di sebelah kanan baris `TabHeader title="Dashboard"` (identik dengan posisi tombol Archive di halaman Goals).
   - Style: `w-10 h-10 rounded-2xl` Tactile 3D Dark Slate (`from-[#4E5058] to-[#35373C]`, `border-b-[2.5px] border-[#232428]`, `ring-2 ring-[#1E1F22]`).
2. **Interaksi Kartu `TotalBalanceCard` di Dashboard**:
   - Menampilkan informasi saldo dengan jelas:
     - **Total Savings (In Goals)**: Total dana yang sedang terkumpul di seluruh Goal aktif.
     - **Unallocated Assets (Wallets)**: Ringkasan total saldo bebas dari seluruh Wallet + indikator jumlah wallet (klik pada kartu atau tombol header langsung membuka **Wallets Page**).

### B. Halaman Wallets Fullscreen (`WalletPage.tsx`)
- **Cakupan Layar**: Fullscreen overlay (`fixed inset-0 z-[60] bg-[#313338]`), menutupi header utama & bottom navbar.
- **Animasi Transisi**: Murni *slide horizontal* dari kanan (`x: '100%' -> 0` saat dibuka, `x: '100%'` saat ditutup) menggunakan `AnimatePresence`, menjaga performa GPU 60+ FPS.
- **Header Halaman Wallets**:
  - Kiri: **Tombol Back Tactile 3D** + Judul **"Wallets"** (bergaya tipografi 3D Tactile `TabHeader`).
  - Kanan: **Tombol `+ Add Wallet` Tactile 3D Blurple** (`w-10 h-10 rounded-2xl`).
- **Konten Halaman Wallets**:
  1. **Ringkasan Total Unallocated Assets**: Menampilkan akumulasi seluruh saldo dari semua wallet aktif di bagian atas.
  2. **Daftar Kartu Wallet**:
     - Setiap kartu menampilkan: Ikon Wallet Tactile 3D (preset atau *full-bleed custom photo*), Nama Wallet, Deskripsi/Catatan singkat (opsional), dan Saldo Saat Ini (`formatIDR(wallet.balance)`).
     - **Tap Kartu Wallet**: Membuka `WalletDetailSheet` (Bottom Sheet).
     - **Tap & Hold (Long Press ~500ms)**: Membuka `WalletActionPickerSheet` (Pin/Unpin, Top Up, Deduct, Edit, Delete).
  3. **Empty State Wallets** (jika `wallets.length === 0`):
     - Ikon dompet berdiri bebas (*naked icon*, tanpa box/lingkaran background, warna netral `#949BA4` / `#4E5058`, dilarang warna ungu).
     - Judul: `"No Wallets Yet"`, Deskripsi: `"Tap the + button to add your first asset wallet."`

---

## 3. Arsitektur Data & Storage (`localStorage`)

### A. Tipe Data Baru: `src/types/wallet.ts`
Disimpan secara reaktif di `localStorage` dengan key `discash_wallets`:

```ts
export interface WalletTransaction {
  id: string
  walletId: string
  type: 'topup' | 'deduct' | 'goal_deposit' | 'goal_withdraw'
  amount: number
  note: string
  relatedGoalId?: string
  relatedGoalTitle?: string
  createdAt: string
}

export interface Wallet {
  id: string
  name: string                  // Auto Title Case (e.g. "BCA Personal", "GoPay")
  description?: string          // Opsional (e.g. "Main payroll account")
  balance: number               // Saldo bebas (unallocated) dalam IDR
  icon: string                  // ID icon preset ('wallet', 'bank', 'card', 'cash', dll.) atau 'custom'
  customPhoto?: string          // Base64 / Data URL full-bleed photo
  isPinned?: boolean            // Pin wallet ke urutan paling atas
  createdAt: string
  updatedAt?: string
  transactions?: WalletTransaction[]
}
```

### B. Perluasan Tipe `GoalTransaction` (`src/types/goal.ts`)
Menambahkan referensi sumber/tujuan dana agar riwayat transaksi dan Digital Invoice tahu dari mana dana berasal:

```ts
export interface GoalTransaction {
  id: string
  goalId: string
  type: 'deposit' | 'withdraw'
  amount: number
  note: string
  createdAt: string
  sourceType?: 'wallet' | 'external' // Default: 'external' jika tidak pakai wallet
  walletId?: string                  // ID wallet jika menggunakan wallet
  walletName?: string                // Snapshot nama wallet untuk Digital Invoice
  walletTransactionId?: string       // ID transaksi pasangan di Wallet untuk sinkronisasi hapus/revert
}
```

---

## 4. User Flow Lengkap (End-to-End)

### Flow 1: Membuat Wallet Baru (`NewWalletSheet.tsx`)
1. User menekan tombol `+` di halaman Wallets (atau tombol cepat buat wallet dari sheet mutasi goal).
2. `NewWalletSheet` meluncur dari bawah (`y: '100%' -> 0`, murni slide vertikal tanpa opacity fade, backdrop gelap `bg-black/75` tanpa blur, drag handle Tactile 3D `w-12` -> `w-20`).
3. Form Input (langsung di atas surface `#2B2D31`, *no box-in-box*):
   - **Wallet Name** (`*`): Auto Title Case saat mengetik.
   - **Initial Balance (IDR)**: Boleh diisi `0` atau nominal saldo awal (otomatis mencatat transaksi awal `Initial Balance` jika `> 0`).
   - **Description** (`optional`): Catatan singkat.
   - **Wallet Icon / Custom Photo**: Pilihan preset icon atau upload foto penuh (*full-bleed*).
4. Sticky bottom bar: Tombol **Cancel** (Tactile 3D Slate) & **Save Wallet** (Tactile 3D Blurple).

### Flow 2: Detail Wallet & Mutasi Saldo Mandiri (`WalletDetailSheet.tsx` & `WalletMutationSheet.tsx`)
1. Saat kartu wallet di-tap, `WalletDetailSheet` muncul dari bawah:
   - Menampilkan Ikon Tactile 3D, Nama Wallet, Total Available Balance (`formatIDR`), tombol titik tiga (`More Options`: Pin/Unpin, Edit Wallet, Delete Wallet) dan tombol Close merah Tactile 3D.
   - Menampilkan **Wallet Transaction History** (termasuk top-up manual, pengeluaran, maupun alokasi dari/ke Goals).
   - Sticky bottom bar (tanpa label header):
     - **+ Add Balance (Top Up)**: Tombol Tactile 3D Hijau (`#23A55A`).
     - **- Deduct Balance (Withdraw)**: Tombol Tactile 3D Oranye Terang (`#FF7A00`).

### Flow 3: Alokasi Budget ke Goal (`GoalMutationSheet.tsx` — Deposit)
Ketika user membuka Goal dan menekan **+ Add Funds**:
1. `GoalMutationSheet` terbuka.
2. Di atas input nominal, terdapat pemilih **Funding Source (Sumber Dana)** bergaya Tactile 3D:
   - Opsi default pertama: **`External / Direct`** (dana dari luar, tidak memotong wallet mana pun).
   - Daftar Wallet user: menampilkan masing-masing Wallet beserta saldo tersedianya (misal: `BCA • IDR 2,500,000`, `GoPay • IDR 350,000`).
3. Jika user memilih **salah satu Wallet**:
   - Menampilkan indikator saldo tersedia dari wallet tersebut.
   - Tersedia tombol cepat `Max` (opsional/praktis) untuk mengisi nominal sesuai sisa saldo wallet atau sisa target goal.
   - Saat klik **Deposit**:
     - Validasi: Apakah `amount <= selectedWallet.balance`?
     - Jika valid:
       1. Saldo `selectedWallet.balance` **berkurang** sebesar `amount`.
       2. Riwayat transaksi wallet mencatat `goal_deposit` (`"Allocated to [Goal Title]"`).
       3. Saldo `goal.currentAmount` **bertambah** sebesar `amount`.
       4. Riwayat transaksi goal mencatat `deposit` dengan `sourceType: 'wallet'`, `walletId`, `walletName`, dan `walletTransactionId`.
4. Jika user memilih **External / Direct**:
   - Berjalan seperti biasa: langsung menambah `goal.currentAmount` tanpa memotong wallet.

### Flow 4: Penarikan Dana dari Goal (`GoalMutationSheet.tsx` — Withdraw)
Ketika user menekan **- Withdraw** pada Goal:
1. Pemilih berubah menjadi **Withdraw Destination (Tujuan Penarikan)**:
   - **`External / Direct`** (dana ditarik keluar aplikasi).
   - **Daftar Wallet user** (dana dikembalikan ke saldo bebas di Wallet yang dipilih).
2. Jika user memilih **salah satu Wallet**:
   - `goal.currentAmount` **berkurang** sebesar `amount`.
   - `selectedWallet.balance` **bertambah** sebesar `amount` (mencatat `goal_withdraw`: `"Withdrawn from [Goal Title]"`).

### Flow 5: Menghapus Riwayat Transaksi (Two-Way Atomic Revert)
1. Jika user menghapus transaksi Goal (melalui `GoalDetailSheet` atau `TransactionReceiptSheet`) yang bersumber dari Wallet (`sourceType === 'wallet'`):
   - Dialog konfirmasi hapus menjelaskan bahwa saldo Goal **dan** saldo Wallet terkait akan di-revert secara otomatis.
   - Jika transaksi adalah `deposit` dari Wallet X -> Saldo Goal dikurangi, Saldo Wallet X **dikembalikan (ditambah)**, dan record pasangan di Wallet X ikut dihapus.
   - Jika transaksi adalah `withdraw` ke Wallet X -> Saldo Goal ditambah kembali, Saldo Wallet X **dikurangi** kembali (maksimal hingga 0).
2. Begitu pula sebaliknya: jika user menghapus transaksi alokasi Goal dari dalam `WalletDetailSheet`, saldo Goal terkait ikut di-revert secara sinkron.

### Flow 6: Digital Invoice (`TransactionReceiptSheet.tsx`)
- Pada faktur digital transaksi Goal, ditambahkan 1 baris informasi bersih:
  - **Source / Destination**: Menampilkan Nama Wallet (misal: `BCA Main`) atau `External Funds` jika tidak menggunakan wallet.

---

## 5. Success States & Error States

### A. Error States (Validasi & Penanganan Edge Cases)
1. **Insufficient Wallet Balance (Saldo Wallet Tidak Cukup saat Deposit ke Goal)**:
   - Kondisi: User memilih Wallet A (Saldo `IDR 200,000`), namun mengetik nominal Deposit `IDR 500,000`.
   - Respons UI:
     - Pesan error tegas berwarna merah Discord (`text-xs text-[#F23F43] font-medium`):  
       `"Insufficient balance in [Wallet Name]. Available: IDR 200,000"`
     - Tombol **Deposit** otomatis `disabled` saat nominal melebihi saldo wallet yang dipilih.
2. **Insufficient Wallet Balance saat Deduct Mandiri di Wallet**:
   - Kondisi: User mengurangi saldo wallet melebihi `wallet.balance`.
   - Respons UI: `"Deduction exceeds current wallet balance (IDR xxx)"`.
3. **Insufficient Goal Balance saat Withdraw dari Goal**:
   - Kondisi: User menarik dana melebihi `goal.currentAmount`.
   - Respons UI: `"Withdrawal exceeds current goal savings (IDR xxx)"`.
4. **Invalid / Zero Amount**:
   - Kondisi: Input nominal kosong atau `<= 0`.
   - Respons UI: `"Please enter a valid amount greater than 0"`.
5. **Empty Wallet Name**:
   - Kondisi: Nama wallet kosong saat membuat/mengedit wallet.
   - Respons UI: Tombol Save `disabled`.
6. **Wallet Terhapus Setelah Transaksi Dibuat**:
   - Kondisi: User menghapus Wallet A, lalu melihat riwayat transaksi lama di Goal atau menghapus transaksi lama di Goal.
   - Penanganan:
     - Faktur Digital tetap menampilkan nama wallet dari snapshot `trx.walletName` (`"BCA (Deleted)"` atau `"BCA"`).
     - Saat transaksi Goal dihapus dan wallet aslinya sudah tidak ada, saldo Goal tetap di-revert dengan aman tanpa crash.
7. **Purge Account (`AccountProfilePage.tsx`)**:
   - Saat user melakukan *Purge Account*, sistem membersihkan `discash_goals` **dan** `discash_wallets` dari `localStorage` serta me-reset state ke `[]`.

### B. Success States (Visual & Tactile Feedback)
1. **Real-Time Balance Sync**:
   - Begitu mutasi berhasil, angka pada `TotalBalanceCard`, `WalletPage`, dan `GoalPage` langsung terupdate secara instan tanpa reload.
2. **Digital Invoice Terintegrasi**:
   - Setiap transaksi (baik Goal maupun Wallet) dapat diklik untuk membuka `TransactionReceiptSheet` (lengkap dengan ikon ceklis 3D hijau glowing dan fitur **Download Invoice PNG** dengan `skipFonts: true`).
3. **Visual Selection State pada Pemilih Wallet**:
   - Pilihan sumber dana (`External` vs daftar `Wallets`) di `GoalMutationSheet` menggunakan tombol Tactile 3D:
     - Saat terpilih: Tactile 3D Blurple (`from-[#6975F7] to-[#4752C4]`, `border-b-[2.5px] border-[#363FA0]`, ikon ceklis putih di sebelah kiri).
     - Saat tidak terpilih: Surface gelap Discord (`bg-[#1E1F22]`, border `#1F2023`, teks `#949BA4`).

---

## 6. Struktur File yang Akan Dibuat / Diperbarui

### File Baru:
1. `src/types/wallet.ts` — Definisi interface `Wallet` dan `WalletTransaction`.
2. `src/components/WalletPage.tsx` — Halaman fullscreen daftar Wallets (slide-in dari kanan), ringkasan total unallocated assets, search/sort, dan empty state.
3. `src/components/NewWalletSheet.tsx` — Bottom sheet pembuatan wallet baru.
4. `src/components/WalletDetailSheet.tsx` — Bottom sheet detail wallet, riwayat transaksi wallet, edit wallet, dan konfirmasi hapus.
5. `src/components/WalletMutationSheet.tsx` — Bottom sheet tambah/kurang saldo wallet mandiri.
6. `src/components/WalletActionPickerSheet.tsx` — Bottom sheet long-press menu pada kartu wallet.

### File yang Diperbarui:
1. `src/types/goal.ts` — Menambahkan field opsional `sourceType`, `walletId`, `walletName`, `walletTransactionId` pada `GoalTransaction`.
2. `src/components/TotalBalanceCard.tsx` — Menampilkan informasi Unallocated Wallet Assets & akses cepat ke halaman Wallets.
3. `src/components/GoalMutationSheet.tsx` — Menambahkan pemilih **Source Wallet / Destination Wallet** (`External` atau pilih dari daftar `Wallets`) beserta validasi saldo wallet.
4. `src/components/GoalDetailSheet.tsx` — Menampilkan indikator nama wallet pada item riwayat transaksi goal & meneruskan data mutasi wallet.
5. `src/components/TransactionReceiptSheet.tsx` — Menampilkan informasi sumber/tujuan Wallet pada faktur digital.
6. `src/App.tsx` — State management `wallets` (`localStorage: 'discash_wallets'`), fungsi sinkronisasi dua arah antara Wallet dan Goal, serta tombol akses Wallets di header Dashboard.
7. `.agents/RULES.md` — Mencatat spesifikasi fitur Wallet sesuai aturan mutlak proyek.

---

## 7. Checklist Kepatuhan Aturan Proyek (`.agents/RULES.md` & `ai-anti-patterns.md`)
- [x] **Bahasa UI**: 100% Bahasa Inggris (English UI).
- [x] **Format Mata Uang**: Mengikuti pengaturan `formatIDR` (otomatis mendukung IDR/Rp/USD/$ dan desimal sesuai Settings).
- [x] **No Unrequested Badges/Pills**: Tidak membuat badge/tag/pill baru.
- [x] **No Box-in-Box**: Seluruh form dan daftar transaksi menyatu langsung di atas surface `#2B2D31` / `#313338`.
- [x] **No Backdrop Blur**: Seluruh backdrop modal/sheet murni gelap (`bg-black/75` atau `bg-black/80`) tanpa `backdrop-blur`.
- [x] **Pure Vertical Slide Sheets**: Seluruh sheet panel murni `y: '100%' -> 0` tanpa animasi opacity/fading.
- [x] **Tactile 3D Design**: Seluruh tombol utama, tombol close merah, tombol titik tiga, drag handle (`w-12` -> `w-20`), dan wadah ikon menggunakan gaya Tactile 3D.
- [x] **Naked Empty State Icon**: Ikon empty state berdiri bebas tanpa box/lingkaran dan tanpa warna ungu.
- [x] **Performa 60+ FPS**: Menggunakan `transform-gpu will-change-transform` dan native touch momentum scrolling.
