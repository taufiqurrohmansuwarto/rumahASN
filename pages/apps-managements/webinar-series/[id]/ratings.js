import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import WebinarRatings from "@/components/WebinarSeries/WebinarRating";
import { getRatingAdmin } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

function Ratings() {
  const router = useRouter();
  const { id } = router?.query;

  const { data, isLoading } = useQuery(
    ["webinar-series-ratings", id],
    () => getRatingAdmin(id),
    {}
  );

  return (
    <AdminLayoutDetailWebinar loading={isLoading} active="ratings">
      <WebinarRatings data={data} />
    </AdminLayoutDetailWebinar>
  );
}

Ratings.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

Ratings.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Ratings;
