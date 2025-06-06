import { dataIpAsn, dataUtamaSIASN } from "@/services/siasn-services";
import { dataKategoriIPASN } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Col, Form, Input, Modal, Row, Skeleton, Spin, Tag } from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

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
      title={`IP ASN Tahun ${tahun}`}
      open={open}
      onCancel={onCancel}
    >
      <Spin spinning={loading} fullScreen />
      <Tag
        style={{
          marginBottom: 16,
        }}
        color="yellow"
      >
        Data diambil {dayjs(data?.created_at).format("DD MMMM YYYY")}
      </Tag>
      <Form disabled layout="vertical" form={form}>
        <Row gutter={[8, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Nama" name="nama">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="NIP" name="nip_baru">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 16]}>
          <Col xs={24} md={12}>
            <Form.Item label="Jenis Jabatan" name="jenis_jabatan">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Jenjang Jabatan" name="jenjang_jabatan">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 16]}>
          <Col xs={24} md={22}>
            <Form.Item
              label="Riwayat Pendidikan Terakhir"
              name="riwayat_pendidikan_terakhir"
              extra={data?.keterangan_kualifikasi}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={2}>
            <Form.Item validateStatus="success" label="Skor" name="kualifikasi">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 16]}>
          <Col xs={24} md={22}>
            <Form.Item
              label="Pengembangan Kompetensi"
              name="riwayat_pengembangan_kompetensi"
              extra={data?.keterangan_kompetensi}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={2}>
            <Form.Item validateStatus="success" label="Skor" name="kompetensi">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 16]}>
          <Col xs={24} md={22}>
            <Form.Item
              label="Kinerja"
              name="riwayat_kinerja"
              extra={data?.keterangan_kinerja}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={2}>
            <Form.Item validateStatus="success" label="Skor" name="kinerja">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 16]}>
          <Col xs={24} md={22}>
            <Form.Item
              label="Disiplin"
              name="riwayat_disiplin"
              extra={data?.keterangan_disiplin}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={2}>
            <Form.Item validateStatus="success" label="Skor" name="disiplin">
              <Input />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={[8, 16]}>
          <Col xs={24} md={22}>
            <Form.Item
              label="Subtotal"
              name="riwayat_subtotal"
              extra={data?.keterangan_subtotal}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={2}>
            <Form.Item validateStatus="success" label="Skor" name="subtotal">
              <Input />
            </Form.Item>
          </Col>
        </Row>
      </Form>
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
    refetch,
  } = useQuery(["ip-asn", tahun], () => dataIpAsn(tahun), {
    enabled: false,
  });

  useEffect(() => {
    if (data) {
      if (data?.user?.group === "MASTER") {
        refetch();
      }
    }
  }, [data, refetch]);

  return (
    <>
      {dataIPAsn ? (
        <>
          <Tag
            color={
              dataKategoriIPASN(dataIPAsn?.subtotal) === "Sangat Tinggi"
                ? "#a0d911"
                : // yellow
                  "#f5222d"
            }
            style={{ cursor: "pointer" }}
            onClick={handleOpen}
          >
            IP ASN tahun {tahun} {dataIPAsn?.subtotal} (
            {dataKategoriIPASN(dataIPAsn?.subtotal)})
          </Tag>
          <ModalDataIPAsn
            tahun={tahun}
            open={open}
            onCancel={handleClose}
            data={dataIPAsn}
            loading={isLoadingDataIPAsn}
          />
        </>
      ) : null}
    </>
  );
}

export default IPAsn;
