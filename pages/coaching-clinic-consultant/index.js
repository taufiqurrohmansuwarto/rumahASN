import CoachingMeetings from "@/components/CoachingClinic/Consultant/CoachingMeetings";
import CreateCoaching from "@/components/CoachingClinic/Consultant/CreateCoaching";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { checkStatus, findMeeting } from "@/services/coaching-clinics.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Empty } from "antd";
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

  const handleCreate = () => router.push("/coaching-clinic/consults");

  const { data: meetings, isLoading: isloadingMeeting } = useQuery(
    ["meetings", router?.query],
    () => findMeeting(router?.query)
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Instruktur Coaching Clinic</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Consultant Coaching Clinic</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        loading={isLoading}
        title="Coaching Clinic"
        content="Jadwal Konsultasi Online"
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
            {/* <CreateCoaching /> */}
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
