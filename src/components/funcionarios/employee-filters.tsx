'use client'

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, SlidersHorizontal, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCategories } from "@/hooks/use-categories"
import { BAIRROS_BOA_VISTA, CARGO_OPTIONS } from "@/lib/constants"
import { useState } from "react"
import { cn } from "@/lib/utils"

export interface EmployeeFiltersState {
  search: string;
  categoria: string;
  bairro: string;
  cargo: string;
  situacao: string;
  positivacao: string;
  instagram: string;
}

interface EmployeeFiltersProps {
  filters: EmployeeFiltersState;
  onFilterChange: (filters: EmployeeFiltersState) => void;
}

export function EmployeeFilters({ filters, onFilterChange }: EmployeeFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { categories } = useCategories()

  const updateFilter = (key: keyof EmployeeFiltersState, value: string) => {
    onFilterChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFilterChange({
      search: '',
      categoria: 'all',
      bairro: 'all',
      cargo: 'all',
      situacao: 'all',
      positivacao: 'all',
      instagram: 'all'
    })
  }

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg border border-vessel-gray-100 shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="sm:w-auto w-full flex items-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <div className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 pt-4 border-t", showAdvanced ? "block" : "hidden md:grid")}>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Categoria</label>
          <Select value={filters.categoria} onValueChange={(v) => updateFilter('categoria', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.slug} value={category.slug}>{category.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Bairro</label>
          <Select value={filters.bairro} onValueChange={(v) => updateFilter('bairro', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os bairros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os bairros</SelectItem>
              {BAIRROS_BOA_VISTA?.map(bairro => (
                <SelectItem key={bairro} value={bairro}>{bairro}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Cargo</label>
          <Select value={filters.cargo} onValueChange={(v) => updateFilter('cargo', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os cargos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              {CARGO_OPTIONS?.map(cargo => (
                <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Situação</label>
          <Select value={filters.situacao} onValueChange={(v) => updateFilter('situacao', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as situações</SelectItem>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Positivação</label>
          <Select value={filters.positivacao} onValueChange={(v) => updateFilter('positivacao', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="positivado">Positivado</SelectItem>
              <SelectItem value="negativado">Negativado</SelectItem>
              <SelectItem value="nao_avaliado">Parcial</SelectItem>
              <SelectItem value="rede_nao_encontrada">Rede não encontrada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Instagram</label>
          <Select value={filters.instagram} onValueChange={(v) => updateFilter('instagram', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="com">Com Instagram</SelectItem>
              <SelectItem value="sem">Sem Instagram</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {(filters.search || filters.categoria !== 'all' || filters.bairro !== 'all' || filters.cargo !== 'all' || filters.situacao !== 'all' || filters.positivacao !== 'all' || filters.instagram !== 'all') && (
        <div className="flex justify-end pt-2">
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4 mr-2" />
            Limpar filtros
          </Button>
        </div>
      )}
    </div>
  )
}
