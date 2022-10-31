import { Button, Result } from "antd";
import { useRouter } from "next/router";

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
      <div>Ini untuk deskripsi tiket</div>
      <div>{JSON.stringify(data)}</div>
    </Result>
  );
}

export default StatusTicketDikerjakan;
