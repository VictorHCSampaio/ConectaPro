import { api } from "@/lib/api";
import type { Teacher } from "@/types/teacher";

export async function listarProfessores(): Promise<Teacher[]> {
  const { data } = await api.get<Teacher[]>("/professores");
  return data;
}

export async function buscarProfessor(id: string): Promise<Teacher> {
  const { data } = await api.get<Teacher>(`/professores/${id}`);
  return data;
}
