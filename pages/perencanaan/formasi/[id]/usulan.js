import PageContainer from "@/components/PageContainer";
import FormasiDetail from "@/components/PerencanaanFormasi/FormasiDetail";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const UsulanFormasi = () => {
  useScrollRestoration();
  const router = useRouter();
  const { id } = router.query;

  return (
    <>
      <Head>
        <title>Rumah ASN - Detail Formasi</title>
      </Head>
      <PageContainer
        onBack={() => router.push("/perencanaan/formasi")}
        title="Detail Formasi"
        subTitle="Kelola usulan dan lampiran formasi"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/perencanaan/formasi">Formasi</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FormasiDetail formasiId={id} activeTab="usulan" />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

UsulanFormasi.getLayout = (page) => (
  <PerencanaanFormasiLayout active="/perencanaan/formasi">
    {page}
  </PerencanaanFormasiLayout>
);

UsulanFormasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default UsulanFormasi;
