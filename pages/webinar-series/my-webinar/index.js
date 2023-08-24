import Layout from "@/components/Layout";
import Head from "next/head";

function MyWebinar() {
  return (
    <>
      <Head>
        <title>My Webinar</title>
      </Head>
    </>
  );
}

MyWebinar.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

MyWebinar.Auth = {
  action: "manage",
  subject: "tickets",
};

export default MyWebinar;
