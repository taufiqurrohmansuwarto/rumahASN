import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";

const CreatePrivateMessage = () => {
  const router = useRouter();
  const handleBack = () => router.back();

  return <PageContainer onBack={handleBack}></PageContainer>;
};

CreatePrivateMessage.getLayout = function getLayout(page) {
  return <Layout active="/mails">{page}</Layout>;
};

CreatePrivateMessage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default CreatePrivateMessage;
