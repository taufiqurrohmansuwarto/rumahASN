import { definitions } from "@/utils/client-utils";
import { MantineProvider } from "@mantine/core";
import { ThemeProvider } from "@primer/react";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ConfigProvider } from "antd";
import "antd/dist/antd.css";
import id from "antd/lib/locale/id_ID";
import { RBACProvider } from "context/RBACContext";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import { useState } from "react";
import Loading from "../src/components/Loading";
import "../styles/globals.css";
import Head from "next/head";
import Script from "next/script";

// check user role and organization start with 123
function Auth({ children, action, subject }) {
  const { data, status } = useSession({
    required: true,
    onUnauthenticated: () => signIn(),
  });

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
  const [queryClient] = useState(() => new QueryClient());
  const getLayout = Component.getLayout || ((page) => page);

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

      <ConfigProvider locale={id}>
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
              </ThemeProvider>
            </MantineProvider>
          </QueryClientProvider>
        </SessionProvider>
      </ConfigProvider>
    </>
  );
}

export default MyApp;
