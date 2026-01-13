import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";

const UsulanFormasi = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Usulan Formasi</title>
      </Head>
      <PageContainer
        title="Usulan Formasi"
        subTitle="Daftar usulan formasi perencanaan"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/perencanaan/formasi/[id]/usulan">Usulan Formasi</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

UsulanFormasi.getLayout = (page) => (
  <PerencanaanFormasiLayout active="/perencanaan/formasi">{page}</PerencanaanFormasiLayout>
);

UsulanFormasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default UsulanFormasi;

