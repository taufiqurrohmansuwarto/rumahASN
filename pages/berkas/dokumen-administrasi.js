import Administrasi from "@/components/Berkas/Administrasi";
import AdministrasiPerbaikan from "@/components/Berkas/AdministrasiPerbaikan";
import BerkasPNS from "@/components/Berkas/BerkasPNS";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Stack } from "@mantine/core";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";

const DokumenAdministrasi = () => {
  return (
    <>
      <Head>
        <title>Berkas - PNS</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Forum Kepegawaian</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Dokumen Administrasi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Dokumen Administrasi"
        content="Dokumen Administrasi"
      >
        <Stack>
          <Administrasi />
          <AdministrasiPerbaikan />
        </Stack>
      </PageContainer>
    </>
  );
};

DokumenAdministrasi.Auth = {
  action: "manage",
  subject: "tickets",
};

DokumenAdministrasi.getLayout = (page) => {
  return <Layout active="/berkas/dokumen-administrasi">{page}</Layout>;
};

export default DokumenAdministrasi;
