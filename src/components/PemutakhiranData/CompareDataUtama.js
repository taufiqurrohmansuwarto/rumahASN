import { dataUtamaSimaster } from "@/services/master.services";
import {
  dataUtamaSIASN,
  updateDataUtamaSIASN,
} from "@/services/siasn-services";
import { compareText, komparasiGelar } from "@/utils/client-utils";
import { Image, Stack, Text } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Table as TableAntd,
  Tabs,
  Tag,
  message,
} from "antd";
import { useEffect } from "react";

const dataTabel = (siasn, simaster) => {
  return [
    {
      id: "nama",
      siasn: siasn?.nama,
      master: simaster?.nama,
      label: "Nama",
      result: compareText(siasn?.nama, simaster?.nama),
    },
    {
      id: "nip",
      siasn: siasn?.nipBaru,
      master: simaster?.nip_baru,
      label: "NIP",
      result: compareText(siasn?.nipBaru, simaster?.nip_baru),
    },
    {
      id: "tanggal_lahir",
      siasn: siasn?.tglLahir,
      master: simaster?.tgl_lahir,
      label: "Tanggal Lahir",
      result: compareText(siasn?.tglLahir, simaster?.tgl_lahir),
    },
    {
      id: "gelar_depan",
      siasn: siasn?.gelarDepan,
      master: simaster?.gelar_depan,
      label: "Gelar Depan",
      result: komparasiGelar(siasn?.gelarDepan, simaster?.gelar_depan),
    },
    {
      id: "gelar_belakang",
      siasn: siasn?.gelarBelakang,
      master: simaster?.gelar_belakang,
      label: "Gelar Belakang",
      result: komparasiGelar(siasn?.gelarBelakang, simaster?.gelar_belakang),
    },
    {
      id: "email",
      siasn: siasn?.email,
      master: simaster?.email,
      label: "Email",
      result: compareText(siasn?.email, simaster?.email),
    },
    {
      id: "nik",
      siasn: siasn?.nik,
      master: simaster?.nik,
      label: "NIK",
      result: compareText(siasn?.nik, simaster?.nik),
    },
    {
      id: "jabatan",
      siasn: siasn?.jabatanNama,
      master: simaster?.jabatan?.jabatan,
      label: "Jabatan",
      result: "cant compare",
    },
    {
      id: "pendidikan",
      siasn: siasn?.pendidikanTerakhirNama,
      master: `${simaster?.pendidikan?.jenjang} ${simaster?.pendidikan?.prodi}`,
      label: "Pendidikan",
      result: "cant compare",
    },
    {
      id: "pangkat",
      siasn: `${siasn?.pangkatAkhir}-${siasn?.golRuangAkhir}`,
      master: `${simaster?.pangkat?.pangkat}-${simaster?.pangkat?.golongan}`,
      label: "Pangkat",
      result: "cant compare",
    },
    {
      id: "instansi_induk",
      siasn: siasn?.instansiIndukNama,
      master: "",
      label: "Instansi Induk",
      result: "cant compare",
    },
    {
      id: "unit_organisasi",
      siasn: siasn?.unorNama,
      master: "",
      label: "Unit Organisasi",
      result: "cant compare",
    },
  ];
};

const Base64Image = ({ data }) => {
  return <Image maw={200} src={`data:image/png;base64,${data}`} alt="base64" />;
};

const TagResult = ({ record }) => {
  const id = record?.id;
  const cantCompare =
    id === "jabatan" ||
    id === "pendidikan" ||
    id === "pangkat" ||
    id === "instansi_induk" ||
    id === "unit_organisasi";
  if (cantCompare) {
    return <Tag color="orange">Bisa Jadi Sama</Tag>;
  }

  return (
    <Tag color={record?.result ? "green" : "red"}>
      {record?.result ? "Sama" : "Tidak Sama"}
    </Tag>
  );
};

const FormEditBiodata = ({ data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateDataUtamaSIASN(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengubah data");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-utama-siasn"]);
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const value = await form.validateFields();

      Modal.confirm({
        title: "Apakah anda yakin?",
        content: "Data yang anda masukkan adalah data yang benar",
        centered: true,
        onOk: async () => {
          await update({
            email: value?.email,
          });
        },
      });
    } catch (error) {
      message.error("Gagal mengubah data");
    }
  };

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        email: data?.email,
        email_gov: data?.emailGov,
        alamat: data?.alamat,
        nomor_hp: data?.noHp,
        nomor_telepon: data?.noTelp,
        nomor_bpjs: data?.bpjs,
        nomor_npwp: data?.noNpwp,
      });
    }
  }, [data, form]);

  const handleReset = () => {
    form.setFieldsValue({
      email: data?.email,
    });
  };

  return (
    <Form form={form} layout="vertical">
      {JSON.stringify(data)}{" "}
      <Form.Item
        rules={[
          {
            type: "email",
          },
        ]}
        label="Email SIASN"
        name="email"
      >
        <Input />
      </Form.Item>
      <Form.Item
        rules={[
          {
            type: "email",
          },
        ]}
        label="Email Instansi"
        name="email_gov"
      >
        <Input />
      </Form.Item>
      <Form.Item label="No. HP" name="nomor_hp">
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="No. Telephone" name="nomor_telepon">
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Alamat" name="alamat">
        <Input.TextArea />
      </Form.Item>
      <Form.Item label="Nomor BPJS" name="nomor_bpjs">
        <Input />
      </Form.Item>
      <Form.Item label="Nomor NPWP" name="nomor_npwp">
        <Input />
      </Form.Item>
      <Space>
        <Button onClick={handleSubmit} type="primary">
          Submit
        </Button>
        <Button onClick={handleReset}>Reset</Button>
      </Space>
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

  const columns = [
    {
      title: "Komparasi",
      key: "komparasi",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Row>
            <Col span={24}>
              <Text fz="md" mb={8} fw="bold" td="underline">
                {record?.label}
              </Text>
              <Text fz="sm">SIASN</Text>
              <Text fz="xs" mb={4} c="dimmed">
                {record?.siasn}
              </Text>
              <Text fz="sm">MASTER</Text>
              <Text fz="xs" c="dimmed">
                {record?.master}
              </Text>
              <div
                style={{
                  marginTop: 8,
                }}
              >
                <TagResult record={record} />
              </div>
            </Col>
          </Row>
        );
      },
    },
    {
      title: "Jenis Data",
      dataIndex: "label",
      responsive: ["sm"],
    },
    {
      title: "SIASN",
      dataIndex: "siasn",
      responsive: ["sm"],
    },
    {
      title: "SIMASTER",
      dataIndex: "master",
      responsive: ["sm"],
    },
    {
      title: "Hasil",
      key: "result",
      responsive: ["sm"],
      render: (_, record) => <TagResult record={record} />,
    },
  ];

  return (
    <Card>
      <Stack>
        <Skeleton loading={isLoading || isLoadingDataSimaster}>
          <Row
            gutter={[
              { xs: 8, sm: 16, md: 24, lg: 32 },
              { xs: 8, sm: 16, md: 24, lg: 32 },
            ]}
          >
            <Col md={24}>
              <TableAntd
                rowKey={(row) => row?.id}
                columns={columns}
                dataSource={dataTabel(data, dataSimaster)}
                pagination={false}
              />
            </Col>
          </Row>
        </Skeleton>
      </Stack>
    </Card>
  );
}

export default CompareDataUtama;
