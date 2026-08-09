'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Building2, CalendarDays, House, Landmark, Printer, Star, UsersRound } from 'lucide-react';

import { BrandLogo } from '@/components/shared/brand-logo';
import { CATEGORIA_COLABORADOR_LABELS, ORGANIZATION_NAME } from '@/lib/constants';
import type { CategoriaColaborador } from '@/types';

interface PrintTemplateProps {
  data: any[];
  title: string;
}

const ROWS_PER_PAGE = 12;

const categoryIcons = {
  gabinete: Landmark,
  casa: House,
  vice_presidencia: Star,
  pmbv: Building2,
};

export function PrintTemplate({ data, title }: PrintTemplateProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !data?.length) return null;

  const generatedAt = new Date();
  const date = generatedAt.toLocaleDateString('pt-BR');
  const time = generatedAt.toLocaleTimeString('pt-BR');
  const pages = Array.from({ length: Math.ceil(data.length / ROWS_PER_PAGE) }, (_, pageIndex) =>
    data.slice(pageIndex * ROWS_PER_PAGE, (pageIndex + 1) * ROWS_PER_PAGE),
  );

  return createPortal(
    <section className="print-only" aria-hidden="true">
      <style>{`
        @page { size: A4 landscape; margin: 8mm; }
        .print-only { display: none; }
        @media print {
          html, body { margin: 0 !important; padding: 0 !important; background: #ffffff !important; }
          body > *:not(.print-only) { display: none !important; }
          .print-only { display: block !important; width: 281mm !important; margin: 0 !important; padding: 0 !important; font-family: Arial, Helvetica, sans-serif !important; color: #071a42 !important; }
          .print-report-page { position: relative !important; width: 281mm !important; height: 194mm !important; overflow: hidden !important; box-sizing: border-box !important; padding: 1.2mm !important; border-radius: 3mm !important; background: linear-gradient(145deg, #0860ed 0%, #0639b8 72%, #03277d 100%) !important; print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; break-after: page !important; page-break-after: always !important; }
          .print-report-page:last-child { break-after: auto !important; page-break-after: auto !important; }
          .print-report-sheet { position: relative !important; height: 100% !important; overflow: hidden !important; border-radius: 2.2mm !important; background: #ffffff !important; }
          .print-report-header { display: grid !important; grid-template-columns: 31% 43% 26% !important; height: 31mm !important; border-bottom: 1px solid #d8e2f0 !important; background: linear-gradient(105deg, #ffffff 0%, #ffffff 75%, #f6f9fd 100%) !important; }
          .print-report-brand-zone { position: relative !important; display: flex !important; flex-direction: column !important; justify-content: center !important; overflow: hidden !important; padding: 4mm 12mm 4mm 7mm !important; border-bottom-right-radius: 19mm !important; border-bottom: 1.1mm solid #16d76e !important; background: linear-gradient(135deg, #0758e3 0%, #0636a5 100%) !important; }
          .print-report-logo { width: 50mm !important; max-width: 50mm !important; background: #0640c2 !important; }
          .print-report-logo + .print-report-product { margin-top: 0.7mm !important; }
          .print-report-product { color: #ffffff !important; font-size: 5.7pt !important; font-weight: 700 !important; letter-spacing: 0.22em !important; text-align: center !important; text-transform: uppercase !important; }
          .print-report-heading { display: flex !important; flex-direction: column !important; justify-content: center !important; padding: 3mm 7mm !important; }
          .print-report-title { margin: 0 !important; color: #0739a5 !important; font-size: 16pt !important; font-weight: 800 !important; line-height: 1.1 !important; text-transform: uppercase !important; }
          .print-report-org { margin: 1.2mm 0 0 !important; color: #64748b !important; font-size: 9pt !important; }
          .print-report-meta { display: grid !important; grid-template-columns: 1fr 1fr !important; align-self: center !important; height: 16mm !important; margin-right: 6mm !important; overflow: hidden !important; border: 1px solid #d6deea !important; border-radius: 3mm !important; background: #ffffff !important; }
          .print-report-meta-item { display: flex !important; align-items: center !important; gap: 2.5mm !important; padding: 2.5mm 3mm !important; }
          .print-report-meta-item + .print-report-meta-item { border-left: 1px solid #d6deea !important; }
          .print-report-meta svg { width: 5mm !important; height: 5mm !important; color: #0758e3 !important; }
          .print-report-meta-label { display: block !important; font-size: 6.5pt !important; font-weight: 700 !important; color: #1e293b !important; }
          .print-report-meta-value { display: block !important; margin-top: 0.4mm !important; font-size: 6pt !important; color: #475569 !important; }
          .print-report-content { padding: 4mm 7mm 18mm !important; }
          .print-report-table-wrap { overflow: hidden !important; border: 1px solid #d7e0ec !important; border-radius: 2.2mm !important; }
          .print-report-table { width: 100% !important; border-collapse: collapse !important; table-layout: fixed !important; font-size: 7.1pt !important; }
          .print-report-table th { height: 7.5mm !important; padding: 1.5mm 2mm !important; border: 0 !important; color: #ffffff !important; background: linear-gradient(90deg, #0758e3 0%, #0736aa 100%) !important; font-size: 6.8pt !important; font-weight: 800 !important; text-align: left !important; text-transform: uppercase !important; }
          .print-report-table td { height: 8.2mm !important; box-sizing: border-box !important; padding: 1.3mm 2mm !important; border-bottom: 1px solid #dce3ed !important; color: #0f254d !important; vertical-align: middle !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
          .print-report-table tr:last-child td { border-bottom: 0 !important; }
          .print-report-table tbody tr:nth-child(even) td { background: #fbfcfe !important; }
          .print-report-table th:nth-child(1), .print-report-table td:nth-child(1) { width: 6% !important; text-align: center !important; color: #0758e3 !important; font-weight: 800 !important; }
          .print-report-table th:nth-child(1) { color: #ffffff !important; }
          .print-report-table th:nth-child(2), .print-report-table td:nth-child(2) { width: 23% !important; }
          .print-report-table th:nth-child(3), .print-report-table td:nth-child(3) { width: 17% !important; }
          .print-report-table th:nth-child(4), .print-report-table td:nth-child(4) { width: 16% !important; }
          .print-report-table th:nth-child(5), .print-report-table td:nth-child(5) { width: 15% !important; }
          .print-report-table th:nth-child(6), .print-report-table td:nth-child(6) { width: 14% !important; }
          .print-report-table th:nth-child(7), .print-report-table td:nth-child(7) { width: 9% !important; text-align: center !important; }
          .print-report-person { display: flex !important; align-items: center !important; gap: 2.2mm !important; min-width: 0 !important; }
          .print-report-avatar { display: inline-flex !important; align-items: center !important; justify-content: center !important; width: 5mm !important; height: 5mm !important; flex: 0 0 5mm !important; overflow: hidden !important; border-radius: 50% !important; background: #dbeafe !important; color: #0758e3 !important; font-size: 5.5pt !important; font-weight: 800 !important; }
          .print-report-avatar img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
          .print-category { display: inline-flex !important; align-items: center !important; gap: 1mm !important; max-width: 100% !important; padding: 0.7mm 2mm !important; border: 1px solid #b9ead0 !important; border-radius: 4mm !important; color: #07934a !important; background: #effcf5 !important; font-size: 6.2pt !important; font-weight: 700 !important; }
          .print-category.gabinete { border-color: #bcd2ff !important; color: #0758e3 !important; background: #f0f5ff !important; }
          .print-category svg { width: 3.2mm !important; height: 3.2mm !important; flex: 0 0 auto !important; }
          .print-status { display: inline-block !important; min-width: 18mm !important; padding: 0.8mm 1.5mm !important; border-radius: 4mm !important; color: #ffffff !important; font-size: 5.8pt !important; font-weight: 800 !important; line-height: 1 !important; text-align: center !important; text-transform: uppercase !important; }
          .print-status.positivado { background: #11b95f !important; }
          .print-status.negativado { background: #9ca3af !important; }
          .print-status.neutro, .print-status.pendente { background: #f6a800 !important; }
          .print-report-footer { position: absolute !important; right: 0 !important; bottom: 0 !important; left: 0 !important; display: flex !important; align-items: center !important; justify-content: space-between !important; height: 14mm !important; padding-right: 8mm !important; background: linear-gradient(120deg, #0634a4 0%, #0649c7 27%, #ffffff 27.2%, #ffffff 86%, #eef3fa 86.2%) !important; }
          .print-report-total { display: flex !important; align-items: center !important; gap: 2mm !important; padding-left: 9mm !important; color: #ffffff !important; }
          .print-report-total svg { width: 5mm !important; height: 5mm !important; }
          .print-report-total strong { display: block !important; font-size: 9pt !important; line-height: 1 !important; }
          .print-report-total span { display: block !important; margin-top: 0.8mm !important; font-size: 5.6pt !important; }
          .print-report-page-number { font-size: 7pt !important; color: #1e3a73 !important; }
        }
      `}</style>

      {pages.map((pageRows, pageIndex) => (
        <article className="print-report-page" key={pageIndex}>
          <div className="print-report-sheet">
            <header className="print-report-header">
              <div className="print-report-brand-zone">
                <BrandLogo className="print-report-logo" />
                <div className="print-report-product">Gestão de Colaboradores</div>
              </div>
              <div className="print-report-heading">
                <h1 className="print-report-title">{title}</h1>
                <p className="print-report-org">{ORGANIZATION_NAME}</p>
              </div>
              <div className="print-report-meta">
                <div className="print-report-meta-item"><CalendarDays /><div><span className="print-report-meta-label">{date}</span><span className="print-report-meta-value">{time}</span></div></div>
                <div className="print-report-meta-item"><Printer /><div><span className="print-report-meta-label">Impressora</span><span className="print-report-meta-value">Configuração do navegador</span></div></div>
              </div>
            </header>

            <main className="print-report-content">
              <div className="print-report-table-wrap">
                <table className="print-report-table">
                  <thead><tr><th>Nº</th><th>Nome</th><th>Cargo</th><th>Categoria</th><th>Bairro</th><th>Telefone</th><th>Situação</th></tr></thead>
                  <tbody>
                    {pageRows.map((item, rowIndex) => {
                      const absoluteIndex = pageIndex * ROWS_PER_PAGE + rowIndex;
                      const category = item.categoria as CategoriaColaborador;
                      const CategoryIcon = categoryIcons[category] || Building2;
                      const statusClass = String(item.situacao || 'Neutro').toLocaleLowerCase('pt-BR');
                      const initials = String(item.nome || '').split(' ').filter(Boolean).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
                      return (
                        <tr key={`${item.nome}-${absoluteIndex}`}>
                          <td>{absoluteIndex + 1}</td>
                          <td><span className="print-report-person"><span className="print-report-avatar">{item.foto_url ? <img src={item.foto_url} alt="" /> : initials}</span><span>{item.nome}</span></span></td>
                          <td>{item.cargo || '—'}</td>
                          <td><span className={`print-category ${category}`}><CategoryIcon />{CATEGORIA_COLABORADOR_LABELS[category] || item.categoria}</span></td>
                          <td>{item.bairro || '—'}</td>
                          <td>{item.telefone || '—'}</td>
                          <td><span className={`print-status ${statusClass}`}>{item.situacao || 'Neutro'}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </main>

            <footer className="print-report-footer">
              <div className="print-report-total"><UsersRound /><div><strong>{data.length} colaborador{data.length === 1 ? '' : 'es'}</strong><span>Emitido pelo Sistema Vessel</span></div></div>
              <span className="print-report-page-number">Página {pageIndex + 1} de {pages.length}</span>
            </footer>
          </div>
        </article>
      ))}
    </section>,
    document.body,
  );
}
