import { Alert, Button } from "@mantine/core";
import { NextLink } from "@mantine/next";
import { useSession } from "next-auth/react";
import React from "react";

// create function to know if current time is morning, afternoon, or evening
function getGreeting() {
  const date = new Date();
  const hours = date.getHours();
  if (hours < 12) {
    return "Selamat Pagi";
  } else if (hours < 18) {
    return "Selamat Siang";
  } else {
    return "Selamat Malam";
  }
}

function Greeting() {
  const { data, status } = useSession();

  return (
    <div>
      {status === "loading" ? (
        <div>Loading...</div>
      ) : (
        <div>
          <Alert title="Bummer">
            <div>
              {getGreeting()}, {data?.user?.name}
            </div>
            <Button component={NextLink} href="/tickets/create">
              Hello
            </Button>
          </Alert>
        </div>
      )}{" "}
    </div>
  );
}

export default Greeting;
