# Shift-Proof Scheduler

**Shift-Proof Scheduler** is a Progressive Web Application (PWA) designed to help shift workers manage their circadian rhythms, health, and productivity. It provides intelligent, science-backed schedules for sleep, meals, and workouts based on specific shift timings.

This application is built with React, TypeScript, Vite, and Tailwind CSS v4.

## 🚀 Key Features

### 1. 📅 Interactive Calendar & Scheduling
- **Shift Tracking:** Easily assign shifts to specific dates using an intuitive calendar interface.
- **Month Navigation:** Seamlessly plan ahead by navigating between months.
- **Visual Coding:** Shifts are color-coded for quick recognition (e.g., Purple for Night Shift, Green for Weekoff).
- **Local Persistence:** Your schedule is saved locally on your device, ensuring privacy and data availability.

### 2. 🧠 Intelligent Protocols
The app automatically generates a daily protocol based on your assigned shift:
- **Night Shift (10 PM – 6 AM):** Prioritizes light management and digestion. Includes advice for anchor sleep and pre-shift naps.
- **Regular Shift (9:30 AM – 6:30 PM):** Focuses on circadian consistency.
- **Early Morning (6 AM – 3 PM):** optimized for an early wind-down routine.
- **Afternoon (1 PM – 10 PM):** Maximizes morning productivity.

### 3. 🔄 Dynamic Recovery Logic
The "Weekoff" logic is context-aware:
- **Post-Night Recovery:** If your previous day was a Night shift, the app recommends a recovery protocol (extra sleep, light activity).
- **Pre-Night Prep:** If your next day is a Night shift, it suggests a prophylactic nap and later sleep times to adjust your body clock.
- **Standard Rest:** A balanced schedule for fully off days.

### 4. 💪 Workout & Nutrition Plans
- **Hybrid PPL Workout:** A built-in Push/Pull/Legs routine tailored for a 3-day split.
- **Nutrition Guide:** Calorie and protein targets (~1800kcal / 140g Protein) with meal templates (currently optimized for an Ovo-Vegetarian diet).

### 5. 📱 PWA Support
- **Installable:** Can be installed on mobile (iOS/Android) and desktop as a native-like app.
- **Offline Capable:** Works without an internet connection once loaded.
- **Notifications:** Built-in support for shift reminders (requires permission).

## 🛠️ Tech Stack

- **Framework:** [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Date Handling:** [date-fns](https://date-fns.org/)
- **PWA:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd sleep
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Start the development server**
    ```bash
    npm run dev
    ```

4.  **Build for production**
    ```bash
    npm run build
    ```

5.  **Preview the build**
    ```bash
    npm run preview
    ```

## 📱 Usage Guide

1.  **Home ("Today"):** Shows your current day's protocol. If no shift is set, it prompts you to assign one.
2.  **Calendar:** Tap dates to select them, then choose a shift type from the list below. Use the arrows to switch months.
3.  **Workout:** View the recommended exercises, sets, and reps.
4.  **Eats:** Check your daily calorie/protein targets and meal suggestions.

## 🤝 Contributing

1.  Fork the project.
2.  Create your feature branch: `git checkout -b feature/AmazingFeature`
3.  Commit your changes: `git commit -m 'Add some AmazingFeature'`
4.  Push to the branch: `git push origin feature/AmazingFeature`
5.  Open a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).