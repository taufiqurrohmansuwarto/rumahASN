import Layout from "../../../src/components/Layout";
import PageContainer from "../../../src/components/PageContainer";

const DetailTicket = () => {
  return <PageContainer title="Komentar Tiket"></PageContainer>;
};

DetailTicket.Auth = {
  action: "manage",
  subject: "Tickets",
};

DetailTicket.getLayout = function (page) {
  return <Layout active={"/tickets"}>{page}</Layout>;
};

export default DetailTicket;
