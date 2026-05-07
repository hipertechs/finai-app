import { Resend } from 'resend';

export const config = {
  runtime: 'edge',
};

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function (req: any) {
  if (req.method === 'OPTIONS') {
    return new Response('OK', { status: 200 });
  }

  try {
    const { reportData, userEmail, userName } = await req.json();

    const data = await resend.emails.send({
      from: 'FinAI <onboarding@resend.dev>',
      to: [userEmail],
      subject: `📊 Relatório Financeiro Completo - ${reportData.month}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          <div style="background: #4f46e5; padding: 40px 20px; text-align: center; color: white;">
            <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; margin-bottom: 5px; opacity: 0.8;">Relatório Personalizado</p>
            <h1 style="margin: 0; font-size: 26px;">Olá, ${userName}! 👋</h1>
            <p style="opacity: 0.8; margin-top: 10px;">Resumo Financeiro de ${reportData.month}</p>
          </div>

          <div style="padding: 30px;">
            <!-- BLOCO PRINCIPAL -->
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
              <div style="flex: 1; background: #f0fdf4; padding: 15px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #15803d; font-weight: bold;">RECEITAS</p>
                <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold; color: #166534;">${reportData.income}</p>
              </div>
              <div style="flex: 1; background: #fef2f2; padding: 15px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #b91c1c; font-weight: bold;">DESPESAS</p>
                <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold; color: #991b1b;">${reportData.expenses}</p>
              </div>
              <div style="flex: 1; background: #eef2ff; padding: 15px; border-radius: 12px; text-align: center;">
                <p style="margin: 0; font-size: 10px; color: #4338ca; font-weight: bold;">SALDO</p>
                <p style="margin: 5px 0 0; font-size: 16px; font-weight: bold; color: #3730a3;">${reportData.balance}</p>
              </div>
            </div>

            <!-- ANÁLISE DE PERFORMANCE -->
            ${reportData.performance ? `
              <div style="margin-top: 30px; padding: 20px; background: #fafafa; border-radius: 15px; border: 1px solid #f0f0f0;">
                <h3 style="margin: 0 0 15px; font-size: 14px; color: #6366f1;">📈 Análise de Performance</h3>
                <p style="font-size: 13px; margin: 5px 0;">• <strong>Taxa de Poupança:</strong> ${reportData.performance.savingsRate}%</p>
                <p style="font-size: 13px; margin: 5px 0;">• <strong>Independência:</strong> ${reportData.performance.survivalMonths} meses de reserva</p>
              </div>
            ` : ''}

            <!-- CONSELHO DA IA -->
            ${reportData.aiAdvice ? `
              <div style="margin-top: 20px; padding: 20px; background: #f5f3ff; border-radius: 15px; border-left: 4px solid #8b5cf6;">
                <h3 style="margin: 0 0 10px; font-size: 14px; color: #7c3aed;">🤖 Recomendação Inteligente (IA)</h3>
                <p style="font-size: 13px; color: #4c1d95; line-height: 1.5; font-style: italic;">"${reportData.aiAdvice}"</p>
              </div>
            ` : ''}

            <!-- CONTROLE DE DÍVIDAS -->
            ${reportData.debts && reportData.debts.length > 0 ? `
              <div style="margin-top: 20px;">
                <h3 style="margin: 0 0 15px; font-size: 14px; color: #334155;">💳 Controle de Dívidas</h3>
                <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
                  <tr style="background: #f8fafc; text-align: left;">
                    <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Dívida</th>
                    <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Valor</th>
                    <th style="padding: 10px; border-bottom: 1px solid #e2e8f0;">Vencimento</th>
                  </tr>
                  ${reportData.debts.map((d: any) => `
                    <tr>
                      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${d.name}</td>
                      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #dc2626;">${d.balance}</td>
                      <td style="padding: 10px; border-bottom: 1px solid #f1f5f9;">${d.dueDate}</td>
                    </tr>
                  `).join('')}
                </table>
              </div>
            ` : ''}

          </div>

          <div style="background: #f8fafc; padding: 20px; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #eee;">
            Enviado via FinAI Intelligent System • ${new Date().toLocaleDateString('pt-BR')}
          </div>
        </div>
      `,
    });

    if (data.error) {
      return new Response(JSON.stringify({ error: data.error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

