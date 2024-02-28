import {
  detailSubscriber,
  generateSealActivation,
  setSubscriberId,
  setTotpActivationCode,
} from "@/services/esign-seal.services";
import { KeyOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal, Space, Table, message, Form, Input } from "antd";
import { useState } from "react";

const FormSetSubscriberId = ({ open, onCancel, isLoading, set }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    try {
      const payload = await form.validateFields();
      set(payload);
    } catch (error) {
      message.error("Failed to set subscriber id");
    }
  };

  return (
    <Modal
      centered
      confirmLoading={isLoading}
      onOk={handleFinish}
      title="Set Subscriber ID"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form}>
        <Form.Item name="id_subscriber" label="Subscriber ID">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
const FormSetTotp = ({ open, onCancel, isLoading, set }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    try {
      const payload = await form.validateFields();
      set(payload);
    } catch (error) {
      message.error("Failed to set totp activation code");
    }
  };

  return (
    <Modal
      centered
      confirmLoading={isLoading}
      onOk={handleFinish}
      title="Set TOTP Activation"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form}>
        <Form.Item name="totp_activation_code" label="Kode TOTP">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function AdminSeal() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ["subscriber"],
    () => detailSubscriber(),
    {}
  );

  const [openModalSetSubscriberId, setOpenModalSetSubscriberId] = useState();

  const showModalSetSubscriberId = () => setOpenModalSetSubscriberId(true);
  const closeModalSetSubscriberId = () => setOpenModalSetSubscriberId(false);

  const [openModalSetTotp, setOpenModalSetTotp] = useState();

  const showModalSetTotp = () => setOpenModalSetTotp(true);
  const closeModalSetTotp = () => setOpenModalSetTotp(false);

  const { mutateAsync: generate, isLoading: isLoadingGenerate } = useMutation(
    (data) => generateSealActivation(data),
    {
      onSuccess: (result) => {
        message.success("Seal activation code has been generated");
        Modal.info({
          title: "Seal Activation Code",
          content: <div>{JSON.stringify(result)}</div>,
        });
      },
      onError: (err) => {
        const msg = err?.response?.data?.message;
        message.error(msg || "Failed to generate seal activation code");
      },
      onSettled: () => {
        queryClient.invalidateQueries("subscriber");
        closeModalSetTotp();
      },
    }
  );

  const { mutateAsync: setIdSubscriber, isLoading: isLoadingSetIdSubscriber } =
    useMutation((data) => setSubscriberId(data), {
      onSuccess: () => {
        message.success("Subscriber ID has been set");
      },
      onError: () => {
        message.error("Failed to set subscriber id");
      },
      onSettled: () => {
        closeModalSetSubscriberId();
        queryClient.invalidateQueries("subscriber");
      },
    });

  const { mutateAsync: setTotp, isLoading: isLoadingSetTotp } = useMutation(
    (data) => setTotpActivationCode(data),
    {
      onSuccess: () => {
        message.success("Totp activation code has been set");
      },
      onError: (error) => {
        message.error("Failed to set totp activation code");
      },
      onSettled: () => {
        queryClient.invalidateQueries("subscriber");
        closeModalSetTotp();
      },
    }
  );

  const handleGenerateOTPActivation = () => {
    Modal.confirm({
      title: "Generate Kode Aktivasi TOTP",
      content: "Apakah anda yakin ingin generate kode aktivasi TOTP?",
      centered: true,
      onOk: async () => {
        try {
          await generate();
        } catch (error) {
          message.error("Failed to generate seal activation code");
          console.error(error);
        }
      },
    });
  };

  const columns = [
    {
      title: "ID Subscriber",
      dataIndex: "id_subscriber",
      key: "id_subscriber",
    },
    {
      title: "Totp Activation Code",
      dataIndex: "totp_activation_code",
      key: "totp_activation_code",
    },
    {
      title: "Di update pada",
      dataIndex: "updated_at",
      key: "updated_at",
    },
  ];

  return (
    <>
      <Space
        style={{
          marginBottom: "1rem",
        }}
      >
        <Button
          onClick={handleGenerateOTPActivation}
          type="primary"
          icon={<KeyOutlined />}
        >
          Generate TOTP Aktivasi
        </Button>
        <Button onClick={showModalSetSubscriberId} type="primary">
          ID Subscriber
        </Button>
        <Button onClick={showModalSetTotp} type="primary">
          TOTP
        </Button>
      </Space>
      <FormSetSubscriberId
        open={openModalSetSubscriberId}
        onCancel={closeModalSetSubscriberId}
        isLoading={isLoadingSetIdSubscriber}
        set={setIdSubscriber}
      />
      <FormSetTotp
        isLoading={isLoadingSetTotp}
        set={setTotp}
        open={openModalSetTotp}
        onCancel={closeModalSetTotp}
      />
      <Table
        pagination={false}
        loading={isLoading}
        columns={columns}
        dataSource={data}
        rowKey={(row) => row?.id}
      />
    </>
  );
}

export default AdminSeal;
