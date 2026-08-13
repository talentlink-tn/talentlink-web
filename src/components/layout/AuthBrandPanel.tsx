import { Sparkles, Target, ShieldCheck } from 'lucide-react'
import { Logo } from './Logo'
import { WaveBackground } from '@/components/shared/WaveBackground'

const highlights = [
  { icon: Target, label: 'Des offres qui correspondent vraiment à votre profil' },
  { icon: Sparkles, label: 'Un matching IA entre candidats et entreprises' },
  { icon: ShieldCheck, label: 'Toute votre carrière centralisée, en toute confiance' },
]

// Desktop-only branded left panel for the auth flow (Onboarding, Login,
// Register) — these three pages live outside AppShell/RecruiterShell so
// they missed the earlier responsive pass. Below `lg` this renders
// nothing (`hidden`), leaving the existing mobile layout untouched.
export function AuthBrandPanel({ tagline }: { tagline?: string }) {
  return (
    <div className="relative hidden shrink-0 flex-col items-center justify-center overflow-hidden bg-ink-950 px-12 text-center lg:flex lg:w-[42%] xl:w-[38%]">
      <div className="z-10 flex flex-col items-center">
        <Logo size={96} withText={false} />
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight xl:text-5xl">
          <span className="text-white">Talent</span> <span className="text-brand-green-500">Link</span>
        </h1>
        <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">
          {tagline ?? 'Connecter les talents, construire l’avenir.'}
        </p>

        <div className="mt-10 flex flex-col items-start gap-4">
          {highlights.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-left">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-green-400">
                <Icon className="size-4" />
              </span>
              <span className="max-w-[220px] text-sm text-white/80">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <WaveBackground />
    </div>
  )
}
