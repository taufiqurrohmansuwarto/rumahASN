import { publishTickets, refAgents } from "@/services/index";
import { formatDateLL, setColorStatus } from "@/utils/client-utils";
import { MessageOutlined } from "@ant-design/icons";
import { Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Checkbox,
  Grid as AntdGrid,
  Input,
  List,
  Popover,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import Link from "next/link";
import { useState } from "react";
import RestrictedContent from "../RestrictedContent";
import { useRouter } from "next/router";

const { useBreakpoint } = AntdGrid;

const Assignee = ({ item }) => {
  const router = useRouter();

  const gotoDetailUser = () => router.push(`/users/${item?.agent?.custom_id}`);

  if (item?.assignee) {
    return (
      <Popover title="Penerima Tugas" content={`${item?.agent?.username}`}>
        <Avatar
          onClick={gotoDetailUser}
          style={{
            cursor: "pointer",
          }}
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

const FilterUser = ({ handleChange }) => {
  const { data, isLoading } = useQuery(["agents"], () => refAgents(), {
    refetchOnWindowFocus: false,
  });

  return (
    <Skeleton loading={isLoading}>
      <Select
        optionFilterProp="label"
        style={{ width: "100%" }}
        mode="multiple"
        onChange={handleChange}
        placeholder="Cari berdasarkan orang"
        options={data}
      />
    </Skeleton>
  );
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

  const status = [
    { label: "Diajukan", value: "DIAJUKAN" },
    { label: "Dikerjakan", value: "DIKERJAKAN" },
    { label: "Selesai", value: "SELESAI" },
  ];

  const handleChangeStatus = (value) => {
    if (value.length > 0) {
      const status_code = value.join(",");
      setQuery({
        ...query,
        status_code,
        page: 1,
      });
    } else {
      setQuery({
        ...query,
        status_code: "",
        page: 1,
      });
    }
  };

  const handleChangePublikasi = (value) => {
    const checked = value.target.checked;
    if (checked) {
      setQuery({
        ...query,
        is_published: checked,
      });
    } else {
      setQuery({
        ...query,
        is_published: "",
      });
    }
  };

  const handleSelectedUser = (user) => {
    if (user.length > 0) {
      const assignees = user.join(",");
      setQuery({
        ...query,
        assignees,
        page: 1,
      });
    } else {
      setQuery({
        ...query,
        assignees: "",
        page: 1,
      });
    }
  };

  return (
    <div>
      <Grid>
        <Grid.Col md={12} xs={12}>
          <Input.Search
            placeholder="Cari berdasarkan judul"
            onSearch={handleSearch}
            style={{ width: "100%" }}
          />
        </Grid.Col>
        <RestrictedContent name="advanced-filter">
          <Grid.Col md={12} xs={12}>
            <Checkbox.Group onChange={handleChangeStatus} options={status} />
          </Grid.Col>
          <Grid.Col md={12} xs={12}>
            <Checkbox onChange={handleChangePublikasi}>Publikasi</Checkbox>
          </Grid.Col>
          <Grid.Col>
            <FilterUser handleChange={handleSelectedUser} />
          </Grid.Col>
        </RestrictedContent>
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
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} data`,
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
                  <Link href={`/users/${item?.customer?.custom_id}`}>
                    <Typography.Link>
                      {item?.customer?.username}
                    </Typography.Link>
                  </Link>
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
