import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
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

  return (
    <PageContainer
      loading={loading}
      title="Webinar Series"
      content="Informasi Webinar Series"
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
                <a>Daftar Webinar Series Admin</a>
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
      {children}
    </PageContainer>
  );
}

export default AdminLayoutDetailWebinar;
