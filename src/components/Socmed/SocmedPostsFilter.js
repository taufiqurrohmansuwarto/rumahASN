import { Segmented } from "antd";
import React, { useState } from "react";
import { useRouter } from "next/router";

function SocmedPostsFilter() {
  const router = useRouter();
  const [filter, setFilter] = useState(
    router.query.sortBy ? router.query.sortBy : "latest"
  );

  const handleChange = (filter) => {
    setFilter(filter);

    router.push({
      pathname: router.pathname,
      query: {
        sortBy: filter,
      },
    });
  };

  return (
    <Segmented
      onChange={handleChange}
      options={[
        {
          label: "Terbaru",
          value: "latest",
        },
        {
          label: "Populer",
          value: "popular",
        },
        {
          label: "Trending",
          value: "trending",
        },
      ]}
      value={filter}
    />
  );
}

export default SocmedPostsFilter;
