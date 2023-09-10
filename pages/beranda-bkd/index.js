import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { pegawaiBkdTickets } from "@/services/bkd.services";
import { Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Breadcrumb,
  Avatar,
  Card,
  Col,
  Empty,
  Grid,
  List,
  Popover,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
} from "antd";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { Alert } from "@mantine/core";
import { MessageOutlined } from "@ant-design/icons";
import Link from "next/link";
import { formatDateLL, setColorStatus } from "@/utils/client-utils";

const { useBreakpoint } = Grid;

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
        {/* <Link href={`/customers-tickets/${item?.id}`}>{item.title}</Link> */}
        {item?.title}
      </Typography.Text>
      {screens?.xs && <br />}
      <Published item={item} />
      <Status item={item} key="status" />
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

const TicketsTable = ({ query }) => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
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
    <List
      rowKey={(row) => row?.id}
      dataSource={data?.data}
      loading={isLoading}
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
                Ditanyakan tanggal {formatDateLL(item?.created_at)} oleh{" "}
                <Link href={`/users/${item?.customer?.custom_id}`}>
                  <Typography.Link>{item?.customer?.username}</Typography.Link>
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
  );
};

const BKDSpirit = () => {
  return (
    <Alert
      icon={<IconAlertCircle size="1rem" />}
      title="Perhatian!"
      color="green"
    >
      Apa kabar, Keluarga BKD! Di aplikasi Rumah ASN, setiap pertanyaan pengguna
      tuh kayak puzzle yang menantang. Yuk kita selesaikan satu per satu, show
      them what weve got. Semangat terus ya, guys!
    </Alert>
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
    {
      label: "Arsip",
      key: "archive-task",
      children: (
        <Empty>
          <Typography.Text type="secondary">
            Arsip pertanyaan yang sudah selesai dijawab.
          </Typography.Text>
        </Empty>
      ),
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

  return (
    <>
      <Head>
        <title>Rumah ASN - Tugas Saya</title>
      </Head>
      <PageContainer
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
        title="Beranda"
        subTitle="Tugas Saya"
      >
        <Row>
          <Col md={16}>
            <Card>
              <Stack>
                <TabsJobs />
              </Stack>
            </Card>
          </Col>
        </Row>
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
