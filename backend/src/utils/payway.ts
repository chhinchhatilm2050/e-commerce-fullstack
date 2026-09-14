import crypto from 'crypto';

export const getPaywayReqTime = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear().toString();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * Resolves the PayWay host consistently for every endpoint.
 *
 * IMPORTANT: previously, code that needed a "base" URL read
 * `PAYWAY_CHECKOUT_URL` directly and appended a path to it. If that env var
 * is actually set to the FULL purchase endpoint (a common way people name
 * it, e.g. ".../api/payment-gateway/v1/payments/purchase"), appending
 * another path onto it produces a doubled, malformed URL that 404s -
 * which silently broke status checks (a 404 was being treated as "still
 * pending"). Always go through this helper instead of reading the env
 * vars directly, so every endpoint URL is built from the same clean host.
 */
export const getPaywayBaseUrl = (): string => {
  if (process.env.PAYWAY_BASE_URL) {
    return process.env.PAYWAY_BASE_URL.replace(/\/+$/, '');
  }

  if (process.env.PAYWAY_CHECKOUT_URL) {
    return process.env.PAYWAY_CHECKOUT_URL
      .replace(/\/api\/payment-gateway\/v1\/payments\/[a-z0-9-]+\/?$/i, '')
      .replace(/\/+$/, '');
  }

  return 'https://checkout-sandbox.payway.com.kh';
};

export const getPaywayPurchaseUrl = (): string =>
  `${getPaywayBaseUrl()}/api/payment-gateway/v1/payments/purchase`;

export const getPaywayCheckTransactionUrl = (): string =>
  `${getPaywayBaseUrl()}/api/payment-gateway/v1/payments/check-transaction-2`;

export interface IPaywayPurchaseParams {
  req_time: string;
  merchant_id: string;
  tran_id: string;
  amount: string;
  items?: string;
  shipping?: string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phone?: string;
  type?: string;
  payment_option?: string;
  return_url?: string;
  cancel_url?: string;
  continue_success_url?: string;
  return_deeplink?: string;
  currency?: string;
  custom_fields?: string;
  return_params?: string;
  payout?: string;
  lifetime?: string;
  additional_params?: string;
  google_pay_token?: string;
  skip_success_page?: string;
}

/**
 * Hash generator for /api/payment-gateway/v1/payments/purchase
 * Spec: HMAC-SHA512 of concatenated fields (in exact order below), base64-encoded.
 */
export const generatePurchaseHash = (params: IPaywayPurchaseParams, apiKey: string): string => {
  const req_time = params.req_time ?? '';
  const merchant_id = params.merchant_id ?? '';
  const tran_id = params.tran_id ?? '';
  const amount = params.amount ?? '';
  const items = params.items ?? '';
  const shipping = params.shipping ?? '';
  const firstname = params.firstname ?? '';
  const lastname = params.lastname ?? '';
  const email = params.email ?? '';
  const phone = params.phone ?? '';
  const type = params.type ?? '';
  const payment_option = params.payment_option ?? '';
  const return_url = params.return_url ?? '';
  const cancel_url = params.cancel_url ?? '';
  const continue_success_url = params.continue_success_url ?? '';
  const return_deeplink = params.return_deeplink ?? '';
  const currency = params.currency ?? '';
  const custom_fields = params.custom_fields ?? '';
  const return_params = params.return_params ?? '';
  const payout = params.payout ?? '';
  const lifetime = params.lifetime ?? '';
  const additional_params = params.additional_params ?? '';
  const google_pay_token = params.google_pay_token ?? '';
  const skip_success_page = params.skip_success_page ?? '';

  // Strict concatenation sequence per official ABA PayWay spec
  const rawData =
    req_time +
    merchant_id +
    tran_id +
    amount +
    items +
    shipping +
    firstname +
    lastname +
    email +
    phone +
    type +
    payment_option +
    return_url +
    cancel_url +
    continue_success_url +
    return_deeplink +
    currency +
    custom_fields +
    return_params +
    payout +
    lifetime +
    additional_params +
    google_pay_token +
    skip_success_page;

  return crypto
    .createHmac('sha512', apiKey)
    .update(rawData, 'utf8')
    .digest('base64');
};

/**
 * Hash generator for /api/payment-gateway/v1/payments/check-transaction
 * Spec: HMAC-SHA512 of (req_time + merchant_id + tran_id), base64-encoded.
 *
 * NOTE: This previously used SHA-256, which does not match PayWay's algorithm
 * for this or any other endpoint. PayWay signs every endpoint with the same
 * HMAC-SHA512 scheme for a given merchant API key, so the algorithm here must
 * match generatePurchaseHash. Using SHA-256 caused PayWay to reject the hash
 * on every check-status call.
 */
export const generateCheckStatusHash = (
  req_time: string,
  merchant_id: string,
  tran_id: string,
  apiKey: string
): string => {
  const rawData = req_time + merchant_id + tran_id;

  return crypto
    .createHmac('sha512', apiKey)
    .update(rawData, 'utf8')
    .digest('base64');
};