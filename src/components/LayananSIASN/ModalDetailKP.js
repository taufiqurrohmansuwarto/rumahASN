import { dataUtamaMasterByNip } from "@/services/master.services";
import {
  dataPangkatByNip,
  uploadDokumenKenaikanPangkat,
} from "@/services/siasn-services";
import { findGolongan, findPangkat } from "@/utils/client-utils";
import { UploadOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  Upload,
  message,
} from "antd";
import { orderBy } from "lodash";
import { useState } from "react";

import dayjs from "dayjs";

dayjs.locale("id");
require("dayjs/locale/id");

const PangkatSiasn = ({ data, isLoading }) => {
  const columns = [
    {
      title: "File",
      key: "file",
      render: (_, row) => {
        return (
          <>
            {row?.path?.[858] && (
              <a
                href={`/helpdesk/api/siasn/ws/download?filePath=${row?.path?.[858]?.dok_uri}`}
                target="_blank"
                rel="noreferrer"
              >
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Pangkat",
      key: "Pangkat",
      render: (_, record) => (
        <>
          {findPangkat(record?.golonganId)} ({findGolongan(record?.golonganId)})
        </>
      ),
    },
    {
      title: "No. SK",
      dataIndex: "skNomor",
    },
    {
      title: "TMT Golongan",
      key: "tmt_golongan",
      render: (text) => <>{dayjs(text?.tmtGolongan).format("DD-MM-YYYY")}</>,
    },

    {
      title: "Tgl. SK",
      dataIndex: "skTanggal",
    },
  ];
  return (
    <>
      <Table
        loading={isLoading}
        columns={columns}
        title={() => <div>RIWAYAT PANGKAT SIASN</div>}
        pagination={false}
        dataSource={orderBy(
          data,
          [
            (o) => {
              return dayjs(o.tmtGolongan).valueOf();
            },
          ],
          ["desc"]
        )}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

const PangkatSimaster = ({ data, isLoading }) => {
  const columns = [
    {
      title: "File",
      key: "file",
      render: (text) => {
        return (
          <>
            {text?.file_pangkat && (
              <a href={text?.file_pangkat} target="_blank" rel="noreferrer">
                File
              </a>
            )}
          </>
        );
      },
    },
    {
      title: "Pangkat",
      key: "pangkat",
      render: (text) => (
        <span>
          {text?.pangkat?.pangkat} ({text?.pangkat?.gol_ruang})
        </span>
      ),
    },
    {
      title: "No. SK",
      dataIndex: "no_sk",
    },
    {
      title: "TMT Pangkat",
      dataIndex: "tmt_pangkat",
    },
    {
      title: "Tgl. SK",
      dataIndex: "tgl_sk",
    },
    {
      title: "Aktif",
      dataIndex: "aktif",
    },
  ];
  return (
    <>
      <Table
        loading={isLoading}
        title={() => <span>RIWAYAT DATA PANGKAT SIMASTER</span>}
        pagination={false}
        columns={columns}
        dataSource={data}
        rowKey={(row) => row?.id}
      />
    </>
  );
};

const ModalForm = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate, isLoading } = useMutation(
    (values) => uploadDokumenKenaikanPangkat(values),
    {
      onSuccess: () => {
        form.resetFields();
        onCancel();
        message.success("Berhasil menambahkan riwayat golongan");
      },
      onError: (error) => {
        const errMessage = error?.response?.data?.message || "Internal Error";
        message.error(errMessage);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-riwayat-pangkat", data?.nipBaru]);
      },
    }
  );

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      const currentFile = result?.file?.fileList?.[0]?.originFileObj;

      const formData = new FormData();
      formData.append("tgl_sk", dayjs(result?.tgl_sk).format("YYYY-MM-DD"));
      formData.append("no_sk", result?.no_sk);
      formData.append("file", currentFile);
      formData.append("nip", data?.nipBaru);
      formData.append("id_usulan", data?.id);
      mutate(formData);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      confirmLoading={isLoading}
      onOk={handleFinish}
      title="Upload Dokumen Pangkat"
      centered
      open={open}
      onCancel={onCancel}
    >
      {/* {JSON.stringify(data)} */}
      <Form form={form} layout="vertical">
        <Form.Item name="no_sk" label="No. SK" required>
          <Input />
        </Form.Item>
        <Form.Item name="tgl_sk" label="Tanggal SK" required>
          <DatePicker format={"DD-MM-YYYY"} />
        </Form.Item>
        <Form.Item name="file" required label="File SK">
          <Upload
            showUploadList={{
              showDownloadIcon: false,
              removeIcon: false,
              showRemoveIcon: false,
              downloadIcon: false,
              previewIcon: false,
              showPreviewIcon: false,
            }}
            accept=".pdf"
            multiple={false}
            maxCount={1}
          >
            <Button type="primary" icon={<UploadOutlined />}>
              Upload
            </Button>
          </Upload>
        </Form.Item>
      </Form>
    </Modal>
  );
};

function ModalDetailKP({ open, onCancel, data }) {
  const { data: dataPadanan, isLoading } = useQuery(
    ["data-riwayat-pangkat", data?.nipBaru],
    () => dataPangkatByNip(data?.nipBaru),
    {
      enabled: !!data?.nipBaru,
      refetchOnWindowFocus: false,
    }
  );

  const { data: dataSimaster, isLoading: isLoadingDataSimaster } = useQuery(
    ["data-utama-simaster-by-nip", data?.nipBaru],
    () => dataUtamaMasterByNip(data?.nipBaru)
  );

  const [showModal, setShowModal] = useState(false);

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <Modal
      centered={true}
      title="Detail Pegawai"
      width={900}
      bodyStyle={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
      open={open}
      onCancel={onCancel}
    >
      <ModalForm open={showModal} onCancel={closeModal} data={data} />
      <Space direction="vertical">
        <Skeleton loading={isLoadingDataSimaster}>
          {dataSimaster && (
            <>
              <Row gutter={[32, 32]}>
                <Col span={4}>
                  <Avatar size={90} shape="square" src={dataSimaster?.foto} />
                </Col>
                <Col span={12}>
                  <Space direction="vertical">
                    <Typography.Text>
                      {dataSimaster?.nama} - {dataSimaster?.nip_baru}
                    </Typography.Text>
                    <Typography.Text>
                      {dataSimaster?.jabatan?.jabatan} -{" "}
                      <Typography.Text type="secondary">
                        {dataSimaster?.skpd?.detail}
                      </Typography.Text>
                    </Typography.Text>
                  </Space>
                </Col>
              </Row>
              <Space style={{ marginTop: 10 }} direction="vertical">
                <Tag>{data?.statusUsulanNama}</Tag>
                <Button type="primary" onClick={openModal} centered>
                  Unggah Pangkat Baru
                </Button>
              </Space>
            </>
          )}
        </Skeleton>
      </Space>
      <Divider />
      <Stack>
        <PangkatSimaster
          isLoading={isLoading}
          data={dataPadanan?.pangkat_simaster}
        />
        <PangkatSiasn isLoading={isLoading} data={dataPadanan?.pangkat_siasn} />
      </Stack>
    </Modal>
  );
}

export default ModalDetailKP;
