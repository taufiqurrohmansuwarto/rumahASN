import Layout from "@/components/Layout";
import React from "react";

function Podcast() {
  return <div>index</div>;
}

Podcast.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

Podcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Podcast;
