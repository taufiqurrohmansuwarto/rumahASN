import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailWebinar from "@/components/WebinarSeries/DetailWebinar";
import {
  downloadCurrentUserCertificate,
  webinarUserDetail,
} from "@/services/webinar.services";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Breadcrumb, Button, Card, message } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function MyWebinarDetail() {
  const router = useRouter();

  const id = router?.query?.id;

  const { data, isLoading } = useQuery(
    ["webinar-user-detail", id],
    () => webinarUserDetail(id),
    {}
  );

  const {
    mutateAsync: downloadCertificate,
    isLoading: isLoadingDownloadCertificate,
  } = useMutation((id) => downloadCurrentUserCertificate(id), {
    onSuccess: (data) => {
      message.success("Berhasil mengunduh sertifikat");
    },
  });

  const handleDownload = async () => {
    try {
      const data = await downloadCertificate(id);

      if (data) {
        const blob = new Blob([data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "file.pdf";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.log(error?.response);
    }
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Series - {data?.title}</title>
      </Head>
      <PageContainer
        title="Detail Webinar"
        content={data?.title}
        loading={isLoading}
        onBack={() => router?.back()}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/webinar-series/my-webinar">
                  <a>Webinar Saya</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
      >
        <Card>
          {/* {JSON.stringify(data)} */}
          <DetailWebinar data={data} />
          <Button
            onClick={handleDownload}
            disabled={isLoadingDownloadCertificate}
            loading={isLoadingDownloadCertificate}
          >
            Unduh Sertifikat
          </Button>
        </Card>
      </PageContainer>
    </>
  );
}

MyWebinarDetail.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

MyWebinarDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

export default MyWebinarDetail;
