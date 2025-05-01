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
  FileExcelOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Flex,
  Modal,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const { Title, Text } = Typography;
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

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

  const [isDownloading, setIsDownloading] = useState(false);

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
      keepPreviousData: true,
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

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await getFaqQna({ limit: -1 });
      const workbook = XLSX.utils.book_new();
      if (response?.data?.length > 0) {
        const hasil = response?.data?.map((item) => ({
          pertanyaan: item?.question,
          jawaban: item?.answer,
          status: item?.is_active ? "Aktif" : "Tidak Aktif",
          sub_kategori: item?.sub_categories
            ?.map((item) => `${item?.name} (${item?.category?.name})`)
            .join(", "),
          tanggal_efektif: dayjs(item?.effective_date).format("DD-MM-YYYY"),
          tanggal_kadaluarsa: dayjs(item?.expired_date).format("DD-MM-YYYY"),
          referensi_peraturan: item?.regulation_ref,
        }));
        const worksheet = XLSX.utils.json_to_sheet(hasil);
        XLSX.utils.book_append_sheet(workbook, worksheet, "FAQ");
        const excelBuffer = XLSX.write(workbook, {
          bookType: "xlsx",
          type: "array",
        });
        const blob = new Blob([excelBuffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "FAQ.xlsx");
      } else {
        message.error("Tidak ada data untuk diunduh");
      }
    } catch (error) {
      message.error("Gagal mengunduh data");
    } finally {
      setIsDownloading(false);
    }
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
      title: "Sub Kategori",
      key: "sub_category",
      width: "15%",
      render: (_, record) => {
        const subCategoryName = record?.sub_categories?.map(
          (item) => item?.name
        );
        const categoryName = record?.sub_categories?.map(
          (item) => item?.category?.name
        );
        return (
          <Text>
            {subCategoryName && categoryName
              ? `${subCategoryName} (${categoryName})`
              : ""}
          </Text>
        );
      },
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
      <Card title="Daftar FAQ">
        <Flex justify="space-between">
          <Button
            type="primary"
            style={{ marginBottom: 16 }}
            icon={<PlusOutlined />}
            onClick={() => handleOpen()}
          >
            Tambah FAQ
          </Button>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleDownload}
            loading={isDownloading}
          >
            Download
          </Button>
        </Flex>
        <Table
          pagination={{
            current: Number(router?.query?.page) || 1,
            pageSize: Number(router?.query?.limit) || 10,
            total: data?.meta?.total,
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
      </Card>

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
