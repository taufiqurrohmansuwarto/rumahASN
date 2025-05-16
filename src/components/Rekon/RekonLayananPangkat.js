import {
  dashboardKPJatim,
  generateRingkasanAnalisisPangkat,
  ringkasanAnalisisPangkat,
} from "@/services/rekon.services";
import {
  BarChartOutlined,
  CalendarOutlined,
  DownOutlined,
  FileTextOutlined,
  SearchOutlined,
  TeamOutlined,
  ThunderboltOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  Form,
  Layout,
  List,
  Modal,
  Row,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
  Tooltip,
} from "antd";
import dayjs from "dayjs";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const { Content } = Layout;
const format = "MM-YYYY";
const queryFormat = "DD-MM-YYYY";
const DEFAULT_PERIODE = "01-06-2025";

const ModalRingkasanAnalisis = ({ open, onClose, periode }) => {
  const { data: ringkasan, isLoading } = useQuery({
    queryKey: ["ringkasanAnalisisPangkat", periode],
    queryFn: () => ringkasanAnalisisPangkat({ tmtKp: periode }),
  });

  const columns = [
    {
      title: "Kategori",
      dataIndex: "kategori",
      key: "kategori",
      width: 150,
      render: (text) => (
        <Typography.Text strong type="primary">
          {text}
        </Typography.Text>
      ),
    },
    {
      title: "Jumlah Alasan",
      dataIndex: "jumlah_alasan",
      key: "jumlah_alasan",
      width: 100,
      align: "center",
      render: (value) => (
        <Typography.Text>
          <Tag color="success">{value}</Tag>
        </Typography.Text>
      ),
    },
    {
      title: "Ringkasan",
      dataIndex: "ringkasan",
      key: "ringkasan",
      width: 500,
      render: (text) => (
        <Typography.Paragraph
          ellipsis={{ rows: 3, expandable: true, symbol: "selengkapnya" }}
        >
          {text}
        </Typography.Paragraph>
      ),
    },
  ];

  return (
    <Modal
      width={1200}
      title={
        <Typography.Title level={4} style={{ margin: 0 }}>
          <Space>
            <span>📊</span>
            Ringkasan Analisis
          </Space>
        </Typography.Title>
      }
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Card bordered={false}>
        <Alert
          message="Perhatian"
          description="Rekomendasi ini digenerate menggunakan kecerdasan buatan (AI) dan mungkin tidak selalu akurat. Harap verifikasi informasi sebelum mengambil keputusan."
          type="warning"
          showIcon
          icon={<span>🤖</span>}
          style={{ marginBottom: 16 }}
        />
        {isLoading ? (
          <Empty description="Memuat data..." />
        ) : ringkasan?.length === 0 ? (
          <Empty description="Tidak ada data untuk ditampilkan" />
        ) : (
          <Table
            dataSource={ringkasan}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            scroll={{ x: "max-content", y: 700 }}
            expandable={{
              expandedRowRender: (record) => (
                <Card>
                  <Typography.Title level={5}>
                    <Space>
                      <span>📋</span>
                      Daftar Alasan:
                    </Space>
                  </Typography.Title>
                  <List
                    dataSource={record.daftar_alasan}
                    renderItem={(alasan, index) => (
                      <List.Item key={index}>
                        <Typography.Text>{alasan}</Typography.Text>
                      </List.Item>
                    )}
                  />
                </Card>
              ),
              expandIcon: ({ expanded, onExpand, record }) =>
                expanded ? (
                  <Button
                    type="text"
                    icon={<UpOutlined />}
                    onClick={(e) => onExpand(record, e)}
                  />
                ) : (
                  <Button
                    type="text"
                    icon={<DownOutlined />}
                    onClick={(e) => onExpand(record, e)}
                  />
                ),
            }}
          />
        )}
      </Card>
    </Modal>
  );
};

const ShowRingkasanAnalisis = ({ periode }) => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Lihat ringkasan analisis periode ini">
        <Button
          type="default"
          onClick={() => setOpen(true)}
          icon={<FileTextOutlined />}
        >
          Lihat Ringkasan
        </Button>
      </Tooltip>
      <ModalRingkasanAnalisis
        open={open}
        onClose={handleClose}
        periode={periode}
      />
    </>
  );
};

const GenerateRingkasanAnalisis = ({ periode }) => {
  const { data } = useSession();
  const { mutate, isLoading } = useMutation(
    (data) => generateRingkasanAnalisisPangkat(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat ringkasan analisis");
      },
      onError: (error) => {
        message.error(
          `Gagal membuat ringkasan: ${error.message || "Terjadi kesalahan"}`
        );
      },
    }
  );

  const handleGenerate = () => {
    Modal.confirm({
      title: "Konfirmasi Generate Ringkasan",
      content:
        "Apakah Anda yakin ingin membuat ringkasan analisis untuk periode ini?",
      okText: "Ya, Generate",
      cancelText: "Batal",
      onOk: () => {
        mutate({ tmtKp: periode });
      },
    });
  };

  return (
    <>
      {data?.user?.current_role === "admin" && (
        <Tooltip title="Buat ringkasan analisis baru untuk periode ini">
          <Button
            type="primary"
            onClick={handleGenerate}
            loading={isLoading}
            icon={<ThunderboltOutlined />}
          >
            Generate Ringkasan
          </Button>
        </Tooltip>
      )}
    </>
  );
};

