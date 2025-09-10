import type { RequestHandler } from "express";
import TelegramBot from "node-telegram-bot-api";
import nodemailer from "nodemailer";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(5),
});

export const handleContact: RequestHandler = async (req, res) => {
  const parsed = ContactSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ ok: false, error: parsed.error.flatten() });
  }
  const { name, email, phone, message } = parsed.data;

  const toEmail = process.env.TO_EMAIL || "wehua727@gmail.com";
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const results: Record<string, unknown> = {};

  try {
    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });
      const info = await transporter.sendMail({
        from: `Portfolio Kontakt <${toEmail}>`,
        to: toEmail,
        subject: `Yangi xabar: ${name}`,
        replyTo: email,
        text: `Ism: ${name}\nEmail: ${email}${phone ? `\nTelefon: ${phone}` : ""}\n\n${message}`,
      });
      results.email = { messageId: info.messageId };
    } else {
      results.email = { skipped: true, reason: "SMTP env variables not set" };
    }
  } catch (e) {
    results.email = { error: (e as Error).message };
  }

  // Optional SMS via Twilio
  try {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from = process.env.TWILIO_FROM;
    const to = process.env.TWILIO_TO;
    if (sid && token && from && to) {
      const twilio = await import("twilio");
      const client = twilio.default(sid, token);
      const sms = await client.messages.create({
        body: `Yangi xabar: ${name} (${email}${phone ? ", tel: " + phone : ""})`,
        from,
        to,
      });
      results.sms = { sid: sms.sid };
    } else {
      results.sms = { skipped: true, reason: "Twilio env variables not set" };
    }
  } catch (e) {
    results.sms = { error: (e as Error).message };
  }

  // Telegram notification
  try {
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    
    console.log("=== Telegram Debug Info ===");
    console.log("Token mavjudmi:", !!telegramToken);
    console.log("Chat ID mavjudmi:", !!telegramChatId);
    console.log("Token (qisqacha):", telegramToken ? telegramToken.substring(0, 15) + "..." : "mavjud emas");
    console.log("Chat ID:", telegramChatId || "mavjud emas");
    
    if (telegramToken && telegramChatId) {
      console.log("Telegram bot yaratilmoqda...");
      const bot = new TelegramBot(telegramToken);
      
      console.log("Bot yaratildi, foydalanuvchi haqida ma'lumot olinmoqda...");
      // Bot haqida ma'lumot olish
      bot.getMe().then((botInfo) => {
        console.log("Bot haqida ma'lumot:", botInfo);
      }).catch((error) => {
        console.error("Bot haqida ma'lumot olishda xatolik:", error);
      });
      
      const telegramMessage = `Yangi xabar:\n\nIsm: ${name}\nEmail: ${email}${phone ? `\nTelefon: ${phone}` : ""}\n\nXabar: ${message}`;
      
      console.log("Xabar matni:", telegramMessage);
      console.log("Xabar yuborilmoqda...");
      
      const result = await bot.sendMessage(telegramChatId, telegramMessage);
      console.log("Xabar yuborildi, natija:", result);
      results.telegram = { sent: true, messageId: result.message_id };
    } else {
      const reason = !telegramToken ? "Token mavjud emas" : !telegramChatId ? "Chat ID mavjud emas" : "Noma'lum sabab";
      results.telegram = { skipped: true, reason };
      console.log("Telegram xabar yuborilmadi:", reason);
    }
  } catch (e) {
    console.error("=== Telegram Xatolik ===");
    console.error("Xatolik turi:", e.constructor.name);
    console.error("Xatolik xabari:", e.message);
    console.error("Xatolik steki:", e.stack);
    results.telegram = { error: (e as Error).message };
  }

  return res.json({ ok: true, results });
};