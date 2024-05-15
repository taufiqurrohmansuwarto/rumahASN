import { getRwKinerjaPeriodikByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Flex, Table } from "antd";
import React from "react";
import CreateKinerjaPeriodik from "./CreateKinerjaPeriodik";

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
    { title: "Aksi", key: "aksi", render: (_, row) => <a>Hapus</a> },
  ];

  return (
    <Card title="Kinerja Periodik" id="kinerja-periodik">
      <div style={{ marginBottom: 10 }}>
        <CreateKinerjaPeriodik />
      </div>
      <Flex vertical gap={10}>
        <Table
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={isLoading}
        />
      </Flex>
    </Card>
  );
};

export default CompareKinerjaPeriodikNip;
