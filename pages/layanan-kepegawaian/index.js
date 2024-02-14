import CardLayananKepegawaian from "@/components/FiturLayananKepegawaian/CardLayananKepegawaian";
import IPAsn from "@/components/LayananSIASN/IPAsn";
import Layout from "@/components/Layout";
import { readUser } from "@/services/layanan-kepegawaian.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, List } from "antd";
import { times } from "lodash";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const { default: PageContainer } = require("@/components/PageContainer");

const LayananKepegawaian = () => {
  const router = useRouter();
  const query = router.query;

  const {
    data: employeeServices,
    isLoading,
    isFetching,
  } = useQuery(
    ["data-layanan-kepegawaian-user", query],
    () => readUser(query),
    {
      keepPreviousData: true,
    }
  );

  const handleClick = (id) => {
    router.push(`/layanan-kepegawaian/${id}`);
  };

  const title = "Layanan Kepegawaian";
  const description =
    "Get Started with AI-Drive App Development Using the OpenAI Node.js SDK";
  const image =
    "https://siasn.bkd.jatimprov.go.id:9000/public/layanan_cuti_umroh.png";
  const bidang =
    "Perencanaan, Pengadaan, Pengolahan Data dan Sistem Informasi ASN";

  const data = times(10, (i) => ({
    id: i,
    title,
    description,
    image,
    bidang,
  }));

  return (
    <>
      <Head>
        <title>Rumah ASN - Layanan Kepegawaian</title>
      </Head>
      <PageContainer
        title="Layanan Kepegawaian"
        content="BKD Provinsi Jawa Timur"
        breadcrumbRender={() => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Layanan Kepegawaian</Breadcrumb.Item>
          </Breadcrumb>
        )}
      >
        <List
          loading={isLoading || isFetching}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 4,
            xxl: 4,
          }}
          dataSource={employeeServices?.data}
          rowKey={(row) => row?.id}
          renderItem={({ id, title, description, icon_url, bidang }) => (
            <List.Item>
              <CardLayananKepegawaian
                title={title}
                description={description}
                image={icon_url}
                bidang={bidang?.label}
                onClick={() => handleClick(id)}
              />
            </List.Item>
          )}
        />
      </PageContainer>
    </>
  );
};

LayananKepegawaian.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

LayananKepegawaian.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default LayananKepegawaian;
