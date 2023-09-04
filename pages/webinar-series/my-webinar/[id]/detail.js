import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailWebinarUser from "@/components/WebinarSeries/DetailWebinarUser";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import {
  downloadCurrentUserCertificate,
  webinarUserDetail,
} from "@/services/webinar.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, Card, message } from "antd";
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
      <WebinarUserDetailLayout active="detail">
        <Card>
          {JSON.stringify(data)}
          <DetailWebinarUser data={data?.webinar_series} />
        </Card>
      </WebinarUserDetailLayout>
    </>
  );
}

MyWebinarDetail.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

MyWebinarDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

export default MyWebinarDetail;
