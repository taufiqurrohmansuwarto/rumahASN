import { rwAngkakreditMasterByNip } from "@/services/master.services";
import { getRwAngkakreditByNip } from "@/services/siasn-services";
import { FileAddOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, Table, Typography } from "antd";
import { useState } from "react";
import AlertAngkaKredit from "../AlertAngkaKredit";

// const data = {
//     bulanMulaiPenilaian: "string",
//     bulanSelesaiPenilaian: "string",
//     id: "string",
//     isAngkaKreditPertama: "string",
//     kreditBaruTotal: "string",
//     kreditPenunjangBaru: "string",
//     kreditUtamaBaru: "string",
//     nomorSk: "string",
//     path: [
//         {
//             dok_id: "string",
//             dok_nama: "string",
//             dok_uri: "string",
//             object: "string",
//             slug: "string"
//         }
//     ],
//     pnsId: "string",
//     pnsUserId: "string",
//     rwJabatanId: "string",
//     tahunMulaiPenilaian: "string",
//     tahunSelesaiPenilaian: "string",
//     tanggalSk: "string"
// };

function CompareAngkaKreditByNip({ nip }) {
  const { data, isLoading } = useQuery(["angka-kredit", nip], () =>
    getRwAngkakreditByNip(nip)
  );

  const { data: dataRwAngkakredit, isLoading: isLoadingAngkaKredit } = useQuery(
    ["angkat-kredit-master", nip],
    () => rwAngkakreditMasterByNip(nip)
  );

  const [visible, setVisible] = useState(false);

  const handleVisible = () => setVisible(true);
  const handleCancel = () => setVisible(false);

  const columns = [
    {
      title: "File",
      key: "path",
      render: (_, record) => {
        return (
          <>
            {record?.path?.[879] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[879]?.dok_uri}`}
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
      title: "Nomor SK",
      dataIndex: "nomorSk",
    },
    {
      title: "Bulan Mulai Penilaian",
      dataIndex: "bulanMulaiPenailan",
    },
    {
      title: "Tahun Mulai Penilaian",
      dataIndex: "tahunMulaiPenailan",
    },
    {
      title: "Bulan Selesai Penilaian",
      dataIndex: "bulanSelesaiPenailan",
    },
    {
      title: "Tahun Selesai Penilaian",
      dataIndex: "tahunSelesaiPenailan",
    },
    {
      title: "Kredit Utama Baru",
      dataIndex: "kreditUtamaBaru",
    },
    {
      title: "Kredit Penunjang Baru",
      dataIndex: "kreditPenunjangBaru",
    },
    {
      title: "Kredit Baru Total",
      dataIndex: "kreditBaruTotal",
    },
    {
      title: "Nama Jabatan",
      dataIndex: "namaJabatan",
    },
  ];

  const columnsMaster = [
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <a href={record?.file_pak} target="_blank" rel="noreferrer">
            File
          </a>
        );
      },
    },
    {
      title: "Nomor SK",
      dataIndex: "no_sk",
    },
    {
      title: "Kredit Utama Baru",
      dataIndex: "nilai_unsur_utama_baru",
    },

    {
      title: "Kredit Baru Total",
      dataIndex: "nilai_pak",
    },
  ];

  return (
    <Card loading={isLoading || isLoadingAngkaKredit}>
      <Stack>
        <AlertAngkaKredit />
        <Table
          columns={columns}
          rowKey={(record) => record.id}
          pagination={false}
          loading={isLoading}
          dataSource={data}
        />
        <Table
          title={() => <Typography.Text>Angka Kredit SIMASTER</Typography.Text>}
          columns={columnsMaster}
          rowKey={(record) => record.pak_id}
          pagination={false}
          loading={isLoadingAngkaKredit}
          dataSource={dataRwAngkakredit}
        />
      </Stack>
    </Card>
  );
}

export default CompareAngkaKreditByNip;
