import {
  pixelSizeToRatio,
  pixelToRatio,
  ratioSizeToPixel,
  ratioToPixel,
} from "@/store/useSignatureStore";
import {
  CloseOutlined,
  DragOutlined,
  ExpandOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Paper } from "@mantine/core";
import { memo, useMemo, useRef, useState, useEffect } from "react";
import Draggable from "react-draggable";

const DEFAULT_WIDTH = 60; // pixels - square untuk logo BSrE
const DEFAULT_HEIGHT = 60; // pixels - square untuk logo BSrE
const MIN_WIDTH = 30; // Bisa diperkecil sampai 30px
const MIN_HEIGHT = 30; // Bisa diperkecil sampai 30px (square)
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
  containerBounds, // Actual rendered size (for visual positioning)
  rawPageSize, // Raw page size (for ratio calculations)
  disabled = false,
}) {
  const nodeRef = useRef(null);

  // Convert ratio to pixels for rendering - NO local state needed!
  const position = useMemo(
    () => ratioToPixel(positionRatio, containerBounds),
    [positionRatio, containerBounds]
  );

  const size = useMemo(
    () => ratioSizeToPixel(sizeRatio, containerBounds),
    [sizeRatio, containerBounds]
  );

  // Only UI state - no position/size state to avoid infinite loop!
  const [isResizing, setIsResizing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Local dragging position for smooth dragging (only used during drag)
  const [dragPosition, setDragPosition] = useState(null);
  const [resizeSize, setResizeSize] = useState(null);

  // Use local state during drag/resize, props otherwise
  const currentPosition = isDragging && dragPosition ? dragPosition : position;
  const currentSize = isResizing && resizeSize ? resizeSize : size;

  // DEBUG: Log position data only during interactions to avoid console spam
  useEffect(() => {
    if (isDragging || isResizing || isHovered) {
      console.log(`[DraggableSignature] ID: ${id}, Page: ${page}`, {
        positionRatio,
        sizeRatio,
        containerBounds,
        calculatedPixelPosition: position,
        calculatedPixelSize: size,
        currentPosition,
        currentSize,
        signerName,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, isResizing, isHovered]);

  // Responsive sizing berdasarkan ukuran signature - use currentSize for dynamic sizing
  const avatarSize = Math.max(16, Math.min(24, currentSize.width * 0.18));
  const buttonSize = Math.max(16, Math.min(20, currentSize.width * 0.15));

  // SIMPLE bounds calculation - cukup page size dari Zustand!
  // Biarkan controls (avatar, buttons) overflow sedikit - yang penting signature box tidak keluar
  // IMPORTANT: Harus pakai SIZE dari props, bukan currentSize, karena currentSize berubah saat resize
  const bounds = useMemo(() => {
    if (!containerBounds || !containerBounds.width || !containerBounds.height) {
      return { left: 0, top: 0, right: 0, bottom: 0 };
    }

    // Use SIZE from props (not currentSize) untuk bounds yang stabil
    const iconWidth = size.width;
    const iconHeight = size.height;

    // Simple: signature box tidak boleh keluar dari page
    const calculatedBounds = {
      left: 0,
      top: 0,
      right: containerBounds.width - iconWidth,
      bottom: containerBounds.height - iconHeight,
    };

    console.log("[DraggableSignature] Bounds calculation:", {
      page,
      containerWidth: containerBounds.width,
      containerHeight: containerBounds.height,
      iconWidth,
      iconHeight,
      maxRight: calculatedBounds.right,
      maxBottom: calculatedBounds.bottom,
    });

    return calculatedBounds;
  }, [
    containerBounds.width,
    containerBounds.height,
    size.width,
    size.height,
    page,
  ]);

  const handleDrag = (_e, data) => {
    setIsDragging(true);
    const newPixelPosition = { x: data.x, y: data.y };
    setDragPosition(newPixelPosition); // Local state for smooth dragging
    // Don't update parent during drag - wait for drag stop for better performance
  };

  const handleDragStop = (_e, data) => {
    const finalPosition = { x: data.x, y: data.y };

    // IMPORTANT: Calculate ratio based on RAW page size, not actual rendered size
    // This ensures ratios are consistent across different scales and mobile constraints
    if (onPositionChange) {
      // Convert from rendered pixels to raw pixels first
      const scaleX = rawPageSize.width / containerBounds.width;
      const scaleY = rawPageSize.height / containerBounds.height;
      const rawPixelPosition = {
        x: finalPosition.x * scaleX,
        y: finalPosition.y * scaleY,
      };

      // Then convert raw pixels to ratio
      const newRatio = pixelToRatio(rawPixelPosition, rawPageSize);

      console.log("🟣 [DraggableSignature] Drag stop - Position conversion:", {
        renderedPosition: finalPosition,
        containerBounds,
        rawPageSize,
        scaleFactors: { scaleX, scaleY },
        rawPixelPosition,
        finalRatio: newRatio,
      });

      onPositionChange(id, page, newRatio);
    }

    // Clear local drag state
    setIsDragging(false);
    setDragPosition(null);
  };

  // Resize handler with aspect ratio lock
  const handleMouseDown = (e) => {
    if (disabled) return;
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = size.width;
    const startHeight = size.height;
    const aspectRatio = startWidth / startHeight; // Lock aspect ratio (square)
    let finalSize = null;

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

      // SIMPLE: Constrain based on page size dari Zustand
      if (containerBounds) {
        // Maksimal width = page width - position x (sisa ruang ke kanan)
        const maxWidth = containerBounds.width - position.x;
        // Maksimal height = page height - position y (sisa ruang ke bawah)
        const maxHeight = containerBounds.height - position.y;

        console.log("[DraggableSignature] Resize constraint:", {
          containerBounds,
          position,
          maxWidth,
          maxHeight,
          requestedWidth: newWidth,
          requestedHeight: newHeight,
        });

        if (newWidth > maxWidth) {
          newWidth = maxWidth;
          newHeight = newWidth / aspectRatio;
        }

        if (newHeight > maxHeight) {
          newHeight = maxHeight;
          newWidth = newHeight * aspectRatio;
        }
      }

      finalSize = { width: newWidth, height: newHeight };
      setResizeSize(finalSize); // Local state for smooth resizing
    };

    const handleMouseUp = () => {
      // Update parent only once when resize is complete
      if (finalSize && onSizeChange) {
        // IMPORTANT: Calculate size ratio based on RAW page size, not rendered size
        const scaleX = rawPageSize.width / containerBounds.width;
        const scaleY = rawPageSize.height / containerBounds.height;
        const rawPixelSize = {
          width: finalSize.width * scaleX,
          height: finalSize.height * scaleY,
        };

        const newSizeRatio = pixelSizeToRatio(rawPixelSize, rawPageSize);

        console.log("🟣 [DraggableSignature] Resize stop - Size conversion:", {
          renderedSize: finalSize,
          containerBounds,
          rawPageSize,
          scaleFactors: { scaleX, scaleY },
          rawPixelSize,
          finalSizeRatio: newSizeRatio,
        });

        onSizeChange(id, newSizeRatio);
      }

      // Clear local resize state
      setIsResizing(false);
      setResizeSize(null);
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

  return (
    <Draggable
      nodeRef={nodeRef}
      position={currentPosition}
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
          width: currentSize.width,
          height: currentSize.height,
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
  // Safe comparison with null/undefined checks
  const positionEqual =
    prevProps.positionRatio?.x === nextProps.positionRatio?.x &&
    prevProps.positionRatio?.y === nextProps.positionRatio?.y;

  const sizeEqual =
    prevProps.sizeRatio?.width === nextProps.sizeRatio?.width &&
    prevProps.sizeRatio?.height === nextProps.sizeRatio?.height;

  const boundsEqual =
    prevProps.containerBounds?.width === nextProps.containerBounds?.width &&
    prevProps.containerBounds?.height === nextProps.containerBounds?.height;

  const rawPageSizeEqual =
    prevProps.rawPageSize?.width === nextProps.rawPageSize?.width &&
    prevProps.rawPageSize?.height === nextProps.rawPageSize?.height;

  return (
    prevProps.id === nextProps.id &&
    prevProps.page === nextProps.page &&
    positionEqual &&
    sizeEqual &&
    prevProps.signerName === nextProps.signerName &&
    prevProps.signerAvatar === nextProps.signerAvatar &&
    boundsEqual &&
    rawPageSizeEqual &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onPositionChange === nextProps.onPositionChange &&
    prevProps.onSizeChange === nextProps.onSizeChange &&
    prevProps.onRemove === nextProps.onRemove
  );
};

export default memo(DraggableSignature, arePropsEqual);
export { DEFAULT_HEIGHT as SIGNATURE_HEIGHT, DEFAULT_WIDTH as SIGNATURE_WIDTH };
