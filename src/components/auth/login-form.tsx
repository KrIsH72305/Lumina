'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
})

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState('employee')

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Auto-fill based on role for demo convenience
  const handleRoleChange = (newRole: string) => {
    setRole(newRole)
    form.setValue('email', `${newRole}@lumina.com`)
    form.setValue('password', 'Demo@1234')
  }

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid credentials')
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-[450px] border-slate-200 shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden bg-white">
      <CardContent className="p-10 space-y-8">
        {/* Branding */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center overflow-hidden p-1.5">
               <Image src="/logo.png" alt="Lumina" width={48} height={48} className="object-contain" />
             </div>
             <h1 className="text-4xl font-heading font-black text-slate-900 tracking-tight">Lumina</h1>
          </div>
          <p className="text-slate-500 font-medium text-sm">
            Enter your email and password to access your dashboard.
          </p>
        </div>

        {/* Role Switcher */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Login as</label>
          <Tabs defaultValue="employee" onValueChange={handleRoleChange} className="w-full">
            <TabsList className="w-full bg-slate-50/50 p-1 h-12 rounded-2xl border border-slate-100">
              <TabsTrigger value="employee" className="flex-1 rounded-xl font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Employee</TabsTrigger>
              <TabsTrigger value="manager" className="flex-1 rounded-xl font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Manager</TabsTrigger>
              <TabsTrigger value="admin" className="flex-1 rounded-xl font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">Admin</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-black text-slate-400 uppercase tracking-widest">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@lumina.com" 
                        {...field} 
                        className="h-12 bg-slate-50/30 border-slate-200 rounded-xl focus:ring-slate-900 focus:border-slate-900 font-medium px-4"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-black text-slate-400 uppercase tracking-widest">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="h-12 bg-slate-50/30 border-slate-200 rounded-xl focus:ring-slate-900 focus:border-slate-900 font-medium px-4"
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-bold" />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <Button 
              className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-sm shadow-lg shadow-slate-200 transition-all active:scale-[0.98]" 
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Sign in'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
