import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function MyCheckout() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Tamu Check Out</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Tamu Check Out"
        content="Tamu Check Out"
      ></PageContainer>
    </>
  );
}

MyCheckout.Auth = {
  action: "manage",
  subject: "GuestBook",
};

MyCheckout.getLayout = function getLayout(page) {
  return <GuestBookLayout active="my-checkout">{page}</GuestBookLayout>;
};

export default MyCheckout;
