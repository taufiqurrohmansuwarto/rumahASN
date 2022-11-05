import RichTextEditor from "./RichTextEditor";

function MantineRTE({ height = 300, ...others }) {
  return (
    <RichTextEditor
      id="rte"
      controls={[
        ["bold", "italic", "underline", "link", "image"],
        ["unorderedList", "h1", "h2", "h3"],
        ["alignLeft", "alignCenter", "alignRight"],
      ]}
      style={{ height }}
    />
  );
}

export default MantineRTE;
