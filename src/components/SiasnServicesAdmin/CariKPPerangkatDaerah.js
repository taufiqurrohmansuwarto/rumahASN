import { daftarKenaikanPerangkatDaerah } from "@/services/siasn-services";
import { FilePdfTwoTone } from "@ant-design/icons";
import { useMutation } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  FloatButton,
  Form,
  Row,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useState } from "react";
import UnorAdmin from "./UnorAdmin";

function CariKPPerangkatDaerah() {
  const [form] = Form.useForm();

  const [data, setData] = useState([]);

  const { mutate: cariPegawai, isLoading: isLoadingDaftarPegawai } =
    useMutation((data) => daftarKenaikanPerangkatDaerah(data), {
      onSuccess: (data) => {
        setData(data);
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
      key: "foto",
      render: (_, record) => {
        return <Avatar shape="square" size={80} src={record?.foto} />;
      },
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
    },
    {
      title: "Perangkat Daerah",
      dataIndex: "opd_master",
    },
    { title: "No. Pertek", dataIndex: "no_pertek" },
    { title: "No. SK", dataIndex: "no_sk" },
    { title: "TMT KP", dataIndex: "tmtKp" },
    { title: "Jenis KP", dataIndex: "jenis_kp" },
    { title: "Status", dataIndex: "statusUsulanNama" },
  ];

  return (
    <Card title="Cari KP Perangkat Daerah">
      <FloatButton.BackTop />
      <Form onFinish={handleSubmit} form={form} layout="vertical">
        <Row gutter={[8, 16]}>
          <Col md={12}>
            <UnorAdmin />
          </Col>
          <Col md={12}>
            <Form.Item label="Tanggal TMT KP" name="tmtKp">
              <DatePicker.MonthPicker />
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
        columns={columns}
        loading={isLoadingDaftarPegawai}
        pagination={{
          position: ["bottomRight", "topRight"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
          showSizeChanger: false,
          pageSize: 25,
        }}
        dataSource={data}
      />
    </Card>
  );
}

export default CariKPPerangkatDaerah;
