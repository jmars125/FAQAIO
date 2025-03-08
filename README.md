# Game Walkthrough Viewer

An Electron application that converts text-based game walkthroughs into an interactive, clickable format with dark mode support.

## Prerequisites

- Node.js (v16 or higher recommended)
- npm (Node Package Manager)

## Dependencies

The application uses the following main dependencies:
- Electron v28.1.0 - For the desktop application framework
- Marked v11.1.0 - For Markdown parsing and rendering
- JSDOM v22.1.0 - For DOM manipulation

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

## Development

To work on the application:

1. Clone the repository
2. Install dependencies with `npm install`
3. Make your changes
4. Test the changes by running `npm start`

The main application files are:
- `main.js` - The main Electron process
- `index.html` - The application's UI
- `package.json` - Project configuration and dependencies

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
2. Either:
   - Click "Open Walkthrough" to select a text file, or
   - Paste a GameFAQs guide URL directly into the application
3. Use the table of contents on the left to navigate sections
4. Toggle dark mode using the button in the top-right corner

## Using GameFAQs Guides and Text Walkthroughs

### GameFAQs Guides
Simply copy and paste the GameFAQs guide URL into the application. For example:
- https://gamefaqs.gamespot.com/games/guides/[guide-url]
The application will automatically fetch and format the guide for you.

### General Text Walkthroughs
You can use any text-based walkthrough by ensuring it follows these formatting guidelines:
- Each major section should start at the beginning of a line without indentation
- Section content should be indented (using spaces or tabs)
- Empty lines between sections are recommended for better readability
- The text file should use UTF-8 encoding

Example of proper formatting:
```
WALKTHROUGH BASICS
    This section covers the basic controls
    And general game mechanics
    
CHAPTER 1 - THE BEGINNING
    Head to the town square first
    Talk to the merchant about your quest
    
BOSS STRATEGIES
    First Boss: The Giant Spider
        Phase 1: Dodge the web attacks
        Phase 2: Attack when it's stunned
```

## License

ISC License 