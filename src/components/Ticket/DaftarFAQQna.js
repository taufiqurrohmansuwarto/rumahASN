import FormFaqQna from "@/components/Ticket/FormFaqQna";
import FaqQnaDetailModal from "@/components/Ticket/FaqQna/FaqQnaDetailModal";
import FaqQnaFilters from "@/components/Ticket/FaqQna/FaqQnaFilters";
import FaqQnaHeader from "@/components/Ticket/FaqQna/FaqQnaHeader";
import FaqQnaTable from "@/components/Ticket/FaqQna/FaqQnaTable";
import useFaqQnaDownload from "@/components/Ticket/FaqQna/useFaqQnaDownload";
import useFaqQnaMutations from "@/components/Ticket/FaqQna/useFaqQnaMutations";
import ReactMarkdownCustom from "@/components/MarkdownEditor/ReactMarkdownCustom";
import { Text } from "@mantine/core";
import { getFaqQna, getFaqQnaHistory } from "@/services/tickets-ref.services";
import { subCategories } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card, Modal, Tag } from "antd";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { useState } from "react";

const ModalForm = ({ open, onCancel, isLoading, onSubmit, type, data }) => {
  return (
    <Modal
      width={800}
      open={open}
      onCancel={onCancel}
      footer={null}
      title={type === "create" ? "Tambah FAQ" : "Edit FAQ"}
      centered
      destroyOnClose
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [modalType, setModalType] = useState("create");
  const [searchText, setSearchText] = useState(router?.query?.search || "");
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedFaqId, setSelectedFaqId] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);

  const {
    page = 1,
    limit = 10,
    search,
    is_active,
    sub_category_id,
    show_expired = "false",
  } = router.query;

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

  // Queries
  const { data, isLoading, isFetching, refetch, isRefetching } = useQuery({
    queryKey: ["faq-qna", router.query],
    queryFn: () => getFaqQna(router?.query),
    enabled: !!router?.query,
    placeholderData: (previousData) => previousData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: dataSubCategories } = useQuery({
    queryKey: ["sub-categories", "all"],
    queryFn: () => subCategories({ limit: -1 }),
    placeholderData: (previousData) => previousData,
  });

  const { data: historyData } = useQuery({
    queryKey: ["faq-qna-history", selectedFaqId],
    queryFn: () => getFaqQnaHistory(selectedFaqId),
    enabled: !!selectedFaqId && historyModalOpen,
    placeholderData: (previousData) => previousData,
  });

  // Mutations
  const { create, update, handleDelete, isLoadingCreate, isLoadingUpdate } =
    useFaqQnaMutations(router);

  // Download
  const { downloadFaq, isDownloading } = useFaqQnaDownload();

  // Handlers
  const handleCreate = (payload) => {
    create(payload, {
      onSuccess: () => handleCancel(),
    });
  };

  const handleUpdate = (payload) => {
    update(
      { id: selectedData.id, data: payload },
      {
        onSuccess: () => handleCancel(),
      }
    );
  };

  const handleDownload = () => {
    downloadFaq({ ...router.query, limit: -1 });
  };

  const handleChangePage = (newPage, newPageSize) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage, limit: newPageSize },
    });
  };

  const handleSearch = (value) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, search: value, page: 1 },
    });
  };

  const handleFilterStatus = (value) => {
    const { is_active: _, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: {
        ...restQuery,
        ...(value !== undefined && { is_active: value }),
        page: 1,
      },
    });
  };

  const handleFilterSubCategory = (value) => {
    const { sub_category_id: _, ...restQuery } = router.query;
    router.push({
      pathname: router.pathname,
      query: {
        ...restQuery,
        ...(value && { sub_category_id: value }),
        page: 1,
      },
    });
  };

  const handleFilterExpired = (value) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, show_expired: value, page: 1 },
    });
  };

  const clearFilters = () => {
    setSearchText("");
    router.push({
      pathname: router.pathname,
      query: { page: 1, limit: 10 },
    });
  };

  const handleViewDetail = (faq) => {
    setDetailData(faq);
    setDetailModalOpen(true);
  };

  const handleViewHistory = (id) => {
    setSelectedFaqId(id);
    setHistoryModalOpen(true);
  };

  const handleCreateVersion = (faq) => {
    Modal.confirm({
      title: "Buat Versi Baru",
      content: `Buat versi baru dari FAQ ini (v${faq.version} → v${
        faq.version + 1
      })?`,
      okText: "Ya, Buat",
      cancelText: "Batal",
      onOk: () => {
        handleOpen("edit", {
          ...faq,
          create_new_version: true,
        });
      },
    });
  };

  const hasActiveFilters =
    search ||
    is_active !== undefined ||
    sub_category_id ||
    show_expired === "true";

  return (
    <div>
      <Card
        style={{
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          border: "none",
        }}
      >
        <FaqQnaHeader />

        <FaqQnaFilters
          searchText={searchText}
          setSearchText={setSearchText}
          handleSearch={handleSearch}
          is_active={is_active}
          handleFilterStatus={handleFilterStatus}
          sub_category_id={sub_category_id}
          handleFilterSubCategory={handleFilterSubCategory}
          show_expired={show_expired}
          handleFilterExpired={handleFilterExpired}
          dataSubCategories={dataSubCategories}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
          isRefetching={isRefetching}
          refetch={refetch}
          handleOpen={handleOpen}
          isDownloading={isDownloading}
          handleDownload={handleDownload}
        />

        <FaqQnaTable
          data={data}
          isLoading={isLoading}
          isFetching={isFetching}
          page={page}
          limit={limit}
          handleChangePage={handleChangePage}
          handleOpen={handleOpen}
          handleDelete={handleDelete}
          handleViewHistory={handleViewHistory}
          handleCreateVersion={handleCreateVersion}
          handleViewDetail={handleViewDetail}
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

      {/* Detail Modal */}
      <FaqQnaDetailModal
        open={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setDetailData(null);
        }}
        data={detailData}
      />

      {/* History Modal */}
      <Modal
        title="Riwayat Versi FAQ"
        open={historyModalOpen}
        onCancel={() => {
          setHistoryModalOpen(false);
          setSelectedFaqId(null);
        }}
        footer={null}
        width={900}
      >
        {historyData && (
          <div>
            {historyData.data?.map((item, idx) => (
              <div key={item.id}>
                <div
                  style={{
                    padding: "16px",
                    borderLeft: `3px solid ${
                      item.is_active ? "#40c057" : "#868e96"
                    }`,
                    backgroundColor: "#f8f9fa",
                    marginBottom: idx < historyData.data.length - 1 ? 16 : 0,
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 12,
                      alignItems: "center",
                    }}
                  >
                    <Tag color="blue">v{item.version}</Tag>
                    <Tag color={item.is_active ? "success" : "default"}>
                      {item.is_active ? "Aktif" : "Nonaktif"}
                    </Tag>
                    {item.previous_version_id && (
                      <Tag color="default">dari v{item.version - 1}</Tag>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ marginBottom: 8 }}>
                    <Text
                      size="xs"
                      color="dimmed"
                      style={{ display: "block", marginBottom: 4 }}
                    >
                      Pertanyaan
                    </Text>
                    <Text size="sm" weight={600}>
                      {item.question}
                    </Text>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <Text
                      size="xs"
                      color="dimmed"
                      style={{ display: "block", marginBottom: 4 }}
                    >
                      Jawaban
                    </Text>
                    <div style={{ fontSize: "14px" }}>
                      <ReactMarkdownCustom>{item.answer}</ReactMarkdownCustom>
                    </div>
                  </div>

                  {/* Footer */}
                  <Text size="xs" color="dimmed">
                    Dibuat: {dayjs(item.created_at).format("DD MMM YYYY HH:mm")}
                    {item.updated_at && item.updated_at !== item.created_at && (
                      <>
                        {" "}
                        • Diubah:{" "}
                        {dayjs(item.updated_at).format("DD MMM YYYY HH:mm")}
                      </>
                    )}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default DaftarFAQQna;
