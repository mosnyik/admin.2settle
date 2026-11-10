// Both sums use DECIMAL arithmetic; round only the final totals.
const aggregate = `
  SELECT COUNT(*) AS count,
    CAST(ROUND(COALESCE(SUM(amount), 0), 2) AS DECIMAL(30, 2)) AS totalNaira,
    CASE WHEN COALESCE(SUM(conversion_rate IS NULL OR conversion_rate <= 0), 0) > 0
      THEN NULL
      ELSE CAST(ROUND(COALESCE(SUM(CAST(amount AS DECIMAL(30, 10))
        / NULLIF(conversion_rate, 0)), 0), 2) AS DECIMAL(30, 2))
    END AS totalDollar,
    COALESCE(SUM(conversion_rate IS NULL OR conversion_rate <= 0), 0) AS missingRateCount,
    COALESCE(SUM(is_estimate), 0) AS estimatedRateCount
  FROM
`;

// A funded gift remains claimable after its deposit deadline. A receiver means
// it has already been claimed, even if payout has not yet changed its status.
export const GIFT_SUMMARY_QUERY = aggregate + `(
  SELECT COALESCE(settled_fiat_amount, fiat_amount) AS amount,
    rate AS conversion_rate, 0 AS is_estimate
  FROM payment_sessions
  WHERE type = 'gift' AND status = 'confirmed' AND receiver_id IS NULL
    AND is_sandbox = 0 AND fiat_currency = 'NGN'
) AS pending`;

// Requests lock their rate only when fulfilled. The engine permits fulfilling
// created requests and resets the deposit deadline then, so a past expires_at
// alone does not remove an unfulfilled request. Respect explicit terminal status.
export const REQUEST_SUMMARY_QUERY = aggregate + `(
  SELECT fiat_amount AS amount,
    CASE WHEN rate > 0 THEN rate ELSE current_quote.estimate_rate END AS conversion_rate,
    CASE WHEN (rate IS NULL OR rate <= 0) AND current_quote.estimate_rate > 0
      THEN 1 ELSE 0 END AS is_estimate
  FROM payment_sessions
  CROSS JOIN (SELECT CAST(? AS DECIMAL(20, 4)) AS estimate_rate) AS current_quote
  WHERE type = 'request' AND status = 'created'
    AND (deposit_address IS NULL OR deposit_address = '')
    AND is_sandbox = 0 AND fiat_currency = 'NGN'
) AS pending`;
