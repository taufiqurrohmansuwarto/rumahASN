import { listNotifications } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card, List, Avatar, Space, Tag } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";
import { formatDate, notificationText } from "../../utils";

const Title = ({ title, read_at }) => {
  return (
    <Space>
      {title}
      {read_at === null && <Tag color="red">Baru</Tag>}
    </Space>
  );
};

function ListNotifications() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    symbol: "no",
  });

  const { data, isLoading: loading } = useQuery(
    ["notifications", query],
    () => listNotifications(query),
    { keepPreviousData: true, enabled: !!query }
  );

  const router = useRouter();
  const handleRouting = (item) => {
    const routing = notificationText(item);
    router.push(routing);
  };

  return (
    <Card>
      <List
        pagination={{
          size: "small",
          position: "both",
          onChange: (page) => setQuery({ ...query, page }),
          current: query.page,
          pageSize: query.limit,
          total: data?.total,
        }}
        loading={loading}
      >
        {data?.results?.map((item) => (
          <List.Item
            key={item.id}
            actions={[
              <a key="lihat" onClick={() => handleRouting(item)}>
                Lihat
              </a>,
              <div key="check-read">
                {item?.read_at === null && <Tag color="red">Baru</Tag>}
              </div>,
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar src={item?.from_user?.image} />}
              // title={<Title read_at={item?.read_at} title={item?.title} />}
              description={formatDate(item?.created_at)}
              title={`${item?.from_user?.username} ${item?.content}`}
            />
          </List.Item>
        ))}
      </List>
    </Card>
  );
}

export default ListNotifications;
