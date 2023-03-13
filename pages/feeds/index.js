import { Alert, Button, Stack, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { customerDashboard } from "../../services/users.services";
import Layout from "../../src/components/Layout";
import PageContainer from "../../src/components/PageContainer";
import { StatsGrid } from "../../src/components/StatsGrid";
import { MarkdownEditor } from "@primer/react/drafts";
import { useState } from "react";
import { parseMarkdown, uploadFiles } from "../../services";
import DetailTicket from "../../src/components/Ticket/DetailTicket";
import { Box, TextInput } from "@primer/react";
import TicketsPublish from "@/components/Ticket/TicketsPublish";

function Feeds() {
  const { data, isLoading } = useQuery(
    ["dashboard"],
    () => customerDashboard(),
    {
      refetchOnWindowFocus: false,
    }
  );

  const { data: userData, status } = useSession();

  const router = useRouter();

  const [value, setValue] = useState("");

  const uploadFile = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadFiles(formData);
      console.log(result?.data);

      console.log(file);
      return {
        url: result?.data,
        file,
      };
    } catch (error) {
      console.log(error);
    }
  };

  const emojis = [
    { name: "+1", character: "👍" },
    { name: "-1", character: "👎" },
    { name: "heart", character: "❤️" },
    { name: "wave", character: "👋" },
    { name: "raised_hands", character: "🙌" },
    { name: "pray", character: "🙏" },
    { name: "clap", character: "👏" },
    { name: "ok_hand", character: "👌" },
    { name: "point_up", character: "☝️" },
    { name: "point_down", character: "👇" },
    { name: "point_left", character: "👈" },
    { name: "point_right", character: "👉" },
    { name: "raised_hand", character: "✋" },
    { name: "thumbsup", character: "👍" },
    { name: "thumbsdown", character: "👎" },
  ];

  const references = [
    {
      id: "1",
      titleText: "Add logging functionality",
      titleHtml: "Add logging functionality",
    },
    {
      id: "2",
      titleText: "Error: `Failed to install` when installing",
      titleHtml: "Error: <code>Failed to install</code> when installing",
    },
    {
      id: "3",
      titleText: "Add error-handling functionality",
      titleHtml: "Add error-handling functionality",
    },
  ];

  const mentionables = [
    { identifier: "monalisa", description: "Monalisa Octocat" },
    { identifier: "github", description: "GitHub" },
    { identifier: "primer", description: "Primer" },
  ];

  const savedReplies = [
    { name: "Duplicate", content: "Duplicate of #" },
    {
      name: "Welcome",
      content:
        "Welcome to the project!\n\nPlease be sure to read the contributor guidelines.",
    },
    { name: "Thanks", content: "Thanks for your contribution!" },
  ];

  const renderMarkdown = async (markdown) => {
    const result = await parseMarkdown(markdown);
    console.log(result);
    // In production code, this would make a query to some external API endpoint to render
    return result?.html;
  };

  const gotoCreate = () => {
    router.push("/tickets/create");
  };

  return (
    <PageContainer
      loading={isLoading || status === "loading"}
      title="Beranda"
      subTitle="Dashboard"
    >
      <Stack>
        <TicketsPublish />
        <Box>
          <TextInput />
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
        </Box>

        <StatsGrid data={data} />
        <DetailTicket />
      </Stack>
    </PageContainer>
  );
}

Feeds.Auth = {
  action: "manage",
  subject: "Feeds",
};

Feeds.getLayout = function getLayout(page) {
  return <Layout>{page}</Layout>;
};

export default Feeds;
