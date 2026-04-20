'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingBag, ChevronRight, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { registerSchema, type RegisterFormData } from '@/validations/auth.schema'
import { useRegister } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BUSINESS_TYPES } from '@/lib/constants'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const { mutate: register, isPending } = useRegister()
  const form = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) })
  const { register: reg, handleSubmit, formState: { errors }, trigger } = form

  const nextStep = async () => {
    const valid = await trigger(['businessName', 'businessType'])
    if (valid) setStep(2)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-600 p-3 rounded-xl">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>Step {step} of 2 — {step === 1 ? 'Business Info' : 'Account Setup'}</CardDescription>
          <div className="flex gap-2 mt-3">
            {[1,2].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />)}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit((d) => register(d))} className="space-y-4">
            {step === 1 && (
              <>
                <div className="space-y-2">
                  <Label>Business Name</Label>
                  <Input placeholder="My Business" {...reg('businessName')} />
                  {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Business Type</Label>
                  <select {...reg('businessType')} className="flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1 text-sm">
                    <option value="">Select type...</option>
                    {BUSINESS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  {errors.businessType && <p className="text-xs text-red-500">{errors.businessType.message}</p>}
                </div>
                <Button type="button" className="w-full" onClick={nextStep}>
                  Continue <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
            {step === 2 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Owner Name</Label>
                    <Input placeholder="John Doe" {...reg('ownerName')} />
                    {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="+1234567890" {...reg('phone')} />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@company.com" {...reg('email')} />
                  {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" placeholder="Min 8 characters" {...reg('password')} />
                  {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Confirm Password</Label>
                  <Input type="password" placeholder="Repeat password" {...reg('confirmPassword')} />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" {...reg('agreeToTerms')} className="rounded" />
                  <span className="text-gray-600">I agree to the <Link href="#" className="text-blue-600">Terms of Service</Link></span>
                </label>
                {errors.agreeToTerms && <p className="text-xs text-red-500">{errors.agreeToTerms.message}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(1)}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button type="submit" className="flex-1" disabled={isPending}>{isPending ? 'Creating...' : 'Create Account'}</Button>
                </div>
              </>
            )}
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            Already have an account? <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
