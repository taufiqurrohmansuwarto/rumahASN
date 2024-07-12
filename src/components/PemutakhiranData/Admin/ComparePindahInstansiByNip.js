import { rwPindahByNip } from "@/services/master.services";
import { getRwPindahInstansiByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";

function ComparePindahInstansiByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["rw-pindah-instansi", nip],
    () => getRwPindahInstansiByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
    }
  );

  const { data: pindahSimaster, isLoading: isLoadingPindahSimaster } = useQuery(
    ["rw-pindah-simaster", nip],
    () => rwPindahByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
    }
  );

  const columns = [
    {
      title: "Nomer BKN",
      dataIndex: "skBknNomor",
    },
    {
      title: "Tanggal SK BKN",
      dataIndex: "skBknTanggal",
    },
    {
      title: "TMT Pindah Instansi",
      dataIndex: "tmtPi",
    },
    {
      title: "Nomer SK Asal",
      dataIndex: "skAsalNomor",
    },
    {
      title: "Nomer Tanggal SK Asal",
      dataIndex: "skAsalTanggal",
    },
    {
      title: "Nomer SK Tujuan",
      dataIndex: "skTujuanNomor",
    },
    {
      title: "Tanggal SK Tujuan",
      dataIndex: "skTujuanTanggal",
    },
    { title: "Jenis", dataIndex: "jenisPi" },
  ];

  const masterColumn = [
    {
      title: "Pindah",
      key: "file_pindah",
      render: (_, record) => (
        <a href={record?.file_pindah} target="_blank" rel="noreferrer">
          File
        </a>
      ),
    },
    {
      title: "SPMT",
      key: "file_spmt",
      render: (_, record) => (
        <a href={record?.file_spmt} target="_blank" rel="noreferrer">
          File
        </a>
      ),
    },
    {
      title: "Jenis Pindah",
      key: "jenis_pindah",
      render: (_, record) => <div>{record?.jenis_pindah?.jenis_pindah}</div>,
    },
    {
      title: "Nomer SK",
      dataIndex: "no_sk",
    },
    {
      title: "Tanggal SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "TMT Pindah",
      dataIndex: "tmt_pindah",
    },
    {
      title: "Induk Asal",
      dataIndex: "induk_asal",
    },
    {
      title: "Instansi Asal",
      dataIndex: "instansi_asal",
    },
    {
      title: "Induk Tujuan",
      dataIndex: "induk_tujuan",
    },
    {
      title: "Instansi Tujuan",
      dataIndex: "instansi_tujuan",
    },
    {
      title: "Aktif",
      dataIndex: "aktif",
    },
  ];

  return (
    <Card title="Riwayat Pindah Instansi">
      <Stack>
        <Table
          title={() => "SIASN"}
          columns={columns}
          pagination={false}
          dataSource={data}
          loading={isLoading}
          rowKey={(row) => row?.id}
        />
        <Table
          title={() => "SIMASTER"}
          columns={masterColumn}
          pagination={false}
          dataSource={pindahSimaster}
          loading={isLoading}
          rowKey={(row) => row?.pindah_id}
        />
      </Stack>
    </Card>
  );
}

export default ComparePindahInstansiByNip;
