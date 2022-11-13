import { Stack } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, message, Popconfirm, Result } from "antd";
import { kerjakanTicket } from "../../services/agents.services";
import { DetailTicket } from "./DetailTicket";
import TimelinePekerjaan from "./TimelinePekerjaan";

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
    <Result
      title="Pengerjaan Ticket"
      subTitle={`${data?.admin?.username} telah memilih anda untuk mengerjakan tiket`}
      extra={[
        <Popconfirm
          key="kerjakan"
          title="Yakin ingin mengerjakan?"
          onConfirm={handleKerjakan}
        >
          <Button type="primary" loading={isLoading}>
            Kerjakan
          </Button>
        </Popconfirm>,
      ]}
    >
      <Stack>
        <DetailTicket data={data} />
        <TimelinePekerjaan data={data} />
      </Stack>
    </Result>
  );
}

export default AgentKerjakan;
