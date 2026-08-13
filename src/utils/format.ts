export function formatSalary(min: number, max: number) {
  return `${min.toLocaleString('fr-FR')} - ${max.toLocaleString('fr-FR')} TND / mois`
}

export function modeTone(mode: string) {
  if (mode === 'Hybride') return 'blue' as const
  if (mode === 'Télétravail') return 'purple' as const
  return 'green' as const
}
