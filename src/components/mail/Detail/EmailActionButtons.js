import { Group } from "@mantine/core";
import { IconArrowBackUp, IconArrowForwardUp } from "@tabler/icons-react";
import { Button } from "antd";

const EmailActionButtons = ({
  email,
  onReply,
  onForward,
  loading = {},
}) => {
  if (!email) return null;

  return (
    <Group
      p="md"
      style={{
        borderTop: "1px solid #e9ecef",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Button
        type="primary"
        icon={<IconArrowBackUp size={16} />}
        onClick={() => onReply?.(false)}
        loading={loading.reply}
      >
        Balas
      </Button>

      <Button
        icon={<IconArrowForwardUp size={16} />}
        onClick={onForward}
        loading={loading.forward}
      >
        Teruskan
      </Button>
    </Group>
  );
};

export default EmailActionButtons;
