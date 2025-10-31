/**
 * Minimal Image Utilities
 *
 * Simple, clean API with just data URLs. No complex conversions.
 */

/**
 * Converts a File to a data URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a data URL to a File object
 */
export function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }

  return new File([array], filename, { type: mime });
}

/**
 * Downloads an image from a data URL
 */
export function downloadDataUrl(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Copies an image to the clipboard from a data URL
 */
export async function copyDataUrlToClipboard(dataUrl: string): Promise<void> {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
  const bytes = atob(base64);
  const array = new Uint8Array(bytes.length);

  for (let i = 0; i < bytes.length; i++) {
    array[i] = bytes.charCodeAt(i);
  }

  const blob = new Blob([array], { type: mime });
  await navigator.clipboard.write([new ClipboardItem({ [mime]: blob })]);
}

/**
 * Generates a filename for an image
 */
export function generateFilename(imageId: string): string {
  return `generated-image-${imageId}.png`;
}

/**
 * Extracts media type from a data URL
 */
export function getMediaTypeFromDataUrl(dataUrl: string): string {
  if (!dataUrl.startsWith('data:')) return 'image/jpeg';
  return dataUrl.match(/^data:([^;]+);base64,/)?.[1] || 'image/jpeg';
}

/**
 * Converts a blob URL to a data URL
 * Works with both regular URLs and data URLs (returns data URLs as-is)
 */
export async function urlToDataUrl(url: string): Promise<string> {
  // If it's already a data URL, return it as-is
  if (url.startsWith('data:')) {
    return url;
  }

  // Fetch the blob URL and convert to data URL
  const response = await fetch(url);
  const blob = await response.blob();
  const file = new File([blob], 'image', { type: blob.type || 'image/png' });
  return fileToDataUrl(file);
}

/**
 * Converts a blob URL to a File object
 * Works with both regular URLs and data URLs
 */
export async function urlToFile(url: string, filename: string): Promise<File> {
  // If it's a data URL, use existing conversion
  if (url.startsWith('data:')) {
    return dataUrlToFile(url, filename);
  }

  // Fetch the blob URL and convert to File
  const response = await fetch(url);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}
