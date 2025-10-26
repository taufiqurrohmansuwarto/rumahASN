import React from "react";
import { Button, message, Modal } from "antd";
import { flushDataPengajuan } from "@/services/kominfo-submissions.services";
import { useMutation } from "@tanstack/react-query";

function FlushAdmin() {
  const { mutateAsync, isLoading } = useMutation(() => flushDataPengajuan(), {
    onSuccess: () => {
      message.success("Data pengajuan TTE berhasil dihapus", {
        key: "flush",
      });
    },
    onError: () => {
      message.error("Gagal menghapus data pengajuan TTE");
    },
  });

  const handleFlush = () => {
    Modal.confirm({
      title: "Hapus Data Pengajuan TTE",
      content: "Apakah anda yakin ingin menghapus data pengajuan TTE?",
      okText: "Ya",
      cancelText: "Batal",
      onOk: async () => {
        await mutateAsync();
      },
    });
  };

  return (
    <div>
      <Button type="primary" onClick={handleFlush} loading={isLoading}>
        Flush
      </Button>
    </div>
  );
}

export default FlushAdmin;
