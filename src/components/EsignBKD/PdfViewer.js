"use client";

import {
  ExclamationCircleOutlined,
  FileTextOutlined,
  FullscreenOutlined,
  LeftOutlined,
  RightOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
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
import { Button, Col, Grid, Row } from "antd";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

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

function PdfViewer({ pdfBase64, title = "Dokumen PDF" }) {
  const screens = useBreakpoint();
  const isMobile = !screens?.md;
  const isXs = !screens?.sm;

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfWorkerReady, setPdfWorkerReady] = useState(false);
  const [pdfData, setPdfData] = useState(null);
  const [pdfjsVersion, setPdfjsVersion] = useState("3.11.174");

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

        setPdfjsVersion(pdfjs.version);
        setPdfWorkerReady(true);
      } catch (error) {
        console.error("Failed to setup PDF worker:", error);
        setError("Gagal menginisialisasi PDF viewer");
        setLoading(false);
      }
    };

    setupWorker();
  }, []);

  // Process PDF base64 data
  useEffect(() => {
    const processPdfBase64 = () => {
      if (!pdfBase64 || !pdfWorkerReady) {
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Validate base64 data
        if (!pdfBase64 || typeof pdfBase64 !== "string") {
          throw new Error("Invalid base64 data");
        }

        // Normalisasi data base64 agar tidak double prefix
        const normalizedBase64 = pdfBase64.trim();
        const dataUri = normalizedBase64.startsWith("data:application/pdf")
          ? normalizedBase64
          : `data:application/pdf;base64,${normalizedBase64}`;

        setPdfData(dataUri);
      } catch (error) {
        console.error("Failed to process PDF base64:", error);
        setError(`Gagal memproses PDF: ${error.message}`);
        setLoading(false);
      }
    };

    processPdfBase64();
  }, [pdfBase64, pdfWorkerReady]);

  const onDocumentLoadSuccess = useCallback(({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback(
    (error) => {
      console.error("PDF Load Error:", error);
      console.error("PDF Load Error details:", {
        message: error.message,
        name: error.name,
        stack: error.stack,
        pdfDataLength: pdfData?.length || 0,
        pdfDataType: typeof pdfData,
      });
      setError(`Gagal memuat dokumen PDF: ${error.message || error}`);
      setLoading(false);
    },
    [pdfData]
  );

  const goToPrevPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1));
  }, [numPages]);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.2, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.2, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  const goToPage = useCallback(
    (page) => {
      if (page >= 1 && page <= numPages) {
        setPageNumber(page);
      }
    },
    [numPages]
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
  if (!pdfBase64) {
    return (
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Card.Section withBorder inheritPadding py="xs">
          <Group gap="sm">
            <Avatar color="blue" size="sm" radius="xl">
              <FileTextOutlined />
            </Avatar>
            <Text fw={600} size="lg">
              {title}
            </Text>
          </Group>
        </Card.Section>
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
      <Card.Section withBorder inheritPadding py="xs">
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar color="blue" size="sm" radius="xl">
              <FileTextOutlined />
            </Avatar>
            <Text fw={600} size="lg">
              {title}
            </Text>
          </Group>
          {numPages && (
            <Text size="sm" c="dimmed">
              {pageNumber} dari {numPages} halaman
            </Text>
          )}
        </Group>
      </Card.Section>

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
          {error
            ? renderError()
            : pdfWorkerReady && pdfData
            ? (
                <div
                  style={{
                    maxWidth: "100%",
                    overflow: "auto",
                    display: "flex",
                    justifyContent: "center",
                    position: "relative",
                    width: "100%",
                  }}
                >
                  {loading && renderInlineLoading()}
                  <Document
                    file={pdfData}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading={renderLoading()}
                    error={renderError()}
                    options={{
                      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/cmaps/`,
                      cMapPacked: true,
                      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/standard_fonts/`,
                    }}
                  >
                    <Page
                      pageNumber={pageNumber}
                      scale={scale}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={
                        isMobile && typeof window !== "undefined"
                          ? Math.min(window.innerWidth - 80, 600)
                          : undefined
                      }
                    />
                  </Document>
                </div>
              )
            : (
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
}

export default PdfViewer;
