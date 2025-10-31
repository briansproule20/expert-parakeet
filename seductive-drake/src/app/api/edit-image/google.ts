/**
 * Google Gemini image editing handler
 */

import { google } from '@/echo';
import { generateText } from 'ai';
import { urlToDataUrl, getMediaTypeFromDataUrl } from '@/lib/image-utils-server';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Handles Google Gemini image editing
 */
export async function handleGoogleEdit(
  prompt: string,
  imageUrls: string[]
): Promise<Response> {
  try {
    // Convert all URLs (blob URLs or data URLs) to data URLs for Gemini
    const dataUrls = await Promise.all(imageUrls.map(url => urlToDataUrl(url)));

    const content = [
      {
        type: 'text' as const,
        text: prompt,
      },
      ...dataUrls.map(dataUrl => ({
        type: 'image' as const,
        image: dataUrl,
        mediaType: getMediaTypeFromDataUrl(dataUrl),
      })),
    ];

    const result = await generateText({
      model: google('gemini-2.5-flash-image-preview'),
      prompt: [
        {
          role: 'user',
          content,
        },
      ],
    });

    const imageFile = result.files?.find(file =>
      file.mediaType?.startsWith('image/')
    );

    if (!imageFile) {
      return Response.json(
        { error: ERROR_MESSAGES.NO_EDITED_IMAGE },
        { status: 500 }
      );
    }

    return Response.json({
      imageUrl: `data:${imageFile.mediaType};base64,${imageFile.base64}`,
    });
  } catch (error) {
    console.error('Google image editing error:', error);
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.NO_EDITED_IMAGE,
      },
      { status: 500 }
    );
  }
}
