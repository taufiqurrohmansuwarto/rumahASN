import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import { Card } from "antd";
import React from "react";

function Comments() {
  return (
    <AdminLayoutDetailWebinar active="comments">
      <Card>on the way</Card>
    </AdminLayoutDetailWebinar>
  );
}

Comments.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Comments.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Comments;