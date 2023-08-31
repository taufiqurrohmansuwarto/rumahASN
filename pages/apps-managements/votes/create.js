import Layout from "@/components/Layout";
import {
  ConsoleSqlOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Space,
  message,
} from "antd";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createPolling } from "@/services/polls.services";
import moment from "moment";
import PageContainer from "@/components/PageContainer";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

const MyForm = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [answers, setAnswers] = useState([]);

  const { mutate, isLoading } = useMutation((data) => createPolling(data), {
    onSuccess: (data) => {
      message.success("Berhasil membuat voting baru!");
      router.push(`/apps-managements/votes`);
    },
    onError: (error) => {
      message.error("Gagal membuat voting baru!");
    },
  });

  const onFinish = (values) => {
    const { date, ...rest } = values;

    const [start_date, end_date] = date;

    const data = {
      ...rest,
      start_date: moment(start_date).format("YYYY-MM-DD HH:mm:ss"),
      end_date: moment(end_date).format("YYYY-MM-DD HH:mm:ss"),
    };

    mutate(data);
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

      <Form.List
        name="answers"
        initialValue={[""]} // Inisialisasi dengan satu jawaban kosong
      >
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
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

function CreateVote() {
  const router = useRouter();

  const handleBack = () => router?.back();

  return (
    <>
      <Head>
        <title>Polling Baru</title>
      </Head>
      <PageContainer
        header={{
          breadcrumbRender: () => (
            <Breadcrumb>
              <Breadcrumb.Item>
                <Link href="/feeds">
                  <a>Beranda</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                <Link href="/apps-managements/votes">
                  <a>Polling</a>
                </Link>
              </Breadcrumb.Item>
              <Breadcrumb.Item>Buat Polling Baru</Breadcrumb.Item>
            </Breadcrumb>
          ),
        }}
        title="Polling Baru"
        onBack={handleBack}
      >
        <Card>
          <Row>
            <Col md={20}>
              <MyForm />
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </>
  );
}

CreateVote.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

CreateVote.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default CreateVote;
