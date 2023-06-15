import Layout from "@/components/Layout";
import React from "react";

function UpdatePodcast() {
  return <div>index</div>;
}

UpdatePodcast.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

UpdatePodcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default UpdatePodcast;
