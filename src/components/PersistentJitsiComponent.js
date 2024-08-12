// components/PersistentJitsiComponent.js
import { DragOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Draggable from "react-draggable";
import JitsiMeeting from "./VideoConference/JitsiMeeting";
import { useVideoConference } from "@/store/useVideoConference";

function PersistentJitsiComponent() {
  const [domReady, setDomReady] = useState(false);
  const {
    position,
    size,
    isMinimized,
    updatePosition,
    toggleMinimize,
    closeVideoConference,
    meetingData,
  } = useVideoConference();

  useEffect(() => {
    setDomReady(true);
  }, []);

  const handleDrag = (e, data) => {
    updatePosition({ x: data.x, y: data.y });
  };

  if (!domReady) return null;

  return createPortal(
    <Draggable position={position} onStop={handleDrag} handle=".drag-handle">
      <div
        style={{
          position: "fixed",
          zIndex: 1000,
          width: isMinimized ? "300px" : size.width,
          height: isMinimized ? "200px" : size.height,
          transition: "width 0.3s, height 0.3s",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          border: "1px solid #d9d9d9",
          borderRadius: "4px",
          overflow: "hidden",
        }}
      >
        <div
          className="drag-handle"
          style={{
            padding: "8px",
            background: "#f0f0f0",
            cursor: "move",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Space>
            <DragOutlined style={{ cursor: "move" }} />
            <Typography.Text strong>Coaching & Mentoring</Typography.Text>
          </Space>
          <Space>
            <Button size="small" onClick={toggleMinimize}>
              {isMinimized ? "Maximize" : "Minimize"}
            </Button>
            <Button size="small" onClick={closeVideoConference}>
              Close
            </Button>
          </Space>
        </div>
        <div style={{ height: "calc(100% - 40px)", overflow: "hidden" }}>
          <JitsiMeeting
            domain="coaching-online.site"
            roomName={meetingData?.id || "test"}
            getIFrameRef={(iframeRef) => {
              iframeRef.style.height = "100%";
              iframeRef.style.width = "100%";
            }}
            configOverwrite={{
              prejoinPageEnabled: false,
              startWithAudioMuted: true,
              startScreenSharing: true,
              enableEmailInStats: false,
              whiteboard: {
                enabled: true,
                collabServerBaseUrl:
                  "https://siasn.bkd.jatimprov.go.id/whiteboard",
              },
            }}
            interfaceConfigOverwrite={{
              DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
              APP_NAME: "Coaching & Mentoring",
            }}
            userInfo={{
              displayName: meetingData?.coach?.username,
              role: "moderator",
            }}
            onReadyToClose={closeVideoConference}
          />
        </div>
      </div>
    </Draggable>,
    document.body
  );
}

export default PersistentJitsiComponent;
