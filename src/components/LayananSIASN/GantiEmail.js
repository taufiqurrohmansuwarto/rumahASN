import { MailOutlined, SyncOutlined } from "@ant-design/icons";
import { Alert, Stack } from "@mantine/core";
import { Form, Input, Modal, Skeleton, Tag, message } from "antd";
import { useState } from "react";
import { InfoCircleOutlined } from "@ant-design/icons";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  dataUtamaSIASN,
  updateDataUtamaSIASN,
} from "@/services/siasn-services";

const GantiEmailModal = ({ open, onCancel, onOk }) => {
  const [form] = Form.useForm();

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery(
    ["data-utama-siasn"],
    () => dataUtamaSIASN(),
    {
      onSuccess: (data) => {
        if (data?.email) {
          form.setFieldsValue({
            email: data?.email,
          });
        }
      },
    }
  );

  const { mutate: update, isLoading: isUpdating } = useMutation(
    (data) => updateDataUtamaSIASN(data),
    {
      onError: (error) => {
        message.error(error?.message);
      },
      onSuccess: () => {
        message.success("Berhasil mengubah email");
        queryClient.invalidateQueries(["data-utama-siasn"]);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["data-utama-siasn"]);
        onCancel();
      },
    }
  );

  const handleSubmit = async () => {
    try {
      const value = await form.validateFields();
      update({
        email: value?.email,
      });
    } catch (error) {
      message.error(error?.message);
    }
  };

  return (
    <Modal
      width={600}
      title="Ganti Email SIASN"
      open={open}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={isUpdating}
    >
      <Skeleton active paragraph={{ rows: 10 }} loading={isLoading}>
        <Stack>
          <Alert color="blue" icon={<InfoCircleOutlined />}>
            Pastikan email yang diganti adalah email aktif dan sering digunakan.
            <br />
            Email yang diganti membutuhkan waktu 2 jam untuk sinkronisasi data.
          </Alert>
          <Form layout="vertical" form={form}>
            <Form.Item
              rules={[
                {
                  required: true,
                  message: "Email SIASN harus diisi",
                },
                {
                  type: "email",
                  message: "Email SIASN harus valid",
                },
              ]}
              label="Email SIASN"
              name="email"
            >
              <Input autoComplete="off" />
            </Form.Item>
          </Form>
        </Stack>
      </Skeleton>
    </Modal>
  );
};

function GantiEmail() {
  const [showModal, setShowModal] = useState(false);
  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  return (
    <>
      <GantiEmailModal
        open={showModal}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
      />
      <Tag
        style={{ cursor: "pointer" }}
        onClick={handleShowModal}
        icon={<SyncOutlined />}
      >
        Ganti Email SIASN
      </Tag>
    </>
  );
}

export default GantiEmail;
