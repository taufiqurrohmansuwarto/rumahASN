import PageContainer from "@/components/PageContainer";
import FormasiUsulanDetail from "@/components/PerencanaanFormasi/FormasiUsulanDetail";
import UsulanList from "@/components/PerencanaanFormasi/UsulanList";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getFormasiUsulanById } from "@/services/perencanaan-formasi.services";
import { Breadcrumb, FloatButton, Skeleton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

const SubmissionUsulanPage = () => {
  useScrollRestoration();
  const router = useRouter();
  const { id, fuId } = router.query;

  const { data: submission, isLoading } = useQuery(
    ["perencanaan-formasi-usulan-detail", fuId],
    () => getFormasiUsulanById(fuId),
    { enabled: !!fuId }
  );

  if (isLoading) {
    return (
      <PerencanaanFormasiLayout active="/perencanaan/formasi">
        <PageContainer title="Memuat...">
          <Skeleton active />
        </PageContainer>
      </PerencanaanFormasiLayout>
    );
  }

  if (!submission) return null;

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Pengajuan (Usulan)</title>
      </Head>
      <PageContainer
        title="Detail Pengajuan"
        onBack={() => router.push(`/perencanaan/formasi/${id}`)}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/perencanaan/formasi">Formasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href={`/perencanaan/formasi/${id}`}>Daftar Pengajuan</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FormasiUsulanDetail data={submission} activeTab="usulan">
          <div style={{ marginTop: 16 }}>
            <UsulanList
              formasiId={id}
              formasiUsulanId={fuId}
              submissionStatus={submission.status}
              submissionData={submission}
            />
          </div>
        </FormasiUsulanDetail>

        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

SubmissionUsulanPage.getLayout = (page) => (
  <PerencanaanFormasiLayout active="/perencanaan/formasi">
    {page}
  </PerencanaanFormasiLayout>
);

SubmissionUsulanPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SubmissionUsulanPage;
