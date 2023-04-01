import { closeAppRating, giveAppRating, showAppRating } from "@/services/index";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, Input, Modal, Rate, message } from "antd";
import React, { useEffect } from "react";

function ShowRatings() {
  const queryClient = useQueryClient();
  const { data, status } = useQuery(["show-rating"], () => showAppRating(), {});

  const [openModal, setOpenModal] = React.useState(false);
  const showModal = () => setOpenModal(true);

  // update rating
  const { mutate: updateRating, isLoading: isLoadingUpdateRating } =
    useMutation((data) => giveAppRating(data), {
      onSuccess: () => {
        queryClient.invalidateQueries(["show-rating"]);
        message.success("Terima kasih atas ratingnya");
        setOpenModal(false);
      },
    });

  // close rating
  const { mutate: closeRating, isLoading: isLoadingCloseRating } = useMutation(
    () => closeAppRating(),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["show-rating"]);
        setOpenModal(false);
      },
    }
  );

  const [form] = Form.useForm();

  const handleSubmit = async () => {
    const { rating, deskripsi_rating } = await form.validateFields();
    updateRating({
      rating,
      deskripsi_rating,
    });
  };

  useEffect(() => {
    if (status === "success" && data?.show_modal) {
      showModal();
    }
  }, [data, status]);

  return (
    <Modal
      onOk={handleSubmit}
      confirmLoading={isLoadingUpdateRating}
      open={openModal}
      onCancel={() => closeRating()}
      destroyOnClose
      title="Beri Rating Aplikasi Ini"
    >
      <p>
        Terima kasih telah menggunakan aplikasi ini. Silahkan beri rating
        aplikasi ini untuk membantu kami meningkatkan kualitas aplikasi ini.
      </p>
      <Form form={form}>
        <Form.Item name="rating" label="Rating">
          <Rate />
        </Form.Item>
        <Form.Item name="deskripsi_rating" label="Deskripsi Rating">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ShowRatings;
