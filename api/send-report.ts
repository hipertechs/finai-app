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
      subject: `📊 Seu Relatório Financeiro - ${reportData.month}`,
      html: `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
          <div style="background: #4f46e5; padding: 40px 20px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 24px;">Relatório Mensal FinAI</h1>
            <p style="opacity: 0.8; margin-top: 10px;">${reportData.month}</p>
          </div>
          <div style="padding: 40px 30px;">
            <p style="font-size: 16px;">Olá, <strong>${userName}</strong>!</p>
            <p style="color: #666; line-height: 1.6;">Aqui está o resumo do seu desempenho financeiro.</p>
            
            <div style="margin: 30px 0;">
              <div style="background: #f8fafc; padding: 20px; border-radius: 15px; border-left: 4px solid #10b981; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Receitas</p>
                <p style="margin: 5px 0 0; font-size: 20px; font-weight: 800; color: #059669;">${reportData.income}</p>
              </div>
              <div style="background: #f8fafc; padding: 20px; border-radius: 15px; border-left: 4px solid #f43f5e; margin-bottom: 10px;">
                <p style="margin: 0; font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Despesas</p>
                <p style="margin: 5px 0 0; font-size: 20px; font-weight: 800; color: #dc2626;">${reportData.expenses}</p>
              </div>
              <div style="background: #f8fafc; padding: 20px; border-radius: 15px; border-left: 4px solid #6366f1;">
                <p style="margin: 0; font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase;">Saldo</p>
                <p style="margin: 5px 0 0; font-size: 20px; font-weight: 800; color: #4f46e5;">${reportData.balance}</p>
              </div>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 10px; color: #94a3b8;">
            FinAI &copy; 2026 • Intelligent Finance System
          </div>
        </div>
      `,
    });

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

