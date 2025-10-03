import { CheckQRDocument } from "@/components/PublicCheckQR";
import Head from "next/head";
import { useRouter } from "next/router";
import { Grid } from "antd";

const { useBreakpoint } = Grid;

const PublicCheckQRPage = () => {
  const router = useRouter();
  const { id: documentCode } = router.query;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <>
      <Head>
        <title>Verifikasi Dokumen E-Sign BKD - {documentCode}</title>
        <meta name="description" content="Verifikasi keaslian dokumen E-Sign BKD" />
      </Head>

      <div
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          padding: isMobile ? "0" : "40px 20px",
        }}
      >
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Main Content */}
          <CheckQRDocument documentCode={documentCode} />

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: isMobile ? 16 : 32, padding: isMobile ? "0 12px" : 0, color: "#666" }}>
            <p style={{ fontSize: isMobile ? 12 : 14 }}>
              © 2025 E-Sign BKD Jawa Timur. Sistem Tanda Tangan Elektronik.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicCheckQRPage;
