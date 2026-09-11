export type TeachingModality = "online" | "presencial";

/** Whether the teacher gives private lessons or teaches at institutions */
export type TeachingModel = "particulares" | "instituicoes" | "";
export type ApiTeachingModel = "PARTICULARES" | "INSTITUICOES";

export type WeekDay = "seg" | "ter" | "qua" | "qui" | "sex" | "sab" | "dom";

/** Granular hourly slot from 07:00 to 22:00 (1-hour increments) */
export type HourSlot =
  | "07:00"
  | "08:00"
  | "09:00"
  | "10:00"
  | "11:00"
  | "12:00"
  | "13:00"
  | "14:00"
  | "15:00"
  | "16:00"
  | "17:00"
  | "18:00"
  | "19:00"
  | "20:00"
  | "21:00"
  | "22:00";

/** Shift-based slot for in-person (presencial) modality */
export type ShiftSlot = "matutino" | "vespertino" | "noturno";

/** Availability key format: "{weekDay}-{hourSlot|shiftSlot}" e.g. "seg-09:00" or "seg-matutino" */
export type AvailabilityKey =
  | `${WeekDay}-${HourSlot}`
  | `${WeekDay}-${ShiftSlot}`;

export interface TeacherAddress {
  cep: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface SubjectExperience {
  id: string;
  name: string;
  observation: string;
  level: "Iniciante" | "Intermediário" | "Avançado";
}

/** Internal form state – values are stored as formatted strings for UI masks */
export interface TeacherProfileFormData {
  avatarFile: File | null;
  avatarPreviewUrl: string | null;
  fullName: string;
  phone: string;
  bio: string;
  subjects: SubjectExperience[];
  /** 'particulares' | 'instituicoes' | '' (empty = not yet chosen) */
  teachingModel: TeachingModel;
  modality: TeachingModality;
  /** Formatted: "R$ 150,00" */
  pricePerHour: string;
  address: TeacherAddress;
  /** Set of AvailabilityKey strings e.g. new Set(["seg-09:00", "ter-14:00"]) */
  availability: Set<string>;
}

/** Flat validation errors map (top-level keys + "address.cep" style for nested) */
export type TeacherProfileErrors = Partial<{
  fullName: string;
  phone: string;
  bio: string;
  subjects: string;
  pricePerHour: string;
  cep: string;
}>;

export type ApiModality = "ONLINE" | "PRESENCIAL";

export interface TeacherProfilePayload {
  fullName: string;
  /** E.g. "(11) 98765-4321" */
  phone: string;
  bio: string;
  subjects: SubjectExperience[];
  /** Null when the teacher hasn't selected a teaching model yet */
  teachingModel: ApiTeachingModel | null;
  modality: ApiModality;
  /** Decimal value in BRL e.g. 150.0 */
  pricePerHour: number;
  address: {
    cep: string;
    street: string;
    neighborhood: string;
    city: string;
    /** Two-letter UF code e.g. "SP" */
    state: string;
  };
  /** Array of { day, time } — time is an HourSlot for online or a ShiftSlot for presencial */
  availability: Array<{ day: WeekDay; time: HourSlot | ShiftSlot }>;
}

export interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}
