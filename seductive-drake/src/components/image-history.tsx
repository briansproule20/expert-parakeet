'use client';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  handleImageCopy,
  handleImageDownload,
  handleImageToFile,
  isImageActionable,
} from '@/lib/image-actions';
import type { GeneratedImage } from '@/lib/types';
import { Copy, Download, Edit, Trash2 } from 'lucide-react';
import NextImage from 'next/image';
import React, { useCallback, useEffect, useState } from 'react';
import { ImageDetailsDialog } from './image-details-dialog';

/**
 * Self-contained loading timer component
 * Only this component re-renders every 100ms, preventing parent re-renders
 */
const LoadingTimer = React.memo(function LoadingTimer({
  startTime,
}: {
  startTime: Date;
}) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(timer);
  }, []);

  const elapsed = (Date.now() - startTime.getTime()) / 1000;
  return (
    <div className="text-xs text-stone-300 font-mono">{elapsed.toFixed(1)}s</div>
  );
});

interface ImageHistoryItemProps {
  image: GeneratedImage;
  onAddToInput: (files: File[]) => void;
  onImageClick: (image: GeneratedImage) => void;
  onDelete: (imageId: string) => void;
}

const ImageHistoryItem = React.memo(function ImageHistoryItem({
  image,
  onAddToInput,
  onImageClick,
  onDelete,
}: ImageHistoryItemProps) {
  const handleAddToInput = useCallback(() => {
    if (!isImageActionable(image)) return;

    const file = handleImageToFile(image.imageUrl!, image.id);
    onAddToInput([file]);
  }, [image, onAddToInput]);

  const handleImageClick = useCallback(() => {
    onImageClick(image);
  }, [image, onImageClick]);

  const handleDownload = useCallback(() => {
    if (!isImageActionable(image)) return;

    handleImageDownload(image.imageUrl!, image.id);
  }, [image]);

  const handleCopy = useCallback(async () => {
    if (!isImageActionable(image)) return;
    await handleImageCopy(image.imageUrl!);
  }, [image]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(image.id);
  }, [image.id, onDelete]);

  return (
    <div
      onClick={handleImageClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleImageClick();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Open details for image: ${image.prompt.slice(0, 50)}${image.prompt.length > 50 ? '...' : ''}`}
      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group cursor-pointer hover:shadow-lg focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all animate-in fade-in slide-in-from-left-4 duration-500"
    >
      {image.isLoading ? (
        <>
          <div className="flex flex-col items-center justify-center h-full space-y-2 p-4">
            <Skeleton className="h-16 w-16 rounded-lg" />
            <LoadingTimer startTime={image.timestamp} />
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              onClick={handleDelete}
              aria-label="Cancel and delete this request"
              title="Cancel request"
              className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 shadow-lg text-white hover:text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:ring-2 focus:ring-red-500"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </>
      ) : image.error ? (
        <>
          <div className="flex flex-col items-center justify-center h-full space-y-2 p-4">
            <div className="text-red-400 text-sm">⚠️ Failed</div>
            <div className="text-xs text-stone-300 text-center">{image.error}</div>
          </div>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              onClick={handleDelete}
              aria-label="Delete this failed image"
              title="Delete failed image"
              className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 shadow-lg text-white hover:text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:ring-2 focus:ring-red-500"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </>
      ) : image.imageUrl ? (
        <>
          <NextImage
            src={image.imageUrl}
            alt={image.prompt}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
          />
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleCopy();
              }}
              aria-label="Copy image to clipboard"
              title="Copy image"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg text-gray-700 hover:text-gray-900 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:ring-2 focus:ring-blue-500"
              disabled={!isImageActionable(image)}
            >
              <Copy size={14} />
            </Button>
            <Button
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleDownload();
              }}
              aria-label="Download image"
              title="Download image"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg text-gray-700 hover:text-gray-900 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:ring-2 focus:ring-blue-500"
              disabled={!isImageActionable(image)}
            >
              <Download size={14} />
            </Button>
            <Button
              size="sm"
              onClick={e => {
                e.stopPropagation();
                handleAddToInput();
              }}
              aria-label="Edit this image"
              title="Edit image"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white shadow-lg text-gray-700 hover:text-gray-900 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:ring-2 focus:ring-blue-500"
              disabled={!isImageActionable(image)}
            >
              <Edit size={14} />
            </Button>
            <Button
              size="sm"
              onClick={handleDelete}
              aria-label="Delete this image"
              title="Delete image"
              className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 shadow-lg text-white hover:text-white cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-150 focus:ring-2 focus:ring-red-500"
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center h-full text-stone-300">
          No image
        </div>
      )}
    </div>
  );
});

interface ImageHistoryProps {
  imageHistory: GeneratedImage[];
  onAddToInput: (files: File[]) => void;
  onDeleteImage: (imageId: string) => void;
  onClearAll: () => void;
}

export const ImageHistory = React.memo(function ImageHistory({
  imageHistory,
  onAddToInput,
  onDeleteImage,
  onClearAll,
}: ImageHistoryProps) {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(
    null
  );

  // Memoize callbacks to prevent unnecessary re-renders
  const handleImageClick = useCallback((image: GeneratedImage) => {
    setSelectedImage(image);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedImage(null);
  }, []);

  if (imageHistory.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-serif font-semibold text-stone-100">Generated Images</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-stone-300 border-stone-700 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500"
        >
          <Trash2 size={14} className="mr-2" />
          Clear All
        </Button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 transition-all duration-300 ease-out">
        {imageHistory.map(image => (
          <ImageHistoryItem
            key={image.id}
            image={image}
            onAddToInput={onAddToInput}
            onImageClick={handleImageClick}
            onDelete={onDeleteImage}
          />
        ))}
      </div>

      <ImageDetailsDialog
        image={selectedImage}
        onClose={handleCloseDialog}
        onAddToInput={onAddToInput}
      />
    </div>
  );
});
