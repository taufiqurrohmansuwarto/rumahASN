import FormTest from "@/components/ChatAI/FormTest";
import CoachingMeetings from "@/components/CoachingClinic/Consultant/CoachingMeetings";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { checkStatus } from "@/services/coaching-clinics.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Empty, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const CoachingClinic = () => {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["status-coaching"],
    () => checkStatus(),
    {}
  );

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>Rumah ASN - Coaching & Mentoring</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Mentoring</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        loading={isLoading}
        title="Coaching & Mentoring"
        content="Coaching Clinic"
      >
        {!data ? (
          <>
            <Empty
              description="Maaf ya, kamu belum terdaftar sebagai instruktur untuk program coaching clinic. Segera hubungi admin ya.."
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </>
        ) : (
          <>
            <CoachingMeetings />
          </>
        )}
      </PageContainer>
    </>
  );
};

CoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

CoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic-consultant">{page}</Layout>;
};

export default CoachingClinic;
