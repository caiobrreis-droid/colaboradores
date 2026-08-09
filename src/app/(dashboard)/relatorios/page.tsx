'use client';

import { useEffect, useMemo, useState } from 'react';
import { ReportFilters } from '@/components/relatorios/report-filters';
import { ReportTable } from '@/components/relatorios/report-table';
import { PrintTemplate } from '@/components/relatorios/print-template';
import { Button } from '@/components/ui/button';
import { exportToExcel, exportToCSV, printReport } from '@/lib/export-utils';
import { BriefcaseBusiness, Building2, FileDown, FileSpreadsheet, FileText, House, Landmark, Printer } from 'lucide-react';
import { CATEGORIA_COLABORADOR_LABELS, CATEGORIA_COLABORADOR_OPTIONS } from '@/lib/constants';
import type { CategoriaColaborador, FuncionarioCompleto } from '@/types';
import { fetchEmployees } from '@/lib/employee-storage';
import { toast } from 'sonner';

const CATEGORY_ICONS = {
  gabinete: Landmark,
  casa: House,
  vice_presidencia: BriefcaseBusiness,
  pmbv: Building2,
};

export default function RelatoriosPage() {
  const [employees, setEmployees] = useState<FuncionarioCompleto[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportTitle, setReportTitle] = useState('Relatório Geral');
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => { void fetchEmployees().then(setEmployees); }, []);

  const allData = useMemo(() => employees.map((employee) => {
    const instagram = employee.redes_sociais?.find((network) =>
      String(network.rede_social || network.plataforma || '').toLowerCase() === 'instagram',
    );
    const networkStatus = employee.status_redes?.[0]?.status || 'nao_avaliado';
    return {
      nome: employee.nome,
      foto_url: employee.foto_url || '',
      cargo: employee.cargo,
      categoria: employee.categoria,
      bairro: employee.endereco?.bairro || '',
      telefone: employee.telefone || '',
      instagram: instagram?.username || instagram?.handle || '',
      situacao: networkStatus === 'positivado' ? 'Positivado' : networkStatus === 'negativado' ? 'Negativado' : 'Neutro',
      ativo: employee.ativo !== false,
      ultimaAtualizacao: new Date(employee.updated_at).toLocaleDateString('pt-BR'),
    };
  }), [employees]);

  const handleGenerate = (filters: any) => {
    let filtered = [...allData];
    if (filters.bairro) {
      filtered = filtered.filter(item => item.bairro === filters.bairro);
    }
    if (filters.cargo) {
      filtered = filtered.filter(item => item.cargo === filters.cargo);
    }
    if (filters.categoria) {
      filtered = filtered.filter(item => item.categoria === filters.categoria);
    }
    if (filters.tipo === 'positivados') filtered = filtered.filter((item) => item.situacao === 'Positivado');
    if (filters.tipo === 'negativados') filtered = filtered.filter((item) => item.situacao === 'Negativado');
    if (filters.tipo === 'pendentes') filtered = filtered.filter((item) => item.situacao === 'Neutro');
    if (filters.tipo === 'sem_instagram') filtered = filtered.filter((item) => !item.instagram);
    if (filters.tipo === 'ativos') filtered = filtered.filter((item) => item.ativo);
    if (filters.tipo === 'inativos') filtered = filtered.filter((item) => !item.ativo);

    const title = filters.categoria
      ? `Relatório de Colaboradores — ${CATEGORIA_COLABORADOR_LABELS[filters.categoria as CategoriaColaborador]}`
      : 'Relatório Geral de Colaboradores';
    setReportTitle(title);
    setReportData(filtered);
    setHasGenerated(true);
  };

  const handleCategoryPrint = (categoria: CategoriaColaborador) => {
    const filtered = allData.filter((item) => item.categoria === categoria);
    if (filtered.length === 0) {
      toast.info(`Não há colaboradores em ${CATEGORIA_COLABORADOR_LABELS[categoria]} para imprimir.`);
      return;
    }
    setReportTitle(`Relatório de Colaboradores — ${CATEGORIA_COLABORADOR_LABELS[categoria]}`);
    setReportData(filtered);
    setHasGenerated(true);
    window.setTimeout(() => printReport(), 150);
  };

  const handleExportPDF = () => {
    if (!reportData.length) {
      toast.info('Gere um relatório com colaboradores antes de exportar.');
      return;
    }
    printReport();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Relatórios</h1>
        <p className="text-gray-500">Gere, exporte e imprima relatórios separados por categoria.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {CATEGORIA_COLABORADOR_OPTIONS.map(({ value, label }) => {
          const Icon = CATEGORY_ICONS[value];
          const total = allData.filter((item) => item.categoria === value).length;

          return (
            <div key={value} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-vessel-blue">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600">{total} registros</span>
              </div>
              <h2 className="mt-4 font-semibold text-vessel-deep">{label}</h2>
              <p className="mt-1 text-sm text-gray-500">Relatório exclusivo dos colaboradores desta categoria.</p>
              <Button variant="outline" className="mt-4 w-full border-blue-100 text-vessel-blue hover:bg-blue-50" onClick={() => handleCategoryPrint(value)}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir relatório
              </Button>
            </div>
          );
        })}
      </div>

      <ReportFilters onGenerate={handleGenerate} />

      {hasGenerated && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200" onClick={handleExportPDF} disabled={reportData.length === 0}>
              <FileText className="w-4 h-4 mr-2 text-red-500" />
              PDF
            </Button>
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200" onClick={() => exportToExcel(reportData.map((item) => ({ ...item, categoria: CATEGORIA_COLABORADOR_LABELS[item.categoria as CategoriaColaborador] || item.categoria })), 'relatorio_vessel')}>
              <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
              Excel
            </Button>
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200" onClick={() => exportToCSV(reportData.map((item) => ({ ...item, categoria: CATEGORIA_COLABORADOR_LABELS[item.categoria as CategoriaColaborador] || item.categoria })), 'relatorio_vessel')}>
              <FileDown className="w-4 h-4 mr-2 text-blue-500" />
              CSV
            </Button>
            <Button variant="outline" className="bg-white hover:bg-gray-50 border-gray-200" onClick={printReport} disabled={reportData.length === 0}>
              <Printer className="w-4 h-4 mr-2 text-gray-600" />
              Imprimir
            </Button>
          </div>

          <ReportTable data={reportData} title={reportTitle} />

          <PrintTemplate data={reportData} title={reportTitle} />
        </div>
      )}
    </div>
  );
}
