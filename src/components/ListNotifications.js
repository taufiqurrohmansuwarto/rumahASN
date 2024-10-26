import { listNotifications, removeNotification } from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Avatar, Card, FloatButton, List, Tag, Tooltip } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { formatDate } from "../../utils";
import { SearchOutlined } from "@ant-design/icons";

function ListNotifications() {
  const queryClient = useQueryClient();
  const { data: userData, status } = useSession();
  const router = useRouter();
  const query = router?.query;

  const {
    data,
    isLoading: loading,
    isFetching,
  } = useQuery(
    ["notifications", query],
    () =>
      listNotifications({
        ...query,
        symbol: "no",
      }),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const handleChange = (page) => {
    router.push({
      pathname: router.pathname,
      query: {
        ...router.query,
        page,
      },
    });
  };

  // remove notification
  const { mutateAsync: remove, isLoading } = useMutation(
    (data) => removeNotification(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("notifications");
      },
    }
  );

  const handleRouting = async (item, role) => {
    const { ticket_id } = item;

    if (item?.read_at === null) {
      await remove(item?.id);
    }

    if (item?.ticket === null) {
      return;
    } else if (item?.ticket?.is_published) {
      router.push(`/customers-tickets/${ticket_id}`);
    } else {
      if (role === "admin") {
        router.push(`/customers-tickets/${ticket_id}`);
      } else if (role === "user") {
        router.push(`/tickets/${ticket_id}/detail`);
      } else if (role === "agent") {
        router.push(`/agent/tickets/${ticket_id}/detail`);
      }
    }
  };

  return (
    <Card>
      <FloatButton.BackTop visibilityHeight={100} />
      <List
        pagination={{
          showSizeChanger: false,
          size: "small",
          position: "both",
          onChange: handleChange,
          current: parseInt(query.page) || 1,
          pageSize: parseInt(query.limit) || 50,
          total: data?.total,
        }}
        loading={loading || status === "loading" || isFetching}
      >
        {data?.results?.map((item) => (
          <List.Item
            key={item.id}
            actions={[
              <a
                key="lihat"
                onClick={async () =>
                  await handleRouting(item, userData?.user?.current_role)
                }
              >
                <Tooltip title="Lihat">
                  <SearchOutlined />
                </Tooltip>
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
