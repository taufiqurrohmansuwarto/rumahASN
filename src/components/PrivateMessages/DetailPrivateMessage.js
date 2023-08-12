import { Stack } from "@mantine/core";
import { Card, Space, Typography } from "antd";

function DetailPrivateMessage({ data }) {
  return (
    <Card>
      <Stack>
        <Space>
          <Typography.Text>Pengirim</Typography.Text>
          {":"}
          <Typography.Text>{data?.sender?.username}</Typography.Text>
        </Space>
        <Space>
          <Typography.Text>Kepada</Typography.Text>
          {":"}
          <Typography.Text>{data?.receiver?.username}</Typography.Text>
        </Space>
        <Space>
          <Typography.Text>Judul</Typography.Text>
          {":"}
          <Typography.Text>{data?.title}</Typography.Text>
        </Space>
        <Space>
          <div
            dangerouslySetInnerHTML={{
              __html: data?.message,
            }}
          />
        </Space>
      </Stack>
    </Card>
  );
}

export default DetailPrivateMessage;
