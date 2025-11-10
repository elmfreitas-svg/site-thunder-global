// ===== server.js =====
import express from "express";
import nodemailer from "nodemailer";
import multer from "multer";
import cors from "cors";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==============================
// ⚙️ Configuração do Zoho Mail via .env
// ==============================
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_HOST,
  port: Number(process.env.ZOHO_PORT),
  secure: process.env.ZOHO_SECURE === "true",
  auth: {
    user: process.env.ZOHO_USER,
    pass: process.env.ZOHO_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ==============================
// 📤 Rota principal de envio
// ==============================
app.post("/enviar", upload.single("curriculo"), async (req, res) => {
  try {
    const { nome, email, empresa, cargo, mensagem } = req.body;
    const curriculo = req.file;

    if (!nome || !email) {
      return res.status(400).send("Campos obrigatórios ausentes.");
    }

    const mailOptions = {
      from: process.env.FROM_ADDRESS,
      to: process.env.RH_EMAIL,
      subject: `Novo candidato: ${nome}`,
      text: `
📩 NOVO CANDIDATO RECEBIDO
---------------------------
Nome: ${nome}
E-mail: ${email}
Empresa: ${empresa || "—"}
Cargo: ${cargo || "—"}
Mensagem: ${mensagem || "—"}
      `,
      attachments: curriculo
        ? [{ filename: curriculo.originalname, path: curriculo.path }]
        : []
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ E-mail enviado:", info.messageId);

    if (curriculo) fs.unlinkSync(curriculo.path);

    res.status(200).send("✅ E-mail enviado com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao enviar e-mail:", err);
    res.status(500).send(`Erro ao enviar e-mail: ${err.message}`);
  }
});

// ==============================
// 🚀 Inicialização do servidor
// ==============================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
