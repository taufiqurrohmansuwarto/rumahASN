import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";
import GuestBookCheckIn from "@/components/GuestBook/GuestBookCheckIn";

function CheckIn() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Buku Tamu</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Check In"
      >
        <GuestBookCheckIn />
      </PageContainer>
    </>
  );
}

CheckIn.Auth = {
  action: "manage",
  subject: "CheckIn",
};

CheckIn.getLayout = function getLayout(page) {
  return <GuestBookLayout active="check-in">{page}</GuestBookLayout>;
};

export default CheckIn;
