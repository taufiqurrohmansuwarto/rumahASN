import { Card, Skeleton, Space } from "antd";

export const LoadingCard = ({ title, rows = 3, avatar = false }) => (
  <Card title={title}>
    <Skeleton
      loading={true}
      avatar={avatar}
      paragraph={{ rows }}
      active
    />
  </Card>
);

export const LoadingList = ({ count = 5 }) => (
  <Space direction="vertical" style={{ width: "100%" }}>
    {Array.from({ length: count }).map((_, index) => (
      <Card key={index} size="small">
        <Skeleton
          loading={true}
          avatar
          paragraph={{ rows: 2 }}
          active
        />
      </Card>
    ))}
  </Space>
);