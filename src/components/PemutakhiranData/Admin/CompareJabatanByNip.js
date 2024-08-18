import { rwJabatanMasterByNip } from "@/services/master.services";
import {
  dataUtamSIASNByNip,
  getRwJabatanByNip,
  getTokenSIASNService,
  postRwJabatanByNip,
} from "@/services/siasn-services";
import {
  API_URL,
  getJenisJabatanId,
  getNamaJabatan,
  setJenisJabatanColor,
} from "@/utils/client-utils";
import { FileAddOutlined } from "@ant-design/icons";
import { Alert, Stack, Text } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Anchor,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Grid,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import FormJFT from "../FormJFT";
import FormJFU from "../FormJFU";
import FormStruktural from "../FormStruktural";
import FormUnitOrganisasi from "../FormUnitOrganisasi";
import FormUnorJabatan from "../FormUnorJabatan";
import FormUnorJabatanTransfer from "../FormUnorJabatanTransfer";
import CompareJabatanDokterByNip from "./CompareJabatanDokterByNip";
import CompareJabatanGuruByNip from "./CompareJabatanGuruByNip";
import ComparePangkatByNip from "./ComparePangkatByNip";
import FormEditJabatanByNip from "./FormEditJabatanByNip";
import ComparePendidikanByNip from "./ComparePendidikanByNip";
import ComparePindahInstansiByNip from "./ComparePindahInstansiByNip";
import ComparePwkByNip from "./ComparePwkByNip";
import HapusJabatan from "./HapusJabatan";
import UploadDokumen from "../UploadDokumen";
dayjs.locale("id");

const format = "DD-MM-YYYY";

