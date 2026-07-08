# 📅 5th Sem Timetable Downloader

A premium, highly interactive web application built with **Next.js**, **React**, and **TypeScript** designed for 5th Semester CSE students at KIIT University. It solves the hassle of reading complex master timetables by allowing students to generate and download a personalized, color-coded weekly schedule based on their specific core section and electives.

---

## ✨ Features

- **Personalized Schedule Builder**: Select your **CSE Core Section**, **Professional Elective 1 (PE-1)**, and **Professional Elective 2 (PE-2)** to instantly filter and merge your classes.
- **Auto-Updating Daily Feed**: Automatically detects the current day and highlights your immediate classes for the day. Includes tabs to switch weekdays quickly.
- **Weekly Table View**: Toggle to see a full 5-day grid displaying your core and elective slots in one place.
- **High-Resolution Exports**: 
  - **As PNG Image**: Export a clean, light-themed, high-definition (3x upscale) image of your weekly schedule.
  - **As PDF Document**: Export a landscape A3-sized print-ready PDF document.
- **Subject Color Coding**: Unique, high-contrast pastel colors automatically assigned to each subject and lab (e.g. DAA, CN, SE, Electives) for quick visual scanning.
- **Premium Glassmorphism Design**: Elegant marble-glass look featuring a blurred KIIT Library background, smooth micro-animations, custom select boxes, and full **Dark / Light Theme support**.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Frontend Library**: [React](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: Vanilla CSS with custom theme variables
- **Export Libraries**: [html2canvas](https://html2canvas.hertzen.com/) (scaled for crisp resolution) & [jsPDF](https://github.com/parallax/jsPDF)

---

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) installed.

### Installation

1. Clone this repository (or run in your downloaded folder):
   ```bash
   cd "Timetable 5th Sem"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (or the port specified in terminal) in your browser.

### Building for Production

To create an optimized production build:
```bash
npm run build
npm start
```

---

## 👤 Credits

Created with ❤️ by **[Debayan Samal](https://www.linkedin.com/in/debayan-samal-4a8484215/)**.
