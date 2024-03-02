import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import { Card } from "antd";

function Posttest() {
  return (
    <AdminLayoutDetailWebinar active="posttest">
      <Card></Card>
    </AdminLayoutDetailWebinar>
  );
}

Posttest.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Posttest.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Posttest;
