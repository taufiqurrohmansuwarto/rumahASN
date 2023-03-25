import { Center, Stack, Image, Loader, Text } from "@mantine/core";
import React from "react";

function Loading() {
  return (
    <Center style={{ width: "100%", height: "100vh" }}>
      <Stack align="center" spacing="xs">
        <Loader size="md" />
        <div style={{ width: 100 }}>
          <Image
            src="https://siasn.bkd.jatimprov.go.id:9000/public/logobkd.jpg"
            alt="logo bkd"
          />
        </div>
      </Stack>
    </Center>
  );
}

export default Loading;
