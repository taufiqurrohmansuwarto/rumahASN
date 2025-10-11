import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import SpecimenForm from "@/components/EsignBKD/SpecimenForm";
import Head from "next/head";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Link from "next/link";

const ProfilePage = () => {
  return (
    <>
      <Head>
        <title>Rumah ASN - E-Sign BKD - Profil</title>
      </Head>
      <PageContainer
        title="Profil"
        content="Daftar permintaan tanda tangan yang memerlukan tindakan Anda"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/esign-bkd">Dashboard E-Sign BKD</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Profil</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <SpecimenForm />
      </PageContainer>
    </>
  );
};

ProfilePage.Auth = {
  action: "manage",
  subject: "tickets",
};

ProfilePage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/profile">{page}</EsignBKDLayout>;
};

export default ProfilePage;
