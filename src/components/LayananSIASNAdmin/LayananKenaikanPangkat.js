import {
  daftarKenaikanPangkat,
  syncKenaikanPangkat,
} from "@/services/siasn-services";
import {
  CloudDownloadOutlined,
  FilePdfTwoTone,
  SyncOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  DatePicker,
  Form,
  message,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useCallback, useState } from "react";

const FORMAT = "DD-MM-YYYY";
const PAGE_SIZE = 25;

function LayananKenaikanPangkat() {
  const router = useRouter();
  const [periode, setPeriode] = useState(() => {
    const today = dayjs();
    const defaultPeriode = today.startOf("month").format(FORMAT);
    return router.query.periode || defaultPeriode;
  });

  const { data, isLoading, isFetching, error, refetch } = useQuery(
    ["kenaikan-pangkat", periode],
    () => daftarKenaikanPangkat({ periode }),
    {
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    }
  );

  const handleChangePeriode = useCallback(
    (value) => {
      const newPeriode = value.startOf("month").format(FORMAT);
      setPeriode(newPeriode);
      router.push({
        pathname: "/layanan-siasn/kenaikan-pangkat",
        query: { periode: newPeriode },
      });
    },
    [router]
  );

  const { mutate: sync, isLoading: isLoadingSync } = useMutation(
    (data) => syncKenaikanPangkat(data),
    {
      onSuccess: () => message.success("Data berhasil disinkronisasi"),
      onError: (error) => message.error(error?.response?.data?.message),
    }
  );

  const handleSync = () => sync({ periode });

  const columns = [
    {
      title: "File",
      key: "path",
      render: (_, record) => (
        <Space>
          {record?.path_ttd_sk && (
            <Tooltip title="File SK">
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                target="_blank"
                rel="noreferrer"
              >
                <FilePdfTwoTone />
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
                <FilePdfTwoTone />
              </a>
            </Tooltip>
          )}
        </Space>
      ),
      responsive: ["sm"],
    },
    {
      title: "Foto",
      width: 100,
      key: "foto",
      render: (_, row) => (
        <Avatar shape="square" size={100} src={row?.pegawai?.foto} />
      ),
    },
    {
      width: 700,
      title: "NIP",
      key: "nipBaru",
      render: (_, row) => (
        <Space direction="vertical">
          <Typography.Text>{row?.nipBaru}</Typography.Text>
          <Typography.Text>{row?.nama}</Typography.Text>
          <Typography.Text type="secondary">
            {row?.pegawai?.opd_master}
          </Typography.Text>
        </Space>
      ),
      responsive: ["sm"],
    },
    { title: "TMT KP", dataIndex: "tmtKp", responsive: ["sm"] },
    { title: "Jenis KP", dataIndex: "jenis_kp", responsive: ["sm"] },
    { title: "Status", dataIndex: "statusUsulanNama", responsive: ["sm"] },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => <a>Detail</a>,
      responsive: ["sm"],
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <>
      <Card title="Integrasi Kenaikan Pangkat">
        <Space>
          <Form.Item label="Periode">
            <DatePicker
              picker="month"
              format={FORMAT}
              onChange={handleChangePeriode}
              value={dayjs(periode, FORMAT)}
            />
          </Form.Item>
          <Form.Item>
            <Button loading={isFetching} onClick={() => refetch()}>
              Reload
            </Button>
          </Form.Item>
        </Space>
        <div>
          <Space>
            <Tooltip title="Ambil data dari SIASN">
              <Button
                onClick={handleSync}
                loading={isLoadingSync}
                type="primary"
                icon={<SyncOutlined />}
              >
                Sinkron
              </Button>
            </Tooltip>
            <Button icon={<CloudDownloadOutlined />}>Unduh Data</Button>
          </Space>
        </div>
        <Table
          pagination={{
            position: ["bottomRight", "topRight"],
            total: data?.length ?? 0,
            showTotal: (total) => `Total ${total} data`,
            showSizeChanger: false,
            pageSize: PAGE_SIZE,
          }}
          columns={columns}
          rowKey={(row) => row?.id}
          dataSource={data}
          loading={isLoading || isFetching}
        />
      </Card>
    </>
  );
}

export default LayananKenaikanPangkat;
