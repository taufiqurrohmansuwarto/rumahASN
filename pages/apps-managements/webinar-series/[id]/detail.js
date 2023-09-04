import Layout from "@/components/Layout";
// import AdminLayoutDetailWebinar from "@/components/WebinarSeries/AdminLayoutDetailWebinar";
import DetailWebinar from "@/components/WebinarSeries/DetailWebinar";
import { detailWebinar } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";

const AdminLayoutDetailWebinar = dynamic(
  () => import("@/components/WebinarSeries/AdminLayoutDetailWebinar"),
  { ssr: false }
);



const DetailWebinarSeries = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["webinar-series-admin-detail", router?.query?.id],
    () => detailWebinar(router?.query?.id),
    {}
  );


  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Webinar</title>
      </Head>
      <AdminLayoutDetailWebinar loading={isLoading}>
        <DetailWebinar data={data} />
      </AdminLayoutDetailWebinar>
    </>
  );
};

DetailWebinarSeries.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/webinar-series">{page}</Layout>;
};

DetailWebinarSeries.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default DetailWebinarSeries;
