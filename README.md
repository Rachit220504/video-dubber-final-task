# Video Dubber

A simple web application for managing video and image content with time-based visibility control.

## Features

- Upload and display videos or images on a canvas
- Drag and resize media elements
- Control media dimensions through width/height inputs
- Time-based visibility control with start and end times
- Video playback controls with keyboard shortcuts
- Media positioning with drag handles
- Zoom control (Ctrl + Mouse Wheel)

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/video-dubber.git
cd video-dubber
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Upload Media**
   - Click "Upload Media" to select a video or image file
   - Supported formats: MP4, JPG, PNG, etc.

2. **Control Media Position**
   - Drag the media element to position it
   - Use corner handles to resize
   - Use width/height inputs for precise sizing

3. **Time Control**
   - Set start and end times for media visibility
   - Use play/pause button or spacebar to control playback
   - Use left/right arrow keys to step through time

## Built With

- Next.js
- TypeScript
- CSS Modules
- React Hooks

## Project Structure

```
video-dubber/
├── src/
│   ├── app/
│   │   ├── page.tsx        # Main application page
│   │   └── globals.css     # Global styles
│   └── components/
│       ├── MediaCanvas.tsx # Canvas component for media display
│       ├── MediaControls.tsx # Controls for media properties
│       └── Timeline.tsx    # Playback timeline controls
├── public/
└── package.json
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
