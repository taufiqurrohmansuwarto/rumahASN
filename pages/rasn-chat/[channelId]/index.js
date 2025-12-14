import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Modal, message } from "antd";
import { Box } from "@mantine/core";
import ChatLayout from "@/components/ChatLayout";
import {
  CreateChannelModal,
  ChannelHeader,
  ChannelSettings,
  MessageList,
  MessageInput,
} from "@/components/RasnChat";
import { useChannel, useDeleteMessage, useStartVideoCall } from "@/hooks/useRasnChat";

function ChannelChatPage() {
  const router = useRouter();
  const { channelId, scrollTo } = router.query;
  const [scrollToMessageId, setScrollToMessageId] = useState(null);

  // Handle scrollTo query param
  useEffect(() => {
    if (scrollTo) {
      setScrollToMessageId(scrollTo);
      // Clear the query param after setting
      router.replace(`/rasn-chat/${channelId}`, undefined, { shallow: true });
    }
  }, [scrollTo, channelId, router]);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [editMessage, setEditMessage] = useState(null);

  const { data: channel } = useChannel(channelId);
  const deleteMessage = useDeleteMessage();
  const startCall = useStartVideoCall();

  const handleDelete = (messageId) => {
    Modal.confirm({
      title: "Hapus pesan?",
      content: "Pesan yang dihapus tidak dapat dikembalikan.",
      okText: "Ya, Hapus",
      cancelText: "Batal",
      okButtonProps: { danger: true },
      onOk: () => deleteMessage.mutate(messageId),
    });
  };

  const handleStartCall = async (callType) => {
    try {
      await startCall.mutateAsync({ channelId, callType });
      message.success(`${callType === "video" ? "Video" : "Voice"} call dimulai`);
    } catch (error) {
      message.error("Gagal memulai panggilan");
    }
  };

  return (
    <>
      <Head>
        <title>
          {channel?.name ? `${channel.name} - RASN Chat` : "RASN Chat"} | Rumah ASN
        </title>
      </Head>

      <Box style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <ChannelHeader
          channelId={channelId}
          onStartCall={handleStartCall}
          onSettings={() => setSettingsOpen(true)}
        />

        {/* Messages - with relative position for JumpToDate */}
        <Box style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
          <MessageList
            channelId={channelId}
            onEdit={setEditMessage}
            onDelete={handleDelete}
            onReply={setReplyTo}
            scrollToMessageId={scrollToMessageId}
            onScrollComplete={() => setScrollToMessageId(null)}
          />
        </Box>

        {/* Input */}
        <Box px="md" py="sm" style={{ borderTop: "1px solid #f0f0f0" }}>
          <MessageInput
            channelId={channelId}
            replyTo={replyTo}
            editMessage={editMessage}
            onCancelReply={() => setReplyTo(null)}
            onCancelEdit={() => setEditMessage(null)}
          />
        </Box>
      </Box>

      <CreateChannelModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />

      <ChannelSettings
        channelId={channelId}
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

ChannelChatPage.getLayout = function getLayout(page, pageProps, router) {
  const channelId = router?.query?.channelId;
  return <ChatLayout currentChannelId={channelId}>{page}</ChatLayout>;
};

ChannelChatPage.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChannelChatPage;
