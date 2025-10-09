"use client";

import {
  ExclamationCircleOutlined,
  FileTextOutlined,
  FullscreenOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  CloudDownloadOutlined,
  ReloadOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import {
  ActionIcon,
  Avatar,
  Card,
  Center,
  Group,
  Loader,
  NumberInput,
  Stack,
  Text,
} from "@mantine/core";
import { Button, Col, Grid, Row, Tooltip } from "antd";
import dynamic from "next/dynamic";
import {
  useCallback,
  useEffect,
  useState,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useDownloadDocument } from "@/hooks/esign-bkd";
import DraggableSignature, {
  SIGNATURE_WIDTH,
  SIGNATURE_HEIGHT,
} from "./DraggableSignature";
import useSignatureStore, { pixelToRatio, pixelSizeToRatio } from "@/store/useSignatureStore";
import usePdfPageStore from "@/store/usePdfPageStore";
import { signaturesToCoordinates } from "@/utils/signature-coordinate-helper";

// Import react-pdf CSS (required)
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Dynamic import react-pdf components with proper Next.js setup
const Document = dynamic(
  () => import("react-pdf").then((mod) => mod.Document),
  { ssr: false }
);

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

const { useBreakpoint } = Grid;

const PdfViewer = forwardRef(function PdfViewer(
  {
    pdfBase64,
    title = "Dokumen PDF",
    headerActions = null,
    documentId = null,
    // Signature placement props
    enableSignaturePlacement = false,
    initialSignatures = [], // Changed from signatures to initialSignatures
    signerName = "Saya",
    signerAvatar = null, // Add this prop - URL foto user
    signerId = "self", // Add this
    canEdit = true,
    onPageSizesLoad = null, // Callback when all page sizes are loaded
  },
  ref
) {
  const screens = useBreakpoint();
  const isMobile = !screens?.md;

  const { mutate: downloadDoc, isLoading: isDownloading } =
    useDownloadDocument();

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.5); // Default 150% untuk kemudahan orang tua
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfWorkerReady, setPdfWorkerReady] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfjsVersion, setPdfjsVersion] = useState("3.11.174");
  const [pageLoading, setPageLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  // Signature placement state - NOW USING ZUSTAND
  const signatures = useSignatureStore((state) => state.signatures);
  const addSignature = useSignatureStore((state) => state.addSignature);
  const removeSignature = useSignatureStore((state) => state.removeSignature);
  const removeSignaturesByPage = useSignatureStore((state) => state.removeSignaturesByPage);
  const removeSignaturesBySignerId = useSignatureStore((state) => state.removeSignaturesBySignerId);
  const updateSignaturePosition = useSignatureStore((state) => state.updateSignaturePosition);
  const updateSignatureSize = useSignatureStore((state) => state.updateSignatureSize);
  const clearSignatures = useSignatureStore((state) => state.clearSignatures);
  const setSignatures = useSignatureStore((state) => state.setSignatures);
  const setSignCoordinates = useSignatureStore((state) => state.setSignCoordinates);

  const pageContainerRef = useRef(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [isPageReady, setIsPageReady] = useState(false);

  // Zustand store for page sizes (global state)
  const setPageSizeToStore = usePdfPageStore((state) => state.setPageSize);
  const getDocumentPageSizes = usePdfPageStore((state) => state.getDocumentPageSizes);

  // Debug props
  console.log('[PdfViewer] Props:', {
    documentId,
    enableSignaturePlacement,
    canEdit,
    initialSignaturesLength: initialSignatures?.length || 0,
    signerName,
    signerId,
  });

  // Memoize PDF.js options to prevent unnecessary reloads
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/standard_fonts/`,
    }),
    [pdfjsVersion]
  );

  // Initialize signatures from prop - only on mount or when count changes
  const prevInitialSigsLength = useRef(0);

  useEffect(() => {
    const currentLength = initialSignatures?.length || 0;

    console.log('[PdfViewer] Checking initialSignatures:', {
      prevLength: prevInitialSigsLength.current,
      currentLength,
      currentSignaturesCount: signatures.length,
      canEdit,
    });

    // Only update if:
    // 1. Length changed (new signatures added/removed)
    // 2. AND (in view mode OR in edit mode with empty signatures)
    if (currentLength !== prevInitialSigsLength.current) {
      if (currentLength > 0 && (!canEdit || signatures.length === 0)) {
        console.log('[PdfViewer] Setting signatures from initialSignatures');
        setSignatures(initialSignatures);
      }
      prevInitialSigsLength.current = currentLength;
    }

    // Cleanup: clear signatures when component unmounts
    return () => {
      clearSignatures();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSignatures?.length, canEdit]); // Only watch length, not array reference

  // Track previous signatures to avoid unnecessary updates
  const prevSignaturesRef = useRef([]);

  // Update signCoordinates (for API) whenever signatures change
  useEffect(() => {
    if (!documentId) return;

    // Check if signatures actually changed (deep comparison including position and size)
    const signaturesChanged =
      signatures.length !== prevSignaturesRef.current.length ||
      signatures.some((sig, idx) => {
        const prevSig = prevSignaturesRef.current[idx];
        if (!prevSig || sig.id !== prevSig.id) return true;

        // CRITICAL: Also check if position or size changed!
        const positionChanged =
          sig.positionRatio?.x !== prevSig.positionRatio?.x ||
          sig.positionRatio?.y !== prevSig.positionRatio?.y;

        const sizeChanged =
          sig.sizeRatio?.width !== prevSig.sizeRatio?.width ||
          sig.sizeRatio?.height !== prevSig.sizeRatio?.height;

        return positionChanged || sizeChanged;
      });

    if (!signaturesChanged) {
      console.log('[PdfViewer] Signatures unchanged, skipping coordinate conversion');
      return;
    }

    console.log('✅ [PdfViewer] Signatures changed! Converting to coordinates...', {
      signaturesCount: signatures.length,
      prevCount: prevSignaturesRef.current.length,
    });

    // Get all page sizes from Zustand for this document
    const allPageSizes = getDocumentPageSizes(documentId);

    console.log('[PdfViewer] Converting signatures to coordinates:', {
      documentId,
      signaturesCount: signatures.length,
      pageSizeWidth: pageSize.width,
      allPageSizesKeys: Object.keys(allPageSizes),
    });

    // Convert each signature using its specific page's dimensions
    const coordinates = signatures.map((sig) => {
      // Get page size for this specific signature's page from Zustand
      const sigPageSize = allPageSizes[sig.page] || pageSize;
      const pdfPageWidth = sigPageSize.width || 612;
      const pdfPageHeight = sigPageSize.height || 792;

      console.log(`[PdfViewer] Converting signature on page ${sig.page}:`, {
        signatureId: sig.id,
        pageSize: sigPageSize,
        pdfPageWidth,
        pdfPageHeight,
      });

      // Convert this single signature with correct page dimensions
      const [coord] = signaturesToCoordinates([sig], pdfPageWidth, pdfPageHeight);
      return coord;
    });

    console.log('[PdfViewer] Final coordinates for API:', coordinates.length);
    setSignCoordinates(coordinates);
    prevSignaturesRef.current = signatures;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatures, setSignCoordinates, documentId, pageSize.width, pageSize.height]);

  // Listen for jumpToPage event from parent components
  useEffect(() => {
    const handleJumpToPage = (event) => {
      const { page } = event.detail;
      if (page && page !== pageNumber) {
        setPageNumber(page);
      }
    };

    window.addEventListener("jumpToPage", handleJumpToPage);

    return () => {
      window.removeEventListener("jumpToPage", handleJumpToPage);
    };
  }, [pageNumber]);

  // MEMOIZE: Get signatures for current page
  const currentPageSignatures = useMemo(() => {
    return signatures.filter((sig) => sig.page === pageNumber);
  }, [signatures, pageNumber]);

  // Signature placement functions - now using zustand actions
  const handleAddSignature = useCallback(() => {
    if (!isPageReady || !pageSize.width || pageSize.width === 0) {
      return;
    }

    const pdfWidth = pageSize.width;
    const pdfHeight = pageSize.height;

    // Account for signature controls overflow
    const avatarSize = Math.max(16, Math.min(24, SIGNATURE_WIDTH * 0.18));
    const buttonSize = Math.max(16, Math.min(20, SIGNATURE_WIDTH * 0.15));
    const leftPadding = Math.max(8, avatarSize * 0.3);
    const topPadding = Math.max(8, avatarSize * 0.3);
    const rightPadding = buttonSize * 0.4;
    const bottomPadding = Math.max(2, buttonSize * 0.5);

    const initialX = Math.max(leftPadding, pdfWidth / 2 - SIGNATURE_WIDTH / 2);
    const initialY = 50;

    const boundedX = Math.max(
      leftPadding,
      Math.min(initialX, pdfWidth - SIGNATURE_WIDTH - rightPadding)
    );
    const boundedY = Math.max(
      topPadding,
      Math.min(initialY, pdfHeight - SIGNATURE_HEIGHT - bottomPadding)
    );

    // Convert pixel position and size to ratio for storage
    const positionRatio = pixelToRatio({ x: boundedX, y: boundedY }, pageSize);
    const sizeRatio = pixelSizeToRatio({ width: SIGNATURE_WIDTH, height: SIGNATURE_HEIGHT }, pageSize);

    const newSignature = {
      id: `sig_${Date.now()}`,
      page: pageNumber,
      positionRatio, // Store as ratio
      sizeRatio, // Store as ratio
      signerName: signerName,
      signerAvatar: signerAvatar,
      signerId: signerId,
    };

    addSignature(newSignature);
  }, [pageNumber, signerName, signerAvatar, signerId, pageSize, isPageReady, addSignature]);

  const handleSignaturePositionChange = useCallback(
    (signatureId, page, positionRatio) => {
      updateSignaturePosition(signatureId, page, positionRatio);
    },
    [updateSignaturePosition]
  );

  const handleSignatureSizeChange = useCallback(
    (signatureId, sizeRatio) => {
      updateSignatureSize(signatureId, sizeRatio);
    },
    [updateSignatureSize]
  );

  // Setup PDF.js worker sesuai dokumentasi react-pdf
  useEffect(() => {
    const setupWorker = async () => {
      try {
        const { pdfjs } = await import("react-pdf");

        // Setup worker untuk Next.js - gunakan CDN yang reliable
        const workerFileName = pdfjs.version.startsWith("2")
          ? "pdf.worker.min.js"
          : "pdf.worker.min.mjs";
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/${workerFileName}`;

        if (isMounted) {
          setPdfjsVersion(pdfjs.version);
          setPdfWorkerReady(true);
        }
      } catch (error) {
        console.error("Failed to setup PDF worker:", error);
        if (isMounted) {
          setError("Gagal menginisialisasi PDF viewer");
          setLoading(false);
        }
      }
    };

    setupWorker();
  }, [isMounted]);

  // Memoize processed PDF data to avoid re-processing
  const processedPdfData = useMemo(() => {
    if (!pdfBase64 || typeof pdfBase64 !== "string") {
      return null;
    }

    const normalizedBase64 = pdfBase64.trim();
    return normalizedBase64.startsWith("data:application/pdf")
      ? normalizedBase64
      : `data:application/pdf;base64,${normalizedBase64}`;
  }, [pdfBase64]);

  // Process PDF base64 data
  useEffect(() => {
    if (!processedPdfData || !pdfWorkerReady) {
      return;
    }

    setLoading(true);
    setPageLoading(true);
    setError(null);
    setPdfData(processedPdfData);
    setPageNumber(1);
  }, [processedPdfData, pdfWorkerReady]);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }) => {
      if (!isMounted) return;
      setNumPages(numPages);
      setLoading(false);
      setPageLoading(false);
      setError(null);
    },
    [isMounted]
  );

  const onDocumentLoadProgress = useCallback(() => {
    // Silent progress tracking
  }, []);

  // FIXED: onPageRenderSuccess
  const onPageRenderSuccess = useCallback(
    (page) => {
      if (!isMounted) return;
      setPageLoading(false);

      // Capture page size for signature placement
      if (page) {
        // IMPORTANT: react-pdf returns page size AFTER scaling
        // We need RAW PDF size (unscaled) for coordinate calculations
        const rawPageSize = {
          width: page.width / scale,
          height: page.height / scale,
        };

        console.log('[PdfViewer] Page rendered successfully:', {
          documentId,
          pageNumber,
          rawReactPdfSize: { width: page.width, height: page.height },
          scale,
          calculatedRawSize: rawPageSize,
          hasDocumentId: !!documentId,
        });

        // Always set page size and ready state
        setPageSize(rawPageSize);
        setIsPageReady(true);
        console.log('[PdfViewer] Page is now ready!');

        // Store to Zustand only if documentId exists
        if (documentId) {
          setPageSizeToStore(documentId, pageNumber, rawPageSize);
          console.log(`[PdfViewer] Stored page ${pageNumber} size to Zustand for doc ${documentId}`);
        } else {
          console.warn('[PdfViewer] No documentId - page size not stored to Zustand');
        }
      }
    },
    [isMounted, pageNumber, scale, documentId, setPageSizeToStore]
  );

  // Reset page ready state when page changes
  useEffect(() => {
    console.log(`[PdfViewer] Page changed to ${pageNumber} - resetting isPageReady to false`);
    setIsPageReady(false);
  }, [pageNumber]);

  // Debug: Log isPageReady changes
  useEffect(() => {
    console.log(`[PdfViewer] isPageReady changed to: ${isPageReady}`);
  }, [isPageReady]);

  const onPageRenderError = useCallback(
    (pageError) => {
      if (!isMounted) return;
      setPageLoading(false);
      setError(`Gagal memuat halaman PDF: ${pageError?.message || pageError}`);
    },
    [isMounted]
  );

  const onDocumentLoadError = useCallback(
    (error) => {
      if (!isMounted) return;
      setError(`Gagal memuat dokumen PDF: ${error.message || error}`);
      setLoading(false);
      setPageLoading(false);
    },
    [isMounted]
  );

  const changePage = useCallback(
    (nextPage) => {
      if (!nextPage || Number.isNaN(nextPage)) {
        return;
      }

      if (!numPages) {
        return;
      }

      const boundedPage = Math.min(Math.max(nextPage, 1), numPages);

      if (boundedPage === pageNumber) {
        return;
      }

      setError(null);
      setPageLoading(true);
      setPageNumber(boundedPage);
    },
    [numPages, pageNumber]
  );

  const goToPrevPage = useCallback(() => {
    changePage(pageNumber - 1);
  }, [changePage, pageNumber]);

  const goToNextPage = useCallback(() => {
    changePage(pageNumber + 1);
  }, [changePage, pageNumber]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.5); // Reset ke 150%
  }, []);

  const handleRefresh = useCallback(() => {
    setError(null);
    setPageLoading(true);
    setLoading(true);
    setPageNumber(1);
    setScale(1.5); // Default 150%
    setIsPageReady(false);
    setNumPages(null);

    // Force re-render by clearing first then setting pdfData again
    setPdfData(null);

    setTimeout(() => {
      if (pdfBase64) {
        const normalizedBase64 = pdfBase64.trim();
        const dataUri = normalizedBase64.startsWith("data:application/pdf")
          ? normalizedBase64
          : `data:application/pdf;base64,${normalizedBase64}`;
        setPdfData(dataUri);
      }
    }, 100);
  }, [pdfBase64]);

  const goToPage = useCallback(
    (page) => {
      changePage(page);
    },
    [changePage]
  );

  const handleDownload = useCallback(() => {
    if (!documentId) {
      console.error("Document ID is required for download");
      return;
    }

    downloadDoc({
      id: documentId,
      filename: `${title}.pdf`,
    });
  }, [documentId, title, downloadDoc]);

  // Expose methods to parent via ref
  useImperativeHandle(
    ref,
    () => ({
      changePage,
      getCurrentPage: () => pageNumber,
      getTotalPages: () => numPages,
      getScale: () => scale,
      addSignature: handleAddSignature,
      clearAllSignatures: clearSignatures,
      removeSignaturesByPage,
      removeSignaturesBySignerId,
    }),
    [
      changePage,
      pageNumber,
      numPages,
      scale,
      handleAddSignature,
      clearSignatures,
      removeSignaturesByPage,
      removeSignaturesBySignerId,
    ]
  );

  const renderError = () => (
    <Center py="xl">
      <Stack align="center" gap="md">
        <ExclamationCircleOutlined style={{ fontSize: 64, color: "#d1d5db" }} />
        <Text size="lg" c="dimmed">
          {error || "Gagal memuat dokumen PDF"}
        </Text>
        <Text size="sm" c="dimmed">
          Pastikan file PDF valid dan dapat diakses
        </Text>
        <Text size="xs" c="dimmed">
          Pastikan data PDF sudah dimuat dengan benar
        </Text>
      </Stack>
    </Center>
  );

  const renderLoading = () => (
    <Center py="xl">
      <Stack align="center" gap="md">
        <Loader size="lg" />
        <Text size="sm" c="dimmed">
          Memuat dokumen PDF...
        </Text>
      </Stack>
    </Center>
  );

  const renderInlineLoading = () => (
    <Center
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "rgba(248, 249, 250, 0.85)",
        zIndex: 1,
        flexDirection: "column",
      }}
    >
      <Loader size="lg" />
      <Text size="sm" c="dimmed" style={{ marginTop: 12 }}>
        Memuat dokumen PDF...
      </Text>
    </Center>
  );

  // Early return jika tidak ada fileUrl
  const renderHeader = () => (
    <Card.Section withBorder inheritPadding py="xs">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Group gap="sm" align="center">
          <Avatar color="blue" size="sm" radius="xl">
            <FileTextOutlined />
          </Avatar>
          <Text fw={600} size="lg">
            {title}
          </Text>
          {numPages && (
            <Text size="sm" c="dimmed">
              {pageNumber} dari {numPages} halaman
            </Text>
          )}
        </Group>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {headerActions}
          {enableSignaturePlacement && canEdit && (
            <Tooltip
              title={
                isPageReady ? "Tambah Tanda Tangan" : "Tunggu halaman dimuat..."
              }
              placement="bottom"
            >
              <span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    console.log('[PdfViewer] Tambah TTE clicked:', {
                      isPageReady,
                      pageSize,
                      signerName,
                      signerId,
                    });
                    handleAddSignature();
                  }}
                  size="small"
                  disabled={!isPageReady}
                  style={!isPageReady ? { pointerEvents: "none" } : {}}
                >
                  Tambah TTE {!isPageReady && '(loading...)'}
                </Button>
              </span>
            </Tooltip>
          )}
          <Tooltip label="Refresh Dokumen">
            <ActionIcon
              variant="light"
              size="lg"
              onClick={handleRefresh}
              color="green"
            >
              <ReloadOutlined style={{ fontSize: 18 }} />
            </ActionIcon>
          </Tooltip>
          {documentId && (
            <Tooltip label="Unduh Dokumen">
              <ActionIcon
                variant="light"
                size="lg"
                onClick={handleDownload}
                color="blue"
                loading={isDownloading}
                disabled={isDownloading}
              >
                <CloudDownloadOutlined style={{ fontSize: 18 }} />
              </ActionIcon>
            </Tooltip>
          )}
        </div>
      </div>
    </Card.Section>
  );

  if (!pdfBase64) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        {renderHeader()}
        <Card.Section>
          <Center py="xl">
            <Stack align="center" gap="md">
              <FileTextOutlined style={{ fontSize: 64, color: "#d1d5db" }} />
              <Text size="lg" c="dimmed">
                Tidak ada dokumen untuk ditampilkan
              </Text>
              <Text size="sm" c="dimmed">
                Data PDF tidak tersedia
              </Text>
            </Stack>
          </Center>
        </Card.Section>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="md" radius="md" withBorder>
        {/* Header */}
        {renderHeader()}

      {/* Controls */}
      {!loading && !error && pdfWorkerReady && pdfData && (
        <Card.Section withBorder inheritPadding py="sm">
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Group gap="xs">
                <Button
                  icon={<LeftOutlined />}
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  size="small"
                />
                <NumberInput
                  value={pageNumber}
                  onChange={goToPage}
                  min={1}
                  max={numPages}
                  size="xs"
                  w={60}
                  styles={{
                    input: { textAlign: "center", fontSize: "12px" },
                  }}
                />
                <Button
                  icon={<RightOutlined />}
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  size="small"
                />
              </Group>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Group gap="xs" justify={isMobile ? "flex-start" : "center"}>
                <ActionIcon
                  variant="light"
                  onClick={zoomOut}
                  disabled={scale <= 0.5}
                  size="sm"
                >
                  <ZoomOutOutlined />
                </ActionIcon>
                <Text
                  size="xs"
                  c="dimmed"
                  style={{ minWidth: "50px", textAlign: "center" }}
                >
                  {Math.round(scale * 100)}%
                </Text>
                <ActionIcon
                  variant="light"
                  onClick={zoomIn}
                  disabled={scale >= 3.0}
                  size="sm"
                >
                  <ZoomInOutlined />
                </ActionIcon>
                <ActionIcon variant="light" onClick={resetZoom} size="sm">
                  <FullscreenOutlined />
                </ActionIcon>
              </Group>
            </Col>

            <Col xs={24} md={8}>
              <Group gap="xs" justify={isMobile ? "flex-start" : "flex-end"}>
                <Text size="xs" c="dimmed">
                  Zoom: {Math.round(scale * 100)}%
                </Text>
              </Group>
            </Col>

            {/* DEBUG INFO - Remove later */}
            <Col span={24}>
              <Text size="xs" c="dimmed">
                Debug: Total Signatures: {signatures.length} | Current Page
                Signatures: {currentPageSignatures.length} | Page Ready:{" "}
                {isPageReady ? "✅" : "❌"}
              </Text>
            </Col>
          </Row>
        </Card.Section>
      )}

      {/* PDF Content */}
      <Card.Section>
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "16px",
            minHeight: loading || error ? "300px" : "auto",
          }}
        >
          {error ? (
            renderError()
          ) : pdfWorkerReady && pdfData ? (
            <div
              ref={pageContainerRef}
              style={{
                display: "flex",
                justifyContent: "center",
                position: "relative",
              }}
            >
              {(loading || pageLoading) && renderInlineLoading()}
              <div style={{
                position: "relative"
              }}>
                <Document
                  file={pdfData}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadProgress={onDocumentLoadProgress}
                  onLoadError={onDocumentLoadError}
                  loading={renderLoading()}
                  error={renderError()}
                  options={pdfOptions}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={renderLoading()}
                    onRenderSuccess={onPageRenderSuccess}
                    onRenderError={onPageRenderError}
                    width={
                      isMobile && typeof window !== "undefined"
                        ? Math.min(window.innerWidth - 80, 600)
                        : undefined
                    }
                    error={renderError()}
                  />
                </Document>

                {/* Signature Overlay - Use SCALED page size (no transform) */}
                {enableSignaturePlacement &&
                  currentPageSignatures.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `${pageSize.width * scale}px`,
                        height: `${pageSize.height * scale}px`,
                        pointerEvents: "none",
                        overflow: "hidden",
                      }}
                    >
                      {currentPageSignatures.map((signature) => (
                        <div
                          key={signature.id}
                          style={{
                            pointerEvents: "auto",
                          }}
                        >
                          <DraggableSignature
                            id={signature.id}
                            page={signature.page}
                            positionRatio={signature.positionRatio}
                            sizeRatio={signature.sizeRatio}
                            signerName={signature.signerName}
                            signerAvatar={signature.signerAvatar}
                            containerBounds={{
                              width: pageSize.width * scale,
                              height: pageSize.height * scale,
                            }}
                            rawPageSize={pageSize}
                            onPositionChange={handleSignaturePositionChange}
                            onSizeChange={handleSignatureSizeChange}
                            onRemove={canEdit ? removeSignature : null}
                            disabled={!canEdit}
                          />
                        </div>
                      ))}
                    </div>
                  )}

                {/* Debug: Show if no signatures */}
                {enableSignaturePlacement &&
                  currentPageSignatures.length === 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        background: "rgba(255,0,0,0.1)",
                        padding: "5px 10px",
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      No signatures on this page
                    </div>
                  )}
              </div>
            </div>
          ) : (
            renderLoading()
          )}
        </div>
      </Card.Section>

      {/* Footer Navigation */}
      {!loading && !error && pdfWorkerReady && pdfData && numPages > 1 && (
        <Card.Section withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Button
              leftSection={<LeftOutlined />}
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              variant="light"
              size="sm"
            >
              Sebelumnya
            </Button>
            <Text size="sm" c="dimmed">
              Halaman {pageNumber} dari {numPages}
            </Text>
            <Button
              rightSection={<RightOutlined />}
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              variant="light"
              size="sm"
            >
              Selanjutnya
            </Button>
          </Group>
        </Card.Section>
      )}
    </Card>
  );
});

export default PdfViewer;
