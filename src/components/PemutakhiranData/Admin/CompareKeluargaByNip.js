import { rwAnakByNip, rwPasanganByNip } from "@/services/master.services";
import { getRiwayatKeluargaByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table, Typography } from "antd";

const DataAnakMaster = ({ data, isLoading }) => {
  const columns = [
    { title: "Nama", dataIndex: "nama" },
    { title: "Tanggal Lahir", dataIndex: "tgl_lahir" },
    {
      title: "Pekerjaan Anak",
      key: "pekerjaan_anak",
      render: (_, row) => <>{row?.pekerjaan_anak?.pekerjaan}</>,
    },
    {
      title: "Nama Pasangan",
      key: "nama_pasangan",
      render: (_, row) => <>{row?.rwyt_suami_istri?.nama_suami_istri}</>,
    },
    {
      title: "Status Anak",
      key: "status_anak",
      render: (_, row) => <>{row?.status_anak?.status_anak}</>,
    },
  ];
  return (
    <>
      <Table
        title={() => (
          <Typography.Paragraph>Data Anak SIMASTER</Typography.Paragraph>
        )}
        pagination={false}
        columns={columns}
        rowKey={(row) => row?.anak_id}
        dataSource={data}
        loading={isLoading}
      />
    </>
  );
};
const DataPasanganMaster = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama_suami_istri",
    },
    {
      title: "Status",
      dataIndex: "aktif",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lahir",
    },
    {
      title: "Tunjangan",
      dataIndex: "tunjangan",
    },
  ];
  return (
    <>
      <Table
        title={() => (
          <Typography.Paragraph>Data Pasangan SIMASTER</Typography.Paragraph>
        )}
        columns={columns}
        rowKey={(row) => row?.suami_istri_id}
        pagination={false}
        dataSource={data}
        loading={isLoading}
      />
    </>
  );
};

const DataAnak = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Status Kawin",
      dataIndex: "jenis_kawin_nama",
    },
    {
      title: "Jenis Anak",
      dataIndex: "jenis_anak_nama",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lhr",
    },
  ];

  return (
    <Table
      columns={columns}
      title={() => <Typography.Paragraph>Data Anak SIASN</Typography.Paragraph>}
      dataSource={data}
      loading={isLoading}
      pagination={false}
    />
  );
};

const DataIstri = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Status PNS",
      dataIndex: "is_pns_string",
    },
    {
      title: "NIP",
      dataIndex: "nip",
    },
    {
      title: "Status Hidup",
      dataIndex: "status_hidup",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lhr",
    },
    {
      title: "Tanggal Meninggal",
      dataIndex: "tgl_meninggal",
    },
  ];

  return (
    <Table
      columns={columns}
      title={() => (
        <Typography.Paragraph>Data Istri SIASN</Typography.Paragraph>
      )}
      dataSource={data}
      loading={isLoading}
      pagination={false}
    />
  );
};

const DataOrtu = ({ data, isLoading }) => {
  const columns = [
    {
      title: "Nama",
      dataIndex: "nama",
    },
    {
      title: "Tanggal Lahir",
      dataIndex: "tgl_lhr",
    },
  ];

  return (
    <Table
      columns={columns}
      title={() => <Typography.Paragraph>Data Ortu SIASN</Typography.Paragraph>}
      dataSource={data}
      loading={isLoading}
      pagination={false}
    />
  );
};

function CompareKeluargaByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["pns-rw-keluarga", nip],
    () => getRiwayatKeluargaByNip(nip),
    {
      enabled: !!nip,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const { data: dataPasanganMaster, isLoading: isLoadingPasanganMaster } =
    useQuery(["data-pasangan-master", nip], () => rwPasanganByNip(nip), {});

  const { data: dataAnakMaster, isLoading: isLoadingAnakMaster } = useQuery(
    ["data-anak-master", nip],
    () => rwAnakByNip(nip)
  );

  return (
    <Card title="Padanan Data Keluarga">
      <Stack>
        <DataAnak data={data?.anak} isLoading={isLoading} />
        <DataIstri data={data?.pasangan} isLoading={isLoading} />
        {/* <DataOrtu data={data?.ortu} isLoading={isLoading} /> */}
      </Stack>
      <Stack>
        <DataPasanganMaster
          data={dataPasanganMaster}
          isLoading={isLoadingPasanganMaster}
        />
        <DataAnakMaster data={dataAnakMaster} loading={isLoadingAnakMaster} />
      </Stack>
    </Card>
  );
}

export default CompareKeluargaByNip;
