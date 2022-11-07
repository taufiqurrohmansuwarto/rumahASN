import { List, Tag } from "antd";
import { useRouter } from "next/router";
import React from "react";

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

  return (
    <List loading={loading}>
      {data?.map((item) => (
        <List.Item
          key={item.id}
          actions={[<a key="list-loadmore-edit">Lihat</a>]}
        >
          <List.Item.Meta
            title={<Title is_read={item?.read_at} title={item?.title} />}
            description={`${item?.from_user?.username} ${item?.content}`}
          />
        </List.Item>
      ))}
    </List>
  );
}

export default ListNotifications;
