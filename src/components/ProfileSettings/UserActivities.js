import { usersHistories } from "@/services/index";
import { formatDateFromNow, jenisRiwayat } from "@/utils/client-utils";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Button, Card, List, Typography, theme, Empty, Row, Col } from "antd";
import { FileTextOutlined, LoadingOutlined } from "@ant-design/icons";
import Link from "next/link";
import React from "react";

const { Title, Text } = Typography;
const { useToken } = theme;

const fetchItems = async ({ pageParam = 1, queryKey }) => {
  const [_, limit] = queryKey;
  const response = await usersHistories({
    page: pageParam,
    limit: limit,
  });

  return response;
};

const LinkTicket = ({ item }) => {
  return (
    <>
      {item?.ticket && (
        <>
          {" "}
          <Text type="secondary">pada</Text>{" "}
          <Link href={`/customers-tickets/${item?.ticket?.id}`}>
            <Text
              style={{
                color: "#6366F1",
                textDecoration: "underline",
              }}
            >
              {item?.ticket?.title}
            </Text>
          </Link>
        </>
      )}
    </>
  );
};

const HistoriesData = ({ data, loading, hasNextPage, fetchNextPage }) => {
  const { token } = useToken();

  if (!data || data.length === 0) {
    return (
      <div
        style={{
          padding: "64px 32px",
          textAlign: "center",
        }}
      >
        <Empty
          description={
            <Text style={{ color: "#6B7280", fontSize: "16px" }}>
              Belum ada aktivitas yang tercatat
            </Text>
          }
        />
      </div>
    );
  }

  return (
    <List
      itemLayout="horizontal"
      dataSource={data}
      rowKey={(row) => row?.id}
      loading={loading}
      renderItem={(item) => (
        <List.Item
          style={{
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "8px",
            backgroundColor: "white",
            transition: "all 0.2s ease",
          }}
        >
          <List.Item.Meta
            avatar={
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "8px",
                  backgroundColor: "#EEF2FF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #C7D2FE",
                }}
              >
                <FileTextOutlined
                  style={{
                    color: "#6366F1",
                    fontSize: "16px",
                  }}
                />
              </div>
            }
            title={
              <div>
                <Text strong>{jenisRiwayat(item?.action)}</Text>
                <LinkTicket item={item} />
              </div>
            }
            description={
              <Text
                type="secondary"
                style={{
                  fontSize: "12px",
                }}
              >
                {formatDateFromNow(item?.created_at)}
              </Text>
            }
          />
        </List.Item>
      )}
      footer={
        hasNextPage && (
          <div
            style={{
              textAlign: "center",
              padding: "16px",
            }}
          >
            <Button
              type="primary"
              onClick={() => fetchNextPage()}
              style={{
                borderRadius: "8px",
                fontWeight: 500,
              }}
            >
              Muat Lebih Banyak
            </Button>
          </div>
        )
      }
    />
  );
};

function UserActivities() {
  const { data, fetchNextPage, hasNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(["user-histories", 10], fetchItems, {
      getNextPageParam: (lastPage) => {
        if (lastPage.hasNextPage) return lastPage.page + 1;
        return false;
      },
      keepPreviousData: true,
    });

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <HistoriesData
          data={data?.pages?.flatMap((page) => page?.result)}
          loading={isLoading || isFetchingNextPage}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      </Col>
    </Row>
  );
}

export default UserActivities;
