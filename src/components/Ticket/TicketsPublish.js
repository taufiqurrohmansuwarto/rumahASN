import { publishTickets } from "@/services/index";
import { formatDateFromNow, formatDateLL } from "@/utils/client-utils";
import { MessageOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Avatar, List, Space, Typography } from "antd";
import Link from "next/link";

// create item like github issue with primer UI
const TitleLink = ({ item }) => {
  return (
    <Typography.Text strong>
      <Link href={`/customers-tickets/${item?.id}`}>{item.title}</Link>
    </Typography.Text>
  );
};

function TicketsPublish() {
  const { data, isLoading } = useQuery(
    ["publish-tickets-customers"],
    () => publishTickets(),
    {
      keepPreviousData: true,
    }
  );

  return (
    <div>
      <List
        dataSource={data?.results}
        loading={isLoading}
        pagination={{
          position: "bottom",
          size: "small",
        }}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<TitleLink item={item} />}
              description={
                <div>
                  Ditanyakan tanggal {formatDateLL(item?.created_at)} oleh{" "}
                  {item?.customer?.username}
                </div>
              }
            />
            <Space size="small">
              <MessageOutlined
                style={{
                  color: "#1890ff",
                }}
                size={10}
              />
              <Typography.Text type="secondary">
                {parseInt(item?.comments_count)}
              </Typography.Text>
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
}

export default TicketsPublish;
