<p align="center">
  <img src="public/pwa-192x192.png" width="100" height="100" alt="Discash Logo" />
</p>

<h1 align="center">Discash</h1>

<p align="center">
  <b>A tactile, Discord-themed personal savings and financial goal tracking mobile application.</b>
</p>

<p align="center">
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://vite.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://capacitorjs.com/"><img src="https://img.shields.io/badge/Capacitor_Android-119EFF?style=for-the-badge&logo=capacitor&logoColor=white" alt="Capacitor Android" /></a>
  <a href="https://www.framer.com/motion/"><img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" /></a>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Style-Discord_Dark_Tactile_3D-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Style" />
  <img src="https://img.shields.io/badge/Performance-60%2B_FPS-22C55E?style=for-the-badge&logo=speedtest&logoColor=white" alt="60+ FPS" />
  <img src="https://img.shields.io/badge/PWA-Ready-9B59B6?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Android-SDK_35-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Android SDK 35" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge" alt="MIT License" />
</p>


---

## 📌 Overview

**Discash** is a modern, offline-first personal financial goals and savings tracker designed specifically for mobile users. Styled faithfully after the authentic **Discord Dark Theme**, Discash delivers a rich **Tactile 3D** design experience—featuring physical specular bevels, press-down states, instant visual feedback, and smooth GPU-accelerated 60+ FPS mobile transitions.

Built with **React 19**, **TypeScript**, and **Capacitor**, Discash operates seamlessly both as a Progressive Web App (PWA) and as a native Android APK with full system status bar and navigation bar integration.

---

## ✨ Features

- **Discord-Authentic Tactile 3D Aesthetics**:
  - Discord color palette: `#1E1F22` (Darkest), `#2B2D31` (Surface), `#313338` (Cards), `#5865F2` (Blurple).
  - Physical 3D tactile buttons with specular inset highlights, bottom bevel borders, and realistic press-down transitions.
  - Strictly clean surfaces without artificial background blur for maximum readability and performance.

- **Savings Goal Management**:
  - Create and track custom savings targets with real-time percentage indicators.
  - Multi-criteria tactile 3D sorting tabs: **Created**, **Updated**, **A-Z**, and **Progress**.
  - Custom category icons with tactile 3D styling and full-bleed image upload support.

- **Interactive Long-Press Action Drawer**:
  - Tap-and-hold (long-press) on any goal card to open a contextual action sheet.
  - Quick access to Edit, Deposit / Withdraw, View Details, Archive, and Delete.

- **Dedicated Goals Archive**:
  - Smooth full-screen slide transitions for viewing archived goals.
  - Quick restore back to active goals or permanent deletion with 3D tactile confirmation modals.

- **Transaction History & Digital Receipts**:
  - Record deposits and withdrawals with instant balance adjustments.
  - Delete transaction records safely with 3D tactile confirmation dialogues.
  - Generate digital transaction receipt sheets with unique reference IDs.

- **Native Android Integration (60+ FPS)**:
  - Non-fullscreen layout preserving native Android system status bar and navigation bar.
  - Native momentum scrolling (`-webkit-overflow-scrolling: touch`) and GPU hardware acceleration.
  - Zero dropped frames, maintaining 60-120 FPS on mobile displays.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Core Framework** | [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite](https://vite.dev/) + [Rolldown](https://rolldown.rs/) |
| **Styling & Theme** | [Tailwind CSS](https://tailwindcss.com/) + Custom Tactile 3D Utility Layer |
| **Motion & Gestures** | [Framer Motion](https://www.framer.com/motion/) |
| **Mobile Runtime** | [Capacitor](https://capacitorjs.com/) (Android SDK 35) |
| **Offline & PWA** | [Vite PWA Plugin](https://vite-pwa-org.netlify.app/) (Workbox Service Worker) |
| **Code Quality** | [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) (Zero errors, high-speed linting) |

---

## 📁 Project Structure

```text
discord-mobile/
├── .agents/                 # AI guidelines, architectural rules, and anti-patterns
├── android/                 # Native Android Capacitor wrapper project
│   └── app/src/main/        # AndroidManifest, Java MainActivity, resources & icons
├── public/                  # Static assets, Discord icons, and PWA manifests
├── src/
│   ├── assets/              # App images, Discord SVGs, and animations
│   ├── components/          # Modular UI components
│   │   ├── BottomNavbar.tsx              # Tactile 3D bottom navigation bar
│   │   ├── GoalActionPickerSheet.tsx     # Long-press action drawer
│   │   ├── GoalArchivePage.tsx           # Full-screen goal archive
│   │   ├── GoalDetailSheet.tsx           # Detailed goal view & transaction logs
│   │   ├── GoalPage.tsx                  # Main goal listing & 3D sorting tabs
│   │   ├── Header.tsx                    # Discord logo & notification action
│   │   ├── NewGoalSheet.tsx              # Goal creation drawer
│   │   ├── NotificationHistorySheet.tsx  # Global transaction logs
│   │   └── TransactionReceiptSheet.tsx   # Detailed digital receipt view
│   ├── types/               # TypeScript interfaces (Goal, Transaction, etc.)
│   ├── utils/               # Currency & date formatters
│   ├── App.tsx              # Root component & state management
│   ├── index.css            # Custom tactile 3D styling & animations
│   └── main.tsx             # Application entry point
├── capacitor.config.ts      # Capacitor mobile configuration
├── package.json             # Dependencies and build scripts
└── vite.config.ts           # Vite and PWA configuration
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+) or [Bun](https://bun.sh/)
- [Android Studio](https://developer.android.com/studio) (for building the native Android APK)
- Java Development Kit (JDK 17+)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/imanecdoche/discash.git
   cd discash
   ```

2. **Install dependencies:**
   ```bash
   bun install
   # or: npm install
   ```

3. **Start the local development server:**
   ```bash
   bun run dev
   # or: npm run dev
   ```
   Open `http://localhost:5173` in your browser or mobile viewport emulator.

---

## 📱 Building the Android APK

1. **Build the production web bundle:**
   ```bash
   bun run build
   ```

2. **Sync web assets to Capacitor Android:**
   ```bash
   bunx cap sync android
   ```

3. **Compile the APK with Gradle:**
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   The compiled debug APK will be located at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🧪 Code Hygiene & Linting

Run Oxlint to check code quality:
```bash
bunx oxlint
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
