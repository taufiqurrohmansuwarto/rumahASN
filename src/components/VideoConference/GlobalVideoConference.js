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
  IconScreenShare,
  IconWindow,
  IconMinimize,
  IconMaximize,
} from "@tabler/icons-react";
import {
  Box,
  Flex,
  Text,
  Group,
  ActionIcon,
  Badge,
  Indicator,
  Menu,
  Divider,
} from "@mantine/core";
import { Button, Modal, Tooltip, message } from "antd";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

const JitsiMeeting = dynamic(
  () => import("@jitsi/react-sdk").then((mod) => mod.JitsiMeeting),
  { ssr: false }
);

// Position buttons config
const POSITION_OPTIONS = [
  { key: "top-left", icon: IconCornerUpLeft, label: "Kiri Atas" },
  { key: "top-right", icon: IconCornerUpRight, label: "Kanan Atas" },
  { key: "bottom-left", icon: IconCornerDownLeft, label: "Kiri Bawah" },
  { key: "bottom-right", icon: IconCornerDownRight, label: "Kanan Bawah" },
];

// View mode options with icons and labels
const VIEW_MODE_OPTIONS = [
  { key: "fullscreen", icon: IconMaximize, label: "Layar Penuh" },
  { key: "standard", icon: IconWindow, label: "Jendela Standar" },
  { key: "compact", icon: IconArrowsMinimize, label: "Kompak" },
  { key: "mini", icon: IconMinimize, label: "Mini" },
];

// Size configurations for each view mode
const VIEW_MODE_SIZES = {
  fullscreen: null, // Will use 100% viewport
  standard: { width: 800, height: 600 },
  compact: { width: 400, height: 300 },
  mini: { width: 200, height: 150 },
};

