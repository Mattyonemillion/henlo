import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SearchX, Home, Package } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-100 mb-4">
            <SearchX className="w-10 h-10 text-primary-600" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Pagina niet gevonden
          </h2>

          <p className="text-gray-600 mb-8">
            Sorry, de pagina die je zoekt bestaat niet of is verplaatst. Controleer de URL of ga terug naar de homepage.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button variant="default" className="w-full sm:w-auto">
                <Home className="w-4 h-4 mr-2" />
                Naar homepage
              </Button>
            </Link>
            <Link href="/advertenties">
              <Button variant="outline" className="w-full sm:w-auto">
                <Package className="w-4 h-4 mr-2" />
                Bekijk advertenties
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
