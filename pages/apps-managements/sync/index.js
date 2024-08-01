import Layout from "@/components/Layout";

const Sync = () => {
  return <div>Hello world</div>;
};

Sync.getLayout = (page) => <Layout>{page}</Layout>;

Sync.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Sync;
