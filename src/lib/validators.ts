import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

export const funcionarioSchema = z.object({
  nome: z.string().min(3, "Nome completo é obrigatório"),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/, "CPF inválido"),
  rg: z.string().optional(),
  dataNascimento: z.string().optional(),
  telefone: z.string().min(10, "Telefone inválido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cargo: z.string().min(1, "Cargo é obrigatório"),
  categoria: z.string().min(1, "Categoria é obrigatória"),
  foto_url: z.string().optional(),
  observacoes: z.string().optional(),
});

export const enderecoSchema = z.object({
  cep: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  logradouro: z.string().min(3, "Endereço é obrigatório"),
  numero: z.string().min(1, "Número é obrigatório"),
  complemento: z.string().optional(),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  estado: z.string().length(2, "Estado (UF) inválido"),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const redeSocialSchema = z.object({
  plataforma: z.string().min(1, "Plataforma é obrigatória"),
  url: z.string().url("URL inválida"),
  handle: z.string().optional(),
});

export const statusRedeSchema = z.object({
  status: z.enum(["positivado", "negativado", "nao_avaliado", "rede_nao_encontrada"]),
  observacoes: z.string().optional(),
});

export const publicacaoSchema = z.object({
  url: z.string().url("URL inválida"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  status: z.string().min(1, "Status é obrigatório"),
  data_publicacao: z.string(),
  engajamento: z.number().optional(),
});

export const userSchema = z.object({
  email: z.string().email("E-mail inválido"),
  name: z.string().min(2, "Nome é obrigatório"),
  role: z.enum(["admin", "operator", "viewer"]),
});
