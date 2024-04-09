import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import SocmedComments from "@/components/Socmed/SocmedComments";
import { getPost } from "@/services/socmed.services";
import { useQuery } from "@tanstack/react-query";
import { Breadcrumb, FloatButton, Grid } from "antd";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ASNUpdateDetail = () => {
  const router = useRouter();
  const handleBack = () => router?.back();

  const { id } = router.query;

  const { data: post, isLoading } = useQuery(
    ["socmed-posts", id],
    () => getPost(id),
    {}
  );

  useEffect(() => {
    // On before route change save scroll position
    router.events.on("routeChangeStart", saveScrollPosition);
    // On route change restore scroll position
    router.events.on("routeChangeComplete", restoreScrollPosition);

    return () => {
      router.events.off("routeChangeStart", saveScrollPosition);
      router.events.off("routeChangeComplete", restoreScrollPosition);
    };
  }, [router]);

  function saveScrollPosition() {
    window.sessionStorage.setItem("scrollPosition", window.scrollY.toString());
  }

  function restoreScrollPosition() {
    const scrollY = window.sessionStorage.getItem("scrollPosition") ?? "0";
    window.scrollTo(0, parseInt(scrollY));
  }

  const breakPoint = Grid.useBreakpoint();

  return (
    <>
      <Head>
        <title>ASN Update - Detail </title>
      </Head>
      <PageContainer
        childrenContentStyle={{
          padding: breakPoint.xs ? 0 : null,
        }}
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Forum Kepegawaian</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/asn-connect/asn-updates">
                  <a>ASN Updates</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Detail</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="ASN Connect"
        content="Berjejaring, Berkolaborasi, Berinovasi Bersama ASN Connect"
        onBack={handleBack}
        loading={isLoading}
      >
        <FloatButton.BackTop />
        <SocmedComments id={id} post={post} />
      </PageContainer>
    </>
  );
};

ASNUpdateDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

ASNUpdateDetail.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-updates">{page}</Layout>;
};

export default ASNUpdateDetail;
