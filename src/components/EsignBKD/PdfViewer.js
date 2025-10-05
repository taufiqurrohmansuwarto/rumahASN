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
import useSignatureStore from "@/store/useSignatureStore";
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
  },
  ref
) {
  const screens = useBreakpoint();
  const isMobile = !screens?.md;

  const { mutate: downloadDoc, isLoading: isDownloading } =
    useDownloadDocument();

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfWorkerReady, setPdfWorkerReady] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfjsVersion, setPdfjsVersion] = useState("3.11.174");
  const [pageLoading, setPageLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(true);

  // Signature placement state - INTERNAL/UNCONTROLLED
  const [signatures, setSignatures] = useState(initialSignatures);
  const pageContainerRef = useRef(null);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [isPageReady, setIsPageReady] = useState(false);

  // Get Zustand setter
  const setSignCoordinates = useSignatureStore(
    (state) => state.setSignCoordinates
  );

  // Memoize PDF.js options to prevent unnecessary reloads
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/standard_fonts/`,
    }),
    [pdfjsVersion]
  );

  // Initialize signatures from prop only once
  useEffect(() => {
    if (initialSignatures && initialSignatures.length > 0) {
      setSignatures(initialSignatures);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - only on mount (intentional)

  // Update Zustand whenever signatures change
  useEffect(() => {
    const coordinates = signaturesToCoordinates(signatures);
    setSignCoordinates(coordinates);
  }, [signatures, setSignCoordinates]);

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

  // Signature placement functions
  const addSignature = useCallback(() => {
    if (!isPageReady || !pageSize.width || pageSize.width === 0) {
      return;
    }

    const pdfWidth = pageSize.width;
    const pdfHeight = pageSize.height;

    const initialX = Math.max(20, pdfWidth / 2 - SIGNATURE_WIDTH / 2);
    const initialY = 50;

    const boundedX = Math.max(
      20,
      Math.min(initialX, pdfWidth - SIGNATURE_WIDTH - 20)
    );
    const boundedY = Math.max(
      20,
      Math.min(initialY, pdfHeight - SIGNATURE_HEIGHT - 20)
    );

    const newSignature = {
      id: `sig_${Date.now()}`,
      page: pageNumber,
      position: { x: boundedX, y: boundedY },
      size: { width: SIGNATURE_WIDTH, height: SIGNATURE_HEIGHT },
      signerName: signerName,
      signerAvatar: signerAvatar, // Add this
      signerId: signerId, // Add this
    };

    setSignatures((prev) => [...prev, newSignature]);
  }, [pageNumber, signerName, signerAvatar, signerId, pageSize, isPageReady]); // Add signerAvatar to deps

  const removeSignature = useCallback((signatureId) => {
    setSignatures((prev) => prev.filter((sig) => sig.id !== signatureId));
  }, []);

  // Add new methods for removing signatures by page and clearing all
  const removeSignaturesByPage = useCallback((page) => {
    setSignatures((prev) => prev.filter((sig) => sig.page !== page));
  }, []);

  const clearAllSignatures = useCallback(() => {
    setSignatures([]);
  }, []);

  const handleSignaturePositionChange = useCallback(
    (signatureId, page, position) => {
      setSignatures((prev) =>
        prev.map((sig) =>
          sig.id === signatureId ? { ...sig, page, position } : sig
        )
      );
    },
    []
  );

  const handleSignatureSizeChange = useCallback((signatureId, size) => {
    setSignatures((prev) =>
      prev.map((sig) => (sig.id === signatureId ? { ...sig, size } : sig))
    );
  }, []);

  // Add method to remove signatures by signerId
  const removeSignaturesBySignerId = useCallback((signerId) => {
    setSignatures((prev) => prev.filter((sig) => sig.signerId !== signerId));
  }, []);

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

  const onDocumentLoadProgress = useCallback(({ loaded, total }) => {
    // Silent progress tracking
  }, []);

  // FIXED: onPageRenderSuccess
  const onPageRenderSuccess = useCallback(
    (page) => {
      if (!isMounted) return;
      setPageLoading(false);

      // Capture page size for signature placement
      if (page) {
        const newPageSize = {
          width: page.width,
          height: page.height,
        };
        setPageSize(newPageSize);
        setIsPageReady(true);
      }
    },
    [isMounted]
  );

  // Reset page ready state when page changes
  useEffect(() => {
    setIsPageReady(false);
  }, [pageNumber]);

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
    setScale(1.0);
  }, []);

  const handleRefresh = useCallback(() => {
    setError(null);
    setPageLoading(true);
    setLoading(true);
    setPageNumber(1);
    setScale(1.0);
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
      changePage: (page) => {
        changePage(page);
      },
      getCurrentPage: () => pageNumber,
      getTotalPages: () => numPages,
      getScale: () => scale,
      clearAllSignatures: () => {
        clearAllSignatures();
      },
      removeSignaturesByPage: (page) => {
        removeSignaturesByPage(page);
      },
      removeSignaturesBySignerId: (signerId) => {
        removeSignaturesBySignerId(signerId);
      },
    }),
    [
      changePage,
      pageNumber,
      numPages,
      scale,
      clearAllSignatures,
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
                  onClick={addSignature}
                  size="small"
                  disabled={!isPageReady}
                  style={!isPageReady ? { pointerEvents: "none" } : {}}
                >
                  Tambah TTE
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
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px",
            backgroundColor: "#f8f9fa",
            padding: "16px",
          }}
        >
          {error ? (
            renderError()
          ) : pdfWorkerReady && pdfData ? (
            <div
              ref={pageContainerRef}
              style={{
                maxWidth: "100%",
                overflow: "auto",
                display: "flex",
                justifyContent: "center",
                position: "relative",
                width: "100%",
              }}
            >
              {(loading || pageLoading) && renderInlineLoading()}
              <div style={{ position: "relative" }}>
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

                {/* Signature Overlay - SCALED WITH PDF */}
                {enableSignaturePlacement &&
                  currentPageSignatures.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: "none",
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                      }}
                    >
                      {currentPageSignatures.map((signature) => (
                        <div
                          key={signature.id}
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,
                            width: `${pageSize.width}px`,
                            height: `${pageSize.height}px`,
                            pointerEvents: "auto",
                          }}
                        >
                          <DraggableSignature
                            id={signature.id}
                            page={signature.page}
                            initialPosition={signature.position}
                            initialSize={
                              signature.size || {
                                width: SIGNATURE_WIDTH,
                                height: SIGNATURE_HEIGHT,
                              }
                            }
                            signerName={signature.signerName}
                            signerAvatar={signature.signerAvatar} // Add this prop
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
