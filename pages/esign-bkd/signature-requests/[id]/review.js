import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentDetail, ReviewModal } from "@/components/EsignBKD";
import { useState } from "react";
import { Button, Flex } from "antd";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import Head from "next/head";

const SignatureReviewPage = () => {
  const router = useRouter();
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleReviewClick = () => {
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (data) => {
    // Handle review submission
    console.log("Review submitted:", data);
    setShowReviewModal(false);
    // Redirect after successful review
    router.push("/esign-bkd/signature-requests");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Review Permintaan Tanda Tangan E-Sign BKD</title>
      </Head>

      <div style={{ marginBottom: 24 }}>
        <Flex gap="middle">
          <Button
            type="primary"
            icon={<CheckOutlined />}
            onClick={handleReviewClick}
            style={{
              borderRadius: 8,
              height: 48,
              paddingInline: 24,
              backgroundColor: "#52c41a",
              borderColor: "#52c41a",
            }}
          >
            Setujui Dokumen
          </Button>
          <Button
            danger
            icon={<CloseOutlined />}
            onClick={handleReviewClick}
            style={{
              borderRadius: 8,
              height: 48,
              paddingInline: 24,
            }}
          >
            Tolak Dokumen
          </Button>
        </Flex>
      </div>

      <DocumentDetail />

      <ReviewModal
        open={showReviewModal}
        onCancel={() => setShowReviewModal(false)}
        onApprove={handleReviewSubmit}
        onReject={handleReviewSubmit}
        document={{ id: router.query.id }}
        loading={false}
      />
    </>
  );
};

SignatureReviewPage.Auth = {
  action: "manage",
  subject: "tickets",
};

SignatureReviewPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/signature-requests">{page}</EsignBKDLayout>;
};

export default SignatureReviewPage;