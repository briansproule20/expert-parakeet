# Vercel Blob Storage Setup Guide

This guide explains how to set up Vercel Blob Storage to fix the HTTP 413 "Payload Too Large" error.

## What Changed?

Previously, images were sent as base64-encoded data in the request body, which:
- Made them ~33% larger than the original file size
- Quickly exceeded the 4MB API route limit
- Caused HTTP 413 errors for high-resolution images

Now, images are:
1. Uploaded directly to Vercel Blob Storage from the client
2. Stored permanently with a public URL
3. Only the URL is sent to the API routes (tiny payload)
4. API routes fetch the image from the blob URL when needed

## Setup Steps

### 1. Create a Vercel Blob Store

1. Go to https://vercel.com/dashboard/stores
2. Click "Create Database" or "Create Store"
3. Select "Blob" as the storage type
4. Choose a name (e.g., "seductive-drake-images")
5. Click "Create"

### 2. Get Your Blob Token

After creating the store:
1. Click on your newly created blob store
2. Navigate to the ".env.local" tab
3. Copy the `BLOB_READ_WRITE_TOKEN` value

### 3. Add Token to Your Environment

Add the token to your `.env.local` file:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

**IMPORTANT:** Never commit this token to git. It's already in `.gitignore`.

### 4. Deploy to Vercel

When deploying to Vercel:
1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add `BLOB_READ_WRITE_TOKEN` with your token value
4. Vercel will automatically make it available to your API routes

### 5. Local Development

For local development:
1. Make sure `.env.local` has your `BLOB_READ_WRITE_TOKEN`
2. Restart your dev server: `pnpm run dev`
3. Test uploading an image

## Testing

1. Start your dev server: `pnpm run dev`
2. Upload a large image (>3MB)
3. It should work without HTTP 413 errors

## How It Works

### Client Side (image-generator.tsx)
- When user uploads an image, it's immediately sent to `/api/upload-image`
- This returns a permanent Vercel Blob URL
- Only the URL is stored and sent to generation/edit APIs

### Server Side
- `/api/upload-image`: Uploads images to Vercel Blob Storage
- `/api/edit-image` & `/api/generate-image`: Accept blob URLs instead of base64
- API routes fetch images from blob URLs when needed (no size limits)

## Benefits

✅ No more HTTP 413 errors
✅ Handle images of any size
✅ More efficient (no base64 overhead)
✅ Images persist in cloud storage
✅ Faster API requests (smaller payloads)
✅ Better scalability

## Troubleshooting

### "Failed to upload image" error
- Check that `BLOB_READ_WRITE_TOKEN` is set in `.env.local`
- Restart your dev server after adding the token
- Verify the token is correct from Vercel dashboard

### Still getting HTTP 413
- Make sure you restarted the dev server
- Clear your browser cache
- Check that the new code is deployed

### Images not displaying
- Check browser console for errors
- Verify blob URLs are being returned from `/api/upload-image`
- Ensure your blob store has "public" access enabled

## Cost

Vercel Blob Storage pricing:
- **Free tier**: 1GB storage + 10GB bandwidth/month
- **Pro**: $0.15/GB storage + $0.30/GB bandwidth

For this app (storing generated images), the free tier should be sufficient for development and light usage.
