import { publishTickets, refAgents } from "@/services/index";
import {
  cleanQuery,
  formatDateLL,
  formatDateLLWithTime,
} from "@/utils/client-utils";
import {
  DownOutlined,
  FilterOutlined,
  MessageOutlined,
  SearchOutlined,
  UserOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import {
  IconSend,
  IconClockHour4,
  IconCircleCheck,
  IconUser,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  Grid as AntdGrid,
  Avatar,
  Button,
  Card,
  Checkbox,
  Collapse,
  Flex,
  Input,
  List,
  Select,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from "antd";
import Link from "next/link";
import { useRouter } from "next/router";
import RestrictedContent from "../RestrictedContent";
import CekPertek from "../Public/CekPertek";

const { useBreakpoint } = AntdGrid;
const { Title, Text } = Typography;
const { Panel } = Collapse;

// Loading Skeleton Component - Clean & Minimal
const LoadingSkeleton = ({ minHeight = "80px" }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  return (
    <div
      style={{
        padding: isMobile ? "12px 16px" : "16px 20px",
        borderBottom: "1px solid #F3F4F6",
        minHeight: isMobile ? "70px" : minHeight,
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
        <div
          style={{
            flex: 1,
            width: "100%",
            maxWidth: isMobile ? "200px" : "400px",
          }}
        >
          <Skeleton.Input
            style={{
              width: isMobile ? "85%" : "70%",
              marginBottom: isMobile ? "8px" : "10px",
              maxWidth: isMobile ? "180px" : "300px",
            }}
            active
            size={isMobile ? "small" : "default"}
          />
          <Skeleton.Input
            style={{
              width: isMobile ? "65%" : "50%",
              maxWidth: isMobile ? "130px" : "200px",
            }}
            active
            size="small"
          />
        </div>
        <Flex
          align="center"
          gap={isMobile ? 8 : 12}
          style={{
            marginTop: isMobile ? "4px" : "0",
            alignSelf: isMobile ? "flex-end" : "flex-start",
          }}
        >
          <Skeleton.Avatar size={isMobile ? 20 : 24} />
          <Skeleton.Avatar size={isMobile ? 28 : 32} />
        </Flex>
      </Flex>
    </div>
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
  const getStatusConfig = (statusCode) => {
    switch (statusCode) {
      case "DIAJUKAN":
        return {
          color: "#FF4500",
          bg: "#FFF7E6",
          border: "#FFD591",
          text: "Diajukan",
        };
      case "DIKERJAKAN":
        return {
          color: "#1890FF",
          bg: "#E6F7FF",
          border: "#91D5FF",
          text: "Dikerjakan",
        };
      case "SELESAI":
        return {
          color: "#52C41A",
          bg: "#F6FFED",
          border: "#B7EB8F",
          text: "Selesai",
        };
      default:
        return {
          color: "#9CA3AF",
          bg: "#F9FAFB",
          border: "#E5E7EB",
          text: "Unknown",
        };
    }
  };

  const config = getStatusConfig(item?.status_code);

  return (
    <div
      style={{
        padding: "4px 8px",
        borderRadius: "6px",
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "12px",
        fontWeight: 500,
        color: config.color,
        width: "fit-content",
      }}
    >
      <SetItem item={item} />
      <span>{config.text}</span>
    </div>
  );
};

const Published = ({ item }) => {
  if (item?.is_published) {
    return (
      <div
        style={{
          backgroundColor: "#FF4500",
          color: "#FFFFFF",
          fontSize: "10px",
          fontWeight: 500,
          borderRadius: "4px",
          padding: "2px 6px",
          height: "20px",
          lineHeight: "16px",
          display: "inline-flex",
          alignItems: "center",
          width: "fit-content",
        }}
      >
        PUBLIKASI
      </div>
    );
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
        style={{
          width: "100%",
        }}
        mode="multiple"
        onChange={handleChange}
        placeholder="Pilih penerima tugas..."
        options={data}
        size="middle"
      />
    </Skeleton>
  );
};

const SubCategory = ({ item }) => {
  return (
    <>
      {item?.sub_category && (
        <div
          style={{
            padding: "3px 8px",
            borderRadius: "4px",
            backgroundColor: "#F8F9FA",
            border: "1px solid #E9ECEF",
            fontSize: "11px",
            fontWeight: 500,
            color: "#6B7280",
            display: "inline-block",
            width: "fit-content",
          }}
        >
          {item?.sub_category?.name}
        </div>
      )}
    </>
  );
};

const TitleLink = ({ item }) => {
  const router = useRouter();
  const handleClick = () => {
    router.push(`/customers-tickets/${item?.id}`);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <Status item={item} />
        <Published item={item} />
      </div>
      <Text
        onClick={handleClick}
        style={{
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: 600,
          color: "#1C1C1C",
          transition: "color 0.2s ease",
          lineHeight: "1.4",
          display: "block",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#FF4500";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#1C1C1C";
        }}
      >
        {item?.title}
      </Text>
      <SubCategory item={item} />
    </div>
  );
};

// Main Component
const TicketsPublish = () => {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading, isFetching } = useQuery(
    ["publish-tickets-customers", router?.query],
    () => publishTickets(router?.query),
    {
      enabled: !!router?.query,
      keepPreviousData: true,
    }
  );

  const handleSearch = (e) => {
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
    { label: "📤 Diajukan", value: "DIAJUKAN" },
    { label: "⏳ Dikerjakan", value: "DIKERJAKAN" },
    { label: "✅ Selesai", value: "SELESAI" },
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

  const mainPadding = isMobile ? "12px" : "16px";
  const iconSectionWidth = isMobile ? "0px" : "40px";

  return (
    <div>
      {/* Mobile Pagination Styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .ant-pagination {
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            flex-wrap: wrap !important;
            gap: 4px !important;
          }

          .ant-pagination-item,
          .ant-pagination-prev,
          .ant-pagination-next {
            min-width: 32px !important;
            height: 32px !important;
            line-height: 30px !important;
            margin: 0 2px !important;
          }

          .ant-pagination-item a {
            font-size: 12px !important;
          }

          .ant-pagination-total-text {
            font-size: 11px !important;
            margin: 0 8px !important;
          }

          .ant-pagination-simple .ant-pagination-simple-pager {
            display: flex !important;
            align-items: center !important;
          }

          .ant-pagination-simple .ant-pagination-simple-pager input {
            width: 40px !important;
            height: 28px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      {/* Header Search & Filters Card */}
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
            <Flex
              justify="space-between"
              align={isMobile ? "flex-start" : "center"}
              style={{
                marginBottom: "16px",
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? "12px" : "0",
              }}
            >
              <Title
                level={5}
                style={{
                  margin: 0,
                  color: "#1C1C1C",
                  fontSize: isMobile ? "16px" : "18px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                🎫 Pertanyaan Ditampilkan
              </Title>

              {/* CekPertek Component - responsive positioning */}
              <div style={{ alignSelf: isMobile ? "flex-start" : "auto" }}>
                <CekPertek />
              </div>
            </Flex>

            <div style={{ marginBottom: "16px" }}>
              <Input.Search
                defaultValue={router?.query?.search}
                onSearch={handleSearch}
                placeholder={
                  isMobile
                    ? "Cari tiket..."
                    : "Cari tiket berdasarkan judul atau konten..."
                }
                size={isMobile ? "middle" : "large"}
                style={{
                  borderRadius: "8px",
                }}
                enterButton={
                  <Button type="default" icon={<SearchOutlined />}>
                    {isMobile ? "" : "Cari"}
                  </Button>
                }
              />
            </div>

            <RestrictedContent name="advanced-filter">
              <Collapse
                ghost
                expandIcon={({ isActive }) => (
                  <DownOutlined
                    rotate={isActive ? 180 : 0}
                    style={{ color: "#FF4500" }}
                  />
                )}
                style={{
                  backgroundColor: "#F8F9FA",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  marginBottom: "16px",
                }}
              >
                <Panel
                  header={
                    <Text
                      style={{
                        fontSize: "13px",
                        color: "#6B7280",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontWeight: 500,
                      }}
                    >
                      <FilterOutlined style={{ color: "#FF4500" }} />
                      Filter Advanced
                    </Text>
                  }
                  key="1"
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                  }}
                >
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: "100%" }}
                  >
                    <div>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#1C1C1C",
                          fontWeight: 500,
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Status Tiket:
                      </Text>
                      <Checkbox.Group
                        value={router?.query?.status_code?.split(",") || []}
                        onChange={handleChangeStatus}
                        options={status}
                        style={{
                          display: "flex",
                          gap: "12px",
                          flexWrap: "wrap",
                        }}
                      />
                    </div>

                    <div>
                      <Checkbox
                        value={!!router?.query?.is_published}
                        checked={!!router?.query?.is_published}
                        onChange={handleChangePublikasi}
                        style={{ color: "#1C1C1C" }}
                      >
                        <Text style={{ color: "#1C1C1C", fontSize: "14px" }}>
                          📢 Hanya Tiket Terpublikasi
                        </Text>
                      </Checkbox>
                    </div>

                    <div>
                      <Text
                        style={{
                          fontSize: "12px",
                          color: "#1C1C1C",
                          fontWeight: 500,
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Penerima Tugas:
                      </Text>
                      <FilterUser
                        value={router?.query?.assignees?.split(",") || []}
                        handleChange={handleSelectedUser}
                      />
                    </div>
                  </Space>
                </Panel>
              </Collapse>
            </RestrictedContent>
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
              <UserOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
            <List
              loading={isFetching || isLoading}
              dataSource={data?.results}
              rowKey={(row) => row?.id}
              size="large"
              pagination={{
                showSizeChanger: false,
                position: "bottom",
                current: parseInt(router?.query?.page) || 1,
                pageSize: 10,
                onChange: handleChangePage,
                total: data?.total,
                showTotal: (total, range) =>
                  isMobile
                    ? `${range[0]}-${range[1]} dari ${total}`
                    : `Menampilkan ${range[0]}-${range[1]} dari ${total} tiket`,
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
                itemRender: isMobile
                  ? (current, type, originalElement) => {
                      if (type === "prev") {
                        return (
                          <Button size="small" type="text">
                            ‹
                          </Button>
                        );
                      }
                      if (type === "next") {
                        return (
                          <Button size="small" type="text">
                            ›
                          </Button>
                        );
                      }
                      return originalElement;
                    }
                  : undefined,
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
                        index < data?.results?.length - 1
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
                          <Text
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
                          </Text>
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
                        <Text
                          style={{
                            fontSize: isMobile ? "11px" : "13px",
                            color: "#9CA3AF",
                            display: "block",
                            lineHeight: "1.4",
                          }}
                        >
                          {formatDateLLWithTime(item?.created_at)} • oleh{" "}
                          <Link href={`/users/${item?.customer?.custom_id}`}>
                            <Text
                              style={{
                                color: "#0079D3",
                                fontWeight: 500,
                              }}
                            >
                              {item?.customer?.username}
                            </Text>
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
                        </Text>

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
                          <Text
                            style={{
                              fontSize: isMobile ? "10px" : "12px",
                              color: "#9CA3AF",
                              fontWeight: 500,
                            }}
                          >
                            {parseInt(item?.comments_count)}
                          </Text>
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
    </div>
  );
};

export default TicketsPublish;
