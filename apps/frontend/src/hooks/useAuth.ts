'use client'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'
import type { LoginRequest, RegisterRequest } from '@/types/auth.types'

export function useLogin() {
  const { login } = useAuthStore()
  const router = useRouter()
  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      login(data)
      toast.success('Welcome back!')
      router.push('/dashboard')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || 'Invalid credentials')
    },
  })
}

export function useRegister() {
  const { login } = useAuthStore()
  const router = useRouter()
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      login(data)
      toast.success('Account created successfully!')
      router.push('/onboarding')
    },
    onError: (error: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(error?.response?.data?.message || 'Registration failed')
    },
  })
}

export function useLogout() {
  const { logout } = useAuthStore()
  const router = useRouter()
  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout()
      router.push('/login')
    },
  })
}

export function useProfile() {
  const { isAuthenticated } = useAuthStore()
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => authService.getProfile(),
    enabled: isAuthenticated,
  })
}
