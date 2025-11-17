// ================================
// ⚡ THUNDER GLOBAL — SendEmail (Netlify Function)
// ================================

import nodemailer from "nodemailer";

export const handler = async (event) => {
  try {
    // 1. Apenas POST é permitido
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // 2. Lê JSON do corpo
    let data;
    try {
      data = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, body: "Corpo inválido ou ausente." };
    }

    const { nome, email, telefone, empresa, observacoes } = data;

    if (!nome || !email) {
      return { statusCode: 400, body: "Campos obrigatórios faltando." };
    }

    // 3. Configuração SMTP — UMBLER
    const transporter = nodemailer.createTransport({
      host: process.env.UMBLER_HOST,
      port: Number(process.env.UMBLER_PORT),
      secure: false, // obrigatório para Umbler no Netlify
      auth: {
        user: process.env.UMBLER_USER,
        pass: process.env.UMBLER_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Necessário no Netlify
      },
    });

    // 4. Monta o e-mail
    const mailOptions = {
      from: `"${nome} via Thunder Global" <${process.env.UMBLER_USER}>`,
      replyTo: email,
      to: "contato@thunderglobalcorp.com",
      subject: `📅 Agendamento de reunião — ${nome}`,
      text: `
Nova solicitação de reunião:

👤 Nome: ${nome}
📧 E-mail: ${email}
📞 Telefone: ${telefone || "Não informado"}
🏢 Empresa: ${empresa || "Não informada"}
📝 Observações: ${observacoes || "Sem observações"}
      `,
    };

    // 5. Envia o e-mail
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "✔️ E-mail enviado com sucesso!" }),
    };
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erro ao enviar e-mail.",
        details: err.message,
      }),
    };
  }
};
