# Project Overview


This project demonstrates video frame capture, encoding, decoding, and interactive display using WebCodecs. It is tested to work correctly in Chrome browser 39.0.7258.155 (Official Build) (arm64).

- The video stream is displayed while the screen colour toggles between white and black.
- The project chooses the highest resolution camera available for capturing video.
- 20 frames are captured from the video stream and encoded using WebCodecs.
- The encoded frames are then decoded and displayed as images in a gallery.
- Each image in the gallery can be zoomed by clicking on it.

pnpm i

# Bootstrap Project

This project was bootstrapped using a modern frontend toolchain. To create a similar project from scratch, you can use a project scaffolding tool such as Vite, Create React App, or similar.

## How to Bootstrap a Project

1. Choose a frontend framework (e.g., React, Vue, Svelte).
2. Use a scaffolding tool to generate the initial project structure:
  - For Vite: `npm create vite@latest`
  - For Create React App: `npx create-react-app my-app`
3. Install dependencies:
  - `npm install` or `pnpm install`
4. Start the development server:
  - `npm run dev` or `npm start`

Refer to the documentation of your chosen tool for more details.
