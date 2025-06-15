import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import WebinarRatings from "@/components/WebinarSeries/WebinarRating";
import WebinarUserDetailLayout from "@/components/WebinarSeries/WebinarUserDetailLayout";
import { getRatingForUser } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

function WebinarComments() {
  const router = useRouter();

  const { data, isLoading, isFetching } = useQuery(
    ["webinar-user-rating", router?.query],
    () => getRatingForUser(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
    }
  );

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
      title: data?.webinar_series?.title || "Detail Webinar",
      href: `/webinar-series/my-webinar/${router?.query?.id}/ratings`,
      isActive: false,
    },
  ];

  return (
    <PageContainer
      onBack={() => router.push(`/webinar-series/my-webinar`)}
      title="Ulasan"
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
      <WebinarUserDetailLayout loading={isLoading} active="ratings">
        <WebinarRatings loadingRating={isLoading || isFetching} data={data} />
      </WebinarUserDetailLayout>
    </PageContainer>
  );
}

WebinarComments.Auth = {
  action: "manage",
  subject: "tickets",
};

WebinarComments.getLayout = function getLayout(page) {
  return <Layout active="/webinar-series/all">{page}</Layout>;
};

export default WebinarComments;
