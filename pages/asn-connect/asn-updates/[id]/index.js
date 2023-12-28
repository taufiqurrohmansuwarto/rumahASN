import LayoutAsnConnect from "@/components/LayoutASNConnect";
import PageContainer from "@/components/PageContainer";
import SocmedCreatePost from "@/components/Socmed/SocmedCreatePost";
import Head from "next/head";
import { useRouter } from "next/router";

const ASNUpdateDetail = () => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Rumah ASN - ASN Update</title>
      </Head>
      <PageContainer
        title="ASN Updates"
        content="Apa yang terjadi di ASN Connect?"
      >
        <SocmedCreatePost />
      </PageContainer>
    </>
  );
};

ASNUpdateDetail.Auth = {
  action: "manage",
  subject: "tickets",
};

ASNUpdateDetail.getLayout = (page) => {
  return (
    <LayoutAsnConnect active="/asn-connect/asn-updates">
      {page}
    </LayoutAsnConnect>
  );
};

export default ASNUpdateDetail;
