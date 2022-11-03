import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Comment,
  Form,
  Input,
  List,
  message,
  Popconfirm,
  Space,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  createMessagesCustomers,
  deleteMessagesCustomers,
  messagesCustomers,
  updateMessagesCustomers,
} from "../../../../services/agents.services";
import ActiveLayout from "../../../../src/components/ActiveLayout";
import AgentLayout from "../../../../src/components/AgentLayout";

const CreateComments = ({ user, ticketId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: create, isLoading } = useMutation(
    (data) => createMessagesCustomers(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries([
          "messages-agents-to-customers",
          ticketId,
        ]),
      onSuccess: () => {
        form.resetFields();
        message.success("Berhasil mengirim pesan");
      },
      onError: () => message.error("Gagal mengirim pesan"),
    }
  );

  const handleCreate = async (values) => {
    try {
      const data = {
        id: ticketId,
        data: {
          comment: values?.comment,
        },
      };
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

const CommentsList = ({ data, currentUserId, ticketId }) => {
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [selected, setSelected] = useState(null);

  useEffect(() => {}, [form]);

  const changeSelected = (id, comment) => {
    setSelected(id);
    form.setFieldsValue({
      comment: comment,
    });
  };

  const removeSelected = () => {
    setSelected(null);
    form.resetFields();
  };

  const { mutateAsync: hapus, isLoading: isLoadingHapus } = useMutation(
    (data) => deleteMessagesCustomers(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries([
          "messages-agents-to-customers",
          ticketId,
        ]),
      onSuccess: () => {
        queryClient.invalidateQueries([
          "messages-agents-to-customers",
          ticketId,
        ]);
        message.success("Berhasil menghapus pesan");
      },
      onError: () => message.error("Gagal menghapus pesan"),
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateMessagesCustomers(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries([
          "messages-agents-to-customers",
          ticketId,
        ]),
      onSuccess: () => {
        queryClient.invalidateQueries([
          "messages-agents-to-customers",
          ticketId,
        ]);
        message.success("Berhasil mengubah pesan");
        form.resetFields();
        setSelected(null);
      },
      onError: () => message.error("Gagal mengubah pesan"),
    }
  );

  const handleHapus = async (id) => {
    const data = {
      id,
      ticketId,
    };
    await hapus(data);
  };

  const handleUpdate = (values) => {
    const { comment } = values;
    const data = { ticketId, id: selected, data: { comment } };
    update(data);
  };

  const ActionsUser = ({ item }) => {
    if (item?.user_id === currentUserId) {
      return (
        <Space>
          <a onClick={() => changeSelected(item?.id, item?.comment)}>Edit</a>
          <Popconfirm
            title="Apakah anda yakin ingin menghapus?"
            onConfirm={async () => await handleHapus(item?.id)}
          >
            <a>Hapus</a>
          </Popconfirm>
        </Space>
      );
    } else {
      return null;
    }
  };

  return (
    <List
      dataSource={data}
      rowKey={(row) => row?.id}
      renderItem={(item) => (
        <Comment
          actions={
            selected === item?.id
              ? null
              : [<ActionsUser key="test" item={item} />]
          }
          content={
            selected === item?.id ? (
              <Form form={form} onFinish={handleUpdate}>
                <Form.Item name="comment">
                  <Input.TextArea rows={4} />
                </Form.Item>
                <Space>
                  <Form.Item>
                    <Button htmlType="submit" type="primary">
                      Edit
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button type="link" onClick={removeSelected}>
                      Cancel
                    </Button>
                  </Form.Item>
                </Space>
              </Form>
            ) : (
              item?.comment
            )
          }
          author={item?.user?.username}
          datetime={item?.created_at}
          avatar={item?.user?.image}
        />
      )}
    />
  );
};

const AgentsChatsCustomers = () => {
  const router = useRouter();
  const { data: dataUser, status } = useSession();

  const { data, isLoading } = useQuery(
    ["messages-agents-to-customers", router?.query?.id],
    () => messagesCustomers(router?.query?.id),
    {
      refetchInterval: 1000,
    }
  );

  return (
    <ActiveLayout id={router?.query?.id} role="agent" active="chats-customers">
      <Card
        title="Chats Customers"
        loading={
          status === "loading" || status === "unauthenticated" || isLoading
        }
      >
        <CreateComments user={dataUser?.user} ticketId={router?.query?.id} />
        <CommentsList
          ticketId={router?.query?.id}
          data={data}
          currentUserId={dataUser?.user?.id}
        />
      </Card>
    </ActiveLayout>
  );
};

AgentsChatsCustomers.getLayout = (page) => {
  return <AgentLayout active="/agent/tickets">{page}</AgentLayout>;
};

AgentsChatsCustomers.Auth = {
  action: "read",
  subject: "DashboardAgent",
};

export default AgentsChatsCustomers;
