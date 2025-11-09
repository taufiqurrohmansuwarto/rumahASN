import {
  createFaqQna,
  deleteFaqQna,
  updateFaqQna,
} from "@/services/tickets-ref.services";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Modal, message } from "antd";

function useFaqQnaMutations(router) {
  const queryClient = useQueryClient();

  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (payload) => createFaqQna(payload),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["faq-qna", router.query]);
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

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Konfirmasi",
      content: "Apakah Anda yakin ingin menghapus FAQ ini?",
      okText: "Ya",
      cancelText: "Tidak",
      onOk: () => remove(id),
    });
  };

  return {
    create,
    update,
    handleDelete,
    isLoadingCreate,
    isLoadingUpdate,
    isLoadingDelete,
  };
}

export default useFaqQnaMutations;

