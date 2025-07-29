import { Manrope } from "next/font/google";
import "./globals.css";

import { StoreProvider } from "@/utils/store/provider";
import Navbar from "@/components/navbar";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata = {
  title: "PESU Discord",
  description: "Welcome to the PES University Discord!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} antialiased overflow-x-hidden min-h-screen w-screen max-w-full mx-auto`}
      >
        <StoreProvider>
          <Navbar />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}
