import Layout from "@/components/Layout";
import Head from "next/head";
import React from "react";

function Announcements() {
  return (
    <>
      <Head>
        <title>Pengumuman</title>
      </Head>
    </>
  );
}

Announcements.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Announcements.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Announcements;
