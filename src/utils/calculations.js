/**
 * Mortgage calculation utilities
 */

/**
 * Calculate monthly payment using standard annuity formula.
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function monthlyPayment(principal, annualRate, totalMonths) {
  if (principal <= 0 || totalMonths <= 0) return 0;
  if (annualRate === 0) return principal / totalMonths;
  const r = annualRate / 100 / 12;
  const factor = Math.pow(1 + r, totalMonths);
  return principal * (r * factor) / (factor - 1);
}

/**
 * Generate full amortization table month by month.
 * Supports dual-rate: initial rate for initialMonths, then standard rate.
 */
export function amortizationTable(principal, annualRate, termYears, hasInitialRate, initialRate, initialRatePeriod) {
  const totalMonths = termYears * 12;
  const rows = [];
  let balance = principal;

  if (hasInitialRate && initialRate != null && initialRatePeriod > 0) {
    const initialMonths = initialRatePeriod * 12;
    const phase1Payment = monthlyPayment(principal, initialRate, totalMonths);

    // Phase 1: initial rate
    for (let m = 1; m <= initialMonths && balance > 0.01; m++) {
      const r = initialRate / 100 / 12;
      const interest = balance * r;
      const principalPart = phase1Payment - interest;
      balance = Math.max(0, balance - principalPart);
      rows.push({
        month: m,
        payment: phase1Payment,
        interest,
        principal: principalPart,
        balance,
        phase: 1,
      });
    }

    // Phase 2: standard rate on remaining balance
    const remainingMonths = totalMonths - initialMonths;
    if (remainingMonths > 0 && balance > 0.01) {
      const phase2Payment = monthlyPayment(balance, annualRate, remainingMonths);
      for (let m = initialMonths + 1; m <= totalMonths && balance > 0.01; m++) {
        const r = annualRate / 100 / 12;
        const interest = balance * r;
        const principalPart = phase2Payment - interest;
        balance = Math.max(0, balance - principalPart);
        rows.push({
          month: m,
          payment: phase2Payment,
          interest,
          principal: principalPart,
          balance,
          phase: 2,
        });
      }
    }
  } else {
    // Single rate
    const payment = monthlyPayment(principal, annualRate, totalMonths);
    for (let m = 1; m <= totalMonths && balance > 0.01; m++) {
      const r = annualRate / 100 / 12;
      const interest = balance * r;
      const principalPart = payment - interest;
      balance = Math.max(0, balance - principalPart);
      rows.push({
        month: m,
        payment,
        interest,
        principal: principalPart,
        balance,
        phase: 1,
      });
    }
  }

  return rows;
}

/**
 * Sum of all interest paid over the life of the loan.
 */
export function totalInterest(table) {
  return table.reduce((sum, row) => sum + row.interest, 0);
}

/**
 * Total cost of vinculaciones over the loan term.
 */
export function totalVinculacionesCost(vinculaciones, termYears) {
  const totalMonths = termYears * 12;
  const monthlyCost = vinculaciones.reduce((sum, v) => sum + (parseFloat(v.monthlyCost) || 0), 0);
  return monthlyCost * totalMonths;
}

/**
 * Total real cost = total interest + vinculaciones cost + opening fee + broker fee.
 */
export function totalRealCost(table, vinculaciones, termYears, openingFee, brokerFee) {
  return (
    totalInterest(table) +
    totalVinculacionesCost(vinculaciones, termYears) +
    (parseFloat(openingFee) || 0) +
    (parseFloat(brokerFee) || 0)
  );
}

/**
 * Calculate TAE (Tasa Anual Equivalente) — the effective annual rate that equates
 * the net loan amount to all real payment flows (monthly payment + vinculación costs),
 * accounting for upfront fees. Uses bisection method.
 */
