import Layout from "@/components/Layout";

const DetailWebinarSeries = () => {};

DetailWebinarSeries.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

DetailWebinarSeries.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailWebinarSeries;
