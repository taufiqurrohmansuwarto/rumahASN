import PageContainer from "@/components/PageContainer";
import FormasiList from "@/components/PerencanaanFormasi/FormasiUsulanList";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getFormasiById } from "@/services/perencanaan-formasi.services";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

const DetailFormasiPage = () => {
  useScrollRestoration();
  const router = useRouter();
  const { id } = router.query;

  const { data: formasi, isLoading } = useQuery(
    ["perencanaan-formasi-detail", id],
    () => getFormasiById(id),
    { enabled: !!id }
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Formasi</title>
      </Head>
      <PageContainer
        title={formasi?.deskripsi || "Detail Formasi"}
        subTitle={`Kelola pengajuan formasi tahun ${formasi?.tahun || "..."}`}
        loading={isLoading}
        onBack={() => router.push("/perencanaan/formasi")}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/perencanaan/formasi">Formasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
               {formasi?.deskripsi || "Detail Formasi"}
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FormasiList formasiId={id} formasi={formasi} />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

DetailFormasiPage.getLayout = (page) => (
  <PerencanaanFormasiLayout active="/perencanaan/formasi">
    {page}
  </PerencanaanFormasiLayout>
);

DetailFormasiPage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DetailFormasiPage;
