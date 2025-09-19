# 🎂 Lembrete de Aniversários

Um site completo para lembrar de aniversários importantes com notificações inteligentes!

## ✨ Características

### ✅ Funcionalidades Implementadas:

1. **Cadastro de Aniversários**
   - ✅ Nome da pessoa (obrigatório)
   - ✅ Data de aniversário (obrigatória)
   - ✅ Foto opcional da pessoa
   - ✅ Validação de campos obrigatórios
   - ✅ Prevenção de duplicatas

2. **Persistência de Dados**
   - ✅ Dados salvos no localStorage do navegador
   - ✅ Informações mantidas mesmo após fechar o site
   - ✅ Recuperação automática ao reabrir

3. **Sistema de Notificações Inteligentes**
   - ✅ **1 mês antes**: "Falta um mês para aniversário de [nome]"
   - ✅ **14 dias antes**: "Faltam 14 dias para aniversário de [nome]"
   - ✅ **7 dias antes**: "Falta uma semana para aniversário de [nome]"
   - ✅ **3 dias antes**: Notificação diária até o dia
   - ✅ **No dia**: "Hoje é aniversário de [nome]! 🎂"
   - ✅ Notificações do navegador (com permissão)
   - ✅ Banners visuais no site

4. **Interface Moderna**
   - ✅ Design responsivo e atrativo
   - ✅ Cards coloridos por urgência
   - ✅ Filtros (Todos, Próximos, Urgentes)
   - ✅ Estatísticas em tempo real
   - ✅ Animações suaves

## 🚀 Como Usar

### 1. Abrir o Site
- Abra o arquivo `index.html` no seu navegador
- Para ver o histórico de versões, clique no botão `v2.1.0` no header ou acesse `changelog.html`
- Ou use um servidor local (recomendado para melhor funcionamento das notificações)

### 2. Permitir Notificações
- O site solicitará permissão para enviar notificações
- Clique em "Permitir" para receber lembretes automáticos

### 3. Adicionar Aniversários
1. Preencha o nome da pessoa (obrigatório)
2. Selecione a data de aniversário
3. Adicione uma foto (opcional)
4. Clique em "Adicionar Aniversário"

### 4. Gerenciar Aniversários
- **Visualizar**: Todos os aniversários aparecem em cards organizados
- **Filtrar**: Use os botões "Todos", "Próximos", "Urgentes"
- **Excluir**: Clique no ícone da lixeira e confirme

### 5. Receber Notificações
- O site verifica automaticamente os aniversários
- Notificações aparecem no navegador e no próprio site
- Sistema funciona mesmo com o site minimizado (com Service Worker)

## 🎨 Visual do Site

### Cores por Urgência:
- **🔴 Urgente** (≤ 7 dias): Vermelho
- **🟡 Próximo** (8-30 dias): Verde-água
- **⚪ Normal** (> 30 dias): Cinza

### Recursos Visuais:
- **Avatar automático**: Se não houver foto, usa a primeira letra do nome
- **Contador de dias**: Texto dinâmico ("Hoje", "Amanhã", "X dias", etc.)
- **Estatísticas**: Mostra total de aniversários e quantos são urgentes

## 🔧 Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Estilos modernos com gradientes e animações
- **JavaScript ES6+**: Lógica de negócio e manipulação do DOM
- **LocalStorage**: Persistência de dados
- **Notification API**: Notificações do navegador
- **Service Worker**: Funcionalidade offline (opcional)
- **Font Awesome**: Ícones
- **Google Fonts**: Tipografia Poppins

## 📱 Compatibilidade

- ✅ Google Chrome
- ✅ Mozilla Firefox
- ✅ Microsoft Edge
- ✅ Safari
- ✅ Mobile (iOS/Android)

## ⚠️ Notas Importantes

1. **Notificações**: Funcionam melhor quando o site é acessado via servidor HTTP (não file://)
2. **Fuso Horário**: Usa o fuso horário local do dispositivo
3. **Privacidade**: Todos os dados ficam armazenados localmente no seu navegador
4. **Backup**: Para não perder dados, evite limpar dados do navegador

## 🔄 Como Funciona o Sistema de Notificações

### Verificação Automática:
1. **Na abertura**: Verifica todos os aniversários imediatamente
2. **A cada hora**: Verificação em background
3. **À meia-noite**: Verificação especial para novos dias

### Lógica de Notificação:
- Cada combinação pessoa+data é notificada apenas uma vez por dia
- Configurações salvas no localStorage para evitar spam
- Reset automático no dia seguinte

## 🛠️ Personalização

O site pode ser facilmente personalizado:

### Alterar Intervalos de Notificação:
Edite as condições no método `checkNotifications()` em `script.js`:

```javascript
// Exemplo: Adicionar notificação para 60 dias
else if (days === 60) {
    shouldNotify = true;
    message = `📅 Faltam 2 meses para o aniversário de ${birthday.name}!`;
}
```

### Alterar Cores:
Modifique as variáveis CSS em `style.css`:

```css
/* Cores personalizadas */
.birthday-card.urgent {
    border-color: #sua-cor;
    background: linear-gradient(135deg, #cor1, #cor2);
}
```

## 🎯 Status do Projeto

✅ **COMPLETO** - Todas as funcionalidades solicitadas foram implementadas:

1. ✅ Cadastro com nome obrigatório e foto opcional
2. ✅ Persistência com localStorage
3. ✅ Sistema completo de notificações (1 mês, 14 dias, 7 dias, diário nos últimos 3)
4. ✅ Interface moderna e responsiva

## 📞 Suporte

Se encontrar algum problema:
1. Verifique se as notificações estão permitidas no navegador
2. Teste em outro navegador
3. Limpe o cache se necessário
4. Use ferramentas de desenvolvedor (F12) para debug

---

**Desenvolvido com ❤️ para nunca mais esquecer um aniversário importante!** 🎉