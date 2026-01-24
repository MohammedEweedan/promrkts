import React, { useEffect, useState, useCallback } from 'react';
import { useToast } from '@chakra-ui/react';
import api from '../api/client';

interface ResourceProgressTrackerProps {
  resourceId: string;
  onProgressUpdate?: (completed: boolean) => void;
}

/**
 * Component to track resource progress (videos and PDFs)
 * Automatically tracks time spent and completion
 */
export const ResourceProgressTracker: React.FC<ResourceProgressTrackerProps> = ({
  resourceId,
  onProgressUpdate,
}) => {
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const toast = useToast();

  const trackProgress = useCallback(async (data: {
    completed?: boolean;
    timeSpent?: number;
    lastPosition?: number;
  }) => {
    try {
      const response = await api.post(`/progress/resource/${resourceId}`, data);
      
      if (data.completed && response.data.xpEarned) {
        toast({
          title: 'Progress Saved!',
          description: `+${response.data.xpEarned} XP earned`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      }

      if (data.completed) {
        onProgressUpdate?.(true);
      }
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
  }, [resourceId, toast, onProgressUpdate]);

  useEffect(() => {
    // Track time spent every 30 seconds
    const interval = setInterval(() => {
      const now = Date.now();
      const timeSpent = Math.floor((now - lastSaveTime) / 1000);
      
      if (timeSpent >= 30) {
        trackProgress({ timeSpent });
        setLastSaveTime(now);
      }
    }, 30000);

    return () => {
      clearInterval(interval);
      // Save final progress on unmount
      const totalTimeSpent = Math.floor((Date.now() - lastSaveTime) / 1000);
      if (totalTimeSpent > 0) {
        trackProgress({ timeSpent: totalTimeSpent });
      }
    };
  }, [lastSaveTime, trackProgress]);

  return null; // This is a headless component
};

export default ResourceProgressTracker;

// Hook version for easier use
export const useResourceProgress = (
  src: string, 
  resourceType: 'video' | 'pdf',
  tierId?: string
) => {
  const [startTime] = useState(Date.now());
  const [lastSaveTime, setLastSaveTime] = useState(Date.now());
  const toast = useToast();

  // Create a URL-safe base64 hash from the canonical source URL (strip fragments)
  const canonicalSrc = (src || '').split('#')[0];
  const resourceHash = (() => {
    try {
      // base64url (no padding)
      return btoa(canonicalSrc).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
    } catch {
      // Fallback to encodeURIComponent if btoa fails (e.g., non-ASCII)
      return encodeURIComponent(canonicalSrc);
    }
  })();

  const trackProgress = async (data: {
    completed?: boolean;
    timeSpent?: number;
    lastPosition?: number;
  }) => {
    try {
      console.log('🔄 Tracking progress for:', { resourceHash, resourceType, tierId, data, canonicalSrc });
      
      const response = await api.post(`/progress/resource/${resourceHash}`, {
        ...data,
        resourceType,
        tierId,
      });
      
      console.log('✅ Progress tracked:', response.data);
      
      if (data.completed && response.data.xpEarned) {
        toast({
          title: 'Progress Saved!',
          description: `+${response.data.xpEarned} XP earned`,
          status: 'success',
          duration: 3000,
          isClosable: true,
          position: 'bottom-right',
        });
      }

      return response.data;
    } catch (error) {
      console.error('❌ Error tracking progress:', error);
      return null;
    }
  };

  const markCompleted = (lastPosition?: number) => {
    const totalTimeSpent = Math.floor((Date.now() - startTime) / 1000);
    return trackProgress({ completed: true, timeSpent: totalTimeSpent, lastPosition });
  };

  const updatePosition = (position: number) => {
    const timeSpent = Math.floor((Date.now() - lastSaveTime) / 1000);
    setLastSaveTime(Date.now());
    return trackProgress({ lastPosition: position, timeSpent });
  };

  const saveProgress = () => {
    const timeSpent = Math.floor((Date.now() - lastSaveTime) / 1000);
    if (timeSpent > 0) {
      setLastSaveTime(Date.now());
      return trackProgress({ timeSpent });
    }
  };

  return {
    markCompleted,
    updatePosition,
    saveProgress,
  };
};
