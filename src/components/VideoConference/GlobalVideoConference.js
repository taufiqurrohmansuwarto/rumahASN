import useVideoConferenceStore from "@/store/useVideoConference";
import {
  endMeeting as endMeetingApi,
  heartbeatVideoSession,
} from "@/services/coaching-clinics.services";
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

// Position options
const POSITION_OPTIONS = [
  { key: "top-left", icon: IconCornerUpLeft, label: "Kiri Atas" },
  { key: "top-right", icon: IconCornerUpRight, label: "Kanan Atas" },
  { key: "bottom-left", icon: IconCornerDownLeft, label: "Kiri Bawah" },
  { key: "bottom-right", icon: IconCornerDownRight, label: "Kanan Bawah" },
];

// View mode options
const VIEW_MODE_OPTIONS = [
  { key: "fullscreen", icon: IconMaximize, label: "Layar Penuh" },
  { key: "standard", icon: IconWindow, label: "Jendela Standar" },
  { key: "compact", icon: IconArrowsMinimize, label: "Kompak" },
  { key: "mini", icon: IconMinimize, label: "Mini" },
];

// Size configurations
const VIEW_MODE_SIZES = {
  fullscreen: null,
  standard: { width: 800, height: 600 },
  compact: { width: 400, height: 300 },
  mini: { width: 200, height: 150 },
};

// Heartbeat interval in milliseconds (30 seconds)
const HEARTBEAT_INTERVAL_MS = 30 * 1000;

