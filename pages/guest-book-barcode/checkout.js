import PageContainer from "@/components/PageContainer";
import CheckInCheckOutLayout from "@/components/GuestBook/CheckInCheckOutLayout";
import CheckoutPublic from "@/components/GuestBook/CheckoutPublic";
import Head from "next/head";
import { Grid } from "antd";
function GuestBookBarcodeCheckout() {
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Buku Tamu - Keluar Tamu</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        title="Keluar Tamu"
      >
        <CheckInCheckOutLayout active="checkout">
          <CheckoutPublic />
        </CheckInCheckOutLayout>
      </PageContainer>
    </>
  );
}

export default GuestBookBarcodeCheckout;
