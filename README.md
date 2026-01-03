# Systock — Sistema de Gestão de Estoque com Dashboard Analítico

## 1. Visão Geral

O **Systock** é um sistema completo de gestão de estoque e produtos, desenvolvido com foco em controle operacional e análise de dados para tomada de decisão. O projeto foi concebido como uma solução moderna, escalável e orientada a dados, integrando um front-end web robusto com APIs independentes para persistência e análise das informações.

O sistema permite o gerenciamento de **produtos, clientes, estoque e movimentações**, além de fornecer um **dashboard analítico** com métricas consolidadas, indicadores visuais e dados agregados.

Este projeto foi desenvolvido com o objetivo de compor portfólio profissional, demonstrando domínio em arquitetura web moderna, APIs REST, análise de dados e visualização de informações.

---

## 2. Arquitetura do Sistema

A arquitetura do Systock segue o modelo **frontend desacoplado de múltiplas APIs**, garantindo escalabilidade, organização e separação de responsabilidades.

### Visão Geral da Arquitetura

* **Front-end**: Aplicação web desenvolvida em React com Next.js
* **API Principal (FastAPI)**: Responsável pelos dados operacionais do sistema
* **API Analítica (FastAPI)**: Responsável por processar, agregar e retornar dados para o dashboard
* **Banco de Dados**: PostgreSQL
* **Seed de Dados**: Gerador automático para popular o banco com dados fictícios de produtos e estoque

---

## 3. Tecnologias Utilizadas

### Front-end

* React
* Next.js
* TypeScript
* Tailwind CSS
* Recharts (gráficos e visualizações)
* Axios / Fetch API

### Back-end

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* PostgreSQL

### DevOps e Ferramentas

* Docker e Docker Compose
* Git e GitHub
* Render (deploy das APIs)
* Seed de dados automatizado

---

## 4. Front-end (React + Next.js)

O front-end foi desenvolvido utilizando **Next.js**, explorando renderização otimizada, organização modular de páginas e componentes reutilizáveis.

### Principais Funcionalidades

* Cadastro e gerenciamento de produtos
* Controle de estoque
* Cadastro de clientes
* Consumo de API REST
* Dashboard com gráficos e indicadores
* Interface responsiva e moderna

### Estrutura Geral

* `pages/` — Rotas da aplicação
* `components/` — Componentes reutilizáveis
* `services/` — Integração com APIs
* `hooks/` — Hooks customizados
* `utils/` — Funções utilitárias

---

## 5. APIs FastAPI

### 5.1 API de Dados do Sistema

Responsável por armazenar e gerenciar os dados principais:

* Produtos
* Clientes
* Estoque
* Movimentações

#### Características

* API REST
* Validação com Pydantic
* ORM com SQLAlchemy
* Documentação automática via Swagger

---

### 5.2 API Analítica (Dashboard)

API dedicada exclusivamente à **análise e agregação de dados**, evitando sobrecarga na API principal.

#### Exemplos de Dados Retornados

* Total de produtos em estoque
* Valor total do estoque
* Vendas por período
* Indicadores semanais e mensais

Essa separação permite maior escalabilidade e melhor organização do domínio da aplicação.

---

## 6. Banco de Dados

O banco de dados foi modelado seguindo boas práticas de **normalização**, garantindo integridade e consistência dos dados.

### Principais Entidades

* Produto
* Cliente
* Estoque
* Movimentação

O sistema utiliza PostgreSQL como banco relacional.

---

## 7. Seed de Dados

Para facilitar testes, validações e demonstrações, foi desenvolvido um **gerador de dados fictícios (seed)**.

### Características do Seed

* Geração automática de produtos
* Quantidades de estoque aleatórias
* Dados consistentes para análise

Esse recurso permite que o sistema seja executado imediatamente após a instalação.

---

## 8. Dashboard e Análise de Dados

O dashboard é um dos principais diferenciais do projeto.

### Funcionalidades do Dashboard

* Gráficos de barras e linhas
* Indicadores de desempenho
* Análise temporal (semanal/mensal)
* Dados consolidados em tempo real via API analítica

Os dados são apresentados de forma clara, facilitando a tomada de decisão.

---

## 9. Execução do Projeto Localmente

### Pré-requisitos

* Node.js
* Python 3.10+
* Docker
* PostgreSQL

### Passos Gerais

1. Clonar o repositório
2. Configurar variáveis de ambiente
3. Subir containers com Docker Compose
4. Executar seed de dados
5. Iniciar front-end

---

## 10. Objetivo do Projeto

O Systock foi desenvolvido com os seguintes objetivos:

* Demonstrar domínio em desenvolvimento full stack
* Aplicar conceitos de arquitetura limpa e escalável
* Trabalhar análise e visualização de dados
* Criar um projeto realista para portfólio profissional

---

## 11. Possíveis Evoluções

* Autenticação e controle de acesso
* Relatórios exportáveis (PDF/Excel)
* Multi-empresa
* Integração com sistemas externos
* Inteligência artificial para previsões de estoque

---

## 12. Autor

**Kelvyn Leôncio Andrade Lima**
Desenvolvedor Full Stack
Projeto desenvolvido para fins acadêmicos e portfólio profissional.
