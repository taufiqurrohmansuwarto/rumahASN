import { getTicketRecommendations } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { List, Typography, Skeleton, Row, Col, Grid } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const { Text, Title } = Typography;
const { useBreakpoint } = Grid;

// create list recommendation component
const Tickets = ({ tickets }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const isTablet = screens.md && !screens.lg;
  const isDesktop = screens.lg;

  return (
    <div>
      <div
        style={{
          marginBottom: isMobile ? 16 : 20,
          borderBottom: "2px solid #f5f5f5",
          paddingBottom: isMobile ? 12 : 16,
        }}
      >
        <Title
          level={isMobile ? 5 : 4}
          style={{
            margin: 0,
            color: "#262626",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          🔗 Pertanyaan Terkait
        </Title>
        <Text
          type="secondary"
          style={{
            fontSize: isMobile ? 12 : 13,
            marginTop: 4,
            display: "block",
          }}
        >
          Ticket serupa yang mungkin relevan
        </Text>
      </div>

      <List
        dataSource={tickets}
        rowKey={(row) => row?.id}
        split={false}
        renderItem={(item, index) => (
          <List.Item
            style={{
              padding: isMobile ? "12px 0" : "16px 0",
              borderBottom:
                index === tickets.length - 1 ? "none" : "1px solid #f5f5f5",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = "#fafafa";
                e.currentTarget.style.borderRadius = "6px";
                e.currentTarget.style.padding = isDesktop
                  ? "16px 12px"
                  : "12px 8px";
              }
            }}
            onMouseLeave={(e) => {
              if (!isMobile) {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderRadius = "0";
                e.currentTarget.style.padding = isDesktop ? "16px 0" : "12px 0";
              }
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: isMobile ? 8 : 12,
                width: "100%",
              }}
            >
              <div
                style={{
                  width: isMobile ? 6 : 8,
                  height: isMobile ? 6 : 8,
                  borderRadius: "50%",
                  backgroundColor: "#FF4500",
                  flexShrink: 0,
                  marginTop: isMobile ? 6 : 8,
                }}
              />
              <Link href={`/customers-tickets/${item?.id}`} style={{ flex: 1 }}>
                <Typography.Link
                  style={{
                    fontSize: isMobile ? 13 : 14,
                    lineHeight: isMobile ? 1.4 : 1.5,
                    color: "#262626",
                    fontWeight: 500,
                    display: "block",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#FF4500";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#262626";
                  }}
                >
                  {item?.title}
                </Typography.Link>
              </Link>
            </div>
          </List.Item>
        )}
      />

      {tickets.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: isMobile ? "24px 16px" : "32px 24px",
            color: "#8c8c8c",
          }}
        >
          <div style={{ fontSize: isMobile ? 24 : 32, marginBottom: 8 }}>
            🔍
          </div>
          <Text type="secondary" style={{ fontSize: isMobile ? 13 : 14 }}>
            Tidak ada pertanyaan terkait ditemukan
          </Text>
        </div>
      )}
    </div>
  );
};

function TicketsRecommendations() {
  const router = useRouter();
  const id = router?.query?.id;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const { data, isLoading } = useQuery(
    ["tickets-recommendations"],
    () => getTicketRecommendations(id),
    {
      enabled: !!id,
    }
  );

  return (
    <Skeleton loading={isLoading} active>
      {data?.length > 0 ? (
        <Row
          style={{
            marginTop: isMobile ? 20 : 32,
          }}
        >
          <Col span={24}>
            <Tickets tickets={data} />
          </Col>
        </Row>
      ) : null}
    </Skeleton>
  );
}

export default TicketsRecommendations;
