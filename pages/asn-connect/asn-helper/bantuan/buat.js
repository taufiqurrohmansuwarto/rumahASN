import Layout from "@/components/Layout";
import HelpRequestForm from "@/components/ASNHelper.js/CreateHelpRequestPage";
import LayoutASNConnect from "@/components/Socmed/LayoutASNConnect";
import { asnHelperCreateHelpRequest } from "@/data/mockup-asn-helper";
import Head from "next/head";

const CreateHelpRequest = () => {
  return (
    <>
      <Head>
        <title>Buat Permintaan Bantuan - ASN Helper</title>
      </Head>
      <LayoutASNConnect active="asn-helper">
        <HelpRequestForm
          formConfig={asnHelperCreateHelpRequest.pageData.formConfig}
          helpTips={asnHelperCreateHelpRequest.pageData.helpTips}
          recentSimilarRequests={
            asnHelperCreateHelpRequest.pageData.recentSimilarRequests
          }
        />
      </LayoutASNConnect>
    </>
  );
};

CreateHelpRequest.Auth = {
  action: "manage",
  subject: "tickets",
};

CreateHelpRequest.getLayout = (page) => {
  return <Layout active="/asn-connect/asn-helper">{page}</Layout>;
};

export default CreateHelpRequest;
