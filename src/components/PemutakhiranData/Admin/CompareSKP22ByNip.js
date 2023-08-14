import { rwSkpMasterByNip } from "@/services/master.services";
import { getRwSkp22ByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import { useState } from "react";
import AlertSKP22 from "../AlertSKP22";

// const data = {
//     hasilKinerjaNilai: 0,
//     id: "string",
//     kuadranKinerjaNilai: 0,
//     path: [
//         {
//             dok_id: "string",
//             dok_nama: "string",
//             dok_uri: "string",
//             object: "string",
//             slug: "string"
//         }
//     ],
//     penilaiGolongan: "string",
//     penilaiJabatan: "string",
//     penilaiNama: "string",
//     penilaiNipNrp: "string",
//     penilaiUnorNama: "string",
//     perilakuKerjaNilai: 0,
//     pnsDinilaiOrang: "string",
//     statusPenilai: "string",
//     tahun: 0
// };

function CompareSKP22ByNip({ nip }) {
  const [visible, setVisible] = useState(false);

  const handleVisible = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const { data, isLoading } = useQuery(["data-skp-22", nip], () =>
    getRwSkp22ByNip(nip)
  );

  const { data: dataMaster, isLoading: isLoadingMaster } = useQuery(
    ["data-master-skp-by-nip", nip],
    () => rwSkpMasterByNip(nip)
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[873] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[873]?.dok_uri}`}
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
      title: "Hasil Kinerja",
      dataIndex: "hasilKinerja",
    },
    {
      title: "Hasil Kinerja Nilai",
      dataIndex: "hasilKinerjaNilai",
    },
    {
      title: "Kuadran Kinerja",
      dataIndex: "kuadranKinerja",
    },
    {
      title: "Nama Penilai",
      dataIndex: "namaPenilai",
    },
    {
      title: "Unor Penilai",
      dataIndex: "penilaiUnorNm",
    },
    {
      title: "Perilaku Kerja",
      dataIndex: "perilakuKerja",
    },
    {
      title: "Perilaku Kerja Nilai",
      dataIndex: "PerilakuKerjaNilai",
    },
    {
      title: "Status Penilai",
      dataIndex: "statusPenilai",
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
  ];

  const columnMaster = [
    {
      title: "File",
      key: "file_skp",
      render: (_, record) => (
        <a href={record?.file_skp} target="_blank" rel="noreferrer">
          File
        </a>
      ),
      width: 100,
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
    },
    {
      title: "Hasil Kerja",
      dataIndex: "hasil_kerja",
    },
    {
      title: "Perilaku Kerja",
      dataIndex: "perilaku",
    },
  ];

  return (
    <Card title="Komparasi SKP 2022" loading={isLoading || isLoadingMaster}>
      <Stack>
        <AlertSKP22 />
        <Table
          pagination={false}
          columns={columns}
          loading={isLoading}
          rowKey={(row) => row?.id}
          dataSource={data}
        />
        <Table
          pagination={false}
          columns={columnMaster}
          loading={isLoadingMaster}
          rowKey={(row) => row?.skp_id}
          dataSource={dataMaster}
        />
      </Stack>
    </Card>
  );
}

export default CompareSKP22ByNip;
