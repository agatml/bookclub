// components/BookImage.tsx
"use client";

import { useState } from "react";

interface BookImageProps {
  src: string | undefined | null;
  title: string;
  width: number;
  height: number;
  style?: React.CSSProperties;
}

export default function BookImage({ src, title, width, height, style }: BookImageProps) {
  const [hasError, setHasError] = useState(false);


  if (!src || hasError) {
    return (
      <div
        style={{
          width,
          height,
          backgroundColor: '#f0f0f0',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.min(width, height) * 0.4,
          ...style
        }}
      >
        📚
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={title}
      width={width}
      height={height}
      style={{ objectFit: 'cover', ...style }}
      onError={() => setHasError(true)}
    />
  );
}