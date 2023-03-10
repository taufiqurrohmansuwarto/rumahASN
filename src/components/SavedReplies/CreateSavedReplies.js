import { createSavedReplies } from "@/services/agents.services";
import { MarkdownEditor } from "@primer/react/drafts";
import { useMutation } from "@tanstack/react-query";
import React from "react";

function CreateSavedReplies() {
  const [value, setValue] = React.useState("");
  const { mutate: create, isLoading: isLoadingCreate } = useMutation(
    (data) => createSavedReplies(data),
    {}
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    create({ value });
  };

  return (
    <MarkdownEditor value={value} onChange={setValue}>
      <MarkdownEditor.Label>Hello world</MarkdownEditor.Label>
      <MarkdownEditor.Actions>
        <MarkdownEditor.ActionButton variant="danger">
          Cancel
        </MarkdownEditor.ActionButton>
        <MarkdownEditor.ActionButton onClick={handleSubmit} variant="primary">
          Submit
        </MarkdownEditor.ActionButton>
      </MarkdownEditor.Actions>
    </MarkdownEditor>
  );
}

export default CreateSavedReplies;
