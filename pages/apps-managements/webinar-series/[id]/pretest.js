import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import AdminPretest from "@/components/WebinarSeries/AdminPretest";
import { Card } from "antd";

function Pretest() {
  return (
    <AdminLayoutDetailWebinar active="pretest">
      <Card>
        <AdminPretest />
      </Card>
    </AdminLayoutDetailWebinar>
  );
}

Pretest.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Pretest.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Pretest;
