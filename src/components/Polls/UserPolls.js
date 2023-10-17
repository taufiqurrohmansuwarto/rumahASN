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
} from "antd";
import { useEffect } from "react";

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
        <Badge.Ribbon text="Kami Butuh Suaramu!" color="green">
          <Card title="Yuk Ikutan Voting!">
            <List
              dataSource={data}
              loading={isLoading}
              renderItem={(item) => (
                <Stack mb={16}>
                  <Poll data={item} />
                </Stack>
              )}
            />
          </Card>
        </Badge.Ribbon>
      ) : null}
    </>
  );
}

export default UserPolls;
