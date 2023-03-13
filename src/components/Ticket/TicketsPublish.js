import { publishTickets } from "@/services/index";
import { formatDateFromNow } from "@/utils/client-utils";
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
        renderItem={(item, index) => (
          <List.Item>
            <List.Item.Meta
              title={<TitleLink item={item} />}
              description={
                <div>
                  dibuat tanggal {formatDateFromNow(item?.customer?.created_at)}{" "}
                  oleh {item?.customer?.username}
                </div>
              }
              avatar={<Avatar src={item?.customer?.image} />}
            />
            {/* create comment icon with total */}
            <Space size="small">
              <MessageOutlined size={10} />
              <Typography.Text>
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
