function parseTags(tagsStr) {
    try { return JSON.parse(tagsStr || '[]'); }
    catch { return []; }
}

function formatPlaceForLLM(place) {
    // Slim format — reduces token count by ~40% per place
    return {
        id: place.id,
        name: place.name,
        city: place.city,
        category: place.category,
        description: (place.description || '').substring(0, 120),
        hours: place.opening_hours || '',
        duration: place.estimated_visit_duration || 60,
        crowd: place.crowd_level || 'medium',
        highlight: !!place.highlight,
        best_time: place.best_time_to_visit || '',
        entry_fee: parseFloat(place.entry_fee) || 0
    };
}

function filterByInterests(places, interests = []) {
    if (!interests || interests.length === 0) return places;
    const interestSet = new Set(interests.map(i => i.toLowerCase()));
    return places.filter(p => {
        const tags = parseTags(p.tags);
        return tags.some(t => interestSet.has(t.toLowerCase())) ||
            interestSet.has(p.category.toLowerCase());
    });
}

function sanitizeInput(text) {
    if (!text) return '';
    return text.replace(/<[^>]*>/g, '').trim().substring(0, 2000);
}

function generateId() {
    const { v4 } = require('uuid');
    return v4();
}

function filterByAccessibility(places, groupType = 'family') {
    if (!groupType || groupType === 'solo' || groupType === 'couple') return places;

    return places.filter(p => {
        const duration = p.estimated_visit_duration || 45;
        const cat = (p.category || '').toLowerCase();

        if (groupType === 'elderly') {

            if (duration > 150) return false;
            if (cat.includes('trek') || cat.includes('hike')) return false;
        }
        if (groupType === 'family') {

            if (duration > 180) return false;
        }
        return true;
    });
}

function filterByBudget(places, budgetLevel = 'medium') {
    if (!budgetLevel || budgetLevel === 'high') return places;

    const maxFee = budgetLevel === 'low' ? 100 : 500;
    return places.filter(p => {
        const fee = parseFloat(p.entry_fee) || 0;
        return fee <= maxFee;
    });
}

module.exports = {
    parseTags, formatPlaceForLLM, filterByInterests,
    sanitizeInput, generateId,
    filterByAccessibility, filterByBudget
};
