/**
 * AvisoBloqueio.jsx
 * ─────────────────────────────────────────────────────────────
 * Componente React OPCIONAL — tela de bloqueio estilizada para
 * usar DENTRO do app React (sem depender do voltz-guard.js externo).
 *
 * Use quando quiser ter mais controle sobre o bloqueio
 * (ex: mostrar componentes parciais, fazer animações, etc.)
 *
 * Para uso simples no portfólio HTML, o index.html já cuida de tudo.
 */
import { useEffect } from 'react';

const PAINEL_URL  = 'https://gestao-adriano.vercel.app';
const SUPORTE_WPP = 'https://wa.me/5586999830819';

export default function AvisoBloqueio({ dias = 0, cpfCnpj = '' }) {
  // Trava o scroll da página
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const wppLink = `${SUPORTE_WPP}?text=${encodeURIComponent(
    `Preciso regularizar meu site. CPF/CNPJ: ${cpfCnpj}`
  )}`;

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     '#06060f',
      zIndex:         2147483647,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '20px',
      fontFamily:     '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
    }}>
      {/* Logo */}
      <div style={{ fontSize: '26px', fontWeight: 900, color: '#FFD700', letterSpacing: '-1px', marginBottom: '28px' }}>
        ⚡ VOLTZ
      </div>

      {/* Card */}
      <div style={{
        background:   '#10101e',
        border:       '2px solid rgba(241,65,108,.6)',
        borderRadius: '22px',
        padding:      'clamp(24px,5vw,44px) clamp(20px,5vw,40px)',
        maxWidth:     '480px',
        width:        '100%',
        textAlign:    'center',
        boxShadow:    '0 0 80px rgba(241,65,108,.12)',
      }}>

        {/* Ícone */}
        <div style={{
          width: '76px', height: '76px', borderRadius: '50%',
          background: 'rgba(241,65,108,.1)', border: '2px solid rgba(241,65,108,.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px', fontSize: '34px',
        }}>🚫</div>

        {/* Título */}
        <div style={{
          color: '#f1416c', fontSize: 'clamp(15px,4vw,20px)', fontWeight: 900,
          textTransform: 'uppercase', letterSpacing: '2.5px', marginBottom: '10px',
        }}>
          Site Suspenso
        </div>

        {/* Subtítulo */}
        <p style={{ color: '#888', fontSize: 'clamp(13px,3vw,14px)', lineHeight: 1.7, marginBottom: '20px' }}>
          Este site foi{' '}
          <strong style={{ color: '#f1416c' }}>temporariamente suspenso</strong>
          <br />
          por pendências com a{' '}
          <strong style={{ color: '#FFD700' }}>VOLTZ Soluções</strong>.
        </p>

        {/* Badge dias em atraso */}
        {dias > 0 && (
          <div style={{
            display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
            background: 'rgba(241,65,108,.08)', border: '1px solid rgba(241,65,108,.25)',
            borderRadius: '14px', padding: '12px 24px', marginBottom: '24px', gap: '2px',
          }}>
            <span style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700 }}>
              dias em atraso
            </span>
            <strong style={{ color: '#f1416c', fontSize: 'clamp(32px,8vw,42px)', fontWeight: 900, lineHeight: 1.1 }}>
              {dias}
            </strong>
          </div>
        )}

        {/* Botões */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '22px' }}>
          <a
            href={`${PAINEL_URL}/historico`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              background: 'linear-gradient(135deg,#009ef7,#0070c0)', color: '#fff',
              padding: '15px 24px', borderRadius: '14px', textDecoration: 'none',
              fontWeight: 800, fontSize: 'clamp(13px,3.5vw,15px)',
              boxShadow: '0 4px 20px rgba(0,158,247,.3)',
            }}
          >
            💳 Ver Faturas e Pagar
          </a>
          <a
            href={`${PAINEL_URL}/login`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              color: '#25D366', padding: '13px 24px', borderRadius: '14px',
              textDecoration: 'none', fontWeight: 700, fontSize: 'clamp(12px,3vw,14px)',
              border: '1.5px solid rgba(37,211,102,.35)',
            }}
          >
            🔐 Acessar Painel VOLTZ
          </a>
        </div>

        {/* Rodapé */}
        <div style={{ fontSize: '11px', color: '#333', lineHeight: 1.9 }}>
          Após o pagamento, o acesso volta <strong>automaticamente</strong>.<br />
          Dúvidas?{' '}
          <a href={wppLink} target="_blank" rel="noreferrer" style={{ color: '#555', textDecoration: 'none', fontWeight: 600 }}>
            Fale pelo WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}