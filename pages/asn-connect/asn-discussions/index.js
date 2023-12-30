import LayoutAsnConnect from "@/components/LayoutASNConnect";
import PageContainer from "@/components/PageContainer";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";

const AsnDiscussions = () => {
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
        title="ASN Discussions"
        content="Diskusi seputar ASN Connect"
      ></PageContainer>
    </>
  );
};

AsnDiscussions.Auth = {
  action: "manage",
  subject: "tickets",
};

AsnDiscussions.getLayout = (page) => {
  return (
    <LayoutAsnConnect active="/asn-connect/asn-discussions">
      {page}
    </LayoutAsnConnect>
  );
};

export default AsnDiscussions;
