/**
 * Next.js Image Generation Template with Echo SDK
 *
 * This template demonstrates how to build an AI image generation app using:
 * - Echo SDK for authentication and token management
 * - AI SDK for OpenAI and Gemini image generation
 * - Next.js App Router for server-side rendering
 *
 * Key features:
 * 1. Authentication: Automatic login/logout with Echo SDK
 * 2. Image Generation: Support for both OpenAI and Gemini models
 * 3. Image Editing: Upload images and edit with AI prompts
 * 4. History: Persistent image gallery with download/copy actions
 * 5. Responsive Design: Works on desktop and mobile
 *
 * Usage Examples:
 * - Text-to-Image: "A beautiful sunset over mountains"
 * - Image Editing: Upload photo + "Make this black and white"
 * - Model Switching: Choose between GPT Image or Gemini Flash
 */

import { isSignedIn } from '@/echo';
import ImageGenerator from '@/components/image-generator';
import { EchoWidget } from '@/components/echo-tokens';

import { EchoSignIn } from '@merit-systems/echo-next-sdk/client';
import { EchoAccount } from '@/components/echo-account-next';

/**
 * Main application page
 *
 * Server component that checks authentication status and renders
 * either the sign-in page or the main image generation interface
 */
export default async function Home() {
  // Check authentication status using Echo SDK
  const _isSignedIn = await isSignedIn();

  // Main application interface
  return (
    <div className="flex flex-col h-screen p-2 sm:p-4 max-w-6xl mx-auto">
      {/* Header with title and token display */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mb-4 sm:mb-8 p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-lg border border-slate-700/50 shadow-2xl gap-3 sm:gap-0">
        <div className="flex items-center space-x-3">
          <span className="text-3xl sm:text-4xl">🦆</span>
          <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-blue-200 via-slate-300 to-purple-200 bg-clip-text text-transparent">
            Seductive Drake Generator
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Echo token display widget */}
          {/* {_isSignedIn && <EchoWidget />} */}
          <EchoAccount />
        </div>
      </header>

      {/* Main image generation interface */}
      <div className="relative">
        <ImageGenerator />

        {/* Overlay when not signed in */}
        {!_isSignedIn && (
          <div className="absolute inset-0 backdrop-blur-[2px] bg-white/30 flex items-center justify-center rounded-xl border border-gray-300">
            <EchoSignIn />
          </div>
        )}
      </div>
    </div>
  );
}
