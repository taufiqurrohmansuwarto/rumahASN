import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { detailWebinar } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";

const FormEditWebinarSeries = () => {};

const UpdateWebinarSeries = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["webinar-series", id],
    () => detailWebinar(id),
    {}
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Update Webinar Series</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title="Rumah ASN"
        content="Edit Webinar Series"
      >
        {JSON.stringify(data)}
      </PageContainer>
    </>
  );
};

UpdateWebinarSeries.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

UpdateWebinarSeries.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default UpdateWebinarSeries;
