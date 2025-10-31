/**
 * OpenAI image editing handler
 */

import { getEchoToken } from '@/echo';
import OpenAI from 'openai';
import { urlToFile } from '@/lib/image-utils-server';
import { ERROR_MESSAGES } from '@/lib/constants';

/**
 * Handles OpenAI image editing
 */
export async function handleOpenAIEdit(
  prompt: string,
  imageUrls: string[]
): Promise<Response> {
  const token = await getEchoToken();

  if (!token) {
    return Response.json(
      { error: ERROR_MESSAGES.AUTH_FAILED },
      { status: 401 }
    );
  }

  // OpenAI editImage API is not supported through Vercel AI SDK, so we must construct
  // a raw TS OpenAI client.
  // https://platform.openai.com/docs/api-reference/images/createEdit
  const openaiClient = new OpenAI({
    apiKey: token,
    baseURL: 'https://echo.router.merit.systems',
  });

  try {
    // Convert URLs (blob URLs or data URLs) to File objects
    const imageFiles = await Promise.all(
      imageUrls.map(url => urlToFile(url, 'image.png'))
    );

    const result = await openaiClient.images.edit({
      image: imageFiles,
      prompt,
      n: 1,
      size: '1024x1024',
      model: 'gpt-image-1',
    });

    if (!result.data || result.data.length === 0) {
      return Response.json(
        { error: ERROR_MESSAGES.NO_EDITED_IMAGE },
        { status: 500 }
      );
    }

    return Response.json({
      imageUrl: `data:image/png;base64,${result.data[0]?.b64_json}`,
    });
  } catch (error) {
    console.error('OpenAI image editing error:', error);
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
