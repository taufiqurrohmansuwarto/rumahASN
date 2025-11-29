import PageContainer from "@/components/PageContainer";
import ListPendampinganHukumAdmin from "@/components/SapaASN/Admin/ListPendampinganHukumAdmin";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAdminPendampinganHukum } from "@/services/sapa-asn.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const AdminPendampinganHukum = () => {
  useScrollRestoration();
  const router = useRouter();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-pendampingan-hukum", router.query],
    queryFn: () => getAdminPendampinganHukum(router.query),
  });

  return (
    <>
      <Head>
        <title>Rumah ASN - Admin Pendampingan Hukum</title>
      </Head>
      <PageContainer
        title="Kelola Pendampingan Hukum"
        subTitle="Daftar permohonan pendampingan hukum dari ASN"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/admin/dashboard">Sapa ASN Admin</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Pendampingan Hukum</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <ListPendampinganHukumAdmin
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

AdminPendampinganHukum.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/admin/pendampingan-hukum">{page}</SapaASNLayout>
);

AdminPendampinganHukum.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default AdminPendampinganHukum;

