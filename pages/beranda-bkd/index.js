import AllTaskFilter from "@/components/Filter/AllTaskFilter";
import UnAnswerFilter from "@/components/Filter/UnAnswerFilter";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import QueryFilter from "@/components/QueryFilter";
import { downloadTicketBKD, pegawaiBkdTickets } from "@/services/bkd.services";
import { refCategories } from "@/services/index";
import {
  formatDateFull,
  setColorStatus,
  setColorStatusTooltip,
  setStatusIcon,
} from "@/utils/client-utils";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CloudDownloadOutlined,
  MessageOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Grid as GridMantineCore, Stack } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Divider,
  FloatButton,
  Form,
  Grid,
  Input,
  List,
  Popover,
  Radio,
  Rate,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const { useBreakpoint } = Grid;

const DownloadData = () => {
  const router = useRouter();

  const { mutateAsync: download, isLoading } = useMutation((data) =>
    downloadTicketBKD(data)
  );

  const handleDownload = async () => {
    try {
      const data = await download(router?.query);

      const url = window.URL.createObjectURL(
        new Blob([data], { type: "application/vnd.ms-excel" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "report-bkd.xlsx");
      document.body.appendChild(link);
      link.click();

      message.success("Berhasil mengunduh data");
    } catch (error) {
      message.error("Gagal mengunduh data");
    }
  };

  return (
    <Button
      type="primary"
      onClick={handleDownload}
      loading={isLoading}
      disabled={isLoading}
      icon={<CloudDownloadOutlined />}
    >
      Unduh Data Filter
    </Button>
  );
};

const Status = ({ item }) => {
  return (
    <Tooltip
      title={item?.status_code}
      color={setColorStatusTooltip(item?.status_code)}
    >
      <Tag
        icon={setStatusIcon(item?.status_code)}
        color={setColorStatus(item?.status_code)}
      />
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

const SubCategory = ({ item }) => {
  return (
    <>
      {item?.sub_category && (
        <Tag color="orange">{item?.sub_category?.name}</Tag>
      )}
    </>
  );
};

const TitleLink = ({ item }) => {
  const screens = useBreakpoint();
  const router = useRouter();
  const handleClick = () => {
    router.push(`/customers-tickets/${item?.id}`);
  };

  return (
    <div>
      <Typography.Text
        onClick={handleClick}
        style={{ marginRight: 8, cursor: "pointer" }}
      >
        {item?.title}
      </Typography.Text>
      {screens?.xs && <br />}
      <Published item={item} />
      <Status item={item} key="status" />
      <SubCategory item={item} />
    </div>
  );
};

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

const FilterStatus = () => {
  const router = useRouter();
  const query = router?.query;

  const { data, isLoading } = useQuery(
    ["ref-sub-categories"],
    () => refCategories(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleReset = () => {
    router.push({
      pathname: "/beranda-bkd",
      query: { tab: "my-task" },
    });
  };

  const [form] = Form.useForm();

  const handleFinish = (values) => {
    // check every property of values if empty
    const emptyQuery = (obj) => {
      return Object.values(obj).every((x) => x === "");
    };

    if (emptyQuery(values)) {
      return;
    } else {
      // remove empty property
      Object.keys(values).forEach(
        (key) => values[key] === "" && delete values[key]
      );

      router.push({
        pathname: "/beranda-bkd",
        query: { ...router?.query, ...values },
      });
    }
  };

  useEffect(() => {
    form.setFieldsValue({
      search: query?.search || "",
      status: query?.status || "",
      star: query?.star || "",
      sub_category_id: query?.sub_category_id || "",
      group: query?.group || "",
    });
  }, [form, query]);

  return (
    <div>
      <QueryFilter
        loading={isLoading}
        span={{
          sm: 24,
          md: 24,
          xl: 24,
          lg: 24,
          xxl: 8,
          xs: 24,
        }}
        layout="vertical"
        form={form}
        collapseRender={(collapsed) =>
          collapsed ? (
            <Space>
              <span>More</span>
              <CaretDownOutlined />
            </Space>
          ) : (
            <Space>
              <span>Collapse</span>
              <CaretUpOutlined />
            </Space>
          )
        }
        onReset={handleReset}
        onFinish={handleFinish}
        submitter={{
          searchConfig: {
            resetText: "Reset",
            submitText: "Cari",
          },
        }}
      >
        <Form.Item name="search" label="Judul">
          <Input />
        </Form.Item>
        <Form.Item name="status" label="Status">
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="DIAJUKAN">Diajukan</Radio.Button>
            <Radio.Button value="DIKERJAKAN">Dikerjakan</Radio.Button>
            <Radio.Button value="SELESAI">Selesai</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="star" label="Bintang">
          <Rate />
        </Form.Item>
        <Form.Item name="sub_category_id" label="Kategori">
          <Select showSearch optionFilterProp="name">
            {data?.map((category) => {
              return (
                <Select.Option
                  key={category.id}
                  name={category?.name}
                  value={category.id}
                >
                  <span>{category?.name}</span>
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        <Form.Item name="group" label="Asal">
          <Radio.Group optionType="button" buttonStyle="solid">
            <Radio.Button value="MASTER">SIMASTER</Radio.Button>
            <Radio.Button value="GOOGLE">GOOGLE</Radio.Button>
            <Radio.Button value="PTTPK">PTTPK</Radio.Button>
          </Radio.Group>
        </Form.Item>
      </QueryFilter>
    </div>
  );
};

const TicketsTable = ({ query }) => {
  const router = useRouter();
  const { data, isLoading, isFetching } = useQuery(
    ["bkd-tickets", query],
    () => pegawaiBkdTickets(query),
    {
      keepPreviousData: true,
    }
  );

  const handleChangePage = (page, limit) => {
    router.push({
      pathname: "/beranda-bkd",
      query: { ...query, page, limit },
    });
  };

  return (
    <Stack mt={8}>
      <div
        style={{
          padding: 8,
          paddingTop: 16,
          paddingBottom: 16,
          border: "1px solid #e8e8e8",
        }}
      >
        {router?.query?.tab === "my-task" && <FilterStatus />}
        {router?.query?.tab === "unanswered-task" && <UnAnswerFilter />}
        {router?.query?.tab === "all-task" && <AllTaskFilter />}
        <Divider />
        <DownloadData />
      </div>
      <List
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        loading={isLoading || isFetching}
        pagination={{
          onChange: handleChangePage,
          showSizeChanger: false,
          position: "both",
          current: parseInt(query?.page) || 1,
          pageSize: parseInt(query?.limit) || 20,
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} pertanyaan`,
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
                <Typography.Text
                  type="secondary"
                  style={{
                    fontSize: 13,
                  }}
                >
                  {formatDateFull(item?.created_at)} oleh{" "}
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
    </Stack>
  );
};

const TabsJobs = () => {
  const router = useRouter();
  const currentRouter = router.query.tab;

  const handleChange = (key) => {
    router.push({
      pathname: "/beranda-bkd",
      query: { tab: key },
    });
  };

  const items = [
    {
      label: "Tugas Saya",
      key: "my-task",
      children: <TicketsTable query={router?.query} />,
    },
    {
      label: "Pertanyaan Belum Dijawab",
      key: "unanswered-task",
      children: <TicketsTable query={router?.query} />,
    },
    {
      label: "Semua Daftar Pertanyaan",
      key: "all-task",
      children: <TicketsTable query={router?.query} />,
    },
  ];

  return (
    <Tabs
      defaultActiveKey="my-task"
      activeKey={currentRouter ? currentRouter : "my-task"}
      onChange={handleChange}
      type="card"
      items={items}
    />
  );
};

const BerandaBKD = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  useEffect(() => {
    // On before route change save scroll position
    router.events.on("routeChangeStart", saveScrollPosition);
    // On route change restore scroll position
    router.events.on("routeChangeComplete", restoreScrollPosition);

    return () => {
      router.events.off("routeChangeStart", saveScrollPosition);
      router.events.off("routeChangeComplete", restoreScrollPosition);
    };
  }, [router]);

  function saveScrollPosition() {
    window.sessionStorage.setItem("scrollPosition", window.scrollY.toString());
  }

  function restoreScrollPosition() {
    const scrollY = window.sessionStorage.getItem("scrollPosition") ?? "0";
    window.scrollTo(0, parseInt(scrollY));
  }

  const handleCariPegawai = () =>
    router.push(`/apps-managements/integrasi/siasn`);

  return (
    <>
      <Head>
        <title>Rumah ASN - Tugas Saya</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Tugas Saya</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Beranda Staff BKD"
        content="Yuk Selesaikan Tugasmu"
      >
        <FloatButton.BackTop />
        <GridMantineCore justify="start">
          <GridMantineCore.Col md={8} xs={12}>
            <Card
              title="Daftar Pertanyaan"
              extra={
                <Button
                  onClick={handleCariPegawai}
                  icon={<SearchOutlined />}
                  type="link"
                >
                  Cari Pegawai
                </Button>
              }
            >
              <Stack>
                <TabsJobs />
              </Stack>
            </Card>
          </GridMantineCore.Col>
        </GridMantineCore>
      </PageContainer>
    </>
  );
};

BerandaBKD.Auth = {
  action: "manage",
  subject: "tickets",
};

BerandaBKD.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

export default BerandaBKD;
