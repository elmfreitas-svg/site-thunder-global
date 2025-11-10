import nodemailer from "nodemailer";
import multipart from "parse-multipart";
import dotenv from "dotenv";

dotenv.config();

export const handler = async (event) => {
  console.log("📥 Iniciando processamento do formulário Trabalhe Conosco...");

  try {
    // ✅ Garantir que é POST
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    // ✅ Detectar Content-Type corretamente (local e produção)
    const contentType =
      event.headers["content-type"] || event.headers["Content-Type"];

    if (!contentType) {
      console.error("❌ Nenhum Content-Type encontrado.");
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Content-Type ausente na requisição." }),
      };
    }

    // ✅ Extrair boundary de forma segura
    const boundaryMatch = contentType.match(/boundary=(.*)$/);
    if (!boundaryMatch) {
      console.error("❌ Nenhum boundary encontrado no Content-Type:", contentType);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Boundary ausente no Content-Type." }),
      };
    }

    const boundary = boundaryMatch[1].trim();
    console.log("🧩 Boundary detectado:", boundary);

    // ✅ Converter body base64 para buffer
    const bodyBuffer = Buffer.from(event.body, "base64");

    // ✅ Fazer o parse do multipart (tratamento protegido)
    let parts;
    try {
      parts = multipart.Parse(bodyBuffer, boundary);
    } catch (err) {
      console.error("❌ Falha ao fazer parse do multipart:", err);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Falha ao processar formulário multipart." }),
      };
    }

    // ✅ Extrair campos de texto e arquivo
    const fields = {};
    let filePart = null;

    parts.forEach((part) => {
      if (part.filename) {
        filePart = part;
      } else {
        fields[part.name] = part.data.toString();
      }
    });

    console.log("📄 Campos recebidos:", fields);

    // ✅ Configuração do transporte de e-mail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true" || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // ✅ Corpo do e-mail (HTML)
    const htmlBody = `
      <h2>📩 Nova candidatura recebida</h2>
      <p><strong>Nome:</strong> ${fields.nome || "(não informado)"}</p>
      <p><strong>E-mail:</strong> ${fields.email || "(não informado)"}</p>
      <p><strong>Telefone:</strong> ${fields.telefone || "(não informado)"}</p>
      <p><strong>Cargo pretendido:</strong> ${fields.cargo || "(não informado)"}</p>
      <p><strong>Mensagem:</strong><br>${fields.mensagem || "(vazio)"}</p>
    `;

    // ✅ Montar e-mail com anexo (se existir)
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.SMTP_TO || "rh@thunderglobal.com",
      subject: "🧾 Novo formulário — Trabalhe Conosco",
      html: htmlBody,
      attachments: [],
    };

    if (filePart) {
      mailOptions.attachments.push({
        filename: filePart.filename,
        content: filePart.data,
      });
      console.log(`📎 Currículo anexado: ${filePart.filename}`);
    } else {
      console.log("⚠️ Nenhum currículo anexado.");
    }

    // ✅ Enviar e-mail
    await transporter.sendMail(mailOptions);
    console.log("✅ E-mail enviado com sucesso!");

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "E-mail enviado com sucesso!" }),
    };
  } catch (error) {
    console.error("❌ Erro ao enviar e-mail:", error);
    return {
      statusCode: 500,
      body: "Erro ao enviar e-mail: " + error.message,
    };
  }
};
