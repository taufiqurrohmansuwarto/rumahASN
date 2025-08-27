import { flushContent } from "@/services/knowledge-management.services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";

const ButtonFlush = () => {
  const { mutate, isLoading } = useMutation(() => flushContent(), {
    onSuccess: () => {
      message.success("Content flushed successfully");
    },
    onError: () => {
      message.error("Failed to flush content");
    },
  });

  return (
    <Button type="primary" onClick={() => mutate()} loading={isLoading}>
      Flush
    </Button>
  );
};

export default ButtonFlush;
