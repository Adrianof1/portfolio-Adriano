/**
 * useVoltzGuard.js
 * ─────────────────────────────────────────────────────────────
 * Hook React OPCIONAL para projetos que precisam verificar o
 * status de bloqueio de dentro do código (ex: esconder botões,
 * mostrar avisos antes do bloqueio total, etc.)
 *
 * O voltz-guard.js no index.html já faz o bloqueio visual sozinho.
 * Este hook é só para uso avançado dentro dos componentes React.
 *
 * USO:
 *   import { useVoltzGuard } from './hooks/useVoltzGuard';
 *
 *   function MinhaPage() {
 *     const { bloqueado, diasAtraso, carregando } = useVoltzGuard('12345678901');
 *
 *     if (bloqueado) return <AvisoBloqueio dias={diasAtraso} />;
 *     return <ConteudoNormal />;
 *   }
 */
import { useState, useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_API_URL
  || 'https://api-voltz-sistema-de-pagamentos.onrender.com';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export function useVoltzGuard(cpfCnpj) {
  const [estado, setEstado] = useState({
    carregando: true,
    bloqueado:  false,
    diasAtraso: 0,
    erro:       null,
  });

  useEffect(() => {
    const doc = cpfCnpj ? String(cpfCnpj).replace(/\D/g, '') : null;
    if (!doc || doc.length < 11) {
      setEstado({ carregando: false, bloqueado: false, diasAtraso: 0, erro: null });
      return;
    }

    // Verificar cache da sessão
    const CACHE_KEY = `voltz_s_${doc}`;
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw);
        if (Date.now() - cached.ts < CACHE_TTL) {
          setEstado({
            carregando: false,
            bloqueado:  cached.data.bloqueado === true,
            diasAtraso: cached.data.dias_atraso || 0,
            erro:       null,
          });
          return;
        }
      }
    } catch {}

    // Buscar na API
    fetch(`${BACKEND_URL}/api/site-status/${doc}`, {
      method: 'GET',
      cache:  'no-store',
      headers: { Accept: 'application/json' },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (!data) {
          setEstado({ carregando: false, bloqueado: false, diasAtraso: 0, erro: null });
          return;
        }
        // Gravar cache
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
        } catch {}

        setEstado({
          carregando: false,
          bloqueado:  data.bloqueado === true,
          diasAtraso: data.dias_atraso || 0,
          erro:       null,
        });
      })
      .catch(err => {
        // Falha silenciosa — NÃO bloqueia por erro de rede
        setEstado({ carregando: false, bloqueado: false, diasAtraso: 0, erro: err.message });
      });
  }, [cpfCnpj]);

  return estado;
}