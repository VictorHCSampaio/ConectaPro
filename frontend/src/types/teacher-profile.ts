export type TeachingModality = 'online' | 'presencial'

export type TeachingModel = 'particulares' | 'instituicoes' | ''
export type ApiTeachingModel = 'PARTICULARES' | 'INSTITUICOES'

export type WeekDay = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

export type HourSlot =
  | '07:00'
  | '08:00'
  | '09:00'
  | '10:00'
  | '11:00'
  | '12:00'
  | '13:00'
  | '14:00'
  | '15:00'
  | '16:00'
  | '17:00'
  | '18:00'
  | '19:00'
  | '20:00'
  | '21:00'
  | '22:00'

export type ShiftSlot = 'matutino' | 'vespertino' | 'noturno'

export type AvailabilityKey = `${WeekDay}-${HourSlot}` | `${WeekDay}-${ShiftSlot}`

export type TeacherAddress = {
  cep: string
  logradouro: string
  bairro: string
  cidade: string
  estado: string
}

export type SubjectExperience = {
  id: string
  name: string
  observation: string
  level: 'Iniciante' | 'Intermediário' | 'Avançado'
}

export type TeacherProfileFormData = {
  avatarFile: File | null
  avatarPreviewUrl: string | null
  fullName: string
  phone: string
  bio: string
  subjects: SubjectExperience[]
  teachingModel: TeachingModel
  modality: TeachingModality
  pricePerHour: string
  address: TeacherAddress
  availability: Set<string>
}

export type TeacherProfileErrors = Partial<{
  fullName: string
  phone: string
  bio: string
  subjects: string
  pricePerHour: string
  cep: string
}>

export type ApiModality = 'ONLINE' | 'PRESENCIAL'

export type TeacherProfilePayload = {
  fullName: string
  phone: string
  bio: string
  subjects: SubjectExperience[]
  teachingModel: ApiTeachingModel | null
  modality: ApiModality
  pricePerHour: number
  address: {
    cep: string
    street: string
    neighborhood: string
    city: string
    state: string
  }
  availability: Array<{ day: WeekDay; time: HourSlot | ShiftSlot }>
}

export type EnderecoCep = {
  cep: string
  street: string
  neighborhood: string
  city: string
  state: string
}
