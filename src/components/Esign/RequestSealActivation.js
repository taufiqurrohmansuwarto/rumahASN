import {
  getLastTotpConfirmation,
  getTotpConfirmation,
  saveTotpConfirmation,
} from "@/services/esign-admin.services";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Form, Input, Modal, Space, message } from "antd";
import { trim } from "lodash";
import { useState } from "react";

const TotpFormConfirmation = ({ open, onCancel, isLoadingSave, save }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    const data = await form.validateFields();

    const totp = trim(data?.totp);
    save({
      totp,
    });
  };

  return (
    <Modal
      confirmLoading={isLoadingSave}
      title="TOTP Confirmation"
      onOk={handleFinish}
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          required
          extra="6 Digit Angka berasal dari email"
          name="totp"
          rules={[{ required: true, message: "Tidak Boleh Kosong" }]}
          label="TOTP"
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

const RequestSealActivation = () => {
  // get last data totp seal activation

  const queryClient = useQueryClient();

  const [openModal, setOpenModal] = useState();
  const showModal = () => setOpenModal(true);
  const closeModal = () => setOpenModal(false);

  const { data: dataTotp, isLoading: isLoadingTotpActivation } = useQuery(
    ["sealed-activation"],
    () => getLastTotpConfirmation(),
    {}
  );

  const { mutate: save, isLoading: isLoadingSave } = useMutation(
    (data) => saveTotpConfirmation(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["sealed-activation"]);
        message.success("TOTP berhasil di entri");
        closeModal();
      },
    }
  );

  const { mutateAsync: requestTotpActivation, isLoading } = useMutation(
    () => getTotpConfirmation(),
    {
      onSuccess: (data) => {
        Modal.success({
          centered: true,
          title: "Request OTP berhasil",
          content: `
           ${data?.message}
            `,
        });
      },
    }
  );

  const handleRequestTotpActivation = () => {
    Modal.confirm({
      centered: true,
      title: "Request OTP",
      content:
        "Apakah anda yakin ingin melakukan request TOTP Seal Confirmation?. TOTP akan dikirimkan ke email anda.",
      onOk: async () => {
        await requestTotpActivation();
      },
    });
  };

  return (
    <>
      <Card>
        <Stack>
          <Space>
            <TotpFormConfirmation
              isLoadingSave={isLoadingSave}
              open={openModal}
              save={save}
              onCancel={closeModal}
            />
            <Button onClick={showModal}>Entri TOTP</Button>
            <Button
              loading={isLoading}
              disabled={isLoading}
              onClick={handleRequestTotpActivation}
              type="primary"
            >
              Request Activation
            </Button>
          </Space>
          {JSON.stringify(dataTotp)}
        </Stack>
      </Card>
    </>
  );
};

export default RequestSealActivation;