function GlobalVideoConference() {
  const {
    isOpen,
    viewMode,
    meetingData,
    pipPosition,
    setViewMode,
    closeMeeting,
    endMeetingAsConsultant,
    updatePipPosition,
    getPipPositionStyles,
  } = useVideoConferenceStore();

  const queryClient = useQueryClient();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [jitsiKey, setJitsiKey] = useState(null); // Unique key for Jitsi instance

  const jitsiApiRef = useRef(null);
  const containerRef = useRef(null);
  const isEndingRef = useRef(false); // Prevent double end calls
  const listenerCleanupRef = useRef(null); // Store listener cleanup function

  // Cleanup refs
  const timeoutRef = useRef(null);
  const heartbeatRef = useRef(null);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    return () => {
      // Cleanup timeout on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Generate unique Jitsi key when meeting changes to prevent duplicate instances
  useEffect(() => {
    if (meetingData?.id) {
      setJitsiKey(`jitsi-${meetingData.id}-${Date.now()}`);
    } else {
      setJitsiKey(null);
    }
  }, [meetingData?.id]);

  // Heartbeat effect - keep session alive
  useEffect(() => {
    // Clear previous interval
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (!isOpen || !meetingData?.id) return;

    // Send initial heartbeat
    heartbeatVideoSession(meetingData.id).catch((error) => {
      console.error("Initial heartbeat failed:", error);
    });

    // Set up interval for subsequent heartbeats
    heartbeatRef.current = setInterval(() => {
      heartbeatVideoSession(meetingData.id).catch((error) => {
        console.error("Heartbeat failed:", error);
        // If heartbeat fails consistently, session might be invalid
        // Let backend handle cleanup via timeout
      });
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [isOpen, meetingData?.id]);

  // Cleanup Jitsi API listeners on unmount or meeting change
  useEffect(() => {
    return () => {
      // Cleanup listener first
      if (listenerCleanupRef.current) {
        try {
          listenerCleanupRef.current();
        } catch (e) {
          // Ignore cleanup errors
        }
        listenerCleanupRef.current = null;
      }
      
      // Then dispose Jitsi
      if (jitsiApiRef.current) {
        try {
          jitsiApiRef.current.dispose();
        } catch (e) {
          // Ignore disposal errors
        }
        jitsiApiRef.current = null;
      }
      
      // Reset ending flag
      isEndingRef.current = false;
    };
  }, [meetingData?.id]);

  const isParticipant = meetingData?.isParticipant === true;

  // Handle share screen
  const handleShareScreen = useCallback(() => {
    jitsiApiRef.current?.executeCommand?.("toggleShareScreen");
  }, []);

  // Handle end meeting (Coach only)
  const handleEndMeeting = useCallback(() => {
    // Prevent double calls
    if (isEndingRef.current) return;

    if (!meetingData?.id) {
      closeMeeting();
      return;
    }

    isEndingRef.current = true;

    // Store current view mode before minimizing
    const previousViewMode = viewMode;

    // Minimize first for modal visibility
    if (viewMode === "fullscreen" || viewMode === "standard") {
      setViewMode("compact");
    }

    timeoutRef.current = setTimeout(() => {
      Modal.confirm({
        title: "Akhiri Meeting",
        content: "Semua peserta akan otomatis dikeluarkan. Lanjutkan?",
        okText: "Ya, Akhiri",
        cancelText: "Batal",
        okButtonProps: { danger: true },
        centered: true,
        zIndex: 10001,
        onOk: async () => {
          setIsProcessing(true);
          try {
            // End conference via Jitsi API (kick all participants)
            jitsiApiRef.current?.executeCommand?.("endConference");

            // Update meeting status in backend
            await endMeetingApi(meetingData.id);
            message.success("Meeting berhasil diakhiri");

            // Invalidate queries
            queryClient.invalidateQueries(["meeting", meetingData.id]);
            queryClient.invalidateQueries(["meetings"]);
            queryClient.invalidateQueries(["detailMeetingParticipant"]);

            // End all video sessions (consultant + all participants)
            await endMeetingAsConsultant();
          } catch (error) {
            console.error("Error ending meeting:", error);
            message.error("Gagal mengakhiri meeting");
            // Still try to close local state
            closeMeeting();
          } finally {
            setIsProcessing(false);
            isEndingRef.current = false;
          }
        },
        onCancel: () => {
          // Return to previous view mode
          setViewMode(previousViewMode !== "hidden" ? previousViewMode : "fullscreen");
          isEndingRef.current = false;
        },
      });
    }, 150);
  }, [meetingData?.id, viewMode, setViewMode, closeMeeting, endMeetingAsConsultant, queryClient]);

  // Handle leave meeting (Participant only)
  const handleLeaveMeeting = useCallback(() => {
    // Prevent double calls
    if (isEndingRef.current) return;
    isEndingRef.current = true;

    const previousViewMode = viewMode;

    if (viewMode === "fullscreen" || viewMode === "standard") {
      setViewMode("compact");
    }

    timeoutRef.current = setTimeout(() => {
      Modal.confirm({
        title: "Keluar dari Meeting",
        content: "Anda yakin ingin keluar?",
        okText: "Ya, Keluar",
        cancelText: "Batal",
        centered: true,
        zIndex: 10001,
        onOk: () => {
          message.info("Anda telah keluar dari meeting");
          queryClient.invalidateQueries(["detailMeetingParticipant"]);
          closeMeeting();
          router.push("/coaching-clinic/my-coaching-clinic");
          isEndingRef.current = false;
        },
        onCancel: () => {
          setViewMode(previousViewMode !== "hidden" ? previousViewMode : "fullscreen");
          isEndingRef.current = false;
        },
      });
    }, 150);
  }, [viewMode, setViewMode, closeMeeting, queryClient, router]);

  // Handle Jitsi API ready
  const handleJitsiApiReady = useCallback(
    (api) => {
      jitsiApiRef.current = api;

      // Clean up previous listener if exists
      if (listenerCleanupRef.current) {
        try {
          listenerCleanupRef.current();
        } catch (e) {
          // Ignore
        }
      }

      // Listen for conference ended by moderator
      const handleConferenceLeft = () => {
        // Only auto-handle for participants - check current state
        const currentMeetingData = useVideoConferenceStore.getState().meetingData;
        if (currentMeetingData?.isParticipant) {
          message.info("Meeting telah diakhiri oleh coach");
          queryClient.invalidateQueries(["detailMeetingParticipant"]);
          isEndingRef.current = false; // Reset flag
          closeMeeting();
          router.push("/coaching-clinic/my-coaching-clinic");
        }
      };

      api.addListener("videoConferenceLeft", handleConferenceLeft);

      // Store cleanup function
      listenerCleanupRef.current = () => {
        try {
          api.removeListener("videoConferenceLeft", handleConferenceLeft);
        } catch (e) {
          // Ignore - api might be disposed
        }
      };
    },
    [closeMeeting, queryClient, router]
  );

  // Don't render if not ready
  if (!mounted || !isOpen || !meetingData || viewMode === "hidden" || !jitsiKey) {
    return null;
  }

  const isFullscreen = viewMode === "fullscreen";
  const isStandard = viewMode === "standard";
  const isCompact = viewMode === "compact";
  const isMini = viewMode === "mini";
  const isFloating = isCompact || isMini;

  const positionStyles = getPipPositionStyles();
  const currentSize = VIEW_MODE_SIZES[viewMode];

  // Container styles
  const getContainerStyles = () => {
    if (isFullscreen) {
      return {
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        backgroundColor: "rgba(0, 0, 0, 0.95)",
        display: "flex",
        flexDirection: "column",
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
        display: "flex",
        flexDirection: "column",
      };
    }

    return {
      position: "fixed",
      ...positionStyles,
      width: currentSize?.width || 400,
      height: currentSize?.height || 300,
      zIndex: 9999,
      backgroundColor: "#1a1a1a",
      borderRadius: isMini ? 8 : 12,
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    };
  };

  // Header styles
  const headerHeight = isMini ? 32 : isFullscreen ? 60 : isStandard ? 52 : 44;
  const headerStyles = {
    height: headerHeight,
    backgroundColor: "#fff",
    padding: isMini ? "0 8px" : isFullscreen ? "0 24px" : "0 12px",
    borderBottom: "1px solid #f0f0f0",
    flexShrink: 0,
  };

  // Toolbar config
  const getToolbarButtons = () => {
    if (isFullscreen || isStandard) return undefined;
    if (isCompact)
      return ["microphone", "camera", "hangup", "chat", "raisehand"];
    return ["microphone", "camera", "hangup"];
  };

  const content = (
    <Box ref={containerRef} sx={getContainerStyles()}>
      {/* Header */}
      <Flex align="center" justify="space-between" sx={headerStyles}>
        <Group spacing={isMini ? 4 : 8}>
          <Indicator color="green" processing size={isMini ? 6 : 10}>
            <IconVideo size={isMini ? 14 : 18} color="#1890ff" />
          </Indicator>
          {!isMini && (
            <Text
              color="dark"
              weight={500}
              size={isFullscreen ? "md" : "sm"}
              lineClamp={1}
            >
              {meetingData?.title || "Meeting"}
            </Text>
          )}
          {(isFullscreen || isStandard) && (
            <Badge color="green" variant="filled" size="sm">
              LIVE
            </Badge>
          )}
        </Group>

        <Group spacing={isMini ? 2 : 4}>
          {/* Position buttons - floating modes only */}
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

          {/* Share screen - compact mode */}
          {isCompact && (
            <Tooltip title="Bagikan Layar">
              <ActionIcon
                size="sm"
                variant="subtle"
                onClick={handleShareScreen}
                sx={{ color: "#52c41a" }}
              >
                <IconScreenShare size={14} />
              </ActionIcon>
            </Tooltip>
          )}

          {/* View mode controls */}
          {isFullscreen || isStandard ? (
            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <Button icon={<IconWindow size={16} />}>Tampilan</Button>
              </Menu.Target>
              <Menu.Dropdown>
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
            <>
              <Tooltip title="Layar Penuh">
                <ActionIcon
                  size={isMini ? "xs" : "sm"}
                  variant="subtle"
                  onClick={() => setViewMode("fullscreen")}
                  sx={{ color: "#1890ff" }}
                >
                  <IconArrowsMaximize size={isMini ? 12 : 14} />
                </ActionIcon>
              </Tooltip>
              {isCompact && (
                <Tooltip title="Mini">
                  <ActionIcon
                    size="sm"
                    variant="subtle"
                    onClick={() => setViewMode("mini")}
                    sx={{ color: "#722ed1" }}
                  >
                    <IconMinimize size={14} />
                  </ActionIcon>
                </Tooltip>
              )}
              {isMini && (
                <Tooltip title="Kompak">
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    onClick={() => setViewMode("compact")}
                    sx={{ color: "#722ed1" }}
                  >
                    <IconArrowsMinimize size={12} />
                  </ActionIcon>
                </Tooltip>
              )}
            </>
          )}

          {/* End/Leave button */}
          {isParticipant ? (
            isFullscreen || isStandard ? (
              <Button
                danger
                icon={<IconDoorExit size={16} />}
                onClick={handleLeaveMeeting}
              >
                Keluar
              </Button>
            ) : (
              <Tooltip title="Keluar">
                <ActionIcon
                  size={isMini ? "xs" : "sm"}
                  variant="subtle"
                  onClick={handleLeaveMeeting}
                  sx={{ color: "#fa8c16" }}
                >
                  <IconDoorExit size={isMini ? 12 : 14} />
                </ActionIcon>
              </Tooltip>
            )
          ) : isFullscreen || isStandard ? (
            <Button
              type="primary"
              danger
              icon={<IconX size={16} />}
              onClick={handleEndMeeting}
              loading={isProcessing}
            >
              Akhiri
            </Button>
          ) : (
            <Tooltip title="Akhiri">
              <ActionIcon
                size={isMini ? "xs" : "sm"}
                variant="subtle"
                onClick={handleEndMeeting}
                sx={{ color: "#ff4d4f" }}
              >
                <IconX size={isMini ? 12 : 14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Flex>

      {/* Video Container */}
      <Box
        sx={{
          flex: 1,
          height: isFloating ? `calc(100% - ${headerHeight}px)` : undefined,
          position: "relative",
        }}
      >
        <JitsiMeeting
          key={jitsiKey}
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
            startWithAudioMuted: !isParticipant,
            startWithVideoMuted: false,
            enableModeratorManagementInConference: true,
            disableRemoteMute: false,
            enableClosePage: false, // Disable Jitsi's own close - use our button
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
            TOOLBAR_ALWAYS_VISIBLE: !isFloating,
            APP_NAME: "Coaching & Mentoring",
          }}
          userInfo={{
            displayName: isParticipant
              ? meetingData?.participant?.username || "Peserta"
              : meetingData?.coach?.username || "Coach",
            role: isParticipant ? "participant" : "moderator",
          }}
        />
      </Box>
    </Box>
  );

  return createPortal(content, document.body);
}

export default GlobalVideoConference;
