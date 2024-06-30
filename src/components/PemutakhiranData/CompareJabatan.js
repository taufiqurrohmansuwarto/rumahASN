import { rwJabatanMaster } from "@/services/master.services";
import {
  dataUtamaSIASN,
  getRwJabatan,
  getTokenSIASNService,
  postRwJabatan,
} from "@/services/siasn-services";
import { API_URL } from "@/utils/client-utils";
import { FileAddOutlined } from "@ant-design/icons";
import { Alert, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Upload,
  message,
} from "antd";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";
import AnomaliUser from "./AnomaliUser";
import EditRiwayatJabatanSIASN from "./EditRiwayatJabatanSIASN";
import FormJFT from "./FormJFT";
import FormJFU from "./FormJFU";
import FormUnitOrganisasi from "./FormUnitOrganisasi";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const format = "DD-MM-YYYY";

// test
const FormEntri = ({ visible, onCancel, nip }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const [fileList, setFileList] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (info) => {
    let fileList = [...info.fileList];

    fileList = fileList.slice(-1);

    fileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });

    setFileList(fileList);
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      const {
        tmt_jabatan,
        tgl_sk,
        tmt_pelantikan,
        fungsional_id,
        fungsional_umum_id,
        unor_id,
        nomor_sk,
        jenis_jabatan,
      } = await form.validateFields();

      let jenis_jabatan_id = jenis_jabatan === "Fungsional" ? "2" : "4";

      const data = {
        tmtJabatan: dayjs(tmt_jabatan).format("DD-MM-YYYY"),
        tanggalSk: dayjs(tgl_sk).format("DD-MM-YYYY"),
        tmtPelantikan: dayjs(tmt_pelantikan).format("DD-MM-YYYY"),
        jabatanFungsionalId: fungsional_id ? fungsional_id : "-",
        jabatanFungsionalUmumId: fungsional_umum_id ? fungsional_umum_id : "-",
        unorId: unor_id,
        nomorSk: nomor_sk,
        jenisJabatan: jenis_jabatan_id,
        eselonId: "",
        satuanKerjaId: "A5EB03E24213F6A0E040640A040252AD",
        instansiId: "A5EB03E23CCCF6A0E040640A040252AD",
      };

      const currentFile = fileList[0]?.originFileObj;

      if (currentFile) {
        const result = await getTokenSIASNService();

        const wso2 = result?.accessToken?.wso2;
        const sso = result?.accessToken?.sso;

        const formData = new FormData();

        formData.append("file", currentFile);
        formData.append("id_ref_dokumen", "872");
        const hasil = await axios.post(`${API_URL}/upload-dok`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${wso2}`,
            Auth: `bearer ${sso}`,
          },
        });

        const postData = {
          ...data,
          path: [hasil?.data?.data],
        };

        await postRwJabatan({
          nip,
          data: postData,
        });

        message.success("Data berhasil disimpan");
        onCancel();
        form.resetFields();
        setFileList([]);
        setLoading(false);
      } else {
        await postRwJabatan({
          nip,
          data,
        });

        message.success("Data berhasil disimpan");
        onCancel();
        form.resetFields();
        setFileList([]);
        setLoading(false);
      }
      queryClient.invalidateQueries("data-jabatan");
    } catch (error) {
      message.error("Data gagal disimpan");
      setLoading(false);
      console.log(error);
    }
  };

  return (
    <Modal
      title="Entri Jabatan SIASN"
      centered
      width={800}
      open={visible}
      onOk={handleFinish}
      onCancel={onCancel}
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Upload
          beforeUpload={() => false}
          maxCount={1}
          accept=".pdf"
          onChange={handleChange}
          fileList={fileList}
        >
          <Button icon={<FileAddOutlined />}>Upload</Button>
        </Upload>
        <FormUnitOrganisasi name="unor_id" />
        <Form.Item
          rules={[{ required: true, message: "Tidak boleh kosong" }]}
          name="jenis_jabatan"
          label="Jenis Jabatan"
        >
          <Select
            onChange={() => {
              form.setFieldsValue({
                fungsional_id: null,
                fungsional_umum_id: null,
              });
            }}
          >
            <Select.Option value="Pelaksana">Pelaksana</Select.Option>
            <Select.Option value="Fungsional">Fungsional</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) =>
            prevValues.jenis_jabatan !== currentValues.jenis_jabatan
          }
        >
          {({ getFieldValue }) =>
            getFieldValue("jenis_jabatan") === "Fungsional" ? (
              <FormJFT name="fungsional_id" />
            ) : getFieldValue("jenis_jabatan") === "Pelaksana" ? (
              <FormJFU name="fungsional_umum_id" />
            ) : null
          }
        </Form.Item>
        <Form.Item
          rules={[
            {
              required: true,
              message: "'Nomer SK Tidak boleh kosong",
            },
          ]}
          name="nomor_sk"
          label="Nomor SK"
        >
          <Input />
        </Form.Item>
        <Row gutter={[8, 8]}>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "TMT Jabatan Tidak boleh kosong",
                },
              ]}
              name="tmt_jabatan"
              label="TMT Jabatan"
            >
              <DatePicker format={format} />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[{ required: true }]}
              name="tmt_pelantikan"
              label="TMT Pelantikan"
            >
              <DatePicker format={format} />
            </Form.Item>
          </Col>
          <Col md={8} xs={24}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Tanggal SK Tidak boleh kosong",
                },
              ]}
              name="tgl_sk"
              label="Tanggal SK"
            >
              <DatePicker format={format} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

const checkJenisJabatan = (data) => {
  let result = "";
  const jabatanPelaksana = !!data?.jabatanFungsionalUmumNama;
  const jabatanFungsional = !!data?.jabatanFungsionalNama;
  const jabatanStruktural = !!data?.namaJabatan;

  if (jabatanFungsional) {
    result = "Fungsional";
  } else if (jabatanPelaksana) {
    result = "Pelaksana";
  } else if (jabatanStruktural) {
    result = "Struktural";
  }

  return result;
};

const namaJabatan = (data) => {
  let result = "";
  const jabatanPelaksana = !!data?.jabatanFungsionalUmumNama;
  const jabatanFungsional = !!data?.jabatanFungsionalNama;
  const jabatanStruktural = !!data?.namaJabatan;

  if (jabatanFungsional) {
    result = data?.jabatanFungsionalNama;
  } else if (jabatanPelaksana) {
    result = data?.jabatanFungsionalUmumNama;
  } else if (jabatanStruktural) {
    result = data?.namaJabatan;
  }

  return result;
};

const jenisJabatanSiasn = (data) => {
  const { jenis_jabatan_nama } = data;
  let result = "";
  if (jenis_jabatan_nama === "Jabatan Struktural") {
    result = "Struktural";
  } else if (jenis_jabatan_nama === "Jabatan Fungsional Tertentu") {
    result = "Fungsional";
  } else if (jenis_jabatan_nama === "Jabatan Fungsional Umum") {
    result = "Pelaksana";
  }

  return result;
};

function CompareJabatan() {
  const [visible, setVisible] = useState(false);
  const handleOpen = () => setVisible(true);
  const handleClose = () => setVisible(false);
  const { data: currentUser } = useSession();

  const { data, isLoading } = useQuery(["data-jabatan"], () => getRwJabatan());

  const [editLastData, setEditLastData] = useState(false);
  const [dataEdit, setDataEdit] = useState(null);

  const handleOpenEdit = (data) => {
    setEditLastData(true);
    setDataEdit(data);
  };
  const handleCloseEdit = () => {
    setEditLastData(false);
    setDataEdit(null);
  };

  const { data: dataSIASN, isLoading: isLoadingSiasn } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN()
  );

  const { data: dataMaster, isLoading: loadingMasterJabatan } = useQuery(
    ["data-rw-jabatan-master"],
    () => rwJabatanMaster()
  );

  const columns = [
    {
      title: "Jabatan",
      responsive: ["xs"],
      key: "jabatan_xs",
      render: (_, row) => {
        return (
          <Descriptions layout="vertical" size="small">
            <Descriptions.Item label="File Jabatan">
              {row?.path?.[872] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[872]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Jenis Jabatan">
              {checkJenisJabatan(row)}
            </Descriptions.Item>
            <Descriptions.Item label="Jabatan">
              {namaJabatan(row)}
            </Descriptions.Item>
            <Descriptions.Item label="Unor">{row?.unorNama}</Descriptions.Item>
            <Descriptions.Item label="No. SK & Tgl. SK">
              {row?.nomorSk} - {row?.tanggalSk}
            </Descriptions.Item>
            <Descriptions.Item label="TMT Jabatan">
              {row?.tmtJabatan}
            </Descriptions.Item>
          </Descriptions>
        );
      },
    },
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[872] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[872]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Jenis",
      key: "jenis_jabatan",
      render: (row) => <div>{checkJenisJabatan(row)}</div>,
      responsive: ["sm"],
    },
    {
      title: "Jabatan",
      key: "nama_jabatan",

      render: (row) => <div>{namaJabatan(row)}</div>,
      responsive: ["sm"],
    },

    {
      title: "Unor",
      dataIndex: "unorNama",
      responsive: ["sm"],
    },
    {
      title: "No. SK",
      dataIndex: "nomorSk",
      key: "nomorSk",
      responsive: ["sm"],
    },
    {
      title: "TMT Jab",
      dataIndex: "tmtJabatan",
      key: "tmtJabatan",
      responsive: ["sm"],
    },
    {
      title: "Tgl SK",
      dataIndex: "tanggalSk",
      key: "tanggalSk",
      responsive: ["sm"],
    },
    // {
    //   title: "Aksi",
    //   key: "edit",
    //   render: (_, row) => {
    //     const length = data?.length;
    //     const lastData = data?.[0];

    //     if (length <= 1) {
    //       return null;
    //     } else {
    //       return (
    //         <div>
    //           {lastData?.id === row?.id && (
    //             <>
    //               <a onClick={() => handleOpenEdit(lastData)}>Edit</a>
    //             </>
    //           )}
    //         </div>
    //       );
    //     }
    //   },
    // },
  ];

  const columnsMaster = [
    {
      title: "Jabatan",
      responsive: ["xs"],
      key: "jabatan_xs",
      render: (_, record) => {
        return (
          <Descriptions size="small" layout="vertical">
            <Descriptions.Item label="File Jabatan">
              <a href={record?.file} target="_blank" rel="noreferrer">
                {record?.jenis_jabatan}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Jabatan">
              {record?.jabatan}
            </Descriptions.Item>
            <Descriptions.Item label="Unor">{record?.unor}</Descriptions.Item>
            <Descriptions.Item label="No. SK">
              {record?.nomor_sk} - {record?.tgl_sk}
            </Descriptions.Item>
            <Descriptions.Item label="TMT Jab">
              {record?.tmt_jabatan}
            </Descriptions.Item>
            <Descriptions.Item label="Tgl SK">
              {record?.tgl_sk}
            </Descriptions.Item>
            <Descriptions.Item label="Aktif">{record?.aktif}</Descriptions.Item>
          </Descriptions>
        );
      },
    },
    {
      title: "Jenis",
      dataIndex: "jenis_jabatan",
      render: (_, record) => {
        return (
          <div>
            <a href={record?.file} target="_blank" rel="noreferrer">
              {record?.jenis_jabatan}
            </a>
          </div>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Jabatan",
      key: "jabatan",
      dataIndex: "jabatan",
      responsive: ["sm"],
    },
    {
      title: "Unor",
      key: "unor",
      dataIndex: "unor",
      responsive: ["sm"],
    },
    {
      title: "No. SK",
      dataIndex: "nomor_sk",
      key: "nomor_sk",
      responsive: ["sm"],
    },
    {
      title: "TMT. Jab",
      dataIndex: "tmt_jabatan",
      key: "tmt_jabatan",
      responsive: ["sm"],
    },
    {
      title: "Tgl. SK",
      dataIndex: "tgl_sk",
      key: "tgl_sk",
      responsive: ["sm"],
    },
    { title: "Aktif", dataIndex: "aktif", key: "aktif", responsive: ["sm"] },
  ];

  return (
    <>
      <FormEntri onCancel={handleClose} visible={visible} />
      <EditRiwayatJabatanSIASN
        data={dataEdit}
        open={editLastData}
        onClose={handleCloseEdit}
        user={currentUser}
      />
      {/* <div style={{ marginBottom: 16 }}>
        <AnomaliUser />
      </div> */}
      <Stack>
        <Alert
          color="red"
          title="Harap diperhatikan"
          icon={<IconAlertCircle />}
        >
          Layanan Penambahan Jabatan SIASN secara personal dihentikan sementara,
          silahkan hubungi fasilitator kepegawaian anda untuk melakukan
          penambahan jabatan.
        </Alert>
        <Table
          // title={() => (
          //   <>
          //     {dataSIASN?.kedudukanPnsNama !== "PPPK Aktif" && (
          //       <Button
          //         type="primary"
          //         onClick={handleOpen}
          //         icon={<PlusOutlined />}
          //       >
          //         Jabatan SIASN
          //       </Button>
          //     )}
          //   </>
          // )}
          title={() => <Text fw="bold">SIASN</Text>}
          columns={columns}
          dataSource={data}
          loading={isLoading || isLoadingSiasn}
          rowKey={(row) => row?.id}
          pagination={false}
        />
        <Table
          title={() => <Text fw="bold">SIMASTER</Text>}
          columns={columnsMaster}
          dataSource={dataMaster}
          loading={loadingMasterJabatan}
          rowKey={(row) => row?.id}
          pagination={false}
        />
      </Stack>
    </>
  );
}

export default CompareJabatan;
