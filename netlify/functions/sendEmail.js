import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const handler = async (event) => {
  try {
    // ✅ 1. Bloqueia qualquer método que não seja POST
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // ✅ 2. Garante que o corpo da requisição é um JSON válido
    let data;
    try {
      data = JSON.parse(event.body);
    } catch {
      return { statusCode: 400, body: "Corpo inválido ou ausente." };
    }

    // ✅ 3. Extrai os campos e valida obrigatórios
    const { nome, email, telefone, empresa, observacoes } = data;
    if (!nome || !email) {
      return { statusCode: 400, body: "Campos obrigatórios faltando." };
    }

    // ✅ 4. Configura o SMTP (Umbler)
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

    // ✅ 5. Monta o e-mail
    const mailOptions = {
      from: `"${nome} via Agendamento Thunder Global" <${process.env.UMBLER_USER}>`,
      replyTo: email,
      to: process.env.UMBLER_USER,
      subject: `📅 Agendamento de reunião — ${nome || "Novo contato"}`,
      text: `
Nova solicitação de reunião executiva:

👤 Nome: ${nome}
📧 E-mail: ${email}
📞 Telefone: ${telefone}
🏢 Empresa: ${empresa}
📝 Observações: ${observacoes}
      `,
    };

    // ✅ 6. Envia o e-mail
    await transporter.sendMail(mailOptions);
    return { statusCode: 200, body: "✅ E-mail enviado com sucesso!" };

  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err);
    return { statusCode: 500, body: `Erro ao enviar e-mail: ${err.message}` };
  }
};
