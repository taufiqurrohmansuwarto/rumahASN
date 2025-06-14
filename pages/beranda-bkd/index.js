import AntdCallToActionAI from "@/components/AI/ChatBot/AntdCallToActionAI";
import AllTaskFilter from "@/components/Filter/AllTaskFilter";
import UnAnswerFilter from "@/components/Filter/UnAnswerFilter";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import QueryFilter from "@/components/QueryFilter";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { downloadTicketBKD, pegawaiBkdTickets } from "@/services/bkd.services";
import { refCategories } from "@/services/index";
import {
  formatDateLLWithTime,
  setColorStatusTooltip,
} from "@/utils/client-utils";
import {
  CaretDownOutlined,
  CaretUpOutlined,
  CloudDownloadOutlined,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Badge, Grid as GridMantineCore, Stack } from "@mantine/core";
import {
  IconCircleCheck,
  IconClockHour4,
  IconSend,
  IconUser,
} from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Breadcrumb,
  Button,
  Card,
  Divider,
  Flex,
  FloatButton,
  Form,
  Grid,
  Input,
  List,
  Radio,
  Rate,
  Select,
  Space,
  Tabs,
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

const SetItem = ({ item }) => {
  const diajukan = item?.status_code === "DIAJUKAN";
  const dikerjakan = item?.status_code === "DIKERJAKAN";
  const selesai = item?.status_code === "SELESAI";
  const size = 14;

  if (diajukan) {
    return <IconSend color="#FF4500" size={size} stroke={2} />;
  } else if (dikerjakan) {
    return <IconClockHour4 color="#1890FF" size={size} stroke={2} />;
  } else if (selesai) {
    return <IconCircleCheck color="#52C41A" size={size} stroke={2} />;
  } else {
    return <IconUser color="#9CA3AF" size={size} stroke={2} />;
  }
};

const Status = ({ item }) => {
  return (
    <Tooltip
      title={item?.status_code}
      color={setColorStatusTooltip(item?.status_code)}
    >
      <SetItem item={item} />
    </Tooltip>
  );
};

const Published = ({ item }) => {
  if (item?.is_published) {
    return <Badge color="yellow">PUBLIKASI</Badge>;
  } else {
    return null;
  }
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
      <SubCategory item={item} />
    </Space>
  );
};

