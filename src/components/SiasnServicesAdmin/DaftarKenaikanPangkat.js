import React, { useState, useCallback } from "react";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  DatePicker,
  Form,
  message,
  Space,
  Table,
  Tooltip,
} from "antd";
import { FilePdfTwoTone, SyncOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  daftarKenaikanPangkat,
  syncKenaikanPangkat,
} from "@/services/siasn-services";

const FORMAT = "DD-MM-YYYY";
const PAGE_SIZE = 25;

function DaftarKenaikanPangkat() {
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
        pathname: "/apps-managements/siasn-services/kenaikan-pangkat",
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

  const gotoDetail = useCallback(
    (row) => {
      router.push(`/apps-managements/integrasi/siasn/${row.nipBaru}`);
    },
    [router]
  );

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
    { title: "NIP", dataIndex: "nipBaru" },
    { title: "Nama", dataIndex: "nama" },
    { title: "No. Pertek", dataIndex: "no_pertek" },
    { title: "No. SK", dataIndex: "no_sk" },
    { title: "TMT KP", dataIndex: "tmtKp" },
    { title: "Jenis KP", dataIndex: "jenis_kp" },
    { title: "Status", dataIndex: "statusUsulanNama" },
    {
      title: "Aksi",
      key: "aksi",
      render: (_, row) => <a onClick={() => gotoDetail(row)}>Detail</a>,
    },
  ];

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <Card>
      <Form.Item label="Periode">
        <DatePicker
          picker="month"
          format={FORMAT}
          onChange={handleChangePeriode}
          value={dayjs(periode, FORMAT)}
        />
      </Form.Item>
      <Space>
        <Button loading={isFetching} type="primary" onClick={() => refetch()}>
          Reload
        </Button>
        <Button
          onClick={handleSync}
          loading={isLoadingSync}
          type="primary"
          icon={<SyncOutlined />}
        >
          Sinkron
        </Button>
      </Space>
      <Table
        size="middle"
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
  );
}

export default DaftarKenaikanPangkat;
