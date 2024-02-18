import { downloadDataIPASN } from "@/services/siasn-services";
import { useQuery } from "@tanstack/react-query";
import { Button, Pagination, Skeleton } from "antd";
import { useState } from "react";

function UnduhDataIPASN() {
  const [loading, setLoading] = useState(false);
  const [downloadQuery, setDownloadQuery] = useState({
    type: "xlsx",
    limit: 10,
    offset: 0,
  });

  const [query, setQuery] = useState({
    type: "json",
  });

  const { data, isLoading } = useQuery(
    ["getIpAsn", query],
    () => downloadDataIPASN(query),
    {
      enabled: !!query,
    }
  );

  const handleDownload = async () => {
    setLoading(true);
    try {
      const result = await downloadDataIPASN(downloadQuery);

      //       download with link
      const url = window.URL.createObjectURL(new Blob([result]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `data-ipasn.${downloadQuery.type}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Skeleton loading={isLoading}>
      <Button
        style={{
          marginBottom: 16,
          marginTop: 16,
        }}
        loading={loading}
        disabled={loading}
        type="primary"
        onClick={handleDownload}
      >
        Unduh {downloadQuery.type} {downloadQuery.limit} data di halaman{" "}
        {downloadQuery.offset / downloadQuery.limit + 1}
      </Button>
      <Pagination
        onChange={(page, pageSize) => {
          const limit = pageSize;
          const offset = (page - 1) * pageSize;
          setDownloadQuery({
            ...downloadQuery,
            limit,
            offset,
          });
        }}
        pageSizeOptions={[10, 100, 1000, 10000]}
        total={data?.meta?.total}
      />
    </Skeleton>
  );
}

export default UnduhDataIPASN;
