import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { detailPublikasiCasn } from "@/services/index";
import { transformHref } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Col, Row } from "antd";
import Head from "next/head";
import Link from "next/link";
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
        onBack={() => router.back()}
        header={{
          title: data?.judul,
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Berita</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
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
        <Row>
          <Col md={18} xs={24}>
            <Card loading={isLoading}>
              <div
                dangerouslySetInnerHTML={{
                  __html: transformHref(data?.isi_konten),
                }}
              />
              {data?.file_publikasi && (
                <a
                  href={`https://bkd.jatimprov.go.id/Rekrutmen-PPPK2022/downloadfile/${data?.file_publikasi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Unduh File
                </a>
              )}
            </Card>
          </Col>
        </Row>
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
