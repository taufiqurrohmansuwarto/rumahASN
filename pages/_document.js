import Document, { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";

const MyDocument = () => {
  // Set dayjs to use the Indonesian locale globally

  return (
    <Html lang="id">
      <Head>
        {/* Primary Meta Tags */}
        <meta name="title" content="Rumah ASN - Ruang Menjawab Keluhan ASN" />
        <meta
          name="description"
          content="Platform digital untuk ASN mendapatkan solusi dan jawaban atas keluhan seputar kepegawaian, karir, dan pengembangan diri."
        />
        <meta
          name="keywords"
          content="ASN, PNS, kepegawaian, karir ASN, layanan ASN, konsultasi ASN"
        />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="Indonesian" />
        <meta name="author" content="Rumah ASN" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:url"
          content="https://siasn.bkd.jatimprov.go.id/helpdesk/"
        />
        <meta
          property="og:title"
          content="Rumah ASN - Ruang Menjawab Keluhan ASN"
        />
        <meta
          property="og:description"
          content="Platform digital untuk ASN mendapatkan solusi dan jawaban atas keluhan seputar kepegawaian, karir, dan pengembangan diri."
        />
        <meta
          property="og:image"
          content="https://www.rumahasn.id/images/og-image.jpg"
        />
        <meta property="og:locale" content="id_ID" />
        <meta property="og:site_name" content="Rumah ASN" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:url"
          content="https://siasn.bkd.jatimprov.go.id/helpdesk/"
        />
        <meta
          name="twitter:title"
          content="Rumah ASN - Ruang Menjawab Keluhan ASN"
        />
        <meta
          name="twitter:description"
          content="Platform digital untuk ASN mendapatkan solusi dan jawaban atas keluhan seputar kepegawaian, karir, dan pengembangan diri."
        />
        <meta
          name="twitter:image"
          content="https://www.rumahasn.id/images/twitter-image.jpg"
        />
        <meta name="twitter:creator" content="@rumahasn" />

        {/* Favicon & Web App */}
        <link rel="icon" href="/helpdesk/headset.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/helpdesk/headset.ico"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#ffffff" />

        {/* Schema.org markup */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Rumah ASN",
              "alternateName": "Ruang Menjawab Keluhan ASN",
              "url": "https://www.rumahasn.id",
              "description": "Platform digital untuk ASN mendapatkan solusi dan jawaban atas keluhan seputar kepegawaian, karir, dan pengembangan diri.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.rumahasn.id/search?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "sameAs": [
                "https://facebook.com/rumahasn",
                "https://twitter.com/rumahasn",
                "https://instagram.com/rumahasn"
              ]
            }
          `}
        </script>
      </Head>
      <body>
        <meta
          name="google-site-verification"
          content="23oHq4sRPvLXyv0aFcsyESbDTnwpKdGvEVFSow4JIoE"
        />
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
