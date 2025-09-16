import Layout from "@/components/Layout";
import CreateTicket from "@/components/Ticket/CreateTicket";
import PageContainer from "../../src/components/PageContainer";
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import Head from "next/head";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const CreateTicketPage = ({ data }) => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Rumah ASN -Buat Tiket Baru</title>
      </Head>
      <PageContainer
        onBack={() => router.back()}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Buat Tiket Baru</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Buat Tiket Baru"
        subTitle="Ajukan pertanyaan atau laporkan masalah Anda"
      >
        <GoogleReCaptchaProvider
          reCaptchaKey={`6LdyNGorAAAAAN1UD8BNieu6WEvzVClmCnoZUnQk`}
        >
          <CreateTicket siteKey={data?.siteKey} />
        </GoogleReCaptchaProvider>
      </PageContainer>
    </>
  );
};

export const getServerSideProps = async () => {
  const siteKey = process.env.RECAPTCHA_SITE_KEY;
  return {
    props: {
      data: { siteKey },
    },
  };
};

CreateTicketPage.Auth = {
  action: "create",
  subject: "Tickets",
};

CreateTicketPage.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default CreateTicketPage;
