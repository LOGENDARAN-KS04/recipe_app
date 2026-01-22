const API_BASE_URL = '/api/recipes';

let currentPage = 1;
let currentLimit = 15;
let currentFilters = {};

// DOM Elements
const titleInput = document.getElementById('title');
const cuisineInput = document.getElementById('cuisine');
const ratingMinInput = document.getElementById('ratingMin');
const ratingMaxInput = document.getElementById('ratingMax');
const totalTimeMaxInput = document.getElementById('totalTimeMax');
const caloriesMaxInput = document.getElementById('caloriesMax');
const searchBtn = document.getElementById('searchBtn');
const resetBtn = document.getElementById('resetBtn');
const pageSizeSelect = document.getElementById('pageSize');
const recipesContainer = document.getElementById('recipesContainer');
const loadingDiv = document.getElementById('loading');
const errorDiv = document.getElementById('error');
const resultsCount = document.getElementById('resultsCount');
const pageInfo = document.getElementById('pageInfo');
const firstPageBtn = document.getElementById('firstPage');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const lastPageBtn = document.getElementById('lastPage');
const recipeModal = document.getElementById('recipeModal');
const recipeDetails = document.getElementById('recipeDetails');
const closeModal = document.querySelector('.close');

// Event Listeners
searchBtn.addEventListener('click', handleSearch);
resetBtn.addEventListener('click', handleReset);
pageSizeSelect.addEventListener('change', handlePageSizeChange);
firstPageBtn.addEventListener('click', () => goToPage(1));
prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
lastPageBtn.addEventListener('click', () => goToPage(null, true));
closeModal.addEventListener('click', () => {
    recipeModal.classList.add('hidden');
});
window.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
        recipeModal.classList.add('hidden');
    }
});

// Initialize
loadRecipes();

function handleSearch() {
    currentPage = 1;
    currentFilters = {
        title: titleInput.value.trim() || null,
        cuisine: cuisineInput.value.trim() || null,
        ratingMin: ratingMinInput.value ? parseFloat(ratingMinInput.value) : null,
        ratingMax: ratingMaxInput.value ? parseFloat(ratingMaxInput.value) : null,
        totalTimeMax: totalTimeMaxInput.value ? parseInt(totalTimeMaxInput.value) : null,
        caloriesMax: caloriesMaxInput.value ? parseInt(caloriesMaxInput.value) : null,
    };
    loadRecipes();
}

function handleReset() {
    titleInput.value = '';
    cuisineInput.value = '';
    ratingMinInput.value = '';
    ratingMaxInput.value = '';
    totalTimeMaxInput.value = '';
    caloriesMaxInput.value = '';
    currentPage = 1;
    currentFilters = {};
    loadRecipes();
}

function handlePageSizeChange() {
    currentLimit = parseInt(pageSizeSelect.value);
    currentPage = 1;
    loadRecipes();
}

function goToPage(page, isLast = false) {
    if (isLast) {
        // Will be set after we get the response
        return;
    }
    currentPage = page;
    loadRecipes();
}

