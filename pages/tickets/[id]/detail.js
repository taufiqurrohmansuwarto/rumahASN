import Layout from "../../../src/components/Layout";
import PageContainer from "../../../src/components/PageContainer";

const DetailTicket = () => {
  const router = useRouter();
  const { id } = router.query;
  return <PageContainer>{JSON.stringify(id)}</PageContainer>;
};

DetailTicket.Auth = {
  action: "manage",
  subject: "Tickets",
};

DetailTicket.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

export default DetailTicket;
