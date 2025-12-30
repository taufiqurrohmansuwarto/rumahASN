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
  const { reply, forward, replyAll, draft, to, toName, subject, body, from } = router.query;
  const originalEmailId = reply || forward || draft;

  // Initial recipients dari query param
  // Support multiple recipients: to=id1,id2,id3&toName=name1,name2,name3
  const getInitialRecipients = () => {
    if (!to) return null;
    
    const ids = to.split(",");
    const names = toName ? toName.split(",") : [];
    
    // Single recipient
    if (ids.length === 1) {
      return { value: ids[0], label: names[0] || ids[0] };
    }
    
    // Multiple recipients
    return ids.map((id, idx) => ({
      value: id,
      label: names[idx] || id,
    }));
  };

  const initialRecipient = getInitialRecipients();
  const initialSubject = subject || "";
  const initialBody = body || "";

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
    router.back();
  };

  const handleSent = () => {
    setVisible(false);
    router.push("/mails/sent");
  };

  // Determine mode
  const getMode = () => {
    if (reply) return "reply";
    if (forward) return "forward";
    if (draft) return "draft";
    return "compose";
  };

  const getTitle = () => {
    if (reply) return replyAll === "true" ? "Balas Semua" : "Balas";
    if (forward) return "Teruskan";
    if (draft) return "Edit Draft";
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
        initialRecipient={initialRecipient}
        initialSubject={initialSubject}
        initialBody={initialBody}
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
