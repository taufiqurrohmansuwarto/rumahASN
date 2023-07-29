import { dataUtamaSIASN } from "@/services/siasn-services";
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

function CompareDataUtama() {
  const { data, isLoading } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {}
  );

  return (
    <div>
      <Row>
        <Stack>
          <Pemberitahuan />
          <Col md={12}>
            <Card loading={isLoading} title="Data Utama SIASN">
              <FormDataUtamSiasn data={data} />
            </Card>
          </Col>
        </Stack>
      </Row>
    </div>
  );
}

export default CompareDataUtama;
