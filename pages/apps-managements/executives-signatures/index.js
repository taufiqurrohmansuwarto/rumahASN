import Layout from "@/components/Layout";
import React from "react";

function ExecutivesSignatures() {
  return <div>index</div>;
}

ExecutivesSignatures.getLayout = (page) => {
  return <Layout>{page}</Layout>;
};

ExecutivesSignatures.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default ExecutivesSignatures;