async function loadRecipes() {
    showLoading();
    hideError();

    try {
        const hasFilters = Object.values(currentFilters).some(v => v !== null);
        const url = hasFilters ? `${API_BASE_URL}/search` : API_BASE_URL;
        
        const params = new URLSearchParams({
            page: currentPage.toString(),
            limit: currentLimit.toString(),
        });

        if (hasFilters) {
            if (currentFilters.title) params.append('title', currentFilters.title);
            if (currentFilters.cuisine) params.append('cuisine', currentFilters.cuisine);
            if (currentFilters.ratingMin !== null) params.append('rating>=', currentFilters.ratingMin.toString());
            if (currentFilters.ratingMax !== null) params.append('rating<=', currentFilters.ratingMax.toString());
            if (currentFilters.totalTimeMax !== null) params.append('total_time<=', currentFilters.totalTimeMax.toString());
            if (currentFilters.caloriesMax !== null) params.append('calories<=', currentFilters.caloriesMax.toString());
        }

        const response = await fetch(`${url}?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        displayRecipes(data);
        updatePagination(data);
    } catch (error) {
        showError(`Failed to load recipes: ${error.message}`);
        recipesContainer.innerHTML = '';
    } finally {
        hideLoading();
    }
}

function displayRecipes(data) {
    if (!data.data || data.data.length === 0) {
        recipesContainer.innerHTML = '<div class="recipe-card"><p>No recipes found. Try adjusting your search criteria.</p></div>';
        return;
    }

    recipesContainer.innerHTML = data.data.map(recipe => `
        <div class="recipe-card" onclick="showRecipeDetails(${JSON.stringify(recipe).replace(/"/g, '&quot;')})">
            <div class="recipe-header">
                <div>
                    <div class="recipe-title">${escapeHtml(recipe.title)}</div>
                    <span class="recipe-cuisine">${escapeHtml(recipe.cuisine || 'N/A')}</span>
                </div>
                <div class="recipe-rating">${getStarRating(recipe.rating)}</div>
            </div>
            <div class="recipe-details">
                <div class="recipe-detail-item">
                    <strong>Total Time:</strong> ${formatTime(recipe.total_time)}
                </div>
                <div class="recipe-detail-item">
                    <strong>Serves:</strong> ${recipe.serves || 'N/A'}
                </div>
                ${recipe.calories ? `
                <div class="recipe-detail-item">
                    <strong>Calories:</strong> ${recipe.calories}
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function showRecipeDetails(recipe) {
    const ingredients = recipe.ingredients ? parseTextList(recipe.ingredients) : [];
    const instructions = recipe.instructions ? parseTextList(recipe.instructions) : [];
    const nutrients = recipe.nutrients ? parseNutrients(recipe.nutrients) : null;

    recipeDetails.innerHTML = `
        <div class="recipe-detail-content">
            <h2>${escapeHtml(recipe.title)}</h2>
            
            <div class="detail-section">
                <p><strong>Cuisine:</strong> ${escapeHtml(recipe.cuisine || 'N/A')}</p>
                <p><strong>Rating:</strong> ${getStarRating(recipe.rating)} ${recipe.rating ? recipe.rating.toFixed(1) : 'N/A'}</p>
            </div>

            ${recipe.description ? `
            <div class="detail-section">
                <h3>Description</h3>
                <p>${escapeHtml(recipe.description)}</p>
            </div>
            ` : ''}

            <div class="detail-section">
                <h3>Time Information</h3>
                <p><strong>Prep Time:</strong> ${formatTime(recipe.prep_time)}</p>
                <p><strong>Cook Time:</strong> ${formatTime(recipe.cook_time)}</p>
                <p><strong>Total Time:</strong> ${formatTime(recipe.total_time)}</p>
            </div>

            ${recipe.serves ? `
            <div class="detail-section">
                <p><strong>Serves:</strong> ${recipe.serves}</p>
            </div>
            ` : ''}

            ${ingredients.length > 0 ? `
            <div class="detail-section">
                <h3>Ingredients</h3>
                <ul>
                    ${ingredients.map(ing => `<li>${escapeHtml(ing)}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${instructions.length > 0 ? `
            <div class="detail-section">
                <h3>Instructions</h3>
                <ol>
                    ${instructions.map(inst => `<li>${escapeHtml(inst)}</li>`).join('')}
                </ol>
            </div>
            ` : ''}

            ${nutrients ? `
            <div class="detail-section">
                <h3>Nutritional Information</h3>
                <p>${escapeHtml(nutrients)}</p>
            </div>
            ` : ''}
        </div>
    `;
    
    recipeModal.classList.remove('hidden');
}

function updatePagination(data) {
    const total = data.total || 0;
    const totalPages = data.totalPages || 1;
    
    resultsCount.textContent = `Recipes (${total} total)`;
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    
    firstPageBtn.disabled = currentPage === 1;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= totalPages;
    lastPageBtn.disabled = currentPage >= totalPages;
    
    // Update last page button click handler
    lastPageBtn.onclick = () => goToPage(totalPages);
}

function getStarRating(rating) {
    if (!rating) return '⭐ N/A';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '⭐'.repeat(fullStars);
    if (hasHalfStar) stars += '½';
    return stars || '⭐';
}

function formatTime(minutes) {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

function parseTextList(text) {
    if (!text) return [];
    // Try to parse as JSON array first
    try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) return parsed;
    } catch (e) {
        // Not JSON, try splitting by common delimiters
    }
    
    // Split by newlines, semicolons, or commas
    return text.split(/[\n;]/)
        .map(item => item.trim())
        .filter(item => item.length > 0);
}

function parseNutrients(nutrients) {
    if (!nutrients) return null;
    try {
        const parsed = JSON.parse(nutrients);
        if (typeof parsed === 'object') {
            return Object.entries(parsed)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ');
        }
    } catch (e) {
        // Not JSON, return as is
    }
    return nutrients;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showLoading() {
    loadingDiv.classList.remove('hidden');
    recipesContainer.innerHTML = '';
}

function hideLoading() {
    loadingDiv.classList.add('hidden');
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    errorDiv.classList.add('hidden');
}

// Make showRecipeDetails available globally for onclick handlers
window.showRecipeDetails = function(recipeJson) {
    const recipe = typeof recipeJson === 'string' ? JSON.parse(recipeJson.replace(/&quot;/g, '"')) : recipeJson;
    showRecipeDetails(recipe);
};
