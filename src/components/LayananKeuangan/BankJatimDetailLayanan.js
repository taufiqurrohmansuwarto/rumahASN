import React from "react";
import { Card, Button, Typography, Space, Divider, Tag } from "antd";
import {
  PlayCircleOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";

const { Title, Paragraph } = Typography;

function BankJatimDetailLayanan({
  title = "Layanan Bank Jatim",
  subtitle = "",
  description = "Deskripsi layanan akan ditampilkan di sini. Silakan gunakan props untuk mengisi konten yang sesuai.",
  features = [],
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
              <InfoCircleOutlined style={{ color: "#dc2626", fontSize: 20 }} />
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
        </Space>
      </Card>

      {/* Action Cards */}
      <Card
        className="content-card"
        title={
          <Title level={4} style={{ margin: 0, color: "#1f2937" }}>
            Pilihan Aksi
          </Title>
        }
        bodyStyle={{ padding: "24px 32px 32px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(auto-fit, minmax(280px, 1fr))`,
            gap: 24,
          }}
        >
          {actions.map((action) => (
            <div
              key={action.key}
              className="action-card"
              onClick={action.onClick}
            >
              <div className="action-icon">{action.icon}</div>
              <Space direction="vertical" size="small">
                <Title level={5} style={{ margin: 0, color: "#1f2937" }}>
                  {action.label}
                </Title>
                <Paragraph
                  style={{
                    margin: 0,
                    color: "#6b7280",
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {action.description}
                </Paragraph>
              </Space>
              <div style={{ marginTop: 16 }}>
                <ArrowRightOutlined
                  style={{
                    color: "#dc2626",
                    fontSize: 14,
                    transition: "transform 0.3s",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default BankJatimDetailLayanan;
