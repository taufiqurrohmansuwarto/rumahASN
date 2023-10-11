import Layout from "@/components/Layout";
import { readDetailUser } from "@/services/layanan-kepegawaian.services";
import {
  Center,
  Image,
  Stack,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, Col, Divider, Row, Space } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const { default: PageContainer } = require("@/components/PageContainer");

const DetailLayananKepegawaian = () => {
  const router = useRouter();
  const id = router.query.id;

  const { data, isLoading } = useQuery(
    ["detail-layanan-kepegawaian", id],
    () => readDetailUser(id),
    {}
  );

  return (
    <>
      <Head>
        <title>
          Rumah ASN - Detail Layanan Kepegawaian {data?.title || ""}
        </title>
      </Head>
      <PageContainer
        loading={isLoading}
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/layanan-kepegawaian">
                <a>Layanan Kepegawaian</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail Layanan</Breadcrumb.Item>
          </Breadcrumb>
        )}
        onBack={() => router?.back()}
        title="Detail Layanan"
      >
        <Card title={() => <Title order={1}>{data?.title || ""}</Title>}>
          <Row gutter={[16, 16]}>
            <Col md={10} xs={24}>
              <Space direction="vertical">
                <Text color="dimmed">{data?.bidang?.label}</Text>
                <TypographyStylesProvider>
                  <div dangerouslySetInnerHTML={{ __html: data?.html }} />
                </TypographyStylesProvider>
              </Space>
            </Col>
            <Col md={14} xs={24}>
              <Stack align="center">
                <Image
                  maw={400}
                  mx="auto"
                  radius="md"
                  src={
                    data?.icon_url ||
                    "https://siasn.bkd.jatimprov.go.id:9000/public/layanan_cuti_umroh.png"
                  }
                  alt="Random image"
                />

                <Text color="dimmed">Credits Chat GPT</Text>
              </Stack>
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </>
  );
};

DetailLayananKepegawaian.getLayout = function getLayout(page) {
  return <Layout active="/layanan-kepegawaian">{page}</Layout>;
};

DetailLayananKepegawaian.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default DetailLayananKepegawaian;
