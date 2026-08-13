import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera, X, Plus } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { candidateProfile } from '@/data/profile'
import { getMyCandidateProfile, updateMyCandidateProfile, updateMySkills, uploadMyPhoto, type CandidateProfileRaw } from '@/api/candidates'
import { ApiError, resolveUploadUrl } from '@/api/client'
import { useApp } from '@/context/AppContext'
import { useBasePath } from '@/hooks/useBasePath'

export function ProfileEdit() {
  const navigate = useNavigate()
  const basePath = useBasePath()
  const { showToast } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<CandidateProfileRaw | null>(null)
  const [firstName, setFirstName] = useState(candidateProfile.firstName)
  const [lastName, setLastName] = useState(candidateProfile.lastName)
  const [headline, setHeadline] = useState('')
  const [about, setAbout] = useState('')
  const [phone, setPhone] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [newSkill, setNewSkill] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // Revoke the local object URL whenever it's replaced or the screen
  // unmounts — it's only ever needed for the brief window between
  // picking a file and the upload resolving.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  useEffect(() => {
    getMyCandidateProfile().then((p) => {
      setProfile(p)
      setFirstName(p.first_name)
      setLastName(p.last_name)
      setHeadline(p.headline ?? '')
      setAbout(p.about ?? '')
      setPhone(p.phone ?? '')
      setSkills(p.skills.map((s) => s.skill_name))
    }).catch(() => {})
  }, [])

  const MAX_PHOTO_SIZE = 5 * 1024 * 1024 // 5 Mo — the backend enforces no limit of its own

  const handlePhotoPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Le fichier doit être une image (JPG, PNG…).')
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      showToast("L'image ne doit pas dépasser 5 Mo.")
      return
    }

    // Instant local preview while the upload is in flight, so the
    // candidate sees their chosen photo right away rather than staring
    // at the old avatar until the network round-trip completes.
    setPhotoPreview(URL.createObjectURL(file))
    setUploadingPhoto(true)
    try {
      const updated = await uploadMyPhoto(file)
      setProfile(updated)
      showToast('Photo mise à jour !')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible de mettre à jour la photo.")
    } finally {
      setPhotoPreview(null)
      setUploadingPhoto(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateMyCandidateProfile({
        first_name: firstName,
        last_name: lastName,
        headline,
        about,
        phone,
      })
      const originalSkills = profile?.skills.map((s) => s.skill_name) ?? []
      if (JSON.stringify(originalSkills) !== JSON.stringify(skills)) {
        await updateMySkills(skills)
      }
      showToast('Profil mis à jour avec succès !')
      navigate(`${basePath}/profile`)
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Impossible de mettre à jour le profil.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="pb-8">
      <PageHeader
        title="Modifier mon profil"
        action={
          <button type="submit" disabled={saving} className="text-sm font-semibold text-brand-blue-600 disabled:opacity-50">
            Enregistrer
          </button>
        }
      />

      <div className="flex flex-col items-center gap-2 px-4 pt-6">
        <span className="relative">
          <Avatar
            name={`${firstName} ${lastName}`}
            src={photoPreview ?? (profile?.photo_url ? resolveUploadUrl(profile.photo_url) : candidateProfile.avatar)}
            size={88}
            className={uploadingPhoto ? 'opacity-60' : undefined}
          />
          <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-brand-blue-600 text-white ring-2 ring-white">
            <Camera className="size-3.5" />
          </span>
        </span>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
        <button
          type="button"
          disabled={uploadingPhoto}
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-semibold text-brand-blue-600 disabled:opacity-50"
        >
          {uploadingPhoto ? 'Envoi…' : 'Changer la photo'}
        </button>
      </div>

      <div className="mt-6 space-y-4 px-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Prénom" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <Input label="Nom" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
        <Input label="Titre professionnel" value={headline} onChange={(e) => setHeadline(e.target.value)} />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text-primary">À propos de moi</span>
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-surface-border bg-white p-3.5 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
          />
        </label>

        {/* Email isn't user-editable: it's the login identifier and the
            backend has no email-change flow (verification etc.) — see
            README decisions log. */}
        {profile?.email && (
          <Input label="Adresse e-mail" type="email" value={profile.email} disabled hint="L'e-mail de connexion ne peut pas être modifié ici." />
        )}
        <Input label="Téléphone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />

        <div>
          <span className="mb-1.5 block text-sm font-medium text-text-primary">Compétences</span>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s} className="flex items-center gap-1 rounded-full bg-surface-muted px-3 py-1.5 text-xs font-medium text-text-primary">
                {s}
                <button type="button" onClick={() => setSkills(skills.filter((sk) => sk !== s))} aria-label={`Retirer ${s}`}>
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addSkill()
                }
              }}
              placeholder="Ajouter une compétence"
              className="h-10 flex-1 rounded-xl border border-surface-border bg-white px-3.5 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
            />
            <button type="button" onClick={addSkill} className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue-50 text-brand-blue-600">
              <Plus className="size-[18px]" />
            </button>
          </div>
        </div>

        <Button type="submit" size="lg" fullWidth loading={saving}>
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  )
}
