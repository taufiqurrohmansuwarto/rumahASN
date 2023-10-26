import CreateCoaching from "@/components/CoachingClinic/Consultant/CreateCoaching";
import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";

const CreateCoachingClinic = () => {
  const router = useRouter();

  const handleCreate = () => router.push("/coaching-clinic/consults");

  return (
    <>
      <Head>
        <title>Rumah ASN - Instruktur Coaching Clinic</title>
      </Head>
      <PageContainer title="Coaching Clinic" content="Jadwal Konsultasi Online">
        <CreateCoaching />
      </PageContainer>
    </>
  );
};

CreateCoachingClinic.Auth = {
  action: "manage",
  subject: "tickets",
};

CreateCoachingClinic.getLayout = (page) => {
  return <Layout active="/coaching-clinic-consultant">{page}</Layout>;
};

export default CreateCoachingClinic;
