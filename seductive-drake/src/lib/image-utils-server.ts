/**
 * Server-side Image Utilities
 *
 * Server-compatible versions of image utilities that don't rely on browser APIs
 */

/**
 * Converts a URL (data URL or blob URL) to a data URL on the server
 */
export async function urlToDataUrl(url: string): Promise<string> {
  // If it's already a data URL, return it as-is
  if (url.startsWith('data:')) {
    return url;
  }

  // Fetch the URL and convert to data URL using Node.js Buffer
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const contentType = response.headers.get('content-type') || 'image/png';
  const base64 = buffer.toString('base64');

  return `data:${contentType};base64,${base64}`;
}

/**
 * Converts a URL (data URL or blob URL) to a File object on the server
 */
export async function urlToFile(url: string, filename: string): Promise<File> {
  // If it's a data URL, convert it
  if (url.startsWith('data:')) {
    return dataUrlToFile(url, filename);
  }

  // Fetch the URL and convert to File
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

/**
 * Converts a data URL to a File object
 */
function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';

  // Use Buffer on the server side
  const buffer = Buffer.from(base64, 'base64');
  const blob = new Blob([buffer], { type: mime });

  return new File([blob], filename, { type: mime });
}

/**
 * Extracts media type from a data URL
 */
export function getMediaTypeFromDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) return 'image/jpeg';
  return dataUrl.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
}
