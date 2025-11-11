// ================================
// 🔥 THUNDER GLOBAL — SendToRH (Zoho)
// ================================
require("dotenv").config();
const nodemailer = require("nodemailer");
const Busboy = require("busboy");

exports.handler = async (event) => {
  console.log("📥 Iniciando processamento do formulário Trabalhe Conosco...");

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const contentType = event.headers["content-type"] || event.headers["Content-Type"];
  if (!contentType || !contentType.includes("multipart/form-data")) {
    console.error("❌ Content-Type inválido ou ausente.");
    return { statusCode: 400, body: "Tipo de conteúdo inválido." };
  }

  return new Promise((resolve) => {
    try {
      const busboy = new Busboy({ headers: { "content-type": contentType } });

      const fields = {};
      let fileBuffer = null;
      let fileName = "";

      busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
        fileName = filename;
        const chunks = [];
        file.on("data", (data) => chunks.push(data));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
          console.log(`📎 Currículo recebido: ${filename} (${fileBuffer.length} bytes)`);
        });
      });

      busboy.on("field", (fieldname, value) => {
        fields[fieldname] = value;
        console.log(`📄 Campo recebido: ${fieldname} = ${value}`);
      });

      busboy.on("finish", async () => {
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
📱 Telefone: ${fields.telefone || "—"}
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

      const buffer = Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8");
      busboy.end(buffer);
    } catch (err) {
      console.error("❌ Falha ao processar formulário multipart:", err);
      resolve({
        statusCode: 500,
        body: JSON.stringify({ error: "Falha ao processar formulário multipart." }),
      });
    }
  });
};
