import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import DetailWebinarParticipants from "@/components/WebinarSeries/DetailWebinarParticipants";
import { Card } from "antd";
import Head from "next/head";
import React from "react";

function Participants() {
  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Series - Daftar Peserta Webinar</title>
      </Head>
      <AdminLayoutDetailWebinar active="participants">
        <DetailWebinarParticipants />
      </AdminLayoutDetailWebinar>
    </>
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
