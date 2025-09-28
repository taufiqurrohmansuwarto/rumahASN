import EsignBKDLayout from "@/components/EsignBKD/EsignBKDLayout";
import { DocumentDetail, TteSignModal } from "@/components/EsignBKD";
import { useState } from "react";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useRouter } from "next/router";
import Head from "next/head";

const SignatureSignPage = () => {
  const router = useRouter();
  const [showSignModal, setShowSignModal] = useState(false);

  const handleSignSubmit = async (data) => {
    // Handle signature submission
    console.log("Signature submitted:", data);
    setShowSignModal(false);
    // Redirect after successful signing
    router.push("/esign-bkd/signature-requests");
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Tanda Tangan Dokumen E-Sign BKD</title>
      </Head>

      <div style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => setShowSignModal(true)}
          size="large"
          style={{
            borderRadius: 8,
            height: 48,
            paddingInline: 24,
            background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
            border: "none",
            boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
          }}
        >
          Tanda Tangan Elektronik
        </Button>
      </div>

      <DocumentDetail />

      <TteSignModal
        open={showSignModal}
        onCancel={() => setShowSignModal(false)}
        onSign={handleSignSubmit}
        document={{ id: router.query.id }}
        loading={false}
      />
    </>
  );
};

SignatureSignPage.Auth = {
  action: "manage",
  subject: "tickets",
};

SignatureSignPage.getLayout = (page) => {
  return <EsignBKDLayout active="/esign-bkd/signature-requests">{page}</EsignBKDLayout>;
};

export default SignatureSignPage;