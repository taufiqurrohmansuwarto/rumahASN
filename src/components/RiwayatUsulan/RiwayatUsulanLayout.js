import React from "react";
import PageContainer from "@/components/PageContainer";
import { Breadcrumb } from "antd";
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

  return (
    <PageContainer
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
          tab: "Pencantuman Gelar",
          key: "pencantuman-gelar",
          href: "/pemutakhiran-data/usulan-siasn/pencantuman-gelar",
        },
        {
          tab: "Pemberhentian",
          key: "pemberhentian",
          href: "/pemutakhiran-data/usulan-siasn/pemberhentian",
        },
        {
          tab: "Masa Kerja",
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