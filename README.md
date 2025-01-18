<div style="display: flex; gap: 10px; align-items: center;">
  <h3 style="font-size: 30px;">Gamefetch</h3>
</div>

> **Importante:** O site agrega fontes externas com autoria de terceiros.
---

### Como adicionar novas fontes?

- Clone o repositório;
- No diretório `/assets/js/` do projeto, crie um arquivo chamado `config.js` ;
- Precisa seguir esse modelo:

```javascript
let jsonSources = [
    'sua-fonte.json',
    'sua-outra-fonte.json',
];

function getJsonSources() {
    return jsonSources;
}
```

---

### Qual estrutura do json?

```json
{
  "name": "nome-fonte | detalhe-da-fonte",
  "downloads": [
    {
      "title": "nome-do-jogo",
      "uris": [
        "magnet-ou-link-direto"
      ],
      "uploadDate": "data-upload",
      "fileSize": "tamanho-arquivo"
},
```
---