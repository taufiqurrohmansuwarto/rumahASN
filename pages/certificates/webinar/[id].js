import PageContainer from "@/components/PageContainer";
import { checkCertificateWebinar } from "@/services/webinar.services";
import { LoginOutlined } from "@ant-design/icons";
import { Center, Paper } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Empty, Result, Skeleton } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const WebinarCertificateDetail = () => {
  const router = useRouter();

  const { id } = router.query;

  const { data, isLoading, isFetching } = useQuery(
    ["check-webinar-certificates", id],
    () => checkCertificateWebinar(id),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <>
      <Head>
        <title>Webinar - Sertifikat</title>
      </Head>
      <PageContainer>
        <Center>
          <Skeleton loading={isLoading || isFetching}>
            {data ? (
              <Paper p="md" shadow="md">
                <Result
                  status="success"
                  title={`Selamat kepada, ${data?.participant?.username}`}
                  subTitle={`Anda telah mengikuti webinar dengan judul '${data?.webinar_series?.title}' secara penuh dan berhak mendapatkan sertifikat!`}
                  extra={[
                    <Button
                      icon={<LoginOutlined />}
                      type="primary"
                      key="console"
                    >
                      Masuk
                    </Button>,
                  ]}
                />
              </Paper>
            ) : (
              <Empty description="Sertifikat tidak ditemukan">
                <Button>Kembali</Button>
              </Empty>
            )}
          </Skeleton>
        </Center>
      </PageContainer>
    </>
  );
};

export default WebinarCertificateDetail;
