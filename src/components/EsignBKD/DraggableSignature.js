import { CloseOutlined, ExpandOutlined, UserOutlined, DragOutlined } from "@ant-design/icons";
import { ActionIcon, Paper, Avatar } from "@mantine/core";
import { useState, useRef, useMemo, useEffect, memo } from "react";
import Draggable from "react-draggable";
import { pixelToRatio, ratioToPixel, pixelSizeToRatio, ratioSizeToPixel } from "@/store/useSignatureStore";

const DEFAULT_WIDTH = 60; // pixels - square untuk logo BSrE
const DEFAULT_HEIGHT = 60; // pixels - square untuk logo BSrE
const MIN_WIDTH = 30; // Bisa diperkecil sampai 30px
const MIN_HEIGHT = 30; // Bisa diperkecil sampai 30px (square)
const SELECTION_PADDING = 8; // Extra padding untuk selection box
const HANDLE_SIZE = 24; // Size untuk drag/resize handles

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
  positionRatio = { x: 0.1, y: 0.1 }, // Position as ratio (0-1)
  sizeRatio = { width: 0.084, height: 0.063 }, // Size as ratio (0-1) - default ~50px on 595x792
  signerName = "Saya",
  signerAvatar = null, // URL foto user
  onPositionChange, // Callback with ratio
  onSizeChange, // Callback with ratio
  onRemove,
  containerBounds,
  disabled = false,
}) {
  const nodeRef = useRef(null);

  // Convert ratio to pixels for internal state and rendering
  const pixelPosition = useMemo(
    () => ratioToPixel(positionRatio, containerBounds),
    [positionRatio, containerBounds]
  );

  const pixelSize = useMemo(
    () => ratioSizeToPixel(sizeRatio, containerBounds),
    [sizeRatio, containerBounds]
  );

  const [position, setPosition] = useState(pixelPosition);
  const [size, setSize] = useState(pixelSize);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Sync pixel position/size when ratio or containerBounds change
  useEffect(() => {
    if (!isDragging && !isResizing) {
      setPosition(pixelPosition);
      setSize(pixelSize);
    }
  }, [pixelPosition, pixelSize, isDragging, isResizing]);

  // Responsive sizing berdasarkan ukuran signature
  const avatarSize = Math.max(16, Math.min(24, size.width * 0.18));
  const buttonSize = Math.max(16, Math.min(20, size.width * 0.15));
  const rightOverflow = buttonSize * 0.4; // Close button negative right offset
  const bottomOverflow = Math.max(2, buttonSize * 0.5); // Resize handle
  const avatarPadding = Math.max(8, avatarSize * 0.3); // Avatar left/top overflow

  // Calculate bounds dynamically - constrain position so signature + controls don't overflow
  const bounds = useMemo(() => {
    if (!containerBounds || !containerBounds.width || !containerBounds.height) {
      return { left: 0, top: 0, right: 0, bottom: 0 };
    }

    return {
      left: avatarPadding, // Avatar overflows left
      top: avatarPadding, // Avatar overflows top
      right: Math.max(avatarPadding, containerBounds.width - size.width - rightOverflow),
      bottom: Math.max(avatarPadding, containerBounds.height - size.height - bottomOverflow),
    };
  }, [containerBounds, size.width, size.height, rightOverflow, bottomOverflow, avatarPadding]);

  const handleDrag = (_e, data) => {
    setIsDragging(true);
    const newPixelPosition = { x: data.x, y: data.y };
    setPosition(newPixelPosition);
    // Don't update parent during drag - wait for drag stop for better performance
  };

  const handleDragStop = (_e, data) => {
    setIsDragging(false);

    // Update parent only when drag is complete for smooth dragging
    if (onPositionChange) {
      const finalPosition = { x: data.x, y: data.y };
      const newRatio = pixelToRatio(finalPosition, containerBounds);
      onPositionChange(id, page, newRatio);
    }
  };

  // Resize handler with aspect ratio lock
  const handleMouseDown = (e) => {
    if (disabled) return;
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = size.width;
    const startHeight = size.height;
    const aspectRatio = startWidth / startHeight; // Lock aspect ratio

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;

      // Use horizontal movement for proportional scaling
      let newWidth = Math.max(MIN_WIDTH, startWidth + deltaX);
      let newHeight = newWidth / aspectRatio;

      // Ensure minimum height
      if (newHeight < MIN_HEIGHT) {
        newHeight = MIN_HEIGHT;
        newWidth = newHeight * aspectRatio;
      }

      // Constrain size so signature doesn't overflow container
      if (containerBounds) {
        const maxWidth = containerBounds.width - position.x;
        const maxHeight = containerBounds.height - position.y;

        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = newWidth / aspectRatio;
        }

        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * aspectRatio;
        }
      }

      const newSize = { width: newWidth, height: newHeight };
      setSize(newSize);

      // Convert pixel size to ratio and update parent
      if (onSizeChange) {
        const newSizeRatio = pixelSizeToRatio(newSize, containerBounds);
        onSizeChange(id, newSizeRatio);
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

  // Additional sizing calculations
  const avatarFontSize = Math.max(7, avatarSize * 0.4);
  const iconSize = Math.max(8, buttonSize * 0.5);

  return (
    <Draggable
      nodeRef={nodeRef}
      position={position}
      onDrag={handleDrag}
      onStop={handleDragStop}
      bounds={bounds}
      disabled={disabled || isResizing}
    >
      <Paper
        ref={nodeRef}
        shadow="md"
        p={0}
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
            ? "3px solid #1890ff"
            : "2px solid rgba(24, 144, 255, 0.3)",
          backgroundColor: showControls
            ? "rgba(24, 144, 255, 0.08)"
            : "rgba(255, 255, 255, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          boxShadow: showControls
            ? "0 4px 12px rgba(24, 144, 255, 0.3)"
            : "0 2px 4px rgba(0,0,0,0.1)",
          // Disable transition while dragging/resizing for instant response
          transition: isDragging || isResizing ? "none" : "all 0.2s ease",
          // Scale up slightly on hover for better visibility
          transform: showControls && !isDragging ? "scale(1.05)" : "scale(1)",
        }}
      >
        {/* Selection Label - Show signer name when selected */}
        {showControls && (
          <div
            style={{
              position: "absolute",
              top: -32,
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(24, 144, 255, 0.95)",
              color: "white",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "11px",
              fontWeight: "600",
              whiteSpace: "nowrap",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              zIndex: 30,
              pointerEvents: "none",
            }}
          >
            {signerName}
          </div>
        )}

        {/* BSrE Logo */}
        <img
          src="https://siasn.bkd.jatimprov.go.id:9000/public/logo-bsre.png"
          alt="BSrE"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            opacity: showControls ? 0.9 : 0.7,
            transition: "opacity 0.2s ease",
          }}
        />

        {/* Central Drag Handle - Larger for easier interaction */}
        {showControls && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              backgroundColor: "rgba(24, 144, 255, 0.9)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "grab",
              zIndex: 25,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              border: "2px solid white",
            }}
          >
            <DragOutlined style={{ fontSize: 14, color: "white" }} />
          </div>
        )}

        {/* Avatar with Photo or Initials - Always visible */}
        <Avatar
          src={signerAvatar && !imageError ? signerAvatar : null}
          size={avatarSize}
          radius="xl"
          color={avatarColor}
          style={{
            position: "absolute",
            top: -avatarSize * 0.3,
            left: -avatarSize * 0.3,
            zIndex: 20,
            border: "2px solid white",
            fontSize: `${avatarFontSize}px`,
            fontWeight: "bold",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            minWidth: avatarSize,
            minHeight: avatarSize,
          }}
          title={signerName}
          onError={() => setImageError(true)}
        >
          {/* Fallback: Show initials or icon if no image */}
          {!signerAvatar || imageError ? (
            initials === "?" ? (
              <UserOutlined style={{ fontSize: avatarFontSize }} />
            ) : (
              initials
            )
          ) : null}
        </Avatar>

        {/* Remove Button - Larger for easier interaction */}
        {showControls && onRemove && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onRemove(id);
            }}
            style={{
              position: "absolute",
              top: -HANDLE_SIZE / 3,
              right: -HANDLE_SIZE / 3,
              zIndex: 25,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              backgroundColor: "#ff4d4f",
              borderRadius: "50%",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <CloseOutlined style={{ fontSize: 12, color: "white" }} />
          </div>
        )}

        {/* Resize Handle - Larger for easier interaction */}
        {showControls && (
          <div
            onMouseDown={handleMouseDown}
            style={{
              position: "absolute",
              bottom: -HANDLE_SIZE / 3,
              right: -HANDLE_SIZE / 3,
              width: HANDLE_SIZE,
              height: HANDLE_SIZE,
              cursor: "nwse-resize",
              zIndex: 25,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#52c41a",
              borderRadius: "50%",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            <ExpandOutlined style={{ fontSize: 12, color: "white" }} />
          </div>
        )}
      </Paper>
    </Draggable>
  );
}

// Memoize component to prevent unnecessary re-renders when other signatures change
// Custom comparison: only re-render if props actually changed
const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.page === nextProps.page &&
    prevProps.positionRatio.x === nextProps.positionRatio.x &&
    prevProps.positionRatio.y === nextProps.positionRatio.y &&
    prevProps.sizeRatio.width === nextProps.sizeRatio.width &&
    prevProps.sizeRatio.height === nextProps.sizeRatio.height &&
    prevProps.signerName === nextProps.signerName &&
    prevProps.signerAvatar === nextProps.signerAvatar &&
    prevProps.containerBounds.width === nextProps.containerBounds.width &&
    prevProps.containerBounds.height === nextProps.containerBounds.height &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onPositionChange === nextProps.onPositionChange &&
    prevProps.onSizeChange === nextProps.onSizeChange &&
    prevProps.onRemove === nextProps.onRemove
  );
};

export default memo(DraggableSignature, arePropsEqual);
export { DEFAULT_WIDTH as SIGNATURE_WIDTH, DEFAULT_HEIGHT as SIGNATURE_HEIGHT };
