import Layout from "../../../src/components/Layout";
import PageContainer from "../../../src/components/PageContainer";

const UpdateTicket = () => {
  const router = useRouter();
  const { id } = router.query;
  return <PageContainer>{JSON.stringify(id)}</PageContainer>;
};

UpdateTicket.Auth = {
  action: "manage",
  subject: "Tickets",
};

UpdateTicket.getLayout = function (page) {
  return <Layout>{page}</Layout>;
};

export default UpdateTicket;
