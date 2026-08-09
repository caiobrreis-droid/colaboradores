'use client'

import { FuncionarioCompleto } from "@/types"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "./status-badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Edit, Eye, Instagram, Trash2, CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { CATEGORIA_COLABORADOR_LABELS } from "@/lib/constants"

interface EmployeeCardProps {
  employee: FuncionarioCompleto;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'positivado' | 'negativado' | 'nao_avaliado') => void;
}

export function EmployeeCard({ employee, onView, onEdit, onDelete, onStatusChange }: EmployeeCardProps) {
  const { nome, cargo, categoria, foto_url, redes_sociais, endereco, telefone, status_redes } = employee;
  const status = status_redes?.[0]?.status || 'nao_avaliado';
  const instagram = redes_sociais?.find(r => r.rede_social === 'Instagram')?.username;

  return (
    <div className="bg-white rounded-lg border border-vessel-gray-100 shadow-sm p-4 space-y-4">
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={foto_url} alt={nome} />
          <AvatarFallback className="bg-vessel-gray-100 text-vessel-blue font-semibold">
            {nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-vessel-deep truncate">{nome}</h3>
          <p className="text-sm text-muted-foreground truncate">{cargo}</p>
          <Badge variant="outline" className="mt-2 border-blue-100 bg-blue-50 text-[10px] text-blue-700">
            {CATEGORIA_COLABORADOR_LABELS[categoria] || 'Não informada'}
          </Badge>
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <span>{endereco?.bairro || 'Sem bairro'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4" />
          <span>{telefone || 'Sem telefone'}</span>
        </div>
        {instagram && (
          <div className="flex items-center gap-2 text-vessel-blue">
            <Instagram className="h-4 w-4" />
            <span>{instagram}</span>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t pt-3">
        <div className="flex items-center justify-between gap-2">
          <StatusBadge status={status as any} />
          <div className="flex gap-1" aria-label="Alterar status das postagens">
            <Button title="Positivar" variant="ghost" size="icon" onClick={() => onStatusChange(employee.id, 'positivado')} className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"><CheckCircle2 className="h-4 w-4" /></Button>
            <Button title="Despositivar" variant="ghost" size="icon" onClick={() => onStatusChange(employee.id, 'negativado')} className="text-red-600 hover:bg-red-50 hover:text-red-700"><XCircle className="h-4 w-4" /></Button>
            <Button title="Deixar neutro" variant="ghost" size="icon" onClick={() => onStatusChange(employee.id, 'nao_avaliado')} className="text-slate-500 hover:bg-slate-100"><MinusCircle className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => onView(employee.id)}>
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onEdit(employee.id)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(employee.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
