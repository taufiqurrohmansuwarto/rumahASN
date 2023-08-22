import { pollForUser } from "@/services/polls.services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Radio, Skeleton, Space, Typography } from "antd";
import React, { useState } from "react";

const Poll = ({ data }) => {
  const [value, setValue] = useState(null);

  return (
    <Stack>
      <Typography.Text>{data?.question}</Typography.Text>
      <Radio.Group>
        <Space direction="vertical">
          {data?.answers?.map((answer) => (
            <Radio key={answer?.id} value={answer?.id}>
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
    <Skeleton loading={isLoading}>
      {data?.map((item) => (
        <Poll key={item?.id} data={item} />
      ))}
    </Skeleton>
  );
}

export default UserPolls;
