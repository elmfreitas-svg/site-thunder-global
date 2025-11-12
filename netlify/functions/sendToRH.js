// ================================
// ⚡ THUNDER GLOBAL — SendToRH (Netlify Function)
// ================================

import busboy from "busboy";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// ✅ Carrega variáveis locais apenas fora do ambiente Netlify
dotenv.config();

export const handler = async (event) => {
  console.log("📥 Iniciando processamento do formulário Trabalhe Conosco...");

  // ✅ 1. Apenas POST é permitido
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  // ✅ 2. Retorna uma Promise para processar multipart/form-data
  return new Promise((resolve) => {
    try {
      const headers = event.headers || {};
      const contentType = headers["content-type"] || headers["Content-Type"];
      if (!contentType) {
        console.error("❌ Nenhum Content-Type encontrado.");
        resolve({ statusCode: 400, body: "Content-Type ausente." });
        return;
      }

      // ✅ Instância correta do Busboy (modo compatível com Netlify)
      const bb = busboy({ headers });

      const fields = {};
      let fileBuffer = null;
      let fileName = "";

      // 📎 Captura o arquivo do currículo
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

      // 📄 Captura os campos de texto do formulário
      bb.on("field", (fieldname, value) => {
        fields[fieldname] = value;
        console.log(`📄 Campo recebido: ${fieldname} = ${value}`);
      });

      // ✅ Quando tudo for processado:
      bb.on("finish", async () => {
        try {
          // 3️⃣ Configura o transporte SMTP (Zoho)
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

          // 4️⃣ Monta o e-mail a ser enviado
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
              ? [{ filename: fileName || "curriculo.pdf", content: fileBuffer }]
              : [],
          };

          // 5️⃣ Envia o e-mail
          await transporter.sendMail(mailOptions);
          console.log("✅ E-mail enviado com sucesso ao RH!");

          resolve({
            statusCode: 200,
            body: JSON.stringify({ message: "✅ E-mail enviado com sucesso ao RH!" }),
          });
        } catch (err) {
          console.error("❌ Erro ao enviar e-mail:", err);
          resolve({
            statusCode: 500,
            body: JSON.stringify({ error: "Erro ao enviar e-mail.", details: err.message }),
          });
        }
      });

      // ✅ Converte o corpo base64 do Netlify em buffer
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
