import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import SyncUpdateData from "@/components/Rekon/SyncUpdateData";
import Head from "next/head";

const UpdateData = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekon - Update Data</title>
      </Head>
      <PageContainer title="Rekon" content="Update Data">
        <SyncUpdateData />
      </PageContainer>
    </>
  );
};

UpdateData.getLayout = (page) => {
  return <RekonLayout active="/rekon/update-data">{page}</RekonLayout>;
};

UpdateData.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default UpdateData;
