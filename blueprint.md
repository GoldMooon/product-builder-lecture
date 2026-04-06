# Lotto Number Recommendation Site Blueprint

## Overview

This application is a modern, premium Lotto Number Recommendation Site built using native Web Components. It features a highly polished UI with glassmorphism, 3D effects, and smooth animations.

## Project Outline

### Style and Design

*   **Aesthetics:**
    *   **Glassmorphism:** Semi-transparent containers with `backdrop-filter: blur`.
    *   **3D Spherical Balls:** Custom elements with multi-layered shadows and glossy highlights.
    *   **Gradients:** Use of vibrant, high-contrast gradients for buttons and text.
    *   **Texture:** Subtle SVG-based noise texture on the background for a premium feel.
*   **Typography:** Bold, expressive font stack (`Inter`) with responsive sizing.
*   **Interactivity:** 
    *   Pulsing "Generate Luck!" button with hover glow effects.
    *   Pop-in and staggered animations for the lottery balls.
    *   Visual feedback on all interactive elements.

### Components

*   **`<lotto-ball>`**: Displays a single number with a premium 3D look and range-based color coding (OKLCH).
*   **`<lotto-generator>`**: The central dashboard that orchestrates the number generation and presentation.

## Current State

*   **Refactoring & Feature Completion:**
    *   Fully refactored using native Web Components and Shadow DOM.
    *   Modern UI/UX with glassmorphism and premium animations.
    *   Advanced logic for multiple sets, bonus numbers, and session history.
    *   **History Clearing:** Users can now delete all session records via the "기록 삭제" button.
*   **Affiliate Inquiry Form:**
    *   Integrated a contact form for affiliate inquiries powered by Formspree.
    *   Styled to match the premium, modern aesthetic of the site.
*   **AI Gender Classifier:**
    *   Implemented a real-time AI test using Teachable Machine.
    *   **Dual Mode:** Supports both live webcam feed and local image file uploads.
    *   Features dynamic probability bars that automatically adapt to model classes.
    *   Integrated as a reusable Web Component with Shadow DOM encapsulation.
*   **Comments System:**
    *   Integrated Disqus comment thread for user engagement.
    *   Seamlessly blended into the main UI container.
*   **Monetization:**
    *   Integrated Google AdSense for site monetization.
    *   Added `ads.txt` for publisher verification.

## Next Steps

1.  **Persistence:** Implement `localStorage` to save history across browser sessions.
2.  **Sound Effects:** (Optional) Add subtle click or pop sounds for a more tactile experience.
3.  **Deployment:** Keep the GitHub repository updated with latest features.
