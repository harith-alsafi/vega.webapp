import "@/app/globals.css";
import { cn } from "@/lib/utils";
import { TailwindIndicator } from "@/components/tailwind-indicator";
import { Providers } from "@/components/core/providers";
import { Header } from "@/components/core/top-bar/header";
import { Toaster } from "@/components/ui/sonner";

export const metadata = {
  metadataBase: new URL(`https://${process.env.VERCEL_URL}`),
  title: {
    default: "Vega IoT Chatbot",
    template: `%s - IoT Chatbot`,
  },
  description: "An AI-powered IoT chatbot to talk with IoT devices",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased")}>
        <Providers
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            {/* @ts-ignore */}
            <Header />
            <main className="flex flex-col flex-1 bg-muted/50">{children}</main>
            <Toaster />
          </div>
          {/* <TailwindIndicator /> */}
        </Providers>
      </body>
    </html>
  );
}
