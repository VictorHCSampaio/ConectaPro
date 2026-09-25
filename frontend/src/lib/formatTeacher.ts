import type { Teacher } from '@/types/teacher'

export function formatRating(rating: number) {
  return rating.toFixed(1).replace('.', ',')
}

export function formatModalities(modalities: Teacher['modalities']) {
  if (modalities.includes('online') && modalities.includes('presencial')) {
    return 'Online e presencial'
  }
  return modalities.includes('online') ? 'Somente online' : 'Somente presencial'
}
