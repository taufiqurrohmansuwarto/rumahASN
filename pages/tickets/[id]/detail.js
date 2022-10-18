import { useRouter } from "next/router";
import Layout from "../../../src/components/Layout";
import PageContainer from "../../../src/components/PageContainer";
import { useQuery } from "@tanstack/react-query";
import { detailTicket } from "../../../services/users.services";

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
    <PageContainer title="Detail Tiket" onBack={() => router.back()}>
      <h1>Detail Ticket {id}</h1>
      {JSON.stringify(data)}
    </PageContainer>
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
