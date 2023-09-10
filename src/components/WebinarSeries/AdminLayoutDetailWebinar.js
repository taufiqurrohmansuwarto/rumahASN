import PageContainer from "@/components/PageContainer";
import { detailWebinar } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Skeleton } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function AdminLayoutDetailWebinar({
  children,
  active = "detail",
  loading,
  title,
  content,
}) {
  const router = useRouter();
  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["webinar-series-admin-detail", router?.query?.id],
    () => detailWebinar(router?.query?.id),
    {}
  );

  const handleBack = () => {
    router.push(`/apps-managements/webinar-series`);
  };

  return (
    <>
      <Head>
        <title>
          Rumah ASN - Detail Webinar Series {data?.title} - {active}
        </title>
      </Head>
      <PageContainer
        loading={isLoading}
        onBack={handleBack}
        title={data?.title}
        content={data?.description}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/webinar-series">
                  <a>Webinar Series Admin</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail Webinar Series</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        tabList={[
          {
            tab: "Detail",
            key: "detail",
            href: `/apps-managements/webinar-series/${id}/detail`,
          },
          {
            tab: "Edit",
            key: "edit",
            href: `/apps-managements/webinar-series/${id}/edit`,
          },
          {
            tab: "Peserta",
            key: "participants",
            href: `/apps-managements/webinar-series/${id}/participants`,
          },
          {
            tab: "Kuisioner",
            key: "survey",
            href: `/apps-managements/webinar-series/${id}/survey`,
          },
          {
            tab: "Komentar",
            key: "comments",
            href: `/apps-managements/webinar-series/${id}/comments`,
          },
          {
            tab: "Rating",
            key: "ratings",
            href: `/apps-managements/webinar-series/${id}/ratings`,
          },
        ]}
        tabActiveKey={active}
        tabProps={{
          type: "card",
          size: "small",
          onChange: (key) => {
            const url = `/apps-managements/webinar-series/${id}/${key}`;
            router.push(url);
          },
        }}
      >
        <Skeleton loading={loading}>{children}</Skeleton>
      </PageContainer>
    </>
  );
}

export default AdminLayoutDetailWebinar;
