// src/utils/cashbackCalculator.js
const RULES = require('../config/cashbackRules');
const logger = require('./logger');

/**
 * Calculates the final Net Cashback, Gross Cashback, and Platform Fee
 * based on complex, dynamic business rules.
 *
 * Formula:
 * 1. Effective Rate (R_eff) = (Base Rate * Tier Multiplier) + Category Bonus
 * 2. Gross Cashback (G) = Transaction Amount (T) * R_eff
 * 3. Capped Gross Cashback (F) = min(G, C_max)
 * 4. Platform Fee (Fee) = F * Platform Fee Rate
 * 5. Net Cashback (Net_F) = F - Fee
 *
 * @param {number} transactionAmount - The total value of the purchase.
 * @param {string} userTier - The user's loyalty tier (e.g., 'Gold', 'Silver').
 * @param {string} merchantCategory - The category of the merchant (e.g., 'Groceries', 'Travel').
 * @returns {object} - Object containing netCashback, grossCashback, platformFee, and effectiveRate.
 */
function calculateCashback(transactionAmount, userTier = 'Bronze', merchantCategory = 'Default') {
    const {
        platform_fee_rate,
        base_rate,
        tier_multipliers,
        category_bonuses,
        min_transaction_for_cashback,
        max_cashback_per_transaction
    } = RULES;

    
    let grossCashback = 0;
    let platformFee = 0;
    let netCashback = 0;
    let effectiveRate = 0;
    
    // 1. Check Minimum Transaction Eligibility
    if (transactionAmount < min_transaction_for_cashback) {
        return { 
            netCashback: 0, 
            grossCashback: 0, 
            platformFee: 0,
            effectiveRate: 0, 
            isEligible: false,
            details: `INELIGIBLE: Transaction amount (${transactionAmount.toFixed(2)}) below minimum threshold.`
        };
    }

    // 2. Calculate Effective Rate (R_eff)
    const tierMultiplier = tier_multipliers[userTier] || tier_multipliers['Bronze'];
    const categoryBonus = category_bonuses[merchantCategory] || category_bonuses['Default'];
    
    effectiveRate = (base_rate * tierMultiplier) + categoryBonus;
    
    // 3. Calculate Gross Cashback (G)
    grossCashback = transactionAmount * effectiveRate;
    
    // 4. Apply Cap (F)
    const cappedGrossCashback = Math.min(grossCashback, max_cashback_per_transaction);
    
    // 5. Calculate Platform Fee (Fee)
    platformFee = cappedGrossCashback * platform_fee_rate;
    
    // 6. Calculate Net Cashback (Net_F)
    netCashback = cappedGrossCashback - platformFee;
    
    // 7. Final Rounding (Round down to the nearest cent for monetary accuracy)
    const finalNetCashback = Math.floor(netCashback * 100) / 100.0;
    
    // Recalculate component parts rounded down for storage/logging integrity
    const finalPlatformFee = Math.floor(platformFee * 100) / 100.0;
    const finalGrossCashback = Math.floor(cappedGrossCashback * 100) / 100.0;
    
    logger.info('Cashback Calculation Trace', {
        T: transactionAmount,
        U: userTier,
        MCC: merchantCategory,
        Reff: effectiveRate,
        G: grossCashback,
        F_Capped: cappedGrossCashback,
        Fee: finalPlatformFee,
        Net_F: finalNetCashback
    });


    return { 
        netCashback: finalNetCashback, 
        grossCashback: finalGrossCashback, 
        platformFee: finalPlatformFee, 
        effectiveRate: effectiveRate,
        isEligible: true,
        details: `Net Cashback calculated at $${finalNetCashback.toFixed(2)}. Gross: $${finalGrossCashback.toFixed(2)}. Fee: $${finalPlatformFee.toFixed(2)}.`
    };
}

module.exports = { calculateCashback };
