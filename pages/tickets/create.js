import { SendOutlined } from "@ant-design/icons";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Radio,
  Select,
  Skeleton,
} from "antd";
import { useRouter } from "next/router";
import { getCategories, getPriorities, getStatus } from "../../services";
import { createTickets } from "../../services/users.services";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";

const CreateTicket = () => {
  const [form] = Form.useForm();
  const router = useRouter();

  const { mutate: create } = useMutation((data) => createTickets(data), {
    onSuccess: () => {
      message.success("Berhasil membuat tiket");
      router.push("/tickets");
    },
    onError: () => {
      message.error("Gagal membuat tiket");
    },
  });

  const { data: dataCategories, isLoading: isLoadingCategories } = useQuery(
    ["categories"],
    () => getCategories(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: dataStatus, isLoading: isLoadingStatus } = useQuery(
    ["status"],
    () => getStatus(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: dataPriorities, isLoading: isLoadingPriorities } = useQuery(
    ["priorities"],
    () => getPriorities(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const handleFinish = (value) => {
    create(value);
  };
  return (
    <PageContainer
      onBack={() => router.push("/tickets")}
      title="Create ticket"
      subTitle="Tiket"
    >
      <Card title="Buat Ticket">
        <Skeleton
          loading={
            isLoadingCategories || isLoadingStatus || isLoadingPriorities
          }
        >
          <Form onFinish={handleFinish} form={form} layout="vertical">
            <Form.Item name="title" label="Title">
              <Input />
            </Form.Item>
            <Form.Item name="content" label="Content">
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="category_id" label="Kategori">
              <Select showSearch optionFilterProp="name">
                {dataCategories?.map((category) => (
                  <Select.Option
                    key={category.id}
                    name={category?.name}
                    value={category.id}
                  >
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item name="priority_id" label="Prioritas">
              <Radio.Group>
                {dataPriorities?.map((priority) => (
                  <Radio.Button
                    key={priority.id}
                    name={priority?.name}
                    value={priority.id}
                  >
                    {priority.name}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" icon={<SendOutlined />}>
                Kirim
              </Button>
            </Form.Item>
          </Form>
        </Skeleton>
      </Card>
    </PageContainer>
  );
};

CreateTicket.getLayout = function getLayout(page) {
  return <Layout active="/tickets">{page}</Layout>;
};

CreateTicket.Auth = {
  action: "create",
  subject: "Tickets",
};

export default CreateTicket;
