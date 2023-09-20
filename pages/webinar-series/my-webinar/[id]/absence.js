import Layout from "@/components/Layout";
import WebinarRatings from "@/components/WebinarSeries/WebinarRating";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import { getRatingForUser } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import { useRouter } from "next/router";

function WebinarAbsence() {
  const router = useRouter();

  const { id } = router?.query;

  return (
    <WebinarUserDetailLayout active="absence">
      <Card>On The Way</Card>
    </WebinarUserDetailLayout>
  );
}

WebinarAbsence.Auth = {
  action: "manage",
  subject: "tickets",
};

WebinarAbsence.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

export default WebinarAbsence;
