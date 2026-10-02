# GuiaFlow Marketing — prévia 0.1

Versão inicial para demonstrações comerciais de sistemas B2B e SaaS.

## Executar

Execute `npm start` e acesse http://localhost:4174.
Para instalar dependências e rodar os testes: `npm ci --omit=dev` e `npm test`.

## Criar uma demonstração

Clique em Novo projeto e informe nome do produto, público-alvo, principal benefício e chamada para ação. O editor cria cinco cenas editáveis: abertura, público, benefício, demonstração e encerramento. Substitua a cena de demonstração por capturas do seu sistema. Personalize os textos, o tema e a narração antes de exportar.

O roteiro inicial é um modelo preenchido com seus dados, sem consumir IA. A integração de IA herdada ainda usa instruções de tutorial; o roteiro comercial por IA, upload de logo e transições adicionais ficam para a próxima etapa. O texto da chamada para ação não cria um botão com link.

## Versões

- `tutorials`: versão preservada para treinamento, onboarding e suporte.
- `tutorials-v0.2.1`: tag do ponto de partida.
- `marketing`: esta prévia comercial.
- `main`: mantém a base de tutoriais.

As bibliotecas locais das portas 4173 e 4174 são independentes. Para copiar um projeto entre elas, exporte e importe JSON. Para capturar diretamente no marketing, configure o Editor da extensão como http://localhost:4174.

Licença MIT. Documentação original: https://github.com/gugamistri/gflow.