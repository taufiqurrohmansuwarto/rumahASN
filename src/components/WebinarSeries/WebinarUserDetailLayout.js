import PageContainer from "@/components/PageContainer";
import Watermark from "@/components/WaterMark";
import { webinarUserDetail } from "@/services/webinar.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, Skeleton, Space, Tag, Typography } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

const WebinarUserTitle = ({ data }) => {
  return (
    <Space>
      <Typography.Text>{data?.title}</Typography.Text>
    </Space>
  );
};

const WebinarUserContent = ({ data }) => {
  return (
    <Space>
      <Tag color={data?.is_open ? "green" : "red"}>
        {data?.is_open ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}
      </Tag>
      <Tag color={data?.is_allow_download_certificate ? "green" : "red"}>
        {data?.is_open
          ? "Sertifikat dapat diunduh"
          : "Sertifikat belum siap unduh"}
      </Tag>
    </Space>
  );
};

function WebinarUserDetailLayout({
  children,
  active = "all",
  loading,
  title,
  content,
}) {
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => router.push(`/webinar-series/my-webinar`);

  const { data, isLoading } = useQuery(
    ["webinar-user-detail", id],
    () => webinarUserDetail(id),
    {}
  );

  return (
    <PageContainer
      loading={loading}
      onBack={handleBack}
      header={{
        breadcrumbRender: () => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/webinar-series/all">
                <a>Daftar Webinar</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/webinar-series/my-webinar">
                <a>Daftar Webinar Saya</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>Detail Webinar</Breadcrumb.Item>
          </Breadcrumb>
        ),
      }}
      title={<WebinarUserTitle data={data?.result?.webinar_series} />}
      content={<WebinarUserContent data={data?.result?.webinar_series} />}
      tabList={[
        {
          tab: "Detail Webinar",
          key: "detail",
          href: "/detail",
        },
        {
          tab: "Komentar",
          key: "comments",
          href: "/comments",
        },
      ]}
      tabActiveKey={active}
      tabProps={{
        type: "card",
        size: "small",
        onChange: (key) => {
          const path = `/webinar-series/my-webinar/${id}/${key}`;
          router.push(path);
        },
      }}
    >
      <Watermark content="Demo">
        <Skeleton loading={isLoading}>{children}</Skeleton>
      </Watermark>
    </PageContainer>
  );
}

export default WebinarUserDetailLayout;
