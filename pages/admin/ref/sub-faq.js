import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
} from "antd";
import { useState } from "react";
import {
  createSubFaq,
  deleteSubFaq,
  getFaqs,
  getSubFaqs,
  updateSubFaq,
} from "../../../services";
import { formatDate } from "../../../utils";

const { default: AdminLayout } = require("../../../src/components/AdminLayout");
const {
  default: PageContainer,
} = require("../../../src/components/PageContainer");

const UpdateForm = ({ open, onCancel, data }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: update } = useMutation((data) => updateSubFaq(data), {
    onSettled: () => {
      queryClient.invalidateQueries(["sub-faqs"]);
      onCancel();
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const handleOk = async () => {
    try {
      const result = await form.validateFields();

      const send = {
        id: data?.id,
        data: {
          ...result,
        },
      };
      update(send);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      onOk={handleOk}
      width={700}
      title="Update Kategori"
      open={open}
      destroyOnClose
      onCancel={onCancel}
    >
      <Form layout="vertical" form={form}>
        <Form.Item name="name" label="Nama">
          <Input />
        </Form.Item>
        <Form.Item name="description" lable="Deskripsi">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const CreateForm = ({ open, handleCancel, faqs }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();

  const { mutate: add, isLoading: confirmLoading } = useMutation(
    (data) => createSubFaq(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["sub-faqs"]);
        message.success("Berhasil menambahkan sub FAQ");
        handleCancel();
      },
      onError: (error) => {
        console.error(error);
      },
      onSettled: () => queryClient.invalidateQueries(["sub-faqs"]),
    }
  );

  const handleOk = async () => {
    try {
      const result = await form.validateFields();
      add(result);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Modal
      onOk={handleOk}
      confirmLoading={confirmLoading}
      centered
      title="Tambah Sub FAQ"
      width={800}
      open={open}
      onCancel={handleCancel}
    >
      <Form layout="vertical" form={form}>
        <Form.Item label="FAQ" name="faq_id">
          <Select>
            {faqs?.map((faq) => (
              <Select.Option key={faq?.id} value={faq?.id}>
                {faq?.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="Pertanyaan" name="question">
          <Input.TextArea />
        </Form.Item>
        <Form.Item label="Jawaban" name="answer">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const Categories = () => {
  const { data, isLoading } = useQuery(["sub-faqs"], () => getSubFaqs());
  const [createModal, setCreateModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);

  const { data: dataFaqs, isLoading: isLoadingFaqs } = useQuery(["faqs"], () =>
    getFaqs()
  );

  const openCreateModal = () => setCreateModal(true);
  const handleCancelCreateModal = () => setCreateModal(false);
  const handleCancelUpdateModal = () => setUpdateModal(false);

  const [dataUpdate, setDataUpdate] = useState(null);

  const openUpdateModal = (data) => {
    setUpdateModal(true);
    setDataUpdate(data);
  };

  const queryClient = useQueryClient();

  const { mutate: hapus } = useMutation((id) => deleteSubFaq(id), {
    onSettled: () => {
      queryClient.invalidateQueries(["sub-faqs"]);
    },
    onError: (error) => {
      console.error(error);
    },
  });

  const handleDelete = (id) => {
    hapus(id);
  };

  const columns = [
    {
      title: "FAQ",
      key: "faq",
      render: (_, row) => row?.faq?.name,
    },
    {
      title: "Pertanyaan",
      dataIndex: "question",
      key: "question",
    },
    {
      title: "Jawaban",
      dataIndex: "answer",
      key: "answer",
    },

    {
      title: "Dibuat oleh",
      key: "created_by",
      render: (text, record) => {
        return record?.created_by?.username;
      },
    },
    {
      title: "Dibuat pada",
      key: "created_at",
      render: (_, row) => formatDate(row?.created_at),
    },
    {
      title: "Aksi",
      key: "action",
      render: (text, record) => (
        <Space>
          <a
            onClick={() => {
              openUpdateModal(record);
            }}
          >
            Edit
          </a>
          <Divider type="vertical" />
          <Popconfirm
            onConfirm={() => handleDelete(record?.id)}
            title="Apakah anda ingin menghapus data?"
          >
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <Card>
        <Button
          style={{ marginBottom: 16 }}
          icon={<PlusOutlined />}
          type="primary"
          onClick={openCreateModal}
        >
          Tambah
        </Button>
        <Table
          columns={columns}
          pagination={false}
          rowKey={(row) => row?.id}
          dataSource={data}
          loading={isLoading}
        />
        <CreateForm
          faqs={dataFaqs}
          open={createModal}
          handleCancel={handleCancelCreateModal}
        />

        <UpdateForm
          open={updateModal}
          data={dataUpdate}
          faqs={dataFaqs}
          onCancel={handleCancelUpdateModal}
        />
      </Card>
    </PageContainer>
  );
};

Categories.getLayout = function getLayout(page) {
  return <AdminLayout>{page}</AdminLayout>;
};

Categories.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default Categories;
