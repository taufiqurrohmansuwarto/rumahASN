import React, { useState } from "react";
import { useRouter } from "next/router";
import { Checkbox } from "antd";

function FilterSource({ query, setQuery }) {
  const router = useRouter();
  const [selected, setSelected] = useState([
    router?.query?.source || "simaster",
  ]);

  const handleChangeCheckbox = (value) => {
    setSelected(value);
    setQuery({ ...query, source: value });
    router.push({
      pathname: router.pathname,
      query: { ...query, page: 1, limit: 10, source: value },
    });
  };
  return (
    <Checkbox.Group defaultValue={selected} onChange={handleChangeCheckbox}>
      <Checkbox value="siasn">SIASN</Checkbox>
    </Checkbox.Group>
  );
}

export default FilterSource;
