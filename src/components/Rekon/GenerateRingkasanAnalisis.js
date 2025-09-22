import { generateRingkasanAnalisisPangkat } from "@/services/rekon.services";
import { useMutation } from "@tanstack/react-query";
import { Button, message, Modal } from "antd";
import { useSession } from "next-auth/react";
import React from "react";

const GenerateRingkasanAnalisis = ({ periode }) => {
  const { data } = useSession();

  const { mutate, isLoading } = useMutation(
    (data) => generateRingkasanAnalisisPangkat(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat ringkasan analisis");
      },
      onError: (error) => {
        message.error(
          `Gagal membuat ringkasan: ${error.message || "Terjadi kesalahan"}`
        );
      },
    }
  );

  const handleGenerate = () => {
    Modal.confirm({
      title: "Konfirmasi Generate Ringkasan",
      content:
        "Apakah Anda yakin ingin membuat ringkasan analisis untuk periode ini?",
      okText: "Ya, Generate",
      cancelText: "Batal",
      onOk: () => {
        mutate({ tmtKp: periode });
      },
    });
  };

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <Button
          type="primary"
          onClick={handleGenerate}
          loading={isLoading}
          size="small"
        >
          Generate
        </Button>
      )}
    </>
  );
};

export default GenerateRingkasanAnalisis;
