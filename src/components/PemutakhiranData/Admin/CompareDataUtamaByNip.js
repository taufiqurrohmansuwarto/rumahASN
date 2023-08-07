import { dataUtamaMasterByNip } from "@/services/master.services";
import { dataUtamSIASNByNip } from "@/services/siasn-services";
import { Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { Alert, Card, Col, Form, Input, Row, Typography } from "antd";
import Link from "next/link";
import { useEffect } from "react";

const Pemberitahuan = () => {
  return (
    <Alert
      showIcon
      banner
      type="info"
      description={
        <>
          <Typography.Text>
            Halo Sobat ASN! Coba yuk, pastiin data kita di SIASN dan SIMASTER
            udah selaras. Mulai dari Nama, NIP, dan Tanggal Lahir harus sama
            loh, biar pensiunnya lancar jaya nanti. Kalo ada yang beda atau
            perlu diperbaiki, langsung aja ke menu{" "}
            <Link href="/tickets/create">
              <a>Buat Pertanyaan</a>
            </Link>{" "}
            kita. Yuk, kita jaga keakuratan data kita bareng-bareng!
            #datamutanggungjawabmu
          </Typography.Text>
        </>
      }
    />
  );
};

const FormDataUtamSiasn = ({ data }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      nipBaru: data?.nipBaru,
      nama: data?.nama,
      tglLahir: data?.tglLahir,
      jenisKelamin: data?.jenisKelamin === "M" ? "Laki-laki" : "Perempuan",
      gelarDepan: data?.gelarDepan,
      gelarBelakang: data?.gelarBelakang,
      email: data?.email,
    });
  }, [data, form]);

  return (
    <Form layout="vertical" form={form}>
      <Form.Item name="nipBaru" label="NIP">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="nama" label="Nama">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="tglLahir" label="Tanggal Lahir">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="jenisKelamin" label="Jenis Kelamin">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="gelarDepan" label="Gelar Depan">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="gelarBelakang" label="Gelar Belakang">
        <Input readOnly />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        help="Email yang digunakan di MySAPK"
      >
        <Input readOnly />
      </Form.Item>
    </Form>
  );
};

const FormDataSimaster = ({ data }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      nipBaru: data?.nip_baru,
      nama: data?.nama,
      tglLahir: data?.tgl_lahir,
      jenisKelamin: data?.jk === "L" ? "Laki-laki" : "Perempuan",
      gelarDepan: data?.gelar_depan,
      gelarBelakang: data?.gelar_belakang,
      email: data?.email,
    });
  }, [data, form]);

  return (
    <Form layout="vertical" form={form}>
      <Form.Item name="nipBaru" label="NIP">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="nama" label="Nama">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="tglLahir" label="Tanggal Lahir">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="jenisKelamin" label="Jenis Kelamin">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="gelarDepan" label="Gelar Depan">
        <Input readOnly />
      </Form.Item>
      <Form.Item name="gelarBelakang" label="Gelar Belakang">
        <Input readOnly />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        help="Email yang digunakan di MySAPK"
      >
        <Input readOnly />
      </Form.Item>
    </Form>
  );
};

function CompareDataUtamaByNip({ nip }) {
  const { data, isLoading } = useQuery(["data-utama-siasn", nip], () =>
    dataUtamSIASNByNip(nip)
  );

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster", nip],
    () => dataUtamaMasterByNip(nip)
  );

  return (
    <div>
      <Stack>
        <Pemberitahuan />
        <Row
          gutter={[
            { xs: 8, sm: 16, md: 24, lg: 32 },
            { xs: 8, sm: 16, md: 24, lg: 32 },
          ]}
        >
          <Col md={12} xs={24}>
            <Card loading={isLoading} title="Data Utama SIASN">
              <FormDataUtamSiasn data={data} />
            </Card>
          </Col>
          <Col md={12} xs={24}>
            <Card loading={isLoadingDataSimaster} title="Data Utama SIMASTER">
              <FormDataSimaster data={dataSimaster} />
            </Card>
          </Col>
        </Row>
      </Stack>
    </div>
  );
}

export default CompareDataUtamaByNip;
