import React, { memo, useMemo } from "react";
import { Button } from "antd";
import { Text as MantineText } from "@mantine/core";
import { PdfViewer } from "@/components/EsignBKD";

function PdfPreview({
  pdfBase64,
  pdfLoading,
  pdfError,
  document,
  onRetry,
  documentId,
}) {
  // Memoize the title to prevent unnecessary rerenders
  const documentTitle = useMemo(() => document?.title || "Dokumen", [document?.title]);
  return (
    <div style={{ marginBottom: 16 }}>
      <MantineText style={{ fontSize: 14, fontWeight: 600, color: "#6b7280", marginBottom: 6, display: "block" }}>
        Preview Dokumen
      </MantineText>

      {pdfLoading ? (
        <div style={{
          height: "500px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          borderRadius: "8px",
          border: "1px solid #e8e8e8"
        }}>
          <MantineText c="dimmed">Memuat preview dokumen...</MantineText>
        </div>
      ) : pdfError ? (
        <div style={{
          height: "300px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          borderRadius: "8px",
          border: "1px solid #e8e8e8"
        }}>
          <MantineText c="red" fw={500}>{pdfError}</MantineText>
          <Button
            type="link"
            onClick={onRetry}
            style={{ color: "#FF4500", fontWeight: 500 }}
          >
            Coba Lagi
          </Button>
        </div>
      ) : pdfBase64 ? (
        <div style={{ minHeight: "500px", maxHeight: "600px", overflow: "auto", border: "1px solid #e8e8e8", borderRadius: "8px" }}>
          <PdfViewer
            pdfBase64={pdfBase64}
            title={documentTitle}
            documentId={documentId}
          />
        </div>
      ) : (
        <div style={{
          height: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fafafa",
          borderRadius: "8px",
          border: "1px solid #e8e8e8"
        }}>
          <MantineText c="dimmed">Tidak ada dokumen untuk ditampilkan</MantineText>
        </div>
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary rerenders
export default memo(PdfPreview);