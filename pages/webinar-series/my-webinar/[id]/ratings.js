import Layout from "@/components/Layout";
import WebinarRatings from "@/components/WebinarSeries/WebinarRating";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import { getRatingForUser } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

function WebinarComments() {
  const router = useRouter();

  const { id } = router?.query;

  const { data, isLoading } = useQuery(
    ["webinar-user-rating", id],
    () => getRatingForUser(id),
    {}
  );

  return (
    <WebinarUserDetailLayout loading={isLoading} active="ratings">
      <WebinarRatings data={data} />
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