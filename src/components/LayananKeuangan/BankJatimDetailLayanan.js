import React from "react";
import { Card, Button, Typography, Space, Divider, Tag, List } from "antd";
import {
  PlayCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
  StarOutlined,
  FileProtectOutlined,
  ToolOutlined,
  PhoneOutlined,
  BankOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

/**
 * BankJatimDetailLayanan - Komponen detail layanan Bank Jatim
 *
 * @example
 * // Contoh penggunaan dengan persyaratan nested:
 * const persyaratanExample = [
 *   "Warga Negara Indonesia",
 *   {
 *     title: "Usia calon/debitur",
 *     items: [
 *       "Minimal 21 tahun atau telah menikah",
 *       "Maksimal 65 tahun pada saat akhir jangka waktu kredit"
 *     ]
 *   },
 *   "Calon/ debitur yang sudah pernah menerima fasilitas kredit maupun yang belum pernah menerima fasilitas kredit",
 *   "Tidak memiliki tunggakan kredit dan tidak terdaftar dalam daftar hitam nasional",
 *   {
 *     title: "Persyaratan Wiraswasta",
 *     items: [
 *       "Usaha telah berjalan minimal 3(tiga) tahun, dibuktikan dengan SPT Tahunan",
 *       "Memiliki tempat usaha sendiri"
 *     ]
 *   },
 *   {
 *     title: "Persyaratan Tenaga Alih Daya Bank, P3K dan Tenaga Kontrak",
 *     items: [
 *       "Berpenghasilan tetap dan payroll gaji melalui Bank Jatim",
 *       "Lama bekerja di perusahaan sama minimal 2 tahun"
 *     ]
 *   }
 * ];
 *
 * <BankJatimDetailLayanan
 *   title="Kredit Multiguna"
 *   persyaratan={persyaratanExample}
 *   keuntungan={["Bunga kompetitif", "Proses cepat"]}
 *   fitur={["Tanpa agunan", "Fleksibel"]}
 * />
 */
function BankJatimDetailLayanan({
  title = "Layanan Bank Jatim",
  subtitle = "",
  description = "Deskripsi layanan akan ditampilkan di sini. Silakan gunakan props untuk mengisi konten yang sesuai.",
  features = [],
  keuntungan = [],
  persyaratan = [],
  fitur = [],
  category = "",
  onSimulasi,
  onPengajuan,
  onCekStatus,
  imageUrl,
  customActions = [],
  className = "",
  style = {},
}) {
  const defaultActions = [
    {
      key: "simulasi",
      label: "Simulasi",
      icon: <PlayCircleOutlined />,
      type: "default",
      onClick: onSimulasi,
      description: "Coba simulasi perhitungan",
    },
    {
      key: "pengajuan",
      label: "Pengajuan",
      icon: <FileTextOutlined />,
      type: "primary",
      onClick: onPengajuan,
      description: "Ajukan permohonan baru",
    },
    {
      key: "cek-status",
      label: "Cek Status",
      icon: <CheckCircleOutlined />,
      type: "default",
      onClick: onCekStatus,
      description: "Lihat status pengajuan",
    },
  ];

  const actions = customActions.length > 0 ? customActions : defaultActions;

  // Function to render persyaratan with nested structure
  const renderPersyaratan = (items) => {
    return items.map((item, index) => {
      if (typeof item === "string") {
        return (
          <li key={index} style={{ marginBottom: 8 }}>
            {item}
          </li>
        );
      } else if (item.title && item.items) {
        return (
          <li key={index} style={{ marginBottom: 12 }}>
            <strong>{item.title}</strong>
            <ul style={{ marginTop: 8, marginLeft: 20 }}>
              {renderPersyaratan(item.items)}
            </ul>
          </li>
        );
      }
      return null;
    });
  };

  return (
    <div className={`detail-layanan-container ${className}`} style={style}>
      <style jsx>{`
        .detail-layanan-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 24px;
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 20px;
          overflow: hidden;
          margin-bottom: 32px;
          position: relative;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.3);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          padding: 48px 32px;
          color: white;
        }

        .content-card {
          border-radius: 16px;
          border: none;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
          margin-bottom: 24px;
          overflow: hidden;
        }

        .action-card {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          height: 100%;
        }

        .action-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
          border-color: #dc2626;
        }

        .action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
          margin-bottom: 16px;
        }

        .feature-tag {
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .category-badge {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 20px;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .section-icon {
          color: #dc2626;
          font-size: 20px;
          margin-right: 8px;
        }

        .persyaratan-list ul {
          list-style-type: disc;
          margin-left: 20px;
          color: #4b5563;
        }

        .persyaratan-list li {
          line-height: 1.6;
          margin-bottom: 8px;
        }

        .keuntungan-item {
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 8px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .keuntungan-icon {
          color: #22c55e;
          font-size: 16px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .fitur-item {
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 8px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .fitur-icon {
          color: #3b82f6;
          font-size: 16px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .contact-info {
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          border-radius: 12px;
          padding: 20px;
          color: white;
          margin-top: 24px;
        }

        .contact-info .ant-typography {
          color: white !important;
        }

        .contact-highlight {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
          font-weight: 600;
        }
      `}</style>

      {/* Hero Section */}
      <div className="hero-section">
        {imageUrl && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundImage: `url(${imageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="hero-overlay" />
        <div className="hero-content">
          <Space direction="vertical" size="small" style={{ width: "100%" }}>
            {category && (
              <div>
                <span className="category-badge">{category}</span>
              </div>
            )}
            <Title
              level={1}
              style={{
                color: "white",
                margin: 0,
                fontSize: 36,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {title}
            </Title>
            {subtitle && (
              <Title
                level={4}
                style={{
                  color: "rgba(255, 255, 255, 0.9)",
                  margin: 0,
                  fontWeight: 400,
                  fontSize: 18,
                }}
              >
                {subtitle}
              </Title>
            )}
          </Space>
        </div>
      </div>

      {/* Description Card */}
      <Card className="content-card" bodyStyle={{ padding: 32 }}>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Space style={{ marginBottom: 16 }}>
              <InfoCircleOutlined className="section-icon" />
              <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                Tentang Layanan
              </Title>
            </Space>
            <Paragraph
              style={{
                fontSize: 16,
                lineHeight: 1.7,
                color: "#4b5563",
                textAlign: "justify",
              }}
            >
              {description}
            </Paragraph>
          </div>

          {/* Keuntungan Section */}
          {keuntungan.length > 0 && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <StarOutlined className="section-icon" />
                  <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                    Keuntungan
                  </Title>
                </Space>
                <div>
                  {keuntungan.map((item, index) => (
                    <div key={index} className="keuntungan-item">
                      <CheckCircleOutlined className="keuntungan-icon" />
                      <span
                        style={{
                          color: "#374151",
                          fontSize: 14,
                          lineHeight: 1.6,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Persyaratan Section */}
          {persyaratan.length > 0 && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <FileProtectOutlined className="section-icon" />
                  <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                    Persyaratan
                  </Title>
                </Space>
                <div className="persyaratan-list">
                  <ul
                    style={{
                      paddingLeft: 20,
                      color: "#4b5563",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {renderPersyaratan(persyaratan)}
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Fitur Section */}
          {fitur.length > 0 && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <ToolOutlined className="section-icon" />
                  <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
                    Fitur
                  </Title>
                </Space>
                <div>
                  {fitur.map((item, index) => (
                    <div key={index} className="fitur-item">
                      <ToolOutlined className="fitur-icon" />
                      <span
                        style={{
                          color: "#374151",
                          fontSize: 14,
                          lineHeight: 1.6,
                        }}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Legacy Features (keeping for backward compatibility) */}
          {features.length > 0 && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <div>
                <Title level={5} style={{ marginBottom: 16, color: "#1f2937" }}>
                  Fitur & Keunggulan
                </Title>
                <Space wrap>
                  {features.map((feature, index) => (
                    <span key={index} className="feature-tag">
                      {feature}
                    </span>
                  ))}
                </Space>
              </div>
            </>
          )}

          {/* Contact Information */}
          <div className="contact-info">
            <Space align="start" style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <PhoneOutlined style={{ fontSize: 18, color: "white" }} />
                <BankOutlined style={{ fontSize: 18, color: "white" }} />
              </div>
              <div style={{ flex: 1 }}>
                <Paragraph style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
                  Untuk persyaratan, ketentuan/keterangan lebih lanjut mengenai
                  produk-produk kami, mohon menghubungi{" "}
                  <span className="contact-highlight">
                    Info Bank Jatim 14044
                  </span>{" "}
                  atau datang langsung ke{" "}
                  <span className="contact-highlight">
                    Kantor Cabang Bank Jatim
                  </span>
                </Paragraph>
              </div>
            </Space>
          </div>
        </Space>
      </Card>
    </div>
  );
}

export default BankJatimDetailLayanan;
