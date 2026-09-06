import "server-only";

import { createHash } from "node:crypto";
import { Resend } from "resend";

const FROM_EMAIL = "GTBS Support <support@gtbsbooks.com>";
const DEFAULT_SUPPORT_EMAIL = "support@gtbsbooks.com";

let resendClient: Resend | undefined;

function getResend() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) throw new Error("Email delivery is not configured.");
  return (resendClient ??= new Resend(apiKey));
}

function supportRecipient() {
  const value =
    process.env.CONTACT_RECIPIENT_EMAIL?.trim() || DEFAULT_SUPPORT_EMAIL;
  if (!/^\S+@\S+\.\S+$/u.test(value)) {
    throw new Error("The support email recipient is invalid.");
  }
  return value;
}

function emailKey(namespace: string, value: string) {
  return `${namespace}-${createHash("sha256").update(value).digest("hex")}`;
}

async function sendEmail(
  payload: {
    to: string;
    subject: string;
    text: string;
    replyTo?: string;
  },
  idempotencyKey: string,
) {
  const { error } = await getResend().emails.send(
    {
      from: FROM_EMAIL,
      ...payload,
    },
    { idempotencyKey },
  );

  if (error) throw new Error("Email delivery failed.");
}

export function sendPasswordResetEmail({
  email,
  resetUrl,
  token,
}: {
  email: string;
  resetUrl: string;
  token: string;
}) {
  return sendEmail(
    {
      to: email,
      subject: "Reset your GTBS Admin password",
      text: [
        "A password reset was requested for your GTBS Admin account.",
        "",
        `Reset your password: ${resetUrl}`,
        "",
        "This secure link expires in one hour and can be used only once.",
        "If you did not request this change, you can ignore this email.",
      ].join("\n"),
    },
    emailKey("admin-password-reset", token),
  );
}

export function sendContactMessage({
  email,
  message,
  name,
  phone,
}: {
  email: string;
  message: string;
  name: string;
  phone: string;
}) {
  const timeBucket = Math.floor(Date.now() / (10 * 60 * 1_000));
  return sendEmail(
    {
      to: supportRecipient(),
      replyTo: email,
      subject: `Website enquiry from ${name.replace(/[\r\n]+/gu, " ")}`,
      text: [
        "A customer submitted the GTBS website contact form.",
        "",
        `Name: ${name}`,
        `Email: ${email}`,
        `Phone: +91 ${phone}`,
        "",
        "Message:",
        message,
      ].join("\n"),
    },
    emailKey("contact", `${email}:${message}:${timeBucket}`),
  );
}

export function sendNewsletterRequest(email: string) {
  const day = new Date().toISOString().slice(0, 10);
  return sendEmail(
    {
      to: supportRecipient(),
      replyTo: email,
      subject: "GTBS newsletter subscription request",
      text: [
        "A visitor requested GTBS newsletter updates.",
        "",
        `Email: ${email}`,
        "",
        "Confirm consent and add the address only through the approved mailing workflow.",
      ].join("\n"),
    },
    emailKey("newsletter", `${email}:${day}`),
  );
}
