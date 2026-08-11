"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, ExternalLink, Instagram, Facebook, Video, Share2 } from "lucide-react";
import { REDE_SOCIAL_OPTIONS, TIPO_PUBLICACAO_OPTIONS } from "@/lib/constants";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const publications: Array<{ id: string; data: string; funcionario: string; rede: string; tipo: string; status: string; link: string; obs: string }> = [];

const getSocialIcon = (rede: string) => {
  switch (rede) {
    case "Instagram": return <Instagram className="h-4 w-4 text-pink-500" />;
    case "Facebook": return <Facebook className="h-4 w-4 text-blue-600" />;
    case "TikTok": return <Video className="h-4 w-4 text-black" />;
    default: return <Share2 className="h-4 w-4 text-gray-500" />;
  }
};

export default function PublicacoesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-vessel-deep">Publicações</h1>
          <p className="text-muted-foreground">Monitoramento de postagens nas redes sociais</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-vessel-blue hover:bg-vessel-blue/90">
              <Plus className="mr-2 h-4 w-4" />
              Registrar Publicação
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Registrar Nova Publicação</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Colaborador</Label>
                <Input placeholder="Buscar colaborador..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rede Social</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {REDE_SOCIAL_OPTIONS.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                    <SelectContent>
                      {TIPO_PUBLICACAO_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Link da Publicação</Label>
                <Input placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Status de Avaliação</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Positivo">Positivo</SelectItem>
                    <SelectItem value="Parcial">Parcial</SelectItem>
                    <SelectItem value="Negativo">Negativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Detalhes sobre a publicação..." />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" onClick={() => setIsDialogOpen(false)} className="bg-vessel-blue">
                Salvar Publicação
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="rounded-md border-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Rede</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publications.map((pub) => (
                  <TableRow key={pub.id}>
                    <TableCell className="whitespace-nowrap">{new Date(pub.data).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px]">{pub.funcionario.substring(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{pub.funcionario}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSocialIcon(pub.rede)}
                        <span className="text-sm">{pub.rede}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-normal">{pub.tipo}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={pub.status === 'Positivo' ? 'success' : pub.status === 'Negativo' ? 'destructive' : 'secondary'}
                        className="font-normal"
                      >
                        {pub.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                        <a href={pub.link} target="_blank" rel="noopener noreferrer" title="Acessar publicação">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {publications.length === 0 && <TableRow><TableCell colSpan={6} className="h-28 text-center text-muted-foreground">Nenhuma publicação registrada.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
