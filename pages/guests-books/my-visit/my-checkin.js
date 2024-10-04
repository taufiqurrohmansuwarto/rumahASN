import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function MyCheckin() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Tamu Check In</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Tamu Check In"
        content="Tamu Check In"
      ></PageContainer>
    </>
  );
}

MyCheckin.Auth = {
  action: "manage",
  subject: "GuestBook",
};

MyCheckin.getLayout = function getLayout(page) {
  return <GuestBookLayout active="my-checkin">{page}</GuestBookLayout>;
};

export default MyCheckin;
