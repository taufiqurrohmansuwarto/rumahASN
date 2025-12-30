import { definitions } from "@/utils/client-utils";
import { MantineProvider } from "@mantine/core";
import { ThemeProvider } from "@primer/react";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import { RBACProvider } from "context/RBACContext";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Script from "next/script";
import React, { useState, useEffect, useRef } from "react";
import Loading from "../src/components/Loading";
import GlobalVideoConference from "../src/components/VideoConference/GlobalVideoConference";
import "../styles/globals.css";
import { getActiveVideoSession } from "@/services/coaching-clinics.services";
import useVideoConferenceStore from "@/store/useVideoConference";

import "antd/dist/reset.css";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { useRouter } from "next/router";
import { useGmailConfig } from "src/styles/gmail.styles";
import { useLayananKeuanganConfig } from "src/styles/layanan-keuangan.styles";
import { useAntdConfig } from "src/styles/rasn.theme";
import { useRekonConfig } from "src/styles/rekon.styles";

// Suppress useLayoutEffect warning on server-side
if (typeof window === "undefined") {
  React.useLayoutEffect = React.useEffect;
}

// Polyfill ReadableStream untuk server-side
if (typeof ReadableStream === "undefined") {
  global.ReadableStream =
    global.ReadableStream ||
    class ReadableStream {
      constructor() {
        throw new Error("ReadableStream is not available in this environment");
      }
    };
}

// check user role and organization start with 123
function Auth({ children, action, subject }) {
  dayjs.locale("id");
  dayjs.extend(relativeTime);

  const { data, status } = useSession({
    required: true,
    onUnauthenticated: () => signIn(),
  });

  const { resumeMeeting, isOpen } = useVideoConferenceStore();
  const hasCheckedSession = useRef(false);

  // Auto-resume active video session on login/refresh
  useEffect(() => {
    // Only check once per mount, and only if not already in a meeting
    if (data?.user && !isOpen && !hasCheckedSession.current) {
      hasCheckedSession.current = true;

      getActiveVideoSession()
        .then((response) => {
          if (response?.hasActiveSession && response?.meetingData) {
            resumeMeeting(response.meetingData);
          }
        })
        .catch((error) => {
          console.error("Failed to check active video session:", error);
        });
    }
  }, [data?.user, isOpen, resumeMeeting]);

  if (status === "loading") {
    return <Loading />;
  } else {
    if (!data?.user) return <div>Not Authorized</div>;
    const user = {
      id: data?.user?.id,
      current_role: data?.user?.current_role,
      organization: data?.user?.organization_id,
      roles: [data?.user?.current_role],
    };

    // const userAbility = ability(user);
    // const isAllowed = userAbility.can(action, subject);

    // if (isAllowed) {
    //   return (
    //     <AbilityContext.Provider value={ability(user)}>
    //       {children}
    //     </AbilityContext.Provider>
    //   );
    // }

    return (
      <RBACProvider user={user} definitions={definitions}>
        {children}
      </RBACProvider>
    );
  }
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const router = useRouter();
  const [queryClient] = useState(() => new QueryClient());
  const getLayout = Component.getLayout || ((page) => page);

  const antdConfig = useAntdConfig();
  const gmailConfig = useGmailConfig();
  const layananKeuanganConfig = useLayananKeuanganConfig();
  const rekonConfig = useRekonConfig();

  const getThemeConfig = () => {
    if (router.pathname.includes("/mail")) {
      return antdConfig;
    } else if (router.pathname.includes("/layanan-keuangan")) {
      return layananKeuanganConfig;
    } else if (router.pathname.includes("/logs")) {
      return antdConfig;
    } else if (router.pathname.includes("/layanan-siasn")) {
      return antdConfig;
    }

    return antdConfig;
  };

  return (
    <>
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-Q1GNKXN1MQ"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-Q1GNKXN1MQ');
                  `}
      </Script>
      <ConfigProvider {...getThemeConfig()}>
        <SessionProvider
          session={session}
          baseUrl="/helpdesk"
          basePath="/helpdesk/api/auth"
        >
          <Head>
            <link rel="shortcut icon" href="/helpdesk/headset.ico" />
          </Head>

          <QueryClientProvider client={queryClient}>
            <MantineProvider withGlobalStyles withNormalizeCSS>
              <ThemeProvider colorMode="auto" preventSSRMismatch>
                <Hydrate>
                  {Component.Auth ? (
                    <Auth
                      subject={Component?.Auth?.subject}
                      action={Component?.Auth?.action}
                    >
                      {getLayout(<Component {...pageProps} />)}
                    </Auth>
                  ) : (
                    <Component {...pageProps} />
                  )}
                </Hydrate>
                <GlobalVideoConference />
              </ThemeProvider>
            </MantineProvider>
          </QueryClientProvider>
        </SessionProvider>
      </ConfigProvider>
    </>
  );
}

export default MyApp;
