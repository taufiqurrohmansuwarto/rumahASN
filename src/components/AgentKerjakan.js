import { Alert, Title, Text, Button } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import { kerjakanTicket } from "../../services/agents.services";

function AgentKerjakan({ data }) {
  const queryClient = useQueryClient();

  const { mutate: kerjakan, isLoading } = useMutation(
    (data) => kerjakanTicket(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries(["agent-tickets", data?.id]),
      onSuccess: () => {
        queryClient.invalidateQueries(["agent-tickets", data?.id]),
          message.success("Berhasil mengambil pekerjaan");
      },
      onError: () => message.error("Gagal mengambil pekerjaan"),
    }
  );

  const handleKerjakan = () => kerjakan(data?.id);

  return (
    <Alert title="Hehehe">
      {data?.admin?.username} memberikan tiket ini untuk anda kerjakan
      <Title>{data?.title}</Title>
      <Text>{data?.content}</Text>
      <Button onClick={handleKerjakan}>Kerjakan</Button>
    </Alert>
  );
}

export default AgentKerjakan;
