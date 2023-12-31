import LayoutAsnConnect from "@/components/LayoutASNConnect";
import PageContainer from "@/components/PageContainer";
import SocmedCreatePost from "@/components/Socmed/SocmedCreatePost";
import SocmedPosts from "@/components/Socmed/SocmedPosts";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { BackTop, Divider } from "antd";
import SocmedPostsFilter from "@/components/Socmed/SocmedPostsFilter";

const AsnUpdates = () => {
  const router = useRouter();

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
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <PageContainer
        title="ASN Updates"
        content="Apa yang terjadi di ASN Connect?"
      >
        <BackTop />
        <SocmedCreatePost />
        <SocmedPosts />
      </PageContainer>
    </>
  );
};

AsnUpdates.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnUpdates.getLayout = (page) => {
  return (
    <LayoutAsnConnect active="/asn-connect/asn-updates">
      {page}
    </LayoutAsnConnect>
  );
};

export default AsnUpdates;
