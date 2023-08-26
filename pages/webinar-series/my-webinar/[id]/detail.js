import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import {
  downloadCurrentUserCertificate,
  webinarUserDetail,
} from "@/services/webinar.services";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";
import Head from "next/head";
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
    onError: (error) => {
      message.error(error?.response?.data?.message);
    },
  });

  const handleDownload = async () => {
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
      >
        {JSON.stringify(data)}
        <Button
          onClick={handleDownload}
          disabled={isLoadingDownloadCertificate}
          loading={isLoadingDownloadCertificate}
        >
          Unduh Sertifikat
        </Button>
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
