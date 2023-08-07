import { rwJabatanMasterByNip } from "@/services/master.services";
import { getRwJabatanByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";
import { useState } from "react";
import AlertJabatan from "../AlertJabatan";

const format = "DD-MM-YYYY";

const checkJenisJabatan = (data) => {
  let result = "";
  const jabatanPelaksana = !!data?.jabatanFungsionalUmumNama;
  const jabatanFungsional = !!data?.jabatanFungsionalNama;
  const jabatanStruktural = !!data?.namaJabatan;

  if (jabatanFungsional) {
    result = "Fungsional";
  } else if (jabatanPelaksana) {
    result = "Pelaksana";
  } else if (jabatanStruktural) {
    result = "Struktural";
  }

  return result;
};

const namaJabatan = (data) => {
  let result = "";
  const jabatanPelaksana = !!data?.jabatanFungsionalUmumNama;
  const jabatanFungsional = !!data?.jabatanFungsionalNama;
  const jabatanStruktural = !!data?.namaJabatan;

  if (jabatanFungsional) {
    result = data?.jabatanFungsionalNama;
  } else if (jabatanPelaksana) {
    result = data?.jabatanFungsionalUmumNama;
  } else if (jabatanStruktural) {
    result = data?.namaJabatan;
  }

  return result;
};

const jenisJabatanSiasn = (data) => {
  const { jenis_jabatan_nama } = data;
  let result = "";
  if (jenis_jabatan_nama === "Jabatan Struktural") {
    result = "Struktural";
  } else if (jenis_jabatan_nama === "Jabatan Fungsional Tertentu") {
    result = "Fungsional";
  } else if (jenis_jabatan_nama === "Jabatan Fungsional Umum") {
    result = "Pelaksana";
  }

  return result;
};

function CompareJabatanByNip({ nip }) {
  const [visible, setVisible] = useState(false);
  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);

  const { data, isLoading } = useQuery(["data-jabatan", nip], () =>
    getRwJabatanByNip(nip)
  );

  const { data: dataMaster, isLoading: loadingMasterJabatan } = useQuery(
    ["data-rw-jabatan-master", nip],
    () => rwJabatanMasterByNip(nip)
  );

  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[872] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[872]?.dok_uri}`}
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
      title: "Jenis",
      key: "jenis_jabatan",
      render: (row) => <div>{checkJenisJabatan(row)}</div>,
    },
    {
      title: "Jabatan",
      key: "nama_jabatan",

      render: (row) => <div>{namaJabatan(row)}</div>,
    },

    {
      title: "Unor",
      dataIndex: "unorNama",
    },
    { title: "No. SK", dataIndex: "nomorSk", key: "nomorSk" },
    { title: "TMT Jab", dataIndex: "tmtJabatan", key: "tmtJabatan" },
    { title: "Tgl SK", dataIndex: "tanggalSk", key: "tanggalSk" },
  ];

  const columnsMaster = [
    {
      title: "Jenis",
      dataIndex: "jenis_jabatan",
      render: (_, record) => {
        return (
          <div>
            <a href={record?.file} target="_blank" rel="noreferrer">
              {record?.jenis_jabatan}
            </a>
          </div>
        );
      },
    },
    {
      title: "Jabatan",
      key: "jabatan",
      dataIndex: "jabatan",
    },
    {
      title: "Unor",
      key: "unor",
      dataIndex: "unor",
    },
    { title: "No. SK", dataIndex: "nomor_sk", key: "nomor_sk" },
    { title: "TMT. Jab", dataIndex: "tmt_jabatan", key: "tmt_jabatan" },
    { title: "Tgl. SK", dataIndex: "tgl_sk", key: "tgl_sk" },
    { title: "Aktif", dataIndex: "aktif", key: "aktif" },
  ];

  return (
    <Card loading={isLoading} title="Komparasi Jabatan">
      <Stack>
        <AlertJabatan />
        <Table
          columns={columns}
          dataSource={data}
          loading={isLoading}
          rowKey={(row) => row?.id}
          pagination={false}
        />
        <Table
          title={() => `Jabatan Aplikasi SIMASTER`}
          columns={columnsMaster}
          dataSource={dataMaster}
          loading={loadingMasterJabatan}
          rowKey={(row) => row?.id}
          pagination={false}
        />
      </Stack>
    </Card>
  );
}

export default CompareJabatanByNip;
