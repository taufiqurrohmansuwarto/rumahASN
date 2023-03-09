import { Stack } from "@mantine/core";
import { Button, Result } from "antd";
import { useRouter } from "next/router";
import CustomerAdminAgent from "./CustomerAdminAgent";
import { DetailTicket } from "./DetailTicket";
import TimelinePekerjaan from "./TimelinePekerjaan";

function StatusTicketDikerjakan({ data }) {
  const router = useRouter();
  const gotoChat = () =>
    router.push(`/tickets/${data?.id}/comments-customers-to-agents`);

  return (
    <Result
      title="Tiket mu sudah dicarikan agent"
      subTitle="Agentnya bisa langsung chat kamu di sini..."
      extra={
        <Button key="chat" onClick={gotoChat}>
          Langsung Chat
        </Button>
      }
    >
      <Stack>
        <DetailTicket data={data} />
        <TimelinePekerjaan data={data} />
        <CustomerAdminAgent data={data} />
      </Stack>
    </Result>
  );
}

export default StatusTicketDikerjakan;
