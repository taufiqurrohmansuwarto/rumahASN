import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

const MyDocument = () => {
  return (
    <Html>
      <Head />
      <body>
        <Main />
        <NextScript />
        <Script
          src="https://source.zoom.us/2.13.0/lib/vendor/react.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/2.13.0/lib/vendor/react-dom.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/2.13.0/lib/vendor/redux.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/2.13.0/lib/vendor/redux-thunk.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/2.13.0/lib/vendor/lodash.min.js"
          strategy="beforeInteractive"
        />
        <Script
          src="https://source.zoom.us/2.13.0/zoom-meeting-embedded-2.13.0.min.js"
          strategy="beforeInteractive"
        />
      </body>
    </Html>
  );
};

MyDocument.getInitialProps = async (ctx) => {
  const cache = createCache();
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) =>
        (
          <StyleProvider cache={cache}>
            <App {...props} />
          </StyleProvider>
        ),
    });

  const initialProps = await Document.getInitialProps(ctx);
  const style = extractStyle(cache, true);
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    ),
  };
};

export default MyDocument;
