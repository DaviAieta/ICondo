"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, PlusCircle, File, Frown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Create as CreateCondo } from "../_components/create-condo";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Delete as DeleteCondo } from "../_components/delete-condo";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Update as UpdateCondo } from "./update-condo";
import { CondoProps } from "../types";
import { fetchAdapter } from "@/adapters/fetchAdapter";
import { useToast } from "@/components/ui/use-toast";
import { formatRelative } from "date-fns";
import { ptBR } from "date-fns/locale";

export const List = () => {
  const [condos, setCondos] = useState<CondoProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const fetchCondos = async () => {
    try {
      const response = await fetchAdapter({
        method: "GET",
        path: "condos",
      });
      if (response.status == 200) {
        setCondos(response.data);
        setLoading(false);
      }
    } catch (error) {
      toast({
        title: `Erro`,
        description: `Ocorreu um erro ao carregar os condomínios, por favor contatar o suporte`,
      });
      setLoading(false);
    }
  };

  const fetchExportCsv = async () => {
    try {
      const response = await fetchAdapter({
        method: "GET",
        path: "condos/export-csv",
      });
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "condominios.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast({
          title: "Sucesso ao baixar CSV",
        });
      }
    } catch (error) {
      toast({
        title: `Ocorreu algum erro ${(<Frown />)}`,
        description: `Por favor contatar um administrador`,
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCondos();
  }, []);

  const filteredCondo = condos.filter((condo) =>
    condo.razao_social.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <form className="w-full">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar condomínios..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </form>
        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1"
            onClick={fetchExportCsv}
          >
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Exportar CSV
            </span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button size="sm" variant="outline" className="h-7 gap-1.5">
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Condomínio
                </span>
              </Button>
            </SheetTrigger>
            <CreateCondo setCondos={setCondos} />
          </Sheet>
        </div>
      </div>

      <Card>
        <CardHeader className="px-7">
          <CardTitle>Condomínios</CardTitle>
          <CardDescription>
            Condomínios adicionados recentemente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <ReloadIcon className="animate-spin" />
          ) : filteredCondo.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">
                    Razão Social
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Logradouro
                  </TableHead>
                  <TableHead className="hidden md:table-cell">Bairro</TableHead>
                  <TableHead className="hidden md:table-cell">CEP</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Contato
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Data de Criação
                  </TableHead>
                  <TableHead className="hidden md:table-cell"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCondo.map((condo) => (
                  <TableRow key={condo.id}>
                    <TableCell>
                      <div className="font-medium">{condo.razao_social}</div>
                      <div className="hidden text-sm text-muted-foreground md:inline">
                        {condo.localidade}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {condo.logradouro}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {condo.bairro}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {condo.cep}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {condo.telefone}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatRelative(condo.createdAt, new Date(), {
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only ">Open menu</span>
                            <DotsHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <Separator />
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button variant="ghost">Editar</Button>
                            </SheetTrigger>
                            <UpdateCondo condo={condo} setCondos={setCondos} />
                          </Sheet>
                          <br />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost">Excluir</Button>
                            </DialogTrigger>
                            <DeleteCondo
                              id={Number(condo.id)}
                              razaoSocial={condo.razao_social}
                              setCondos={setCondos}
                            />
                          </Dialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p>Nenhum condomínio encontrado.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
};
