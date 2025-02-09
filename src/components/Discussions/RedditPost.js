import React from "react";
import { Card, Space, Button, Typography } from "antd";
import { MoreOutlined, ShareAltOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const RedditPost = () => {
  return (
    <Card
      style={{
        background: "#1a1a1b",
        border: "1px solid #343536",
        color: "#d7dadc",
        padding: "8px 0",
      }}
      bodyStyle={{
        padding: "0 16px",
      }}
    >
      {/* Header */}
      <Space align="center" style={{ marginBottom: 8 }}>
        <Text style={{ color: "#4f9eed" }}>r/Advice</Text>
        <Text style={{ color: "#818384" }}>• 1 day ago</Text>
        <Text style={{ color: "#818384" }}>• Popular on Reddit right now</Text>
        <Button
          type="primary"
          style={{
            marginLeft: "auto",
            marginRight: 8,
            background: "#0079D3",
          }}
        >
          Join
        </Button>
        <Button
          type="text"
          icon={<MoreOutlined />}
          style={{
            color: "#C4C9CC",
          }}
        />
      </Space>

      {/* Title */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: 500,
          color: "#D7DADC",
          display: "block",
          marginBottom: 12,
        }}
      >
        I dream about my wife's dead best friend every night and it is ruining
        my marriage.
      </Text>

      {/* Content */}
      <Paragraph
        style={{
          color: "#D7DADC",
          marginBottom: 12,
        }}
      >
        (Throwaway because this is a very personal issue.) I (27M) and my wife
        (28F) have been happily married for 3 years. We've never had any
        problems, and I feel our communication has always been healthy and
        abundant. About two months ago, my wife's best friend, who I'll be
        referring to as Sarah, had a sudden, unexpected seizure at work, and
        unfortunately passed away in the hospital that night. She had no history
        of seizures or other medical complications, so this came as a serious
        shock. Sarah and my wife have been best friends since middle school.
        They would see each other nearly every day, and they would tell each
        other everything. I was relatively close to...
      </Paragraph>

      {/* Actions */}
      <Space size="middle" style={{ marginBottom: 8 }}>
        <Space size="small">
          <Button
            type="text"
            style={{
              background: "transparent",
              border: "none",
              color: "#c4c9cc",
              padding: "0 4px",
              height: 24,
            }}
          >
            ▲
          </Button>
          <Text
            style={{
              color: "#D7DADC",
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            1.3k
          </Text>
          <Button
            type="text"
            style={{
              background: "transparent",
              border: "none",
              color: "#c4c9cc",
              padding: "0 4px",
              height: 24,
            }}
          >
            ▼
          </Button>
        </Space>

        <Button
          type="text"
          style={{
            background: "transparent",
            border: "none",
            color: "#c4c9cc",
            padding: "4px 8px",
            height: 32,
            borderRadius: 4,
          }}
        >
          <Space size="small">
            <span style={{ fontSize: 20 }}>💬</span>
            <span style={{ fontSize: 12, fontWeight: 500 }}>735</span>
          </Space>
        </Button>

        <Button
          type="text"
          style={{
            background: "transparent",
            border: "none",
            color: "#c4c9cc",
            padding: "4px 8px",
            height: 32,
            borderRadius: 4,
          }}
        >
          <Space size="small">
            <ShareAltOutlined />
            <span style={{ fontSize: 12, fontWeight: 500 }}>Share</span>
          </Space>
        </Button>
      </Space>
    </Card>
  );
};

export default RedditPost;
