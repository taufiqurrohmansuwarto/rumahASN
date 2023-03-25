import { MarkdownEditor } from "@primer/react/drafts";

import React from "react";

function UserMarkdown({ value, setValue }) {
  return <MarkdownEditor value={value} onChange={setValue}></MarkdownEditor>;
}

export default UserMarkdown;
