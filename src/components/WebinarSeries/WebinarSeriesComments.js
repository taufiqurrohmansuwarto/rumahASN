import { formatDateFromNow } from "@/utils/client-utils";
import {
  Alert,
  Button,
  Card,
  Comment,
  Form,
  Input,
  Popconfirm,
  Space,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useState } from "react";

const Editor = ({
  onChange,
  onSubmit,
  submitting,
  value,
  withCancel = false,
  onCancel,
}) => (
  <>
    <Form.Item>
      <Input.TextArea value={value} onChange={onChange} rows={4} />
    </Form.Item>
    <Form.Item>
      <Space>
        <Button
          htmlType="submit"
          loading={submitting}
          onClick={onSubmit}
          type="primary"
        >
          {withCancel ? "Edit" : "Submit"}
        </Button>
        {withCancel && <Button onClick={onCancel}>Batal</Button>}
      </Space>
    </Form.Item>
  </>
);

const Comments = ({
  data,
  update,
  hapus,
  isLoadingUpdate,
  isLoadingHapus,
  userId,
  id,
  userImage,
}) => {
  const [currentId, setCurrentId] = useState(null);
  const [text, setText] = useState(null);

  const handleChangeText = (e) => {
    setText(e.target.value);
  };

  const handleSubmitUpdate = async () => {
    const data = {
      id,
      commentId: currentId,
      data: {
        comment: text,
      },
    };

    await update(data);
    setCurrentId(null);
    setText(null);
  };

  const changeCurrentId = (item) => {
    setCurrentId(item?.id);
    setText(item?.comment);
  };

  const handleCancelEdit = () => {
    setCurrentId(null);
    setText(null);
  };

  const handleHapus = async (item) => {
    const data = {
      id,
      commentId: item?.id,
    };

    await hapus(data);
  };

  return (
    <>
      {data?.map((item) => (
        <div key={item?.id}>
          {item?.id === currentId ? (
            <Comment
              avatar={userImage}
              content={
                <Editor
                  value={text}
                  onSubmit={handleSubmitUpdate}
                  submitting={isLoadingUpdate}
                  onChange={handleChangeText}
                  withCancel
                  onCancel={handleCancelEdit}
                />
              }
            />
          ) : (
            <Comment
              actions={[
                <span key="balas">
                  <a>Balas</a>
                </span>,
                <span key="edit">
                  {item?.participant?.custom_id === userId && (
                    <a
                      onClick={() => {
                        changeCurrentId(item);
                      }}
                    >
                      Edit
                    </a>
                  )}
                </span>,
                <span key="hapus">
                  {item?.participant?.custom_id === userId && (
                    <Popconfirm
                      onConfirm={async () => await handleHapus(item)}
                      title="Apakah anda yakin akan menghapus komentar?"
                    >
                      <a>Hapus</a>
                    </Popconfirm>
                  )}
                </span>,
              ]}
              key={item?.id}
              author={item?.participant?.username}
              avatar={item?.participant?.image}
              content={<p>{item?.comment}</p>}
              datetime={formatDateFromNow(item?.created_at)}
            />
          )}
        </div>
      ))}
    </>
  );
};

function WebinarSeriesComments({
  data,
  create,
  isLoadingCreate,
  update,
  isLoadingUpate,
  hapus,
  isLoadingHapus,
}) {
  const router = useRouter();
  const { id } = router?.query;

  const {
    data: { user },
    status,
  } = useSession();

  const [value, setValue] = useState();

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = async () => {
    try {
      if (!value) {
        return;
      } else {
        const data = {
          id,
          data: {
            comment: value,
          },
        };
        await create(data);
        setValue("");
      }
    } catch (error) {}
  };

  return (
    <Card>
      <Alert
        type="info"
        description="Yow, Sobat Rumah ASN! Kalo mau komentar, yuk pake bahasa yang kece tapi tetep sopan ya. Jangan sampe kena 'card' dari admin nih! 😉👌"
      />
      <Comment
        avatar={user?.image}
        content={
          <Editor
            onSubmit={handleSubmit}
            submitting={isLoadingCreate}
            onChange={handleChange}
            value={value}
          />
        }
      />
      <Comments
        update={update}
        isLoadingUpdate={isLoadingUpate}
        hapus={hapus}
        isLoadingHapus={isLoadingHapus}
        data={data}
        userId={user?.id}
        userImage={user?.image}
        id={id}
      />
    </Card>
  );
}

export default WebinarSeriesComments;
