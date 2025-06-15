import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import DetailWebinarUser from "@/components/WebinarSeries/DetailWebinarUser";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import {
  downloadCurrentUserCertificate,
  webinarUserDetail,
} from "@/services/webinar.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Breadcrumb, message } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

function MyWebinarDetail() {
  const router = useRouter();

  const id = router?.query?.id;

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

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
      message.error(
        error?.response?.data?.message || "Gagal mengunduh sertifikat"
      );
    },
  });

  const handleDownload = async () => {
    try {
      const data = await downloadCertificate(id);

      if (data) {
        const url = `data:application/pdf;base64,${data}`;
        // const blob = new Blob([data], { type: "application/pdf" });
        // const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "Sertifikat.pdf";
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.log(error?.response);
    }
  };

  const breadcrumb = [
    {
      title: "Beranda",
      href: "/",
      isActive: true,
    },
    {
      title: "Daftar Webinar Saya",
      href: "/webinar-series/my-webinar",
      isActive: true,
    },
    {
      title: data?.webinar_series?.title,
      isActive: false,
    },
  ];

  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Series - {data?.title}</title>
      </Head>
      <PageContainer
        onBack={() => router.push(`/webinar-series/my-webinar`)}
        title="Detail Webinar"
        breadcrumbRender={() => (
          <Breadcrumb>
            {breadcrumb.map((item) => (
              <Breadcrumb.Item key={item.title}>
                {item.isActive ? (
                  <Link href={item.href}>{item.title}</Link>
                ) : (
                  item.title
                )}
              </Breadcrumb.Item>
            ))}
          </Breadcrumb>
        )}
        loading={isLoading}
      >
        <WebinarUserDetailLayout loading={isLoading} active="detail">
          <DetailWebinarUser
            downloadCertificate={handleDownload}
            loadingDownloadCertificate={isLoadingDownloadCertificate}
            data={data?.webinar_series}
            alreadyPoll={data?.result?.already_poll}
          />
        </WebinarUserDetailLayout>
      </PageContainer>
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
