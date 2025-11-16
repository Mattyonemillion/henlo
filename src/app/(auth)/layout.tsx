import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authenticatie',
  description: 'Log in of registreer op Henlo om advertenties te plaatsen en te kopen.',
  robots: {
    index: false,
    follow: false,
  },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
