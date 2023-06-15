import Layout from "@/components/Layout";
import React from "react";

function DetailPodcast() {
  return <div>index</div>;
}

DetailPodcast.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

DetailPodcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailPodcast;
