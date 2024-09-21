import React from "react";
import { Card, Typography, Space } from "antd";
import { HeartFilled, MessageFilled } from "@ant-design/icons";

import ReactMarkdownCustom from "./MarkdownEditor/ReactMarkdownCustom";
const { Title, Paragraph } = Typography;

const AnnouncementCard = ({ title, description, image }) => {
  return (
    <Card
      style={{
        width: 500,
        background: "#1e1e1e",
        border: "none",
        borderRadius: 8,
        overflow: "hidden",
      }}
      bodyStyle={{ padding: 0 }}
    >
      <div style={{ display: "flex" }}>
        <div style={{ position: "relative", width: "50%" }}>
          <img
            alt={title}
            src={image}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "8px 0 0 8px",
            }}
          />
          <Space
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
            }}
          >
            <Space
              align="center"
              style={{
                background: "#ff4d4f",
                padding: "2px 8px",
                borderRadius: 16,
              }}
            >
              <HeartFilled style={{ color: "white" }} />
            </Space>
            <Space
              align="center"
              style={{
                background: "#1e1e1e",
                padding: "2px 8px",
                borderRadius: 16,
              }}
            >
              <MessageFilled style={{ color: "white" }} />
              <span style={{ color: "white" }}>54</span>
            </Space>
          </Space>
        </div>
        <div style={{ width: "100%", padding: 16 }}>
          <Title level={4} style={{ color: "white", marginBottom: 8 }}>
            {title}
          </Title>

          <ReactMarkdownCustom>{description}</ReactMarkdownCustom>
        </div>
      </div>
    </Card>
  );
};

export default AnnouncementCard;
