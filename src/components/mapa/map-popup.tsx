import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/funcionarios/status-badge";
import Link from "next/link";
import { Phone, Instagram, MapPin } from "lucide-react";

interface MapPopupProps {
  funcionario: {
    id: string;
    name: string;
    cargo: string;
    bairro: string;
    telefone: string;
    instagram?: string;
    status: string;
    fotoUrl?: string;
  };
}

export function MapPopup({ funcionario }: MapPopupProps) {
  const initials = funcionario.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="flex flex-col gap-3 min-w-[200px] p-1">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-border">
          <AvatarImage src={funcionario.fotoUrl} alt={funcionario.name} />
          <AvatarFallback className="bg-vessel-gray-50 text-vessel-deep text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-vessel-deep line-clamp-1">{funcionario.name}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">{funcionario.cargo}</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{funcionario.bairro}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Phone className="h-3.5 w-3.5" />
          <span>{funcionario.telefone}</span>
        </div>
        {funcionario.instagram && (
          <div className="flex items-center gap-1.5 text-vessel-blue">
            <Instagram className="h-3.5 w-3.5" />
            <a href={`https://instagram.com/${funcionario.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
              {funcionario.instagram}
            </a>
          </div>
        )}
      </div>

      <div className="mt-1">
        <StatusBadge status={funcionario.status} />
      </div>

      <Button asChild variant="outline" className="w-full mt-2 h-8 text-xs">
        <Link href={`/funcionarios/${funcionario.id}`}>Ver Perfil</Link>
      </Button>
    </div>
  );
}
