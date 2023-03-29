import { listNotifications } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Avatar, Card, List, Tag } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";
import { formatDate } from "../../utils";

function ListNotifications() {
  const { data: userData, status } = useSession();

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

  const handleRouting = (item, role) => {
    const { ticket_id } = item;

    if (item?.ticket === null) {
      return;
    } else if (item?.ticket?.is_published) {
      router.push(`/customers-tickets/${ticket_id}`);
    } else {
      if (role === "admin") {
        router.push(`/admin/tickets-managements/${ticket_id}/detail`);
      } else if (role === "user") {
        router.push(`/tickets/${ticket_id}/detail`);
      } else if (role === "agent") {
        router.push(`/agent/tickets/${ticket_id}/detail`);
      }
    }

    // const routing = notificationText(item);
    // router.push(routing);
  };

  return (
    <Card>
      <List
        pagination={{
          showSizeChanger: false,
          size: "small",
          position: "both",
          onChange: (page) => setQuery({ ...query, page }),
          current: query.page,
          pageSize: query.limit,
          total: data?.total,
        }}
        loading={loading || status === "loading"}
      >
        {data?.results?.map((item) => (
          <List.Item
            key={item.id}
            actions={[
              <a
                key="lihat"
                onClick={() =>
                  handleRouting(item, userData?.user?.current_role)
                }
              >
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
