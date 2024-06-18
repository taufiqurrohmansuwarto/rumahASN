import { formatDateFromNow } from "@/utils/client-utils";
import { Comment } from "@ant-design/compatible";
import { Group } from "@mantine/core";
import {
  Button,
  Card,
  Col,
  FloatButton,
  Form,
  Grid,
  Input,
  Popconfirm,
  Row,
  Segmented,
  Space,
  Typography,
} from "antd";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import ReactPlayer from "../ReactPlayer";

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
          {withCancel ? "Edit Komentar" : "Tambah Komentar"}
        </Button>
        {withCancel && <Button onClick={onCancel}>Batal</Button>}
      </Space>
    </Form.Item>
  </>
);

const NestedComment = ({
  item,
  userImage,
  currentId,
  userId,
  changeCurrentId,
  handleHapus,
  handleChangeText,
  isLoadingUpdate,
  handleSubmitUpdate,
  handleCancelEdit,
  text,

  // reply
  replyingTo,
  handleReplySubmit,
  replyText,
  handleReplayText,
  handleReply,
  // end of reply
}) => {
  const isEditing = item?.id === currentId;

  const commentRef = useRef(null);

  useEffect(() => {
    if (item?.id === replyingTo && commentRef.current) {
      commentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [replyingTo, item?.id]);

  return (
    <div key={item?.id} ref={commentRef}>
      <Comment
        actions={[
          <span
            key="balas"
            onClick={() => {
              handleReply(item);
            }}
          >
            <a>Balas</a>
          </span>,
          <span key="edit">
            {item?.participant?.custom_id === userId && (
              <a onClick={() => changeCurrentId(item)}>Edit</a>
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
        author={item?.participant?.username}
        avatar={item?.participant?.image}
        content={
          isEditing ? (
            <Editor
              value={text}
              onSubmit={handleSubmitUpdate}
              submitting={isLoadingUpdate}
              onChange={handleChangeText}
              withCancel
              onCancel={handleCancelEdit}
            />
          ) : (
            <p>{item?.comment}</p>
          )
        }
        datetime={formatDateFromNow(item?.created_at)}
      >
        {item.children &&
          item.children.map((child) => (
            <NestedComment
              // reply
              replyingTo={replyingTo}
              handleReply={handleReply}
              handleReplySubmit={handleReplySubmit}
              replyText={replyText}
              handleReplayText={handleReplayText}
              // end of reply
              key={child.id}
              item={child}
              userImage={userImage}
              currentId={currentId}
              userId={userId}
              changeCurrentId={changeCurrentId}
              handleHapus={handleHapus}
              handleChangeText={handleChangeText}
              isLoadingUpdate={isLoadingUpdate}
              handleSubmitUpdate={handleSubmitUpdate}
              handleCancelEdit={handleCancelEdit}
              text={text}
            />
          ))}
      </Comment>
      {item?.id === replyingTo && (
        <Comment
          avatar={userImage}
          content={
            <Editor
              value={replyText}
              onSubmit={handleReplySubmit}
              onChange={handleReplayText}
            />
          }
        />
      )}
    </div>
  );
};

const Comments = ({
  data,
  update,
  hapus,
  isLoadingUpdate,
  isLoadingHapus,
  userId,
  id,
  userImage,
  create,
  isLoadingCreate,
}) => {
  const [currentId, setCurrentId] = useState(null);
  const [text, setText] = useState(null);

  // replying
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = async () => {
    // ... Submit the reply. This will likely involve adding a child to the current comment.
    // The exact mechanism depends on your backend and API.

    const data = {
      id,
      data: {
        comment: replyText,
        webinar_series_comment_id: replyingTo,
      },
    };

    await create(data);

    setReplyText(""); // Clear the input
    setReplyingTo(null); // Stop replying
  };

  const handleReplayText = (e) => {
    setReplyText(e.target.value);
  };

  const handleReply = (item) => {
    setReplyingTo(item?.id);
  };

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
        <NestedComment
          // reply
          replyingTo={replyingTo}
          handleReply={handleReply}
          handleReplySubmit={handleReplySubmit}
          replyText={replyText}
          handleReplayText={handleReplayText}
          // end of reply
          key={item?.id}
          item={item}
          userImage={userImage}
          currentId={currentId}
          userId={userId}
          changeCurrentId={changeCurrentId}
          handleCancelEdit={handleCancelEdit}
          handleChangeText={handleChangeText}
          isLoadingUpdate={isLoadingUpdate}
          handleSubmitUpdate={handleSubmitUpdate}
          handleHapus={handleHapus}
          text={text}
        />
      ))}
    </>
  );
};

function WebinarSeriesComments({
  youtubeUrl,
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
  const screens = Grid.useBreakpoint();

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
      <FloatButton.BackTop />
      <Row>
        <Col xs={24} md={14}>
          {youtubeUrl && (
            <ReactPlayer
              style={{
                marginBottom: 16,
              }}
              height={screens?.md ? 600 : 200}
              width="100%"
              url={youtubeUrl}
            />
          )}
          <Group position="apart">
            <Typography.Text strong>{data?.length} Komentar</Typography.Text>
            <Segmented
              default="Lama"
              options={["Lama", "Terbaru", "Teratas"]}
            />
          </Group>
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
            create={create}
            isLoadingCreate={isLoadingCreate}
            isLoadingUpdate={isLoadingUpate}
            hapus={hapus}
            isLoadingHapus={isLoadingHapus}
            data={data}
            userId={user?.id}
            userImage={user?.image}
            id={id}
          />
        </Col>
      </Row>
    </Card>
  );
}

export default WebinarSeriesComments;
