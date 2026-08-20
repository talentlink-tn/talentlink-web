import { useEffect, useState } from 'react'
import { Plus, Pencil, ShieldCheck } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Input'
import { Switch } from '@/components/ui/Switch'
import { Avatar } from '@/components/ui/Avatar'
import { useApp } from '@/context/AppContext'
import { ApiError, getAuthToken } from '@/api/client'
import { listMyTeam, inviteTeamMember, updateTeamMember, type TeamMemberRaw } from '@/api/companies'

const roleOptions: { value: string; label: string }[] = [
  { value: 'admin', label: 'Administrateur' },
  { value: 'member', label: 'Membre' },
]

function roleLabel(roleName: string | null): string {
  return roleOptions.find((r) => r.value === roleName)?.label ?? (roleName || 'Membre')
}

export function Team() {
  const { showToast } = useApp()
  const myEmail = getAuthToken()?.email

  const [members, setMembers] = useState<TeamMemberRaw[]>([])
  const [loading, setLoading] = useState(true)

  const [addOpen, setAddOpen] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [roleName, setRoleName] = useState('member')
  const [inviting, setInviting] = useState(false)

  const [editing, setEditing] = useState<TeamMemberRaw | null>(null)
  const [editRole, setEditRole] = useState('member')
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)

  const load = () => {
    setLoading(true)
    listMyTeam()
      .then(setMembers)
      .catch(() => showToast("Impossible de charger l'équipe."))
      .finally(() => setLoading(false))
  }

  useEffect(load, []) // eslint-disable-line react-hooks/exhaustive-deps

  const me = members.find((m) => m.email === myEmail)
  const isAdmin = me?.role_name === 'admin'

  const openAdd = () => {
    setFullName('')
    setEmail('')
    setPassword('')
    setRoleName('member')
    setAddOpen(true)
  }

  const handleInvite = async () => {
    if (!fullName.trim() || !email.trim() || password.length < 8) {
      showToast('Veuillez indiquer un nom, un email et un mot de passe (8 caractères min).')
      return
    }
    setInviting(true)
    try {
      await inviteTeamMember({ email: email.trim(), password, fullName: fullName.trim(), roleName })
      showToast('Membre ajouté avec succès !')
      setAddOpen(false)
      load()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : "Impossible d'ajouter ce membre.")
    } finally {
      setInviting(false)
    }
  }

  const openEdit = (member: TeamMemberRaw) => {
    setEditing(member)
    setEditRole(member.role_name ?? 'member')
    setEditActive(member.is_active)
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await updateTeamMember(editing.id, { role_name: editRole, is_active: editActive })
      showToast('Membre mis à jour.')
      setEditing(null)
      load()
    } catch (error) {
      showToast(error instanceof ApiError ? error.message : 'Impossible de mettre à jour ce membre.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-text-primary">Gestion d'équipe</h1>
          <p className="text-sm text-text-secondary">{loading ? 'Chargement…' : `${members.length} membre${members.length === 1 ? '' : 's'}`}</p>
        </div>
        {isAdmin && (
          <Button onClick={openAdd}>
            <Plus className="size-[18px]" />
            Ajouter
          </Button>
        )}
      </div>

      {!loading && !isAdmin && (
        <p className="mt-4 rounded-2xl border border-surface-border bg-surface-muted p-3.5 text-sm text-text-secondary">
          Seuls les administrateurs de l'entreprise peuvent ajouter ou modifier des membres.
        </p>
      )}

      <div className="mt-6 space-y-3">
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 rounded-2xl border border-surface-border bg-white p-4">
            <Avatar name={m.full_name} size={44} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-bold text-text-primary">{m.full_name}</p>
                {m.email === myEmail && <span className="shrink-0 text-[11px] font-semibold text-brand-blue-600">(vous)</span>}
              </div>
              <p className="truncate text-xs text-text-secondary">{m.email}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge tone={m.role_name === 'admin' ? 'blue' : 'gray'}>
                {m.role_name === 'admin' && <ShieldCheck className="mr-1 inline size-3" />}
                {roleLabel(m.role_name)}
              </Badge>
              <Badge tone={m.is_active ? 'green' : 'red'}>{m.is_active ? 'Actif' : 'Inactif'}</Badge>
              {isAdmin && (
                <button
                  onClick={() => openEdit(m)}
                  className="flex size-8 items-center justify-center rounded-lg border border-surface-border text-text-secondary hover:bg-surface-muted"
                  title="Modifier"
                >
                  <Pencil className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Sheet open={addOpen} onClose={() => setAddOpen(false)} title="Ajouter un membre">
        <div className="space-y-4">
          <Input label="Nom complet" placeholder="Ex. Amira Ben Salah" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Adresse e-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input label="Mot de passe" type="password" hint="8 caractères minimum" value={password} onChange={(e) => setPassword(e.target.value)} />
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text-primary">Rôle</span>
            <select
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <Button fullWidth onClick={handleInvite} loading={inviting}>
            Ajouter ce membre
          </Button>
        </div>
      </Sheet>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title={editing ? `Modifier ${editing.full_name}` : undefined}>
        {editing && (
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-primary">Rôle</span>
              <select
                value={editRole}
                onChange={(e) => setEditRole(e.target.value)}
                className="h-11 w-full rounded-xl border border-surface-border bg-white px-3 text-sm focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none"
              >
                {roleOptions.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center justify-between rounded-xl border border-surface-border bg-white p-3.5">
              <span className="text-sm font-medium text-text-primary">Compte actif</span>
              <Switch
                checked={editActive}
                onChange={editing.email === myEmail ? () => {} : setEditActive}
                className={editing.email === myEmail ? 'cursor-not-allowed opacity-50' : undefined}
              />
            </div>
            {editing.email === myEmail && (
              <p className="text-xs text-text-tertiary">Vous ne pouvez pas désactiver votre propre compte.</p>
            )}
            <Button fullWidth onClick={handleSaveEdit} loading={saving}>
              Enregistrer
            </Button>
          </div>
        )}
      </Sheet>
    </div>
  )
}
