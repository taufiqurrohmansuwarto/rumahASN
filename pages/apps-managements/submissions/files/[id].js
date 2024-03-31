import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailKamusUsulan from "@/components/Usulan/DetailKamusUsulan";
import FormKamusUsulanFile from "@/components/Usulan/FormKamusUsulanFile";
import { detailSubmissionsFileRefs } from "@/services/submissions.services";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useRouter } from "next/router";

const SubmissionFileDetail = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["sumbissions-file-detail", router.query.id],
    () => detailSubmissionsFileRefs(router.query.id),
    {}
  );

  const handleBack = () => {
    router.back();
  };

  return (
    <>
      <Head>
        <title>Submission Reference</title>
      </Head>
      <PageContainer
        onBack={handleBack}
        title="Detail Kamus Usulan"
        content="Detail Kamus Usulan ASN"
      >
        <FormKamusUsulanFile data={data} type="edit" />
      </PageContainer>
    </>
  );
};

SubmissionFileDetail.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

SubmissionFileDetail.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/submissions">{page}</Layout>;
};

export default SubmissionFileDetail;
