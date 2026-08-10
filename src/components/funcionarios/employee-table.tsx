'use client'

import { FuncionarioCompleto } from "@/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { StatusBadge } from "./status-badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Instagram, Map, History, Printer, ChevronLeft, ChevronRight, ArrowUpDown, Trash2, CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { CATEGORIA_COLABORADOR_LABELS } from "@/lib/constants"

interface EmployeeTableProps {
  data: FuncionarioCompleto[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: 'positivado' | 'negativado' | 'nao_avaliado') => void;
}

export function EmployeeTable({ data, onView, onEdit, onDelete, onStatusChange }: EmployeeTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const currentData = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-vessel-gray-50/50">
              <TableHead className="w-[80px]">Foto</TableHead>
              <TableHead>
                <Button variant="ghost" className="h-8 p-0 font-medium hover:bg-transparent">
                  Nome <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Bairro</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Indicação</TableHead>
              <TableHead>Instagram</TableHead>
              <TableHead>Situação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((employee) => {
                const status = employee.status_redes?.[0]?.status || 'nao_avaliado';
                const instagram = employee.redes_sociais?.find(r => r.rede_social === 'Instagram')?.username;

                return (
                  <TableRow key={employee.id} className="hover:bg-vessel-gray-50/50 transition-colors">
                    <TableCell>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={employee.foto_url} alt={employee.nome} />
                        <AvatarFallback className="bg-vessel-gray-100 text-vessel-blue text-xs font-semibold">
                          {employee.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-vessel-deep">{employee.nome}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.cargo}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="whitespace-nowrap border-blue-100 bg-blue-50 text-blue-700">
                        {CATEGORIA_COLABORADOR_LABELS[employee.categoria] || 'Não informada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{employee.endereco?.bairro || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.telefone || '-'}</TableCell>
                    <TableCell className="text-muted-foreground">{employee.indicacao || '-'}</TableCell>
                    <TableCell>
                      {instagram ? (
                        <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-vessel-blue hover:underline inline-flex items-center">
                          {instagram}
                        </a>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={status as any} />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onView(employee.id)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(employee.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>Status das postagens</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onStatusChange(employee.id, 'positivado')} className="text-emerald-700 focus:text-emerald-700">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Positivar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(employee.id, 'negativado')} className="text-red-600 focus:text-red-700">
                            <XCircle className="mr-2 h-4 w-4" />
                            Despositivar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(employee.id, 'nao_avaliado')}>
                            <MinusCircle className="mr-2 h-4 w-4" />
                            Deixar neutro
                          </DropdownMenuItem>
                          {instagram && (
                            <DropdownMenuItem asChild>
                              <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                                <Instagram className="mr-2 h-4 w-4" />
                                Abrir Instagram
                              </a>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <Map className="mr-2 h-4 w-4" />
                            Ver no mapa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <History className="mr-2 h-4 w-4" />
                            Histórico
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Printer className="mr-2 h-4 w-4" />
                            Imprimir
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onDelete(employee.id)} className="text-red-600 focus:text-red-700">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir colaborador
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-sm text-muted-foreground">
          Mostrando {Math.min(currentData.length, itemsPerPage)} de {data.length} resultados
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>
          <div className="text-sm font-medium">
            Página {currentPage} de {totalPages || 1}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Próxima
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
