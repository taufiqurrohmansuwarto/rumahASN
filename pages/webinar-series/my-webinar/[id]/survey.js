import Layout from "@/components/Layout";
import PageContainer from "@/components/PageContainer";
import { readAllSurveyUser, submitSurveys } from "@/services/webinar.services";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, Radio, Row, message } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const FormKuisionerWebinar = ({ data }) => {
  const router = useRouter();

  const { mutate: postSurvey, loading: loadingPostSurvey } = useMutation(
    (data) => submitSurveys(data),
    {
      onSuccess: () => {
        message.success("Berhasil mengirimkan survey");
        router.push(`/webinar-series/my-webinar/${router?.query?.id}/detail`);
      },
      onError: () => {
        message.error("Gagal mengirimkan survey");
      },
    }
  );

  const [form] = Form.useForm();
  const handleFinish = async () => {
    const values = await form.validateFields();
    const id = router?.query?.id;
    const data = Object.keys(values).map((key) => {
      const [id, type] = key.split("|");
      const column = type === "scale" ? "value" : "comment";
      const value = type === "scale" ? parseInt(values[key]) : values[key];

      return {
        id,
        type: type,
        [column]: value,
      };
    });

    const payload = {
      id,
      data,
    };

    postSurvey(payload);
  };

  return (
    <Form form={form} layout="vertical" onFinish={handleFinish}>
      {data?.map((item) => (
        <div key={item?.id}>
          {item?.type === "scale" && (
            <Form.Item
              required
              rules={[
                {
                  required: true,
                  message: "Mohon isi jawaban",
                },
              ]}
              label={item?.question}
              key={item?.id}
              name={`${item?.id}|${item?.type}`}
            >
              <Radio.Group>
                <Radio value="1">Sangat Tidak Puas</Radio>
                <Radio value="2">Tidak Puas</Radio>
                <Radio value="3">Cukup Puas</Radio>
                <Radio value="4">Puas</Radio>
                <Radio value="5">Sangat Puas</Radio>
              </Radio.Group>
            </Form.Item>
          )}
          {item?.type === "free_text" && (
            <Form.Item
              required
              rules={[
                {
                  required: true,
                  message: "Mohon isi jawaban",
                },
              ]}
              label={item?.question}
              key={item?.id}
              name={`${item?.id}|${item?.type}`}
            >
              <Input.TextArea />
            </Form.Item>
          )}
        </div>
      ))}
      <Form.Item>
        <Button
          loading={loadingPostSurvey}
          disabled={loadingPostSurvey}
          htmlType="submit"
        >
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
};

const MyWebinarSurvey = () => {
  const router = useRouter();

  const { data, isLoading } = useQuery(
    ["webinar-surveys", router?.query?.id],
    () => readAllSurveyUser(router?.query?.id),
    {}
  );

  return (
    <>
      <Head>
        <title>Rumah ASN - Webinar Series - Survey</title>
      </Head>
      <PageContainer title="Webinar Series" content="Survey">
        <Card loading={isLoading} title="Kuisioner Webinar">
          <Row>
            <Col md={14} xs={24}>
              {data && <FormKuisionerWebinar data={data} />}
            </Col>
          </Row>
        </Card>
      </PageContainer>
    </>
  );
};

MyWebinarSurvey.Auth = {
  action: "manage",
  subject: "tickets",
};

MyWebinarSurvey.getLayout = (page) => {
  return <Layout active="/webinar-series/my-webinar">{page}</Layout>;
};

export default MyWebinarSurvey;
