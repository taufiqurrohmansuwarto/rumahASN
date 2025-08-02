import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getRekamanVerbatim } from "@/services/assesor-ai.services";
import { Table } from "antd";
import dayjs from "dayjs";

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
