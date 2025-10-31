'use client';

import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputModelSelect,
  PromptInputModelSelectContent,
  PromptInputModelSelectItem,
  PromptInputModelSelectTrigger,
  PromptInputModelSelectValue,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
  usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  EditImageRequest,
  GeneratedImage,
  GenerateImageRequest,
  ImageResponse,
  ModelConfig,
  ModelOption,
} from '@/lib/types';
import { ImageHistory } from './image-history';
import { saveImageToDB, loadImagesFromDB, deleteImageFromDB, clearAllImagesFromDB } from '@/lib/image-storage';

declare global {
  interface Window {
    __promptInputActions?: {
      addFiles: (files: File[] | FileList) => void;
      clear: () => void;
    };
  }
}

/**
 * Available AI models for image generation
 * These models integrate with the Echo SDK to provide different image generation capabilities
 */
const models: ModelConfig[] = [
  { id: 'openai', name: 'GPT Image' },
  { id: 'gemini', name: 'Gemini Flash Image' },
];

/**
 * API functions for image generation and editing
 * These functions communicate with the Echo SDK backend routes
 */

// ===== API FUNCTIONS =====
async function uploadImageToBlob(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload-image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to upload image: ${errorText}`);
  }

  const data = await response.json();
  return data.url;
}

async function generateImage(
  request: GenerateImageRequest
): Promise<ImageResponse> {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

async function editImage(request: EditImageRequest): Promise<ImageResponse> {
  const response = await fetch('/api/edit-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  return response.json();
}

/**
 * Main ImageGenerator component
 *
 * This component demonstrates how to integrate Echo SDK with AI image generation:
 * - Uses PromptInput for unified input handling with attachments
 * - Supports both text-to-image generation and image editing
 * - Maintains history of all generated/edited images
 * - Provides seamless model switching between OpenAI and Gemini
 */
export default function ImageGenerator() {
  const [model, setModel] = useState<ModelOption>('gemini');
  const [imageHistory, setImageHistory] = useState<GeneratedImage[]>([]);
  const promptInputRef = useRef<HTMLFormElement>(null);

  // Load images from IndexedDB on mount
  useEffect(() => {
    loadImagesFromDB()
      .then((images) => {
        setImageHistory(images);
      })
      .catch((error) => {
        console.error('Failed to load images from IndexedDB:', error);
      });
  }, []);

  // Handle adding files to the input from external triggers (like from image history)
  const handleAddToInput = useCallback((files: File[]) => {
    const actions = window.__promptInputActions;
    if (actions) {
      actions.addFiles(files);
    }
  }, []);

  const clearForm = useCallback(() => {
    promptInputRef.current?.reset();
    const actions = window.__promptInputActions;
    if (actions) {
      actions.clear();
    }
  }, []);

  // Handle deleting a single image
  const handleDeleteImage = useCallback((imageId: string) => {
    // Remove from state
    setImageHistory(prev => prev.filter(img => img.id !== imageId));

    // Remove from IndexedDB
    deleteImageFromDB(imageId).catch(error => {
      console.error('Failed to delete image from IndexedDB:', error);
    });
  }, []);

  // Handle clearing all images
  const handleClearAll = useCallback(() => {
    if (confirm('Are you sure you want to delete all generated images?')) {
      // Clear state
      setImageHistory([]);

      // Clear IndexedDB
      clearAllImagesFromDB().catch(error => {
        console.error('Failed to clear all images from IndexedDB:', error);
      });
    }
  }, []);

  // Component to bridge PromptInput context with external file operations
  function FileInputManager() {
    const attachments = usePromptInputAttachments();

    // Store reference to attachment actions for external use
    useEffect(() => {
      window.__promptInputActions = {
        addFiles: attachments.add,
        clear: attachments.clear,
      };

      return () => {
        delete window.__promptInputActions;
      };
    }, [attachments]);

    return null;
  }

  /**
   * Handles form submission for both image generation and editing
   * - Text-only: generates new image using selected model
   * - Text + attachments: edits uploaded images using Gemini
   */
  const handleSubmit = useCallback(
    async (message: PromptInputMessage) => {
      const hasText = Boolean(message.text?.trim());
      const hasAttachments = Boolean(message.files?.length);

      // Require either text prompt or attachments
      if (!(hasText || hasAttachments)) {
        return;
      }

      const isEdit = hasAttachments;
      const userPrompt = message.text?.trim() || '';

      // Add seductive drake system prompt
      const drakeInstruction = 'Add a seductive drake (the rapper Drake) to this image. Match the exact art style, lighting, color palette, and aesthetic of the original image. Drake should look naturally integrated into the scene, as if he was always meant to be there. Make it look professional and stylistically cohesive.';
      const prompt = isEdit
        ? `${drakeInstruction}${userPrompt ? ' Additional instructions: ' + userPrompt : ''}`
        : userPrompt || drakeInstruction;

      // Generate unique ID for this request
      const imageId = `img_${Date.now()}`;

      // Upload attachments to Vercel Blob Storage and get permanent URLs
      const attachmentBlobUrls =
        message.files && message.files.length > 0
          ? await Promise.all(
              message.files
                .filter(f => f.mediaType?.startsWith('image/'))
                .map(async f => {
                  try {
                    const response = await fetch(f.url);
                    const blob = await response.blob();
                    const file = new File([blob], f.filename || 'image', {
                      type: f.mediaType,
                    });
                    // Upload to Vercel Blob and get permanent URL
                    return await uploadImageToBlob(file);
                  } catch (error) {
                    console.error(
                      'Failed to upload attachment to blob storage:',
                      error
                    );
                    throw error;
                  }
                })
            )
          : undefined;

      // Create placeholder entry immediately for optimistic UI
      const placeholderImage: GeneratedImage = {
        id: imageId,
        prompt: userPrompt || 'Adding seductive Drake to your image...',
        model: model,
        timestamp: new Date(),
        attachments: attachmentBlobUrls,
        isEdit,
        isLoading: true,
      };

      // Add to history immediately for responsive UI
      setImageHistory(prev => [placeholderImage, ...prev]);

      // Save placeholder to IndexedDB
      saveImageToDB(placeholderImage).catch(error => {
        console.error('Failed to save placeholder to IndexedDB:', error);
      });

      try {
        let imageUrl: ImageResponse['imageUrl'];

        if (isEdit) {
          if (!attachmentBlobUrls || attachmentBlobUrls.length === 0) {
            throw new Error('No image files found in attachments');
          }

          try {
            // Use the blob URLs directly - no need to convert to data URLs
            const result = await editImage({
              prompt,
              imageUrls: attachmentBlobUrls,
              provider: model,
            });
            imageUrl = result.imageUrl;
          } catch (error) {
            console.error('Error processing image files:', error);
            throw error;
          }
        } else {
          const result = await generateImage({ prompt, model });
          imageUrl = result.imageUrl;
        }

        // Update the existing placeholder entry with the result
        const updatedImage = { ...placeholderImage, imageUrl, isLoading: false };
        setImageHistory(prev =>
          prev.map(img =>
            img.id === imageId ? updatedImage : img
          )
        );

        // Save updated image to IndexedDB
        saveImageToDB(updatedImage).catch(error => {
          console.error('Failed to save image to IndexedDB:', error);
        });
      } catch (error) {
        console.error(
          `Error ${isEdit ? 'editing' : 'generating'} image:`,
          error
        );

        // Update the placeholder entry with error state
        const errorImage = {
          ...placeholderImage,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Failed to generate image',
        };
        setImageHistory(prev =>
          prev.map(img =>
            img.id === imageId ? errorImage : img
          )
        );

        // Save error state to IndexedDB
        saveImageToDB(errorImage).catch(err => {
          console.error('Failed to save error state to IndexedDB:', err);
        });
      }
    },
    [model]
  );

  return (
    <div className="space-y-6">
      <PromptInput
        ref={promptInputRef}
        onSubmit={handleSubmit}
        className="relative"
        globalDrop
        multiple
        accept="image/*"
      >
        <FileInputManager />
        <PromptInputBody>
          <PromptInputAttachments>
            {attachment => <PromptInputAttachment data={attachment} />}
          </PromptInputAttachments>
          <PromptInputTextarea placeholder="Upload your photo and let Drake work his magic... 🔥" className="font-sans" />
        </PromptInputBody>
        <PromptInputToolbar>
          <PromptInputTools>
            <PromptInputActionMenu>
              <PromptInputActionMenuTrigger />
              <PromptInputActionMenuContent>
                <PromptInputActionAddAttachments />
              </PromptInputActionMenuContent>
            </PromptInputActionMenu>
            <PromptInputModelSelect
              onValueChange={value => {
                setModel(value as ModelOption);
              }}
              value={model}
            >
              <PromptInputModelSelectTrigger>
                <PromptInputModelSelectValue />
              </PromptInputModelSelectTrigger>
              <PromptInputModelSelectContent>
                {models.map(model => (
                  <PromptInputModelSelectItem key={model.id} value={model.id}>
                    {model.name}
                  </PromptInputModelSelectItem>
                ))}
              </PromptInputModelSelectContent>
            </PromptInputModelSelect>
          </PromptInputTools>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearForm}
              className="h-9 w-9 p-0"
            >
              <X size={16} />
            </Button>
            <PromptInputSubmit />
          </div>
        </PromptInputToolbar>
      </PromptInput>

      <ImageHistory
        imageHistory={imageHistory}
        onAddToInput={handleAddToInput}
        onDeleteImage={handleDeleteImage}
        onClearAll={handleClearAll}
      />
    </div>
  );
}
