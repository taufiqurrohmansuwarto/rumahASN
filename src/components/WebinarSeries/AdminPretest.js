import {
  createPretest,
  findPretest,
  removePretest,
  updatePretest,
} from "@/services/webinar.services";
import {
  serializeFormatTest,
  serializeFormatTestNormal,
} from "@/utils/client-utils";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { Stack } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Form,
  Input,
  List,
  Modal,
  Radio,
  Space,
  Typography,
  message,
} from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const QuestionDisplay = ({ id, webinarId, data, remove, isLoadingRemove }) => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleRemove = () => {
    Modal.confirm({
      title: "Hapus Pertanyaan",
      content: "Apakah Anda yakin ingin menghapus pertanyaan ini?",
      okText: "Hapus",
      okType: "danger",
      cancelText: "Batal",
      onOk: async () => {
        const payload = {
          id: webinarId,
          pretestId: id,
        };
        await remove(payload);
      },
    });
  };
  return (
    <>
      <Space>
        <Typography.Text strong>{data.question}</Typography.Text>
        <Button danger type="primary" onClick={handleRemove}>
          Hapus
        </Button>
        <Button onClick={handleOpen}>Update</Button>
      </Space>
      <List
        dataSource={data.answers}
        renderItem={(item) => (
          <List.Item>
            <Radio checked={false} disabled>
              {item.text}
              {item.isCorrect ? (
                <CheckCircleOutlined
                  style={{ color: "green", marginLeft: 8 }}
                />
              ) : (
                <CloseCircleOutlined style={{ color: "red", marginLeft: 8 }} />
              )}
            </Radio>
          </List.Item>
        )}
      />
    </>
  );
};

const AdminPretestModalUpdate = ({
  data,
  open,
  onCancel,
  create,
  confirmLoading,
  title,
  webinarId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    const result = serializeFormatTestNormal(data);
    form.setFieldValue(result);
  }, [form, data]);

  const onFinish = async () => {
    const values = await form.validateFields();
    const questions = serializeFormatTest(values);
    const payload = {
      id: webinarId,
      data: {
        questions,
      },
    };

    await create(payload);
    form.resetFields();
  };

  return (
    <Modal
      width={800}
      open={open}
      onCancel={onCancel}
      title={title}
      confirmLoading={confirmLoading}
      onOk={onFinish}
      centered
      bodyStyle={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
    >
      <Form layout="vertical" form={form} name="question_form">
        <Form.Item
          name="question"
          label="Pertanyaan"
          rules={[{ required: true, message: "Silakan masukkan pertanyaan!" }]}
        >
          <Input.TextArea placeholder="Masukkan pertanyaan Anda di sini" />
        </Form.Item>
        {Array.from({ length: 5 }, (_, index) => (
          <Form.Item
            key={index}
            name={`answer${index + 1}-${index + 1}`}
            label={`Jawaban ${index + 1}`}
            rules={[{ required: true, message: "Silakan masukkan jawaban!" }]}
          >
            <Input.TextArea placeholder={`Masukkan jawaban ${index + 1}`} />
          </Form.Item>
        ))}
        <Form.Item
          name="correctAnswer"
          label="Jawaban Benar"
          rules={[{ required: true, message: "Pilih jawaban yang benar!" }]}
        >
          <Radio.Group>
            {Array.from({ length: 5 }, (_, index) => (
              <Radio value={index + 1} key={index}>
                {index + 1}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const AdminPretestModal = ({
  open,
  onCancel,
  create,
  confirmLoading,
  title,
  webinarId,
}) => {
  const [form] = Form.useForm();

  const onFinish = async () => {
    const values = await form.validateFields();
    const questions = serializeFormatTest(values);
    const payload = {
      id: webinarId,
      data: {
        questions,
      },
    };

    await create(payload);
    form.resetFields();
  };

  return (
    <Modal
      width={800}
      open={open}
      onCancel={onCancel}
      title={title}
      confirmLoading={confirmLoading}
      onOk={onFinish}
      centered
      bodyStyle={{ overflowY: "auto", maxHeight: "calc(100vh - 200px)" }}
    >
      <Form layout="vertical" form={form} name="question_form">
        <Form.Item
          name="question"
          label="Pertanyaan"
          rules={[{ required: true, message: "Silakan masukkan pertanyaan!" }]}
        >
          <Input.TextArea placeholder="Masukkan pertanyaan Anda di sini" />
        </Form.Item>
        {Array.from({ length: 5 }, (_, index) => (
          <Form.Item
            key={index}
            name={`answer${index + 1}-${index + 1}`}
            label={`Jawaban ${index + 1}`}
            rules={[{ required: true, message: "Silakan masukkan jawaban!" }]}
          >
            <Input.TextArea placeholder={`Masukkan jawaban ${index + 1}`} />
          </Form.Item>
        ))}
        <Form.Item
          name="correctAnswer"
          label="Jawaban Benar"
          rules={[{ required: true, message: "Pilih jawaban yang benar!" }]}
        >
          <Radio.Group>
            {Array.from({ length: 5 }, (_, index) => (
              <Radio value={index + 1} key={index}>
                {index + 1}
              </Radio>
            ))}
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

const AdminPretest = () => {
  const router = useRouter();

  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const { data: pretests, isLoading: isLoadingPretests } = useQuery(
    ["webinar-pretest", router?.query?.id],
    () => findPretest(router?.query?.id),
    {}
  );

  const { mutateAsync: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createPretest(data),
    {
      onSuccess: () => {
        message.success("Berhasil menambahkan pertanyaan");
        setOpen(false);
      },
      onError: () => {
        message.error("Gagal menambahkan pertanyaan");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-pretest", router?.query?.id]);
      },
    }
  );

  const { mutateAsync: remove, isLoading: isLoadingRemove } = useMutation(
    (data) => removePretest(data),
    {
      onSuccess: () => {
        message.success("Berhasil menghapus pertanyaan");
        setOpen(false);
      },
      onError: () => {
        message.error("Gagal menghapus pertanyaan");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-pretest", router?.query?.id]);
      },
    }
  );

  const { mutateAsync: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updatePretest(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengupdate pertanyaan");
        setOpen(false);
      },
      onError: () => {
        message.error("Gagal mengupdate pertanyaan");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["webinar-pretest", router?.query?.id]);
      },
    }
  );

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <AdminPretestModal
        webinarId={router?.query?.id}
        open={open}
        onCancel={handleClose}
        create={create}
        confirmLoading={isLoadingCreate}
        title="Tambah Pertanyaan"
      />
      <Button onClick={handleOpen} type="primary">
        Tambah Pertanyaan
      </Button>
      <Stack mt={10}>
        {pretests?.map((item) => (
          <QuestionDisplay
            id={item?.id}
            webinarId={router?.query?.id}
            remove={remove}
            key={item?.id}
            data={item?.questions}
          />
        ))}
      </Stack>
    </>
  );
};

export default AdminPretest;
