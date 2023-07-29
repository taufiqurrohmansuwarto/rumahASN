import { MarkdownViewer } from "@primer/react/drafts";

function DetailLayanan({ data }) {
  return (
    <MarkdownViewer
      dangerousRenderedHTML={{
        __html: data?.content,
      }}
    />
  );
}

export default DetailLayanan;
