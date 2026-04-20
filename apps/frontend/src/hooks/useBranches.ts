'use client'
import { useQuery, type UseQueryOptions } from '@tanstack/react-query'
import { branchService } from '@/services/branch.service'
import type { PaginatedResponse } from '@/types/common.types'
import type { Branch } from '@/types/branch.types'

type BranchQueryOptions = Omit<UseQueryOptions<PaginatedResponse<Branch>>, 'queryKey' | 'queryFn'>

export const useBranches = (options?: BranchQueryOptions) => {
  return useQuery({
    queryKey: ['branches'],
    queryFn: () => branchService.getBranches({ page: 1, limit: 100 }),
    ...options,
  })
}
