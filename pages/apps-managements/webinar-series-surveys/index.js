import Layout from "@/components/Layout";
import AdminLayoutWebinar from "@/components/WebinarSeries/AdminLayoutWebinar";
import SurveyQuestion from "@/components/WebinarSeries/SurveyQuestion";
import {
  createSurvey,
  deleteSurvey,
  readAllSurvey,
  updateSurvey,
} from "@/services/webinar.services";
import { FileAddOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  message,
} from "antd";
import Head from "next/head";
import { useEffect, useState } from "react";

const UpdateQuestion = ({ open, handleCancel, data }) => {
  const queryClient = useQueryClient();

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateSurvey(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat survey!");
        handleCancel();
      },
      onError: () => {
        message.error("Gagal membuat survey!");
      },
      onSettled: () => {
        queryClient.invalidateQueries("webinar-series-surveys");
      },
    }
  );

  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(data);
  }, [data, form]);

  const handleFinish = async () => {
    const values = await form.validateFields();
    update({
      id: data?.id,
      data: values,
    });
  };

  return (
    <Modal
      confirmLoading={isLoadingUpdate}
      title="Buat Survey Webinar"
      centered
      onOk={handleFinish}
      open={open}
      onCancel={handleCancel}
    >
      <Form
        initialValues={data}
        layout="vertical"
        form={form}
        name="form-webinar-question"
      >
        <Form.Item
          name="question"
          label="Pertanyaan"
          rules={[{ required: true, message: "Pertanyaan Tidak boleh kosong" }]}
        >
          <Input.TextArea cols={12} />
        </Form.Item>
        <Form.Item
          name="type"
          label="Jenis Pertanyaan"
          rules={[
            { required: true, message: "Tipe pertanyaan tidak boleh kosong" },
          ]}
        >
          <Select
            options={[
              {
                label: "Skala 1-5",
                value: "scale",
              },
              {
                label: "Teks Bebas",
                value: "free_text",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CreateQuestion = ({ open, handleCancel }) => {
  const queryClient = useQueryClient();

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createSurvey(data),
    {
      onSuccess: () => {
        message.success("Berhasil membuat survey!");
        handleCancel();
      },
      onError: () => {
        message.error("Gagal membuat survey!");
      },
      onSettled: () => {
        queryClient.invalidateQueries("webinar-series-surveys");
      },
    }
  );

  const [form] = Form.useForm();

  const handleFinish = async () => {
    const values = await form.validateFields();
    create(values);
  };

  return (
    <Modal
      confirmLoading={isLoadingCreate}
      title="Buat Survey Webinar"
      centered
      onOk={handleFinish}
      open={open}
      onCancel={handleCancel}
    >
      <Form layout="vertical" form={form} name="form-webinar-question">
        <Form.Item
          name="question"
          label="Pertanyaan"
          rules={[{ required: true, message: "Pertanyaan Tidak boleh kosong" }]}
        >
          <Input.TextArea cols={12} />
        </Form.Item>
        <Form.Item
          name="type"
          label="Jenis Pertanyaan"
          rules={[
            { required: true, message: "Tipe pertanyaan tidak boleh kosong" },
          ]}
        >
          <Select
            options={[
              {
                label: "Skala 1-5",
                value: "scale",
              },
              {
                label: "Teks Bebas",
                value: "free_text",
              },
            ]}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function WebinarSeriesSurveys() {
  const queryClient = useQueryClient();

  const { mutateAsync: deleteQuestion } = useMutation(
    (id) => deleteSurvey(id),
    {
      onSettled: () => {
        message.success("Berhasil menghapus pertanyaan!");
        queryClient.invalidateQueries("webinar-series-surveys");
      },
    }
  );

  const [open, setOpen] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [dataEdit, setDataEdit] = useState({});

  const handleOpenEdit = (row) => {
    setOpenEdit(true);
    setDataEdit(row);
  };

  const handleCancelEdit = () => setOpenEdit(false);

  const handleOpen = () => setOpen(true);
  const handleCancel = () => setOpen(false);

  const { data, isLoading } = useQuery(
    ["webinar-series-surveys"],
    () => readAllSurvey(),
    {}
  );

  const columns = [
    {
      title: "Pertanyaan",
      dataIndex: "question",
    },
    {
      title: "Jenis Pertanyaan",
      dataIndex: "type",
    },
    {
      title: "Aksi",
      key: "aksi",
      render: (row) => (
        <Space>
          <a onClick={() => handleOpenEdit(row)}>Edit</a>
          <Divider type="vertical" />
          <Popconfirm
            onConfirm={async () => {
              await deleteQuestion(row?.id);
            }}
            title="Apakah anda yakin ingin menghapus data?"
          >
            Hapus
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Webinar Series Surveys</title>
      </Head>
      <AdminLayoutWebinar
        active="webinar-series-surveys"
        title="Rumah ASN"
        content="Webinar Survey"
        loading={isLoading}
      >
        <Card>
          <CreateQuestion open={open} handleCancel={handleCancel} />
          <UpdateQuestion
            open={openEdit}
            handleCancel={handleCancelEdit}
            data={dataEdit}
          />
          <Table
            title={() => (
              <Button
                type="primary"
                icon={<FileAddOutlined />}
                onClick={handleOpen}
              >
                Kuisioner
              </Button>
            )}
            columns={columns}
            loading={isLoading}
            rowKey={(row) => row?.id}
            dataSource={data}
            pagination={false}
          />
        </Card>
      </AdminLayoutWebinar>
    </>
  );
}

WebinarSeriesSurveys.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

WebinarSeriesSurveys.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default WebinarSeriesSurveys;
