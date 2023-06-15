import Layout from "@/components/Layout";
import React from "react";

function CreatePodcast() {
  return <div>index</div>;
}

CreatePodcast.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

CreatePodcast.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default CreatePodcast;
