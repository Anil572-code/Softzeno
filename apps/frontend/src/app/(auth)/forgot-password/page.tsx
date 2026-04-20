'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ShoppingBag, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/validations/auth.schema'
import { authService } from '@/services/auth.service'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  })
  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await authService.forgotPassword(data.email)
      setSent(true)
    } catch {
      toast.error('Failed to send reset email')
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="bg-blue-600 p-3 rounded-xl"><ShoppingBag className="h-8 w-8 text-white" /></div>
          </div>
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>Enter your email to receive a reset link</CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <div className="text-green-600 font-medium">Check your email for the reset link!</div>
              <Link href="/login"><Button variant="outline" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" />Back to Login</Button></Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input type="email" placeholder="you@company.com" {...register('email')} />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Sending...' : 'Send Reset Link'}</Button>
              <Link href="/login"><Button variant="ghost" className="w-full"><ArrowLeft className="h-4 w-4 mr-2" />Back to Login</Button></Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
