import { OpenAIFilled } from "@ant-design/icons";

const suggestions = [
  {
    label: "Write a report",
    value: "report",
  },
  {
    label: "Draw a picture",
    value: "draw",
  },
  {
    label: "Check some knowledge",
    value: "knowledge",
    icon: <OpenAIFilled />,
    children: [
      {
        label: "About React",
        value: "react",
      },
      {
        label: "About Ant Design",
        value: "antd",
      },
    ],
  },
];

export default suggestions;
