import { adminCreateZoomMeeting } from "@/services/index";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form, Input, InputNumber } from "antd";
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
    <div>
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
        <Form.Item name="duration" help="Durasi Dalam Jam" label="Durasi">
          <InputNumber placeholder="Duration" />
        </Form.Item>
        <Form.Item>
          <Button
            disabled={isLoadingCreateMeeting}
            loading={isLoadingCreateMeeting}
            htmlType="submit"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
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
