import { useRouter } from "next/router";
import React from "react";

// disini harusnya
function NewSubmission() {
  const router = useRouter();
  return <div>{router?.query?.id}</div>;
}

export default NewSubmission;
