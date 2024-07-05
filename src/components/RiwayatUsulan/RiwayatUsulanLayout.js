import React from "react";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb, Grid } from "antd";
import Link from "next/link";
import { useRouter } from "next/router";

function RiwayatUsulanLayout({
  children,
  active = "all",
  loading,
  title,
  content,
  breadcrumbTitle,
}) {
  const router = useRouter();

  const handleBack = () => router?.back();

  const breakPoint = Grid.useBreakpoint();

  return (
    <PageContainer
      childrenContentStyle={{
        padding: breakPoint.xs ? 0 : null,
      }}
      header={{
        breadcrumbRender: () => (
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link href="/feeds">
                <a>Beranda</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Link href="/pemutakhiran-data/komparasi">
                <a>Peremajaan Data</a>
              </Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>{breadcrumbTitle}</Breadcrumb.Item>
          </Breadcrumb>
        ),
      }}
      onBack={handleBack}
      title={title}
      content={content}
      tabList={[
        {
          tab: "Inbox Usulan",
          key: "inbox-usulan",
          href: "/pemutakhiran-data/usulan-siasn/inbox-usulan",
        },
        {
          tab: "Kenaikan Pangkat",
          key: "kenaikan-pangkat",
          href: "/pemutakhiran-data/usulan-siasn/kenaikan-pangkat",
        },
        {
          tab: "Perbaikan Nama",
          key: "perbaikan-nama",
          href: "/pemutakhiran-data/usulan-siasn/perbaikan-nama",
        },
        {
          tab: "Pemberhentian",
          key: "pemberhentian",
          href: "/pemutakhiran-data/usulan-siasn/pemberhentian",
        },
        {
          tab: "Pencantuman Gelar",
          key: "pencantuman-gelar",
          href: "/pemutakhiran-data/usulan-siasn/pencantuman-gelar",
        },
        {
          tab: "Penyesuaian Masa Kerja",
          key: "masa-kerja",
          href: "/pemutakhiran-data/usulan-siasn/masa-kerja",
        },
      ]}
      tabActiveKey={active}
      tabProps={{
        type: "card",
        size: "small",
        onChange: (key) => {
          router.push(key);
        },
      }}
    >
      {children}
    </PageContainer>
  );
}

export default RiwayatUsulanLayout;
