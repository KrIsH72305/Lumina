import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/50 p-6 selection:bg-indigo-100 selection:text-indigo-900">
      <LoginForm />
    </div>
  )
}
