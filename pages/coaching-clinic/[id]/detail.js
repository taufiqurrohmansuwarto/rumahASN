import DetailMeetingParticipant from "@/components/CoachingClinic/Participant/DetailMeetingParticipant";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { detailMeetingParticipant } from "@/services/coaching-clinics.services";
import { useQuery } from "@tanstack/react-query";
import { Alert, Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const DetailCoachingClinic = () => {
  const router = useRouter();
  const { id } = router.query;

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
                <a>Coaching Clinic</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail Coaching Clinic</Breadcrumb.Item>
          </Breadcrumb>
        )}
        loading={isLoading}
        title="Coaching Clinic"
      >
        <Alert
          style={{
            marginBottom: 10,
          }}
          showIcon
          message="Perhatian layanan coaching clinic dipindahtugaskan ke zoom."
          description={
            <div
              dangerouslySetInnerHTML={{
                __html: `<p>Bergabung Zoom Rapat
<a href="https://us06web.zoom.us/j/87259201447?pwd=adabHFxbkc4R05kTVJ0NzlqTVdFRngrUT09">https://us06web.zoom.us/j/87259201447?pwd=adabHFxbkc4R05kTVJ0NzlqTVdFRngrUT09</a></p>
<p>ID Rapat: 872 5920 1447
Kode Sandi: bkdjatim</p>
`,
              }}
            />
          }
          type="error"
        />
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
