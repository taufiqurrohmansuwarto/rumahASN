import { pollForUser, votePolling } from "@/services/polls.services";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Card,
  List,
  Radio,
  Skeleton,
  Space,
  Typography,
  message,
  Flex,
  Grid,
} from "antd";
import { BarChartOutlined } from "@ant-design/icons";
import { useEffect } from "react";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const Poll = ({ data }) => {
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation((data) => votePolling(data), {
    onSuccess: () => {
      queryClient.invalidateQueries("users-polls");
    },
    onSettled: () => {
      queryClient.invalidateQueries("users-polls");
    },
  });

  const handleChange = (id, data) => {
    const currentData = {
      poll_id: data?.id,
      answer_id: id,
    };

    mutate(currentData);
  };

  return (
    <div style={{ marginBottom: "20px" }}>
      <Text
        strong
        style={{
          color: "#1C1C1C",
          fontSize: "15px",
          display: "block",
          marginBottom: "12px",
          lineHeight: "1.5",
        }}
      >
        {data?.question}
      </Text>
      <Radio.Group defaultValue={data?.vote}>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          {data?.answers?.map((answer) => (
            <div
              key={answer?.id}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                border:
                  data?.vote === answer?.id
                    ? "2px solid #FF4500"
                    : "1px solid #E5E7EB",
                backgroundColor:
                  data?.vote === answer?.id ? "#FFF7E6" : "#FFFFFF",
                transition: "all 0.2s ease",
              }}
            >
              <Radio
                onChange={() => handleChange(answer?.id, data)}
                value={answer?.id}
                style={{
                  fontWeight: data?.vote === answer?.id ? 500 : 400,
                  color: "#1C1C1C",
                }}
              >
                {answer?.answer}
              </Radio>
            </div>
          ))}
        </Space>
      </Radio.Group>
    </div>
  );
};

function UserPolls() {
  const { data, isLoading } = useQuery(
    ["users-polls"],
    () => pollForUser(),
    {}
  );

  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const mainPadding = isMobile ? "12px" : "16px";
  const iconSectionWidth = isMobile ? "0px" : "40px";

  return (
    <>
      {data?.length > 0 ? (
        <div>
          <Badge.Ribbon text="Kami Butuh Suaramu!" color="primary">
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
                    <BarChartOutlined
                      style={{ color: "#FF4500", fontSize: "18px" }}
                    />
                  </div>
                )}

                {/* Content Section */}
                <div style={{ flex: 1, padding: mainPadding }}>
                  {/* Header */}
                  <div style={{ marginBottom: "16px" }}>
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
                      🗳️ Yuk Ikutan Voting!
                    </Title>
                    <Text
                      style={{
                        color: "#878A8C",
                        fontSize: isMobile ? "12px" : "14px",
                      }}
                    >
                      Berikan suara Anda untuk polling aktif
                    </Text>
                  </div>

                  {/* Polls List */}
                  <div>
                    {isLoading ? (
                      <div>
                        {[...Array(2)].map((_, index) => (
                          <div key={index} style={{ marginBottom: "20px" }}>
                            <Skeleton.Input
                              style={{ width: "80%", marginBottom: "12px" }}
                              active
                            />
                            <Space
                              direction="vertical"
                              size="small"
                              style={{ width: "100%" }}
                            >
                              {[...Array(3)].map((_, i) => (
                                <Skeleton.Input
                                  key={i}
                                  style={{ width: "60%" }}
                                  active
                                  size="small"
                                />
                              ))}
                            </Space>
                          </div>
                        ))}
                      </div>
                    ) : (
                      data?.map((item, index) => (
                        <Poll key={item?.id || index} data={item} />
                      ))
                    )}
                  </div>
                </div>
              </Flex>
            </Card>
          </Badge.Ribbon>
        </div>
      ) : null}
    </>
  );
}

export default UserPolls;