const getFirstDayOfMonth = (date) => {
  return dayjs(date).startOf("month").format(queryFormat);
};

function RekonLayananPangkat() {
  const [period, setPeriod] = useState(null);
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["dashboardKPJatim", period],
    queryFn: () =>
      dashboardKPJatim({
        periode: period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE,
      }),
    refetchOnWindowFocus: false,
  });

  const handleChange = (value) => {
    setPeriod(value);
  };

  const columns = [
    {
      title: "Perangkat Daerah",
      dataIndex: "nama_unor",
      filterSearch: true,
      filters: data?.data?.map((item) => ({
        text: item?.nama_unor,
        value: item?.nama_unor,
      })),
      onFilter: (value, record) =>
        record.nama_unor.toLowerCase().includes(value.toLowerCase()),
      sorter: (a, b) => a.nama_unor.localeCompare(b.nama_unor),
      width: "30%",
      ellipsis: true,
    },
    {
      title: "Jumlah Usulan",
      dataIndex: "jumlah_usulan",
      sorter: (a, b) => a.jumlah_usulan - b.jumlah_usulan,
    },
    {
      title: "TTD Pertek",
      dataIndex: "jumlah_ttd_pertek",
      sorter: (a, b) => a.jumlah_ttd_pertek - b.jumlah_ttd_pertek,
    },
    {
      title: "SK Berhasil",
      dataIndex: "jumlah_sk_berhasil",
      sorter: (a, b) => a.jumlah_sk_berhasil - b.jumlah_sk_berhasil,
    },
  ];

  const title = (
    <Space>
      <Typography.Title level={4} style={{ margin: 0 }}>
        <Space>
          <BarChartOutlined />
          Kenaikan Pangkat
        </Space>
      </Typography.Title>
      <Button
        type="link"
        icon={<SearchOutlined />}
        onClick={() => router.push("/rekon/dashboard/kenaikan-pangkat")}
      />
    </Space>
  );

  return (
    <Layout style={{ background: "#fff" }}>
      <Card title={title} bordered={false}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={12} lg={6}>
            <Card
              size="small"
              title={
                <Space>
                  <CalendarOutlined />
                  <Typography.Text strong>Periode</Typography.Text>
                </Space>
              }
              bordered
              style={{ height: "100%" }}
            >
              <Form layout="vertical" style={{ marginBottom: 0 }}>
                <Form.Item style={{ marginBottom: 0 }}>
                  <DatePicker.MonthPicker
                    format={{
                      format,
                      type: "mask",
                    }}
                    onChange={handleChange}
                    defaultValue={dayjs(DEFAULT_PERIODE, queryFormat)}
                    disabledDate={(current) => {
                      return (
                        current &&
                        (current.month() === 0 || // Januari
                          current.month() === 2 || // Maret
                          current.month() === 4 || // Mei
                          current.month() === 6 || // Juli
                          current.month() === 8 || // September
                          current.month() === 10) // November
                      );
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </Form>
            </Card>
          </Col>
          <Col xs={24} md={12} lg={6}>
            <Card
              size="small"
              title={
                <Space>
                  <TeamOutlined />
                  <Typography.Text strong>Statistik</Typography.Text>
                </Space>
              }
              bordered
              style={{ height: "100%" }}
            >
              <Statistic
                title="Total Usulan"
                value={data?.jumlah_usulan_keseluruhan || 0}
                suffix="Usulan"
                valueStyle={{ color: "#3f8600" }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              size="small"
              title={
                <Space>
                  <ThunderboltOutlined />
                  <Typography.Text strong>Aksi</Typography.Text>
                </Space>
              }
              bordered
              style={{ height: "100%" }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <GenerateRingkasanAnalisis
                    periode={
                      period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE
                    }
                  />
                </Col>
                <Col xs={24} sm={12} md={8} lg={6}>
                  <ShowRingkasanAnalisis
                    periode={
                      period ? getFirstDayOfMonth(period) : DEFAULT_PERIODE
                    }
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Divider style={{ margin: "24px 0" }} />

        <Card
          title={
            <Typography.Title level={5} style={{ margin: 0 }}>
              <Space>
                <TeamOutlined />
                Data Perangkat Daerah
              </Space>
            </Typography.Title>
          }
          bordered={false}
          style={{ marginBottom: 0 }}
        >
          <Table
            size="small"
            rowKey={(row) => row?.id_unor}
            dataSource={data?.data}
            loading={isLoading}
            columns={columns}
            pagination={{
              pageSize: 15,
              position: ["bottomRight"],
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} item`,
            }}
            sortDirections={["ascend", "descend"]}
            scroll={{ x: "max-content" }}
          />
        </Card>
      </Card>
    </Layout>
  );
}

export default RekonLayananPangkat;
