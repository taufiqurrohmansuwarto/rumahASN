import Layout from "@/components/Layout";
import { detailPolling, updatePolling } from "@/services/polls.services";
import { useQuery } from "@tanstack/react-query";
import { Skeleton, Form, Input, DatePicker, Space, Button } from "antd";
import moment from "moment";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";

import { useRouter } from "next/router";
import React from "react";
import PageContainer from "@/components/PageContainer";

const FormUpdate = ({ data, id }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [answers, setAnswers] = useState([]);

  const gotoVotes = () => router.push(`/apps-managements/votes`);

  const { mutate, isLoading } = useMutation((data) => updatePolling(data), {
    onSuccess: (data) => {
      gotoVotes();
      message.success("Berhasil mengubah voting!");
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
      start_date: moment(start_date).format("YYYY-MM-DD HH:mm:ss"),
      end_date: moment(end_date).format("YYYY-MM-DD HH:mm:ss"),
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

  return (
    <>
      <PageContainer onBack={handleBack}>
        <Skeleton loading={isLoading}>
          <FormUpdate
            id={id}
            data={{
              ...data,
              date: [moment(data?.start_date), moment(data?.end_date)],
            }}
          />
        </Skeleton>
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
