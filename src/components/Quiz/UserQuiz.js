import { answerQuiz, getScore, getUserQuiz } from "@/services/quiz.services";
import {
  QuestionCircleFilled,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
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
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import React from "react";

const { Title, Text } = Typography;
const { useToken } = theme;

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

  return (
    <Card
      style={{
        borderRadius: token.borderRadiusLG,
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: token.marginMD }}>
        <Flex justify="space-between" align="center">
          <div>
            <Title level={5} style={{ margin: 0 }}>
              Kuis Kepegawaian
            </Title>
            <Text type="secondary">Uji pengetahuan kepegawaian Anda</Text>
          </div>
          <Extra />
        </Flex>
      </div>

      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Timer Section */}
        <div
          style={{
            padding: token.paddingSM,
            borderRadius: token.borderRadius,
            backgroundColor: isTimeUrgent
              ? token.colorErrorBg
              : token.colorInfoBg,
            border: `1px solid ${
              isTimeUrgent ? token.colorErrorBorder : token.colorInfoBorder
            }`,
            transition: "all 0.3s ease",
          }}
        >
          <Flex align="center" gap={token.marginXS}>
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: token.borderRadiusSM,
                backgroundColor: isTimeUrgent
                  ? token.colorError
                  : token.colorInfo,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ClockCircleOutlined
                style={{ color: "white", fontSize: "11px" }}
              />
            </div>
            <Text>Waktu tersisa: {timeLeft} detik</Text>
          </Flex>
          <Progress
            striped
            animate
            color={isTimeUrgent ? "red" : "blue"}
            value={progressValue}
            style={{ height: "3px", marginTop: token.marginXS }}
          />
        </div>

        {/* Question Section */}
        <div
          style={{
            padding: token.paddingSM,
            borderRadius: token.borderRadius,
            backgroundColor: "white",
            border: `1px solid ${token.colorBorder}`,
          }}
        >
          <Text strong>{data?.question}</Text>
        </div>

        {/* Options Section */}
        <Spin spinning={isFetching || isLoading}>
          <Radio.Group
            value={answer}
            onChange={handleOnChange}
            disabled={seconds >= 5 && showAnswer}
            style={{ width: "100%" }}
          >
            <Space direction="vertical" size="small" style={{ width: "100%" }}>
              {data?.options?.map((item, index) => (
                <div
                  key={item.option}
                  style={{
                    padding: token.paddingXS,
                    borderRadius: token.borderRadiusSM,
                    border:
                      answer === item.option
                        ? `2px solid ${token.colorPrimary}`
                        : `1px solid ${token.colorBorder}`,
                    backgroundColor:
                      answer === item.option ? token.colorPrimaryBg : "white",
                    cursor:
                      seconds >= 5 && showAnswer ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!(seconds >= 5 && showAnswer)) {
                      e.currentTarget.style.borderColor = token.colorPrimary;
                      e.currentTarget.style.backgroundColor =
                        token.colorPrimaryBg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!(seconds >= 5 && showAnswer)) {
                      e.currentTarget.style.borderColor =
                        answer === item.option
                          ? token.colorPrimary
                          : token.colorBorder;
                      e.currentTarget.style.backgroundColor =
                        answer === item.option ? token.colorPrimaryBg : "white";
                    }
                  }}
                >
                  <Radio
                    value={item.option}
                    style={{
                      fontWeight: answer === item.option ? 500 : 400,
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
              padding: token.paddingSM,
              borderRadius: token.borderRadius,
              border: `2px solid ${
                currentAnswer?.is_correct
                  ? token.colorSuccess
                  : token.colorError
              }`,
              backgroundColor: currentAnswer?.is_correct
                ? token.colorSuccessBg
                : token.colorErrorBg,
            }}
          >
            <Flex
              align="center"
              gap={token.marginXS}
              style={{ marginBottom: token.marginXS }}
            >
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: token.borderRadiusSM,
                  backgroundColor: currentAnswer?.is_correct
                    ? token.colorSuccess
                    : token.colorError,
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
                    ? token.colorSuccessText
                    : token.colorErrorText,
                }}
              >
                {currentAnswer?.is_correct ? "Benar!" : "Salah!"}
              </Text>
              <Text type="secondary">
                {currentAnswer?.is_correct ? "Anda mendapat poin" : "Coba lagi"}
              </Text>
            </Flex>

            {!currentAnswer?.is_correct && (
              <div
                style={{
                  padding: token.paddingXS,
                  borderRadius: token.borderRadiusSM,
                  backgroundColor: token.colorSuccessBg,
                  border: `1px solid ${token.colorSuccessBorder}`,
                }}
              >
                <Text style={{ color: token.colorSuccessText }}>
                  <Text strong>Jawaban benar:</Text>{" "}
                  {currentAnswer?.correct_answer}
                </Text>
              </div>
            )}
          </div>
        )}
      </Space>
    </Card>
  );
}

export default UserQuiz;
