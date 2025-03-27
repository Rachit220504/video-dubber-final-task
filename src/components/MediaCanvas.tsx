import { useRef, useEffect, useState, useCallback } from 'react';
import styles from './MediaCanvas.module.css';

type MediaType = {
  type: "video" | "image";
  file: File;
  width: number;
  height: number;
  startTime: number;
  endTime: number;
  position: { x: number; y: number };
};

type MediaCanvasProps = {
  media: MediaType | null;
  onUpdate: (media: MediaType) => void;
  currentTime?: number;
  isPlaying: boolean;
};

export default function MediaCanvas({ media, onUpdate, currentTime = 0, isPlaying }: MediaCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoUrlRef = useRef<string | null>(null);

  // Add cleanup effect for media changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
    }
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }

    if (media?.type === 'video' && media.file) {
      const url = URL.createObjectURL(media.file);
      videoUrlRef.current = url;
    }

    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = null;
      }
    };
  }, [media?.file]);

  useEffect(() => {
    // Cleanup previous video URL
    if (videoUrlRef.current) {
      URL.revokeObjectURL(videoUrlRef.current);
      videoUrlRef.current = null;
    }

    // Create new URL for new video
    if (media?.type === 'video' && media.file) {
      const url = URL.createObjectURL(media.file);
      videoUrlRef.current = url;
    }

    return () => {
      if (videoUrlRef.current) {
        URL.revokeObjectURL(videoUrlRef.current);
        videoUrlRef.current = null;
      }
    };
  }, [media]);

  const isVisible = useCallback(() => {
    if (!media) return false;
    return currentTime >= media.startTime && currentTime <= media.endTime;
  }, [media, currentTime]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !media || media.type !== 'video') return;

    video.currentTime = currentTime;

    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise) {
        playPromise
          .then(() => {
            // Successfully started playing
            video.playbackRate = 1.0;
          })
          .catch(() => {
            // Handle play error silently
          });
      }
    } else {
      video.pause();
    }

    return () => {
      video.pause();
    };
  }, [isPlaying, media]);

  // Add separate effect for time updates
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !(media?.type === 'video')) return;

    // Only update time if difference is significant
    if (Math.abs(video.currentTime - currentTime) > 0.1) {
      video.currentTime = currentTime;
    }
  }, [currentTime, media]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!media) return;
    if ((e.target as HTMLElement).classList.contains(styles.resizeHandle)) return;

    isDragging.current = true;
    startPos.current = {
      x: e.clientX - media.position.x,
      y: e.clientY - media.position.y,
    };
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.current || !media) return;

    const newX = e.clientX - startPos.current.x;
    const newY = e.clientY - startPos.current.y;

    onUpdate({
      ...media,
      position: { x: newX, y: newY },
    });
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [media]);

  const handleResize = (e: React.MouseEvent, direction: string) => {
    e.stopPropagation();
    if (!media) return;

    const startWidth = media.width;
    const startHeight = media.height;
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...media.position };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startPos.x;
      let newY = startPos.y;

      if (direction.includes("e")) {
        newWidth = Math.max(50, startWidth + deltaX);
      } else if (direction.includes("w")) {
        newWidth = Math.max(50, startWidth - deltaX);
        newX = startPos.x + (startWidth - newWidth);
      }

      if (direction.includes("s")) {
        newHeight = Math.max(50, startHeight + deltaY);
      } else if (direction.includes("n")) {
        newHeight = Math.max(50, startHeight - deltaY);
        newY = startPos.y + (startHeight - newHeight);
      }

      onUpdate({
        ...media,
        width: newWidth,
        height: newHeight,
        position: { x: newX, y: newY },
      });
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", () => {
      document.removeEventListener("mousemove", onMouseMove);
    }, { once: true });
  };

  return (
    <div
      ref={containerRef}
      className={styles.canvas}
      onWheel={(e) => {
        if (e.ctrlKey) {
          e.preventDefault();
          const delta = e.deltaY > 0 ? 0.9 : 1.1;
          setZoom((prev) => Math.min(Math.max(0.5, prev * delta), 2));
        }
      }}
      style={{ transform: `scale(${zoom})` }}
    >
      {media && (
        <div
          className={styles.mediaContainer}
          style={{
            left: media.position.x,
            top: media.position.y,
            width: media.width,
            height: media.height,
            display: isVisible() ? 'block' : 'none'
          }}
          onMouseDown={handleMouseDown}
        >
          {media.type === "video" ? (
            <video
              key={media.file.name} // Add key to force remount
              ref={videoRef}
              src={videoUrlRef.current || undefined}
              style={{ width: "100%", height: "100%" }}
              loop={false}
              muted
              playsInline
              preload="auto"
            />
          ) : (
            <img
              src={URL.createObjectURL(media.file)}
              style={{ width: "100%", height: "100%" }}
              alt="Media"
              draggable={false}
            />
          )}
          <div className={`${styles.resizeHandle} ${styles.nw}`} onMouseDown={(e) => handleResize(e, "nw")} />
          <div className={`${styles.resizeHandle} ${styles.ne}`} onMouseDown={(e) => handleResize(e, "ne")} />
          <div className={`${styles.resizeHandle} ${styles.sw}`} onMouseDown={(e) => handleResize(e, "sw")} />
          <div className={`${styles.resizeHandle} ${styles.se}`} onMouseDown={(e) => handleResize(e, "se")} />
        </div>
      )}
    </div>
  );
}
