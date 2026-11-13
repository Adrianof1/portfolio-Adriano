/**
 * waf-patterns.js — Detecção contextual de ataques reais
 *
 * Cada regra tem um `test(input)` que retorna true SOMENTE quando
 * o input contém construções que NÃO ocorrem em uso legítimo:
 *   - SQL: combinações de palavras-chave + operadores/comentários
 *   - XSS: tags ativas + contextos de execução JS
 *   - NoSQL: operadores $ do MongoDB numa string de parâmetro
 *   - Path traversal: sequências de subida de diretório
 *
 * Propositalmente NÃO bloqueia:
 *   - "select" sozinho  → busca de produto
 *   - "script" sozinho  → descrição de produto que menciona scripts
 *   - "<b>" ou "<i>"   → rich text sem execução
 */

const RULES = [
  {
    name: 'sql_injection',
    test(raw) {
      const s = safeDecodeAndNormalize(raw);
      return (
        // ' OR 1=1 / ' AND 1=0  (aspas + operador booleano + literal)
        /['"`]\s*(?:or|and)\s+['"`\d]/i.test(s) ||
        // UNION SELECT / UNION ALL SELECT
        /\bunion\s+(?:all\s+)?select\b/i.test(s) ||
        // Comentários SQL como finalizadores: -- / /*
        /(?:--|\/\*).{0,60}(?:select|insert|update|delete|drop|exec)/i.test(s) ||
        // Stacked queries: ; DROP TABLE / ; INSERT INTO
        /;\s*(?:drop|truncate|delete\s+from|insert\s+into|update\s+\w|exec(?:ute)?)\b/i.test(s) ||
        // Blind time-based: SLEEP( / BENCHMARK( / WAITFOR DELAY / PG_SLEEP(
        /\b(?:sleep|benchmark|waitfor\s+delay|pg_sleep)\s*\(/i.test(s) ||
        // Error-based: extractvalue( / updatexml(
        /\b(?:extractvalue|updatexml|load_file|into\s+outfile)\s*\(/i.test(s) ||
        // xp_cmdshell — execução de SO via SQL Server
        /\bxp_cmdshell\b/i.test(s)
      );
    },
  },

  {
    name: 'xss',
    test(raw) {
      const s = safeDecodeAndNormalize(raw);
      return (
        // <script> de qualquer forma: <script, <SCRIPT, <scr\nipt
        /<\s*script\b/i.test(s) ||
        // javascript: como valor de href/src/action
        /javascript\s*:/i.test(s) ||
        // event handlers com código JS real
        /\bon\w{2,15}\s*=\s*['"`]?\s*(?:alert|eval|fetch|location|document\.|window\.)/i.test(s) ||
        // eval( ou Function( com argumento parecendo string de código
        /\beval\s*\(\s*(?:atob|unescape|String\.fromCharCode)/i.test(s) ||
        // data: URI com HTML/JS embutido (vetor de XSS via src=)
        /data:\s*(?:text\/html|application\/javascript)[^,]*,/i.test(s) ||
        // srcdoc= (iframe XSS)
        /\bsrcdoc\s*=/i.test(s) ||
        // Template injection: {{7*7}} / ${7*7} com operadores
        /\$\{[\s\S]{0,60}\}|\{\{[\s\S]{0,60}\}\}/.test(s) &&
          /(?:constructor|process|require|import|fetch|eval)\b/i.test(s)
      );
    },
  },

  {
    name: 'nosql_injection',
    test(raw) {
      const s = safeDecodeAndNormalize(raw);
      return (
        // Operadores MongoDB: $gt, $where, $regex, $ne, etc.
        /\$\s*(?:gt|gte|lt|lte|ne|eq|in|nin|or|and|nor|not|where|regex|expr|type|exists|mod|text|near)\s*["':\s]/i.test(s) ||
        // Tentativa de injeção de objeto via JSON
        /["']\s*:\s*\{\s*"\$/.test(s) ||
        // Prototype pollution
        /__proto__|constructor\s*\[|prototype\s*\[|\["__proto__"\]/i.test(s)
      );
    },
  },

  {
    name: 'path_traversal',
    test(raw) {
      // Aqui NÃO passamos pelo normalize completo para preservar
      // sequências URL-encoded que ainda não foram decodificadas
      const s = raw;
      const d = safeDecodeAndNormalize(raw);
      return (
        // Sequência de subida ≥ 2 níveis: ../../ ou ..\ ou ../..
        /(?:\.{2,}[\/\\]){2,}/.test(d) ||
        // URL-encoded simples: %2e%2e%2f / %2e%2e/
        /%2e{2,}%2f/i.test(s) ||
        // Double-encoded: %252e%252e
        /%252e/i.test(s) ||
        // Caminhos sensíveis de SO direto na URL
        /\/(?:etc\/(?:passwd|shadow|hosts)|proc\/self\/|windows\/system32|boot\.ini)/i.test(d) ||
        // Tentativa de ler arquivos de configuração
        /(?:\.env|\.git\/config|wp-config\.php|config\.php|database\.yml)(?:$|[?#\s])/i.test(d)
      );
    },
  },
];

/**
 * Recebe uma string (valor de parâmetro, path, header) e retorna
 * {blocked: bool, rule: string|null}.
 */
function inspect(value) {
  if (typeof value !== 'string' || value.length < 4) {
    return { blocked: false, rule: null };
  }
  for (const rule of RULES) {
    if (rule.test(value)) {
      return { blocked: true, rule: rule.name };
    }
  }
  return { blocked: false, rule: null };
}

/**
 * Inspeciona todos os parâmetros de uma URL (query string + path).
 * Retorna {blocked, rule, target} onde target é a parte suspeita.
 */
function inspectURL(urlString) {
  let url;
  try { url = new URL(urlString); } catch { return { blocked: false }; }

  // Analisa path
  const pathResult = inspect(url.pathname);
  if (pathResult.blocked) return { ...pathResult, target: url.pathname };

  // Analisa cada parâmetro de query string individualmente
  for (const [key, val] of url.searchParams.entries()) {
    const keyResult  = inspect(key);
    if (keyResult.blocked)  return { ...keyResult,  target: `?${key}` };
    const valResult  = inspect(val);
    if (valResult.blocked)  return { ...valResult,  target: `${key}=${val}` };
  }

  return { blocked: false };
}

function safeDecodeAndNormalize(s) {
  let decoded = s;
  // Decodifica até 3 camadas de encoding (double/triple-encoded payloads)
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch { break; }
  }
  // Normaliza espaços em branco e remove null bytes
  return decoded.replace(/[\x00\r\n\t]+/g, ' ').trim();
}

export { RULES, inspect, inspectURL };
