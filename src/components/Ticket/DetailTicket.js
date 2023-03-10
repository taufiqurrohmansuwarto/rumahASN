import React from "react";
import { PointerBox, Text } from "@primer/react";

function DetailTicket() {
  return (
    <PointerBox minHeight={100} caret="left-top" sx={{ m: 4, p: 4 }}>
      <Text
        sx={{
          fontSize: 14,
        }}
      >
        Detail tiket
      </Text>
    </PointerBox>
  );
}

export default DetailTicket;
