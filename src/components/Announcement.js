import { getAnnouncements } from "@/services/index";
import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import { useQuery } from "@tanstack/react-query";
import ReactMarkdownCustom from "./MarkdownEditor/ReactMarkdownCustom";

function Announcement() {
  const { data, isLoading } = useQuery(
    ["announcements"],
    () => getAnnouncements(),
    {}
  );

  return (
    <>
      {data && (
        <Alert
          variant="outline"
          icon={<IconAlertCircle />}
          title={data?.title}
          color="orange"
        >
          <ReactMarkdownCustom>{data?.content}</ReactMarkdownCustom>
        </Alert>
      )}
    </>
  );
}

export default Announcement;
