import { useState } from 'react';
import styles from './MediaControls.module.css';

type MediaControlsProps = {
  media: {
    type: "video" | "image";
    file: File;
    width: number;
    height: number;
    startTime: number;
    endTime: number;
    position: { x: number; y: number };
  };
  onUpdate: (media: MediaControlsProps["media"]) => void;
};

export default function MediaControls({ media, onUpdate }: MediaControlsProps) {
  const handleChange = (property: string, value: number) => {
    if (isNaN(value)) return;

    switch (property) {
      case 'width':
      case 'height':
        onUpdate({
          ...media,
          [property]: Math.max(50, value)
        });
        break;
      case 'startTime':
        onUpdate({
          ...media,
          startTime: Math.max(0, Math.min(value, media.endTime))
        });
        break;
      case 'endTime':
        onUpdate({
          ...media,
          endTime: Math.max(media.startTime, value)
        });
        break;
    }
  };

  return (
    <div className={styles.controls}>
      <div className={styles.inputGroup}>
        <label>Width (px)</label>
        <input
          type="number"
          value={media.width}
          onChange={(e) => handleChange('width', parseInt(e.target.value))}
          min="50"
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Height (px)</label>
        <input
          type="number"
          value={media.height}
          onChange={(e) => handleChange('height', parseInt(e.target.value))}
          min="50"
        />
      </div>
      <div className={styles.inputGroup}>
        <label>Start Time (s)</label>
        <input
          type="number"
          value={media.startTime}
          onChange={(e) => handleChange('startTime', parseFloat(e.target.value))}
          min="0"
          step="0.1"
        />
      </div>
      <div className={styles.inputGroup}>
        <label>End Time (s)</label>
        <input
          type="number"
          value={media.endTime}
          onChange={(e) => handleChange('endTime', parseFloat(e.target.value))}
          min="0"
          step="0.1"
        />
      </div>
    </div>
  );
}
