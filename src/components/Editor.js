import dynamic from "next/dynamic";
import RichTextEditor from "react-rte";

const { useState } = require("react");

const RTE = dynamic(() => import("react-rte"), {
  ssr: false,
});

const Editor = ({ onChange }) => {
  const [value, setValue] = useState(RichTextEditor.createEmptyValue());

  const handleOnChange = (value) => {
    setValue(value);
    if (onChange) {
      onChange(value.toString("html"));
    }
  };

  return <RTE value={value} onChange={handleOnChange} />;
};

export default Editor;
