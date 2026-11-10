// Keep arithmetic in MySQL DECIMAL and round only after summing all payments.
// fiat_amount is already net of fees in the payment engine. The actual payout
// can differ after an underpayment/overpayment, so prefer settled_fiat_amount.
export const VOLUME_QUERY = `
  SELECT
    CAST(ROUND(COALESCE(SUM(COALESCE(settled_fiat_amount, fiat_amount)), 0), 2)
      AS DECIMAL(30, 2)) AS totalNaira,
    CASE WHEN COALESCE(SUM(rate IS NULL OR rate <= 0), 0) > 0 THEN NULL
      ELSE CAST(ROUND(COALESCE(SUM(
        CAST(COALESCE(settled_fiat_amount, fiat_amount) AS DECIMAL(30, 10))
        / NULLIF(rate, 0)
      ), 0), 2) AS DECIMAL(30, 2))
    END AS totalDollar,
    COUNT(*) AS transactionCount,
    COALESCE(SUM(rate IS NULL OR rate <= 0), 0) AS missingRateCount,
    COALESCE(SUM(settled_at IS NULL), 0) AS fallbackDateCount
  FROM payment_sessions
  WHERE status = 'settled'
    AND fiat_currency = 'NGN'
    AND is_sandbox = 0
    AND COALESCE(settled_at, created_at) >= FROM_UNIXTIME(?)
    AND COALESCE(settled_at, created_at) < FROM_UNIXTIME(?)
    AND COALESCE(settled_at, created_at) <= CURRENT_TIMESTAMP
`;
