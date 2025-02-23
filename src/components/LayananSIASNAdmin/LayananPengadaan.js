import useScrollRestoration from "@/hooks/useScrollRestoration";
import { daftarPengadaan, syncPengadaan } from "@/services/siasn-services";
import { CloudDownloadOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  DatePicker,
  Form,
  message,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const formatYear = "YYYY";
const PAGE_SIZE = 25;

function LayananPengadaan() {
  const router = useRouter();

  useScrollRestoration();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState({
    tahun: router.query.tahun || dayjs().format(formatYear),
  });

  const { mutate: sync, isLoading: isSyncing } = useMutation({
    mutationFn: () => syncPengadaan(router?.query),
    onSuccess: () => {
      message.success("Data berhasil disinkronkan");
      queryClient.invalidateQueries({
        queryKey: ["daftar-pengadaan", router?.query],
      });
    },
    onError: (error) => {
      message.error(error?.message || "Gagal menyinkronkan data");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["daftar-pengadaan", router?.query],
      });
    },
  });

  const handleChange = (value) => {
    setQuery({
      tahun: value.format(formatYear),
    });
    router.push({
      pathname: "/layanan-siasn/pengadaan",
      query: { tahun: value.format(formatYear) },
    });
  };

  const { data, isLoading, isFetching, refetch } = useQuery(
    ["daftar-pengadaan", router?.query],
    () => daftarPengadaan(router?.query),
    {
      keepPreviousData: true,
      enabled: !!router?.query,
      refetchOnWindowFocus: false,
    }
  );

  const gotoDetail = (row) => {
    router.push(`/apps-managements/integrasi/siasn/${row.nip}`);
  };

  const columns = [
    {
      title: "Informasi",
      key: "informasi",
      render: (_, record) => {
        return (
          <Space direction="vertical">
            <Typography.Text>{record?.nama}</Typography.Text>
            <Typography.Text>{record?.nip}</Typography.Text>
            <Typography.Text type="secondary">
              {record?.no_peserta}
            </Typography.Text>
            <Tag color="blue">{record?.periode}</Tag>
            <Tag color="yellow">{record?.jenis_formasi_nama}</Tag>
          </Space>
        );
      },
      responsive: ["xs"],
    },
    {
      title: "File",
      key: "file",
      render: (_, record) => {
        return (
          <Space>
            {record?.path_ttd_sk && (
              <Tooltip title="File SK">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              </Tooltip>
            )}
            {record?.path_ttd_pertek && (
              <Tooltip title="File Pertek">
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <FilePdfOutlined />
                </a>
              </Tooltip>
            )}
          </Space>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "No. Peserta",
      dataIndex: "no_peserta",
      responsive: ["sm"],
    },
    {
      title: "NIP",
      dataIndex: "nip",
      responsive: ["sm"],
    },
    {
      title: "Nama",
      dataIndex: "nama",
      responsive: ["sm"],
    },
    {
      title: "Jenis Formasi Nama",
      dataIndex: "jenis_formasi_nama",
      responsive: ["sm"],
    },
    {
      title: "Periode",
      dataIndex: "periode",
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => {
        return <a onClick={() => gotoDetail(row)}>Detail</a>;
      },
      responsive: ["sm"],
    },
  ];

  return (
    <Card title="Integrasi Pengadaan">
      <Form layout="inline">
        <Form.Item label="Tahun Pengadaan">
          <DatePicker
            value={dayjs(query?.tahun, formatYear)}
            picker="year"
            onChange={handleChange}
            format={formatYear}
          />
        </Form.Item>
        <Form.Item>
          <Button loading={isFetching} onClick={() => refetch()}>
            Reload
          </Button>
        </Form.Item>
      </Form>

      <div style={{ marginBottom: 16, marginTop: 16 }}>
        <Space>
          <Button type="primary" loading={isSyncing} onClick={() => sync()}>
            Sinkronisasi
          </Button>
          <Button icon={<CloudDownloadOutlined />}>Unduh Data</Button>
        </Space>
      </div>

      <Table
        rowKey={(row) => row?.id}
        pagination={{
          position: ["bottomRight", "topRight"],
          total: data?.length ?? 0,
          showTotal: (total) => `Total ${total} data`,
          showSizeChanger: false,
          pageSize: PAGE_SIZE,
        }}
        dataSource={data}
        columns={columns}
        loading={isLoading || isFetching}
      />
    </Card>
  );
}

export default LayananPengadaan;
