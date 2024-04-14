import {
  certificateDetailWebinar,
  signCertificateByWebinarId,
} from "@/services/esign-signer.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, Modal, Table, message } from "antd";
import { useRouter } from "next/router";
import { useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.locale("id");
dayjs.extend(relativeTime);

const FormTandaTangan = ({ open, id, onCancel, sign, loading }) => {
  const [form] = Form.useForm();

  const handleFinish = async () => {
    try {
      const result = await form.validateFields();
      const payload = {
        id,
        data: result,
      };

      await sign(payload);
    } catch (error) {
      console.log(error);
    } finally {
      form.resetFields();
    }
  };

  return (
    <Modal
      destroyOnClose
      onOk={handleFinish}
      confirmLoading={loading}
      centered
      title="Form Tanda Tangan Elektronik"
      open={open}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          rules={[
            {
              required: true,
              message: "Masukkan passphrase anda!",
            },
          ]}
          name="passphrase"
          help="Masukkan Passphrase anda!"
          label="Passphrase"
        >
          <Input.Password autoComplete="off" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

function DetailWebinarCertificates() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const handleOpen = () => setOpen(true);
  const handleCancel = () => setOpen(false);

  const { mutateAsync: sign, isLoading: isLoadingSign } = useMutation(
    (data) => signCertificateByWebinarId(data),
    {
      onSuccess: () => {
        message.success("Berhasil menandatangani sertifikat");
        queryClient.invalidateQueries(["webinars-certificates"]);
        handleCancel();
      },
      onError: (error) => {
        const errorMessage =
          error?.response?.data?.message || "Gagal menandatangani";
        message.error(errorMessage);
      },
    }
  );

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuery(
    ["webinars-certificates", query],
    () =>
      certificateDetailWebinar({
        id: router.query.id,
        query,
      }),
    {
      keepPreviousData: true,
      enabled: !!query,
    }
  );

  const columns = [
    {
      title: "Nama",
      key: "nama",
      render: (text) => text?.user_information?.name,
    },
    {
      title: "Jabatan",
      key: "jabatan",
      render: (text) => text?.user_information?.jabatan,
    },
    {
      title: "Instansi",
      key: "instansi",
      render: (text) => text?.user_information?.instansi,
    },
    {
      title: "Di Tanda Tangani",
      key: "di_tanda_tangani",
      render: (text) => (
        <>
          {text?.document_sign_at
            ? dayjs(text?.document_sign_at).format("DD MMMM YYYY HH:mm:ss")
            : "Belum di tanda tangani"}
        </>
      ),
    },
  ];

  return (
    <>
      <FormTandaTangan
        sign={sign}
        id={router.query.id}
        loading={isLoadingSign}
        open={open}
        onCancel={handleCancel}
      />
      <Table
        title={() => (
          <>
            {data?.total_generate > 0 && (
              <Button onClick={handleOpen}>Tanda Tangan</Button>
            )}
          </>
        )}
        columns={columns}
        loading={isLoading}
        rowKey={(row) => row?.id}
        dataSource={data?.data}
        pagination={{
          pageSize: query?.limit,
          showTotal: (total) => `Total ${total} item`,
          total: data?.total,
          current: query?.page,
          onChange: (page) => {
            setQuery({ ...query, page });
          },
        }}
      />
    </>
  );
}

export default DetailWebinarCertificates;
