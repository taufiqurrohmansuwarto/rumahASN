import { rwJabGuruByNip } from "@/services/master.services";
import { useQuery } from "@tanstack/react-query";
import { Table } from "antd";
import React from "react";

function CompareJabatanGuruByNip({ nip }) {
  const { data, isLoading } = useQuery(["rw-jabatan-guru", nip], () =>
    rwJabGuruByNip(nip)
  );

  const columns = [
    { title: "Sekolah Induk", dataIndex: "sekolah_induk" },
    { title: "Sekolah Mengajar", dataIndex: "sekolah_mengajar" },
    { title: "No. SK", dataIndex: "no_sk" },
    { title: "Tanggal SK", dataIndex: "tgl_sk" },
    {
      title: "Jenis PTK",
      key: "jenis_ptk",
      render: (_, row) => row?.ptk?.jenis_ptk,
    },
    {
      title: "Mapel",
      key: "mapel",
      render: (_, row) => row?.mapel?.mapel,
    },
    {
      title: "Aktif",
      dataIndex: "aktif",
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.guru_id}
        pagination={false}
      />
    </div>
  );
}

export default CompareJabatanGuruByNip;
