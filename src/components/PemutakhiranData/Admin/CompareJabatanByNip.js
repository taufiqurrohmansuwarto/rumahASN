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
import {
  Alert,
  Badge as MantineBadge,
  Stack,
  Text as MantineText,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBriefcase,
  IconFileText,
  IconFileUpload,
  IconRefresh,
} from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Anchor,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
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
          <Button icon={<IconFileUpload size={16} />}>Upload</Button>
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
          <Button icon={<IconFileUpload size={16} />}>Upload</Button>
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
      keepPreviousData: true,
      staleTime: 500000,
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

  const { data, isLoading, refetch, isFetching } = useQuery(
    ["data-jabatan", nip],
    () => getRwJabatanByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
      enabled: !!nip,
    }
  );

  const { data: dataMaster, isLoading: loadingMasterJabatan } = useQuery(
    ["data-rw-jabatan-master-by-nip", nip],
    () => rwJabatanMasterByNip(nip),
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 500000,
    }
  );

  const columnsMaster = [
    {
      title: "Jenis & Dokumen",
      key: "jenis_dokumen",
      width: 140,
      render: (row) => (
        <div>
          <MantineBadge
            size="sm"
            color={setJenisJabatanColor(row?.jenis_jabatan)}
            tt="none"
            style={{ marginBottom: 8 }}
          >
            {row?.jenis_jabatan}
          </MantineBadge>
          {row?.file && (
            <div>
              <a href={row.file} target="_blank" rel="noreferrer">
                <Button size="small" icon={<IconFileText size={14} />}>
                  SK
                </Button>
              </a>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Jabatan",
      key: "jabatan",
      width: 250,
      render: (row) => {
        return (
          <div>
            <MantineText
              size="sm"
              fw={row?.aktif === "Y" ? 600 : 500}
              td={row?.aktif === "Y" ? "underline" : "none"}
            >
              {row?.jabatan}
            </MantineText>
            <MantineText size="xs" c="dimmed">
              {row?.unor}
            </MantineText>
          </div>
        );
      },
    },
    {
      title: "No. SK",
      dataIndex: "nomor_sk",
      key: "nomor_sk",
      width: 180,
      render: (nomor_sk) => <MantineText size="sm">{nomor_sk}</MantineText>,
    },
    {
      title: "TMT Jabatan",
      dataIndex: "tmt_jabatan",
      key: "tmt_jabatan",
      width: 120,
      align: "center",
      render: (tmt_jabatan, record) => (
        <div style={{ textAlign: "center" }}>
          <MantineBadge size="sm" color="green">
            {tmt_jabatan}
          </MantineBadge>
          {record?.tgl_sk && (
            <MantineText size="xs" c="dimmed" style={{ marginTop: 4 }}>
              SK: {record.tgl_sk}
            </MantineText>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      key: "aktif",
      width: 80,
      align: "center",
      render: (row) => (
        <MantineBadge
          size="sm"
          color={row?.aktif === "Y" ? "green" : "gray"}
          tt="none"
        >
          {row?.aktif === "Y" ? "Aktif" : "Tidak"}
        </MantineBadge>
      ),
    },
    {
      title: "Aksi",
      key: "aksi",
      width: 100,
      align: "center",
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
          <FormUnorJabatanTransfer
            dataSiasn={data}
            data={payload}
            kata="Pakai"
          />
        );
      },
    },
  ];

  const columns = [
    {
      title: "Jenis & Dokumen",
      key: "jenis_dokumen",
      width: 140,
      render: (row) => {
        const jenisJabatan = checkJenisJabatan(row);
        return (
          <div>
            <MantineBadge
              size="sm"
              color={setJenisJabatanColor(jenisJabatan)}
              tt="none"
              style={{ marginBottom: 8 }}
            >
              {jenisJabatan}
            </MantineBadge>
            {row?.path?.[872] && (
              <div style={{ marginBottom: 4 }}>
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[872]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="small" icon={<IconFileText size={14} />}>
                    SK
                  </Button>
                </a>
              </div>
            )}
            {row?.path?.[873] && (
              <div>
                <a
                  href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[873]?.dok_uri}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="small" icon={<IconFileText size={14} />}>
                    Lantik
                  </Button>
                </a>
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "Jabatan",
      key: "nama_jabatan",
      width: 250,
      render: (row) => (
        <div>
          <MantineText size="sm" fw={500}>
            {namaJabatan(row)}
            {row?.subJabatanDetail?.nama && ` - ${row?.subJabatanDetail?.nama}`}
          </MantineText>
          <MantineText size="xs" c="dimmed">
            {row?.unorNama}
          </MantineText>
        </div>
      ),
    },
    {
      title: "No. SK",
      dataIndex: "nomorSk",
      key: "nomorSk",
      width: 180,
      render: (nomorSk) => <MantineText size="sm">{nomorSk}</MantineText>,
    },
    {
      title: "TMT Jabatan",
      dataIndex: "tmtJabatan",
      key: "tmtJabatan",
      width: 120,
      align: "center",
      render: (tmtJabatan, record) => (
        <div style={{ textAlign: "center" }}>
          <MantineBadge size="sm" color="green">
            {tmtJabatan}
          </MantineBadge>
          {record?.tanggalSk && (
            <MantineText size="xs" c="dimmed" style={{ marginTop: 4 }}>
              SK: {record.tanggalSk}
            </MantineText>
          )}
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "edit",
      width: 120,
      align: "center",
      render: (records, row, index) => {
        const lastId = data?.[data?.length - 1]?.id;

        if (lastId === row?.id) {
          return null;
        } else {
          return (
            <Space size="small">
              <HapusJabatan id={row?.id} />
              <UploadDokumen
                id={row?.id}
                idRefDokumen={872}
                nama="SK"
                invalidateQueries={["data-rw-jabatan-master-by-nip"]}
              />
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
            <Card
              id="komparasi-jabatan"
              title={
                <Space>
                  <IconBriefcase size={20} color="#1890ff" />
                  <Typography.Title level={4} style={{ margin: 0 }}>
                    Komparasi Jabatan
                  </Typography.Title>
                </Space>
              }
            >
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
                <Flex
                  justify="space-between"
                  align="center"
                  style={{ marginBottom: 16 }}
                >
                  <Space>
                    <MantineText fw={600} size="sm">
                      SIASN
                    </MantineText>
                    <MantineBadge size="sm" variant="light" color="blue">
                      {data?.length || 0}
                    </MantineBadge>
                  </Space>
                  <Button
                    size="small"
                    onClick={() => refetch()}
                    icon={<IconRefresh size={16} />}
                    loading={isFetching}
                  >
                    Refresh
                  </Button>
                </Flex>
                <Table
                  title={null}
                  columns={columns}
                  dataSource={data}
                  loading={isLoading || isFetching}
                  rowKey={(row) => row?.id}
                  pagination={false}
                  size="middle"
                  scroll={{ x: 800 }}
                  rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                  }
                />
                <Divider />
                <Space style={{ marginBottom: 16 }}>
                  <MantineText fw={600} size="sm">
                    SIMASTER
                  </MantineText>
                  <MantineBadge size="sm" variant="light" color="orange">
                    {dataMaster?.length || 0}
                  </MantineBadge>
                </Space>
                <Table
                  title={null}
                  columns={columnsMaster}
                  dataSource={dataMaster}
                  loading={loadingMasterJabatan}
                  rowKey={(row) => row?.id}
                  pagination={false}
                  size="middle"
                  scroll={{ x: 800 }}
                  rowClassName={(record, index) =>
                    index % 2 === 0 ? "table-row-light" : "table-row-dark"
                  }
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
