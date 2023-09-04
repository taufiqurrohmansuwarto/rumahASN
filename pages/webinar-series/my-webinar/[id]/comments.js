import Layout from "@/components/Layout";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import React from "react";

function WebinarComments() {
  return (
    <WebinarUserDetailLayout active="comments">
      <div>comments</div>
    </WebinarUserDetailLayout>
  );
}

WebinarComments.Auth = {
  action: "manage",
  subject: "tickets",
};

WebinarComments.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

export default WebinarComments;
