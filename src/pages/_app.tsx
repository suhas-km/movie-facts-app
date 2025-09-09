// import "@/styles/globals.css";
// import type { AppProps } from "next/app";

// export default function App({ Component, pageProps }: AppProps) {
//   return <Component {...pageProps} />;
// }
// pages/_app.tsx
import "../styles/globals.css"; // Or your Tailwind CSS import
import type { AppProps } from "next/app";
import { SessionProvider } from "next-auth/react";
import "../styles/animations.css";
import Head from "next/head";

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </Head>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

export default MyApp;