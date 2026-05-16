'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'

const goalSchema = z.object({
  title: z.string().min(5, { message: 'Title must be at least 5 characters' }),
  description: z.string().optional(),
  thrustArea: z.string().min(1, { message: 'Please select a thrust area' }),
  uomType: z.string().min(1, { message: 'Please select a unit of measurement type' }),
  target: z.coerce.number().min(0, { message: 'Target must be positive' }),
  weightage: z.coerce.number().min(10, { message: 'Weightage must be at least 10%' }).max(100),
})

const THRUST_AREAS = ['Sales', 'Operations', 'HR', 'Finance', 'Technology', 'Customer Success']
const UOM_TYPES = [
  { value: 'NUMERIC_MAX', label: 'Maximize (e.g. Revenue, > is better)' },
  { value: 'NUMERIC_MIN', label: 'Minimize (e.g. Cost, TAT, < is better)' },
  { value: 'TIMELINE', label: 'Timeline (Date based)' },
  { value: 'ZERO', label: 'Zero (e.g. Safety Incidents)' },
]

export function GoalForm({ currentWeightage, initialData }: { currentWeightage: number, initialData?: any }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description || '',
      thrustArea: initialData.thrustArea,
      uomType: initialData.uomType,
      target: initialData.target,
      weightage: initialData.weightage,
    } : {
      title: '',
      description: '',
      thrustArea: '',
      uomType: '',
      target: 0,
      weightage: 10,
    },
  })

  const watchWeightage = form.watch('weightage', 10)
  const remainingWeightage = 100 - currentWeightage - (Number(watchWeightage) || 0)

  async function onSubmit(values: z.infer<typeof goalSchema>) {
    if (currentWeightage + values.weightage > 100) {
      form.setError('weightage', { message: `Total weightage cannot exceed 100%. You have ${100 - currentWeightage}% left.` })
      return
    }

    setIsLoading(true)

    try {
      const url = initialData ? `/api/goals?id=${initialData.id}` : '/api/goals'
      const method = initialData ? 'PATCH' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to save goal')
      }

      toast.success(initialData ? 'Goal updated successfully' : 'Goal created successfully')
      router.push('/employee/goals')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const isShared = initialData?.isShared

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Increase Q2 Sales by 20%" {...field} disabled={isShared} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="thrustArea"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thrust Area</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isShared}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an area" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {THRUST_AREAS.map((area) => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="uomType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Measurement Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isShared}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {UOM_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Value</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" {...field} disabled={isShared} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weightage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weightage (%)</FormLabel>
                        <FormControl>
                          <Input type="number" min="10" max="100" {...field} />
                        </FormControl>
                        <FormDescription>Minimum 10%</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Details about this goal..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading || remainingWeightage < 0}>
                    {isLoading ? 'Saving...' : 'Save Goal'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      
      <div className="md:col-span-1">
        <Card className="shadow-sm border-gray-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Weightage Tracker</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Used (Existing)</span>
                  <span className="font-medium text-gray-900">{currentWeightage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-gray-400 h-2 rounded-full" style={{ width: `${currentWeightage}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Current Draft</span>
                  <span className="font-medium text-blue-600">{watchWeightage || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(100, Number(watchWeightage) || 0)}%` }}></div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Remaining</span>
                  <span className={remainingWeightage < 0 ? 'text-red-600' : 'text-green-600'}>
                    {remainingWeightage}%
                  </span>
                </div>
                {remainingWeightage < 0 && (
                  <p className="text-xs text-red-600 mt-1">Exceeds 100% total.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
