import { CloseOutlined, ExpandOutlined, UserOutlined } from "@ant-design/icons";
import { ActionIcon, Paper, Avatar } from "@mantine/core";
import { useState, useRef } from "react";
import Draggable from "react-draggable";

const DEFAULT_WIDTH = 110; // pixels - lebih kecil karena tanpa label
const DEFAULT_HEIGHT = 50; // pixels
const MIN_WIDTH = 60;
const MIN_HEIGHT = 30;

// Helper function to get initials from name
const getInitials = (name) => {
  if (!name) return "?";
  const words = name.trim().split(" ");
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

// Helper function to generate consistent color from name
const getColorFromName = (name) => {
  const colors = [
    "blue",
    "cyan",
    "grape",
    "green",
    "indigo",
    "lime",
    "orange",
    "pink",
    "red",
    "teal",
    "violet",
    "yellow",
  ];
  if (!name) return "blue";
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

function DraggableSignature({
  id,
  page,
  initialPosition = { x: 50, y: 50 },
  initialSize = { width: DEFAULT_WIDTH, height: DEFAULT_HEIGHT },
  signerName = "Saya",
  signerAvatar = null, // URL foto user
  onPositionChange,
  onSizeChange,
  onRemove,
  containerBounds,
  disabled = false,
}) {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);
  const nodeRef = useRef(null);

  const handleDrag = (e, data) => {
    setIsDragging(true);
    // Update position immediately on drag
    if (onPositionChange) {
      onPositionChange(id, page, { x: data.x, y: data.y });
    }
  };

  const handleDragStop = () => {
    setIsDragging(false);
  };

  // Resize handler with aspect ratio lock
  const handleMouseDown = (e) => {
    if (disabled) return;
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = size.width;
    const startHeight = size.height;
    const aspectRatio = startWidth / startHeight; // Lock aspect ratio

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;

      // Use diagonal distance for proportional scaling
      // Prioritize horizontal movement
      let newWidth = Math.max(MIN_WIDTH, startWidth + deltaX);
      let newHeight = newWidth / aspectRatio;

      // Ensure minimum height
      if (newHeight < MIN_HEIGHT) {
        newHeight = MIN_HEIGHT;
        newWidth = newHeight * aspectRatio;
      }

      const newSize = { width: newWidth, height: newHeight };
      setSize(newSize);

      if (onSizeChange) {
        onSizeChange(id, newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Show controls when hovering, dragging, or resizing
  const showControls = !disabled && (isHovered || isDragging || isResizing);

  const initials = getInitials(signerName);
  const avatarColor = getColorFromName(signerName);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={initialPosition}
      onDrag={handleDrag}
      onStop={handleDragStop}
      bounds="parent"
      disabled={disabled || isResizing}
    >
      <Paper
        ref={nodeRef}
        shadow="md"
        p={4}
        radius="md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          width: size.width,
          height: size.height,
          cursor: disabled
            ? "default"
            : isResizing
            ? "nwse-resize"
            : isDragging
            ? "grabbing"
            : showControls
            ? "grab"
            : "default",
          position: "absolute",
          zIndex: showControls ? 100 : 10,
          border: showControls
            ? "2px dashed #1890ff"
            : "1px solid rgba(24, 144, 255, 0.2)",
          backgroundColor: showControls
            ? "rgba(24, 144, 255, 0.05)"
            : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          boxShadow: showControls ? "0 2px 8px rgba(0,0,0,0.15)" : "none",
          transition: "all 0.2s ease",
        }}
      >
        {/* BSrE Logo */}
        <img
          src="https://siasn.bkd.jatimprov.go.id:9000/public/logo-bsre.png"
          alt="BSrE"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            pointerEvents: "none",
            opacity: showControls ? 0.9 : 0.7,
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Avatar with Photo or Initials - Always visible */}
        <Avatar
          src={signerAvatar && !imageError ? signerAvatar : null}
          size={20} // Custom size - lebih kecil dari "sm"
          radius="xl"
          color={avatarColor}
          style={{
            position: "absolute",
            top: -6,
            left: -6,
            zIndex: 20,
            border: "1.5px solid white",
            fontSize: "8px",
            fontWeight: "bold",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
            minWidth: 20,
            minHeight: 20,
          }}
          title={signerName}
          onError={() => setImageError(true)}
        >
          {/* Fallback: Show initials or icon if no image */}
          {!signerAvatar || imageError ? (
            initials === "?" ? (
              <UserOutlined style={{ fontSize: 10 }} />
            ) : (
              initials
            )
          ) : null}
        </Avatar>

        {/* Remove Button - Only show on hover */}
        {showControls && onRemove && (
          <ActionIcon
            size="xs"
            color="red"
            variant="filled"
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              zIndex: 20,
              opacity: 1,
            }}
          >
            <CloseOutlined style={{ fontSize: 10 }} />
          </ActionIcon>
        )}

        {/* Resize Handle - Only show on hover */}
        {showControls && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 20,
              height: 20,
              cursor: "nwse-resize",
              zIndex: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1890ff",
              borderRadius: "0 0 6px 0",
              opacity: 1,
            }}
          >
            <ExpandOutlined style={{ fontSize: 12, color: "white" }} />
          </div>
        )}
      </Paper>
    </Draggable>
  );
}

export default DraggableSignature;
export { DEFAULT_WIDTH as SIGNATURE_WIDTH, DEFAULT_HEIGHT as SIGNATURE_HEIGHT };
