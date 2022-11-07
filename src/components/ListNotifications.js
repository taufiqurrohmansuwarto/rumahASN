import { Card, Col, List, Row, Tag } from "antd";
import { useRouter } from "next/router";
import React from "react";
import { notificationText } from "../../utils";

const Title = ({ title, read_at }) => {
  return (
    <>
      {title}
      {read_at && <Tag>Baru</Tag>}
    </>
  );
};

function ListNotifications({ data, loading }) {
  const router = useRouter();
  const handleRouting = (item) => {
    const routing = notificationText(item);
    router.push(routing);
  };

  return (
    <Row>
      <Col xs={{ span: 24 }} md={{ span: 16 }}>
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
                  title={<Title is_read={item?.read_at} title={item?.title} />}
                  description={`${item?.from_user?.username} ${item?.content} ${item?.role}`}
                />
              </List.Item>
            ))}
          </List>
        </Card>
      </Col>
    </Row>
  );
}

export default ListNotifications;
