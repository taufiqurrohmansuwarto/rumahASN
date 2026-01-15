import PageContainer from "@/components/PageContainer";
import FormasiUsulanDetail from "@/components/PerencanaanFormasi/FormasiUsulanDetail";
import LampiranList from "@/components/PerencanaanFormasi/LampiranList";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";
import { getFormasiUsulanById } from "@/services/perencanaan-formasi.services";
import { Breadcrumb, FloatButton, Skeleton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

const SubmissionLampiranPage = () => {
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
        <title>Rumah ASN - Detail Pengajuan (Lampiran)</title>
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
        <FormasiUsulanDetail data={submission} activeTab="lampiran">
          <div style={{ marginTop: 16 }}>
            <LampiranList
              formasiId={id}
              formasiUsulanId={fuId}
              formasi={submission.formasi}
              submissionStatus={submission.status}
            />
          </div>
        </FormasiUsulanDetail>

        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

SubmissionLampiranPage.getLayout = (page) => (
  <PerencanaanFormasiLayout active="/perencanaan/formasi">
    {page}
  </PerencanaanFormasiLayout>
);

SubmissionLampiranPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default SubmissionLampiranPage;
