import crypto from "crypto";

/**
 * JazzCash Hosted Checkout (Page Redirection) integration.
 *
 * Based on JazzCash's published "Payment Gateway Integration Guide for Merchants"
 * (Hosted Checkout / Page Redirection flow). You MUST verify field names and the
 * hash algorithm against the current version of that guide from your JazzCash
 * merchant dashboard before going live — payment gateway specs do change between
 * versions, and this was not tested against a live sandbox in this environment.
 *
 * Required env vars:
 *   JAZZCASH_MERCHANT_ID
 *   JAZZCASH_PASSWORD
 *   JAZZCASH_INTEGRITY_SALT
 *   JAZZCASH_ENV = "sandbox" | "production"
 */

const SANDBOX_URL = "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
const PRODUCTION_URL = "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";

export function getJazzCashActionUrl() {
  return process.env.JAZZCASH_ENV === "production" ? PRODUCTION_URL : SANDBOX_URL;
}

function pad(n: number, len: number) {
  return n.toString().padStart(len, "0");
}

function formatTxnDateTime(date: Date) {
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1, 2) +
    pad(date.getDate(), 2) +
    pad(date.getHours(), 2) +
    pad(date.getMinutes(), 2) +
    pad(date.getSeconds(), 2)
  );
}

export type JazzCashFields = Record<string, string>;

/**
 * Builds the full set of hosted-checkout fields (excluding pp_SecureHash) for a
 * transaction, then computes and attaches pp_SecureHash.
 */
export function buildJazzCashRequest({
  amountPKR,
  billReference,
  description,
  returnUrl,
  txnRefNo,
}: {
  amountPKR: number;
  billReference: string;
  description: string;
  returnUrl: string;
  txnRefNo: string;
}): JazzCashFields {
  const merchantId = process.env.JAZZCASH_MERCHANT_ID!;
  const password = process.env.JAZZCASH_PASSWORD!;
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT!;

  const now = new Date();
  const expiry = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour expiry

  const fields: JazzCashFields = {
    pp_Version: "1.1",
    pp_TxnType: "MWALLET",
    pp_Language: "EN",
    pp_MerchantID: merchantId,
    pp_Password: password,
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(Math.round(amountPKR * 100)), // paisa
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: formatTxnDateTime(now),
    pp_TxnExpiryDateTime: formatTxnDateTime(expiry),
    pp_BillReference: billReference,
    pp_Description: description,
    pp_ReturnURL: returnUrl,
  };

  fields.pp_SecureHash = computeJazzCashHash(fields, integritySalt);
  return fields;
}

/**
 * JazzCash's documented hash: sort all non-empty pp_/ppmpf_ fields alphabetically
 * by key, join their values with "&", prefix with the Integrity Salt, then
 * HMAC-SHA256 using the Integrity Salt as the key, uppercased hex output.
 */
export function computeJazzCashHash(fields: JazzCashFields, integritySalt: string): string {
  const sortedKeys = Object.keys(fields)
    .filter((k) => k !== "pp_SecureHash" && fields[k] !== undefined && fields[k] !== "")
    .sort();

  const joined = sortedKeys.map((k) => fields[k]).join("&");
  const hashInput = `${integritySalt}&${joined}`;

  return crypto.createHmac("sha256", integritySalt).update(hashInput).digest("hex").toUpperCase();
}

export function verifyJazzCashCallback(fields: JazzCashFields): boolean {
  const integritySalt = process.env.JAZZCASH_INTEGRITY_SALT!;
  const receivedHash = fields.pp_SecureHash;
  const expected = computeJazzCashHash(fields, integritySalt);
  return !!receivedHash && crypto.timingSafeEqual(Buffer.from(receivedHash), Buffer.from(expected));
}
