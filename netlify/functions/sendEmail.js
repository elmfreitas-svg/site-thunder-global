import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configuração Netlify para desativar o bodyParser padrão
export const config = {
  api: {
    bodyParser: true, // Agora usamos JSON direto
  },
};

export const handler = async (event) => {
  try {
    // ✅ 1. Bloqueia métodos que não sejam POST
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // ✅ 2. Processa JSON do script.js
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

    // ✅ 3. Configura SMTP (Umbler)
    const transporter = nodemailer.createTransport({
      host: process.env.UMBLER_HOST,
      port: Number(process.env.UMBLER_PORT),
      secure: process.env.UMBLER_SECURE === "true",
      auth: {
        user: process.env.UMBLER_USER,
        pass: process.env.UMBLER_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    // ✅ 4. Monta o e-mail
    const mailOptions = {
      from: `"${nome} via Agendamento Thunder Global" <${process.env.UMBLER_USER}>`,
      replyTo: email,
      to: "contato@thunderglobalcorp.com", // envio direto
      subject: `📅 Agendamento de reunião — ${nome || "Novo contato"}`,
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

    return { statusCode: 200, body: "✅ E-mail enviado com sucesso!" };

  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err);
    return { statusCode: 500, body: `Erro ao enviar e-mail: ${err.message}` };
  }
};
