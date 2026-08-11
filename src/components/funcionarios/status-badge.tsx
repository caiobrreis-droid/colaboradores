import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, MinusCircle, SearchX } from "lucide-react";

interface StatusBadgeProps {
  status: 'positivado' | 'negativado' | 'nao_avaliado' | 'rede_nao_encontrada' | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = String(status || '').toLowerCase();

  if (normalized.includes('rede_nao_encontrada') || normalized.includes('rede não encontrada')) {
    return (
      <Badge variant="secondary" className={cn("bg-violet-600 text-white hover:bg-violet-700 border-transparent", className)}>
        <SearchX className="w-3 h-3 mr-1" />
        REDE NÃO ENCONTRADA
      </Badge>
    );
  }

  if (normalized.includes('pos')) {
    return (
      <Badge variant="success" className={cn("bg-vessel-green text-white hover:bg-vessel-green/90 border-transparent", className)}>
        <CheckCircle2 className="w-3 h-3 mr-1" />
        POSITIVADO
      </Badge>
    );
  }

  if (normalized.includes('neg')) {
    return (
      <Badge variant="destructive" className={cn(className)}>
        <XCircle className="w-3 h-3 mr-1" />
        NEGATIVADO
      </Badge>
    );
  }

  return (
    <Badge variant="warning" className={cn("bg-amber-500 hover:bg-amber-600 text-white border-transparent", className)}>
      <MinusCircle className="w-3 h-3 mr-1" />
      PARCIAL
    </Badge>
  );
}
