import { Metadata } from "next";
import { Providers } from "./providers";
import 'react-toastify/dist/ReactToastify.css';

import { MetadataRoute } from "next";
import { ToastContainer } from "react-toastify";

function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: "https://acme.com/sitemap.xml",
  };
}

export const metadata: Metadata = {
  title: "Comp builder",
  description: "Não sabe com o que jogar? Crie sua composição em um click!",
  icons: { shortcut: "/app-icon.webp", icon: "/app-icon.webp" },
  openGraph: {
    images: "/app-icon.webp",
    title: "Comp builder",
    description: "Não sabe com o que jogar? Crie sua composição em um click!",
    type: "website",
    siteName: "LoL Comp Builder",
  },
  applicationName: "LoL Comp Builder",
  category: "League of Legends",
  keywords: [
    "League of Legends",
    "lol",
    "composição",
    "riot games",
    "comp builder",
    "jogo",
    "game",
    "build",
    "counter",
    "gg",
  ],
  robots: {
    follow: true,
    index: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
