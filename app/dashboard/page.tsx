"use client"

import { use, useEffect, useState, useMemo } from "react"
import { apiDashboard } from "@/lib/api-dashboard"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { StatCard } from "@/components/stat-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts"
import { Package, AlertCircle, ShoppingCart, DollarSign } from "lucide-react"
import { useEstoqueValor, useValorTotalEstoque, useLojaPerformance, useVendasEvolucao, useTopCategorias, useTopProdutos, useVendasSemanais } from "@/lib/hooks/use-dashboard"
import { useQuery } from "@tanstack/react-query"
import { el } from "date-fns/locale"
import type { TopCategoriaAPI, TopProdutoAPI, VendaSemanais} from "@/types"

interface SemanaData {
  __root__: {
    ano: number;
    semana: number;
    inicio_semana: string;
    valor_vendas: string | number;
    lucro: string | number;
    valor_vendas_semana_anterior: string | number;
    lucro_semana_anterior: string | number;
    crescimento_percentual: string | number;
  };
}

interface MesData {
  month: string;
  sales: number;
  profit: number;
}

// const categoryData = [
//   { name: "Eletrônicos", value: 400 },
//   { name: "Vestuário", value: 300 },
//   { name: "Móveis", value: 300 },
//   { name: "Alimentos", value: 200 },
// ]

const COLORS = ["#2d9d78", "#f44336", "#2196f3", "#ff9800", "#9c27b0", "#00bcd4", "#8bc34a", "#ffc107"];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const formatShort = (v: number) =>
  v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toString();

const parseNumber = (v: string | number): number =>
  Number(String(v).replace(',', '.')) || 0;

