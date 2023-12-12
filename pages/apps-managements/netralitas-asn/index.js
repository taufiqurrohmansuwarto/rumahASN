import Layout from "@/components/Layout";

const NetralitasAsn = () => {
  return <div>hello world</div>;
};

NetralitasAsn.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

NetralitasAsn.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default NetralitasAsn;
