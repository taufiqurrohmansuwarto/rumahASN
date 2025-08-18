import { Comment } from "@ant-design/compatible";
import { Avatar, Button, Form, Input } from "antd";

const { TextArea } = Input;

const FormComment = ({
  form,
  currentUser,
  onSubmit,
  placeholder = "Tulis komentar...",
  buttonText = "Kirim Komentar",
  loading = false,
}) => {
  return (
    <Comment
      avatar={<Avatar src={currentUser?.image} />}
      author={currentUser?.username}
      content={
        <Form form={form} onFinish={onSubmit}>
          <Form.Item
            name="content"
            rules={[
              { required: true, message: "Komentar tidak boleh kosong!" },
            ]}
          >
            <TextArea rows={4} placeholder={placeholder} disabled={loading} />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              style={{ backgroundColor: "#FF4500", borderColor: "#FF4500" }}
            >
              {buttonText}
            </Button>
          </Form.Item>
        </Form>
      }
    />
  );
};

export default FormComment;
