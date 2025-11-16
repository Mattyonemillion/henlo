import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Over Henlo</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/about" className="hover:text-blue-600 transition-colors">
                  Over ons
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-600 transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/help" className="hover:text-blue-600 transition-colors">
                  Help & FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Juridisch</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/terms" className="hover:text-blue-600 transition-colors">
                  Algemene voorwaarden
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                  Privacybeleid
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-blue-600 transition-colors">
                  Cookiebeleid
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Categorieën</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link href="/listings?category=electronics" className="hover:text-blue-600 transition-colors">
                  Elektronica
                </Link>
              </li>
              <li>
                <Link href="/listings?category=clothing" className="hover:text-blue-600 transition-colors">
                  Kleding
                </Link>
              </li>
              <li>
                <Link href="/listings?category=home" className="hover:text-blue-600 transition-colors">
                  Huis & Tuin
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Volg ons</h3>
            <p className="text-sm text-gray-600">
              Blijf op de hoogte van de nieuwste aanbiedingen en updates.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {currentYear} Henlo. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}
