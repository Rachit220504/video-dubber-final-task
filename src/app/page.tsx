"use client";
import { useState } from "react";
import styles from "./page.module.css";
import MediaCanvas from "../components/MediaCanvas";
import MediaControls from "../components/MediaControls";
import Timeline from "../components/Timeline";

type MediaType = {
  type: "video" | "image";
  file: File;
  width: number;
  height: number;
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
};

export default function Home() {
  const [selectedMedia, setSelectedMedia] = useState<MediaType | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Clean up previous media
    setSelectedMedia(null);
    setIsPlaying(false);
    setCurrentTime(0);

    // Small delay to ensure cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 0));

    if (file.type.startsWith("video/")) {
      // Create temporary video element to get duration
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.src = URL.createObjectURL(file);

      await new Promise((resolve) => {
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
          setSelectedMedia({
            type: "video",
            file,
            width: 320,
            height: 240,
            startTime: 0,
            endTime: video.duration,
            position: { x: 100, y: 100 },
          });
          resolve(null);
        };
      });
    } else {
      setSelectedMedia({
        type: "image",
        file,
        width: 320,
        height: 240,
        startTime: 0,
        endTime: 5, // Default 5 seconds for images
        position: { x: 100, y: 100 },
      });
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.workspaceContainer}>
        <aside className={styles.sidebar}>
          <div className={styles.uploadSection}>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileUpload}
              id="fileUpload"
              className={styles.fileInput}
            />
            <label htmlFor="fileUpload" className={styles.uploadButton}>
              Upload Media
            </label>
          </div>
          {selectedMedia && (
            <MediaControls
              media={selectedMedia}
              onUpdate={setSelectedMedia}
            />
          )}
        </aside>
        <main className={styles.main}>
          <MediaCanvas 
            media={selectedMedia} 
            onUpdate={setSelectedMedia}
            currentTime={currentTime}
            isPlaying={isPlaying}
          />
          <Timeline 
            media={selectedMedia}
            currentTime={currentTime}
            onTimeUpdate={setCurrentTime}
            isPlaying={isPlaying}
            setIsPlaying={setIsPlaying}
          />
        </main>
      </div>
    </div>
  );
}
