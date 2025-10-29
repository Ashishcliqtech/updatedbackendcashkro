// src/config/cashbackRules.js
// Centralized configuration for all dynamic cashback calculations.

const RULES_CONFIG = {
    // Platform fee retained from the Gross Cashback amount.
    "platform_fee_rate": 0.20, 
    
    // Base rate applied to all transactions before tiers/bonuses.
    "base_rate": 0.02,  

    // Tier Multipliers: Applied multiplicatively to the base rate.
    // NOTE: In production, the user's tier should be loaded from their profile.
    "tier_multipliers": {
        "Bronze": 1.0,
        "Silver": 1.25,
        "Gold": 1.5,
        "Platinum": 2.0
    },

    // Category Bonuses: Applied additively to the calculated effective rate.
    // NOTE: This assumes merchantCategory (MCC) can be mapped or passed in the webhook payload.
    "category_bonuses": {
        // Example MCC lookups:
        "Groceries": 0.01,  
        "Travel": 0.005,     
        "Electronics": 0.0,
        "Default": 0.0,
    },

    // Limits and Thresholds
    "min_transaction_for_cashback": 10.00,  
    "max_cashback_per_transaction": 50.00 
};

module.exports = RULES_CONFIG;
