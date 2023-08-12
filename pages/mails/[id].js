import Layout from "@/components/Layout";
import MailLayout from "@/components/MailLayout";
import PageContainer from "@/components/PageContainer";
import DetailPrivateMessage from "@/components/PrivateMessages/DetailPrivateMessage";
import { detailPrivateMessage } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

const Mail = () => {
  const router = useRouter();

  const handleBack = () => router.back();

  const { data, isLoading } = useQuery(
    ["detail_private_message", router.query.id],
    () => detailPrivateMessage(router?.query?.id)
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer
        title="Detail Pesan"
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Pesan Pribadi</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        subTitle="Pesan Pribadi"
        loading={isLoading}
        onBack={handleBack}
      >
        <DetailPrivateMessage data={data} />
      </PageContainer>
    </>
  );
};

Mail.getLayout = function getLayout(page) {
  return (
    <Layout>
      <MailLayout active="inbox">{page}</MailLayout>
    </Layout>
  );
};

Mail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Mail;
