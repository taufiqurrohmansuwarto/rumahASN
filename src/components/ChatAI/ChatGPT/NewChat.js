import { Form, Input } from "antd";

function NewChat() {
  const [form] = Form.useForm();

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (e.ctrlKey) {
        insertNewLine(e.target);
      } else {
        form.submit();
      }
    }
  };

  const insertNewLine = (target) => {
    const { selectionStart, selectionEnd, value } = target;
    const newValue =
      value.substring(0, selectionStart) + "\n" + value.substring(selectionEnd);

    form.setFieldValue("message", newValue);

    // Update cursor position after form value change
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = selectionStart + 1;
    }, 0);
  };

  return (
    <Form form={form} style={{ width: "100%" }}>
      <Form.Item name="message" style={{ width: "100%" }}>
        <Input.TextArea
          autoSize={{ minRows: 1, maxRows: 6 }}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send, Ctrl+Enter for new line)"
          style={{ width: "100%" }}
        />
      </Form.Item>
    </Form>
  );
}

export default NewChat;
