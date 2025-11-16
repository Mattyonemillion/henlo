'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export interface FilterValues {
  priceMin?: number
  priceMax?: number
  condition?: string
  location?: string
  category?: string
}

interface ListingFiltersProps {
  onFilterChange: (filters: FilterValues) => void
  initialFilters?: FilterValues
}

const CONDITIONS = [
  { value: 'new', label: 'Nieuw' },
  { value: 'like_new', label: 'Als nieuw' },
  { value: 'good', label: 'Goed' },
  { value: 'fair', label: 'Redelijk' },
  { value: 'poor', label: 'Matig' },
]

const CATEGORIES = [
  { value: 'electronics', label: 'Elektronica' },
  { value: 'clothing', label: 'Kleding' },
  { value: 'home_garden', label: 'Huis & Tuin' },
  { value: 'sports', label: 'Sport' },
  { value: 'books', label: 'Boeken' },
  { value: 'toys', label: 'Speelgoed' },
  { value: 'vehicles', label: 'Voertuigen' },
  { value: 'other', label: 'Overig' },
]

export default function ListingFilters({
  onFilterChange,
  initialFilters = {},
}: ListingFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>(initialFilters)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.priceMin ?? 0,
    filters.priceMax ?? 10000,
  ])

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value)
    const newFilters = {
      ...filters,
      priceMin: value[0],
      priceMax: value[1],
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleConditionChange = (value: string) => {
    const newFilters = {
      ...filters,
      condition: value === 'all' ? undefined : value,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleCategoryChange = (value: string) => {
    const newFilters = {
      ...filters,
      category: value === 'all' ? undefined : value,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleLocationChange = (value: string) => {
    const newFilters = {
      ...filters,
      location: value || undefined,
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    const resetFilters: FilterValues = {}
    setFilters(resetFilters)
    setPriceRange([0, 10000])
    onFilterChange(resetFilters)
  }

  const hasActiveFilters =
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.condition !== undefined ||
    filters.location !== undefined ||
    filters.category !== undefined

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-primary-600"
          >
            <X className="w-4 h-4 mr-1" />
            Wissen
          </Button>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label>Prijs</Label>
        <div className="px-2">
          <Slider
            min={0}
            max={10000}
            step={50}
            value={priceRange}
            onValueChange={handlePriceChange}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>€{priceRange[0]}</span>
          <span>€{priceRange[1]}</span>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Categorie</Label>
        <Select
          value={filters.category ?? 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alle categorieën" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle categorieën</SelectItem>
            {CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                {category.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <Label>Staat</Label>
        <Select
          value={filters.condition ?? 'all'}
          onValueChange={handleConditionChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alle staten" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle staten</SelectItem>
            {CONDITIONS.map((condition) => (
              <SelectItem key={condition.value} value={condition.value}>
                {condition.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location">Locatie</Label>
        <Input
          id="location"
          type="text"
          placeholder="Bijv. Amsterdam"
          value={filters.location ?? ''}
          onChange={(e) => handleLocationChange(e.target.value)}
        />
      </div>
    </div>
  )
}
