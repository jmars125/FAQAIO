# Game Walkthrough Viewer

An Electron application that converts text-based game walkthroughs into an interactive, clickable format with dark mode support.

## Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

## Installation

1. Install Node.js and npm from [https://nodejs.org/](https://nodejs.org/)
2. Clone or download this repository
3. Open a terminal in the project directory
4. Install dependencies:
```bash
npm install
```

## Running the Application

To start the application, run:
```bash
npm start
```

## Features

- Load text-based walkthrough files
- Automatic table of contents generation
- Click-to-navigate sections
- Dark mode toggle
- Persistent theme preference
- Markdown support for formatted content

## Walkthrough File Format

The application expects walkthrough files to be formatted with clear section headers. Headers should start at the beginning of the line (no leading spaces), and content should be indented. For example:

```
Introduction
    Welcome to the game walkthrough...
    Basic controls and information...

Chapter 1: Getting Started
    First, head to the town square...
    Talk to the merchant...

Boss Battle: Dragon King
    Phase 1: Fire attacks
    Phase 2: Flying sequence
```

## Usage

1. Launch the application
2. Click "Open Walkthrough" to select a text file
3. Use the table of contents on the left to navigate sections
4. Toggle dark mode using the button in the top-right corner 