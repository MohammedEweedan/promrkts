import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  Box,
  Flex,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Text,
  HStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from "lucide-react";
import { useResourceProgress } from "./ResourceProgressTracker";

interface TrackedVideoProps {
  resourceId?: string; // Optional now
  src: string;
  tierId: string; // Required for tracking
  onContextMenu?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
  controls?: boolean; // now means: show custom controls (default true)
  playsInline?: boolean;
  disablePictureInPicture?: boolean;
  controlsList?: string;
  onEnded?: () => void;
  watermark?: React.ReactNode;
  videoRefExternal?: React.RefObject<HTMLVideoElement>;
}

export const TrackedVideo: React.FC<TrackedVideoProps> = ({
  resourceId,
  src,
  tierId,
  onContextMenu,
  style,
  controls = true,
  playsInline = true,
  disablePictureInPicture = true,
  controlsList = "nodownload noplaybackrate",
  onEnded,
  watermark,
  videoRefExternal,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { markCompleted, updatePosition } = useResourceProgress(
    src,
    "video",
    tierId
  );
  const lastSaveTimeRef = useRef(Date.now());

  // Player UI state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const controlsAutoHideMs = 2500;
  const inactivityTimeoutRef = useRef<number | null>(null);

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Format time as 01:23:45
  const formatTime = (sec: number) => {
    if (!sec || isNaN(sec)) return "0:00";
    const s = Math.floor(sec);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const r = s % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, "0")}:${r
        .toString()
        .padStart(2, "0")}`;
    }
    return `${m}:${r.toString().padStart(2, "0")}`;
  };

  const resetHideControlsTimer = useCallback(() => {
    if (!controls) return;
    setShowControls(true);
    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = window.setTimeout(() => {
      setShowControls((prev) => (prev && !isScrubbing && isPlaying ? false : prev));
    }, controlsAutoHideMs);
  }, [controls, isPlaying, isScrubbing]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (value: number) => {
    const video = videoRef.current;
    const v = value / 100;
    setVolume(v);
    setIsMuted(v === 0);
    if (video) {
      video.volume = v;
      video.muted = v === 0;
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = !isMuted;
    setIsMuted(next);
    video.muted = next;
    if (!next && video.volume === 0) {
      video.volume = 0.5;
      setVolume(0.5);
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen?.().then(() => setIsFullscreen(true));
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false));
    }
  };

  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (!video || isNaN(time)) return;
    video.currentTime = time;
    setCurrentTime(time);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Only apply if video is in focus or container is hovered-ish (simple version)
    switch (e.key) {
      case " ":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        seekTo(Math.min(duration, currentTime + 5));
        break;
      case "ArrowLeft":
        seekTo(Math.max(0, currentTime - 5));
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      case "m":
      case "M":
        toggleMute();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // sync external ref
    if (videoRefExternal) {
      try {
        (videoRefExternal as any).current = video;
      } catch {
        // ignore
      }
    }

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setVolume(video.volume ?? 1);
      setIsMuted(video.muted ?? false);
    };

    const handleTimeUpdate = () => {
      const t = video.currentTime;
      setCurrentTime(t);

      // buffered end
      try {
        if (video.buffered.length > 0) {
          const end = video.buffered.end(video.buffered.length - 1);
          setBuffered(end);
        }
      } catch {
        // ignore
      }

      const now = Date.now();
      if (now - lastSaveTimeRef.current > 30000) {
        // Save every 30 seconds
        updatePosition(Math.floor(t));
        lastSaveTimeRef.current = now;
      }
    };

    const handleEndedInternal = async () => {
      const d = video.duration;
      await markCompleted(Math.floor(d));
      setIsPlaying(false);
      onEnded?.();
      setShowControls(true);
    };

    const handlePlay = () => {
      setIsPlaying(true);
      resetHideControlsTimer();
    };

    const handlePause = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    const handleMouseMove = () => {
      resetHideControlsTimer();
    };

    // Attach listeners
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEndedInternal);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    const container = containerRef.current;
    container?.addEventListener("mousemove", handleMouseMove);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEndedInternal);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      container?.removeEventListener("mousemove", handleMouseMove);
      if (inactivityTimeoutRef.current) {
        window.clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [markCompleted, updatePosition, onEnded, resetHideControlsTimer, videoRefExternal]);

  // Progress slider handlers
  const handleScrubStart = () => {
    setIsScrubbing(true);
    setShowControls(true);
    if (inactivityTimeoutRef.current) {
      window.clearTimeout(inactivityTimeoutRef.current);
    }
  };

  const handleScrubEnd = (value: number) => {
    const t = (value / 1000) * (duration || 0);
    setIsScrubbing(false);
    seekTo(t);
    resetHideControlsTimer();
  };

  const handleScrubChange = (value: number) => {
    if (!duration) return;
    const t = (value / 1000) * duration;
    setCurrentTime(t);
  };

  const playedRatio = duration ? currentTime / duration : 0;
  const bufferedRatio = duration ? buffered / duration : 0;

  const currentPct = Math.min(1000, Math.max(0, playedRatio * 1000));
  const bufferedPct = Math.min(1000, Math.max(0, bufferedRatio * 1000));

  return (
    <Box
      ref={containerRef}
      position="relative"
      bg="black"
      borderRadius="lg"
      overflow="hidden"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      _focusVisible={{ outline: "2px solid", outlineColor: "blue.400" }}
      style={style}
    >
      {/* Video element */}
      <Box position="relative" w="100%" bg="black">
        <video
          ref={videoRef}
          src={src}
          // native controls off, we do custom Netflix/YouTube style
          controls={false}
          playsInline={playsInline}
          disablePictureInPicture={disablePictureInPicture}
          controlsList={controlsList}
          onContextMenu={onContextMenu}
          style={{ width: "100%", height: "100%", display: "block" }}
          onClick={togglePlay}
        />

        {/* Center play/pause overlay */}
        {controls && (
          <Box
            pointerEvents="none"
            position="absolute"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            {!isPlaying && (
              <IconButton
                aria-label="Play"
                icon={<Play size={isMobile ? 36 : 42} />}
                borderRadius="full"
                size={isMobile ? "lg" : "lg"}
                pointerEvents="auto"
                onClick={togglePlay}
                bg="whiteAlpha.900"
                _hover={{ bg: "white" }}
                _active={{ bg: "whiteAlpha.800" }}
              />
            )}
          </Box>
        )}

        {/* Watermark overlay (top-right by default) */}
        {watermark && (
          <Box
            position="absolute"
            top={3}
            right={3}
            pointerEvents="none"
            opacity={0.8}
          >
            {watermark}
          </Box>
        )}

        {/* Bottom control bar */}
        {controls && (
          <Box
            position="absolute"
            left={0}
            right={0}
            bottom={0}
            py={isMobile ? 1 : 2}
            px={isMobile ? 2 : 4}
            bgGradient="linear(to-t, blackAlpha.700, blackAlpha.400, transparent)"
            opacity={showControls ? 1 : 0}
            transform={showControls ? "translateY(0)" : "translateY(20px)"}
            transition="opacity 0.25s ease, transform 0.25s ease"
          >
            {/* Progress bar */}
            <Box mb={2}>
              {/* Buffered bar (behind) */}
              <Box position="relative" w="100%" h="6px">
                <Box
                  position="absolute"
                  inset={0}
                  borderRadius="full"
                  bg="whiteAlpha.200"
                />
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  bottom={0}
                  borderRadius="full"
                  bg="whiteAlpha.400"
                  width={`${bufferedPct / 10}%`}
                  transition="width 0.15s linear"
                />
                {/* Slider on top */}
                <Slider
                  aria-label="video-progress"
                  value={currentPct}
                  max={1000}
                  min={0}
                  step={1}
                  onChangeStart={handleScrubStart}
                  onChangeEnd={handleScrubEnd}
                  onChange={handleScrubChange}
                >
                  <SliderTrack bg="transparent">
                    <SliderFilledTrack bg="red.500" />
                  </SliderTrack>
                  <SliderThumb
                    boxSize={3}
                    _focusVisible={{ boxShadow: "0 0 0 2px white" }}
                  />
                </Slider>
              </Box>
            </Box>

            {/* Control row */}
            <Flex align="center" justify="space-between" gap={4}>
              {/* Left controls */}
              <HStack spacing={2}>
                {/* Play / Pause */}
                <IconButton
                  aria-label={isPlaying ? "Pause" : "Play"}
                  icon={
                    isPlaying ? (
                      <Pause size={18} />
                    ) : (
                      <Play size={18} />
                    )
                  }
                  size="sm"
                  variant="ghost"
                  color="#65a8bf"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={togglePlay}
                />

                {/* Back 10s */}
                <IconButton
                  aria-label="Rewind 10 seconds"
                  icon={<RotateCcw size={18} />}
                  size="sm"
                  variant="ghost"
                  color="#65a8bf"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => seekTo(Math.max(0, currentTime - 10))}
                />

                {/* Forward 10s */}
                <IconButton
                  aria-label="Forward 10 seconds"
                  icon={<RotateCw size={18} />}
                  size="sm"
                  variant="ghost"
                  color="#65a8bf"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={() => seekTo(Math.min(duration, currentTime + 10))}
                />

                {/* Time */}
                <Text
                  fontSize="xs"
                  
                  minW="80px"
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
              </HStack>

              {/* Right controls */}
              <HStack spacing={3}>
                {/* Volume */}
                <HStack spacing={1} align="center">
                  <IconButton
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    icon={
                      isMuted || volume === 0 ? (
                        <VolumeX size={18} />
                      ) : (
                        <Volume2 size={18} />
                      )
                    }
                    size="sm"
                    variant="ghost"
                    color="#65a8bf"
                    _hover={{ bg: "whiteAlpha.200" }}
                    onClick={toggleMute}
                  />
                  {!isMobile && (
                    <Box w="90px">
                      <Slider
                        aria-label="Volume"
                        value={volume * 100}
                        max={100}
                        min={0}
                        step={1}
                        onChange={handleVolumeChange}
                      >
                        <SliderTrack bg="whiteAlpha.300">
                          <SliderFilledTrack bg="white" />
                        </SliderTrack>
                        <SliderThumb boxSize={3} />
                      </Slider>
                    </Box>
                  )}
                </HStack>

                {/* Fullscreen */}
                <IconButton
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  icon={
                    isFullscreen ? (
                      <Minimize size={18} />
                    ) : (
                      <Maximize size={18} />
                    )
                  }
                  size="sm"
                  variant="ghost"
                  color="#65a8bf"
                  _hover={{ bg: "whiteAlpha.200" }}
                  onClick={toggleFullscreen}
                />
              </HStack>
            </Flex>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default TrackedVideo;
