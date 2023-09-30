import Layout from "@/components/Layout";
import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import DownloadRating from "@/components/WebinarSeries/DownloadRating";
import WebinarRatings from "@/components/WebinarSeries/WebinarRating";
import { getRatingAdmin } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";

function Ratings() {
  const router = useRouter();
  const { id } = router?.query;

  const { data, isLoading, isFetching } = useQuery(
    ["webinar-series-ratings", router?.query],
    () => getRatingAdmin(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

  return (
    <AdminLayoutDetailWebinar loading={isLoading} active="ratings">
      <DownloadRating id={id} />
      <WebinarRatings loadingRating={isLoading || isFetching} data={data} />
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
