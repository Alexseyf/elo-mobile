# ELO App

## Descrição do Projeto

O ELO App é uma aplicação mobile desenvolvida com React Native e Expo, destinada a facilitar a comunicação entre escolas, professores e responsáveis pelos alunos. A aplicação permite o gerenciamento de diários dos alunos, eventos, cronogramas, e oferece diferentes interfaces para administradores, professores e responsáveis.

## Funcionalidades Principais

- **Sistema de Autenticação**: Login e recuperação de senha
- **Gestão de Usuários**: Cadastro de usuários com diferentes perfis (administrador, professor, responsável)
- **Gestão de Alunos**: Cadastro e visualização de detalhes de alunos
- **Diários de Classe**: Registro e acompanhamento de atividades diárias dos alunos
- **Eventos**: Organização de atividades relacionadas às turmas.
- **Cronogramas**: Organização de atividades relacionadas ao calandário anual da escola
- **Calendário**: Visualização de eventos e atividades.

## Tecnologias Utilizadas

- **React Native**: Framework para desenvolvimento de aplicações mobile
- **Expo**: Plataforma para facilitar o desenvolvimento de aplicações React Native
- **TypeScript**: Linguagem de programação tipada baseada em JavaScript
- **React Navigation/Expo Router**: Navegação entre telas
- **AsyncStorage**: Armazenamento local de dados
- **React Native Calendars**: Componente de calendário
- **React Native Toast Message**: Notificações toast
- **Expo Vector Icons**: Biblioteca de ícones

## Requisitos

Para executar este projeto, você precisará ter instalado:

- Node.js (v18 ou superior)
- npm ou yarn
- Expo CLI
- Um dispositivo físico ou emulador para testes

## Instalação e Execução

### 1. Clone o repositório

```bash
git clone <URL-do-repositório>
cd PROJETO_INTEGRADOR/elo-app
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure o ambiente

Verifique o arquivo `config.ts` e ajuste a URL da API se necessário.

### 4. Inicie a aplicação

```bash
npm start
# ou
yarn start
```

Isso iniciará o servidor de desenvolvimento Expo. Você pode então:

- Escanear o QR code com o aplicativo Expo Go em seu dispositivo físico
- Pressionar `a` para abrir no emulador Android
- Pressionar `i` para abrir no emulador iOS (apenas macOS)
- Pressionar `w` para abrir no navegador web

### 5. Compilação para Android

Para gerar uma versão de teste (APK):

```bash
npm run build:android
# ou
yarn build:android
```

Para gerar uma versão de produção:

```bash
npm run build:android:prod
# ou
yarn build:android:prod
```

## Estrutura do Projeto

```
elo-app/
├── app/                   # Rotas e componentes principais
│   ├── components/        # Componentes reutilizáveis
│   ├── constants/         # Constantes da aplicação
│   ├── users/             # Interfaces específicas para tipos de usuários
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Funções utilitárias
├── assets/                # Recursos estáticos (imagens, fontes)
├── styles/                # Estilos globais
├── config.ts              # Configurações da aplicação
└── package.json           # Dependências e scripts
```

## Fluxo de Desenvolvimento

1. **Início**: Autenticação de usuário na tela inicial
2. **Dashboard**: Acesso a funcionalidades de acordo com o perfil de usuário
3. **Gestão**: Acesso a recursos específicos como cadastro de alunos, eventos, etc.

## Contribuições

Para contribuir com este projeto:

1. Crie um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nome-da-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nome-da-feature`)
5. Abra um Pull Request

Desenvolvido como parte do Projeto Integrador.
