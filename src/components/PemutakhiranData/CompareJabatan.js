import { rwJabatanMaster } from "@/services/master.services";
import {
  dataUtamaSIASN,
  getRwJabatan,
  getTokenSIASNService,
  postRwJabatan,
} from "@/services/siasn-services";
import { API_URL } from "@/utils/client-utils";
import {
  AlertOutlined,
  CloudDownloadOutlined,
  DiffOutlined,
  FileAddOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Flex,
  Form,
  Grid,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useState } from "react";
import EditRiwayatJabatanSIASN from "./EditRiwayatJabatanSIASN";
import FormJFT from "./FormJFT";
import FormJFU from "./FormJFU";
import FormUnitOrganisasi from "./FormUnitOrganisasi";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;
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
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const {
    data,
    isLoading,
    refetch: refetchSiasn,
    isFetching: isFetchingSiasn,
  } = useQuery(["data-jabatan"], () => getRwJabatan(), {
    refetchOnWindowFocus: false,
  });

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
    () => dataUtamaSIASN(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const {
    data: dataMaster,
    isLoading: loadingMasterJabatan,
    refetch: refetchMaster,
    isFetching: isFetchingMaster,
  } = useQuery(["data-rw-jabatan-master"], () => rwJabatanMaster(), {
    refetchOnWindowFocus: false,
  });

  const handleRefreshAll = () => {
    refetchSiasn();
    refetchMaster();
  };

  const isLoadingAny =
    isLoading || isLoadingSiasn || loadingMasterJabatan || isFetchingSiasn;

  // Enhanced file download component
  const FileDownloadButton = ({
    filePath,
    fileName = "File",
    type = "siasn",
  }) => {
    const handleDownload = () => {
      message.loading(`Sedang mengunduh ${fileName}...`, 1);
    };

    if (!filePath)
      return (
        <Text style={{ color: "#787C7E", fontSize: "12px" }}>
          Tidak ada file
        </Text>
      );

    return (
      <Tooltip title={`Unduh ${fileName} Jabatan`} placement="top">
        <Button
          type="link"
          icon={<CloudDownloadOutlined />}
          href={`/helpdesk/api/siasn/ws/download?filePath=${filePath}`}
          target="_blank"
          rel="noreferrer"
          onClick={handleDownload}
          size={isMobile ? "small" : "middle"}
          style={{
            padding: isMobile ? "2px 6px" : "4px 8px",
            height: isMobile ? "24px" : "28px",
            borderRadius: "6px",
            backgroundColor: type === "siasn" ? "#E6F7FF" : "#FFF2E8",
            border: `1px solid ${type === "siasn" ? "#91D5FF" : "#FFD591"}`,
            color: type === "siasn" ? "#1890FF" : "#FF4500",
            fontWeight: 500,
            fontSize: isMobile ? "11px" : "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              type === "siasn" ? "#BAE7FF" : "#FFE7BA";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor =
              type === "siasn" ? "#E6F7FF" : "#FFF2E8";
            e.currentTarget.style.transform = "translateY(0px)";
          }}
        >
          {isMobile ? "📄" : fileName}
        </Button>
      </Tooltip>
    );
  };

  const columns = [
    {
      title: "Jabatan",
      responsive: ["xs"],
      key: "jabatan_xs",
      render: (_, row) => {
        return (
          <Card
            size="small"
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #EDEFF1",
              borderRadius: "8px",
              margin: "4px 0",
            }}
            bodyStyle={{ padding: "12px" }}
          >
            <Descriptions layout="vertical" size="small" column={1}>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    📄 File Jabatan
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <FileDownloadButton
                  filePath={row?.path?.[872]?.dok_uri}
                  fileName="Dokumen"
                  type="siasn"
                />
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    🏷️ Jenis
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text
                  style={{
                    color: "#1A1A1B",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {checkJenisJabatan(row)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    💼 Jabatan
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text
                  style={{
                    color: "#1A1A1B",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {namaJabatan(row)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    🏢 Unit Organisasi
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                  {row?.unorNama}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    📋 SK & Tanggal
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                  {row?.nomorSk}
                </Text>
                <br />
                <Text style={{ color: "#52C41A", fontSize: "11px" }}>
                  📅 {row?.tanggalSk}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    ⏰ TMT Jabatan
                  </Text>
                }
              >
                <Text
                  style={{
                    color: "#52C41A",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {row?.tmtJabatan}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );
      },
    },
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <FileDownloadButton
            filePath={row?.path?.[872]?.dok_uri}
            fileName="File"
            type="siasn"
          />
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Jenis",
      key: "jenis_jabatan",
      render: (row) => (
        <Text style={{ color: "#1A1A1B" }}>{checkJenisJabatan(row)}</Text>
      ),
      responsive: ["sm"],
    },
    {
      title: "Jabatan",
      key: "nama_jabatan",
      render: (row) => (
        <Text style={{ color: "#1A1A1B" }}>{namaJabatan(row)}</Text>
      ),
      responsive: ["sm"],
    },
    {
      title: "Unor",
      dataIndex: "unorNama",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#787C7E" }}>{text}</Text>,
    },
    {
      title: "No. SK",
      dataIndex: "nomorSk",
      key: "nomorSk",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#787C7E" }}>{text}</Text>,
    },
    {
      title: "TMT Jab",
      dataIndex: "tmtJabatan",
      key: "tmtJabatan",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#787C7E" }}>{text}</Text>,
    },
    {
      title: "Tgl SK",
      dataIndex: "tanggalSk",
      key: "tanggalSk",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#787C7E" }}>{text}</Text>,
    },
  ];

  const columnsMaster = [
    {
      title: "Jabatan",
      responsive: ["xs"],
      key: "jabatan_xs",
      render: (_, record) => {
        return (
          <Card
            size="small"
            style={{
              backgroundColor: "#F8F9FA",
              border: "1px solid #EDEFF1",
              borderRadius: "8px",
              margin: "4px 0",
            }}
            bodyStyle={{ padding: "12px" }}
          >
            <Descriptions size="small" layout="vertical" column={1}>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    📄 File Jabatan
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <FileDownloadButton
                  filePath={record?.file}
                  fileName={record?.jenis_jabatan || "Dokumen"}
                  type="simaster"
                />
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    💼 Jabatan
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text
                  style={{
                    color: "#1A1A1B",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  {record?.jabatan}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    🏢 Unit Organisasi
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                  {record?.unor}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    📋 SK & Tanggal
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text style={{ color: "#787C7E", fontSize: "12px" }}>
                  {record?.nomor_sk}
                </Text>
                <br />
                <Text style={{ color: "#52C41A", fontSize: "11px" }}>
                  📅 {record?.tgl_sk}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    ⏰ TMT Jabatan
                  </Text>
                }
                style={{ paddingBottom: "8px" }}
              >
                <Text
                  style={{
                    color: "#52C41A",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {record?.tmt_jabatan}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <Text
                    style={{
                      color: "#787C7E",
                      fontSize: "11px",
                      fontWeight: 600,
                    }}
                  >
                    ✅ Status Aktif
                  </Text>
                }
              >
                <Text
                  style={{
                    color: record?.aktif === "Ya" ? "#52C41A" : "#FF4500",
                    fontSize: "12px",
                    fontWeight: 500,
                  }}
                >
                  {record?.aktif === "Ya" ? "✅ Aktif" : "❌ Tidak Aktif"}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        );
      },
    },
    {
      title: "Jenis",
      dataIndex: "jenis_jabatan",
      render: (_, record) => {
        return (
          <FileDownloadButton
            filePath={record?.file}
            fileName={record?.jenis_jabatan || "File"}
            type="simaster"
          />
        );
      },
      responsive: ["sm"],
    },
    {
      title: "Jabatan",
      key: "jabatan",
      dataIndex: "jabatan",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#1A1A1B" }}>{text}</Text>,
    },
    {
      title: "Unor",
      key: "unor",
      dataIndex: "unor",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#787C7E" }}>{text}</Text>,
    },
    {
      title: "No. SK",
      dataIndex: "nomor_sk",
      key: "nomor_sk",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#787C7E" }}>{text}</Text>,
    },
    {
      title: "TMT. Jab",
      dataIndex: "tmt_jabatan",
      key: "tmt_jabatan",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#787C7E" }}>{text}</Text>,
    },
    {
      title: "Tgl. SK",
      dataIndex: "tgl_sk",
      key: "tgl_sk",
      responsive: ["sm"],
      render: (text) => <Text style={{ color: "#787C7E" }}>{text}</Text>,
    },
    {
      title: "Aktif",
      dataIndex: "aktif",
      key: "aktif",
      responsive: ["sm"],
      render: (text) => (
        <Text style={{ color: text === "Ya" ? "#52C41A" : "#787C7E" }}>
          {text}
        </Text>
      ),
    },
  ];

  return (
    <div
      style={{ backgroundColor: "#DAE0E6", padding: isMobile ? "8px" : "16px" }}
    >
      <FormEntri onCancel={handleClose} visible={visible} />
      <EditRiwayatJabatanSIASN
        data={dataEdit}
        open={editLastData}
        onClose={handleCloseEdit}
        user={currentUser}
      />

      {/* Alert Card */}
      <Card
        style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "8px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile */}
          {!isMobile && (
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "100px",
              }}
            >
              <AlertOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: isMobile ? "12px" : "16px" }}>
            <Alert
              message="Harap diperhatikan"
              description="Layanan Penambahan Jabatan SIASN secara personal dihentikan sementara, silahkan hubungi fasilitator kepegawaian anda untuk melakukan penambahan jabatan."
              type="warning"
              showIcon
              style={{
                backgroundColor: "#FFF7E6",
                border: "1px solid #FFD591",
                borderRadius: "4px",
              }}
            />
          </div>
        </Flex>
      </Card>

      {/* SIASN Table Card */}
      <Card
        style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "8px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile */}
          {!isMobile && (
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
              }}
            >
              <DiffOutlined style={{ color: "#1890FF", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: isMobile ? "8px" : "16px" }}>
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: isMobile ? "12px" : "16px" }}
              vertical={isMobile}
              gap={isMobile ? 8 : 0}
            >
              <div>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: "#1A1A1B",
                    fontSize: isMobile ? "14px" : "16px",
                  }}
                >
                  📋 Data Jabatan SIASN
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  Riwayat jabatan dari sistem SIASN
                </Text>
              </div>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                loading={isLoading || isLoadingSiasn || isFetchingSiasn}
                onClick={refetchSiasn}
                size={isMobile ? "small" : "middle"}
                style={{
                  color: "#787C7E",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  fontSize: isMobile ? "11px" : "14px",
                }}
              >
                {isLoading || isLoadingSiasn || isFetchingSiasn
                  ? "Memuat..."
                  : "Refresh"}
              </Button>
            </Flex>

            <Table
              columns={columns}
              dataSource={data}
              loading={isLoading || isLoadingSiasn || isFetchingSiasn}
              rowKey={(row) => row?.id}
              pagination={false}
              size="small"
              style={{
                backgroundColor: "#FFFFFF",
              }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "" : "table-row-light"
              }
            />
          </div>
        </Flex>
      </Card>

      {/* SIMASTER Table Card */}
      <Card
        style={{
          width: "100%",
          backgroundColor: "#FFFFFF",
          border: "1px solid #EDEFF1",
          borderRadius: "4px",
          marginBottom: "8px",
        }}
        bodyStyle={{ padding: 0 }}
      >
        <Flex>
          {/* Icon Section - Hide on mobile */}
          {!isMobile && (
            <div
              style={{
                width: "40px",
                backgroundColor: "#F8F9FA",
                borderRight: "1px solid #EDEFF1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "200px",
              }}
            >
              <DiffOutlined style={{ color: "#FF4500", fontSize: "18px" }} />
            </div>
          )}

          {/* Content Section */}
          <div style={{ flex: 1, padding: isMobile ? "8px" : "16px" }}>
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: isMobile ? "12px" : "16px" }}
              vertical={isMobile}
              gap={isMobile ? 8 : 0}
            >
              <div>
                <Title
                  level={5}
                  style={{
                    margin: 0,
                    color: "#1A1A1B",
                    fontSize: isMobile ? "14px" : "16px",
                  }}
                >
                  📋 Data Jabatan SIMASTER
                </Title>
                <Text
                  style={{
                    color: "#787C7E",
                    fontSize: isMobile ? "12px" : "14px",
                  }}
                >
                  Riwayat jabatan dari sistem SIMASTER
                </Text>
              </div>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                loading={loadingMasterJabatan || isFetchingMaster}
                onClick={refetchMaster}
                size={isMobile ? "small" : "middle"}
                style={{
                  color: "#787C7E",
                  border: "1px solid #EDEFF1",
                  borderRadius: "4px",
                  fontSize: isMobile ? "11px" : "14px",
                }}
              >
                {loadingMasterJabatan || isFetchingMaster
                  ? "Memuat..."
                  : "Refresh"}
              </Button>
            </Flex>

            <Table
              columns={columnsMaster}
              dataSource={dataMaster}
              loading={loadingMasterJabatan || isFetchingMaster}
              rowKey={(row) => row?.id}
              pagination={false}
              size="small"
              style={{
                backgroundColor: "#FFFFFF",
              }}
              rowClassName={(record, index) =>
                index % 2 === 0 ? "" : "table-row-light"
              }
            />
          </div>
        </Flex>
      </Card>

      <style jsx global>{`
        .table-row-light {
          background-color: #fafafa !important;
        }
        .ant-table-thead > tr > th {
          background-color: #f8f9fa !important;
          border-bottom: 2px solid #edeff1 !important;
          color: #1a1a1b !important;
          font-weight: 600 !important;
          font-size: 13px !important;
        }
        .ant-table-tbody > tr > td {
          border-bottom: 1px solid #f0f0f0 !important;
          padding: 12px 16px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #f8f9fa !important;
        }

        /* Mobile responsive adjustments */
        @media (max-width: 768px) {
          .ant-table-tbody > tr > td {
            padding: 8px 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default CompareJabatan;
