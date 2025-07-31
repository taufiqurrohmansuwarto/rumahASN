import { cltnByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Typography } from "antd";
import React from "react";

function CompareCLTNByNip({ nip }) {
  const { data, isLoading } = useQuery(["cltn", nip], () => cltnByNip(nip), {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
    staleTime: 500000,
  });
  const columns = [
    {
      title: "File SK",
      key: "filesk",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[884] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[884]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "File Pertek",
      key: "filepertek",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[885] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[885]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Nomer SK",
      dataIndex: "skNomor",
    },
    {
      title: "Tanggal SK",
      dataIndex: "skTanggal",
    },
    {
      title: "Tanggal Awal",
      dataIndex: "tanggalAwal",
    },
    {
      title: "Tanggal Akhir",
      dataIndex: "tanggalAkhir",
    },
    {
      title: "Tanggal Aktif",
      dataIndex: "tanggalAktif",
    },
    {
      title: "Nomer Letter BKN",
      dataIndex: "nomorLetterBkn",
    },
  ];

  return (
    <Card title="CLTN">
      <Table
        columns={columns}
        pagination={false}
        dataSource={data}
        loading={isLoading}
      />
    </Card>
  );
}

export default CompareCLTNByNip;