const FormEntriKosong = ({ visible, onCancel, nip }) => {
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
        eselon_id,
      } = await form.validateFields();

      let jenis_jabatan_id = getJenisJabatanId(jenis_jabatan);

      const data = {
        tmtJabatan: dayjs(tmt_jabatan).format("DD-MM-YYYY"),
        tanggalSk: dayjs(tgl_sk).format("DD-MM-YYYY"),
        tmtPelantikan: dayjs(tmt_pelantikan).format("DD-MM-YYYY"),
        jabatanFungsionalId: fungsional_id ? fungsional_id : "",
        jabatanFungsionalUmumId: fungsional_umum_id ? fungsional_umum_id : "",
        eselonId: eselon_id ? eselon_id : "",
        unorId: unor_id,
        nomorSk: nomor_sk,
        jenisJabatan: jenis_jabatan_id,
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

        await postRwJabatanByNip({
          nip,
          data: postData,
        });

        message.success("Data berhasil disimpan");
        queryClient.invalidateQueries("data-jabatan");
        onCancel();
        form.resetFields();
        setFileList([]);
        setLoading(false);
      } else {
        await postRwJabatanByNip({
          nip,
          data,
        });

        message.success("Data berhasil disimpan");
        queryClient.invalidateQueries("data-jabatan");
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
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmModal = async () => {
    try {
      const result = await form.validateFields();
      Modal.confirm({
        centered: true,
        title: "Apakah anda yakin?",
        content: `Mohon pastikan semua data dan dokumen yang Anda masukkan selalu terkini dan akurat. Ketidaksesuaian informasi bisa berdampak pada proses layanan kepegawaian pegawai. Ingat, setiap entri data akan dicatat dan dipertanggungjawabkan melalui sistem log Rumah ASN.`,
        okText: "Ya",
        cancelText: "Tidak",
        onOk: async () => await handleFinish(),
      });
    } catch (error) {}
  };

  return (
    <Modal
      centered
      title="Entri Jabatan SIASN"
      width={800}
      open={visible}
      onOk={handleConfirmModal}
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
                eselon_id: null,
              });
            }}
          >
            <Select.Option value="Pelaksana">Pelaksana</Select.Option>
            <Select.Option value="Fungsional">Fungsional</Select.Option>
            <Select.Option value="Struktural">Struktural</Select.Option>
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
            ) : getFieldValue("jenis_jabatan") === "Struktural" ? (
              <FormStruktural name="eselon_id" />
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
        <Row gutter={16}>
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item
              rules={[{ required: true }]}
              name="tmt_pelantikan"
              label="TMT Pelantikan"
            >
              <DatePicker format={format} />
            </Form.Item>
          </Col>
          <Col span={8}>
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

const FormEntri = ({ visible, onCancel, nip, data }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(data);
  }, [form, data]);

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
        jabatanFungsionalId: fungsional_id ? fungsional_id : "",
        jabatanFungsionalUmumId: fungsional_umum_id ? fungsional_umum_id : "",
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

        await postRwJabatanByNip({
          nip,
          data: postData,
        });

        message.success("Data berhasil disimpan");
        queryClient.invalidateQueries("data-jabatan");
        onCancel();
        form.resetFields();
        setFileList([]);
        setLoading(false);
      } else {
        await postRwJabatanByNip({
          nip,
          data,
        });

        message.success("Data berhasil disimpan");
        queryClient.invalidateQueries("data-jabatan");
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      centered
      title="Entri Jabatan SIASN"
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
        <Row gutter={16}>
          <Col span={8}>
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
          <Col span={8}>
            <Form.Item
              rules={[{ required: true }]}
              name="tmt_pelantikan"
              label="TMT Pelantikan"
            >
              <DatePicker format={format} />
            </Form.Item>
          </Col>
          <Col span={8}>
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

function CompareJabatanByNip({ nip }) {
  const { data: dataUser, status } = useSession();
  const breakPoint = Grid.useBreakpoint();

  const { data: dataSiasn, isLoading: loadingDataSiasn } = useQuery(
    ["data-utama-siasn", nip],
    () => dataUtamSIASNByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const [visible, setVisible] = useState(false);
  const [currentData, setCurrentData] = useState(null);

  // form edit
  const [visibleEdit, setVisibleEdit] = useState(false);
  const [currentDataEdit, setCurrentDataEdit] = useState(null);

  const handleCloseEdit = () => {
    setVisibleEdit(false);
    setCurrentDataEdit(null);
  };

  // formKosong
  const [visibleKosong, setVisibleKosong] = useState(false);
  const handleCloseKosong = () => setVisibleKosong(false);

  const handleClose = () => {
    setVisible(false);
    setCurrentData(null);
  };

  const { data, isLoading } = useQuery(
    ["data-jabatan", nip],
    () => getRwJabatanByNip(nip),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: dataMaster, isLoading: loadingMasterJabatan } = useQuery(
    ["data-rw-jabatan-master-by-nip", nip],
    () => rwJabatanMasterByNip(nip)
  );

  const columnsMaster = [
    {
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (_, record) => {
        return (
          <Stack>
            <div>
              <a href={record?.file} target="_blank" rel="noreferrer">
                File
              </a>
            </div>
            <Tag color={setJenisJabatanColor(record?.jenis_jabatan)}>
              {record?.jenis_jabatan}
            </Tag>
            <Text
              underline={record?.aktif === "Y"}
              strong={record?.aktif === "Y"}
            >
              {record?.jabatan}
            </Text>
            <Text>
              {record?.unor} - {record?.nomor_sk}
            </Text>
            <Text>
              TMT Jabatan {record?.tmt_jabatan} - Tgl. SK {record?.tgl_sk}
            </Text>
            <Text>{record?.aktif === "Y" ? "Aktif" : "Tidak Aktif"}</Text>
          </Stack>
        );
      },
    },
    {
      title: "File",
      dataIndex: "file",
      render: (_, record) => {
        return (
          <div>
            <a href={record?.file} target="_blank" rel="noreferrer">
              File
            </a>
          </div>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Jenis",
      key: "jenis_jabatan",
      render: (row) => (
        <Tag color={setJenisJabatanColor(row?.jenis_jabatan)}>
          {row?.jenis_jabatan}
        </Tag>
      ),
      responsive: ["sm"],
    },
    {
      title: "Jabatan",
      key: "jabatan",
      render: (row) => {
        return (
          <Typography.Text
            underline={row?.aktif === "Y"}
            strong={row?.aktif === "Y"}
          >
            {row?.jabatan}
          </Typography.Text>
        );
      },
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
    // { title: "Aktif", dataIndex: "aktif", key: "aktif" },
    {
      title: "Aksi",
      key: "aksi",
      responsive: ["sm"],
      render: (_, row) => {
        const payload = {
          unor: row?.unor,
          jabatan: row?.jabatan,
          tmtJabatan: row?.tmt_jabatan
            ? dayjs(row?.tmt_jabatan, "DD-MM-YYYY")
            : null,
          tanggalSk: row?.tgl_sk ? dayjs(row?.tgl_sk, "DD-MM-YYYY") : null,
          tmtPelantikan: row?.tmtPelantikan
            ? dayjs(row?.tmt_pelantikan, "DD-MM-YYYY")
            : null,
          nomorSk: row?.nomor_sk,
          jenis_jabatan: row?.jenis_jabatan,
          file: row?.file,
        };

        return (
          <Space>
            <FormUnorJabatanTransfer
              dataSiasn={data}
              data={payload}
              kata="Pakai"
            />
          </Space>
        );
      },
    },
  ];

  const columns = [
    {
      title: "Data",
      key: "data",
      responsive: ["xs"],
      render: (row, record) => {
        const jenisJabatan = checkJenisJabatan(row);
        return (
          <Stack>
            <div>
              {record?.path?.[872] && (
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${record?.path?.[872]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  File
                </a>
              )}
            </div>
            <Text>
              <Tag color={setJenisJabatanColor(jenisJabatan)}>
                {jenisJabatan}
              </Tag>
            </Text>
            <Text>
              {namaJabatan(row)} - {row?.unorNama}
            </Text>
            <Text>No. SK {row?.nomorSk}</Text>
            <Text>Tgl. SK {row?.tanggalSk}</Text>
            <Text>TMT Jabatan {row?.tmtJabatan}</Text>
          </Stack>
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
      render: (row) => {
        const jenisJabatan = checkJenisJabatan(row);
        return (
          <Tag color={setJenisJabatanColor(jenisJabatan)}>{jenisJabatan}</Tag>
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Jabatan",
      key: "nama_jabatan",
      responsive: ["sm"],
      render: (row) => <div>{namaJabatan(row)}</div>,
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
    {
      title: "Aksi",
      key: "edit",
      responsive: ["sm"],
      render: (records, row, index) => {
        const payload = {
          ...row,
          jenis_jabatan: getNamaJabatan(row?.jenisJabatan),
          tmtJabatan: row?.tmtJabatan
            ? dayjs(row?.tmtJabatan, "DD-MM-YYYY")
            : null,
          tmtMutasi: row?.tmtMutasi
            ? dayjs(row?.tmtMutasi, "DD-MM-YYYY")
            : null,
          tmtPelantikan: row?.tmtPelantikan
            ? dayjs(row?.tmtPelantikan, "DD-MM-YYYY")
            : null,
          tanggalSk: row?.tanggalSk
            ? dayjs(row?.tanggalSk, "DD-MM-YYYY")
            : null,
          fungsional_umum_id: row?.jabatanFungsionalUmumId,
          fungsional_id: row?.jabatanFungsionalId,
          eselon_id: row?.eselonId,
        };

        const lastId = data?.[data?.length - 1]?.id;

        if (lastId === row?.id) {
          return null;
        } else {
          return (
            <Space>
              {/* <FormUnorJabatanTransfer data={payload} kata="Edit" /> */}
              <Divider type="vertical" />
              <HapusJabatan id={row?.id} />
              <Divider type="vertical" />
              <UploadDokumen
                id={row?.id}
                idRefDokumen={872}
                nama="SK"
                invalidateQueries={["data-rw-jabatan-master-by-nip"]}
              />
              <Divider type="vertical" />
              <UploadDokumen
                id={row?.id}
                idRefDokumen={873}
                nama="Pelantikan"
                invalidateQueries={["data-rw-jabatan-master-by-nip"]}
              />
            </Space>
          );
        }
      },
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      <Col md={20}>
        <Row gutter={[16, 8]}>
          <Col md={24}>
            <Card id="komparasi-jabatan" title="Komparasi Jabatan">
              {dataSiasn?.kedudukanPnsNama === "PPPK Aktif" && (
                <Alert
                  color="red"
                  title="Harap diperhatikan"
                  icon={<IconAlertCircle />}
                  style={{
                    marginBottom: 16,
                  }}
                >
                  Data Riwayat Jabatan PPPK tidak dapat diubah
                </Alert>
              )}
              {dataSiasn?.kedudukanPnsNama === "PPPK Aktif" &&
              dataUser?.user?.current_role !== "admin" ? null : (
                <FormUnorJabatan />
              )}
              <Stack>
                <FormEditJabatanByNip
                  open={visibleEdit}
                  data={currentDataEdit}
                  onClose={handleCloseEdit}
                />
                <FormEntriKosong
                  nip={nip}
                  onCancel={handleCloseKosong}
                  visible={visibleKosong}
                />
                <FormEntri
                  data={currentData}
                  nip={nip}
                  onCancel={handleClose}
                  visible={visible}
                />
                <Table
                  title={() => <Text fw="bold">SIASN</Text>}
                  columns={columns}
                  dataSource={data}
                  loading={isLoading}
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
            </Card>
          </Col>
          <Col md={24} id="jabatan-guru">
            <CompareJabatanGuruByNip nip={nip} />
          </Col>
          <Col md={24} id="jabatan-dokter">
            <CompareJabatanDokterByNip nip={nip} />
          </Col>
          <Col md={24} id="pangkat">
            <ComparePangkatByNip nip={nip} />
          </Col>
          <Col md={24} id="pendidikan-pns">
            <ComparePendidikanByNip nip={nip} />
          </Col>
          <Col md={24} id="pindah-instansi">
            <ComparePindahInstansiByNip nip={nip} />
          </Col>
          <Col md={24} id="pindah-wilayah-kerja">
            <ComparePwkByNip nip={nip} />
          </Col>
        </Row>
      </Col>
      <Col md={4}>
        {breakPoint.md && (
          <Anchor
            offsetTop={70}
            items={[
              {
                key: "komparasi-jabatan",
                href: "#komparasi-jabatan",
                title: "Komparasi Jabatan",
              },
              {
                key: "jabatan-guru",
                href: "#jabatan-guru",
                title: "Jabatan Guru",
              },
              {
                key: "jabatan-dokter",
                href: "#jabatan-dokter",
                title: "Jabatan Dokter",
              },
              {
                key: "pangkat",
                href: "#pangkat",
                title: "Pangkat",
              },
              {
                key: "pendidikan-pns",
                href: "#pendidikan-pns",
                title: "Pendidikan",
              },
              {
                key: "pindah-instansi",
                href: "#pindah-instansi",
                title: "Pindah Instansi",
              },
              {
                key: "pindah-wilayah-kerja",
                href: "#pindah-wilayah-kerja",
                title: "Pindah Wilayah Kerja",
              },
            ]}
          />
        )}
      </Col>
    </Row>
  );
}

export default CompareJabatanByNip;
