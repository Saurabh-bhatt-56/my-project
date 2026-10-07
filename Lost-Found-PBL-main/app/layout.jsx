import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UserProvider from "@/provider/userProvider";
import { GetUserFromToken } from "@/lib/server/GetUserFromToken";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lost and Found",
  description: "A community platform to report and find lost items.",
};

export default async function RootLayout({ children }) {

  const user = await GetUserFromToken();
  const serializedUser = user ? JSON.parse(JSON.stringify(user)) : null;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <UserProvider initialUser={serializedUser}>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
