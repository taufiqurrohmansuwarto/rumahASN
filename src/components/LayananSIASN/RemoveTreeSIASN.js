import { removeBackup } from "@/services/siasn-services";
import { useMutation } from "@tanstack/react-query";
import { Button, message } from "antd";
import React from "react";

function RemoveTreeSIASN() {
  const { mutate, isLoading } = useMutation((data) => removeBackup(data), {
    onSuccess: () => {
      message.success("Data berhasil dihapus");
    },
    onError: (error) => {
      message.error(error?.response?.data?.message);
    },
  });

  return (
    <Button onClick={() => mutate()} loading={isLoading} danger>
      Hapus Data
    </Button>
  );
}

export default RemoveTreeSIASN;
