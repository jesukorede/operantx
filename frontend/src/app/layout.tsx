import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OperantX MVP",
  description: "Decentralized human + machine coordination on peaq"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">{children}</div>
      </body>
    </html>
  );
}
