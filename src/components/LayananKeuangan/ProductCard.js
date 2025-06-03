import React from "react";
import { Card, Button, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";

const { Title, Paragraph } = Typography;

function ProductCard({ title, image, description, onDetail }) {
  return (
    <Card
      hoverable
      style={{
        height: "100%",
        width: "100%",
        borderRadius: 20,
        border: "none",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        background: "#ffffff",
      }}
      bodyStyle={{ padding: 0 }}
      className="modern-product-card"
    >
      <style jsx>{`
        .modern-product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }
        .modern-product-card .ant-card-body {
          padding: 0 !important;
        }
      `}</style>

      {/* Image Container */}
      <div
        style={{
          height: 200,
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          background: !image
            ? "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)"
            : "transparent",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ) : (
          <div
            style={{
              color: "#ffffff",
              fontSize: 48,
              opacity: 0.8,
            }}
          >
            {/* Default icon jika tidak ada gambar */}
            📋
          </div>
        )}

        {/* Overlay gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)",
          }}
        />
      </div>

      {/* Content Container */}
      <div style={{ padding: 24 }}>
        {/* Title */}
        <Title
          level={4}
          style={{
            margin: "0 0 12px 0",
            fontSize: 20,
            fontWeight: 700,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Title>

        {/* Description */}
        <Paragraph
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            margin: "0 0 24px 0",
            height: 48, // Fixed height untuk konsistensi
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {description}
        </Paragraph>

        {/* Detail Button */}
        <Button
          type="primary"
          onClick={onDetail}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          Lihat Detail
          <ArrowRightOutlined style={{ fontSize: 14 }} />
        </Button>
      </div>
    </Card>
  );
}

export default ProductCard;
