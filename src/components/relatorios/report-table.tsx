'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/funcionarios/status-badge';
import { CATEGORIA_COLABORADOR_LABELS } from '@/lib/constants';
import type { CategoriaColaborador } from '@/types';

interface ReportTableProps {
  data: any[];
  title: string;
}

export function ReportTable({ data, title }: ReportTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="shadow-sm border-gray-100">
        <CardContent className="p-8 text-center text-gray-500">
          Nenhum dado encontrado para os filtros selecionados.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-gray-100 overflow-hidden">
      <CardHeader className="bg-gray-50 pb-4 border-b">
        <CardTitle className="text-lg font-medium text-vessel-deep">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-16 font-semibold">Nº</TableHead>
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Cargo</TableHead>
                <TableHead className="font-semibold">Categoria</TableHead>
                <TableHead className="font-semibold">Bairro</TableHead>
                <TableHead className="font-semibold">Telefone</TableHead>
                <TableHead className="font-semibold">Instagram</TableHead>
                <TableHead className="font-semibold">Situação</TableHead>
                <TableHead className="font-semibold text-right">Última Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={index} className="hover:bg-gray-50 transition-colors">
                  <TableCell className="text-gray-500">{index + 1}</TableCell>
                  <TableCell className="font-medium">{item.nome}</TableCell>
                  <TableCell>{item.cargo}</TableCell>
                  <TableCell>{CATEGORIA_COLABORADOR_LABELS[item.categoria as CategoriaColaborador] || item.categoria}</TableCell>
                  <TableCell>{item.bairro}</TableCell>
                  <TableCell>{item.telefone}</TableCell>
                  <TableCell>{item.instagram ? `@${item.instagram}` : '-'}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.situacao} />
                  </TableCell>
                  <TableCell className="text-right text-gray-500 text-sm">
                    {item.ultimaAtualizacao}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-gray-100 font-semibold">
                <TableCell colSpan={8} className="text-right">Total de Registros:</TableCell>
                <TableCell className="text-right">{data.length}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
