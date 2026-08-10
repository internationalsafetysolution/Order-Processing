import { query } from '@/lib/db';
import { Lexend } from "next/font/google";
import "./globals.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export async function generateMetadata() {
  let appName = 'Portal';

  try {
    const settings = await query('SELECT * FROM settings WHERE id = 1');
    if (settings && settings.length > 0) {
      appName = settings[0].app_name || 'Portal';
    }
  } catch (e) {
    // Handle fallback during static build phases
  }

  return {
    title: appName,
    description: "Order Management Portal"
  };
}

export default async function RootLayout({ children }) {
  let favicon = '/favicon.ico';

  try {
    const settings = await query('SELECT * FROM settings WHERE id = 1');
    if (settings && settings.length > 0 && settings[0].favicon) {
      favicon = settings[0].favicon;
    }
  } catch (e) {
    // Handle fallback during static build phases
  }

  return (
    <html
      lang="en"
      className={`${lexend.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href={favicon} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
