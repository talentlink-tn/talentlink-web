import { useLocation } from 'react-router-dom'

export function useBasePath() {
  const location = useLocation()
  return location.pathname.startsWith('/recruiter') ? '/recruiter' : '/app'
}
