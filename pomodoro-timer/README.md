# Pomodoro Timer

A clean, minimalist Pomodoro Timer web app to help you focus with 25-minute work sessions and 5-minute breaks.

## Live Demo

**[https://pomodoro-timer-coral-sigma.vercel.app](https://pomodoro-timer-coral-sigma.vercel.app)**

## Features

- **Timer Core**: 25-minute work / 5-minute break countdown with circular progress ring
- **Start / Pause / Reset**: Full timer control
- **Mode Switching**: Toggle between Work and Break modes with distinct color themes (red/green)
- **Visual Feedback**: Pulsing animation and color change when timer finishes
- **Completion Count**: Tracks daily completed pomodoros (persisted via localStorage)
- **Custom Durations**: Adjustable work (15-60 min) and break (1-15 min) times
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- TypeScript
- Tailwind CSS 4
- Deployed on [Vercel](https://vercel.com/)

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building

```bash
npm run build
npm start
```
