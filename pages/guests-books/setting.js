import GuestBookLayout from "@/components/GuestBook/GuestBookLayout";
import PageContainer from "@/components/PageContainer";
import { Grid } from "antd";
import Head from "next/head";

function GuestBookSetting() {
  const breakPoint = Grid.useBreakpoint();
  return (
    <>
      <Head>
        <title>Rumah ASN - Pengaturan</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint?.xs ? 0 : null,
        }}
        title="Pengaturan"
        content="Pengaturan"
      ></PageContainer>
    </>
  );
}

GuestBookSetting.Auth = {
  action: "manage",
  subject: "GuestBook",
};

GuestBookSetting.getLayout = function getLayout(page) {
  return <GuestBookLayout active="setting">{page}</GuestBookLayout>;
};

export default GuestBookSetting;
