import PageContainer from "@/components/PageContainer";
import ListPendampinganHukum from "@/components/SapaASN/PendampinganHukum/ListPendampinganHukum";
import SapaASNLayout from "@/components/SapaASN/SapaASNLayout";
import useScrollRestoration from "@/hooks/useScrollRestoration";
import { getPendampinganHukum } from "@/services/sapa-asn.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, FloatButton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const PendampinganHukum = () => {
  useScrollRestoration();
  const router = useRouter();

  const {
    page = 1,
    limit = 10,
    status,
    jenisPerkara,
    bentuk,
    search,
    sortField,
    sortOrder,
    startDate,
    endDate,
  } = router.query;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      "pendampingan-hukum",
      {
        page,
        limit,
        status,
        jenisPerkara,
        bentuk,
        search,
        sortField,
        sortOrder,
        startDate,
        endDate,
      },
    ],
    queryFn: () =>
      getPendampinganHukum({
        page,
        limit,
        status,
        jenisPerkara,
        bentuk,
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
        <title>Rumah ASN - Pendampingan Hukum</title>
      </Head>
      <PageContainer
        title="Pendampingan Hukum"
        subTitle="Riwayat Permohonan Saya"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/sapa-asn/dashboard">Sapa ASN</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Pendampingan Hukum</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <ListPendampinganHukum
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

PendampinganHukum.getLayout = (page) => (
  <SapaASNLayout active="/sapa-asn/pendampingan-hukum">{page}</SapaASNLayout>
);

PendampinganHukum.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default PendampinganHukum;
