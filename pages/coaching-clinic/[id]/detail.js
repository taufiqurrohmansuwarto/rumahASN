import DetailMeetingParticipant from "@/components/CoachingClinic/Participant/DetailMeetingParticipant";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { detailMeetingParticipant } from "@/services/coaching-clinics.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DetailCoachingClinic = () => {
  const router = useRouter();
  const { id } = router.query;
  const breakPoint = Grid.useBreakpoint();

  const { data, isLoading } = useQuery(
    ["detailMeetingParticipant", id],
    () => detailMeetingParticipant(id),
    {
      enabled: !!id,
    }
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Coaching Clinic</title>
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
              <Link href="/coaching-clinic">
                <a>Daftar Mentoring</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail Coaching Clinic</Breadcrumb.Item>
          </Breadcrumb>
        )}
        loading={isLoading}
        title="Detail Mentoring"
      >
        <DetailMeetingParticipant />
      </PageContainer>
    </>
  );
};

DetailCoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

DetailCoachingClinic.getLayout = (page) => {
  return <Layout active={"/coaching-clinic/all"}>{page}</Layout>;
};

export default DetailCoachingClinic;
