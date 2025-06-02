import GmailLayout from "@/components/GmailLayout";
import PageContainer from "@/components/PageContainer";
import { getPrivateMessages } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Button, Grid } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const Mail = () => {
  const breakPoint = Grid.useBreakpoint();

  const router = useRouter();
  const { data, isLoading } = useQuery(["private-messages"], () =>
    getPrivateMessages({})
  );

  const gotoCreate = () => router.push("/mails/create");

  return (
    <>
      <Head>
        <title>Rumah ASN - Pesan Pribadi</title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? null : 0,
        }}
      >
        <Button onClick={gotoCreate}>Buat Pesan</Button>
      </PageContainer>
    </>
  );
};

Mail.getLayout = function getLayout(page) {
  return <GmailLayout>{page}</GmailLayout>;
};

Mail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Mail;
