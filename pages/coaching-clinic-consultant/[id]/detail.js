import DetailCoachingMeeting from "@/components/CoachingClinic/Consultant/DetailCoachingMeeting";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DetailCoachingClinic = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Rumah ASN - Instruktur Coaching Clinic</title>
      </Head>
      <PageContainer
        onBack={() => router?.back()}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/coaching-clinic-consultant">
                <a>Coaching Clinic</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail Coaching Clinic</Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Coaching Clinic"
        content="Detail Konsultasi Coaching Clinic"
      >
        <DetailCoachingMeeting />
      </PageContainer>
    </>
  );
};

DetailCoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

DetailCoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic-consultant">{page}</Layout>;
};

export default DetailCoachingClinic;
