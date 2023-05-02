import Layout from "@/components/Layout";

const Mail = () => {
  return <div>Mail</div>;
};

Mail.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Mail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Mail;
