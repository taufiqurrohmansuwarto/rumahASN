import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import React from "react";

function Participants() {
  return (
    <AdminLayoutDetailWebinar active="participants">
      <div>participants</div>
    </AdminLayoutDetailWebinar>
  );
}

Participants.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Participants.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Participants;
