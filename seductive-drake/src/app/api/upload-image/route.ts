/**
 * API Route: Upload Image to Vercel Blob
 *
 * This route handles uploading images to Vercel Blob Storage:
 * - Receives images from the client via multipart/form-data
 * - Uploads them to Vercel Blob Storage
 * - Returns the blob URL for use in other API routes
 */

import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
  api: {
    bodyParser: false, // We'll handle the file upload ourselves
  },
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    });

    return NextResponse.json({
      url: blob.url,
      filename: file.name,
      size: file.size,
      contentType: file.type,
    });
  } catch (error) {
    console.error('Error uploading to Vercel Blob:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to upload image',
      },
      { status: 500 }
    );
  }
}
