import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRekamanVerbatim } from "@/services/assesor-ai.services";
import { Button, Table, Space, message, Modal } from "antd";
import { splitAudioVerbatim } from "@/services/assesor-ai.services";
import dayjs from "dayjs";
import Link from "next/link";

const SplitAudioButton = ({ id }) => {
  const queryClient = useQueryClient();
  const { mutateAsync: splitAudio, isLoading: isSplitting } = useMutation({
    mutationFn: splitAudioVerbatim,
    onSuccess: () => {
      message.success("Audio berhasil di split");
      queryClient.invalidateQueries({ queryKey: ["get-rekaman-verbatim"] });
    },
    onError: () => {
      message.error("Audio gagal di split");
    },
  });

  const handleSplitAudio = () => {
    Modal.confirm({
      title: "Split Audio",
      content: "Apakah anda yakin ingin memsplit audio?",
      onOk: async () => await splitAudio(id),
    });
  };

  return (
    <Space>
      <Button type="primary" onClick={handleSplitAudio} loading={isSplitting}>
        Split Audio
      </Button>
    </Space>
  );
};

function AudioPlayer({ src }) {
  return (
    <div>
      <audio controls>
        <source src={src} type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
    </div>
  );
}

const DaftarVerbatim = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["get-rekaman-verbatim"],
    queryFn: getRekamanVerbatim,
    keepPreviousData: true,
  });

  const columns = [
    {
      title: "Judul",
      dataIndex: "judul",
    },
    { title: "Status", dataIndex: "status" },
    {
      title: "Nama Asesor",
      dataIndex: "nama_asesor",
    },
    {
      title: "Nama Asesi",
      dataIndex: "nama_asesi",
    },
    {
      title: "Tanggal Wawancara",
      dataIndex: "tgl_wawancara",
      render: (text) => dayjs(text).format("DD-MM-YYYY"),
    },
    {
      title: "File",
      dataIndex: "file_path",
      render: (text) => (
        <AudioPlayer src={`https://siasn.bkd.jatimprov.go.id:9000${text}`} />
      ),
    },
    {
      title: "Aksi",
      dataIndex: "aksi",
      render: (text, record) => {
        return (
          <Space>
            <SplitAudioButton id={record.id} />
            <Link href={`/ai-tools/verbatim/${record.id}`}>Detail</Link>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Table
        pagination={false}
        dataSource={data}
        loading={isLoading}
        columns={columns}
      />
    </div>
  );
};

export default DaftarVerbatim;
