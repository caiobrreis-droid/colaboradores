"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { BAIRROS_BOA_VISTA, CARGO_OPTIONS } from "@/lib/constants";
import { Search, X } from "lucide-react";

interface MapFiltersProps {
  filters: {
    search: string;
    bairro: string;
    cargo: string;
    status: string;
    ativo: boolean;
  };
  setFilters: (filters: any) => void;
  onClear: () => void;
}

export function MapFilters({ filters, setFilters, onClear }: MapFiltersProps) {
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value === "all" ? "" : value });
  };

  return (
    <div className="flex flex-col gap-6 p-4 w-72 bg-white border-r h-full overflow-y-auto">
      <div>
        <h2 className="text-lg font-bold text-vessel-deep mb-4">Filtros</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">Buscar</Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Nome do colaborador..."
              className="pl-8"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Bairro</Label>
          <Select value={filters.bairro || "all"} onValueChange={(val) => handleFilterChange("bairro", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os bairros" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os bairros</SelectItem>
              {BAIRROS_BOA_VISTA.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Cargo</Label>
          <Select value={filters.cargo || "all"} onValueChange={(val) => handleFilterChange("cargo", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os cargos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os cargos</SelectItem>
              {CARGO_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={filters.status || "all"} onValueChange={(val) => handleFilterChange("status", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="Positivado">Positivado</SelectItem>
              <SelectItem value="Negativado">Negativado</SelectItem>
              <SelectItem value="Pendente">Pendente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="ativo-toggle" className="cursor-pointer">Apenas Ativos</Label>
          <Switch
            id="ativo-toggle"
            checked={filters.ativo}
            onCheckedChange={(val) => handleFilterChange("ativo", val)}
          />
        </div>

        <Button variant="outline" className="w-full mt-4" onClick={onClear}>
          <X className="mr-2 h-4 w-4" />
          Limpar Filtros
        </Button>
      </div>
    </div>
  );
}
