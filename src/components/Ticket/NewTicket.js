import { MarkdownEditor } from "@primer/react/drafts";

const NewTicket = () => {
    return (
        <MarkdownEditor
          onRenderPreview={renderMarkdown}
          onUploadFile={uploadFile}
          emojiSuggestions={emojis}
          referenceSuggestions={references}
          mentionSuggestions={mentionables}
          savedReplies={savedReplies}
          value={value}
          onChange={setValue}
        >
          <MarkdownEditor.Label>Penggunaan</MarkdownEditor.Label>
        </MarkdownEditor>
    )
}

export default NewTicket;