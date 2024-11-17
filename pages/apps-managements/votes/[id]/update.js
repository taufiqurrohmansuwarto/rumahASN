import Layout from "@/components/Layout";
import { detailPolling, updatePolling } from "@/services/polls.services";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Breadcrumb,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Skeleton,
  Space,
  message,
} from "antd";
import { useEffect, useState } from "react";

import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";

import PageContainer from "@/components/PageContainer";
import Link from "next/link";
import { useRouter } from "next/router";

import dayjs from "dayjs";
import "dayjs/locale/id";
dayjs.locale("id");

const FormUpdate = ({ data, id }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [answers, setAnswers] = useState([]);

  const queryClient = useQueryClient();

  useEffect(() => {
    form.setFieldsValue({
      ...data,
      date: [dayjs(data?.start_date), dayjs(data?.end_date)],
    });
  }, [data, form]);

  const gotoVotes = () => router.push(`/apps-managements/votes`);

  const { mutate, isLoading } = useMutation((data) => updatePolling(data), {
    onSuccess: (data) => {
      gotoVotes();
      message.success("Berhasil mengubah voting!");
      queryClient.invalidateQueries("votes-admins", id);
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const onFinish = (values) => {
    const { date, ...rest } = values;

    const [start_date, end_date] = date;

    const data = {
      ...rest,
      start_date: dayjs(start_date).format("YYYY-MM-DD HH:mm:ss"),
      end_date: dayjs(end_date).format("YYYY-MM-DD HH:mm:ss"),
    };

    mutate({
      id,
      data,
    });
  };

  const addAnswer = () => {
    setAnswers([...answers, ""]);
  };

  const removeAnswer = (index) => {
    const newAnswers = [...answers];
    newAnswers.splice(index, 1);
    setAnswers(newAnswers);
  };

  return (
    <Form
      initialValues={data}
      form={form}
      layout="vertical"
      name="dynamic_form_nest_item"
      onFinish={onFinish}
      autoComplete="off"
    >
      <Form.Item
        name="question"
        label="Pertanyaan"
        rules={[
          {
            required: true,
            message: "Harap isi pertanyaan!",
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item name="date" label="Waktu Voting">
        <DatePicker.RangePicker showTime />
      </Form.Item>

      <Form.List name="answers">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, fieldKey, ...restField }) => (
              <Space
                key={key}
                size="large"
                style={{ display: "flex", marginBottom: 8 }}
                align="center"
              >
                <Form.Item
                  label={`Jawaban ${key + 1}`}
                  {...restField}
                  name={[name, "answer"]}
                  fieldKey={[fieldKey, "answer"]}
                  rules={[
                    {
                      required: true,
                      message: "Harap isi jawaban!",
                    },
                  ]}
                >
                  <Input placeholder="Jawaban" />
                </Form.Item>
                <MinusCircleOutlined
                  onClick={() => {
                    remove(name);
                    removeAnswer(name);
                  }}
                />
              </Space>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  add();
                  addAnswer();
                }}
                icon={<PlusOutlined />}
              >
                Tambah Jawaban
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>

      <Form.Item>
        <Button
          loading={isLoading}
          disabled={isLoading}
          type="primary"
          htmlType="submit"
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

function VoteUpdate() {
  const router = useRouter();

  const handleBack = () => router?.back();

  const { id } = router.query;

  const { data, isLoading } = useQuery(
    ["votes-admins", id],
    () => detailPolling(id),
    {}
  );

  useEffect(() => {}, [data]);

  return (
    <>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">Beranda</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/votes">Polling</Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Edit Polling</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Edit Polling"
        onBack={handleBack}
      >
        <Card>
          <Skeleton loading={isLoading}>
            <FormUpdate
              id={id}
              data={{
                ...data,
                date: [dayjs(data?.start_date), dayjs(data?.end_date)],
              }}
            />
          </Skeleton>
        </Card>
      </PageContainer>
    </>
  );
}

VoteUpdate.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

VoteUpdate.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default VoteUpdate;
