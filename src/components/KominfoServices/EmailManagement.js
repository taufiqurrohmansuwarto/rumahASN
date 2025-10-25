import { Tabs } from "antd";
import { useRouter } from "next/router";
import EmailSubmissionAdmin from "./EmailSubmissionAdmin";
import EmailJatimProvAdmin from "./EmailJatimProvAdmin";
import { IconMailPlus, IconMail } from "@tabler/icons-react";

function EmailManagement() {
  const router = useRouter();

  // Determine active tab based on current path
  const activeKey = router.pathname.includes("/jatimprov-mails")
    ? "jatimprov-mails"
    : "submissions";

  const handleTabChange = (key) => {
    if (key === "submissions") {
      router.push("/kominfo-services/email-submission");
    } else if (key === "jatimprov-mails") {
      router.push("/kominfo-services/email-submission/jatimprov-mails");
    }
  };

  const items = [
    {
      key: "submissions",
      label: (
        <span>
          <IconMailPlus size={14} style={{ marginRight: 6 }} />
          Pengajuan Email
        </span>
      ),
      children: <EmailSubmissionAdmin />,
    },
    {
      key: "jatimprov-mails",
      label: (
        <span>
          <IconMail size={14} style={{ marginRight: 6 }} />
          Daftar Email Jatimprov
        </span>
      ),
      children: <EmailJatimProvAdmin />,
    },
  ];

  return (
    <Tabs
      activeKey={activeKey}
      items={items}
      onChange={handleTabChange}
      size="large"
      style={{ marginTop: -16 }}
    />
  );
}

export default EmailManagement;
