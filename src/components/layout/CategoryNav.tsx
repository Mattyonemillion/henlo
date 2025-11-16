'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CATEGORIES } from '@/lib/utils/constants'
import { Button } from '@/components/ui/button'

export function CategoryNav() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams.get('category')

  const handleCategoryClick = (categoryId: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (selectedCategory === categoryId) {
      // Deselect if already selected
      params.delete('category')
    } else {
      params.set('category', categoryId)
    }

    router.push(`/listings?${params.toString()}`)
  }

  const handleClearAll = () => {
    router.push('/listings')
  }

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Button
            variant={!selectedCategory ? 'default' : 'outline'}
            size="sm"
            onClick={handleClearAll}
            className="whitespace-nowrap"
          >
            Alle categorieën
          </Button>

          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryClick(category.id)}
              className="whitespace-nowrap"
            >
              <span className="mr-1">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
