import AntDChatLayoutContainer from "@/components/AI/ChatBot/AntdChatLayoutContainer";
import AntdChatMessages from "@/components/AI/ChatBot/AntdChatMessages";
import AntdChatSender from "@/components/AI/ChatBot/AntdChatSender";
import useStyle from "@/components/AI/ChatBot/AntdChatStyle";
import ChatBotLayout from "@/components/AI/ChatBot/ChatBotLayout";
import Head from "next/head";

const ChatAIThread = () => {
  const { styles } = useStyle();
  return (
    <>
      <Head>
        <title>Rumah ASN - Bestie AI BKD</title>
      </Head>
      <AntDChatLayoutContainer>
        <AntdChatMessages style={styles} />
        <AntdChatSender style={styles} />
      </AntDChatLayoutContainer>
    </>
  );
};

ChatAIThread.getLayout = (page) => {
  return <ChatBotLayout active="/chat-ai">{page}</ChatBotLayout>;
};

ChatAIThread.Auth = {
  action: "manage",
  subject: "tickets",
};

export default ChatAIThread;
