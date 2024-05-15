import { getRwKinerjaPeriodikByNip } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import React from "react";

const CompareKinerjaPeriodikNip = ({ nip }) => {
  const { data, isLoading } = useQuery(
    ["kinerja-periodik", nip],
    () => getRwKinerjaPeriodikByNip(nip),
    {}
  );

  const columns = [
    { title: "Tahun", dataIndex: "tahun" },
    { title: "Bulan Mulai", dataIndex: "bulanMulaiPenilaian" },
    { title: "Bulan Selesai", dataIndex: "bulanSelesaiPenilaian" },
    { title: "Kuadran Kinerja", dataIndex: "kuadranKinerjaNilai" },
    { title: "Presentase", dataIndex: "persentase" },
    { title: "Jabatan", dataIndex: "jabatan" },
    { title: "Koefisien", dataIndex: "koefisen" },
    { title: "" },
  ];

  return (
    <Card title="Kinerja Periodik" id="kinerja-periodik">
      <Table
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
      />
    </Card>
  );
};

export default CompareKinerjaPeriodikNip;
