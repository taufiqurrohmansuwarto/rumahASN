import GmailLayout from "@/components/GmailLayout";
import { useEmailById } from "@/hooks/useEmails";
import { Spin, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

// Import komponen yang sudah dibuat
import ComposeModal from "@/components/mail/EmailCompose/ComposeModal";

const ComposeMail = () => {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  // Get query parameters
  const { reply, forward, replyAll } = router.query;
  const originalEmailId = reply || forward;

  // Fetch original email jika ada ID
  const {
    data: originalEmailData,
    isLoading: isLoadingOriginal,
    isError: isErrorOriginal,
  } = useEmailById(originalEmailId);

  useEffect(() => {
    setVisible(true);
  }, []);

  // Handle error loading original email
  useEffect(() => {
    if (isErrorOriginal && originalEmailId) {
      message.error("Gagal memuat email asli");
      // Tetap lanjut ke compose mode
    }
  }, [isErrorOriginal, originalEmailId]);

  const handleClose = () => {
    setVisible(false);
    router.push("/mails/inbox");
  };

  const handleSent = () => {
    setVisible(false);
    router.push("/mails/sent");
  };

  // Determine mode
  const getMode = () => {
    if (reply) return "reply";
    if (forward) return "forward";
    return "compose";
  };

  const getTitle = () => {
    if (reply) return replyAll === "true" ? "Balas Semua" : "Balas";
    if (forward) return "Teruskan";
    return "Tulis Email Baru";
  };

  // Show loading jika sedang fetch original email
  if (isLoadingOriginal && originalEmailId) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Spin size="large" tip="Memuat email..." />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Rumah ASN - {getTitle()}</title>
      </Head>

      <ComposeModal
        visible={visible}
        onClose={handleClose}
        onSent={handleSent}
        mode={getMode()}
        originalEmail={originalEmailData?.data || null}
        replyAll={replyAll === "true"}
        title={getTitle()}
      />
    </>
  );
};

ComposeMail.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/compose">{page}</GmailLayout>;
};

ComposeMail.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ComposeMail;
