import { rwPendidikanMasterByNip } from "@/services/master.services";
import { dataPendidikanByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Card, Table } from "antd";

const CompareDataPendidikanSIMASTER = ({ nip }) => {
  const { data, isLoading } = useQuery(
    ["riwayat-pendidikan-simaster-by-nip", nip],
    () => rwPendidikanMasterByNip(nip),
    {}
  );

  const columns = [
    {
      title: "File Nilai",
      key: "file_nilai",
      render: (text, record) => {
        return (
          <>
            {record?.file_nilai_url && (
              <a href={record?.file_nilai_url} target="_blank" rel="noreferrer">
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "File Ijazah",
      key: "file_nilai",
      render: (text, record) => {
        return (
          <>
            {record?.file_ijazah_url && (
              <a
                href={record?.file_ijazah_url}
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
    { title: "Pendidikan", dataIndex: "jenjang" },
    { title: "Tahun Lulus", dataIndex: "tahun_lulus" },
    { title: "No. Ijazah", dataIndex: "no_ijazah" },
    { title: "Nama Sekolah", dataIndex: "nama_sekolah" },
    { title: "Prodi", dataIndex: "prodi" },
  ];

  return (
    <>
      <Table
        title={() => <b>PENDIDIKAN SIMASTER</b>}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={false}
      />
    </>
  );
};

function ComparePendidikanByNip({ nip }) {
  const { data, isLoading } = useQuery(
    ["riwayat-pendidikan-by-nip", nip],
    () => dataPendidikanByNip(nip),
    {}
  );

  const columns = [
    {
      title: "Pendidikan",
      dataIndex: "pendidikanNama",
    },
    {
      title: "Nama Sekolah",
      dataIndex: "namaSekolah",
    },
    {
      title: "Nomor Ijazah",
      dataIndex: "nomorIjasah",
    },
    {
      title: "Gelar Depan",
      dataIndex: "gelarDepan",
    },
    {
      title: "Gelar Belakang",
      dataIndex: "gelarBelakang",
    },
    {
      title: "Tahun Lulus",
      dataIndex: "tahunLulus",
    },
    {
      title: "Tgl. Lulus",
      dataIndex: "tglLulus",
    },
  ];

  return (
    <Card title="Komparasi Pendidikan">
      <Stack>
        <Table
          title={() => <b>PENDIDIKAN SIASN</b>}
          pagination={false}
          columns={columns}
          dataSource={data}
          loading={isLoading}
          rowKey={(row) => row?.id}
        />
        <CompareDataPendidikanSIMASTER nip={nip} />
      </Stack>
    </Card>
  );
}

export default ComparePendidikanByNip;
