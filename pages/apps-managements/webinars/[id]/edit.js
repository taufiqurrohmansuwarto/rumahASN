import { Button, Form } from "antd";
import { useRouter } from "next/router";

const { default: Layout } = require("@/components/Layout");

const AdminCreateWebinar = () => {
  const router = useRouter();

  const [form] = Form.useForm();

  const createWebinar = async () => {
    const data = await form.validateFields();
  };

  return (
    <div>
      <Form form={form}></Form>
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
