// ================================
// ⚡ THUNDER GLOBAL — SendToRH (Netlify Function)
// ================================

import busboy from "busboy";
import nodemailer from "nodemailer";
// ❌ REMOVIDO: import dotenv from "dotenv";
// ❌ REMOVIDO: dotenv.config();

export const handler = async (event) => {
  console.log("📥 Iniciando processamento do formulário Trabalhe Conosco...");

  // Apenas POST é permitido
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // Processa multipart/form-data
  return new Promise((resolve) => {
    try {
      const headers = event.headers || {};
      const contentType = headers["content-type"] || headers["Content-Type"];

      if (!contentType) {
        console.error("❌ Nenhum Content-Type encontrado.");
        resolve({ statusCode: 400, body: "Content-Type ausente." });
        return;
      }

      const bb = busboy({ headers });

      const fields = {};
      let fileBuffer = null;
      let fileName = "";

      // Captura arquivo
      bb.on("file", (fieldname, file, info) => {
        const { filename } = info || {};
        fileName = filename || "curriculo.pdf";

        const chunks = [];
        file.on("data", (data) => chunks.push(data));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
          console.log(`📎 Currículo recebido: ${fileName} (${fileBuffer.length} bytes)`);
        });
      });

      // Campos de texto
      bb.on("field", (fieldname, value) => {
        fields[fieldname] = value;
        console.log(`📄 Campo: ${fieldname} = ${value}`);
      });

      // Finaliza processamento
      bb.on("finish", async () => {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.ZOHO_HOST,
            port: Number(process.env.ZOHO_PORT),
            secure: process.env.ZOHO_SECURE === "false",
            auth: {
              user: process.env.ZOHO_USER,
              pass: process.env.ZOHO_PASS,
            },
            tls: { rejectUnauthorized: false },
          });

          const mailOptions = {
            from: `"${fields.nome || "Candidato"} via Trabalhe Conosco" <${process.env.ZOHO_USER}>`,
            replyTo: fields.email || process.env.ZOHO_USER,
            to: process.env.RH_EMAIL,
            subject: `💼 Novo candidato — ${fields.nome || "Sem nome"}`,
            text: `
📩 NOVO CURRÍCULO RECEBIDO

👤 Nome: ${fields.nome || "—"}
📧 E-mail: ${fields.email || "—"}
🏢 Empresa: ${fields.empresa || "—"}
🎯 Cargo: ${fields.cargo || "—"}
📝 Mensagem: ${fields.mensagem || "—"}
            `,
            attachments: fileBuffer
              ? [{ filename: fileName, content: fileBuffer }]
              : [],
          };

          await transporter.sendMail(mailOptions);

          console.log("✅ E-mail enviado ao RH!");

          resolve({
            statusCode: 200,
            body: JSON.stringify({ message: "E-mail enviado com sucesso ao RH!" }),
          });
        } catch (err) {
          console.error("❌ Erro de envio:", err);
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: "Erro ao enviar e-mail.", details: err.message }),
          });
        }
      });

      // Converte body base64
      const buffer = Buffer.from(event.body, "base64");
      bb.end(buffer);
    } catch (err) {
      console.error("❌ Falha ao processar multipart:", err);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: "Falha ao processar formulário multipart." }),
      });
    }
  });
};
