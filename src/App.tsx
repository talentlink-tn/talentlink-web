import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from '@/context/AppContext'
import { Toast } from '@/components/ui/Toast'
import { AppShell } from '@/layouts/AppShell'
import { RecruiterShell } from '@/layouts/RecruiterShell'

import { Splash } from '@/pages/auth/Splash'
import { Onboarding } from '@/pages/auth/Onboarding'
import { Login } from '@/pages/auth/Login'
import { Register } from '@/pages/auth/Register'
import { ChooseProfile } from '@/pages/auth/ChooseProfile'

import { Dashboard } from '@/pages/candidate/Dashboard'
import { EmployeeDashboard } from '@/pages/employee/EmployeeDashboard'
import { JobSearch } from '@/pages/candidate/JobSearch'
import { JobDetail } from '@/pages/candidate/JobDetail'
import { Applications } from '@/pages/candidate/Applications'
import { ApplicationDetail } from '@/pages/candidate/ApplicationDetail'
import { InterviewDetail } from '@/pages/candidate/InterviewDetail'
import { Favorites } from '@/pages/candidate/Favorites'
import { AdvancedSearch } from '@/pages/candidate/AdvancedSearch'
import { CompanyProfile } from '@/pages/candidate/CompanyProfile'
import { Calendar } from '@/pages/candidate/Calendar'

import { Messages } from '@/pages/shared/Messages'
import { Conversation } from '@/pages/shared/Conversation'
import { Notifications } from '@/pages/shared/Notifications'
import { Profile } from '@/pages/shared/Profile'
import { ProfileEdit } from '@/pages/shared/ProfileEdit'
import { MyCV } from '@/pages/shared/MyCV'
import { Settings } from '@/pages/shared/Settings'
import { Help } from '@/pages/shared/Help'

import { LeaveManagement } from '@/pages/employee/LeaveManagement'
import { TimeClock } from '@/pages/employee/TimeClock'
import { EmployeeDocuments } from '@/pages/employee/EmployeeDocuments'

import { RecruiterDashboard } from '@/pages/recruiter/RecruiterDashboard'
import { JobsManagement } from '@/pages/recruiter/JobsManagement'
import { CandidatesPipeline } from '@/pages/recruiter/CandidatesPipeline'
import { Statistics } from '@/pages/recruiter/Statistics'

import { CareerPage } from '@/pages/public/CareerPage'
import { PublicJobDetail } from '@/pages/public/PublicJobDetail'

import { AdminShell } from '@/layouts/AdminShell'
import { AdminLogin } from '@/pages/admin/AdminLogin'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { AdminCompanies } from '@/pages/admin/AdminCompanies'
import { AdminJobOffers } from '@/pages/admin/AdminJobOffers'

function HomeDashboard() {
  const { profileType } = useApp()
  return profileType === 'employee' ? <EmployeeDashboard /> : <Dashboard />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/choose-profile" element={<ChooseProfile />} />

      {/* Public, unauthenticated career pages — no AppShell/RecruiterShell
          chrome, module 5's backend endpoints had no frontend consumer
          before this. */}
      <Route path="/careers/:companySlug" element={<CareerPage />} />
      <Route path="/jobs/:publicSlug" element={<PublicJobDetail />} />

      <Route path="/app" element={<AppShell />}>
        <Route index element={<HomeDashboard />} />
        <Route path="jobs" element={<JobSearch />} />
        <Route path="jobs/:jobId" element={<JobDetail />} />
        <Route path="applications" element={<Applications />} />
        <Route path="applications/:applicationId" element={<ApplicationDetail />} />
        <Route path="applications/:applicationId/interview" element={<InterviewDetail />} />
        <Route path="favorites" element={<Favorites />} />
        <Route path="search" element={<AdvancedSearch />} />
        <Route path="companies/:companyId" element={<CompanyProfile />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:conversationId" element={<Conversation />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="profile/edit" element={<ProfileEdit />} />
        <Route path="profile/cv" element={<MyCV />} />
        <Route path="settings" element={<Settings />} />
        <Route path="help" element={<Help />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="clock" element={<TimeClock />} />
        <Route path="documents" element={<EmployeeDocuments />} />
      </Route>

      <Route path="/recruiter" element={<RecruiterShell />}>
        <Route index element={<RecruiterDashboard />} />
        <Route path="jobs" element={<JobsManagement />} />
        <Route path="candidates" element={<CandidatesPipeline />} />
        <Route path="statistics" element={<Statistics />} />
        <Route path="messages" element={<Messages />} />
        <Route path="messages/:conversationId" element={<Conversation />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Deliberately unlisted — not a tab on the public Login.tsx, no
          link to it anywhere a normal visitor would see. See
          AdminShell.tsx / AdminLogin.tsx for the rest of the reasoning. */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<AdminDashboard />} />
        <Route path="companies" element={<AdminCompanies />} />
        <Route path="job-offers" element={<AdminJobOffers />} />
      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toast />
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
