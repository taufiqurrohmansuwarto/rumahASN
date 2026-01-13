import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";

const LampiranFormasi = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Lampiran Formasi</title>
      </Head>
      <PageContainer
        title="Lampiran Formasi"
        subTitle="Daftar lampiran formasi perencanaan"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/perencanaan/formasi/[id]">Lampiran Formasi</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

LampiranFormasi.getLayout = (page) => (
  <PerencanaanFormasiLayout active="/perencanaan/formasi">{page}</PerencanaanFormasiLayout>
);

LampiranFormasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LampiranFormasi;

