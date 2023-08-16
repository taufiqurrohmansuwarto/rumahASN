import { dataUtamaSimaster } from "@/services/master.services";
import { dataUtamaSIASN } from "@/services/siasn-services";
import { komparasiGelar } from "@/utils/client-utils";
import { CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { Stack, Table } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Card,
  Col,
  Form,
  Input,
  Row,
  Skeleton,
  Tooltip,
  Typography,
} from "antd";
import { useEffect } from "react";
import CheckHasil from "./CheckHasil";
import { IconAlertCircle, IconCircleCheck } from "@tabler/icons";

const dataMaster = (data) => {
  return {
    nama_master: data.nama,
    nip_master: data.nip_baru,
    tanggal_lahir_master: data.tgl_lahir,
    gelar_depan_master: data.gelar_depan,
    gelar_belakang_master: data.gelar_belakang,
    email_master: data?.email,
    jk_master: data.jk === "L" ? "pria" : "wanita",
  };
};

const dataSiasn = (data) => {
  return {
    nama_siasn: data.nama,
    nip_siasn: data.nipBaru,
    tanggal_lahir_siasn: data.tglLahir,
    gelar_depan_siasn: data.gelarDepan,
    gelar_belakang_siasn: data.gelarBelakang,
    email_siasn: data?.email,
    jk_siasn: data.jenisKelamin === "M" ? "pria" : "wanita",
  };
};

const Pemberitahuan = () => {
  return (
    <Alert
      showIcon
      banner
      type="info"
      description={
        <>
          <Typography.Text>
            Cek segera Data Nama, NIP, dan Tanggal Lahirmu. Apabila ada yang
            berbeda silahkan lapor menggunakan tombol Tanya BKD diatas.
            Penulisan gelar seperti S.Kom dengan S.Kom. dianggap sama tidak
            perlu perbaikan #datamutanggungjawabmu
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

function CompareDataUtama() {
  const { data, isLoading } = useQuery(["data-utama-siasn"], () =>
    dataUtamaSIASN()
  );

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster"],
    () => dataUtamaSimaster()
  );

  return (
    <div>
      <Stack>
        <Pemberitahuan />
        <Skeleton loading={isLoading || isLoadingDataSimaster}>
          <Row
            gutter={[
              { xs: 8, sm: 16, md: 24, lg: 32 },
              { xs: 8, sm: 16, md: 24, lg: 32 },
            ]}
          >
            <Col md={18}>
              <Card>
                <Table>
                  <thead>
                    <tr>
                      <th>Jenis Data</th>
                      <th>SIASN</th>
                      <th>SIMASTER</th>
                      <th
                        style={{
                          textAlign: "center",
                        }}
                      >
                        Hasil
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Nama</td>
                      <td>{data?.nama}</td>
                      <td>{dataSimaster?.nama}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.nama}
                          secondData={dataSimaster?.nama}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>NIP</td>
                      <td>{data?.nipBaru}</td>
                      <td>{dataSimaster?.nip_baru}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.nipBaru}
                          secondData={dataSimaster?.nip_baru}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Tanggal Lahir</td>
                      <td>{data?.tglLahir}</td>
                      <td>{dataSimaster?.tgl_lahir}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.tglLahir}
                          secondData={dataSimaster?.tgl_lahir}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>Gelar Depan</td>
                      <td>{data?.gelarDepan}</td>
                      <td>{dataSimaster?.gelar_depan}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {komparasiGelar(
                          data?.gelarDepan,
                          dataSimaster?.gelar_depan
                        ) ? (
                          <IconCircleCheck />
                        ) : (
                          <CloseOutlined />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Gelar Belakang</td>
                      <td>{data?.gelarBelakang}</td>
                      <td>{dataSimaster?.gelar_belakang}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        {komparasiGelar(
                          data?.gelarBelakang,
                          dataSimaster?.gelar_belakang
                        ) ? (
                          <IconCircleCheck />
                        ) : (
                          <CloseOutlined />
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td>Email</td>
                      <td>{data?.email}</td>
                      <td>{dataSimaster?.email}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.email}
                          secondData={dataSimaster?.email}
                        />
                      </td>
                    </tr>
                    <tr>
                      <td>NIK</td>
                      <td>{data?.nik}</td>
                      <td>{dataSimaster?.nik}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <CheckHasil
                          firstData={data?.nik}
                          secondData={dataSimaster?.nik}
                        />
                      </td>
                    </tr>

                    <tr>
                      <td>Jabatan</td>
                      <td>{data?.jabatanNama}</td>
                      <td>{dataSimaster?.jabatan?.jabatan}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <Tooltip title="Penulisan kemungkinan beda tapi secara substansi sama">
                          <IconAlertCircle
                            style={{
                              color: "orange",
                            }}
                          />
                        </Tooltip>
                      </td>
                    </tr>
                    <tr>
                      <td>Pendidikan Terakhir</td>
                      <td>{data?.pendidikanTerakhirNama}</td>
                      <td>{`${dataSimaster?.pendidikan?.jenjang} ${dataSimaster?.pendidikan?.prodi}`}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <Tooltip title="Penulisan kemungkinan beda tapi secara substansi sama">
                          <IconAlertCircle
                            style={{
                              color: "orange",
                            }}
                          />
                        </Tooltip>
                      </td>
                    </tr>
                    <tr>
                      <td>Pangkat</td>
                      <td>{`${data?.pangkatAkhir}-${data?.golRuangAkhir}`}</td>
                      <td>{`${dataSimaster?.pangkat?.pangkat}-${dataSimaster?.pangkat?.golongan}`}</td>
                      <td
                        style={{
                          textAlign: "center",
                        }}
                      >
                        <Tooltip title="Penulisan kemungkinan beda tapi secara substansi sama">
                          <IconAlertCircle
                            style={{
                              color: "orange",
                            }}
                          />
                        </Tooltip>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        </Skeleton>
      </Stack>
    </div>
  );
}

export default CompareDataUtama;
