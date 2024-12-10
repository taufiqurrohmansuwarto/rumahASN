import MegaMenu from "@/components/MegaMenu/MegaMenuTop";
import NotifikasiASNConnect from "@/components/Notification/NotifikasiASNConnect";
import NotifikasiForumKepegawaian from "@/components/Notification/NotifikasiForumKepegawaian";
import NotifikasiKepegawaian from "@/components/Notification/NotifikasiKepegawaian";
import NotifikasiPrivateMessage from "@/components/Notification/NotifikasiPrivateMessage";

const ActionSettings = () => {
  return [
    <NotifikasiKepegawaian
      key="kepegawaian"
      url="kepegawaian"
      title="Inbox Kepegawaian"
    />,
    <NotifikasiPrivateMessage
      key="private-message"
      url="/mails/inbox"
      title="Inbox Pesan Pribadi"
    />,
    <NotifikasiASNConnect
      key="asn-connect"
      url="asn-connect"
      title="Inbox ASN Connect"
    />,
    <NotifikasiForumKepegawaian
      key="forum-kepegawaian"
      url="forum-kepegawaian"
      title="Inbox Forum Kepegawaian"
    />,
    <MegaMenu key="mega-menu" />,
  ];
};

export default ActionSettings;
