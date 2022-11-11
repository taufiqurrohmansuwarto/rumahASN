import { Alert, Button, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { customerDashboard } from "../../services/users.services";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";
import { StatsGrid } from "../../src/components/StatsGrid";

function Feeds() {
  const { data, isLoading } = useQuery(["dashboard"], () =>
    customerDashboard()
  );

  const { data: userData, status } = useSession();

  const router = useRouter();

  const gotoCreate = () => {
    router.push("/tickets/create");
  };

  return (
    <PageContainer
      loading={isLoading || status === "loading"}
      title="Beranda"
      subTitle="Dashboard"
    >
      <Stack>
        <Alert title="Perhatian">
          <Text>
            Halo, {userData?.user?.name}. Apa ada yang ingin kamu tanyakan?
          </Text>
          <Button onClick={gotoCreate} mt={4}>
            Buat Pertanyaan Sekarang
          </Button>
        </Alert>
        <StatsGrid data={data} />
      </Stack>
    </PageContainer>
  );
}

Feeds.Auth = {
  action: "manage",
  subject: "Feeds",
};

Feeds.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Feeds;
