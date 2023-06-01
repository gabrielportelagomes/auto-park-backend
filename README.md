# AutoPark - back-end

## Sobre

Back-end para a aplicação AutoPark, um gerenciador de estacionamento.

## Como executar em desenvolvimento

1. Clone este repositório
2. Instale todas as dependências

```bash
npm i
```

3. Crie um banco de dados PostgreSQL com qualquer nome
4. Configure o arquivo `.env.development` usando como referência o arquivo `.env.example` 
5. Execute todas as migrações

```bash
npm run prisma:migrate:dev
```

6. Popule o banco de dados

```bash
npm run dev:seed
```

7. Execute o back-end no ambiente de desenvolvimento:

```bash
npm run dev
```

## Como executar os testes

1. Siga os passos da seção anterior
2. Configure o arquivo `.env.test` usando como referência o arquivo `.env.example` 
3. Execute os testes:
   (localmente)

```bash
npm run test
```

## Building e execução para ambiente de produção

```bash
npm run build
npm run start
```

## Executar em um contâiner do Docker

1. Configure os arquivos `.env` necessários
2. Execute o comando
```bash
docker compose up
```

## O que fazer quando adicionar novas ENV VARIABLES

- Adicione elas no arquivo `.env.example`
- Adicione elas nos seus arquivos locais `.env.development` e `.env.test`
- Adicione elas nos arquivos `.github/workflows/`
