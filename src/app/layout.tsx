import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Henlo - Tweedehands Marktplaats',
    template: '%s | Henlo'
  },
  description: 'Koop en verkoop tweedehands spullen op Henlo. Vind geweldige deals op elektronica, kleding, meubels en meer.',
  keywords: ['marktplaats', 'tweedehands', 'kopen', 'verkopen', 'advertenties'],
  authors: [{ name: 'Henlo' }],
  openGraph: {
    title: 'Henlo - Tweedehands Marktplaats',
    description: 'Koop en verkoop tweedehands spullen op Henlo',
    type: 'website',
    locale: 'nl_NL',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" className={inter.className}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
