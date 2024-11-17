import { layananKepegawaian } from "@/services/index";
import { useQuery } from "@tanstack/react-query";
import { Card, List } from "antd";
import Link from "next/link";
import React from "react";

const DaftarLayanan = () => {
  const { data, isLoading } = useQuery(
    ["layanan-kepegawaian"],
    () => layananKepegawaian(),
    {}
  );

  return (
    <Card title="Daftar Persyaratan Layanan Kepegawaian">
      <List
        loading={isLoading}
        dataSource={data}
        size="small"
        rowKey={(row) => row?.slug}
        renderItem={(item) => (
          <List.Item>
            <Link href={`/layanan/${item?.slug}`}>{item?.name}</Link>
          </List.Item>
        )}
      />
    </Card>
  );
};

export default DaftarLayanan;
