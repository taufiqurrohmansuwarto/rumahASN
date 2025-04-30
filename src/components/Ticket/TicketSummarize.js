import { summarizeQuestion } from "@/services/admin.services";
import { useMutation } from "@tanstack/react-query";
import { Button, message, Modal } from "antd";
import { useState } from "react";

const ModalSummarize = ({ showModal, summary }) => {
  return (
    <Modal open={showModal} onCancel={handleCloseModal}>
      {JSON.stringify(summary)}
    </Modal>
  );
};

const TicketSummarize = ({ ticketId }) => {
  const [showModal, setShowModal] = useState(false);
  const [summary, setSummary] = useState("");

  const handleCloseModal = () => {
    setShowModal(false);
    setSummary("");
  };

  const { mutate, isLoading } = useMutation((data) => summarizeQuestion(data), {
    onSuccess: (data) => {
      setSummary(data);
      setShowModal(true);
      message.success("Summary has been updated");
    },
    onError: (error) => {
      message.error(error.message);
    },
    onSettled: () => {
      setShowModal(false);
    },
  });

  const handleSummarize = () => {
    mutate({ id: ticketId });
  };

  return (
    <>
      <Button loading={isLoading} onClick={handleSummarize}>
        Summarize
      </Button>
      <ModalSummarize
        showModal={showModal}
        setShowModal={setShowModal}
        summary={summary}
        setSummary={setSummary}
      />
    </>
  );
};

export default TicketSummarize;
