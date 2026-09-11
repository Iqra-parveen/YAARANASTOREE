import crypto from "crypto";

/**
 * EasyPaisa Hosted Checkout (EasyPay redirect) integration.
 *
 * Based on EasyPaisa's published Merchant Integration Guide (Post Method /
 * redirect flow via easypay.easypaisa.com.pk). Field names and the hash
 * algorithm should be re-verified against your merchant dashboard's current
 * documentation before going live — this was not tested against a live
 * sandbox in this environment.
 *
 * Required env vars:
 *   EASYPAISA_STORE_ID
 *   EASYPAISA_HASH_KEY
 *   EASYPAISA_ENV = "sandbox" | "production"
 */

const SANDBOX_URL = "https://easypaystg.easypaisa.com.pk/easypay/Index.jsf";
const PRODUCTION_URL = "https://easypay.easypaisa.com.pk/easypay/Index.jsf";

export function getEasyPaisaActionUrl() {
  return process.env.EASYPAISA_ENV === "production" ? PRODUCTION_URL : SANDBOX_URL;
}

export type EasyPaisaFields = Record<string, string>;

/**
 * Builds the hosted-checkout fields for an EasyPaisa transaction, including
 * the merchantHashedReq signature.
 */
export function buildEasyPaisaRequest({
  amountPKR,
  orderRefNum,
  postBackURL,
  expiryHours = 1,
}: {
  amountPKR: number;
  orderRefNum: string;
  postBackURL: string;
  expiryHours?: number;
}): EasyPaisaFields {
  const storeId = process.env.EASYPAISA_STORE_ID!;
  const hashKey = process.env.EASYPAISA_HASH_KEY!;

  const now = new Date();
  const expiry = new Date(now.getTime() + expiryHours * 60 * 60 * 1000);
  const fmt = (d: Date) =>
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(
      d.getHours()
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  const fields: EasyPaisaFields = {
    storeId,
    amount: amountPKR.toFixed(1),
    postBackURL,
    orderRefNum,
    expiryDate: fmt(expiry),
    autoRedirect: "1",
    paymentMethod: "MA_PAYMENT_METHOD",
  };

  fields.merchantHashedReq = computeEasyPaisaHash(fields, hashKey);
  return fields;
}

/**
 * EasyPaisa's documented hash: sort field values alphabetically by key name,
 * concatenate with "&", HMAC-SHA256 with the merchant Hash Key, base64 output.
 */
export function computeEasyPaisaHash(fields: EasyPaisaFields, hashKey: string): string {
  const sortedKeys = Object.keys(fields)
    .filter((k) => k !== "merchantHashedReq" && fields[k] !== undefined && fields[k] !== "")
    .sort();
  const joined = sortedKeys.map((k) => fields[k]).join("&");
  return crypto.createHmac("sha256", hashKey).update(joined).digest("base64");
}

export function verifyEasyPaisaCallback(fields: EasyPaisaFields): boolean {
  const hashKey = process.env.EASYPAISA_HASH_KEY!;
  const received = fields.merchantHashedReq || fields.signature;
  if (!received) return false;
  const expected = computeEasyPaisaHash(fields, hashKey);
  try {
    return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
  } catch {
    return false;
  }
}
