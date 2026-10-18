# Pomodoro Focus

Aplicação web leve para organizar períodos de concentração e descanso usando a técnica Pomodoro. O sistema oferece um temporizador visual, alternância entre foco e descanso, alarmes personalizáveis e configurações persistidas no navegador.

## Funcionalidades

- Temporizador independente para foco e descanso.
- Durações configuráveis: de 1 a 120 minutos para foco e de 1 a 60 minutos para descanso.
- Controles para iniciar, pausar, reiniciar e avançar para a próxima etapa.
- Alternância manual entre os modos **Foco** e **Descanso**.
- Contador de períodos de foco concluídos.
- Alarme distinto para o início do descanso e para o retorno ao foco.
- Pré-visualização de alarmes e opção de restaurar o som padrão.
- Personalização dos alarmes com arquivos de áudio do dispositivo.
- Salvamento local das durações e dos arquivos de áudio no navegador.
- Interface responsiva, com cores diferentes para cada etapa.

## Como usar

Não é necessário instalar dependências nem configurar um servidor.

1. Baixe ou clone este projeto.
2. Abra o arquivo `index.html` em um navegador moderno.
3. Ajuste os tempos de foco e descanso, se desejar.
4. Selecione um som para cada alarme ou mantenha os sons padrão.
5. Clique em **Iniciar** para começar. Use os controles para pausar, reiniciar ou avançar entre as etapas.

O navegador pode exigir uma interação do usuário antes de permitir a reprodução de áudio. Mantenha a página aberta para que o temporizador e os alarmes funcionem.

## Como funciona

O temporizador começa no modo **Foco**. Ao concluir esse período, o sistema contabiliza um ciclo, toca o alarme de início do descanso e inicia a contagem do descanso. Quando o descanso termina, toca o alarme de retorno ao foco e começa um novo período de foco.

Os modos também podem ser selecionados manualmente. Reiniciar restaura a duração completa do modo atual; avançar alterna para o outro modo. Alterar a duração atualiza a contagem imediatamente quando o temporizador está parado.

Os alarmes padrão são gerados no navegador. Um arquivo de áudio personalizado pode ser escolhido para cada transição, reproduzido para pré-visualização ou removido para voltar ao som padrão.

## Armazenamento e privacidade

As durações são salvas no `localStorage` e os alarmes personalizados no `IndexedDB` do navegador. Os dados permanecem no dispositivo e no perfil do navegador em que foram configurados; limpar os dados do site ou usar outro navegador pode removê-los ou torná-los indisponíveis. Os arquivos de áudio escolhidos não são enviados a um servidor.

## Tecnologias

- HTML
- CSS
- JavaScript
- Web Audio API, para os alarmes padrão
- IndexedDB e `localStorage`, para salvar as configurações localmente

## Estrutura do projeto

```text
pomodoro/
├── index.html       # estrutura e conteúdo da aplicação
├── css/
│   └── style.css    # layout, responsividade e estilos
└── js/
    └── script.js    # temporizador, alarmes e persistência
```
