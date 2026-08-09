import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BrandLogoProps {
  className?: string;
  priority?: boolean;
  showDetails?: boolean;
}

export function BrandLogo({ className, priority = false, showDetails = false }: BrandLogoProps) {
  return (
    <div
      className={cn(
        'w-full overflow-hidden bg-[#073fc8]',
        className,
      )}
      aria-label="VESSEL"
    >
      <div className="relative aspect-[5.4/1] w-full overflow-hidden">
        <Image
          src="/logo-vessel.png"
          alt="VESSEL"
          width={1676}
          height={941}
          priority={priority}
          sizes="(max-width: 768px) 320px, 640px"
          className="absolute left-0 top-[-96%] h-auto w-full max-w-none [clip-path:polygon(0_0,38%_0,38%_100%,0_100%)]"
        />
        <Image
          src="/logo-vessel.png"
          alt=""
          aria-hidden="true"
          width={1676}
          height={941}
          sizes="(max-width: 768px) 320px, 640px"
          className="absolute left-0 top-[-96%] h-auto w-full max-w-none [clip-path:polygon(36%_0,100%_0,100%_52%,36%_52%)]"
        />
      </div>

      {showDetails && (
        <div className="px-[5%] pb-[3%] pt-[1%] text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="h-[2px] w-8 rounded-full bg-[#18d775]" />
            <span className="whitespace-nowrap text-[clamp(9px,2.8vw,12px)] font-semibold uppercase tracking-[0.28em] text-white">
              Gestão de Colaboradores
            </span>
            <span className="h-[2px] w-8 rounded-full bg-[#18d775]" />
          </div>
          <div className="mx-auto mt-3 rounded-full bg-[#13c967] px-3 py-1.5 text-[clamp(7px,2.1vw,9px)] font-bold uppercase tracking-[0.02em] text-white shadow-md shadow-blue-950/15">
            Organização <span className="text-[#0753db]">•</span> Pessoas <span className="text-[#0753db]">•</span> Informação <span className="text-[#0753db]">•</span> Resultado
          </div>
        </div>
      )}
    </div>
  );
}