export function calculateTAE(principal, table, vinculaciones, openingFee, brokerFee) {
  const monthlyVinc = vinculaciones.reduce((sum, v) => sum + (parseFloat(v.monthlyCost) || 0), 0);
  const upfrontFees = (parseFloat(openingFee) || 0) + (parseFloat(brokerFee) || 0);
  const netLoan = principal - upfrontFees;

  if (netLoan <= 0 || table.length === 0) return 0;

  // Build cash flow array: each month's total outflow
  const cashFlows = table.map((row) => row.payment + monthlyVinc);

  // NPV of cash flows given a monthly rate
  function npv(monthlyRate) {
    let pv = 0;
    for (let i = 0; i < cashFlows.length; i++) {
      pv += cashFlows[i] / Math.pow(1 + monthlyRate, i + 1);
    }
    return pv - netLoan;
  }

  // Bisection to find monthly rate where NPV = 0
  let lo = 0;
  let hi = 0.1; // 10% monthly = very high upper bound
  for (let iter = 0; iter < 200; iter++) {
    const mid = (lo + hi) / 2;
    if (npv(mid) > 0) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const monthlyRate = (lo + hi) / 2;
  // Convert monthly rate to annual effective rate
  const tae = (Math.pow(1 + monthlyRate, 12) - 1) * 100;
  return tae;
}

/**
 * Look up the early amortization fee percent for a given year.
 * earlyAmortizationFees: [{ fromYear, toYear, feePercent }]
 */
export function computeEarlyFee(amount, year, earlyAmortizationFees) {
  if (!earlyAmortizationFees || earlyAmortizationFees.length === 0) return 0;
  for (const fee of earlyAmortizationFees) {
    const from = parseFloat(fee.fromYear) || 0;
    const to = parseFloat(fee.toYear) || 0;
    const pct = parseFloat(fee.feePercent) || 0;
    if (year >= from && year <= to) {
      return amount * pct / 100;
    }
  }
  return 0;
}

/**
 * Generate amortization table with early amortization scenario events applied.
 * Returns { table, earlyFeesPaid, monthsSaved, newMonthlyPayment }.
 */
export function amortizationTableWithScenario(
  principal, annualRate, termYears, hasInitialRate, initialRate, initialRatePeriod,
  scenario, earlyAmortizationFees
) {
  const originalTotalMonths = termYears * 12;
  const rows = [];
  let balance = principal;
  let earlyFeesPaid = 0;

  // Sort events by year
  const events = (scenario && scenario.events ? [...scenario.events] : [])
    .filter(e => e.year > 0 && e.amount > 0)
    .sort((a, b) => a.year - b.year);

  // Build a map: month number -> event (applied at start of that year)
  const eventByMonth = {};
  for (const ev of events) {
    const month = (ev.year - 1) * 12 + 1; // first month of that year
    eventByMonth[month] = ev;
  }

  // Determine initial phases
  const useInitialRate = hasInitialRate && initialRate != null && initialRatePeriod > 0;
  const initialMonths = useInitialRate ? initialRatePeriod * 12 : 0;

  // Current payment params
  let currentPayment;
  let remainingMonths;
  let currentRate;

  if (useInitialRate) {
    currentRate = initialRate;
    currentPayment = monthlyPayment(principal, initialRate, originalTotalMonths);
    remainingMonths = originalTotalMonths;
  } else {
    currentRate = annualRate;
    currentPayment = monthlyPayment(principal, annualRate, originalTotalMonths);
    remainingMonths = originalTotalMonths;
  }

  let month = 1;
  let phase2Started = false;

  while (remainingMonths > 0 && balance > 0.01) {
    // Switch to phase 2 rate if applicable
    if (useInitialRate && !phase2Started && month > initialMonths) {
      phase2Started = true;
      currentRate = annualRate;
      // Recalculate payment for remaining balance and remaining months
      currentPayment = monthlyPayment(balance, annualRate, remainingMonths);
    }

    // Apply early amortization event at the start of the event year
    if (eventByMonth[month]) {
      const ev = eventByMonth[month];
      let payoff = Math.min(ev.amount, balance);
      const fee = computeEarlyFee(payoff, ev.year, earlyAmortizationFees);
      earlyFeesPaid += fee;
      balance -= payoff;

      if (balance <= 0.01) {
        balance = 0;
        break;
      }

      const reduceType = ev.reduceType || 'term';
      if (reduceType === 'payment') {
        // Keep remaining months, recalculate payment
        currentPayment = monthlyPayment(balance, currentRate, remainingMonths);
      } else {
        // Keep payment, recalculate remaining months
        const r = currentRate / 100 / 12;
        if (r > 0) {
          const newMonths = Math.ceil(
            -Math.log(1 - (balance * r) / currentPayment) / Math.log(1 + r)
          );
          remainingMonths = Math.max(1, newMonths);
        } else {
          remainingMonths = Math.ceil(balance / currentPayment);
        }
      }
    }

    const r = currentRate / 100 / 12;
    const interest = balance * r;
    let principalPart = currentPayment - interest;

    // Last payment adjustment
    if (principalPart > balance) {
      principalPart = balance;
    }
    const actualPayment = interest + principalPart;

    balance = Math.max(0, balance - principalPart);
    rows.push({
      month,
      payment: actualPayment,
      interest,
      principal: principalPart,
      balance,
      phase: (useInitialRate && month <= initialMonths) ? 1 : 2,
    });

    month++;
    remainingMonths--;
  }

  const monthsSaved = originalTotalMonths - rows.length;

  return { table: rows, earlyFeesPaid, monthsSaved, currentPayment };
}

/**
 * Format number as currency (€).
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format percentage.
 */
export function formatPercent(value) {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value) + ' %';
}
