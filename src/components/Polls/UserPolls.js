import { pollForUser, votePolling } from "@/services/polls.services";
import { Stack } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Badge, Card, Radio, Skeleton, Space, Typography } from "antd";
import React, { useState } from "react";

const Poll = ({ data }) => {
  const { mutate, isLoading } = useMutation((data) => votePolling(data), {
    onSuccess: () => {
      // queryClient.invalidateQueries("users-polls");
    },
  });

  const handleChange = (id, data) => {
    const currentData = {
      poll_id: data?.id,
      answer_id: id,
    };

    // setValue(value);
    mutate(currentData);
  };

  return (
    <Stack>
      <Typography.Text>{data?.question}</Typography.Text>
      <Radio.Group defaultValue={data?.vote}>
        <Space direction="vertical">
          {data?.answers?.map((answer) => (
            <Radio
              onChange={() => handleChange(answer?.id, data)}
              key={answer?.id}
              value={answer?.id}
            >
              {answer?.answer}
            </Radio>
          ))}
        </Space>
      </Radio.Group>
    </Stack>
  );
};

function UserPolls() {
  const { data, isLoading } = useQuery(
    ["users-polls"],
    () => pollForUser(),
    {}
  );
  return (
    <>
      {data?.length > 0 ? (
        <Badge.Ribbon text="Voting BKD" color="pink">
          <Card title="Pertanyaan">
            <Skeleton loading={isLoading}>
              {data?.map((item) => (
                <Poll key={item?.id} data={item} />
              ))}
            </Skeleton>
          </Card>
        </Badge.Ribbon>
      ) : null}
    </>
  );
}

export default UserPolls;
