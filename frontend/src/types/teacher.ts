export type ModalityOption = 'online' | 'presencial'

export type Teacher = {
  id: string
  name: string
  initials: string
  subjects: string[]
  rating: number
  reviewCount: number
  modalities: ModalityOption[]
  pricePerHour: number
  verified: boolean
}
