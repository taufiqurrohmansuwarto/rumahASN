import { comparePegawaiAdmin } from "@/services/admin.services";
import { InfoCircleOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Col,
  Row,
  Space,
  Statistic,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { useRouter } from "next/router";
import * as XLSX from "xlsx";

const GrafikAnomali = ({ data }) => {
  const router = useRouter();

  const gotoDetailEmployee = (nip) => {
    const url = `/apps-managements/integrasi/siasn/${nip}`;
    router.push(url);
  };

  const detailColumns = [
    {
      title: "NIP",
      dataIndex: "nip_master",
    },
    {
      title: "Nama",
      dataIndex: "nama_master",
    },
    {
      title: "Aksi",
      key: "detail",
      render: (_, row) => (
        <a onClick={() => gotoDetailEmployee(row.nip_master)}>Detail</a>
      ),
    },
  ];

  const columns = [
    {
      title: "Jenis",
      key: "type",
      render: (_, row) => {
        return (
          <Space>
            <span>{row.type}</span>
            <Tooltip title={row?.description} color="pink">
              <QuestionCircleOutlined style={{ cursor: "pointer" }} />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: "Jumlah",
      dataIndex: "value",
    },
  ];

  const downloadData = (type, data) => {
    const hasil = data?.map((d) => ({
      nama: d.nama_master,
      nip: d.nip_master,
    }));
    const ws = XLSX.utils.json_to_sheet(hasil);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, "data.xlsx");
  };

  return (
    <Row gutter={[16, 16]}>
      <Col md={12}>
        <Card>
          <Statistic
            title="Total Pegawai SIASN"
            value={data?.totalPegawaiSIASN}
          />
        </Card>
      </Col>
      <Col md={12}>
        <Card>
          <Statistic
            title="Total Pegawai SIMASTER"
            value={data?.totalPegawaiSimaster}
          />
        </Card>
      </Col>
      <Col md={24}>
        <Card>
          <Stack>
            <Alert
              title="Perhatian"
              color="indigo"
              icon={<InfoCircleOutlined />}
            >
              Data akan diupdate setiap hari oleh BKD Provinsi Jawa Timur dan
              tidak realtime. Perbaikan data bisa jadi tidak langsung terlihat.
            </Alert>
            <Table
              rowKey={(record) => record.type}
              expandable={{
                expandedRowRender: (record) => (
                  <Card
                    extra={
                      <a
                        onClick={() =>
                          downloadData(record?.type, record?.detail)
                        }
                      >
                        Unduh
                      </a>
                    }
                  >
                    <Table
                      rowKey={(record) => record.nip_master}
                      dataSource={record.detail}
                      columns={detailColumns}
                    />
                  </Card>
                ),
                rowExpandable: (record) => record.detail.length > 0,
              }}
              // footer={() => (
              //   <Space direction="vertical">
              //     <Typography.Text strong>
              //       Total Pegawai SIMASTER : {data?.totalPegawaiSimaster}
              //     </Typography.Text>
              //     <Typography.Text strong>
              //       Total Pegawai SIASN : {data?.totalPegawaiSIASN}
              //     </Typography.Text>
              //   </Space>
              // )}
              size="middle"
              pagination={false}
              dataSource={data?.grafik}
              columns={columns}
            />
          </Stack>
        </Card>
      </Col>
    </Row>
  );
};

function DashboardKomparasiAdmin() {
  const { data, isLoading } = useQuery(
    ["dashboard-compare-siasn-admin"],
    () => comparePegawaiAdmin(),
    {
      refetchOnWindowFocus: false,
    }
  );

  return <div>{data && <GrafikAnomali data={data} />}</div>;
}

export default DashboardKomparasiAdmin;
