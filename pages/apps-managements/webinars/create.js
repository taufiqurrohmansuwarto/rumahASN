import PageContainer from "@/components/PageContainer";
import { adminCreateZoomMeeting } from "@/services/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Form, Input, InputNumber, Row } from "antd";
import Head from "next/head";
import { useRouter } from "next/router";

const { default: Layout } = require("@/components/Layout");

const AdminCreateWebinar = () => {
  const router = useRouter();

  const { mutate: createMeeting, isLoading: isLoadingCreateMeeting } =
    useMutation((data) => adminCreateZoomMeeting(data), {
      onSuccess: () => {
        router.push("/apps-managements/webinars");
      },
      oneError: () => {},
    });

  const [form] = Form.useForm();

  const createWebinar = async () => {
    const data = await form.validateFields();
    createMeeting(data);
  };

  return (
    <>
      <Head>
        <title>Rumah ASN - Buat Webinar</title>
      </Head>
      <PageContainer title="Webinar" subTitle="Buat Webinar">
        <Row>
          <Col md={18}>
            <Card>
              <Form
                form={form}
                initialValues={{
                  duration: 60,
                }}
                onFinish={createWebinar}
                layout="vertical"
              >
                {/* create meeting from zoom api */}
                <Form.Item name="topic" label="Topic">
                  <Input />
                </Form.Item>
                <Form.Item name="agenda" label="Agenda">
                  <Input.TextArea placeholder="Agenda" />
                </Form.Item>
                <Form.Item
                  name="duration"
                  help="Durasi Dalam Jam"
                  label="Durasi"
                >
                  <InputNumber placeholder="Duration" />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    disabled={isLoadingCreateMeeting}
                    loading={isLoadingCreateMeeting}
                    htmlType="submit"
                  >
                    Buat
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </>
  );
};

AdminCreateWebinar.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

AdminCreateWebinar.Auth = {
  action: "manage",
  subject: "DashboardAdmin",
};

export default AdminCreateWebinar;
