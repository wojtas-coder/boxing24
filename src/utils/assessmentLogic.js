
import { FITNESS_CATEGORIES } from '../data/fitnessTests';

/**
 * Normalizes a raw value to a 0-100 score based on min/max norms.
 */
export const normalizeScore = (value, min, max) => {
    if (!value || isNaN(value)) return 0;
    const val = parseFloat(value);

    if (val <= min) return 0;
    if (val >= max) return 100;

    // Linear interpolation
    return Math.round(((val - min) / (max - min)) * 100);
};

/**
 * Calculates penalty for asymmetry (if distinct > 15%).
 * Returns penalty points (negative value) or 0.
 * Left/Right inputs expected.
 */
export const calculateAsymmetryPenalty = (valL, valR) => {
    const l = parseFloat(valL) || 0;
    const r = parseFloat(valR) || 0;

    if (l === 0 && r === 0) return 0;

    const max = Math.max(l, r);
    const min = Math.min(l, r);
    const diff = max - min;
    const avg = (l + r) / 2;

    if (avg === 0) return 0;

    const asymmetryPercent = (diff / max) * 100; // Using max as reference roughly

    // Rule: > 15% asymmetry = Penalty
    if (asymmetryPercent > 15) {
        // Penalty calculation: e.g. flat -10 points on the exercise score
        return 15; // 15 points penalty
    }

    return 0;
};

/**
 * Calculates complete assessment results.
 * @param {Object} inputs - Map of field IDs to values (e.g. { 'pushups': 40, 'balance_l': 20, 'balance_r': 25 })
 * @param {Array} testStructure - The test definition array (BASIC or ADVANCED)
 */
export const calculateAssessment = (inputs, testStructure) => {
    let globalScore = 0;
    const categoryScores = {};
    const asymmetries = []; // List of detected asymmetries

    // Initialize category scores
    Object.keys(FITNESS_CATEGORIES).forEach(key => {
        categoryScores[FITNESS_CATEGORIES[key].id] = 0;
    });

    // Process each category in the test
    testStructure.forEach(categoryBlock => {
        const catId = categoryBlock.categoryId;
        const exercises = categoryBlock.exercises;

        let catTotalScore = 0;
        let catExercisesCount = 0;

        exercises.forEach(ex => {
            let score = 0;

            if (ex.isAsymmetric) {
                const valL = inputs[`${ex.id}_l`];
                const valR = inputs[`${ex.id}_r`];

                const scoreL = normalizeScore(valL, ex.min, ex.max);
                const scoreR = normalizeScore(valR, ex.min, ex.max);

                // Base score is average of both sides
                let avgScore = (scoreL + scoreR) / 2;

                // Check penalty
                const penalty = calculateAsymmetryPenalty(valL, valR);
                if (penalty > 0) {
                    avgScore -= penalty;
                    asymmetries.push({
                        exercise: ex.title,
                        diff: Math.abs(parseFloat(valL) - parseFloat(valR)),
                        penalty: penalty
                    });
                }

                score = Math.max(0, avgScore);

            } else {
                const val = inputs[ex.id];
                score = normalizeScore(val, ex.min, ex.max);
            }

            catTotalScore += score;
            catExercisesCount++;
        });

        const catAvg = catExercisesCount > 0 ? Math.round(catTotalScore / catExercisesCount) : 0;
        categoryScores[catId] = catAvg;
    });

    // Calculate Global Weighted Score
    let weightedSum = 0;
    let totalWeight = 0;

    Object.values(FITNESS_CATEGORIES).forEach(cat => {
        if (categoryScores[cat.id] !== undefined) {
            weightedSum += categoryScores[cat.id] * cat.weight;
            totalWeight += cat.weight;
        }
    });

    globalScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

    return {
        globalScore,
        categoryScores,
        asymmetries
    };
};
