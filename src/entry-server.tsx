/// <reference types="nitro/vite/types" />
import "./styles.css";
import { renderToReadableStream } from "react-dom/server.edge";
import { StaticRouter } from "react-router";
import clientAssets from "./entry-client?assets=client";
import serverAssets from "./entry-server?assets=ssr";
import { App, galleryRedirect, resolvePage } from "./app";
import { bloomLogoUrl } from "./components/bloom-logo";
import { getStore } from "./lib/bloom-api.server";
import { renderErrorPage } from "./lib/error-page";

export default {
  async fetch(request: Request) {
    const url = new URL(request.url);
    if (url.pathname.replace(/\/+$/, "") === "/shop") {
      return new Response(null, { status: 301, headers: { Location: galleryRedirect(url) } });
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    try {
      const store = await getStore();
      const status = resolvePage(url.pathname, store).status;
      const headers = { "Content-Type": "text/html; charset=utf-8" };
      if (request.method === "HEAD") return new Response(null, { status, headers });
      const assets = clientAssets.merge(serverAssets);
      const data = JSON.stringify(store).replace(/</g, "\\u003c");
      const body = await renderToReadableStream(
        <html lang="en">
          <head>
            <meta charSet="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="author" content="The Gifting Bloom" />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <link rel="icon" href={bloomLogoUrl} type="image/png" />
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link
              rel="stylesheet"
              href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500;1,600&family=DM+Sans:wght@400;500;600;700&display=swap"
            />
            {assets.css.map((attributes) => (
              <link key={attributes.href} rel="stylesheet" {...attributes} />
            ))}
            {assets.js.map((attributes) => (
              <link key={attributes.href} rel="modulepreload" {...attributes} />
            ))}
          </head>
          <body>
            <div id="app">
              <StaticRouter location={url.pathname + url.search}>
                <App initialStore={store} />
              </StaticRouter>
            </div>
            <script
              id="bloom-data"
              type="application/json"
              dangerouslySetInnerHTML={{ __html: data }}
            />
            <script type="module" src={assets.entry} />
          </body>
        </html>,
      );
      return new Response(body, { status, headers });
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
  },
};
