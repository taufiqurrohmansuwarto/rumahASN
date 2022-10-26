import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { Input, Card, Comment, Form, Button, message } from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import {
  createMessagesAgents,
  messagesAgents,
} from "../../../../services/agents.services";
import AgentLayout from "../../../../src/components/AgentLayout";
import PageContainer from "../../../../src/components/PageContainer";

const CreateComments = ({ user, ticketId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: create, isLoading } = useMutation(
    (data) => createMessagesAgents(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries(["messages-agents-to-agents", ticketId]),
      onSuccess: () => {
        form.resetFields();
        message.success("Berhasil mengirim pesan");
      },
      onError: () => message.error("Gagal mengirim pesan"),
    }
  );

  const handleCreate = async (values) => {
    try {
      const data = { id: ticketId, message: values?.comment };
      create(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Comment
      author={user?.name}
      avatar={user?.image}
      content={
        <Form onFinish={handleCreate} form={form}>
          <Form.Item name="comment">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button
              loading={isLoading}
              htmlType="submit"
              type="primary"
              onClick={() => {}}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      }
    />
  );
};

const TicketsDetails = () => {
  const router = useRouter();
  const { data: dataUser, status } = useSession();

  const { data, isLoading } = useQuery(
    ["messages-agents-to-agents", router?.query?.id],
    () => messagesAgents(router?.query?.id)
  );

  return (
    <PageContainer
      title="Ticket"
      subTitle="Details"
      onBack={() => router.back()}
    >
      <Card loading={status === "loading" || status === "unauthenticated"}>
        <div>{JSON.stringify(data)}</div>
        <CreateComments user={dataUser?.user} ticketId={router?.query?.id} />
      </Card>
    </PageContainer>
  );
};

TicketsDetails.getLayout = (page) => {
  return <AgentLayout active="/agent/tickets">{page}</AgentLayout>;
};

TicketsDetails.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default TicketsDetails;
