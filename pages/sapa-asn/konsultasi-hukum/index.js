import PageContainer from "@/components/PageContainer";
import ListKonsultasiHukum from "@/components/SapaASN/KonsultasiHukum/ListKonsultasiHukum";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getKonsultasiHukum } from "@/services/sapa-asn.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const KonsultasiHukum = () => {
  useScrollRestoration();
  const router = useRouter();

  const {
    page = 1,
    limit = 10,
    status,
    jenis,
    search,
    sortField,
    sortOrder,
    startDate,
    endDate,
  } = router.query;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "konsultasi-hukum",
      {
        page,
        limit,
        status,
        jenis,
        search,
        sortField,
        sortOrder,
        startDate,
        endDate,
      },
    ],
    queryFn: () =>
      getKonsultasiHukum({
        page,
        limit,
        status,
        jenis,
        search,
        sortField,
        sortOrder,
        startDate,
        endDate,
      }),
    keepPreviousData: true,
  });

  return (
    <>
      <Head>
        <title>Rumah ASN - Konsultasi Hukum</title>
      </Head>
      <PageContainer
        title="Konsultasi Hukum"
        subTitle="Riwayat Konsultasi Saya"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/dashboard">Sapa ASN</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Konsultasi Hukum</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <ListKonsultasiHukum
          data={data?.data || []}
          meta={data?.meta}
          loading={isLoading || isFetching}
          query={router.query}
        />
        <FloatButton.BackTop />
      </PageContainer>
    </>
  );
};

KonsultasiHukum.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/konsultasi-hukum">{page}</SapaASNLayout>
);

KonsultasiHukum.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default KonsultasiHukum;
