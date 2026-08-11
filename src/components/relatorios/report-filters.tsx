'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CARGO_OPTIONS, BAIRROS_BOA_VISTA, CATEGORIA_COLABORADOR_OPTIONS } from '@/lib/constants';

interface ReportFiltersProps {
  onGenerate: (filters: any) => void;
}

export function ReportFilters({ onGenerate }: ReportFiltersProps) {
  const [tipo, setTipo] = useState('todos');
  const [bairro, setBairro] = useState('');
  const [cargo, setCargo] = useState('');
  const [categoria, setCategoria] = useState('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  const handleGenerate = () => {
    onGenerate({
      tipo,
      bairro: tipo === 'bairro' ? bairro : '',
      cargo: tipo === 'cargo' ? cargo : '',
      categoria: tipo === 'categoria' ? categoria : '',
      dataInicial,
      dataFinal,
    });
  };

  return (
    <Card className="mb-6 shadow-sm border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-vessel-deep">Filtros do Relatório</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de Relatório</Label>
            <Select value={tipo} onValueChange={setTipo}>
              <SelectTrigger id="tipo" className="bg-white">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os colaboradores</SelectItem>
                <SelectItem value="categoria">Por categoria</SelectItem>
                <SelectItem value="bairro">Por bairro</SelectItem>
                <SelectItem value="cargo">Por cargo</SelectItem>
                <SelectItem value="positivados">Positivados</SelectItem>
                <SelectItem value="negativados">Negativados</SelectItem>
                <SelectItem value="pendentes">Parciais</SelectItem>
                <SelectItem value="sem_instagram">Sem Instagram</SelectItem>
                <SelectItem value="ativos">Ativos</SelectItem>
                <SelectItem value="inativos">Inativos</SelectItem>
                <SelectItem value="publicacoes">Publicações por período</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {tipo === 'bairro' && (
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Select value={bairro} onValueChange={setBairro}>
                <SelectTrigger id="bairro" className="bg-white">
                  <SelectValue placeholder="Selecione o bairro" />
                </SelectTrigger>
                <SelectContent>
                  {BAIRROS_BOA_VISTA.map(b => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipo === 'cargo' && (
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Select value={cargo} onValueChange={setCargo}>
                <SelectTrigger id="cargo" className="bg-white">
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent>
                  {CARGO_OPTIONS.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {tipo === 'categoria' && (
            <div className="space-y-2">
              <Label htmlFor="categoria-relatorio">Categoria</Label>
              <Select value={categoria} onValueChange={setCategoria}>
                <SelectTrigger id="categoria-relatorio" className="bg-white">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIA_COLABORADOR_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(tipo === 'publicacoes' || tipo === 'todos') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="data-inicial">Data Inicial</Label>
                <Input
                  id="data-inicial"
                  type="date"
                  value={dataInicial}
                  onChange={(e) => setDataInicial(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data-final">Data Final</Label>
                <Input
                  id="data-final"
                  type="date"
                  value={dataFinal}
                  onChange={(e) => setDataFinal(e.target.value)}
                  className="bg-white"
                />
              </div>
            </>
          )}

          <div className="md:col-start-4">
            <Button onClick={handleGenerate} className="w-full bg-vessel-blue hover:bg-blue-700 text-white">
              Gerar Relatório
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
