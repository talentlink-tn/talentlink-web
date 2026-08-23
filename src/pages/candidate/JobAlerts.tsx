import { useEffect, useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Skeleton } from '@/components/ui/Skeleton'
import { ApiError } from '@/api/client'
import { getMyJobAlert, updateMyJobAlert, type JobAlertRaw } from '@/api/candidates'
import { useApp } from '@/context/AppContext'

export function JobAlerts() {
  const { showToast } = useApp()
  const [alert, setAlert] = useState<JobAlertRaw | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [useProfileMatching, setUseProfileMatching] = useState(true)
  const [minMatchScore, setMinMatchScore] = useState(75)
  const [keywords, setKeywords] = useState('')
  const [location, setLocation] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMyJobAlert()
      .then((a) => {
        setAlert(a)
        setIsActive(a.is_active)
        setUseProfileMatching(a.use_profile_matching)
        setMinMatchScore(a.min_match_score)
        setKeywords(a.keywords ?? '')
        setLocation(a.location ?? '')
        setSalaryMin(a.salary_min?.toString() ?? '')
        setSalaryMax(a.salary_max?.toString() ?? '')
      })
      .catch(() => showToast("Impossible de charger l'alerte emploi."))
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateMyJobAlert({
        is_active: isActive,
        use_profile_matching: useProfileMatching,
        min_match_score: minMatchScore,
        keywords: keywords.trim() || null,
        location: location.trim() || null,
        salary_min: salaryMin ? Number(salaryMin) : null,
        salary_max: salaryMax ? Number(salaryMax) : null,
      })
      setAlert(updated)
      showToast('Alerte emploi enregistrée !')
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible d'enregistrer l'alerte.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !alert) {
    return (
      <div className="px-4 pt-4 pb-8">
        <PageHeader title="Alertes emploi" />
        <div className="mt-6 space-y-3 rounded-2xl border border-surface-border bg-white p-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
        <div className="mt-4 space-y-3 rounded-2xl border border-surface-border bg-white p-4">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-4 pb-8">
      <PageHeader title="Alertes emploi" />
      <p className="mt-4 mb-4 text-sm text-text-secondary">
        Soyez notifié dès qu'une nouvelle offre correspond à votre profil ou à vos critères.
      </p>

      <div className="divide-y divide-surface-border overflow-hidden rounded-2xl border border-surface-border bg-white">
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex-1">
            <span className="block text-sm font-medium text-text-primary">Activer les alertes</span>
            <span className="block text-xs text-text-tertiary">Recevoir une notification pour les offres pertinentes</span>
          </span>
          <Switch checked={isActive} onChange={setIsActive} />
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5">
          <span className="flex-1">
            <span className="block text-sm font-medium text-text-primary">Basé sur mon profil</span>
            <span className="block text-xs text-text-tertiary">Utiliser le matching IA comme pour les recommandations</span>
          </span>
          <Switch checked={useProfileMatching} onChange={setUseProfileMatching} />
        </div>
        {useProfileMatching && (
          <div className="px-4 py-3.5">
            <span className="mb-1.5 block text-sm font-medium text-text-primary">
              Score de compatibilité minimum : {minMatchScore}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={minMatchScore}
              onChange={(e) => setMinMatchScore(Number(e.target.value))}
              className="w-full accent-brand-blue-600"
            />
          </div>
        )}
      </div>

      <h3 className="mt-6 mb-2 px-1 text-xs font-bold tracking-wide text-text-tertiary uppercase">
        Critères optionnels (pour affiner)
      </h3>
      <div className="space-y-3 rounded-2xl border border-surface-border bg-white p-4">
        <Input
          label="Mots-clés"
          placeholder="Ex. React, remote, senior…"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
        />
        <Input
          label="Localisation"
          placeholder="Ex. Tunis"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Salaire min (TND)"
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
          />
          <Input
            label="Salaire max (TND)"
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
          />
        </div>
      </div>

      <Button fullWidth size="lg" className="mt-6" loading={saving} onClick={handleSave}>
        Enregistrer
      </Button>
    </div>
  )
}
