import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: ReactNode
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, error, hint, type = 'text', id, ...props }, ref) => {
    const [show, setShow] = useState(false)
    const isPassword = type === 'password'
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <label className="block" htmlFor={inputId}>
        {label && <span className="mb-1.5 block text-sm font-medium text-text-primary">{label}</span>}
        <span className="relative flex items-center">
          {icon && <span className="pointer-events-none absolute left-3.5 text-text-tertiary">{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            type={isPassword ? (show ? 'text' : 'password') : type}
            className={cn(
              'h-12 w-full rounded-xl border bg-white text-[15px] text-text-primary placeholder:text-text-tertiary',
              'transition-all duration-150 focus:border-brand-blue-500 focus:ring-4 focus:ring-brand-blue-500/10 focus:outline-none',
              icon ? 'pl-11' : 'pl-4',
              isPassword ? 'pr-11' : 'pr-4',
              error ? 'border-red-300' : 'border-surface-border',
              className,
            )}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3.5 text-text-tertiary hover:text-text-secondary"
              tabIndex={-1}
              aria-label={show ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          )}
        </span>
        {error && <span className="mt-1.5 block text-xs font-medium text-red-600">{error}</span>}
        {hint && !error && <span className="mt-1.5 block text-xs text-text-tertiary">{hint}</span>}
      </label>
    )
  },
)
Input.displayName = 'Input'
