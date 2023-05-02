import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { Button } from "antd";
import { useRouter } from "next/router";

const Mail = () => {
  const router = useRouter();

  const gotoCreate = () => router.push("/mails/create");

  return (
    <PageContainer>
      <Button onClick={gotoCreate}>Buat Pesan</Button>
    </PageContainer>
  );
};

Mail.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

Mail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Mail;
