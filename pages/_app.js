import { definitions } from "@/utils/client-utils";
import { MantineProvider } from "@mantine/core";
import { ThemeProvider } from "@primer/react";
import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ConfigProvider, Grid } from "antd";
import id from "antd/locale/id_ID";
import { RBACProvider } from "context/RBACContext";
import { SessionProvider, signIn, useSession } from "next-auth/react";
import Head from "next/head";
import Script from "next/script";
import { useState } from "react";
import Loading from "../src/components/Loading";
import "../styles/globals.css";

import "antd/dist/reset.css";
import dayjs from "dayjs";
import "dayjs/locale/id";
import relativeTime from "dayjs/plugin/relativeTime";
import { createStyles } from "antd-style";

const useStyle = createStyles(({ prefixCls, css }) => ({
  linearGradientButton: css`
    &.${prefixCls}-btn-primary:not([disabled]):not(
        .${prefixCls}-btn-dangerous
      ) {
      > span {
        position: relative;
      }

      &::before {
        content: "";
        background: linear-gradient(135deg, #d4380d, #fa8c16);
        position: absolute;
        inset: -1px;
        opacity: 1;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: inherit;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      }

      &:hover::before {
        opacity: 0.9;
        box-shadow: 0 4px 8px rgba(212, 56, 13, 0.4);
        transform: translateY(-1px);
      }

      &:active::before {
        transform: scale(0.98);
        box-shadow: 0 1px 2px rgba(212, 56, 13, 0.3);
      }

      &::after {
        content: "";
        position: absolute;
        inset: 0;
        background: radial-gradient(
          circle at center,
          rgba(255, 255, 255, 0.3) 0%,
          transparent 100%
        );
        opacity: 0;
        transition: opacity 0.3s;
        border-radius: inherit;
      }

      &:active::after {
        opacity: 1;
        animation: ripple 0.6s ease-out;
      }

      @keyframes ripple {
        from {
          transform: scale(0);
          opacity: 1;
        }
        to {
          transform: scale(2);
          opacity: 0;
        }
      }
    }
  `,
}));

// check user role and organization start with 123
function Auth({ children, action, subject }) {
  dayjs.locale("id");
  dayjs.extend(relativeTime);

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            cacheTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            refetchInterval: false,
            refetchIntervalInBackground: false,
            refetchIntervalInBackground: false,
          },
        },
      })
  );
  const getLayout = Component.getLayout || ((page) => page);

  const breakPoint = Grid.useBreakpoint();

  const { styles } = useStyle();

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
      <ConfigProvider
        button={{
          className: styles.linearGradientButton,
        }}
        theme={{
          components: {
            Card: {
              paddingLG: breakPoint.xs ? 14 : 24,
            },
          },
          token: {
            colorPrimary: "#FA8C16",
          },
        }}
        locale={id}
      >
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
