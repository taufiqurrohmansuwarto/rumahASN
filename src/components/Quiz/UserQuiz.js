import { answerQuiz, getScore, getUserQuiz } from "@/services/quiz.services";
import { QuestionCircleFilled } from "@ant-design/icons";
import { Progress } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Radio, Space, Spin, Tag, Tooltip, Typography } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Extra = () => {
  const { data, isLoading } = useQuery(["user-score"], () => getScore(), {});
  const router = useRouter();

  const gotoQuiz = () => router.push("/quiz");

  return (
    <Spin spinning={isLoading}>
      <Space>
        <Tag color="green">{data?.score || 0} pts</Tag>
        <Tooltip title="Lihat Peringkat Kuis?">
          <QuestionCircleFilled
            onClick={gotoQuiz}
            style={{
              cursor: "pointer",
            }}
          />
        </Tooltip>
      </Space>
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
      }, 3000); // Tunggu selama 3 detik sebelum refetch
    }

    return () => clearTimeout(timer); // Clear timeout untuk mencegah memory leak
  }, [seconds, showAnswer, data?.id, answer, submitAnswer, refetch]);

  return (
    <Card
      title={<Typography.Text>Kuis Kepegawaian</Typography.Text>}
      extra={<Extra />}
    >
      <Space direction="vertical">
        <Typography.Text disabled>
          Waktu tersisa: {5 - seconds} detik
        </Typography.Text>
        <Progress
          striped
          animate
          color="red"
          value={seconds === 0 ? 0 : (seconds / 5) * 100}
        />
        <Typography.Text strong>{data?.question}</Typography.Text>
        <Spin spinning={isFetching || isLoading}>
          <Space direction="vertical">
            <Radio.Group
              value={answer}
              onChange={handleOnChange}
              disabled={seconds >= 5 && showAnswer}
            >
              <Space direction="vertical">
                {data?.options?.map((item) => (
                  <Radio key={item.option} value={item.option}>
                    <span>{item.text}</span>
                  </Radio>
                ))}
              </Space>
            </Radio.Group>
          </Space>
        </Spin>
        {showAnswer && (
          <Space direction="vertical">
            <Tag color={currentAnswer?.is_correct ? "green" : "red"}>
              {currentAnswer?.is_correct ? "BENAR" : "SALAH"}
            </Tag>
            <>
              {!currentAnswer?.is_correct && (
                <>
                  <Tag color="green">{currentAnswer?.correct_answer}</Tag>
                </>
              )}
            </>
          </Space>
        )}
      </Space>
    </Card>
  );
}

export default UserQuiz;
