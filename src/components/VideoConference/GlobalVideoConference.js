import useVideoConferenceStore from "@/store/useVideoConference";
import { endMeeting as endMeetingApi } from "@/services/coaching-clinics.services";
import {
  IconArrowsMaximize,
  IconArrowsMinimize,
  IconX,
  IconCornerDownLeft,
  IconCornerDownRight,
  IconCornerUpLeft,
  IconCornerUpRight,
  IconVideo,
  IconDoorExit,
} from "@tabler/icons-react";
import {
  Box,
  Flex,
  Text,
  Group,
  ActionIcon,
  Badge,
  Indicator,
} from "@mantine/core";
import { Button, Modal, Tooltip, message } from "antd";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";

const JitsiMeeting = dynamic(
  () => import("@jitsi/react-sdk").then((mod) => mod.JitsiMeeting),
  { ssr: false }
);

// Position buttons config
const POSITION_OPTIONS = [
  { key: "top-left", icon: IconCornerUpLeft },
  { key: "top-right", icon: IconCornerUpRight },
  { key: "bottom-left", icon: IconCornerDownLeft },
  { key: "bottom-right", icon: IconCornerDownRight },
];

// Main Global Video Conference Component - Single Jitsi Instance
function GlobalVideoConference() {
  const {
    isOpen,
    viewMode,
    meetingData,
    pipSize,
    pipPosition,
    minimizeToPip,
    maximizeFromPip,
    endMeeting,
    updatePipSize,
    updatePipPosition,
    getPipPositionStyles,
  } = useVideoConferenceStore();

  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState(pipSize);
  const containerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync size with store when pipSize changes
  useEffect(() => {
    setSize(pipSize);
  }, [pipSize]);

  // Handle resize for PiP mode
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(320, Math.min(800, e.clientX - rect.left + 10));
      const newHeight = Math.max(240, Math.min(600, e.clientY - rect.top + 10));

      setSize({ width: newWidth, height: newHeight });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        updatePipSize(size);
      }
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, size, updatePipSize]);

  // Check if user is participant (not coach)
  const isParticipant = meetingData?.isParticipant === true;

  // Handle end meeting - calls API and cleans up (for coach only)
  const handleEndMeeting = useCallback(async () => {
    if (!meetingData?.id) {
      endMeeting();
      return;
    }

    // Minimize first so modal appears on top
    if (viewMode === "fullscreen") {
      minimizeToPip();
    }

    // Small delay to ensure minimize animation completes
    setTimeout(() => {
      Modal.confirm({
        title: "Akhiri Meeting",
        content: "Apakah Anda yakin ingin mengakhiri coaching clinic ini?",
        okText: "Ya, Akhiri",
        cancelText: "Batal",
        okButtonProps: { danger: true, loading: isEnding },
        centered: true,
        zIndex: 10001,
        onOk: async () => {
          try {
            setIsEnding(true);
            await endMeetingApi(meetingData.id);
            message.success("Meeting berhasil diakhiri");
            queryClient.invalidateQueries(["meeting", meetingData.id]);
            queryClient.invalidateQueries(["meetings"]);
            endMeeting();
          } catch (error) {
            console.error("Error ending meeting:", error);
            message.error("Gagal mengakhiri meeting");
          } finally {
            setIsEnding(false);
          }
        },
      });
    }, 100);
  }, [meetingData?.id, endMeeting, queryClient, isEnding, minimizeToPip, viewMode]);

  // Handle leave meeting - for participant only (just close video, don't end meeting)
  const handleLeaveMeeting = useCallback(() => {
    if (viewMode === "fullscreen") {
      minimizeToPip();
    }

    setTimeout(() => {
      Modal.confirm({
        title: "Keluar dari Meeting",
        content: "Apakah Anda yakin ingin keluar dari coaching clinic ini?",
        okText: "Ya, Keluar",
        cancelText: "Batal",
        centered: true,
        zIndex: 10001,
        onOk: () => {
          message.info("Anda telah keluar dari meeting");
          queryClient.invalidateQueries(["detailMeetingParticipant"]);
          endMeeting();
        },
      });
    }, 100);
  }, [endMeeting, minimizeToPip, viewMode, queryClient]);

  // Don't render on server or if not open
  if (!mounted || !isOpen || !meetingData || viewMode === "hidden") {
    return null;
  }

  const isFullscreen = viewMode === "fullscreen";
  const isPip = viewMode === "pip";
  const positionStyles = getPipPositionStyles();

  // Dynamic styles based on viewMode
  const containerStyles = isFullscreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
      }
    : {
        position: "fixed",
        ...positionStyles,
        width: size.width,
        height: size.height,
        zIndex: 9999,
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        transition: isResizing ? "none" : "all 0.3s ease",
      };

  const headerStyles = isFullscreen
    ? {
        height: 60,
        backgroundColor: "#fff",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid #f0f0f0",
      }
    : {
        height: 44,
        backgroundColor: "#fff",
        padding: "0 12px",
        borderBottom: "1px solid #f0f0f0",
      };

  const content = (
    <Box ref={containerRef} sx={containerStyles}>
      {/* Header */}
      <Flex align="center" justify="space-between" sx={headerStyles}>
        <Group spacing={isFullscreen ? "md" : 8}>
          <Indicator color="green" processing size={isFullscreen ? 12 : 10}>
            <IconVideo size={isFullscreen ? 24 : 18} color="#1890ff" />
          </Indicator>
          {isFullscreen ? (
            <Box>
              <Text color="dark" weight={600} size="lg">
                {meetingData?.title || "Coaching & Mentoring"}
              </Text>
              <Badge color="green" variant="filled" size="sm">
                LIVE
              </Badge>
            </Box>
          ) : (
            <Text color="dark" weight={500} size="sm" lineClamp={1}>
              {meetingData?.title || "Meeting Live"}
            </Text>
          )}
        </Group>

        <Group spacing={isFullscreen ? "md" : 4}>
          {/* Position buttons - only in PiP mode */}
          {isPip && (
            <Group spacing={2}>
              {POSITION_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                return (
                  <Tooltip key={opt.key} title={`Pindah ke ${opt.key}`}>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => updatePipPosition(opt.key)}
                      sx={{
                        color:
                          pipPosition === opt.key
                            ? "#1890ff"
                            : "#999",
                        "&:hover": {
                          backgroundColor: "rgba(0,0,0,0.05)",
                        },
                      }}
                    >
                      <IconComp size={14} />
                    </ActionIcon>
                  </Tooltip>
                );
              })}
            </Group>
          )}

          {/* Minimize/Maximize button */}
          {isFullscreen ? (
            <Tooltip title="Minimize ke PiP">
              <Button
                type="primary"
                icon={<IconArrowsMinimize size={16} />}
                onClick={minimizeToPip}
              >
                Minimize
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Fullscreen">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={maximizeFromPip}
                sx={{
                  color: "#1890ff",
                  "&:hover": { backgroundColor: "rgba(24,144,255,0.1)" },
                }}
              >
                <IconArrowsMaximize size={16} />
              </ActionIcon>
            </Tooltip>
          )}

          {/* End/Leave Meeting button */}
          {isParticipant ? (
            // Participant: Leave button (doesn't end meeting for everyone)
            isFullscreen ? (
              <Button
                danger
                icon={<IconDoorExit size={16} />}
                onClick={handleLeaveMeeting}
              >
                Keluar Meeting
              </Button>
            ) : (
              <Tooltip title="Keluar Meeting">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={handleLeaveMeeting}
                  sx={{
                    color: "#fa8c16",
                    "&:hover": { backgroundColor: "rgba(250,140,22,0.1)" },
                  }}
                >
                  <IconDoorExit size={16} />
                </ActionIcon>
              </Tooltip>
            )
          ) : (
            // Coach: End meeting button (ends meeting for everyone)
            isFullscreen ? (
              <Button
                type="primary"
                danger
                icon={<IconX size={16} />}
                onClick={handleEndMeeting}
              >
                Akhiri Meeting
              </Button>
            ) : (
              <Tooltip title="Akhiri Meeting">
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={handleEndMeeting}
                  sx={{
                    color: "#ff4d4f",
                    "&:hover": { backgroundColor: "rgba(255,77,79,0.1)" },
                  }}
                >
                  <IconX size={16} />
                </ActionIcon>
              </Tooltip>
            )
          )}
        </Group>
      </Flex>

      {/* Video Container - Single Jitsi Instance */}
      <Box
        sx={{
          flex: isFullscreen ? 1 : undefined,
          height: isPip ? "calc(100% - 44px)" : undefined,
          position: "relative",
        }}
      >
        <JitsiMeeting
          domain="coaching-online.site"
          jwt={meetingData?.jwt}
          roomName={meetingData?.id}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = "100%";
            iframeRef.style.width = "100%";
          }}
          configOverwrite={{
            prejoinPageEnabled: false,
            startWithAudioMuted: true,
            startScreenSharing: false,
            enableEmailInStats: false,
            // Show all toolbar buttons in fullscreen, limited in PiP
            toolbarButtons: isFullscreen
              ? undefined // default all buttons
              : ["microphone", "camera", "hangup", "chat", "raisehand"],
            whiteboard: {
              enabled: true,
              collabServerBaseUrl:
                "https://siasn.bkd.jatimprov.go.id/whiteboard",
            },
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: !isFullscreen,
            FILM_STRIP_MAX_HEIGHT: isPip ? 0 : undefined,
            TILE_VIEW_MAX_COLUMNS: isPip ? 1 : undefined,
            APP_NAME: "Coaching & Mentoring",
          }}
          userInfo={{
            displayName: isParticipant
              ? meetingData?.participant?.username || "Peserta"
              : meetingData?.coach?.username || "Coach",
            role: isParticipant ? "participant" : "moderator",
          }}
          onReadyToClose={isParticipant ? handleLeaveMeeting : handleEndMeeting}
        />

        {/* Resize Handle - only in PiP mode */}
        {isPip && (
          <Box
            onMouseDown={handleMouseDown}
            sx={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: 20,
              height: 20,
              cursor: "se-resize",
              background:
                "linear-gradient(135deg, transparent 50%, rgba(255,255,255,0.3) 50%)",
              borderRadius: "0 0 12px 0",
            }}
          />
        )}
      </Box>
    </Box>
  );

  // Use portal to render at document.body level
  return createPortal(content, document.body);
}

export default GlobalVideoConference;
