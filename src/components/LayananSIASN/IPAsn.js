import { dataIpAsn, dataUtamaSIASN } from "@/services/siasn-services";
import { dataKategoriIPASN } from "@/utils/client-utils";
import { TrophyOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Spin,
  Tag,
  Typography,
} from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const { Text } = Typography;

const ModalDataIPAsn = ({ data, open, onCancel, tahun, loading }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      riwayat_pendidikan_terakhir:
        "Riwayat Pendidikan Terakhir (nilai maks 25)",
      riwayat_pengembangan_kompetensi:
        "Riwayat Pengembangan Kompetensi (nilai maks 40)",
      riwayat_kinerja: "Hasil Penilaian Kinerja (nilai maks 30)",
      riwayat_disiplin: "Riwayat Hukum Disiplin (nilai maks 5)",
      riwayat_subtotal: "Nilai maks 100",
    });
  }, [data, form]);

  return (
    <Modal
      footer={null}
      width={800}
      centered
      title={
        <Flex align="center" gap={8}>
          <TrophyOutlined style={{ color: "#FF4500" }} />
          <span style={{ color: "#1A1A1B" }}>IP ASN Tahun {tahun}</span>
        </Flex>
      }
      open={open}
      onCancel={onCancel}
      styles={{
        content: {
          backgroundColor: "#DAE0E6",
          padding: "0",
        },
        header: {
          backgroundColor: "#F8F9FA",
          borderBottom: "1px solid #EDEFF1",
          margin: "0",
          padding: "16px 24px",
        },
        body: {
          padding: "16px",
        },
      }}
    >
      <Spin spinning={loading} style={{ color: "#FF4500" }} />

      <Card
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "16px",
        }}
      >
        <Tag
          style={{
            marginBottom: 16,
            backgroundColor: "#FFF3CD",
            borderColor: "#FFEAA7",
            color: "#856404",
          }}
        >
          Data diambil {dayjs(data?.created_at).format("DD MMMM YYYY")}
        </Tag>

        <Form disabled layout="vertical" form={form}>
          <Row gutter={[8, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Nama
                  </Text>
                }
                name="nama"
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>NIP</Text>
                }
                name="nip_baru"
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 16]}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Jenis Jabatan
                  </Text>
                }
                name="jenis_jabatan"
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Jenjang Jabatan
                  </Text>
                }
                name="jenjang_jabatan"
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 16]}>
            <Col xs={24} md={22}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Riwayat Pendidikan Terakhir
                  </Text>
                }
                name="riwayat_pendidikan_terakhir"
                extra={
                  <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                    {data?.keterangan_kualifikasi}
                  </Text>
                }
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item
                validateStatus="success"
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Skor
                  </Text>
                }
                name="kualifikasi"
              >
                <Input
                  style={{
                    borderColor: "#52C41A",
                    color: "#52C41A",
                    fontWeight: "bold",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 16]}>
            <Col xs={24} md={22}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Pengembangan Kompetensi
                  </Text>
                }
                name="riwayat_pengembangan_kompetensi"
                extra={
                  <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                    {data?.keterangan_kompetensi}
                  </Text>
                }
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item
                validateStatus="success"
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Skor
                  </Text>
                }
                name="kompetensi"
              >
                <Input
                  style={{
                    borderColor: "#52C41A",
                    color: "#52C41A",
                    fontWeight: "bold",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 16]}>
            <Col xs={24} md={22}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Kinerja
                  </Text>
                }
                name="riwayat_kinerja"
                extra={
                  <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                    {data?.keterangan_kinerja}
                  </Text>
                }
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item
                validateStatus="success"
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Skor
                  </Text>
                }
                name="kinerja"
              >
                <Input
                  style={{
                    borderColor: "#52C41A",
                    color: "#52C41A",
                    fontWeight: "bold",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 16]}>
            <Col xs={24} md={22}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Disiplin
                  </Text>
                }
                name="riwayat_disiplin"
                extra={
                  <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                    {data?.keterangan_disiplin}
                  </Text>
                }
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item
                validateStatus="success"
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Skor
                  </Text>
                }
                name="disiplin"
              >
                <Input
                  style={{
                    borderColor: "#52C41A",
                    color: "#52C41A",
                    fontWeight: "bold",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={[8, 16]}>
            <Col xs={24} md={22}>
              <Form.Item
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Subtotal
                  </Text>
                }
                name="riwayat_subtotal"
                extra={
                  <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                    {data?.keterangan_subtotal}
                  </Text>
                }
              >
                <Input style={{ borderColor: "#EDEFF1" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={2}>
              <Form.Item
                validateStatus="success"
                label={
                  <Text style={{ color: "#1A1A1B", fontWeight: 500 }}>
                    Skor
                  </Text>
                }
                name="subtotal"
              >
                <Input
                  style={{
                    borderColor: "#FF4500",
                    color: "#FF4500",
                    fontWeight: "bold",
                    backgroundColor: "#FFF3E0",
                  }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </Modal>
  );
};

function IPAsn({ tahun }) {
  const { data, status } = useSession();
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const { data: dataUtama, isLoading } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: dataIPAsn,
    isLoading: isLoadingDataIPAsn,
    isFetching: isFetchingDataIPAsn,
    refetch,
  } = useQuery(["ip-asn", tahun], () => dataIpAsn(tahun), {
    enabled: !!tahun,
    refetchOnWindowFocus: false,
  });

  // Show loading when fetching
  if (isFetchingDataIPAsn) {
    return <Skeleton.Button active size="small" style={{ width: "200px" }} />;
  }

  // Don't render anything if no data
  if (!dataIPAsn) {
    return null;
  }

  const kategori = dataKategoriIPASN(dataIPAsn?.subtotal);
  const isHighScore = kategori === "Sangat Tinggi";

  return (
    <>
      <Flex align="center" gap={8}>
        <Tag
          icon={<TrophyOutlined />}
          color={isHighScore ? "success" : "warning"}
          style={{ cursor: "pointer" }}
          onClick={handleOpen}
        >
          IP ASN {tahun}: {dataIPAsn?.subtotal} ({kategori})
        </Tag>
      </Flex>

      <ModalDataIPAsn
        tahun={tahun}
        open={open}
        onCancel={handleClose}
        data={dataIPAsn}
        loading={isLoadingDataIPAsn}
      />
    </>
  );
}

export default IPAsn;
