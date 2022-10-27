import { useRouter } from "next/router";
import ActiveLayout from "../../../src/components/ActiveLayout";
import Layout from "../../../src/components/Layout";

const DetailTicket = () => {
  const router = useRouter();
  const { id } = router?.query;
  return (
    <ActiveLayout
      id={id}
      active="comments-customers-to-agents"
      role="requester"
    >
      <div>hello world</div>
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
