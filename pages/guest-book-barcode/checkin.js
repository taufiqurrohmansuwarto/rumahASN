import CheckInCheckOutLayout from "@/components/GuestBook/CheckInCheckOutLayout";
import CheckinPublic from "@/components/GuestBook/CheckinPublic";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function GuestBookBarcodeCheckin() {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Buku Tamu - Kedatangan Tamu</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Kedatangan Tamu"
      >
        <CheckInCheckOutLayout active="checkin">
          <CheckinPublic />
        </CheckInCheckOutLayout>
      </PageContainer>
    </>
  );
}

export default GuestBookBarcodeCheckin;
