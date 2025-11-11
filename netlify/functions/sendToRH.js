// ================================
// 🔥 THUNDER GLOBAL — SendToRH
// ================================

import busboy from "busboy";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export const handler = async (event) => {
  console.log("📥 Iniciando processamento do formulário Trabalhe Conosco...");

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  return new Promise((resolve) => {
    try {
      const headers = event.headers || {};
      const contentType = headers["content-type"] || headers["Content-Type"];
      if (!contentType) {
        console.error("❌ Nenhum Content-Type encontrado.");
        resolve({ statusCode: 400, body: "Content-Type ausente." });
        return;
      }

      // ✅ Instância correta do Busboy (compatível com Netlify)
      const bb = busboy({ headers });

      const fields = {};
      let fileBuffer = null;
      let fileName = "";

      bb.on("file", (fieldname, file, info) => {
        const { filename } = info || {};
        fileName = typeof filename === "string" ? filename : "curriculo.pdf";
        const chunks = [];
        file.on("data", (data) => chunks.push(data));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
          console.log(`📎 Currículo recebido: ${fileName} (${fileBuffer.length} bytes)`);
        });
      });


      bb.on("field", (fieldname, value) => {
        fields[fieldname] = value;
        console.log(`📄 Campo recebido: ${fieldname} = ${value}`);
      });

      bb.on("finish", async () => {
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.ZOHO_HOST,
            port: Number(process.env.ZOHO_PORT),
            secure: process.env.ZOHO_SECURE === "true",
            auth: {
              user: process.env.ZOHO_USER,
              pass: process.env.ZOHO_PASS,
            },
            tls: { rejectUnauthorized: false },
          });

          const mailOptions = {
            from: `"${fields.nome || "Candidato"}" <${process.env.ZOHO_USER}>`,
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
              ? [{ filename: fileName || "curriculo.pdf", content: fileBuffer }]
              : [],
          };

          await transporter.sendMail(mailOptions);
          console.log("✅ E-mail enviado com sucesso!");

          resolve({
            statusCode: 200,
            body: JSON.stringify({ message: "E-mail enviado com sucesso!" }),
          });
        } catch (err) {
          console.error("❌ Erro ao enviar e-mail:", err);
          resolve({ statusCode: 500, body: "Erro ao enviar e-mail: " + err.message });
        }
      });

      const buf = Buffer.from(event.body, "base64");
      bb.end(buf);
    } catch (err) {
      console.error("❌ Falha ao processar formulário multipart:", err);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: "Falha ao processar formulário multipart." }),
      });
    }
  });
};
