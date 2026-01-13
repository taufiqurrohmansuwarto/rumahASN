import PageContainer from "@/components/PageContainer";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import PerencanaanFormasiLayout from "@/components/PerencanaanFormasi/PerencanaanFormasiLayout";

const Formasi = () => {
  useScrollRestoration();

  return (
    <>
      <Head>
        <title>Rumah ASN - Formasi</title>
      </Head>
      <PageContainer
        title="Formasi"
        subTitle="Daftar formasi perencanaan"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/perencanaan/formasi">Formasi</Link>
            </Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

Formasi.getLayout = (page) => (
  <PerencanaanFormasiLayout active="/perencanaan/formasi">{page}</PerencanaanFormasiLayout>
);

Formasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Formasi;

