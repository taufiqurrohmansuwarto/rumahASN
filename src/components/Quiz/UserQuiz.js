import { answerQuiz, getScore, getUserQuiz } from "@/services/quiz.services";
import {
  QuestionCircleFilled,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { Progress } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  Radio,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Flex,
  theme,
  Grid,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import React from "react";

const { Title, Text } = Typography;
const { useToken } = theme;
const { useBreakpoint } = Grid;

const Extra = () => {
  const { data, isLoading } = useQuery(["user-score"], () => getScore(), {});
  const router = useRouter();
  const { token } = useToken();

  const gotoQuiz = () => router.push("/quiz");

  return (
    <Spin spinning={isLoading}>
      <div
        style={{
          padding: "6px 10px",
          borderRadius: token.borderRadius,
          backgroundColor: token.colorPrimaryBg,
          border: `1px solid ${token.colorPrimaryBorder}`,
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
        onClick={gotoQuiz}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = token.colorPrimaryBgHover;
          e.currentTarget.style.borderColor = token.colorPrimary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = token.colorPrimaryBg;
          e.currentTarget.style.borderColor = token.colorPrimaryBorder;
        }}
      >
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: token.borderRadiusSM,
            backgroundColor: token.colorPrimary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TrophyOutlined style={{ color: "white", fontSize: "10px" }} />
        </div>
        <Text style={{ fontWeight: 500 }}>{data?.score || 0} pts</Text>
        <Tooltip title="Lihat Peringkat">
          <QuestionCircleFilled
            style={{ color: token.colorPrimary, fontSize: "10px" }}
          />
        </Tooltip>
      </div>
    </Spin>
  );
};

function UserQuiz({ showUrl = false }) {
  const { data, refetch, isFetching, isLoading } = useQuery(
    ["user-quiz"],
    () => getUserQuiz(),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const queryClient = useQueryClient();
  const { token } = useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const [seconds, setSeconds] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const { mutate: submitAnswer } = useMutation((data) => answerQuiz(data), {
    onSuccess: (x) => {
      setCurrentAnswer(x);
      setShowAnswer(true);
    },
    onSettled: () => {
      queryClient.invalidateQueries(["user-score"]);
      queryClient.invalidateQueries(["leaderboard"]);
    },
  });

  const handleOnChange = (e) => {
    setAnswer(e.target.value);
    if (seconds === 0) {
      setSeconds(1);
    }
  };

  useEffect(() => {
    let timer;
    if (seconds > 0 && seconds < 5) {
      timer = setTimeout(() => {
        setSeconds(seconds + 1);
      }, 1000);
    } else if (seconds === 5 && !showAnswer) {
      submitAnswer({
        id: data?.id,
        data: {
          answer,
        },
      });
    } else if (seconds >= 5 && showAnswer) {
      timer = setTimeout(() => {
        refetch();
        setSeconds(0);
        setShowAnswer(false);
        setCurrentAnswer(null);
        setAnswer(null);
      }, 3000);
    }

    return () => clearTimeout(timer);
  }, [seconds, showAnswer, data?.id, answer, submitAnswer, refetch]);

  const timeLeft = 5 - seconds;
  const progressValue = seconds === 0 ? 0 : (seconds / 5) * 100;
  const isTimeUrgent = timeLeft <= 2 && seconds > 0;

  const mainPadding = isMobile ? "12px" : "16px";
  const iconSectionWidth = isMobile ? "0px" : "40px";

  return (
    <div>
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
              <QuestionCircleOutlined
                style={{ color: "#FF4500", fontSize: "18px" }}
              />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: mainPadding }}>
            {/* Header */}
            <div style={{ marginBottom: "16px" }}>
              <Flex justify="space-between" align="center">
                <div>
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
                    🧠 Kuis Kepegawaian
                  </Title>
                  <Text
                    style={{
                      color: "#878A8C",
                      fontSize: isMobile ? "12px" : "14px",
                    }}
                  >
                    Uji pengetahuan kepegawaian Anda
                  </Text>
                </div>
                <Extra />
              </Flex>
            </div>

            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {/* Timer Section */}
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: isTimeUrgent ? "#FFF2F0" : "#E6F7FF",
                  border: `1px solid ${isTimeUrgent ? "#FFCCC7" : "#91D5FF"}`,
                  transition: "all 0.3s ease",
                }}
              >
                <Flex align="center" gap={8}>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      backgroundColor: isTimeUrgent ? "#FF4D4F" : "#1890FF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ClockCircleOutlined
                      style={{ color: "white", fontSize: "11px" }}
                    />
                  </div>
                  <Text style={{ color: "#1C1C1C", fontWeight: 500 }}>
                    Waktu tersisa: {timeLeft} detik
                  </Text>
                </Flex>
                <Progress
                  striped
                  animate
                  color={isTimeUrgent ? "red" : "blue"}
                  value={progressValue}
                  style={{ height: "3px", marginTop: "8px" }}
                />
              </div>

              {/* Question Section */}
              <div
                style={{
                  padding: "12px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E5E7EB",
                }}
              >
                <Text strong style={{ color: "#1C1C1C" }}>
                  {data?.question}
                </Text>
              </div>

              {/* Options Section */}
              <Spin spinning={isFetching || isLoading}>
                <Radio.Group
                  value={answer}
                  onChange={handleOnChange}
                  disabled={seconds >= 5 && showAnswer}
                  style={{ width: "100%" }}
                >
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: "100%" }}
                  >
                    {data?.options?.map((item, index) => (
                      <div
                        key={item.option}
                        style={{
                          padding: "8px",
                          borderRadius: "6px",
                          border:
                            answer === item.option
                              ? "2px solid #FF4500"
                              : "1px solid #E5E7EB",
                          backgroundColor:
                            answer === item.option ? "#FFF7E6" : "#FFFFFF",
                          cursor:
                            seconds >= 5 && showAnswer
                              ? "not-allowed"
                              : "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!(seconds >= 5 && showAnswer)) {
                            e.currentTarget.style.borderColor = "#FF4500";
                            e.currentTarget.style.backgroundColor = "#FFF7E6";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!(seconds >= 5 && showAnswer)) {
                            e.currentTarget.style.borderColor =
                              answer === item.option ? "#FF4500" : "#E5E7EB";
                            e.currentTarget.style.backgroundColor =
                              answer === item.option ? "#FFF7E6" : "#FFFFFF";
                          }
                        }}
                      >
                        <Radio
                          value={item.option}
                          style={{
                            fontWeight: answer === item.option ? 500 : 400,
                            color: "#1C1C1C",
                          }}
                        >
                          {item.text}
                        </Radio>
                      </div>
                    ))}
                  </Space>
                </Radio.Group>
              </Spin>

              {/* Answer Result */}
              {showAnswer && (
                <div
                  style={{
                    padding: "12px",
                    borderRadius: "8px",
                    border: `2px solid ${
                      currentAnswer?.is_correct ? "#52C41A" : "#FF4D4F"
                    }`,
                    backgroundColor: currentAnswer?.is_correct
                      ? "#F6FFED"
                      : "#FFF2F0",
                  }}
                >
                  <Flex align="center" gap={8} style={{ marginBottom: "8px" }}>
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        borderRadius: "4px",
                        backgroundColor: currentAnswer?.is_correct
                          ? "#52C41A"
                          : "#FF4D4F",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {currentAnswer?.is_correct ? (
                        <CheckCircleOutlined
                          style={{ color: "white", fontSize: "10px" }}
                        />
                      ) : (
                        <CloseCircleOutlined
                          style={{ color: "white", fontSize: "10px" }}
                        />
                      )}
                    </div>
                    <Text
                      strong
                      style={{
                        color: currentAnswer?.is_correct
                          ? "#52C41A"
                          : "#FF4D4F",
                      }}
                    >
                      {currentAnswer?.is_correct ? "Benar!" : "Salah!"}
                    </Text>
                    <Text style={{ color: "#878A8C" }}>
                      {currentAnswer?.is_correct
                        ? "Anda mendapat poin"
                        : "Coba lagi"}
                    </Text>
                  </Flex>

                  {!currentAnswer?.is_correct && (
                    <div
                      style={{
                        padding: "8px",
                        borderRadius: "6px",
                        backgroundColor: "#F6FFED",
                        border: "1px solid #B7EB8F",
                      }}
                    >
                      <Text style={{ color: "#52C41A" }}>
                        <Text strong>Jawaban benar:</Text>{" "}
                        {currentAnswer?.correct_answer}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </Space>
          </div>
        </Flex>
      </Card>
    </div>
  );
}

export default UserQuiz;
