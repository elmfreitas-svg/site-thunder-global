// netlify/functions/sendEmail.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// ✅ Carrega variáveis locais (.env) apenas em ambiente de desenvolvimento
dotenv.config();

// ✅ Configuração do Netlify Function
export const config = {
  api: {
    bodyParser: false, // O Netlify já entrega o corpo como string
  },
};

export const handler = async (event) => {
  try {
    // ✅ 1. Permite apenas método POST
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // ✅ 2. Lê e valida os dados JSON do corpo
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

    // ✅ 3. Configuração do SMTP (Umbler)
    const transporter = nodemailer.createTransport({
      host: process.env.UMBLER_HOST,
      port: Number(process.env.UMBLER_PORT),
      secure: process.env.UMBLER_SECURE === "true",
      auth: {
        user: process.env.UMBLER_USER,
        pass: process.env.UMBLER_PASS,
      },
      tls: {
        rejectUnauthorized: false, // Necessário em alguns ambientes do Netlify
      },
    });

    // ✅ 4. Monta o e-mail
    const mailOptions = {
      from: `"${nome} via Thunder Global" <${process.env.UMBLER_USER}>`,
      replyTo: email,
      to: "contato@thunderglobalcorp.com",
      subject: `📅 Agendamento de reunião — ${nome}`,
      text: `
Nova solicitação de reunião executiva:

👤 Nome: ${nome}
📧 E-mail: ${email}
📞 Telefone: ${telefone || "Não informado"}
🏢 Empresa: ${empresa || "Não informada"}
📝 Observações: ${observacoes || "Sem observações"}
      `,
    };

    // ✅ 5. Envia o e-mail
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "✅ E-mail enviado com sucesso!" }),
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
