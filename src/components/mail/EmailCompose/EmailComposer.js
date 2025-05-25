import React from "react";
import ComposeModal from "./ComposeModal";

const EmailComposer = ({
  // Modal props
  visible = false,
  onClose,
  onSent,

  // Compose mode props
  mode = "compose", // compose, reply, forward
  originalEmail = null,
  replyAll = false,

  // Title
  title = "Tulis Email Baru",
}) => {
  return (
    <ComposeModal
      visible={visible}
      onClose={onClose}
      onSent={onSent}
      mode={mode}
      originalEmail={originalEmail}
      replyAll={replyAll}
      title={title}
    />
  );
};

export default EmailComposer;
