import PageContainer from "@/components/PageContainer";
import ListAdvokasiAdmin from "@/components/SapaASN/Admin/ListAdvokasiAdmin";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAdminAdvokasi } from "@/services/sapa-asn.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const AdminAdvokasi = () => {
  useScrollRestoration();
  const router = useRouter();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-advokasi", router.query],
    queryFn: () => getAdminAdvokasi(router.query),
  });

  return (
    <>
      <Head>
        <title>Rumah ASN - Admin Advokasi</title>
      </Head>
      <PageContainer
        title="Kelola Advokasi"
        subTitle="Daftar permohonan advokasi dari ASN"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/admin/dashboard">Sapa ASN Admin</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Advokasi</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <ListAdvokasiAdmin
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

AdminAdvokasi.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/admin/advokasi">{page}</SapaASNLayout>
);

AdminAdvokasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AdminAdvokasi;

