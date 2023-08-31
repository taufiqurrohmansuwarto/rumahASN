import { mysapkMenu } from "@/utils/client-utils";
import { Select } from "antd";
import { useRouter } from "next/router";
import React from "react";

function CustomSelectMenu() {
  const router = useRouter();

  const getTheLatestPath = () => {
    const path = router.asPath;
    const pathArray = path.split("/");
    const lastPath = pathArray[pathArray.length - 1];
    return `/${lastPath}`;
  };

  return (
    <>
      <Select
        onChange={(value) => router.push(`/pemutakhiran-data${value}`)}
        defaultValue={getTheLatestPath()}
        style={{ width: 200 }}
        options={mysapkMenu.map((item) => ({
          label: item.title,
          value: item.path,
        }))}
      ></Select>
    </>
  );
}

export default CustomSelectMenu;
