import { Metadata } from "next";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Comp builder",
  description: "Não sabe com o que jogar? Crie sua composição em um click",
  icons: { shortcut: "/gold_icon.png", icon: "/gold_icon.png" },
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
