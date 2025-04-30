import { Typography } from "antd";
import { OpenAIOutlined } from "@ant-design/icons";
import { Space } from "antd";
import { useSession } from "next-auth/react";
function AISummarize({ summarize }) {
  const { data } = useSession();
  if (!summarize) return null;

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <div
          style={{
            border: "1px solid #ffe58f",
            backgroundColor: "#fffbe6",
            padding: "8px",
            borderRadius: "4px",
          }}
        >
          <Space>
            <OpenAIOutlined style={{ color: "#10a37f" }} />
            <Typography.Text italic>{summarize}</Typography.Text>
          </Space>
        </div>
      )}
    </>
  );
}

export default AISummarize;
