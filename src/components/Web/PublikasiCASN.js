import { publikasiCasn } from "@/services/index";
import { capitalizeWithoutPPPK } from "@/utils/client-utils";
import { useQuery } from "@tanstack/react-query";
import { Badge, Card, List } from "antd";
import { lowerCase } from "lodash";
import Link from "next/link";
import React, { useState } from "react";

function PublikasiCASN() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 4,
    search: "",
  });

  const { data, isLoading } = useQuery(
    ["publikasi-casn"],
    () => publikasiCasn(query),
    {
      refetchOnWindowFocus: false,
    }
  );

  return (
    <Badge.Ribbon text="Seleksi Pegawai">
      <Card title="Web BKD">
        <List
          loading={isLoading}
          dataSource={data?.results}
          footer={
            <div>
              <a>Lihat Semua</a>
            </div>
          }
          renderItem={(item) => {
            return (
              <List.Item>
                <List.Item.Meta
                  description={
                    <Link href={`/web/seleksi/${item?.id}`}>
                      {capitalizeWithoutPPPK(lowerCase(item?.judul))}
                    </Link>
                  }
                />
              </List.Item>
            );
          }}
        />
      </Card>
    </Badge.Ribbon>
  );
}

export default PublikasiCASN;
