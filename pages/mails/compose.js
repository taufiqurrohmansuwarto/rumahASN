import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Spin, Alert, Button } from "antd";
import GmailLayout from "@/components/GmailLayout";
import EmailComposer from "@/components/mail/EmailComposer";
import { useEmailById } from "@/hooks/useEmails";

const ComposePage = () => {
  const router = useRouter();

  // Get URL params for different compose modes
  const { reply, replyAll, forward, draft } = router.query;

  // State for original email
  const [originalEmail, setOriginalEmail] = useState(null);

  // Determine compose mode
  let mode = "compose";
  let originalEmailId = null;

  if (reply) {
    mode = "reply";
    originalEmailId = reply;
  } else if (forward) {
    mode = "forward";
    originalEmailId = forward;
  }

  // Load original email if needed for reply/forward
  const {
    data: emailData,
    isLoading: isLoadingEmail,
    error: emailError,
  } = useEmailById(originalEmailId, {
    enabled: !!originalEmailId,
  });

  // Set original email when data is loaded
  useEffect(() => {
    if (emailData?.data) {
      setOriginalEmail(emailData.data);
    }
  }, [emailData]);

  // Handle navigation
  const handleSent = () => {
    router.push("/mails/sent");
  };

  const handleDraft = () => {
    router.push("/mails/drafts");
  };

  const handleClose = () => {
    router.back();
  };

  // Determine title based on mode
  const getTitle = () => {
    switch (mode) {
      case "reply":
        return replyAll === "true" ? "Balas Semua" : "Balas Email";
      case "forward":
        return "Teruskan Email";
      default:
        return draft ? "Edit Draft" : "Tulis Email Baru";
    }
  };

  // Loading state for original email
  if (isLoadingEmail) {
    return (
      <>
        <Head>
          <title>Rumah ASN - Memuat Email</title>
        </Head>
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <Spin size="large" />
            <div style={{ marginTop: "16px", fontSize: "14px", color: "#666" }}>
              Memuat email...
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state for original email
  if (emailError && originalEmailId) {
    return (
      <>
        <Head>
          <title>Rumah ASN - Error</title>
        </Head>
        <div
          style={{
            width: "100%",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
            padding: "24px",
          }}
        >
          <div style={{ maxWidth: "400px", width: "100%" }}>
            <Alert
              message="Gagal Memuat Email"
              description="Tidak dapat memuat email yang ingin Anda balas atau teruskan. Silakan coba lagi atau kembali ke inbox."
              type="error"
              showIcon
              action={
                <div style={{ marginTop: "16px" }}>
                  <Button
                    type="primary"
                    onClick={() => router.push("/mails/inbox")}
                    style={{ marginRight: "8px" }}
                  >
                    Kembali ke Inbox
                  </Button>
                  <Button onClick={() => window.location.reload()}>
                    Coba Lagi
                  </Button>
                </div>
              }
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Rumah ASN - {getTitle()}</title>
      </Head>

      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          backgroundColor: "#f5f5f5",
          padding: "24px 16px",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <EmailComposer
            // Display props
            standalone={true}
            title={getTitle()}
            // Mode props
            mode={mode}
            originalEmail={originalEmail}
            replyAll={replyAll === "true"}
            // Draft props
            draftId={draft}
            // Navigation callbacks
            onSent={handleSent}
            onDraft={handleDraft}
            onClose={handleClose}
          />
        </div>
      </div>
    </>
  );
};

ComposePage.getLayout = function getLayout(page) {
  return <GmailLayout active="/mails/compose">{page}</GmailLayout>;
};

ComposePage.Auth = {
  action: "manage",
  subject: "Tickets",
};

export default ComposePage;
