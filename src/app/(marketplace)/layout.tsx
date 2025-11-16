import { ReactNode } from 'react'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advertenties',
  description: 'Ontdek tweedehands artikelen op Henlo. Van elektronica tot meubels, vind geweldige deals in alle categorieën.',
  keywords: ['tweedehands', 'kopen', 'verkopen', 'advertenties', 'marktplaats', 'deals'],
  openGraph: {
    title: 'Advertenties | Henlo',
    description: 'Ontdek tweedehands artikelen op Henlo',
    type: 'website',
  },
}

export default function MarketplaceLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
