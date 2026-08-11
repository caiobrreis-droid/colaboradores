import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCPF(cpf: string) {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatPhone(phone: string) {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

export function formatDate(date: string | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: string | Date) {
  const d = new Date(date);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "positivado":
      return "text-vessel-green bg-vessel-green/10";
    case "negativado":
      return "text-red-600 bg-red-100";
    case "nao_avaliado":
      return "text-amber-700 bg-amber-100";
    case "rede_nao_encontrada":
      return "text-violet-700 bg-violet-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}

export function getStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "positivado":
      return "Positivado";
    case "negativado":
      return "Negativado";
    case "nao_avaliado":
      return "Parcial";
    case "rede_nao_encontrada":
      return "Rede não encontrada";
    default:
      return capitalize(status);
  }
}

export function getStatusIcon(status: string) {
  // Can be mapped to specific icon names or components depending on the icon library
  switch (status.toLowerCase()) {
    case "positivado":
      return "check-circle";
    case "negativado":
      return "x-circle";
    case "nao_avaliado":
      return "help-circle";
    case "rede_nao_encontrada":
      return "search-x";
    default:
      return "circle";
  }
}

export function capitalize(str: string) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
