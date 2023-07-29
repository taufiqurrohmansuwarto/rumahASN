import { slugLayananKepegawaian } from "@/services/index";
import { MarkdownViewer } from "@primer/react/lib-esm/drafts";
import { useQuery } from "@tanstack/react-query";

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
