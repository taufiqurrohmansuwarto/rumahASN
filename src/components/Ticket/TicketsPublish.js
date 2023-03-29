import { publishTickets } from "@/services/index";
import { formatDateLL, setColorStatus } from "@/utils/client-utils";
import { MessageOutlined } from "@ant-design/icons";
import { Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Input,
  List,
  Popover,
  Space,
  Tag,
  Typography,
  Grid as AntdGrid,
} from "antd";
import Link from "next/link";
import { useState } from "react";

const { useBreakpoint } = AntdGrid;

const Assignee = ({ item }) => {
  if (item?.assignee) {
    return (
      <Popover title="Penerima Tugas" content={`${item?.agent?.username}`}>
        <Avatar
          size="small"
          src={item?.agent?.image}
          alt={item?.agent?.username}
        />
      </Popover>
    );
  } else {
    return null;
  }
};

const Status = ({ item }) => {
  return (
    <Tag color={setColorStatus(item?.status_code)}>{item?.status_code}</Tag>
  );
};

const Published = ({ item }) => {
  if (item?.is_published) {
    return <Tag color="yellow">PUBLIKASI</Tag>;
  } else {
    return null;
  }
};

// create item like github issue with primer UI
const TitleLink = ({ item }) => {
  const screens = useBreakpoint();

  return (
    <div>
      <Typography.Text strong style={{ marginRight: 8 }}>
        <Link href={`/customers-tickets/${item?.id}`}>{item.title}</Link>
      </Typography.Text>
      {screens?.xs && <br />}
      <Published item={item} />
      <Status item={item} key="status" />
    </div>
  );
};

function TicketsPublish() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data, isLoading } = useQuery(
    ["publish-tickets-customers", query],
    () => publishTickets(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const handleSearch = (e) => {
    setQuery({
      ...query,
      search: e,
      page: 1,
    });
  };

  return (
    <div>
      <Grid>
        <Grid.Col md={6} sm={12}>
          <Input.Search
            placeholder="Cari berdasarkan judul"
            onSearch={handleSearch}
            style={{ width: "100%" }}
          />
        </Grid.Col>
      </Grid>
      <List
        dataSource={data?.results}
        loading={isLoading}
        pagination={{
          showSizeChanger: false,
          position: "both",
          current: query?.page,
          pageSize: query?.limit,
          onChange: (page) => setQuery({ ...query, page: page }),
          total: data?.total,
          size: "small",
        }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Space size="small" key="total_comments">
                <MessageOutlined
                  style={{
                    color: "#1890ff",
                  }}
                  size={10}
                />
                <Typography.Text type="secondary">
                  {parseInt(item?.comments_count)}
                </Typography.Text>
              </Space>,
            ]}
          >
            <List.Item.Meta
              title={<TitleLink item={item} />}
              description={
                <Typography.Text type="secondary">
                  Ditanyakan tanggal {formatDateLL(item?.created_at)} oleh{" "}
                  {item?.customer?.username}
                </Typography.Text>
              }
            />
            <Space>
              <Assignee key="penerima_tugas" item={item} />
            </Space>
          </List.Item>
        )}
      />
    </div>
  );
}

export default TicketsPublish;
