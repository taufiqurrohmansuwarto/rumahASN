import { daftarKenaikanPerangkatDaerah } from "@/services/siasn-services";
import {
  CloudDownloadOutlined,
  FilePdfFilled,
  FilePdfOutlined,
} from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  FloatButton,
  Form,
  Grid,
  message,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import ExcelJS from "exceljs";
import FileSaver from "file-saver";
import { useState } from "react";
import UnorAdmin from "./UnorAdmin";

function CariKPPerangkatDaerah() {
  const breakPoint = Grid.useBreakpoint();
  const [form] = Form.useForm();

  const [loadingDownload, setLoadingDownload] = useState(false);

  const [data, setData] = useState([]);

  const handleDownload = async () => {
    try {
      setLoadingDownload(true);
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Data Usulan KP");

      // Tambahkan header
      worksheet.columns = [
        { header: "Nama", key: "nama" },
        { header: "NIP", key: "nip" },
        { header: "Perangkat Daerah", key: "perangkat_daerah" },
        { header: "Tgl. Pertek", key: "tgl_pertek" },
        { header: "Jenis KP", key: "jenis_kp" },
        { header: "TMT KP", key: "tmt_kp" },
      ];

      // Tambahkan data
      data.forEach((item) => {
        console.log(item);
        worksheet.addRow({
          nama: item?.nama_master,
          nip: item?.nip_master,
          jenis_kp: item?.jenis_kp,
          perangkat_daerah: item?.opd_master,
          tgl_pertek: item?.tgl_pertek,
          tmt_kp: item?.tmtKp,
        });
      });

      // Atur lebar kolom
      worksheet.columns.forEach((column) => {
        column.width = 20;
      });

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const blob = new Blob([buffer], { type: fileType });
      FileSaver.saveAs(blob, "data_usulan_kp.xlsx");

      message.success("Berhasil mengunduh data");
      setLoadingDownload(false);
    } catch (error) {
      message.error("Gagal mengunduh data");
      setLoadingDownload(false);
    }
  };

  const { mutate: cariPegawai, isLoading: isLoadingDaftarPegawai } =
    useMutation((data) => daftarKenaikanPerangkatDaerah(data), {
      onSuccess: (data) => {
        message.success("Berhasil mengambil data");
        setData(data);
      },
      onError: (error) => {
        message.error("Gagal mengambil data");
      },
    });

  const handleSubmit = async () => {
    try {
      const value = await form.validateFields();
      const tmtKp = dayjs(value.tmtKp).startOf("month").format("DD-MM-YYYY");

      const payload = {
        skpd_id: value.skpd_id,
        tmtKp,
      };

      cariPegawai(payload);
    } catch (error) {}
  };

  const columns = [
    {
      title: "Data",
      key: "data",
      render: (_, record) => {
        return (
          <Space direction="vertical">
            <Avatar shape="square" size={50} src={record?.foto} />
            <>
              {record?.path_ttd_sk && (
                <Tooltip title="File SK">
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_sk}`}
                  >
                    <FilePdfOutlined />
                  </a>
                </Tooltip>
              )}
              {record?.path_ttd_pertek && (
                <Tooltip title="File Pertek">
                  <a
                    href={`/helpdesk/api/siasn/ws/download?filePath=${record.path_ttd_pertek}`}
                  >
                    <FilePdfOutlined />
                  </a>
                </Tooltip>
              )}
            </>
            <Typography.Text strong>{record?.nama_master}</Typography.Text>
            <Typography.Text strong>{record?.nip_master}</Typography.Text>
            <Typography.Text type="secondary">
              {record?.jabatan_master}
            </Typography.Text>
            <Typography.Text type="secondary">
              {record?.opd_master}
            </Typography.Text>
          </Space>
        );
      },
      responsive: ["xs"],
    },
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
      ),
      responsive: ["sm"],
    },
    {
      title: "Foto",
      key: "foto",
      render: (_, record) => {
        return <Avatar shape="square" size={80} src={record?.foto} />;
      },
      responsive: ["sm"],
    },
    {
      title: "Pegawai",
      key: "Pegawai",
      width: 200,
      render: (_, record) => {
        return (
          <Space direction="vertical">
            <Typography.Text>{record?.nama_master}</Typography.Text>
            <Typography.Text>{record?.nip_master}</Typography.Text>
            <Typography.Text>{record?.jabatan_master}</Typography.Text>
          </Space>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Perangkat Daerah",
      dataIndex: "opd_master",
      responsive: ["sm"],
    },
    { title: "Jenis KP", dataIndex: "jenis_kp", responsive: ["sm"] },
    { title: "Status", dataIndex: "statusUsulanNama", responsive: ["sm"] },
  ];

  return (
    <Card title="Daftar Usulan Kenaikan Pangkat">
      <FloatButton.BackTop />
      <Form onFinish={handleSubmit} form={form} layout="vertical">
        <Row gutter={[8, 8]}>
          <Col md={12} xs={24}>
            <UnorAdmin />
          </Col>
          <Col md={12} xs={24}>
            <Form.Item label="Tanggal TMT KP" name="tmtKp">
              <DatePicker.MonthPicker
                style={{ width: breakPoint.xs ? "100%" : null }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Cari
          </Button>
        </Form.Item>
      </Form>
      <Table
        title={() => {
          return (
            <>
              {data?.length ? (
                <Button
                  icon={<CloudDownloadOutlined />}
                  type="primary"
                  onClick={handleDownload}
                  loading={loadingDownload}
                >
                  Unduh Data
                </Button>
              ) : null}
            </>
          );
        }}
        columns={columns}
        loading={isLoadingDaftarPegawai}
        pagination={{
          position: ["bottomRight", "topRight"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} dari ${total} pegawai`,
          showSizeChanger: false,
          pageSize: 25,
        }}
        dataSource={data}
      />
    </Card>
  );
}

export default CariKPPerangkatDaerah;
