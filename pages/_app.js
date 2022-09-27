import {
  Hydrate,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useState } from "react";
import { SessionProvider } from "next-auth/react";
import { ConfigProvider } from "antd";
import id from "antd/lib/locale/id_ID";

function Auth({ children, roles }) {
  return <>{children}</>;
}

function MyApp({ Component, pageProps: { session, ...pageProps } }) {
  const [queryClient] = useState(() => new QueryClient());
  const getLayout = Component.getLayout || ((page) => page);

  return (
    <SessionProvider
      session={session}
      baseUrl="/helpdesk"
      basePath="/helpdesk/api/auth"
    >
      <QueryClientProvider client={queryClient}>
        <ConfigProvider locale={id}>
          <Hydrate>
            {Component.Auth ? (
              <Auth>{getLayout(<Component {...pageProps} />)}</Auth>
            ) : (
              <Component {...pageProps} />
            )}
          </Hydrate>
        </ConfigProvider>
      </QueryClientProvider>
    </SessionProvider>
  );
}

export default MyApp;
