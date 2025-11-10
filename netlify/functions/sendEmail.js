import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { IncomingForm } from "formidable";
import fs from "fs";

dotenv.config();

// Desativa o parsing padrão do Netlify para permitir multipart
export const config = {
  api: {
    bodyParser: false,
  },
};

export const handler = async (event) => {
  try {
    // ✅ 1. Bloqueia qualquer método que não seja POST
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // ✅ 2. Processa formulário multipart
    const data = await new Promise((resolve, reject) => {
      const form = new IncomingForm({ multiples: true });
      form.parse(event, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const { fields, files } = data;
    const { nome, email, telefone, empresa, observacoes } = fields;

    if (!nome || !email) {
      return { statusCode: 400, body: "Campos obrigatórios faltando." };
    }

    // ✅ 3. Configura o SMTP (Umbler)
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
      attachments: [],
    };

    // ✅ 5. Anexa arquivo, se houver
    if (files.curriculo) {
      const file = Array.isArray(files.curriculo) ? files.curriculo[0] : files.curriculo;
      mailOptions.attachments.push({
        filename: file.originalFilename,
        content: fs.readFileSync(file.filepath),
      });
    }

    // ✅ 6. Envia o e-mail
    await transporter.sendMail(mailOptions);
    return { statusCode: 200, body: "✅ E-mail enviado com sucesso!" };

  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err);
    return { statusCode: 500, body: `Erro ao enviar e-mail: ${err.message}` };
  }
};
