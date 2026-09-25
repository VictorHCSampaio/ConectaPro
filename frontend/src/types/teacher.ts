export type ModalityOption = 'online' | 'presencial'
export type ModalityFilter = ModalityOption | 'todas'

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
  bio?: string
  availability?: string[]
  weekDays?: string[]
}
