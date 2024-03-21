import Layout from "@/components/Layout";
import LayoutAsnConnect from "@/components/LayoutASNConnect";
import PageContainer from "@/components/PageContainer";
import SocmedComments from "@/components/Socmed/SocmedComments";
import { getPost } from "@/services/socmed.services";
import { useQuery } from "@tanstack/react-query";
import { BackTop } from "antd";
import Head from "next/head";
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

  return (
    <>
      <Head>
        <title>ASN Update - Detail </title>
      </Head>
      <PageContainer
        title="ASN Connect"
        subTitle="Berjejaring, Berkolaborasi, Berinovasi Bersama ASN Connect"
        content="Detail Postingan"
        onBack={handleBack}
        loading={isLoading}
      >
        <BackTop />
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
