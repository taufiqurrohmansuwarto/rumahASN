import { Result } from "antd";

function StatusTicketDiajukan({ data }) {
  return (
    <Result
      title="Tiket sedang dicarikan agent"
      subTitle="Status tiketmu masih dicarikan agent ya... Mohon bersabar"
    >
      <div>Ini untuk deskripsi tiket</div>
      {JSON.stringify(data)}
    </Result>
  );
}

export default StatusTicketDiajukan;
