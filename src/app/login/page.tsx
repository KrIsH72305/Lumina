import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent inline-block pb-1">Lumina</h1>
          <p className="mt-2 text-sm text-gray-600">Internal Goal Setting & Tracking</p>
        </div>
        <LoginForm />
        <div className="mt-8 text-center text-xs text-gray-500">
          <p className="font-semibold mb-1">Demo Accounts:</p>
          <p>employee@lumina.com | manager@lumina.com | admin@lumina.com</p>
          <p className="mt-1">Password for all: <span className="font-mono">Demo@1234</span></p>
        </div>
      </div>
    </div>
  )
}
