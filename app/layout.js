import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import 'primeicons/primeicons.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "ClickUp Dashboard",
  description: "ClickUp Dashboard Advanced Features",
};

const PrimeReactProviderConfig = dynamic(() => import('./PrimeReactProviderConfig'), { ssr: false });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrimeReactProviderConfig>
          {children}
        </PrimeReactProviderConfig>
      </body>
    </html>
  );
}
