import { Button, Form } from "antd";
import { useCallback } from "react";

const { default: RichTextEditor } = require("./RichTextEditor");

// add image height and width from image tag and scale to 0.3
const trans = (text) => {
  return text.replace(/<img/g, '<img style="width: 30%; height: 30%"');
};

const TextEditor = () => {
  const handleImageUpload = useCallback(
    (file) =>
      new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);
      }),
    []
  );

  const handleFinish = (value) => {
    const { test } = value;
    console.log(trans(test));
  };
  return (
    <Form onFinish={handleFinish}>
      <Form.Item name="test">
        <RichTextEditor />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit">Submit</Button>
      </Form.Item>
    </Form>
  );
};

export default TextEditor;
