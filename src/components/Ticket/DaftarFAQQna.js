import FormFaqQna from "@/components/Ticket/FormFaqQna";
import {
  createFaqQna,
  deleteFaqQna,
  getFaqQna,
  updateFaqQna,
} from "@/services/tickets-ref.services";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Col,
  Modal,
  Row,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

const { Title, Text } = Typography;

const ModalForm = ({ open, onCancel, isLoading, onSubmit, type, data }) => {
  return (
    <Modal
      width={800}
      open={open}
      onCancel={onCancel}
      footer={null}
      title={type === "create" ? "Tambah FAQ" : "Edit FAQ"}
    >
      <FormFaqQna
        isLoading={isLoading}
        onSubmit={onSubmit}
        type={type}
        data={data}
      />
    </Modal>
  );
};

function DaftarFAQQna() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [modalType, setModalType] = useState("create");

  const handleCancel = () => {
    setOpen(false);
    setSelectedData(null);
    setModalType("create");
  };

  const handleOpen = (type = "create", data = null) => {
    setModalType(type);
    setSelectedData(data);
    setOpen(true);
  };

  const { data, isLoading, isFetching } = useQuery(
    ["faq-qna", router.query],
    () => getFaqQna(router?.query),
    {
      enabled: !!router?.query,
    }
  );

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (payload) => createFaqQna(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faq-qna", router.query]);
        handleCancel();
        message.success("FAQ berhasil ditambahkan");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (payload) => updateFaqQna(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faq-qna", router.query]);
        handleCancel();
        message.success("FAQ berhasil diperbarui");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const { mutate: remove, isLoading: isLoadingDelete } = useMutation(
    (id) => deleteFaqQna(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faq-qna", router.query]);
        message.success("FAQ berhasil dihapus");
      },
      onError: (error) => {
        message.error(error?.response?.data?.message);
      },
    }
  );

  const handleCreate = (payload) => {
    create(payload);
  };

  const handleUpdate = (payload) => {
    update({ id: selectedData.id, data: payload });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus FAQ ini?",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: () => remove(id),
    });
  };

  const handleChangePage = (page, pageSize) => {
    router.push({
      pathname: router?.pathname,
      query: { ...router?.query, page, limit: pageSize },
    });
  };

  const columns = [
    {
      title: "Pertanyaan",
      dataIndex: "question",
      width: "35%",
    },
    {
      title: "Jawaban",
      dataIndex: "answer",
      width: "40%",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      width: "10%",
      render: (value) => (
        <Tag color={value ? "success" : "error"}>
          {value ? "Aktif" : "Tidak Aktif"}
        </Tag>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      width: "15%",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleOpen("edit", record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDelete(record.id)}
          >
            Hapus
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              <QuestionCircleOutlined /> Daftar FAQ
            </Title>
            <Text type="secondary">
              Kelola pertanyaan dan jawaban untuk Bot AI
            </Text>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpen()}
            >
              Tambah FAQ
            </Button>
          </Col>
        </Row>
        <>
          <Table
            pagination={{
              current: Number(router?.query?.page) || 1,
              pageSize: Number(router?.query?.limit) || 10,
              total: data?.total,
              showTotal: (total) => `Total ${total} item`,
              onChange: handleChangePage,
              showSizeChanger: false,
            }}
            columns={columns}
            dataSource={data?.data}
            rowKey={(row) => row?.id}
            loading={isLoading || isFetching}
            bordered
            size="middle"
          />
        </>
      </Space>

      <ModalForm
        open={open}
        onCancel={handleCancel}
        isLoading={isLoadingCreate || isLoadingUpdate}
        onSubmit={modalType === "create" ? handleCreate : handleUpdate}
        type={modalType}
        data={selectedData}
      />
    </>
  );
}

export default DaftarFAQQna;
