import { rwPendidikan } from "@/services/master.services";
import { dataPendidikan } from "@/services/siasn-services";
import { FileOutlined, FilePdfTwoTone } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Descriptions, Space, Table, Tooltip } from "antd";

const CompareDataPendidikanSIMASTER = () => {
  const { data, isLoading } = useQuery(
    ["riwayat-pendidikan-simaster"],
    () => rwPendidikan(),
    {}
  );

  const columns = [
    {
      title: "Data",
      responsive: ["xs"],
      key: "data",
      render: (_, record) => {
        return (
          <Space direction="vertical">
            <Space>
              <Tooltip title="Nilai">
                {record?.file_nilai_url && (
                  <a
                    href={record?.file_nilai_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FilePdfTwoTone color="orange" />
                  </a>
                )}
              </Tooltip>
              <Tooltip title="Ijazah">
                {record?.file_ijazah_url && (
                  <a
                    href={record?.file_ijazah_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FilePdfTwoTone color="orange" />
                  </a>
                )}
              </Tooltip>
            </Space>
            <Descriptions size="middle" layout="vertical">
              <Descriptions.Item label="Pendidikan">
                {record?.jenjang}
              </Descriptions.Item>
              <Descriptions.Item label="Tahun Lulus">
                {record?.tahun_lulus}
              </Descriptions.Item>
              <Descriptions.Item label="No. Ijazah">
                {record?.no_ijazah}
              </Descriptions.Item>
              <Descriptions.Item label="Nama Sekolah">
                {record?.nama_sekolah}
              </Descriptions.Item>
              <Descriptions.Item label="Prodi">
                {record?.prodi}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        );
      },
    },
    {
      title: "File",
      responsive: ["sm"],
      key: "file",
      render: (_, record) => {
        return (
          <Space>
            <Tooltip title="Nilai">
              {record?.file_nilai_url && (
                <a
                  href={record?.file_nilai_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfTwoTone color="orange" />
                </a>
              )}
            </Tooltip>
            <Tooltip title="Ijazah">
              {record?.file_ijazah_url && (
                <a
                  href={record?.file_ijazah_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfTwoTone color="orange" />
                </a>
              )}
            </Tooltip>
          </Space>
        );
      },
    },
    { title: "Pendidikan", dataIndex: "jenjang", responsive: ["sm"] },
    { title: "Tahun Lulus", dataIndex: "tahun_lulus", responsive: ["sm"] },
    { title: "No. Ijazah", dataIndex: "no_ijazah", responsive: ["sm"] },
    { title: "Nama Sekolah", dataIndex: "nama_sekolah", responsive: ["sm"] },
    { title: "Prodi", dataIndex: "prodi", responsive: ["sm"] },
  ];

  return (
    <>
      <Table
        title={() => <b>SIMASTER</b>}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        pagination={false}
      />
    </>
  );
};

function CompareDataPendidikan() {
  const { data, isLoading } = useQuery(
    ["riwayat-pendidikan"],
    () => dataPendidikan(),
    {}
  );

  const columns = [
    {
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (_, row) => {
        return (
          <Space direction="vertical">
            <Space>
              <div>
                {row?.path?.[1173] && (
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1173]?.dok_uri}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileOutlined />
                  </a>
                )}
              </div>
              <div>
                {row?.path?.[1174] && (
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1174]?.dok_uri}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileOutlined />
                  </a>
                )}
              </div>
              <div>
                {row?.path?.[867] && (
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[867]?.dok_uri}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FileOutlined />
                  </a>
                )}
              </div>
            </Space>
            <Descriptions size="middle" layout="vertical">
              <Descriptions.Item label="Pendidikan">
                {row?.pendidikanNama}
              </Descriptions.Item>
              <Descriptions.Item label="Tahun Lulus">
                {row?.tahunLulus}
              </Descriptions.Item>
              <Descriptions.Item label="No. Ijazah">
                {row?.nomorIjasah}
              </Descriptions.Item>
              <Descriptions.Item label="Nama Sekolah">
                {row?.namaSekolah}
              </Descriptions.Item>
              <Descriptions.Item label="Gelar Depan">
                {row?.gelarDepan}
              </Descriptions.Item>
              <Descriptions.Item label="Gelar Belakang">
                {row?.gelarBelakang}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        );
      },
    },
    {
      title: "File",
      key: "file",
      responsive: ["sm"],
      render: (_, row) => {
        return (
          <Space>
            <div>
              {row?.path?.[1173] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1173]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileOutlined />
                </a>
              )}
            </div>
            <div>
              {row?.path?.[1174] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[1174]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileOutlined />
                </a>
              )}
            </div>
            <div>
              {row?.path?.[867] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[867]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FileOutlined />
                </a>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: "Pendidikan",
      responsive: ["sm"],
      dataIndex: "pendidikanNama",
    },
    {
      title: "Tahun Lulus",
      responsive: ["sm"],
      dataIndex: "tahunLulus",
    },
    {
      title: "No. Ijazah",
      responsive: ["sm"],
      dataIndex: "nomorIjasah",
    },
    {
      title: "Nama Sekolah",
      responsive: ["sm"],
      dataIndex: "namaSekolah",
    },
    {
      title: "Gelar Depan",
      responsive: ["sm"],
      dataIndex: "gelarDepan",
    },
    {
      title: "Gelar Belakang",
      responsive: ["sm"],
      dataIndex: "gelarBelakang",
    },
    {
      title: "Tgl. Lulus",
      responsive: ["sm"],
      dataIndex: "tglLulus",
    },
  ];

  return (
    <Stack>
      <Table
        title={() => <b>SIASN</b>}
        pagination={false}
        columns={columns}
        dataSource={data}
        loading={isLoading}
        rowKey={(row) => row?.id}
      />
      <CompareDataPendidikanSIMASTER />
    </Stack>
  );
}

export default CompareDataPendidikan;
