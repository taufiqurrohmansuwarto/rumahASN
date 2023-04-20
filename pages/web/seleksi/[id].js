import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { detailPublikasiCasn } from "@/services/index";
import { transformHref } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Card } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

function NilaiCASN() {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["publikasi-casn", id],
    () => detailPublikasiCasn(id),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - {data?.judul}</title>
      </Head>
      <PageContainer
        loading={isLoading}
        title={data?.judul}
        subTitle={
          <>
            <span className="text-gray-500">
              {data?.create_at?.split("T")[0]}
            </span>
          </>
        }
      >
        <Card loading={isLoading}>
          <div
            dangerouslySetInnerHTML={{
              __html: transformHref(data?.isi_konten),
            }}
          />
        </Card>
      </PageContainer>
    </>
  );
}

NilaiCASN.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

NilaiCASN.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default NilaiCASN;
