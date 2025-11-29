import PageContainer from "@/components/PageContainer";
import ListAdvokasi from "@/components/SapaASN/Advokasi/ListAdvokasi";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getAdvokasi } from "@/services/sapa-asn.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const Advokasi = () => {
  useScrollRestoration();
  const router = useRouter();

  const {
    page = 1,
    limit = 10,
    status,
    search,
    sortField,
    sortOrder,
    startDate,
    endDate,
  } = router.query;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "advokasi",
      { page, limit, status, search, sortField, sortOrder, startDate, endDate },
    ],
    queryFn: () =>
      getAdvokasi({
        page,
        limit,
        status,
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
        <title>Rumah ASN - Pengaduan & Advokasi</title>
      </Head>
      <PageContainer
        title="Pengaduan & Advokasi"
        subTitle="Riwayat Permohonan Saya"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/dashboard">Sapa ASN</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Pengaduan & Advokasi</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <ListAdvokasi
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

Advokasi.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/advokasi">{page}</SapaASNLayout>
);

Advokasi.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Advokasi;
