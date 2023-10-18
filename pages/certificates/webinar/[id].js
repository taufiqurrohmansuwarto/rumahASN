import { checkCertificateWebinar } from "@/services/webinar.services";
import { LoginOutlined } from "@ant-design/icons";
import { Center, Container, Paper } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Result, Row, Skeleton } from "antd";
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
      <Center>
        <Skeleton loading={isLoading || isFetching}>
          <Paper p="md" shadow="md">
            {/* {JSON.stringify(data)} */}
            <Result
              status="success"
              title={`Selamat kepada, ${data?.participant?.username}`}
              subTitle={`Anda telah mengikuti webinar dengan judul '${data?.webinar_series?.title}' secara penuh dan berhak mendapatkan sertifikat!`}
              extra={[
                <Button icon={<LoginOutlined />} type="primary" key="console">
                  Masuk
                </Button>,
              ]}
            />
          </Paper>
        </Skeleton>
      </Center>
    </>
  );
};

export default WebinarCertificateDetail;
