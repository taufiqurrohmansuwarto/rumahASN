import { Alert as AlertMantineCore, Text, Title } from "@mantine/core";
import { IconAlertOctagon } from "@tabler/icons";
import { Button, Result } from "antd";
import { useRouter } from "next/router";
import TimelinePekerjaan from "./TimelinePekerjaan";

function StatusTicketDikerjakan({ data }) {
  const router = useRouter();
  const gotoChat = () =>
    router.push(`/tickets/${data?.id}/comments-customers-to-agents`);

  return (
    <Result
      title="Tiket mu sudah dicarikan agent"
      subTitle="ini agentnya kamu bisa langsung chat dengan agent ya apabila ada pertanyaan..."
      extra={
        <Button key="chat" onClick={gotoChat}>
          Langsung Chat
        </Button>
      }
    >
      <AlertMantineCore
        icon={<IconAlertOctagon />}
        title="Dah.. tiketmu sedang dikerjakan"
        color="green"
      >
        <Title>{data?.title}</Title>
        <Text>{data?.content}</Text>
        <TimelinePekerjaan data={data} />
      </AlertMantineCore>
    </Result>
  );
}

export default StatusTicketDikerjakan;
