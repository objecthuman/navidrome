import { useCallback } from "react";
import { navidromeService } from "../services/navidrome";
import { useApp } from "../contexts/AppContext";

/**
 * Custom hook to handle playing an album
 * Fetches songs from the API and updates the queue
 */
export function usePlayAlbum() {
  const { onQueueUpdate } = useApp();

  const playAlbum = useCallback(
    async (albumId: string) => {
      try {
        // Fetch songs from Navidrome API (already in queue item format)
        const queueItems = await navidromeService.getSongsByAlbum(albumId);
        console.log("Fetched songs for album:", albumId, queueItems);

        // Update queue and start playing
        if (queueItems.length > 0) {
          onQueueUpdate(queueItems, queueItems[0].id, true);
        }
      } catch (error) {
        console.error("Failed to play album:", error);
        throw error;
      }
    },
    [onQueueUpdate],
  );

  return { playAlbum };
}
