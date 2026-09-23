/* =========================================================
   3A TECHNOLOGY - CORE JAVASCRIPT MODULE (script.js)
   ========================================================= */

// HDD Calculator Engine
function calculateHddCapacity(cams, resMp, isH265, days) {
    let baseMbPerDay = resMp * 1024 * 12;
    if (isH265) baseMbPerDay *= 0.5;
    const totalGb = Math.round((cams * baseMbPerDay * days) / 1024);
    return totalGb;
}

// B2B Solution Estimator Engine
function calculateSolutionPrice(camCount, switchCount, apCount, cableMeters) {
    const equipCost = (camCount * 1450000) + (switchCount * 2600000) + (apCount * 1950000);
    const cableCost = cableMeters * 12000;
    const labor = (camCount * 250000) + 2000000;
    const vat = (equipCost + cableCost + labor) * 0.1;
    return equipCost + cableCost + labor + vat;
}

console.log("3A Technology JavaScript System Ready.");