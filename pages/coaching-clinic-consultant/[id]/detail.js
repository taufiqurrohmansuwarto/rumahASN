import DetailCoachingMeeting from "@/components/CoachingClinic/Consultant/DetailCoachingMeeting";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DetailCoachingClinic = () => {
  const router = useRouter();
  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Instruktur Coaching Clinic</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
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
                <a>Mentoring</a>
              </Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
        title="Coaching & Mentoring"
        content="Detail Coaching & Mentoring"
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
