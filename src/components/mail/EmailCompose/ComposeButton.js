import React, { useState } from "react";
import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import EmailComposer from "./EmailComposer";

const ComposeButton = ({
  type = "primary",
  size = "large",
  block = false,
  children = "Tulis",
  style = {},
  ...buttonProps
}) => {
  const [showComposer, setShowComposer] = useState(false);

  const handleClick = () => {
    setShowComposer(true);
  };

  const handleClose = () => {
    setShowComposer(false);
  };

  const handleSent = () => {
    setShowComposer(false);
  };

  return (
    <>
      <Button
        type={type}
        size={size}
        block={block}
        icon={<EditOutlined />}
        onClick={handleClick}
        style={{
          borderRadius: "24px",
          fontWeight: "500",
          ...style,
        }}
        {...buttonProps}
      >
        {children}
      </Button>

      <EmailComposer
        visible={showComposer}
        onClose={handleClose}
        onSent={handleSent}
        mode="compose"
        title="Tulis Email Baru"
      />
    </>
  );
};

export default ComposeButton;
