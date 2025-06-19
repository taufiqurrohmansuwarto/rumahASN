import {
  Flex,
  Grid,
  Tabs,
  Typography,
  Button,
  Space,
  Card,
  Row,
  Col,
} from "antd";
import { useRouter } from "next/router";
import {
  IconCar,
  IconHome,
  IconCreditCard,
  IconCalculator,
  IconFileText,
  IconClipboardCheck,
  IconQuestionMark,
  IconHistory,
  IconPercentage,
  IconCalendar,
  IconCurrencyDollar,
  IconBolt,
  IconShield,
  IconArrowsExchange,
  IconArrowRight,
  IconPlayerPlay,
} from "@tabler/icons-react";

const { useBreakpoint } = Grid;

function BankJatimLayout({ children, active = "kkb" }) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  // Responsive variables
  const iconSectionWidth = isMobile ? "0px" : "40px";

  const tabItems = [
    {
      key: "kkb",
      label: (
        <Typography.Text>
          <IconCar size={16} style={{ marginRight: 8, color: "#dc2626" }} />
          KKB (Kredit Kendaraan Bermotor)
        </Typography.Text>
      ),
      children: children,
    },
    {
      key: "kpr",
      label: (
        <Typography.Text>
          <IconHome size={16} style={{ marginRight: 8, color: "#dc2626" }} />
          KPR (Kredit Pemilikan Rumah)
        </Typography.Text>
      ),
      children: children,
    },
    {
      key: "multiguna",
      label: (
        <Typography.Text>
          <IconCreditCard
            size={16}
            style={{ marginRight: 8, color: "#dc2626" }}
          />
          KMB (Kredit Multiguna)
        </Typography.Text>
      ),
      children: children,
    },
  ];

  const handleTabChange = (activeKey) => {
    router.push(`/layanan-keuangan/bank-jatim/produk/${activeKey}`);
  };

  // Fitur & Keunggulan data
  const features = [
    {
      icon: <IconPercentage size={20} />,
      title: "Suku Bunga Kompetitif",
      description: "Bunga rendah dan bersaing",
    },
    {
      icon: <IconCalendar size={20} />,
      title: "Tenor Hingga 25 Tahun",
      description: "Cicilan lebih ringan",
    },
    {
      icon: <IconCurrencyDollar size={20} />,
      title: "DP Mulai 10%",
      description: "Down payment terjangkau",
    },
    {
      icon: <IconBolt size={20} />,
      title: "Proses Cepat",
      description: "Approval dalam hitungan hari",
    },
    {
      icon: <IconShield size={20} />,
      title: "Asuransi Jiwa & Kebakaran",
      description: "Perlindungan menyeluruh",
    },
    {
      icon: <IconArrowsExchange size={20} />,
      title: "Take Over dari Bank Lain",
      description: "Mudah beralih ke Bank Jatim",
    },
  ];

  return (
    <div style={{ width: "100%" }}>
      {/* Enhanced Header Section with Gradient Background */}
      <div
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          padding: isMobile ? "32px 16px" : "48px 24px",
          borderRadius: "12px 12px 0 0",
          marginBottom: "0",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Improved overlay for better readability */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(135deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.15) 100%)",
            zIndex: 1,
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "16px",
              flexDirection: isMobile ? "column" : "row",
              marginBottom: "8px",
            }}
          >
            <img
              src="https://siasn.bkd.jatimprov.go.id:9000/public/logo-bank-jatim.png"
              alt="Bank Jatim Logo"
              style={{
                height: isMobile ? "40px" : "48px",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
              }}
            />
            <Typography.Title
              level={1}
              style={{
                color: "white",
                margin: 0,
                fontSize: isMobile ? "28px" : "36px",
                fontWeight: 700,
                textAlign: "center",
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}
            >
              Layanan Bank Jatim
            </Typography.Title>
          </div>
          <Typography.Text
            style={{
              color: "rgba(255,255,255,0.95)",
              display: "block",
              textAlign: "center",
              fontSize: isMobile ? "16px" : "18px",
              fontWeight: 400,
              textShadow: "0 1px 4px rgba(0,0,0,0.2)",
              marginBottom: "24px",
            }}
          >
            Solusi Keuangan Terpercaya untuk ASN
          </Typography.Text>

          {/* CTA Buttons */}
          <div style={{ textAlign: "center", marginTop: "24px" }}>
            <Space size="middle" wrap>
              <Button
                type="primary"
                size="large"
                icon={<IconArrowRight size={16} />}
                style={{
                  background:
                    "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0 24px",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
                }}
                onClick={() =>
                  router.push(
                    "/layanan-keuangan/bank-jatim/features/apply-pengajuan"
                  )
                }
              >
                Ajukan Sekarang
              </Button>
              <Button
                size="large"
                icon={<IconPlayerPlay size={16} />}
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  borderRadius: "8px",
                  padding: "0 24px",
                  height: "48px",
                  fontSize: "16px",
                  fontWeight: 500,
                  backdropFilter: "blur(10px)",
                }}
                onClick={() =>
                  router.push("/layanan-keuangan/bank-jatim/features/simulasi")
                }
              >
                Simulasi Kredit
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Action Menu Section */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          padding: isMobile ? "12px 16px" : "16px 24px",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
            gap: isMobile ? "6px" : "12px",
            maxWidth: isMobile ? "380px" : "400px",
            margin: "0 auto",
          }}
        >
          {/* Cek Pengajuan */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Cek Status Pengajuan - Pantau status pengajuan kredit Anda"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px 6px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() =>
              router.push("/layanan-keuangan/bank-jatim/features/cek-pengajuan")
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                console.log("Cek Pengajuan");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#dc2626";
              e.currentTarget.style.backgroundColor = "#fef2f2";
              e.currentTarget.style.transform = "translateY(-1px)";
              const iconDiv = e.currentTarget.querySelector(".icon-container");
              if (iconDiv) {
                iconDiv.style.backgroundColor = "#dc2626";
                iconDiv.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(0)";
              const iconDiv = e.currentTarget.querySelector(".icon-container");
              if (iconDiv) {
                iconDiv.style.backgroundColor = "#dc2626";
                iconDiv.style.transform = "scale(1)";
              }
            }}
          >
            <div
              className="icon-container"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#dc2626", // Bank Jatim primary red
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 6px",
                transition: "all 0.2s ease",
              }}
            >
              <IconClipboardCheck size={16} color="white" aria-hidden="true" />
            </div>
            <Typography.Text
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "2px",
              }}
            >
              Cek Status
            </Typography.Text>
            <Typography.Text
              style={{
                display: "block",
                fontSize: "9px",
                fontWeight: 400,
                color: "#6b7280",
                lineHeight: "1.2",
              }}
            >
              Pantau progres
            </Typography.Text>
          </div>

          {/* FAQ */}
          <div
            role="button"
            tabIndex={0}
            aria-label="FAQ - Frequently Asked Questions tentang layanan kredit"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px 6px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() =>
              router.push("/layanan-keuangan/bank-jatim/features/faq")
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                console.log("FAQ");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#dc2626";
              e.currentTarget.style.backgroundColor = "#fef2f2";
              e.currentTarget.style.transform = "translateY(-1px)";
              const iconDiv = e.currentTarget.querySelector(".icon-container");
              if (iconDiv) {
                iconDiv.style.backgroundColor = "#dc2626";
                iconDiv.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(0)";
              const iconDiv = e.currentTarget.querySelector(".icon-container");
              if (iconDiv) {
                iconDiv.style.backgroundColor = "#dc2626";
                iconDiv.style.transform = "scale(1)";
              }
            }}
          >
            <div
              className="icon-container"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#dc2626", // Bank Jatim primary red
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 6px",
                transition: "all 0.2s ease",
              }}
            >
              <IconQuestionMark size={16} color="white" aria-hidden="true" />
            </div>
            <Typography.Text
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "2px",
              }}
            >
              FAQ
            </Typography.Text>
            <Typography.Text
              style={{
                display: "block",
                fontSize: "9px",
                fontWeight: 400,
                color: "#6b7280",
                lineHeight: "1.2",
              }}
            >
              Tanya jawab
            </Typography.Text>
          </div>

          {/* Riwayat Pengajuan */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Riwayat Pengajuan - Lihat semua riwayat pengajuan kredit Anda"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              padding: "10px 6px",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onClick={() =>
              router.push(
                "/layanan-keuangan/bank-jatim/features/riwayat-pengajuan"
              )
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                console.log("Riwayat Pengajuan");
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#dc2626";
              e.currentTarget.style.backgroundColor = "#fef2f2";
              e.currentTarget.style.transform = "translateY(-1px)";
              const iconDiv = e.currentTarget.querySelector(".icon-container");
              if (iconDiv) {
                iconDiv.style.backgroundColor = "#dc2626";
                iconDiv.style.transform = "scale(1.05)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#E5E7EB";
              e.currentTarget.style.backgroundColor = "#FFFFFF";
              e.currentTarget.style.transform = "translateY(0)";
              const iconDiv = e.currentTarget.querySelector(".icon-container");
              if (iconDiv) {
                iconDiv.style.backgroundColor = "#dc2626";
                iconDiv.style.transform = "scale(1)";
              }
            }}
          >
            <div
              className="icon-container"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "6px",
                backgroundColor: "#dc2626", // Bank Jatim primary red
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 6px",
                transition: "all 0.2s ease",
              }}
            >
              <IconHistory size={16} color="white" aria-hidden="true" />
            </div>
            <Typography.Text
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 500,
                color: "#374151",
                marginBottom: "2px",
              }}
            >
              Riwayat
            </Typography.Text>
            <Typography.Text
              style={{
                display: "block",
                fontSize: "9px",
                fontWeight: 400,
                color: "#6b7280",
                lineHeight: "1.2",
              }}
            >
              Lihat histori
            </Typography.Text>
          </div>
        </div>
      </div>

      {/* Tabs Section with Custom Styling */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "0 0 12px 12px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        <Tabs
          activeKey={active}
          onChange={handleTabChange}
          items={tabItems}
          size={isMobile ? "small" : "default"}
          centered={!isMobile}
          tabBarStyle={{
            margin: 0,
            paddingLeft: isMobile ? "16px" : "24px",
            paddingRight: isMobile ? "16px" : "24px",
            paddingTop: "16px",
            backgroundColor: "#FAFBFC",
            borderRadius: "0 0 12px 12px",
            overflowX: isMobile ? "auto" : "visible",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        />
      </div>

      <style jsx global>{`
        .ant-tabs-tab {
          color: #4b5563 !important;
          font-weight: 500 !important;
          font-size: 14px !important;
          padding: 12px 16px !important;
          border-radius: 4px 4px 0 0 !important;
          transition: all 0.2s ease !important;
          position: relative !important;
        }

        .ant-tabs-tab:hover {
          color: #dc2626 !important;
          background-color: #fef2f2 !important;
          transform: translateY(-1px) !important;
        }

        .ant-tabs-tab:hover .ant-tabs-tab-btn {
          color: #dc2626 !important;
        }

        .ant-tabs-tab-active {
          color: #dc2626 !important;
          font-weight: 600 !important;
          background-color: #fff5f5 !important;
        }

        .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #dc2626 !important;
        }

        .ant-tabs-ink-bar {
          background: #dc2626 !important;
          height: 3px !important;
          border-radius: 2px !important;
        }

        .ant-tabs-nav::before {
          border-bottom: 1px solid #edeff1 !important;
        }

        .ant-tabs-content-holder {
          background-color: transparent !important;
        }

        .ant-tabs-content {
          background-color: transparent !important;
        }

        /* Responsive styles for children container */
        @media (max-width: 1200px) {
          .bank-jatim-children-container {
            padding: 16px !important;
          }
        }

        /* Tablet responsive */
        @media (max-width: 1024px) {
          .ant-tabs-tab {
            font-size: 13px !important;
            padding: 10px 12px !important;
          }
          .bank-jatim-children-container {
            padding: 14px !important;
          }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .ant-tabs-tab {
            font-size: 12px !important;
            padding: 8px 8px !important;
          }
          .bank-jatim-children-container {
            padding: 12px !important;
          }
        }

        /* Small mobile responsive */
        @media (max-width: 480px) {
          .ant-tabs-tab {
            font-size: 11px !important;
            padding: 6px 6px !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
          .bank-jatim-children-container {
            padding: 8px !important;
          }

          .ant-tabs-nav-wrap {
            overflow-x: auto !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
          }

          .ant-tabs-nav-wrap::-webkit-scrollbar {
            display: none !important;
          }

          .ant-tabs-nav-list {
            display: flex !important;
            white-space: nowrap !important;
          }
        }

        /* Quick action buttons enhancement */
        .quick-action-primary {
          box-shadow: 0 2px 4px rgba(220, 38, 38, 0.1) !important;
        }

        .quick-action-primary:hover {
          box-shadow: 0 4px 8px rgba(220, 38, 38, 0.2) !important;
        }
      `}</style>
    </div>
  );
}

export default BankJatimLayout;