const Assignee = ({ item }) => {
  const router = useRouter();

  const gotoDetailUser = () => router.push(`/users/${item?.agent?.custom_id}`);

  if (item?.assignee) {
    return (
      <Tooltip title={`Ditugaskan ke: ${item?.agent?.username}`}>
        <div style={{ position: "relative", display: "inline-block" }}>
          <Avatar
            onClick={gotoDetailUser}
            style={{
              cursor: "pointer",
              border: "2px solid #FFFFFF",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "all 0.2s ease",
            }}
            size={32}
            src={item?.agent?.image}
            alt={item?.agent?.username}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.1)";
              e.currentTarget.style.boxShadow =
                "0 4px 8px rgba(255, 69, 0, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
            }}
          />
          {/* Online indicator */}
          <div
            style={{
              position: "absolute",
              bottom: "-2px",
              right: "-2px",
              width: "12px",
              height: "12px",
              backgroundColor: "#52C41A",
              border: "2px solid #FFFFFF",
              borderRadius: "50%",
              boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
            }}
          />
        </div>
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title="Belum ditugaskan">
        <Avatar
          size={32}
          style={{
            backgroundColor: "#F3F4F6",
            color: "#9CA3AF",
            border: "2px solid #E5E7EB",
          }}
          icon={<UserOutlined />}
        />
      </Tooltip>
    );
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
  const screens = useBreakpoint();
  const isMobile = !screens.md;

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

  const mainPadding = isMobile ? "12px" : "16px";
  const iconSectionWidth = isMobile ? "0px" : "40px";

  return (
    <Stack mt={8}>
      {/* Filter Card */}
      <Card
        style={{
          width: "100%",
          marginBottom: "16px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile */}
          {!isMobile && (
            <div
              style={{
                width: iconSectionWidth,
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
              }}
            >
              <SearchOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: mainPadding }}>
            <div style={{ marginBottom: "16px" }}>
              <Typography.Title
                level={5}
                style={{
                  margin: 0,
                  color: "#1C1C1C",
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                🔍 Filter & Pencarian
              </Typography.Title>
              <Typography.Text
                style={{
                  color: "#878A8C",
                  fontSize: isMobile ? "12px" : "14px",
                }}
              >
                Filter pertanyaan berdasarkan kriteria tertentu
              </Typography.Text>
            </div>

            <div>
              {router?.query?.tab === "my-task" && <FilterStatus />}
              {router?.query?.tab === "unanswered-task" && <UnAnswerFilter />}
              {router?.query?.tab === "all-task" && <AllTaskFilter />}

              <Divider style={{ margin: "16px 0" }} />
              <DownloadData />
            </div>
          </div>
        </Flex>
      </Card>

      {/* Tickets List Card */}
      <Card
        style={{
          width: "100%",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile */}
          {!isMobile && (
            <div
              style={{
                width: iconSectionWidth,
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #E5E7EB",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "400px",
              }}
            >
              <MessageOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <List
              rowKey={(row) => row?.id}
              dataSource={data?.data}
              loading={isLoading || isFetching}
              size="large"
              pagination={{
                onChange: handleChangePage,
                showSizeChanger: false,
                position: "bottom",
                current: parseInt(query?.page) || 1,
                pageSize: parseInt(query?.limit) || 20,
                total: data?.total,
                showTotal: (total, range) =>
                  isMobile
                    ? `${range[0]}-${range[1]} dari ${total}`
                    : `Menampilkan ${range[0]}-${range[1]} dari ${total} pertanyaan`,
                size: isMobile ? "small" : "default",
                simple: isMobile,
                showQuickJumper: !isMobile,
                responsive: true,
                style: {
                  padding: isMobile ? "12px 8px" : "16px",
                  borderTop: "1px solid #F3F4F6",
                  marginTop: "0",
                  textAlign: "center",
                  backgroundColor: "#FAFBFC",
                  fontSize: isMobile ? "12px" : "14px",
                },
              }}
              renderItem={(item, index) => {
                const handleClick = () => {
                  router.push(`/customers-tickets/${item?.id}`);
                };

                return (
                  <div
                    onClick={handleClick}
                    style={{
                      padding: isMobile ? "12px 16px" : "16px 20px",
                      borderBottom:
                        index < data?.data?.length - 1
                          ? "1px solid #F3F4F6"
                          : "none",
                      transition: "background-color 0.15s ease",
                      cursor: "pointer",
                      minHeight: isMobile ? "70px" : "80px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#F9FAFB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <Flex
                      justify="space-between"
                      align="flex-start"
                      gap={isMobile ? 8 : 12}
                      style={{
                        flexDirection: isMobile ? "column" : "row",
                      }}
                    >
                      {/* Main Content */}
                      <div style={{ flex: 1, minWidth: 0, width: "100%" }}>
                        {/* Title with Status Icon */}
                        <Flex
                          align="center"
                          gap={6}
                          style={{ marginBottom: isMobile ? "6px" : "8px" }}
                        >
                          <Tooltip
                            title={`Status: ${
                              item?.status_code === "DIAJUKAN"
                                ? "Diajukan"
                                : item?.status_code === "DIKERJAKAN"
                                ? "Dikerjakan"
                                : item?.status_code === "SELESAI"
                                ? "Selesai"
                                : "Unknown"
                            }`}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <SetItem item={item} />
                            </div>
                          </Tooltip>
                          <Typography.Text
                            style={{
                              fontSize: isMobile ? "14px" : "16px",
                              fontWeight: 500,
                              color: "#1C1C1C",
                              lineHeight: "1.5",
                              flex: 1,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: isMobile ? "200px" : "400px",
                            }}
                            title={item?.title}
                          >
                            {isMobile && item?.title?.length > 30
                              ? `${item?.title?.substring(0, 30)}...`
                              : item?.title?.length > 60
                              ? `${item?.title?.substring(0, 60)}...`
                              : item?.title}
                          </Typography.Text>
                          {item?.is_published && (
                            <Tooltip title="Tiket Terpublikasi">
                              <div
                                style={{
                                  backgroundColor: "#FF4500",
                                  color: "#FFFFFF",
                                  fontSize: isMobile ? "8px" : "9px",
                                  fontWeight: 600,
                                  borderRadius: "3px",
                                  padding: isMobile ? "1px 4px" : "2px 5px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.5px",
                                  flexShrink: 0,
                                }}
                              >
                                PUB
                              </div>
                            </Tooltip>
                          )}
                        </Flex>

                        {/* Meta Info */}
                        <Typography.Text
                          style={{
                            fontSize: isMobile ? "11px" : "13px",
                            color: "#9CA3AF",
                            display: "block",
                            lineHeight: "1.4",
                          }}
                        >
                          {formatDateLLWithTime(item?.created_at)} • oleh{" "}
                          <Link href={`/users/${item?.customer?.custom_id}`}>
                            <Typography.Text
                              style={{
                                color: "#0079D3",
                                fontWeight: 500,
                              }}
                            >
                              {item?.customer?.username}
                            </Typography.Text>
                          </Link>
                          {item?.sub_category && !isMobile && (
                            <>
                              {" • "}
                              <span
                                style={{
                                  color: "#6B7280",
                                  fontWeight: 500,
                                  backgroundColor: "#F8F9FA",
                                  border: "1px solid #E9ECEF",
                                  borderRadius: "3px",
                                  padding: "1px 4px",
                                  fontSize: "11px",
                                  marginLeft: "4px",
                                }}
                              >
                                {item?.sub_category?.name}
                              </span>
                            </>
                          )}
                        </Typography.Text>

                        {/* SubCategory on mobile - separate line */}
                        {item?.sub_category && isMobile && (
                          <div
                            style={{
                              display: "inline-block",
                              fontSize: "10px",
                              color: "#6B7280",
                              fontWeight: 500,
                              marginTop: "4px",
                              backgroundColor: "#F3F4F6",
                              border: "1px solid #E5E7EB",
                              borderRadius: "4px",
                              padding: "2px 6px",
                            }}
                          >
                            {item?.sub_category?.name}
                          </div>
                        )}
                      </div>

                      {/* Right Side Actions */}
                      <Flex
                        align="center"
                        gap={isMobile ? 8 : 12}
                        style={{
                          marginTop: isMobile ? "4px" : "0",
                          alignSelf: isMobile ? "flex-end" : "flex-start",
                        }}
                      >
                        {/* Comments Count */}
                        <Flex align="center" gap={3}>
                          <MessageOutlined
                            style={{
                              fontSize: isMobile ? 12 : 14,
                              color: "#9CA3AF",
                            }}
                          />
                          <Typography.Text
                            style={{
                              fontSize: isMobile ? "10px" : "12px",
                              color: "#9CA3AF",
                              fontWeight: 500,
                            }}
                          >
                            {parseInt(item?.comments_count)}
                          </Typography.Text>
                        </Flex>

                        {/* Assignee */}
                        <div
                          style={{
                            transform: isMobile ? "scale(0.9)" : "scale(1)",
                          }}
                        >
                          <Assignee item={item} />
                        </div>
                      </Flex>
                    </Flex>
                  </div>
                );
              }}
            />
          </div>
        </Flex>
      </Card>
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
      items={items}
    />
  );
};

const BerandaBKD = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  // Gunakan scroll restoration hook dengan storage key khusus untuk beranda BKD
  useScrollRestoration("berandaBKDScrollPosition");

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
                <Link href="/feeds">Beranda</Link>
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
          <GridMantineCore.Col md={10} xs={12}>
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
                <AntdCallToActionAI />
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
