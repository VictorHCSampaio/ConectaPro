# Integração com a BrasilAPI — Localização por CEP

## 1. Objetivo

O ConectaPro usa a **BrasilAPI** para geocodificar CEPs de usuários e professores, obtendo latitude e longitude. Essas coordenadas são a base do cálculo de distância (em km) entre aluno e professor.

O cálculo em si **não é feito pela BrasilAPI**: a API apenas devolve os dados do CEP (com coordenadas, quando disponíveis). A conversão de duas coordenadas em distância é feita no backend, pela fórmula de **Haversine**.

## 2. Sobre a BrasilAPI

- **Provedor:** BrasilAPI (open source, gratuito, sem chave de autenticação)
- **Documentação:** https://brasilapi.com.br/docs
- **Endpoint:** `GET {base-url}/api/cep/v2/{cep}` , o `v2` pode retornar o bloco `location` com as coordenadas, o `{cep}` deve conter apenas os 8 dígitos.
- **Base URL:** configurável em `application.properties` (`app.cep.base-url`), sobrescrita pela env `CEP_API_URL`, padrão `https://brasilapi.com.br`.

### Exemplo de resposta

```json
{
  "cep": "08780110",
  "state": "SP",
  "city": "Mogi das Cruzes",
  "neighborhood": "Centro",
  "street": "Rua Doutor Ricardo Vilela",
  "location": {
    "coordinates": { "longitude": "-46.1867", "latitude": "-23.5225" }
  }
}
```

O bloco `location.coordinates` **nem sempre vem preenchido**, depende do CEP e do provedor. O backend trata esse caso: sem coordenadas, o professor aparece na listagem **sem distância**.

## 3. Fluxo da integração

```
Usuário informa o CEP (cadastro de endereço)
        ▼
EnderecoService persiste o Endereco
        ▼
LocalizacaoService consulta a BrasilAPI (/api/cep/v2/{cep})
        ▼
latitude/longitude são gravadas no Endereco
        ▼
Ao listar/buscar professores, ProfessorService calcula a distância (Haversine)
        ▼
Distância em km é devolvida ao frontend
```

## 4. Classes envolvidas

| Classe | Responsabilidade |
|---|---|
| `CepClientConfig` | Configura o `RestClient` da API (base URL + timeout de 5s). |
| `BrasilApiCepResponse` | DTO da resposta, mapeia só os campos usados (`cep`, `state`, `city`, `neighborhood`, `street`, `location.coordinates`). |
| `LocalizacaoService` | Consome a API, extrai/valida as coordenadas, mantém cache em memória por CEP e faz o cálculo de distância (Haversine). |
| `EnderecoService` | Persiste o `Endereco` e grava suas coordenadas, reseta as coordenadas quando o CEP muda. |
| `PreenchimentoCoordenadas` | No startup (`ApplicationReadyEvent`), preenche coordenadas de endereços ainda sem latitude. |
| `ProfessorService` | Orquestra o cálculo aluno↔professor e devolve a distância no `ProfessorResumoResponse`. |
| `Endereco` | Entidade que armazena `latitude`/`longitude` no banco. |

## 5. Cálculo de distância

Feito em `LocalizacaoService.distanciaEmKm(...)`, pela fórmula de **Haversine** (raio da Terra de `6371.0088 km`, resultado arredondado para 1 casa decimal).

A origem e o destino são montados pelo `ProfessorService`:
- **Origem (aluno):** coordenada do CEP do usuário logado.
- **Destino (professor):** coordenadas já gravadas no `Endereco`, se ausentes, resolvidas pelo CEP.
- Sem origem (usuário sem CEP) ou quando o professor consulta a si mesmo, a distância vem `null` e não é exibida.

> Haversine calcula a distância **em linha reta**, não por vias adequado para estimar proximidade. Para distância real de trajeto, seria necessário um serviço de rotas (ex.: Google Distance Matrix, OpenRouteService).

## 6. Armazenamento das coordenadas

As coordenadas ficam nas colunas `latitude`/`longitude` da entidade `Endereco`, preenchidas em dois momentos:
1. **No cadastro/edição de endereço** (`EnderecoService`), recalculadas quando o CEP muda.
2. **No startup** (`PreenchimentoCoordenadas`), para endereços ainda sem coordenada.

Assim, em runtime a distância usa coordenadas **já gravadas no banco**, evitando uma chamada nova à API a cada requisição.

## 7. Tratamento de erros

Já implementado:
- CEP com formato inválido (≠ 8 dígitos): interrompido antes da chamada HTTP.
- CEP sem coordenadas ou resposta nula: professor aparece **sem distância** (log `WARN`).
- Falha da API (timeout, 4xx/5xx): capturada, logada e degradada sem quebrar o fluxo.
- Timeout de 5s (conexão e leitura) e cache em memória por CEP.

Recomendações futuras: retry/circuit breaker (ex.: Resilience4j), fallback por cidade/estado e cache persistente.

## 8. LGPD

CEP e coordenadas permitem inferir a localização do usuário. Devem seguir a Política de Privacidade do ConectaPro (finalidade declarada, armazenamento seguro, exclusão a pedido). Alterações de endereço já são auditadas (`AcaoAuditoria.ENDERECO_ATUALIZADO`).

## 9. Escala futura: PostGIS

Como o banco é PostgreSQL, a extensão **PostGIS** (`ST_Distance`, `ST_DWithin`) permite buscas por raio de forma indexada e eficiente, recomendada caso a busca por proximidade sobre muitos registros se torne frequente (hoje o cálculo é feito em memória, professor a professor).
