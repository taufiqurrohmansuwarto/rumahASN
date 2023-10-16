import { answerQuiz, getUserQuiz } from "@/services/quiz.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, Radio, Space, Tag, Typography } from "antd";
import React, { useEffect, useState } from "react";

function UserQuiz() {
  const { data, refetch } = useQuery(["user-quiz"], () => getUserQuiz(), {
    refetchOnWindowFocus: false,
  });

  const [seconds, setSeconds] = useState(0);
  const [answer, setAnswer] = useState(null);
  const [currentAnswer, setCurrentAnswer] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const { mutate: submitAnswer } = useMutation((data) => answerQuiz(data), {
    onSuccess: (x) => {
      setCurrentAnswer(x);
      setShowAnswer(true);
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
    <Card>
      <Space direction="vertical">
        <Typography.Text disabled>
          Waktu tersisa: {5 - seconds} detik
        </Typography.Text>
        <Typography.Text>{data?.question}</Typography.Text>
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
        {showAnswer && (
          <Space>
            <Tag color={currentAnswer?.is_correct ? "green" : "red"}>
              {currentAnswer?.is_correct ? "BENAR" : "SALAH"}
            </Tag>
            <>
              {!currentAnswer?.is_correct && (
                <>
                  Jawaban yang benar:{" "}
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
