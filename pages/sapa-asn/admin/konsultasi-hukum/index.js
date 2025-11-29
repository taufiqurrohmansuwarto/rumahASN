import PageContainer from "@/components/PageContainer";
import ListKonsultasiHukumAdmin from "@/components/SapaASN/Admin/ListKonsultasiHukumAdmin";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAdminKonsultasiHukum } from "@/services/sapa-asn.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const AdminKonsultasiHukum = () => {
  useScrollRestoration();
  const router = useRouter();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-konsultasi-hukum", router.query],
    queryFn: () => getAdminKonsultasiHukum(router.query),
  });

  return (
    <>
      <Head>
        <title>Rumah ASN - Admin Konsultasi Hukum</title>
      </Head>
      <PageContainer
        title="Kelola Konsultasi Hukum"
        subTitle="Daftar konsultasi hukum dari ASN"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/admin/dashboard">Sapa ASN Admin</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Konsultasi Hukum</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <ListKonsultasiHukumAdmin
          data={data?.data || []}
          meta={data?.meta || {}}
          loading={isLoading}
          query={router.query}
          onRefresh={refetch}
        />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

AdminKonsultasiHukum.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/admin/konsultasi-hukum">{page}</SapaASNLayout>
);

AdminKonsultasiHukum.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AdminKonsultasiHukum;

