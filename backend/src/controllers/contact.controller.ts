import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { z } from 'zod';

const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  courseId: z.string().optional(),
  courseName: z.string().optional(),
});

function createTransport() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error('SMTP configuration is missing. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

export async function postContact(req: Request, res: Response) {
  try {
    const body = contactSchema.parse(req.body);

    const to = process.env.CONTACT_TO || process.env.SMTP_USER!;
    const from = process.env.CONTACT_FROM || process.env.SMTP_USER!;

    const transporter = createTransport();

    const subject = `[Contact] ${body.name} is interested${body.courseName ? ` in ${body.courseName}` : ''}`;
    const lines = [
      `Name: ${body.name}`,
      `Email: ${body.email}`,
      body.courseId ? `Course ID: ${body.courseId}` : undefined,
      body.courseName ? `Course: ${body.courseName}` : undefined,
      '',
      'Message:',
      body.message,
    ].filter(Boolean).join('\n');

    await transporter.sendMail({
      to,
      from,
      replyTo: body.email,
      subject,
      text: lines,
    });

    return res.json({ ok: true });
  } catch (err: any) {
    if (err?.issues) {
      return res.status(400).json({ message: 'Invalid input', details: err.issues });
    }
    return res.status(500).json({ message: err?.message || 'Failed to send message' });
  }
}