export default function DashboardPage() {
  const router = useRouter()
  const [valorTotal, setValorTotal] = useState('R$ 0,00')
  const [ValorTotalCusto, setValorTotalCusto] = useState('R$ 0,00')
  const [ValorTotalLucro, setValorTotalLucro] = useState('R$ 0,00')
  const [QntProdutos, setQntProdutos] = useState(0)
  const [retryCount, setRetryCount] = useState(0)

  const { data: estoqueValor, isLoading, isError, refetch } = useValorTotalEstoque()
  const { data: lojaPerformance } = useLojaPerformance()
  const { data: vendasEvolucao } = useVendasEvolucao()
  const { data: vendasSemanais } = useVendasSemanais()
  const { data: evolucaoSemanais } = useVendasEvolucao()
  const { data: topCategorias } = useTopCategorias()
  const { data: topProdutos } = useTopProdutos()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
    }
  }, [router])

  useEffect(() => {
    if (isLoading) return
    if (isError) {
      setValorTotal('R$ 0,00')
      setValorTotalCusto('R$ 0,00')
      setValorTotalLucro('R$ 0,00')
      setQntProdutos(0)
      if (retryCount < 3) {
        setRetryCount(retryCount + 1)
        setTimeout(() => {
          refetch()
        }, 2000) // Tenta novamente após 2 segundos
      }
      return
    }

    let total = 0
    let totalCusto = 0
    let totalLucro = 0
    let qntProdutos = 0

    if (Array.isArray(estoqueValor)) {
      total = estoqueValor.reduce((sum, item) => {
        const v = item?.__root__?.valor_potencial_venda ?? 0
        return sum + (Number(String(v).replace(',', '.')) || 0)
      }, 0)
    } else if (estoqueValor && estoqueValor.__root__) {
      total = Number(String(estoqueValor.__root__.valor_potencial_venda).replace(',', '.')) || 0
    }

    if (Array.isArray(estoqueValor)) {
      totalCusto = estoqueValor.reduce((sum, item) => {
        const c = item?.__root__?.valor_estoque_final ?? 0
        return sum + (Number(String(c).replace(',', '.')) || 0)
      }, 0)
    } else if (estoqueValor && estoqueValor.__root__) {
      totalCusto = Number(String(estoqueValor.__root__.valor_estoque_final).replace(',', '.')) || 0
    }

    if (Array.isArray(estoqueValor)) {
      totalLucro = estoqueValor.reduce((sum, item) => {
        const l = item?.__root__?.lucro_potencial ?? 0
        return sum + (Number(String(l).replace(',', '.')) || 0)
      }, 0)
    } else if (estoqueValor && estoqueValor.__root__) {
      totalLucro = Number(String(estoqueValor.__root__.lucro_potencial).replace(',', '.')) || 0
    }

    // Produtos com estoque baixo <= 15
    if (Array.isArray(estoqueValor)) {
      qntProdutos = estoqueValor.reduce((count, item) => {
        const quantidade = item?.__root__?.quantidade_estoque ?? 0
        return count + (quantidade <= 15 ? 1 : 0)
      }, 0)
    } else if (estoqueValor && estoqueValor.__root__) {
      const quantidade = estoqueValor.__root__.quantidade_estoque ?? 0
      qntProdutos = quantidade <= 15 ? 1 : 0
    }

    setQntProdutos(qntProdutos)

    const formattedLucro = totalLucro.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    setValorTotalLucro(formattedLucro)

    const formattedCusto = totalCusto.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    setValorTotalCusto(formattedCusto)

    const formatted = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
    setValorTotal(formatted)
  }, [estoqueValor, isLoading, isError],)

  // Formatação de dados para exibição em cards e gráficos do LojaPerformance pode ser adicionada aqui
  // Formatar os dados
  const chartPerformance = lojaPerformance?.map((item: any) => {
    const vendas = Number(String(item.__root__.valor_total_vendas).replace(',', '.')) || 0;
    const lucro  = Number(String(item.__root__.lucro_total).replace(',', '.')) || 0;

    return {
      nome: item.__root__.nome_loja,
      vendas,
      lucro,
      margem: Number(String(item.__root__.margem_media).replace(',', '.')) * 100
    };
  }) || [];

  // Formação de dados para exibição em cards e gráficos do VendasEvolucao pode ser adicionada aqui
  // Primeiro, transforme a data em mês
  const transformarParaMensal = (
    dadosSemanais: SemanaData[] = []
  ): MesData[] => {
    const meses: Record<string, MesData> = {};

    dadosSemanais.forEach(({ __root__ }) => {
      if (!__root__) return;

      const data = new Date(__root__.inicio_semana);
      const mes = data.toLocaleString("pt-BR", { month: "short" });
      const mesFormatado = (mes.charAt(0).toUpperCase() + mes.slice(1));

      if (!meses[mesFormatado]) {
        meses[mesFormatado] = {
          month: mesFormatado,
          sales: 0,
          profit: 0
        };
      }

      meses[mesFormatado].sales += Number(__root__.valor_vendas) || 0;
      meses[mesFormatado].profit += Number(__root__.lucro) || 0;
    });

    const ordemMeses: Record<string, number> = {
    Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
    Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12
  };

    return Object.values(meses).sort(
      (a, b) => ordemMeses[a.month] - ordemMeses[b.month]
    );
  };


  // ultimos 6 meses
  const getUltimos6Meses = (dadosMensais: MesData[]): MesData[] => {
    const ordemMeses = dadosMensais.reverse();
    return ordemMeses.slice(1, 7);
  };

  // Pegar mês específico
  const getMesEspecifico = (
    dadosMensais: MesData[],
    mes: string
  ): MesData | undefined => {
    return dadosMensais.find(item => item.month === mes);
  };

  // Percentual correto (mês vs mês anterior)
  const getPercentualCrescimento = (
    dadosMensais: MesData[],
    mesAtual: string,
    mesAnterior: string
  ): number => {
    const atual = getMesEspecifico(dadosMensais, mesAtual);
    const anterior = getMesEspecifico(dadosMensais, mesAnterior);

    if (!atual || !anterior || anterior.sales === 0) return 0;

    return Number(
      (((atual.sales - anterior.sales) / anterior.sales) * 100).toFixed(2)
    );
  };

  // Top Categorias - Formatação dos dados para o gráfico de pizza
  const categoryData = useMemo(() => {
    if (!topCategorias || !Array.isArray(topCategorias)) return [];

    return topCategorias.map((item: TopCategoriaAPI) => ({
      name: item.__root__.nome_categoria,
      value: parseNumber(item.__root__.total_vendas),
    }));
  }, [topCategorias]);

  // Top Produtos - Formatação dos dados para o gráfico de barras pode ser adicionada aqui
  const productData = useMemo(() => {
    if (!topProdutos || !Array.isArray(topProdutos)) return [];

    return topProdutos.map((item: TopProdutoAPI) => ({
      name: item.__root__.nome_produto,
      vendas: parseNumber(item.__root__.quantidade_vendida),
      investimento: parseNumber(item.__root__.valor_total) - parseNumber(item.__root__.lucro_total),
    }))
    .slice(0, 10); // Pega os top 5 produtos
  }, [topProdutos]);

  // Dados para o gráfico de finaceiro de vendas semanal
  const chartVendasSemanais = useMemo(() => {
    if (!vendasSemanais || !Array.isArray(vendasSemanais)) return [];

    return vendasSemanais.map((item: VendaSemanais) => ({
      semana: item.__root__.semana,
      valor_total_vendas: parseNumber(item.__root__.valor_total_vendas),
      lucro_total: parseNumber(item.__root__.lucro_total),
      margem_lucro_media: parseNumber(item.__root__.margem_lucro_media),
    }))
    .reverse();
  }, [vendasSemanais]);

  // pegar as últimas 12 semanas
  const chartVendasSemanais12 = chartVendasSemanais.slice(-12);

  const getSemanaData = (semanaNumber: number) => {
    if (!evolucaoSemanais || !Array.isArray(evolucaoSemanais)) return null;

    const dados = evolucaoSemanais.map((item: SemanaData) => ({
      ano: item.__root__.ano,
      semana: item.__root__.semana,
      inicio_semana: item.__root__.inicio_semana,
      valor_vendas: parseNumber(item.__root__.valor_vendas),
      lucro: parseNumber(item.__root__.lucro),
      valor_vendas_semana_anterior: parseNumber(item.__root__.valor_vendas_semana_anterior),
      lucro_semana_anterior: parseNumber(item.__root__.lucro_semana_anterior),
      crescimento_percentual: parseNumber(item.__root__.crescimento_percentual),
    })).reverse();

    return dados.find(dado => dado.semana === semanaNumber) || null;
  }

  // Pegar as semanas com o menor valor de vendas e o maior valor de vendas
  const getMelhorEPIorSemana = () => {
    if (!evolucaoSemanais || !Array.isArray(evolucaoSemanais)) return null;

    const dados = evolucaoSemanais.map((item: SemanaData) => ({
      ano: item.__root__.ano,
      semana: item.__root__.semana,
      inicio_semana: item.__root__.inicio_semana,
      valor_vendas: parseNumber(item.__root__.valor_vendas),
      lucro: parseNumber(item.__root__.lucro),
      valor_vendas_semana_anterior: parseNumber(item.__root__.valor_vendas_semana_anterior),
      lucro_semana_anterior: parseNumber(item.__root__.lucro_semana_anterior),
      crescimento_percentual: parseNumber(item.__root__.crescimento_percentual),
    })).reverse();

    const melhorSemana = dados.reduce((max, current) => current.valor_vendas > max.valor_vendas ? current : max, dados[0]);
    const piorSemana = dados.reduce((min, current) => current.valor_vendas < min.valor_vendas ? current : min, dados[0]);

    return { melhorSemana, piorSemana };
  };

  const dadosMensais = useMemo(
    () => transformarParaMensal(vendasEvolucao ?? []),
    [vendasEvolucao]
  );

  const chartVendasEvolucao = useMemo(
    () => getUltimos6Meses(dadosMensais),
    [dadosMensais]
  );

  const percentualCrescimento = useMemo(
    () => getPercentualCrescimento(dadosMensais, "Dez.", "Nov."),
    [dadosMensais]
  );

  const evolucaoSemana = getSemanaData(chartVendasSemanais.length > 0 ? chartVendasSemanais[chartVendasSemanais.length -1].semana : 0);

  const crescimento = Number(evolucaoSemana?.crescimento_percentual ?? 0)

  const piorSemana = getMelhorEPIorSemana()?.piorSemana;
  const melhorSemana = getMelhorEPIorSemana()?.melhorSemana;

  // Estado para a semana selecionada (para disparar re-render quando mudar)
  const [semanaSelecionada, setSemanaSelecionada] = useState<number | null>(null);

  // Define uma semana padrão quando os dados chegarem (última semana disponível)
  useEffect(() => {
    if (semanaSelecionada === null && chartVendasSemanais.length > 0) {
      setSemanaSelecionada(chartVendasSemanais[chartVendasSemanais.length - 1].semana);
    }
  }, [chartVendasSemanais, semanaSelecionada]);

  const semanafiltro = semanaSelecionada ? getSemanaData(semanaSelecionada) : null;

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Bem-vindo ao SyStock</p>
          </div>

          <h2 className="text-xl font-semibold mb-4">Situação do Estoque Atual</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatCard title="Valor Total em Estoque" value={valorTotal} icon={DollarSign} trend={percentualCrescimento} color="success" />
            <StatCard title="Custo do Estoque" value={ValorTotalCusto} icon={Package} color="primary" />
            <StatCard title="Produtos com Estoque Baixo" value={QntProdutos} icon={AlertCircle} color="warning" />
            <StatCard title="Lucro Potencial" value={ValorTotalLucro} icon={ShoppingCart} color="success" />
          </div>

          <h2 className="text-xl font-semibold mb-4">Desempenho das Vendas</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Evolução de Vendas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartVendasEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v:any) => formatShort(Number(v))} />
                    <Tooltip formatter={(value:any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line type="monotone" dataKey="sales" stroke="#2d9d78" name="Vendas" />
                    <Line type="monotone" dataKey="profit" stroke="#ff9800" name="Lucro" />
                  </LineChart>
                </ResponsiveContainer> 
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Categorias Vendidas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name} ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>


          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle> Top 10 produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={productData}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tickFormatter={(value: string) =>
    value.length > 20 ? value.slice(0, 14) + "…" : value
  }/>
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="vendas" fill="#2d9d78" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Desempenho das Lojas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="nome" />
                    <YAxis tickFormatter={formatShort} />
                    <Tooltip formatter={(value:any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="vendas" fill="#2d9d78">
                      <LabelList dataKey="vendas" position="top" formatter={(v:any) => formatShort(Number(v))} />
                    </Bar>
                    <Bar dataKey="lucro" fill="#ff9800">
                      <LabelList dataKey="lucro" position="top" formatter={(v:any) => formatShort(Number(v))} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <h2 className="text-xl font-semibold mb-4">Desempenho das Vendas por Semana</h2>
          <div className="flex-1 grid gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Vendas das últimas 12 semanas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartVendasSemanais12}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="semana" />
                    <YAxis tickFormatter={(v:any) => formatShort(Number(v))} />
                    <Tooltip formatter={(value:any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar dataKey="valor_total_vendas" fill="#2d9d78" name="Vendas">
                      <LabelList dataKey="valor_total_vendas" position="top" formatter={(v:any) => formatShort(Number(v))} />
                    </Bar>
                    <Bar dataKey="lucro_total" fill="#ff9800" name="Lucro">
                      <LabelList dataKey="lucro_total" position="top" formatter={(v:any) => formatShort(Number(v))} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>



           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard title={"Valor da pior semana"} label={"Semana " + piorSemana?.semana} value={formatCurrency(Number(piorSemana?.valor_vendas))} icon={DollarSign} trends={-Math.abs(Number(piorSemana?.crescimento_percentual))} color="danger" />
            
              <StatCard title={"Valor da melhor semana"} label={"Semana " + melhorSemana?.semana} value={formatCurrency(Number(melhorSemana?.valor_vendas))} icon={DollarSign} trends={Math.abs(Number(melhorSemana?.crescimento_percentual))} color="success" />
           </div>
          </div>

          <h2 className="text-xl font-semibold mb-4">Desempenho das Vendas por Semana Específica</h2>
          <div className="grid grid-cols-12 gap-6 mb-8">
            <div className="col-span-12 mb-4">
              {/* Card para selecionar semana */}
              <Card>
                <CardHeader>
                  <CardTitle>Selecione uma Semana</CardTitle>
                </CardHeader>
                <CardContent>
                  <select
                    className="w-full p-2 border rounded"
                    value={semanaSelecionada ?? ''}
                    onChange={(e) => setSemanaSelecionada(Number(e.target.value))}
                  >
                    <option value="">Selecione</option>
                    {chartVendasSemanais.map((item) => (
                      <option key={item.semana} value={item.semana}>
                        Semana {item.semana}
                      </option>
                    ))}
                  </select>
                </CardContent>
              </Card>
            </div>
            <div className="col-span-12 mb-4">
              {/* Filtro para semana específica */}
              {semanafiltro ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Semana {semanafiltro.semana}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Início da Semana:</strong> {semanafiltro.inicio_semana}</p>
                    <p><strong>Valor de Vendas:</strong> {formatCurrency(Number(semanafiltro.valor_vendas))}</p>
                    <p><strong>Lucro:</strong> {formatCurrency(Number(semanafiltro.lucro))}</p>
                    <p><strong>Valor de Vendas da Semana Anterior:</strong> {formatCurrency(Number(semanafiltro.valor_vendas_semana_anterior))}</p>
                    <p><strong>Lucro da Semana Anterior:</strong> {formatCurrency(Number(semanafiltro.lucro_semana_anterior))}</p>
                    <p><strong>Crescimento Percentual:</strong> {semanafiltro.crescimento_percentual}%</p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes da Semana</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Nenhum dado disponível para a semana selecionada.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
          <div className="flex-1 grid gap-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro para semana específica Sobre o Valor de vendas */}
              {semanafiltro ? (
                <StatCard title="Vendas da semana" label={`Semana ${semanafiltro.semana}`} value={formatCurrency(Number(semanafiltro.valor_vendas))} icon={DollarSign} trends={semanafiltro.crescimento_percentual} color="success" />
              ) : (
                <StatCard title="Vendas da semana" label={`Semana`} value={"R$ 0,00"} icon={DollarSign} color="primary" />
              )}
            
              {/* Filtro para semana específica Sobre o Lucro */}
              {semanafiltro ? (
                <StatCard title="Lucro da semana" label={`Semana ${semanafiltro.semana}`} value={formatCurrency(Number(semanafiltro.lucro))} icon={ShoppingCart} color="success" />
              ) : (
                <StatCard title="Lucro da semana" label={`Semana`} value={"R$ 0,00"} icon={ShoppingCart} color="primary" />   
              )}
            </div>

            <div>
              {/* Filtro para semana específica Para Gráfico */}
              {semanafiltro ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Gráfico de Vendas e Lucro - Semana {semanafiltro.semana}</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <ResponsiveContainer width="90%" height={300}>
                        <BarChart
                          data={[semanafiltro]}
                          layout="vertical"
                          margin={{ top: 20, right: 60, left: 60, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            type="number"
                            tickFormatter={(v: any) => formatShort(Number(v))}
                          />
                          <YAxis
                            type="category"
                            dataKey="semana"
                          />
                          <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                          <Legend />
                          <Bar dataKey="valor_vendas" fill="#2d9d78" name="Vendas">
                            <LabelList
                              dataKey="valor_vendas"
                              position="right"
                              formatter={(v: any) => formatShort(Number(v))}
                            />
                          </Bar>
                          <Bar dataKey="lucro" fill="#ff9800" name="Lucro">
                            <LabelList
                              dataKey="lucro"
                              position="right"
                              formatter={(v: any) => formatShort(Number(v))}
                            />
                          </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-center">Selecione uma semana para ver o gráfico.</p>
              )}
            </div>
          </div>
          


        </main>
      </div>
    </div>
  )
}
