const APP_ID = '1079362588947129175';

const categoryGroups = {
    'trendy': ['17', '14', '11-73-345'],
    'lazy': ['30-318', '30-302', '21'],
    'healthy': ['35-467', '11-70', '12-114'],
    'cheap': ['12-108', '12-110', '12-100']
};

const buttons = document.querySelectorAll('.mood-btn');
const recipeList = document.getElementById('recipe-list');
const loading = document.getElementById('loading');

buttons.forEach(button => {
    button.addEventListener('click', () => {
        const groupName = button.getAttribute('data-group');
        const ids = categoryGroups[groupName];
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        fetchRecipes(randomId);
    });
});

async function fetchRecipes(categoryId) {
    recipeList.innerHTML = '';
    loading.classList.remove('hidden');

    const url = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?format=json&categoryId=${categoryId}&applicationId=${APP_ID}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        loading.classList.add('hidden');
        displayRecipes(shuffleArray(data.result));

    } catch (error) {
        loading.classList.add('hidden');
        recipeList.innerHTML = '<p style="text-align:center">読み込みに失敗しました。</p>';
    }
}

function displayRecipes(recipes) {
    const selectedRecipes = recipes.slice(0, 4);

    if (selectedRecipes.length === 0) {
        recipeList.innerHTML = '<p>レシピが見つかりませんでした。</p>';
        return;
    }

    selectedRecipes.forEach(recipe => {
        const card = document.createElement('a');
        card.href = recipe.recipeUrl;
        card.target = "_blank";
        card.className = 'recipe-card';
        
        const dateStr = recipe.recipePublishDate ? recipe.recipePublishDate.split(' ')[0] : '';

        card.innerHTML = `
            <img src="${recipe.foodImageUrl}" alt="${recipe.recipeTitle}">
            <div class="card-content">
                <h3 class="card-title">${recipe.recipeTitle}</h3>
                <div class="cook-time">
                    <span style="font-size:0.8rem; color:#888;">📅 ${dateStr}</span><br>
                    <span>⏱️</span> 目安: ${recipe.recipeIndication}
                </div>
            </div>
        `;
        recipeList.appendChild(card);
    });
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}