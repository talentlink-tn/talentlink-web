import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Camera } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { CompanyLogo } from '@/components/shared/CompanyLogo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { getMyCompany, updateMyCompany, uploadMyLogo, type CompanyProfileRaw } from '@/api/companies'
import { ApiError, resolveUploadUrl } from '@/api/client'
import { useApp } from '@/context/AppContext'
import { useBasePath } from '@/hooks/useBasePath'

const MAX_LOGO_SIZE = 5 * 1024 * 1024 // 5 Mo — same limit as the candidate photo upload

export function CompanyProfileEdit() {
  const navigate = useNavigate()
  const basePath = useBasePath()
  const { showToast } = useApp()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [company, setCompany] = useState<CompanyProfileRaw | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [brandColor, setBrandColor] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview)
    }
  }, [logoPreview])

  useEffect(() => {
    getMyCompany().then((c) => {
      setCompany(c)
      setName(c.name)
      setDescription(c.description ?? '')
      setBrandColor(c.brand_color ?? '')
    }).catch(() => {})
  }, [])

  const handleLogoPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Le fichier doit être une image (JPG, PNG…).')
      return
    }
    if (file.size > MAX_LOGO_SIZE) {
      showToast("L'image ne doit pas dépasser 5 Mo.")
      return
    }

    setLogoPreview(URL.createObjectURL(file))
    setUploadingLogo(true)
    try {
      const updated = await uploadMyLogo(file)
      setCompany(updated)
      showToast('Logo mis à jour !')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Impossible de mettre à jour le logo.')
    } finally {
      setLogoPreview(null)
      setUploadingLogo(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateMyCompany({ name, description, brand_color: brandColor })
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
        title="Profil de l'entreprise"
        action={
          <button type="submit" disabled={saving} className="text-sm font-semibold text-brand-blue-600 disabled:opacity-50">
            Enregistrer
          </button>
        }
      />

      <div className="flex flex-col items-center gap-2 px-4 pt-6">
        <span className="relative">
          <CompanyLogo
            name={name || '?'}
            color={company?.brand_color || '#2F6FED'}
            src={logoPreview ?? (company?.logo_url ? resolveUploadUrl(company.logo_url) : undefined)}
            size={88}
            className={uploadingLogo ? 'rounded-2xl opacity-60' : 'rounded-2xl'}
          />
          <span className="absolute right-0 bottom-0 flex size-7 items-center justify-center rounded-full bg-brand-blue-600 text-white ring-2 ring-white">
            <Camera className="size-3.5" />
          </span>
        </span>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoPick} />
        <button
          type="button"
          disabled={uploadingLogo}
          onClick={() => fileInputRef.current?.click()}
          className="text-sm font-semibold text-brand-blue-600 disabled:opacity-50"
        >
          {uploadingLogo ? 'Envoi…' : 'Changer le logo'}
        </button>
      </div>

      <div className="mt-6 space-y-4 px-4">
        <Input label="Nom de l'entreprise" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-text-primary">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-surface-border bg-white p-3.5 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
          />
        </label>

        <div>
          <Input label="Couleur de marque" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} hint="Code hexadécimal, ex. #2F6FED" />
          <span className="mt-2 inline-flex items-center gap-2">
            <span className="size-6 rounded-full border border-surface-border" style={{ backgroundColor: brandColor || '#E7EAF0' }} />
            <span className="text-xs text-text-tertiary">Aperçu</span>
          </span>
        </div>

        <Button type="submit" size="lg" fullWidth loading={saving}>
          Enregistrer les modifications
        </Button>
      </div>
    </form>
  )
}
