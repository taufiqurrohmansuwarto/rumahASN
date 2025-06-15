import { formatDateSimple } from "@/utils/client-utils";
import { Avatar, Progress, Rating, Stack } from "@mantine/core";
import {
  Card,
  Col,
  Divider,
  FloatButton,
  Grid,
  List,
  Row,
  Space,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const { useBreakpoint } = Grid;

const DaftarUserRating = ({ data, loadingRating }) => {
  const router = useRouter();
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  const handleChangePage = (page) => {
    router.push({
      query: {
        ...router?.query,
        page,
      },
    });
  };

  return (
    <>
      <List
        loading={loadingRating}
        size="large"
        pagination={{
          onChange: handleChangePage,
          size: "default",
          pageSize: data?.limit,
          current: parseInt(router?.query?.page) || 1,
          position: "bottom",
          showSizeChanger: false,
          total: data?.total,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} peserta`,
          style: {
            padding: "16px 0",
            textAlign: "center",
          },
        }}
        dataSource={data?.data}
        rowKey={(row) => row?.id}
        renderItem={(item) => (
          <List.Item
            style={{
              border: "1px solid #E5E7EB",
              borderRadius: isMobile ? "6px" : "8px",
              margin: isMobile ? "0 0 12px 0" : "0 0 16px 0",
              padding: isMobile ? "16px" : isTablet ? "18px 20px" : "20px 24px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              transition: "all 0.2s ease",
            }}
          >
            <Row
              style={{
                width: "100%",
                alignItems: "flex-start",
              }}
              gutter={isMobile ? [12, 12] : isTablet ? [16, 16] : [24, 16]}
            >
              <Col lg={8} md={10} sm={24} xs={24}>
                <Space
                  direction="vertical"
                  size={isMobile ? "xs" : "small"}
                  style={{ width: "100%" }}
                >
                  {/* User Info */}
                  <Space size={isMobile ? "small" : "middle"} align="start">
                    <Avatar
                      src={item?.participant?.image}
                      size={isMobile ? "sm" : "md"}
                      style={{
                        border: "2px solid #F3F4F6",
                        backgroundColor: "#F8F9FA",
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Typography.Text
                        strong
                        style={{
                          display: "block",
                          fontSize: isMobile
                            ? "14px"
                            : isTablet
                            ? "15px"
                            : "16px",
                          color: "#1C1C1C",
                          marginBottom: "4px",
                          wordBreak: "break-word",
                        }}
                      >
                        {item?.participant?.username}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{
                          fontSize: isMobile
                            ? "11px"
                            : isTablet
                            ? "12px"
                            : "13px",
                          display: "block",
                          marginBottom: "2px",
                          color: "#6B7280",
                          wordBreak: "break-word",
                        }}
                      >
                        {item?.participant?.info?.jabatan?.jabatan}
                      </Typography.Text>
                      <Typography.Text
                        type="secondary"
                        style={{
                          fontSize: isMobile ? "10px" : "12px",
                          display: "block",
                          color: "#9CA3AF",
                          lineHeight: "1.4",
                          wordBreak: "break-word",
                        }}
                      >
                        {item?.participant?.info?.perangkat_daerah?.detail}
                      </Typography.Text>
                    </div>
                  </Space>

                  {/* Rating and Date */}
                  <Space
                    direction={isMobile ? "horizontal" : "vertical"}
                    size="xs"
                    style={{
                      marginTop: isMobile ? "8px" : "12px",
                      width: "100%",
                      justifyContent: isMobile ? "space-between" : "flex-start",
                    }}
                  >
                    <Rating
                      value={item?.rating}
                      readOnly
                      style={{ fontSize: isMobile ? "14px" : "16px" }}
                    />
                    <Typography.Text
                      type="secondary"
                      style={{
                        fontSize: isMobile ? "10px" : "12px",
                        color: "#9CA3AF",
                      }}
                    >
                      📅 {formatDateSimple(item?.created_at)}
                    </Typography.Text>
                  </Space>
                </Space>
              </Col>

              <Col lg={16} md={14} sm={24} xs={24}>
                <div
                  style={{
                    padding: isMobile ? "12px" : isTablet ? "14px" : "16px",
                    backgroundColor: "#F8F9FA",
                    borderRadius: "6px",
                    border: "1px solid #F3F4F6",
                    minHeight: isMobile ? "60px" : "80px",
                    marginTop: isMobile ? "12px" : 0,
                  }}
                >
                  <Typography.Text
                    style={{
                      fontSize: isMobile ? "13px" : "14px",
                      lineHeight: "1.6",
                      color: "#374151",
                      display: "block",
                      wordBreak: "break-word",
                    }}
                  >
                    {item?.comments ? (
                      <>
                        <span
                          style={{
                            fontSize: isMobile ? "14px" : "16px",
                            marginRight: "8px",
                            color: "#FF4500",
                          }}
                        >
                          💬
                        </span>
                        {item.comments}
                      </>
                    ) : (
                      <span
                        style={{
                          color: "#9CA3AF",
                          fontStyle: "italic",
                        }}
                      >
                        Tidak ada komentar
                      </span>
                    )}
                  </Typography.Text>
                </div>
              </Col>
            </Row>
          </List.Item>
        )}
      />
    </>
  );
};

const DaftarRating = ({ data }) => {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  const handleActive = (value) => {
    if (value === active) {
      setActive(0);
      router.push({
        query: {
          id: router?.query?.id,
          page: 1,
        },
      });
    } else {
      router.push({
        query: {
          ...router?.query,
          page: 1,
          rating: value,
        },
      });
      setActive(value);
    }
  };

  return (
    <Space direction="vertical" size="middle" style={{ width: "100%" }}>
      {data?.map((d) => {
        return (
          <div
            key={d?.rating}
            style={{
              cursor: "pointer",
              backgroundColor:
                active === d?.rating ? "rgba(255, 69, 0, 0.1)" : "#FFFFFF",
              border:
                active === d?.rating
                  ? "1px solid #FF4500"
                  : "1px solid #E5E7EB",
              borderRadius: isMobile ? "4px" : "6px",
              padding: isMobile
                ? "8px 12px"
                : isTablet
                ? "10px 14px"
                : "12px 16px",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: isMobile ? "8px" : "12px",
              width: "100%",
              flexWrap: isMobile ? "wrap" : "nowrap",
            }}
            onClick={() => handleActive(d?.rating)}
            onMouseEnter={(e) => {
              if (active !== d?.rating) {
                e.target.style.backgroundColor = "#F8F9FA";
                e.target.style.borderColor = "#D1D5DB";
              }
            }}
            onMouseLeave={(e) => {
              if (active !== d?.rating) {
                e.target.style.backgroundColor = "#FFFFFF";
                e.target.style.borderColor = "#E5E7EB";
              }
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                minWidth: isMobile ? "80px" : "100px",
              }}
            >
              <Rating
                value={d?.rating}
                readOnly
                style={{
                  fontSize: isMobile ? "12px" : isTablet ? "13px" : "14px",
                }}
              />
            </div>

            <div
              style={{
                flex: 1,
                minWidth: isMobile ? "100px" : "120px",
                maxWidth: isMobile ? "150px" : "200px",
              }}
            >
              <Progress
                w="100%"
                value={d?.percentage}
                color={active === d?.rating ? "#FF4500" : "#E5E7EB"}
                size={isMobile ? "sm" : "md"}
              />
            </div>

            <Typography.Text
              style={{
                fontSize: isMobile ? "12px" : "13px",
                fontWeight: 500,
                color: active === d?.rating ? "#FF4500" : "#6B7280",
                minWidth: isMobile ? "25px" : "30px",
                textAlign: "right",
                whiteSpace: "nowrap",
              }}
            >
              {d?.total}
            </Typography.Text>
          </div>
        );
      })}
    </Space>
  );
};

const ViewRatingComponent = ({ data }) => {
  const screens = useBreakpoint();

  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;

  return (
    <Row
      gutter={isMobile ? [16, 16] : isTablet ? [20, 20] : [24, 24]}
      style={{ marginBottom: isMobile ? "16px" : "24px" }}
    >
      <Col lg={10} md={12} sm={24} xs={24}>
        <div
          style={{
            padding: isMobile ? "16px" : isTablet ? "20px" : "24px",
            backgroundColor: "#F8F9FA",
            borderRadius: isMobile ? "6px" : "8px",
            border: "1px solid #E5E7EB",
            textAlign: "center",
            marginBottom: isMobile ? "16px" : 0,
          }}
        >
          <Typography.Title
            level={isMobile ? 5 : 4}
            style={{
              color: "#1C1C1C",
              marginBottom: isMobile ? "16px" : "20px",
              fontSize: isMobile ? "16px" : isTablet ? "17px" : "18px",
            }}
          >
            📊 Review Peserta & Rating
          </Typography.Title>

          <Space
            direction="vertical"
            size={isMobile ? "small" : "middle"}
            align="center"
          >
            <div
              style={{
                fontSize: isMobile ? "32px" : isTablet ? "40px" : "48px",
                fontWeight: "bold",
                color: "#FF4500",
                lineHeight: "1",
              }}
            >
              {data?.aggregate?.averageRatings?.toFixed(1) || "0.0"}
            </div>

            <Rating
              fractions={3}
              value={data?.aggregate?.averageRatings}
              readOnly
              style={{
                fontSize: isMobile ? "16px" : isTablet ? "18px" : "20px",
              }}
            />

            <Typography.Text
              style={{
                fontSize: isMobile ? "12px" : "14px",
                color: "#6B7280",
              }}
            >
              dari 5 bintang
            </Typography.Text>

            <Typography.Text
              type="secondary"
              style={{
                fontSize: isMobile ? "11px" : "13px",
                color: "#9CA3AF",
                textAlign: "center",
                lineHeight: "1.4",
              }}
            >
              Berdasar dari <strong>{data?.aggregate?.totalUserRatings}</strong>{" "}
              orang peserta
            </Typography.Text>
          </Space>
        </div>
      </Col>

      <Col lg={14} md={12} sm={24} xs={24}>
        <div
          style={{
            padding: isMobile ? "16px" : isTablet ? "20px" : "24px",
            backgroundColor: "#FFFFFF",
            borderRadius: isMobile ? "6px" : "8px",
            border: "1px solid #E5E7EB",
          }}
        >
          <Typography.Title
            level={5}
            style={{
              color: "#1C1C1C",
              marginBottom: isMobile ? "12px" : "16px",
              fontSize: isMobile ? "14px" : "16px",
            }}
          >
            📈 Distribusi Rating
          </Typography.Title>
          <DaftarRating data={data?.aggregate?.totalRatingPerValue} />
        </div>
      </Col>
    </Row>
  );
};

const WebinarRatings = ({ data, loadingRating }) => {
  return (
    <Card>
      <FloatButton.BackTop />
      <ViewRatingComponent data={data} />
      <Divider />
      <DaftarUserRating loadingRating={loadingRating} data={data?.data} />
    </Card>
  );
};

export default WebinarRatings;
