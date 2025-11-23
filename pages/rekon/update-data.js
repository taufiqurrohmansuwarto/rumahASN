import PageContainer from "@/components/PageContainer";
import RekonLayout from "@/components/Rekon/RekonLayout";
import SyncUpdateData from "@/components/Rekon/SyncUpdateData";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const UpdateData = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - Rekonisiliasi - Pembaruan Data</title>
      </Head>
      <PageContainer
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Rekonisiliasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/rekon/dashboard">Dashboard</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Pembaruan Data</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Pembaruan Data Rekonisiliasi"
        content="Sinkronisasi dan update data pegawai"
        subTitle="Lakukan pembaruan data kepegawaian secara berkala dengan sistem SIASN"
      >
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
