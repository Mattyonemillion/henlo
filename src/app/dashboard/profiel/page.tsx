'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, Mail, MapPin, Calendar, Shield } from 'lucide-react'

interface Profile {
  id: string
  email: string
  full_name: string | null
  bio: string | null
  location: string | null
  phone: string | null
  created_at: string
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  async function loadProfile() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!error && data) {
      setProfile({ ...data, email: user.email || '' })
    } else {
      // Create profile if it doesn't exist
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: null,
        bio: null,
        location: null,
        phone: null,
        created_at: new Date().toISOString(),
      })
    }

    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)

    const formData = new FormData(e.currentTarget)

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: profile!.id,
        full_name: formData.get('full_name') as string,
        bio: formData.get('bio') as string,
        location: formData.get('location') as string,
        phone: formData.get('phone') as string,
      })

    if (!error) {
      await loadProfile()
      setEditing(false)
    }

    setSaving(false)
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-800 mb-2">Profiel niet gevonden</h2>
        <p className="text-red-600">Er is een probleem opgetreden bij het laden van je profiel.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mijn profiel</h1>
        <p className="mt-2 text-gray-600">Beheer je persoonlijke informatie</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        {/* Profile Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.full_name || 'Naamloos'}
              </h2>
              <div className="flex items-center gap-2 text-gray-600 mt-1">
                <Calendar className="w-4 h-4" />
                Lid sinds {formatDate(profile.created_at)}
              </div>
            </div>
          </div>
        </div>

        {editing ? (
          /* Edit Form */
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Volledige naam</label>
              <input
                type="text"
                name="full_name"
                defaultValue={profile.full_name || ''}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Je volledige naam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                rows={4}
                defaultValue={profile.bio || ''}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Vertel iets over jezelf..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Locatie</label>
              <input
                type="text"
                name="location"
                defaultValue={profile.location || ''}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Bijv. Amsterdam"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Telefoonnummer</label>
              <input
                type="tel"
                name="phone"
                defaultValue={profile.phone || ''}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="+31 6 12345678"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Bezig met opslaan...' : 'Wijzigingen opslaan'}
              </button>
            </div>
          </form>
        ) : (
          /* View Mode */
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-600">E-mailadres</p>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
              </div>

              {profile.phone && (
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Telefoonnummer</p>
                    <p className="text-gray-900">{profile.phone}</p>
                  </div>
                </div>
              )}

              {profile.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Locatie</p>
                    <p className="text-gray-900">{profile.location}</p>
                  </div>
                </div>
              )}

              {profile.bio && (
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Bio</p>
                    <p className="text-gray-900">{profile.bio}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditing(true)}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              >
                Profiel bewerken
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