// Main Global Video Conference Component - Single Jitsi Instance
function GlobalVideoConference() {
  const {
    isOpen,
    viewMode,
    meetingData,
    pipSize,
    pipPosition,
    minimizeToPip,
    minimizeToMini,
    maximizeFromPip,
    switchToStandard,
    setViewMode,
    endMeeting,
    leaveMeeting,
    updatePipSize,
    updatePipPosition,
    getPipPositionStyles,
  } = useVideoConferenceStore();

  const queryClient = useQueryClient();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState(pipSize);
  const containerRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync size with view mode
  useEffect(() => {
    const modeSize = VIEW_MODE_SIZES[viewMode];
    if (modeSize) {
      setSize(modeSize);
    }
  }, [viewMode]);

  // Handle resize for compact/mini mode
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newWidth = Math.max(180, Math.min(800, e.clientX - rect.left + 10));
      const newHeight = Math.max(120, Math.min(600, e.clientY - rect.top + 10));

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

  // Share screen function - uses Jitsi API
  const handleShareScreen = useCallback(() => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand("toggleShareScreen");
    }
  }, []);

  // Handle end meeting - calls API and cleans up (for coach only)
  const handleEndMeeting = useCallback(async () => {
    if (!meetingData?.id) {
      endMeeting();
      return;
    }

    // Minimize first so modal appears on top
    if (viewMode === "fullscreen" || viewMode === "standard") {
      minimizeToPip();
    }

    // Small delay to ensure minimize animation completes
    setTimeout(() => {
      Modal.confirm({
        title: "Akhiri Meeting",
        content:
          "Apakah Anda yakin ingin mengakhiri coaching clinic ini? Semua peserta akan otomatis dikeluarkan.",
        okText: "Ya, Akhiri",
        cancelText: "Batal",
        okButtonProps: { danger: true, loading: isEnding },
        centered: true,
        zIndex: 10001,
        onOk: async () => {
          try {
            setIsEnding(true);

            // Kick all participants via Jitsi API before ending
            if (jitsiApiRef.current) {
              jitsiApiRef.current.executeCommand("endConference");
            }

            await endMeetingApi(meetingData.id);
            message.success("Meeting berhasil diakhiri");
            queryClient.invalidateQueries(["meeting", meetingData.id]);
            queryClient.invalidateQueries(["meetings"]);
            queryClient.invalidateQueries(["detailMeetingParticipant"]);
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
  }, [
    meetingData?.id,
    endMeeting,
    queryClient,
    isEnding,
    minimizeToPip,
    viewMode,
  ]);

  // Handle leave meeting - for participant only (just close video, don't end meeting)
  const handleLeaveMeeting = useCallback(() => {
    if (viewMode === "fullscreen" || viewMode === "standard") {
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
          leaveMeeting();
          // Redirect participant to coaching clinic list
          router.push("/coaching-clinic/my-coaching");
        },
      });
    }, 100);
  }, [leaveMeeting, minimizeToPip, viewMode, queryClient, router]);

  // Handle Jitsi API ready
  const handleJitsiApiReady = useCallback((api) => {
    jitsiApiRef.current = api;

    // Listen for conference terminated (moderator ended)
    api.addListener("videoConferenceLeft", () => {
      // If participant and conference was ended by moderator
      if (isParticipant) {
        message.info("Meeting telah diakhiri oleh coach");
        queryClient.invalidateQueries(["detailMeetingParticipant"]);
        leaveMeeting();
        // Redirect participant to coaching clinic list
        router.push("/coaching-clinic/my-coaching");
      }
    });
  }, [isParticipant, leaveMeeting, queryClient, router]);

  // Don't render on server or if not open
  if (!mounted || !isOpen || !meetingData || viewMode === "hidden") {
    return null;
  }

  const isFullscreen = viewMode === "fullscreen";
  const isStandard = viewMode === "standard";
  const isCompact = viewMode === "compact";
  const isMini = viewMode === "mini";
  const isFloating = isCompact || isMini; // Both compact and mini are floating modes
  const positionStyles = getPipPositionStyles();

  // Get current size based on view mode
  const currentSize = VIEW_MODE_SIZES[viewMode] || size;

  // Dynamic styles based on viewMode
  const getContainerStyles = () => {
    if (isFullscreen) {
      return {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9998,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
      };
    }

    if (isStandard) {
      return {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: currentSize.width,
        height: currentSize.height,
        zIndex: 9998,
        backgroundColor: "#1a1a1a",
        borderRadius: 12,
        overflow: "hidden",
        boxShadow: "0 16px 48px rgba(0, 0, 0, 0.5)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
      };
    }

    // Compact or Mini (floating modes)
    return {
      position: "fixed",
      ...positionStyles,
      width: currentSize.width,
      height: currentSize.height,
      zIndex: 9999,
      backgroundColor: "#1a1a1a",
      borderRadius: isMini ? 8 : 12,
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      transition: isResizing ? "none" : "all 0.3s ease",
    };
  };

  const getHeaderStyles = () => {
    if (isFullscreen || isStandard) {
      return {
        height: isFullscreen ? 60 : 52,
        backgroundColor: "#fff",
        padding: isFullscreen ? "0 24px" : "0 16px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid #f0f0f0",
      };
    }

    // Compact or Mini
    return {
      height: isMini ? 32 : 44,
      backgroundColor: "#fff",
      padding: isMini ? "0 8px" : "0 12px",
      borderBottom: "1px solid #f0f0f0",
    };
  };

  // Toolbar buttons config based on view mode
  const getToolbarButtons = () => {
    if (isFullscreen || isStandard) {
      return undefined; // All buttons
    }
    if (isCompact) {
      return ["microphone", "camera", "hangup", "chat", "raisehand"];
    }
    // Mini - minimal buttons
    return ["microphone", "camera", "hangup"];
  };

  const content = (
    <Box ref={containerRef} sx={getContainerStyles()}>
      {/* Header */}
      <Flex align="center" justify="space-between" sx={getHeaderStyles()}>
        <Group spacing={isFullscreen ? "md" : isMini ? 4 : 8}>
          <Indicator
            color="green"
            processing
            size={isMini ? 6 : isFullscreen ? 12 : 10}
          >
            <IconVideo
              size={isMini ? 14 : isFullscreen ? 24 : 18}
              color="#1890ff"
            />
          </Indicator>
          {!isMini && (
            <>
              {isFullscreen || isStandard ? (
                <Box>
                  <Text color="dark" weight={600} size={isFullscreen ? "lg" : "md"}>
                    {meetingData?.title || "Coaching & Mentoring"}
                  </Text>
                  <Badge color="green" variant="filled" size="sm">
                    LIVE
                  </Badge>
                </Box>
              ) : (
                <Text color="dark" weight={500} size="xs" lineClamp={1}>
                  {meetingData?.title || "Live"}
                </Text>
              )}
            </>
          )}
        </Group>

        <Group spacing={isMini ? 2 : isFullscreen ? "sm" : 4}>
          {/* Position buttons - only in floating modes */}
          {isFloating && !isMini && (
            <Group spacing={2}>
              {POSITION_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                return (
                  <Tooltip key={opt.key} title={opt.label}>
                    <ActionIcon
                      size="xs"
                      variant="subtle"
                      onClick={() => updatePipPosition(opt.key)}
                      sx={{
                        color: pipPosition === opt.key ? "#1890ff" : "#999",
                        "&:hover": { backgroundColor: "rgba(0,0,0,0.05)" },
                      }}
                    >
                      <IconComp size={12} />
                    </ActionIcon>
                  </Tooltip>
                );
              })}
            </Group>
          )}

          {/* Share Screen button - in compact mode */}
          {isCompact && (
            <Tooltip title="Bagikan Layar">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={handleShareScreen}
                sx={{
                  color: "#52c41a",
                  "&:hover": { backgroundColor: "rgba(82,196,26,0.1)" },
                }}
              >
                <IconScreenShare size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {/* View Mode Menu */}
          {(isFullscreen || isStandard) ? (
            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <Button icon={<IconWindow size={16} />}>Ubah Tampilan</Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Mode Tampilan</Menu.Label>
                {VIEW_MODE_OPTIONS.map((opt) => {
                  const IconComp = opt.icon;
                  return (
                    <Menu.Item
                      key={opt.key}
                      icon={<IconComp size={16} />}
                      onClick={() => setViewMode(opt.key)}
                      sx={{
                        backgroundColor:
                          viewMode === opt.key
                            ? "rgba(24,144,255,0.1)"
                            : undefined,
                      }}
                    >
                      {opt.label}
                    </Menu.Item>
                  );
                })}
              </Menu.Dropdown>
            </Menu>
          ) : (
            // In floating modes - quick actions
            <>
              <Tooltip title="Layar Penuh">
                <ActionIcon
                  size={isMini ? "xs" : "sm"}
                  variant="subtle"
                  onClick={maximizeFromPip}
                  sx={{
                    color: "#1890ff",
                    "&:hover": { backgroundColor: "rgba(24,144,255,0.1)" },
                  }}
                >
                  <IconArrowsMaximize size={isMini ? 12 : 16} />
                </ActionIcon>
              </Tooltip>

              {isCompact && (
                <Tooltip title="Mode Mini">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={minimizeToMini}
                    sx={{
                      color: "#722ed1",
                      "&:hover": { backgroundColor: "rgba(114,46,209,0.1)" },
                    }}
                  >
                    <IconMinimize size={14} />
                  </ActionIcon>
                </Tooltip>
              )}

              {isMini && (
                <Tooltip title="Mode Kompak">
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    onClick={minimizeToPip}
                    sx={{
                      color: "#722ed1",
                      "&:hover": { backgroundColor: "rgba(114,46,209,0.1)" },
                    }}
                  >
                    <IconArrowsMinimize size={12} />
                  </ActionIcon>
                </Tooltip>
              )}
            </>
          )}

          {/* End/Leave Meeting button */}
          {isParticipant ? (
            // Participant: Leave button
            isFullscreen || isStandard ? (
              <Button danger icon={<IconDoorExit size={16} />} onClick={handleLeaveMeeting}>
                Keluar
              </Button>
            ) : (
              <Tooltip title="Keluar">
                <ActionIcon
                  size={isMini ? "xs" : "sm"}
                  variant="subtle"
                  onClick={handleLeaveMeeting}
                  sx={{
                    color: "#fa8c16",
                    "&:hover": { backgroundColor: "rgba(250,140,22,0.1)" },
                  }}
                >
                  <IconDoorExit size={isMini ? 12 : 16} />
                </ActionIcon>
              </Tooltip>
            )
          ) : (
            // Coach: End meeting button
            isFullscreen || isStandard ? (
              <Button type="primary" danger icon={<IconX size={16} />} onClick={handleEndMeeting}>
                Akhiri
              </Button>
            ) : (
              <Tooltip title="Akhiri Meeting">
                <ActionIcon
                  size={isMini ? "xs" : "sm"}
                  variant="subtle"
                  onClick={handleEndMeeting}
                  sx={{
                    color: "#ff4d4f",
                    "&:hover": { backgroundColor: "rgba(255,77,79,0.1)" },
                  }}
                >
                  <IconX size={isMini ? 12 : 16} />
                </ActionIcon>
              </Tooltip>
            )
          )}
        </Group>
      </Flex>

      {/* Video Container - Single Jitsi Instance */}
      <Box
        sx={{
          flex: isFullscreen || isStandard ? 1 : undefined,
          height: isFloating
            ? `calc(100% - ${isMini ? 32 : 44}px)`
            : undefined,
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
          onApiReady={handleJitsiApiReady}
          configOverwrite={{
            prejoinPageEnabled: false,
            // Only mute audio for coach by default, participant should have audio on
            startWithAudioMuted: !isParticipant,
            startWithVideoMuted: false,
            startScreenSharing: false,
            enableEmailInStats: false,
            // Moderator management - kick all when moderator ends
            enableModeratorManagementInConference: true,
            disableRemoteMute: false,
            // When moderator leaves, end conference for all
            enableClosePage: true,
            // Toolbar buttons based on view mode
            toolbarButtons: getToolbarButtons(),
            whiteboard: {
              enabled: true,
              collabServerBaseUrl:
                "https://siasn.bkd.jatimprov.go.id/whiteboard",
            },
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: isFloating,
            FILM_STRIP_MAX_HEIGHT: isMini ? 0 : isCompact ? 80 : undefined,
            TILE_VIEW_MAX_COLUMNS: isMini ? 1 : isCompact ? 2 : undefined,
            TOOLBAR_ALWAYS_VISIBLE: isFloating ? false : true,
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

        {/* Resize Handle - only in compact mode */}
        {isCompact && (
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
