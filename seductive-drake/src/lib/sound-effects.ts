/**
 * Sound effects utility with cooldown management
 */

let lastPlayedTime = 0;
const COOLDOWN_MS = 5000; // 5 seconds

/**
 * Plays the "Cups of the Rose" sound effect with a 5-second cooldown
 * @returns true if sound was played, false if still on cooldown
 */
export function playCupsOfTheRose(): boolean {
  const now = Date.now();

  // Check if we're still in cooldown period
  if (now - lastPlayedTime < COOLDOWN_MS) {
    return false;
  }

  try {
    // Create and play audio
    const audio = new Audio('/CUPS OF THE ROSE.mP3');
    audio.volume = 1.0; // Set volume to 100%

    // Play the sound
    audio.play().catch((error) => {
      console.error('Failed to play sound effect:', error);
    });

    // Update last played time
    lastPlayedTime = now;
    return true;
  } catch (error) {
    console.error('Error creating audio element:', error);
    return false;
  }
}
