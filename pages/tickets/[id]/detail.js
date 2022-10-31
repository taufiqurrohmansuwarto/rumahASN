import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "antd";
import { useRouter } from "next/router";
import { detailTicket } from "../../../services/users.services";
import ActiveLayout from "../../../src/components/ActiveLayout";
import Layout from "../../../src/components/Layout";
import StatusTicketDiajukan from "../../../src/components/StatusTicketDiajukan";
import StatusTicketDikerjakan from "../../../src/components/StatusTicketDikerjakan";
import StatusTicketSelesai from "../../../src/components/StatusTicketSelesai";

const Status = ({ data }) => {
  if (data?.status_code === "DIAJUKAN") {
    return <StatusTicketDiajukan data={data} />;
  } else if (data?.status_code === "SELESAI") {
    return <StatusTicketSelesai data={data} />;
  } else if (data?.status_code === "DIKERJAKAN") {
    return <StatusTicketDikerjakan data={data} />;
  }
};

const DetailTicket = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["tickets", router.query.id],
    () => detailTicket(router.query.id),
    {
      enabled: !!router.query.id,
    }
  );

  return (
    <ActiveLayout loading={isLoading} active="detail" id={id} role="requester">
      <Skeleton loading={isLoading}>
        <Status data={data} />
      </Skeleton>
    </ActiveLayout>
  );
};

DetailTicket.Auth = {
  action: "manage",
  subject: "Tickets",
};

DetailTicket.getLayout = function (page) {
  return <Layout active={"/tickets"}>{page}</Layout>;
};

export default DetailTicket;
