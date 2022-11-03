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
  Skeleton,
  Space,
} from "antd";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  createCommentCustomers,
  getCommentCustomers,
  removeCommentCustomers,
  updateCommentCustomers,
} from "../../services/users.services";

const CreateComments = ({ user, ticketId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const { mutate: create, isLoading } = useMutation(
    (data) => createCommentCustomers(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries([
          "messages-customers-to-agents",
          ticketId,
        ]),
      onSuccess: () => {
        form.resetFields();
        queryClient.invalidateQueries([
          "messages-customers-to-agents",
          ticketId,
        ]);
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
    (data) => removeCommentCustomers(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries([
          "messages-customers-to-agents",
          ticketId,
        ]),
      onSuccess: () => {
        queryClient.invalidateQueries([
          "messages-customers-to-agents",
          ticketId,
        ]);
        message.success("Berhasil menghapus pesan");
      },
      onError: () => message.error("Gagal menghapus pesan"),
    }
  );

  const { mutate: update, isLoading: isLoadingUpdate } = useMutation(
    (data) => updateCommentCustomers(data),
    {
      onSettled: () =>
        queryClient.invalidateQueries([
          "messages-customers-to-agents",
          ticketId,
        ]),
      onSuccess: () => {
        queryClient.invalidateQueries([
          "messages-customers-to-agents",
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
            data?.status_code === "SELESAI" ? null : (
              <>
                {selected === item?.id ? (
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
                )}
              </>
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

function ChatAgentToCustomer({ id }) {
  const { data: userData, status } = useSession();
  const { data, isLoading } = useQuery(
    ["messages-customers-to-agents", id],
    () => getCommentCustomers(id),
    {
      refetchInterval: 1000,
    }
  );

  return (
    <Skeleton loading={isLoading || status === "loading"}>
      <Card title="Chat">
        <CreateComments ticketId={id} user={userData?.user} />
        <CommentsList
          data={data}
          currentUserId={userData?.user?.id}
          ticketId={id}
        />
      </Card>
    </Skeleton>
  );
}

export default ChatAgentToCustomer;
