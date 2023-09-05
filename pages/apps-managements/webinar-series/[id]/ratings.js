import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import { Card } from "antd";
import React from "react";

function Ratings() {
  return (
    <AdminLayoutDetailWebinar active="ratings">
      <Card>on the way</Card>
    </AdminLayoutDetailWebinar>
  );
}

Ratings.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Ratings.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Ratings;
