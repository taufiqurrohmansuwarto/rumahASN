import {
  Button,
  Card,
  Collapse,
  message,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
} from "antd";
import ExcelJS from "exceljs";

import { saveAs } from "file-saver";

import { logSIASN } from "@/services/log.services";

import { FileExcelFilled, SearchOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { upperCase } from "lodash";
import { useRouter } from "next/router";
import LogSIASNFilter from "../Filter/LogSIASNFilter";

const showModalInformation = (item, title = "BsRE") => {
  Modal.info({
    title: `Detail Log ${title}`,
    centered: true,
    width: 800,
    content: (
      <Collapse>
        <Collapse.Panel header="Request Data" key="1">
          <div
            style={{
              maxHeight: 400,
              overflow: "auto",
            }}
          ></div>
        </Collapse.Panel>
      </Collapse>
    ),
  });
};

function LogHistorySIASN() {
  const router = useRouter();

  const query = router?.query;

  const { data, isLoading, isFetching } = useQuery(
    ["logs-siasn", query],
    () => logSIASN(query),
    {
      enabled: !!query,
      keepPreviousData: true,
    }
  );

  const gotoDetail = (nip) => {
    router.push(`/apps-managements/integrasi/siasn/${nip}`);
  };

  const handleChangePage = (page, limit) => {
    router.push({
      pathname: "/logs/siasn",
      query: {
        ...query,
        page,
      },
    });
  };

  const columns = [
    {
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (text) => {
        return (
          <Space direction="vertical">
            <Typography.Text>{text?.user?.username}</Typography.Text>
            <Typography.Text>{text?.employee_number}</Typography.Text>
            <Typography.Text type="secondary">
              {dayjs(text?.created_at).format("DD MMM YYYY HH:mm:ss")}
            </Typography.Text>
            <Tag color="yellow">
              {text?.type} {upperCase(text?.siasn_service)}
            </Tag>

            <Space>
              <a onClick={() => gotoDetail(text?.employee_number)}>Detail</a>
              <a onClick={() => showModalInformation(text)}>Show Data</a>
            </Space>
          </Space>
        );
      },
    },
    {
      title: "Aktor",
      key: "actor",
      render: (text) => (
        <Space direction="vertical">
          {text?.user?.username}
          <Tag color="blue">{text?.employee_number}</Tag>
        </Space>
      ),
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "type",
      render: (text) => (
        <Space>
          <Tag color="green">{text?.type}</Tag>
          <Tag color="red">{upperCase(text?.siasn_service)}</Tag>
        </Space>
      ),
      responsive: ["sm"],
    },
    {
      title: "Tgl. Dibuat",
      key: "created_at",
      render: (text) => (
        <>{dayjs(text?.created_at).format("DD MMM YYYY HH:mm:ss")}</>
      ),
      responsive: ["sm"],
    },
    {
      title: "Role",
      key: "role",
      render: (text) => <div>{text?.user?.role}</div>,
      responsive: ["sm"],
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (text) => (
        // <a onClick={() => gotoDetail(text?.employee_number)}>Detail</a>
        <a>
          <SearchOutlined />
        </a>
      ),
      responsive: ["sm"],
    },
  ];

  const { mutateAsync: unduh, isLoading: isLoadingUnduh } = useMutation({
    mutationFn: (data) => logSIASN(data),
    onSuccess: async (data) => {
      message.success("Berhasil mengunduh data");
    },
    onError: (error) => {
      message.error("Gagal mengunduh data");
    },
  });

  const saveAsExcel = async (data) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Log SIASN");

    worksheet.columns = [
      { header: "NIP", key: "nip" },
      { header: "Tipe", key: "type" },
      { header: "SIASN", key: "siasn_service" },
      { header: "Tgl. Dibuat", key: "created_at" },
    ];

    data.forEach((item) => {
      worksheet.addRow({
        nip: item?.employee_number,
        type: item?.type,
        siasn_service: item?.siasn_service,
        created_at: item?.created_at,
      });
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();
    const excelBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(excelBlob, "Log SIASN.xlsx");
  };

  const handleUnduh = async () => {
    try {
      const payload = {
        ...router?.query,
        bulan:
          dayjs(query?.bulan).format("YYYY-MM") || dayjs().format("YYYY-MM"),
        limit: 0,
        mandiri: true,
      };
      const result = await unduh(payload);
      await saveAsExcel(result?.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Card
      title="Tabel Riwayat SIASN"
      extra={
        <Button
          icon={<FileExcelFilled />}
          disabled={isLoadingUnduh}
          loading={isLoadingUnduh}
          onClick={handleUnduh}
        >
          Export
        </Button>
      }
    >
      <LogSIASNFilter />
      {/* <Button
        icon={<CloudDownloadOutlined />}
        type="primary"
        disabled={isLoadingUnduh}
        loading={isLoadingUnduh}
        onClick={handleUnduh}
      >
        Unduh
      </Button> */}
      <Table
        size="small"
        pagination={{
          showSizeChanger: false,
          position: ["bottomRight", "topRight"],
          current: parseInt(query?.page) || 1,
          pageSize: 15,
          total: data?.total,
          onChange: handleChangePage,
        }}
        columns={columns}
        loading={isLoading || isFetching}
        dataSource={data?.data}
        rowKey={(row) => row?.id}
      />
    </Card>
  );
}

export default LogHistorySIASN;
