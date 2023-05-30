import Layout from "@/components/Layout";
import Head from "next/head";
import React from "react";

function Votes() {
  return (
    <>
      <Head>
        <title>Voting</title>
      </Head>
    </>
  );
}

Votes.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Votes.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Votes;
