import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Comment,
  Form,
  List,
  message,
  Popconfirm,
  Skeleton,
  Space,
} from "antd";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { uploadImage } from "../../services";
import {
  createMessagesCustomers,
  deleteMessagesCustomers,
  messagesCustomers,
  updateMessagesCustomers,
} from "../../services/agents.services";
import { fromNow, resizeImageTag } from "../../utils";
import RichTextEditor from "./RichTextEditor";

const CreateComments = ({ user, ticketId }) => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const handleImageUpload = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);

        uploadImage(formData)
          .then((res) => resolve(res.data))
          .catch(() => reject(new Error("Upload failed")));
      }),
    []
  );

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
        queryClient.invalidateQueries([
          "messages-agents-to-customers",
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
          comment: resizeImageTag(values.comment),
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
            <RichTextEditor
              style={{ minHeight: 300 }}
              onImageUpload={handleImageUpload}
            />
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

const CommentsList = ({ data, currentUserId, ticketId, status }) => {
  const queryClient = useQueryClient();

  const [form] = Form.useForm();
  const [selected, setSelected] = useState(null);

  const handleImageUpload = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);

        uploadImage(formData)
          .then((res) => resolve(res.data))
          .catch(() => reject(new Error("Upload failed")));
      }),
    []
  );

  useEffect(() => {}, [form]);

  const changeSelected = (id, comment) => {
    setSelected(id);
    form.setFieldsValue({
      comment: resizeImageTag(comment),
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

  const ActionsUser = ({ item, status }) => {
    if (status === "SELESAI") return null;

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
              : [<ActionsUser status={status} key="test" item={item} />]
          }
          content={
            data?.status_code === "SELESAI" ? null : (
              <>
                {selected === item?.id ? (
                  <Form form={form} onFinish={handleUpdate}>
                    <Form.Item name="comment">
                      <RichTextEditor
                        style={{ minHeight: 300 }}
                        onImageUpload={handleImageUpload}
                      />
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
                  <div dangerouslySetInnerHTML={{ __html: item?.comment }} />
                )}
              </>
            )
          }
          author={item?.user?.username}
          datetime={fromNow(item?.created_at)}
          avatar={item?.user?.image}
        />
      )}
    />
  );
};

function ChatsAgentToCustomer({ id, detailticket }) {
  const { data: userData, status } = useSession();
  const { data, isLoading } = useQuery(
    ["messages-agents-to-customers", id],
    () => messagesCustomers(id),
    {
      refetchInterval: 1000,
    }
  );

  return (
    <Skeleton loading={isLoading || status === "loading"}>
      <Card title="Chat">
        {detailticket?.status_code !== "SELESAI" && (
          <CreateComments
            status={detailticket?.status_code}
            ticketId={id}
            user={userData?.user}
          />
        )}
        <CommentsList
          data={data}
          status={detailticket?.status_code}
          currentUserId={userData?.user?.id}
          ticketId={id}
        />
      </Card>
    </Skeleton>
  );
}

export default ChatsAgentToCustomer;
