import Layout from "@/components/Layout";
import AnomaliMainPages from "@/components/Anomali/AnomaliMainPages";
import Head from "next/head";

function AnomaliData2023() {
  return (
    <>
      <Head>
        <title>Anomali Data 2023</title>
      </Head>
      <AnomaliMainPages />
    </>
  );
}

AnomaliData2023.getLayout = function getLayout(page) {
  return <Layout active="/apps-managements/anomali-data-2023">{page}</Layout>;
};

AnomaliData2023.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default AnomaliData2023;
