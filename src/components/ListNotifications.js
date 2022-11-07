import { Card, Col, List, Row, Space, Tag } from "antd";
import { useRouter } from "next/router";
import React from "react";
import { notificationText } from "../../utils";

const Title = ({ title, read_at }) => {
  return (
    <Space>
      {title}
      {read_at === null && <Tag color="red">Baru</Tag>}
    </Space>
  );
};

function ListNotifications({ data, loading }) {
  const router = useRouter();
  const handleRouting = (item) => {
    const routing = notificationText(item);
    router.push(routing);
  };

  return (
    <Card>
      <List loading={loading}>
        {data?.map((item) => (
          <List.Item
            key={item.id}
            actions={[
              <a key="lihat" onClick={() => handleRouting(item)}>
                Lihat
              </a>,
            ]}
          >
            <List.Item.Meta
              title={<Title read_at={item?.read_at} title={item?.title} />}
              description={`${item?.from_user?.username} ${item?.content}`}
            />
          </List.Item>
        ))}
      </List>
    </Card>
  );
}

export default ListNotifications;
