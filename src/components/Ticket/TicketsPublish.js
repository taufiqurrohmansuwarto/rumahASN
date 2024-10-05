import { publishTickets, refAgents } from "@/services/index";
import {
  cleanQuery,
  formatDateLL,
  setColorStatus,
  setColorStatusTooltip,
  setStatusIcon,
} from "@/utils/client-utils";
import {
  CalendarOutlined,
  MessageOutlined,
  SyncOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Grid } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Grid as AntdGrid,
  Avatar,
  Checkbox,
  Input,
  List,
  Popover,
  Select,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import RestrictedContent from "../RestrictedContent";
import { IconClock, IconFileUpload, IconShieldCheck } from "@tabler/icons";

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

const SetItem = ({ item }) => {
  const diajukan = item?.status_code === "DIAJUKAN";
  const dikerjakan = item?.status_code === "DIKERJAKAN";
  const selesai = item?.status_code === "SELESAI";
  const size = 20;

  if (diajukan) {
    return <IconFileUpload color="#ffa500" size={size} />;
  } else if (dikerjakan) {
    return <IconClock color="#3498db" size={size} />;
  } else if (selesai) {
    return <IconShieldCheck color="#28a745" size={size} />;
  } else {
    return null;
  }
};

const Status = ({ item }) => {
  return (
    <Tooltip
      color={setColorStatusTooltip(item?.status_code)}
      title={item?.status_code}
    >
      <SetItem item={item} />
    </Tooltip>
  );
};

const Published = ({ item }) => {
  if (item?.is_published) {
    return <Tag color="yellow">PUBLIKASI</Tag>;
  } else {
    return null;
  }
};

const FilterUser = ({ handleChange, value }) => {
  const { data, isLoading } = useQuery(["agents"], () => refAgents(), {
    refetchOnWindowFocus: false,
  });

  return (
    <Skeleton loading={isLoading}>
      <Select
        value={value}
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

const SubCategory = ({ item }) => {
  return (
    <>
      {item?.sub_category && (
        <Badge color="orange">{item?.sub_category?.name}</Badge>
      )}
    </>
  );
};

// create item like github issue with primer UI
const TitleLink = ({ item }) => {
  const screens = useBreakpoint();
  const router = useRouter();
  const handleClick = () => {
    router.push(`/customers-tickets/${item?.id}`);
  };

  return (
    <Space wrap>
      <Status item={item} key="status" />
      <Typography.Text
        onClick={handleClick}
        style={{ marginRight: 8, cursor: "pointer" }}
      >
        {item?.title}
      </Typography.Text>
      {screens?.xs && <br />}
      <Published item={item} />
      <SubCategory item={item} key="sub_category" />
    </Space>
  );
};

// this is the main component
const TicketsPublish = () => {
  const router = useRouter();

  const { data, isLoading, isFetching } = useQuery(
    ["publish-tickets-customers", router?.query],
    () => publishTickets(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
    }
  );

  const handleSearch = (e) => {
    // debounce e.target.value

    const query = cleanQuery({
      ...router.query,
      search: e,
      page: 1,
    });

    router.push({
      pathname: router.pathname,
      query,
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
      const query = cleanQuery({
        ...router.query,
        status_code,
        page: 1,
      });

      router.push({
        pathname: router.pathname,
        query,
      });
    } else {
      const query = cleanQuery({
        ...router.query,
        status_code: "",
        page: 1,
      });

      router.push({
        pathname: router.pathname,
        query,
      });
    }
  };

  const handleChangePublikasi = (value) => {
    const checked = value.target.checked;
    let query;

    if (checked) {
      query = cleanQuery({
        ...router.query,
        page: 1,
        is_published: checked,
      });
    } else {
      query = cleanQuery({
        ...router.query,
        page: 1,
        is_published: "",
      });
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const handleChangePage = (page) => {
    const query = cleanQuery({
      ...router.query,
      page,
    });

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  const handleSelectedUser = (user) => {
    let query;
    if (user.length > 0) {
      query = cleanQuery({
        ...router.query,
        page: 1,
        assignees: user.join(","),
      });
    } else {
      query = cleanQuery({
        ...router.query,
        page: 1,
        assignees: "",
      });
    }

    router.push({
      pathname: router.pathname,
      query,
    });
  };

  return (
    <div>
      <Grid>
        <Grid.Col md={12} xs={12}>
          <Input.Search
            defaultValue={router?.query?.search}
            onSearch={handleSearch}
            style={{ width: "100%" }}
          />
        </Grid.Col>
        <RestrictedContent name="advanced-filter">
          <Grid.Col md={12} xs={12}>
            <Checkbox.Group
              value={router?.query?.status_code?.split(",") || []}
              onChange={handleChangeStatus}
              options={status}
            />
          </Grid.Col>
          <Grid.Col md={12} xs={12}>
            <Checkbox
              value={!!router?.query?.is_published}
              checked={!!router?.query?.is_published}
              onChange={handleChangePublikasi}
            >
              Publikasi
            </Checkbox>
          </Grid.Col>
          <Grid.Col>
            <FilterUser
              value={router?.query?.assignees?.split(",") || []}
              handleChange={handleSelectedUser}
            />
          </Grid.Col>
        </RestrictedContent>
      </Grid>
      <List
        dataSource={data?.results}
        rowKey={(row) => row?.id}
        loading={isFetching || isLoading}
        size="large"
        pagination={{
          showSizeChanger: false,
          position: "both",
          current: parseInt(router?.query?.page) || 1,
          pageSize: 10,
          onChange: handleChangePage,
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} data`,
          size: "small",
        }}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Space size="small" key="total_comments">
                <MessageOutlined style={{ fontSize: 16, color: "#1890ff" }} />
                <Typography.Text type="secondary">
                  {parseInt(item?.comments_count)}
                </Typography.Text>
              </Space>,
            ]}
          >
            <List.Item.Meta
              title={<TitleLink item={item} />}
              description={
                <Typography.Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                  }}
                >
                  <Space wrap>
                    <CalendarOutlined />
                    Ditanyakan tanggal {formatDateLL(item?.created_at)}
                    <Link href={`/users/${item?.customer?.custom_id}`}>
                      <Typography.Link>
                        {item?.customer?.username}
                      </Typography.Link>
                    </Link>
                    <UserOutlined />
                  </Space>
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
};

export default TicketsPublish;
