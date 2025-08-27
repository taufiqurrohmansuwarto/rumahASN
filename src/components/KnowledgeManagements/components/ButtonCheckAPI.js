import { Button, message } from "antd";
import { awardUserXP } from "@/services/knowledge-management.services";
import { useMutation } from "@tanstack/react-query";

const ButtonCheckAPI = () => {
  const { mutate: sendXp, isLoading: isSendingXp } = useMutation(
    (data) => awardUserXP(data),
    {
      onSuccess: () => {
        message.success("Berhasil menambahkan XP");
      },
      onError: () => {
        message.error("Gagal menambahkan XP");
      },
    }
  );

  const handleCheckAPI = async () => {
    const payload = {
      action: "quest_complete",
      refType: "mission",
      refId: "mission_001",
      xp: 50,
    };
    sendXp(payload);
  };

  return (
    <Button type="primary" onClick={handleCheckAPI} loading={isSendingXp}>
      Check API
    </Button>
  );
};

export default ButtonCheckAPI;
