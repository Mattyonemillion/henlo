'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Shield, Bell, Lock, Trash2, AlertTriangle } from 'lucide-react'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const newPassword = formData.get('new_password') as string
    const confirmPassword = formData.get('confirm_password') as string

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen' })
      setPasswordLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Wachtwoord moet minimaal 8 karakters zijn' })
      setPasswordLoading(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: 'Wachtwoord succesvol gewijzigd' })
      ;(e.target as HTMLFormElement).reset()
    }

    setPasswordLoading(false)
  }

  async function handleNotificationSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        email_notifications: formData.get('email_notifications') === 'on',
        message_notifications: formData.get('message_notifications') === 'on',
        listing_notifications: formData.get('listing_notifications') === 'on',
      })
      .eq('id', user.id)

    if (error) {
      setMessage({ type: 'error', text: 'Fout bij opslaan instellingen' })
    } else {
      setMessage({ type: 'success', text: 'Notificatie-instellingen opgeslagen' })
    }

    setLoading(false)
  }

  async function handleDeleteAccount() {
    if (!confirm('Weet je zeker dat je je account wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.')) {
      return
    }

    const confirmText = prompt('Typ "VERWIJDER" om te bevestigen:')
    if (confirmText !== 'VERWIJDER') {
      return
    }

    setDeleteLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Delete user's listings first
    await supabase.from('listings').delete().eq('user_id', user.id)

    // Delete favorites
    await supabase.from('favorites').delete().eq('user_id', user.id)

    // Delete messages
    await supabase.from('messages').delete().eq('sender_id', user.id)
    await supabase.from('messages').delete().eq('receiver_id', user.id)

    // Delete profile
    await supabase.from('profiles').delete().eq('id', user.id)

    // Sign out
    await supabase.auth.signOut()

    setDeleteLoading(false)
    router.push('/')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Instellingen</h1>
        <p className="mt-2 text-gray-600">Beheer je account en voorkeuren</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-800'
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Password Change */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Wachtwoord wijzigen</h2>
              <p className="text-sm text-gray-600">Wijzig je wachtwoord voor extra beveiliging</p>
            </div>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nieuw wachtwoord</label>
              <input
                type="password"
                name="new_password"
                required
                minLength={8}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Minimaal 8 karakters"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bevestig wachtwoord</label>
              <input
                type="password"
                name="confirm_password"
                required
                minLength={8}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Herhaal je nieuwe wachtwoord"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {passwordLoading ? 'Bezig met wijzigen...' : 'Wachtwoord wijzigen'}
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Notificaties</h2>
              <p className="text-sm text-gray-600">Beheer je notificatie voorkeuren</p>
            </div>
          </div>

          <form onSubmit={handleNotificationSettings} className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">E-mail notificaties</p>
                <p className="text-sm text-gray-600">Ontvang updates via e-mail</p>
              </div>
              <input
                type="checkbox"
                name="email_notifications"
                defaultChecked={true}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Bericht notificaties</p>
                <p className="text-sm text-gray-600">Meldingen voor nieuwe berichten</p>
              </div>
              <input
                type="checkbox"
                name="message_notifications"
                defaultChecked={true}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Advertentie notificaties</p>
                <p className="text-sm text-gray-600">Updates over je advertenties</p>
              </div>
              <input
                type="checkbox"
                name="listing_notifications"
                defaultChecked={true}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Bezig met opslaan...' : 'Instellingen opslaan'}
            </button>
          </form>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-gray-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Privacy & beveiliging</h2>
              <p className="text-sm text-gray-600">Beheer je privacy instellingen</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Profiel zichtbaarheid</p>
                <p className="text-sm text-gray-600">Wie kan je profiel zien</p>
              </div>
              <select className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500">
                <option>Iedereen</option>
                <option>Alleen geregistreerde gebruikers</option>
                <option>Niemand</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Telefoonnummer tonen</p>
                <p className="text-sm text-gray-600">Toon telefoonnummer op advertenties</p>
              </div>
              <input
                type="checkbox"
                defaultChecked={false}
                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <div>
              <h2 className="text-xl font-semibold text-red-900">Gevarenzone</h2>
              <p className="text-sm text-red-600">Onomkeerbare acties</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <h3 className="font-semibold text-red-900 mb-2">Account verwijderen</h3>
              <p className="text-sm text-red-700 mb-4">
                Als je je account verwijdert, worden al je gegevens permanent verwijderd.
                Dit omvat al je advertenties, berichten en favorieten.
                Deze actie kan niet ongedaan worden gemaakt.
              </p>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
                {deleteLoading ? 'Bezig met verwijderen...' : 'Account permanent verwijderen'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
