import { getSavedQuestions } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card, List, Typography, theme, Empty, Row, Col, Button } from "antd";
import { FileTextOutlined, EyeOutlined } from "@ant-design/icons";
import Link from "next/link";
import React, { useState } from "react";

const { Title, Text } = Typography;
const { useToken } = theme;

function SavedQuestions() {
  const { token } = useToken();
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery(
    ["saved-questions", query],
    () => getSavedQuestions(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const handlePageChange = (page) => {
    setQuery({
      ...query,
      page: page,
    });
  };

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        {(!data?.data || data?.data?.length === 0) && !isLoading ? (
          <div
            style={{
              padding: "64px 32px",
              textAlign: "center",
            }}
          >
            <Empty
              description={
                <Text style={{ color: "#6B7280", fontSize: "16px" }}>
                  Belum ada pertanyaan yang disimpan
                </Text>
              }
            />
          </div>
        ) : (
          <List
            loading={isLoading}
            rowKey={(row) => row?.id}
            dataSource={data?.data}
            pagination={{
              total: data?.total,
              current: query.page,
              pageSize: query.limit,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} pertanyaan`,
              onChange: handlePageChange,
              showSizeChanger: false,
              style: {
                marginTop: "24px",
                textAlign: "center",
              },
            }}
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
                        backgroundColor: "#FFFBEB",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #FDE68A",
                      }}
                    >
                      <FileTextOutlined
                        style={{
                          color: "#F59E0B",
                          fontSize: "16px",
                        }}
                      />
                    </div>
                  }
                  title={
                    <Link href={`/customers-tickets/${item?.ticket?.id}`}>
                      <Text
                        strong
                        style={{
                          color: "#1F2937",
                          fontSize: "14px",
                          lineHeight: "1.4",
                        }}
                      >
                        {item?.ticket?.title}
                      </Text>
                    </Link>
                  }
                  description={
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "12px",
                      }}
                    >
                      Disimpan
                    </Text>
                  }
                />
                <div>
                  <Link href={`/customers-tickets/${item?.ticket?.id}`}>
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      style={{
                        borderRadius: "6px",
                        fontWeight: 500,
                      }}
                    >
                      Lihat
                    </Button>
                  </Link>
                </div>
              </List.Item>
            )}
          />
        )}
      </Col>
    </Row>
  );
}

export default SavedQuestions;
