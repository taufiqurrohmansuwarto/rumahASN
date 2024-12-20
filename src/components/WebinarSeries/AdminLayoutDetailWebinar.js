import PageContainer from "@/components/PageContainer";
import { detailWebinar } from "@/services/webinar.services";
import { formatDateWebinar } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Skeleton, Tag, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";

function AdminLayoutDetailWebinar({ children, active = "detail", loading }) {
  const breakPoint = Grid.useBreakpoint();
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
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        content={
          <>
            {formatDateWebinar(data?.start_date)} -{" "}
            {formatDateWebinar(data?.end_date)}{" "}
          </>
        }
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/webinar-series">
                  Webinar Series Admin
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
            tab: (
              <>
                Peserta <Tag color="red">{data?.participants}</Tag>
              </>
            ),
            key: "participants",
            href: `/apps-managements/webinar-series/${id}/participants`,
          },
          {
            tab: "Presensi",
            key: "absences",
            href: `/apps-managements/webinar-series/${id}/absences`,
          },
          {
            tab: "Kuisioner",
            key: "survey",
            href: `/apps-managements/webinar-series/${id}/survey`,
          },
          {
            tab: (
              <>
                Diskusi <Tag color="red">{data?.comments}</Tag>
              </>
            ),
            key: "comments",
            href: `/apps-managements/webinar-series/${id}/comments`,
          },
          {
            tab: (
              <>
                Ulasan <Tag color="red">{data?.ratings}</Tag>
              </>
            ),
            key: "ratings",
            href: `/apps-managements/webinar-series/${id}/ratings`,
          },
          {
            tab: <>Pre Test</>,
            key: "pretest",
            href: `/apps-managements/webinar-series/${id}/pretest`,
          },
          {
            tab: <>Post Test</>,
            key: "posttest",
            href: `/apps-managements/webinar-series/${id}/postest`,
          },
          {
            tab: <>Lihat Sertifikat</>,
            key: "view-certificate",
            href: `/apps-managements/webinar-series/${id}/view-certificate`,
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
