import Layout from "@/components/Layout";
import ProfileForm from "@/components/ProfileSettings/ProfileForm";
import ProfileLayout from "@/components/ProfileSettings/ProfileLayout";
import { ownProfile } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Alert, Col, message, Row, Skeleton } from "antd";
import { useSession } from "next-auth/react";
import Head from "next/head";

function Profile() {
  const { data: dataUser } = useSession();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: () => ownProfile(),
    staleTime: 60000,
    retry: 2,
    onError: (err) => {
      message.error("Gagal memuat data profil");
      console.error("Error loading profile:", err);
    },
  });

  return (
    <>
      <Head>
        <title>Rumah ASN - Pengaturan - Profil</title>
      </Head>

      <Row>
        <Col md={24} xs={24}>
          {isError ? (
            <Alert
              message="Error"
              description="Gagal memuat data profil. Silakan refresh halaman."
              type="error"
              showIcon
            />
          ) : (
            <Skeleton loading={isLoading} active>
              <ProfileForm user={dataUser?.user} data={data} />
            </Skeleton>
          )}
        </Col>
      </Row>
    </>
  );
}

Profile.getLayout = (page) => {
  return (
    <Layout>
      <ProfileLayout title="Profil Saya">{page}</ProfileLayout>
    </Layout>
  );
};

Profile.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default Profile;
