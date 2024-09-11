import React from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { findUsulanDetailByAdmin } from "@/services/perencanaan.services";
import { Table, Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";

function UsulanPerencanaanDetailAdmin() {
  const router = useRouter();
  const { data, isLoading } = useQuery(
    ["usulan-detail", router.query.id],
    () => findUsulanDetailByAdmin(router.query.id),
    {
      enabled: !!router.query.id,
    }
  );

  const columns = [
    {
      title: "No",
      dataIndex: "no",
      render: (_, record, index) => index + 1,
    },
    {
      title: "Nama Jabatan",
      key: "jabatan",
      render: (_, record) => record?.pelaksana?.name,
    },
    {
      title: "Kelas",
      key: "kelas",
      render: (_, record) => record?.pelaksana?.kelas_jab,
    },
    {
      title: "Pendidikan",
      key: "pendidikan",
      render: (_, record) => record?.pendidikan?.nama,
    },
    {
      title: "Dibuat oleh",
      key: "user",
      render: (_, record) => record?.user?.username,
    },
    {
      title: "Perangkat Daerah",
      key: "opd",
      render: (_, record) =>
        record?.detailOpd?.detail?.map((d) => d?.name)?.join("-"),
    },
  ];

  const handleDownload = () => {
    const hasil = data?.map((d) => ({
      nama: d.pelaksana.name,
      jabatan: d.pelaksana.jabatan,
      kelas: d.pelaksana.kelas_jab,
      pendidikan: d.pendidikan.nama,
      opd: d.detailOpd.detail.map((d) => d?.name)?.join("-"),
    }));
    const ws = XLSX.utils.json_to_sheet(hasil);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Usulan Perencanaan Detail");
    XLSX.writeFile(wb, "data.xlsx");
  };

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        icon={<DownloadOutlined />}
        onClick={handleDownload}
      >
        Download
      </Button>
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
      />
    </div>
  );
}

export default UsulanPerencanaanDetailAdmin;
