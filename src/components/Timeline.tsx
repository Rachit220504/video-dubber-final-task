import { useState, useEffect, useRef } from 'react';
import styles from './Timeline.module.css';

type TimelineProps = {
  media: {
    type: "video" | "image";
    startTime: number;
    endTime: number;
  } | null;
  currentTime: number;
  onTimeUpdate: (time: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
};

export default function Timeline({ media, currentTime, onTimeUpdate, isPlaying, setIsPlaying }: TimelineProps) {
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);

  const togglePlay = () => {
    if (!media || media.type !== 'video') return;
    
    if (currentTime >= media.endTime) {
      onTimeUpdate(media.startTime);
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (!isPlaying || !media) return;

    let startTime = performance.now() - (currentTime * 1000);
    let frameId: number;

    const updateFrame = () => {
      const now = performance.now();
      const newTime = (now - startTime) / 1000;

      if (newTime >= media.endTime) {
        setIsPlaying(false);
        onTimeUpdate(media.startTime);
        return;
      }

      onTimeUpdate(Math.min(newTime, media.endTime));
      frameId = requestAnimationFrame(updateFrame);
    };

    frameId = requestAnimationFrame(updateFrame);

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [isPlaying, media, onTimeUpdate, setIsPlaying]);

  // Improve time update handling
  const handleTimeUpdate = (newTime: number) => {
    if (!media) return;
    const clampedTime = Math.max(
      media.startTime,
      Math.min(newTime, media.endTime)
    );
    onTimeUpdate(Number(clampedTime.toFixed(1)));
  };

  // Reset timeline when media changes
  useEffect(() => {
    onTimeUpdate(0);
    setIsPlaying(false);
    lastTimeRef.current = 0;
  }, [media, onTimeUpdate]);

  // Update keyboard control effect
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && media?.type === 'video') {
        e.preventDefault();
        if (currentTime >= media.endTime) {
          onTimeUpdate(media.startTime);
        }
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleTimeUpdate(currentTime - 0.1);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleTimeUpdate(currentTime + 0.1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentTime, media, isPlaying, setIsPlaying]);

  // Only show timeline for videos
  if (!media || media.type !== 'video') return null;

  return (
    <div className={styles.timeline}>
      <button 
        className={styles.playButton}
        onClick={togglePlay}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <div className={styles.timeDisplay}>
        {currentTime.toFixed(1)}s
      </div>
    </div>
  );
}
