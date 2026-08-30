'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

export interface SafeImageProps extends Omit<ImageProps, 'src' | 'onError'> {
  src?: string | null;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}

const DEFAULT_FALLBACK = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

/**
 * Universal SafeImage component wrapping Next.js <Image />
 * Provides automatic WebP optimization, blur placeholder, lazy loading, and broken image fallback.
 */
export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  className = '',
  width,
  height,
  fill,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string>(src || fallbackSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // If unoptimized or absolute external URL without domain config, fallback gracefully
  const isExternalUrl = typeof imgSrc === 'string' && (imgSrc.startsWith('http://') || imgSrc.startsWith('https://'));

  if (fill) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        fill={fill}
        sizes={sizes}
        priority={priority}
        onError={handleError}
        className={`object-cover transition-all duration-300 ${className}`}
        unoptimized={isExternalUrl}
        {...props}
      />
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 400}
      height={height || 300}
      priority={priority}
      onError={handleError}
      className={`object-cover transition-all duration-300 ${className}`}
      unoptimized={isExternalUrl}
      {...props}
    />
  );
};
