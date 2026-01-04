// ▼▼▼ 正しいアプリIDを入力済みです ▼▼▼
const APP_ID = '1079362588947129175'; 
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

const buttons = document.querySelectorAll('.mood-btn');
const recipeList = document.getElementById('recipe-list');
const loading = document.getElementById('loading');

// ボタンの設定
buttons.forEach(button => {
    button.addEventListener('click', () => {
        const categoryId = button.getAttribute('data-id');
        fetchRecipes(categoryId);
    });
});

// 楽天APIからデータを取得する関数
async function fetchRecipes(categoryId) {
    // 画面リセットとローディング表示
    recipeList.innerHTML = '';          
    loading.classList.remove('hidden'); 

    // APIのURL
    const url = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?format=json&categoryId=${categoryId}&applicationId=${APP_ID}`;

    try {
        const response = await fetch(url);
        
        // エラーチェック
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        loading.classList.add('hidden');
        displayRecipes(data.result);

    } catch (error) {
        console.error('詳細なエラー:', error);
        loading.classList.add('hidden');
        
        // ユーザー向けのエラー表示
        recipeList.innerHTML = `
            <div style="text-align:center; color:#d32f2f;">
                <p>⚠️ エラーが発生しました</p>
                <p style="font-size:0.9rem;">
                    GitHubへの反映に少し時間がかかっているか、<br>
                    キャッシュが残っている可能性があります。<br>
                    数分待ってからリロードしてみてください。
                </p>
            </div>`;
    }
}

// レシピ表示関数
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
        
        card.innerHTML = `
            <img src="${recipe.foodImageUrl}" alt="${recipe.recipeTitle}">
            <div class="card-content">
                <h3 class="card-title">${recipe.recipeTitle}</h3>
                <div class="cook-time">
                    <span>🕒</span> 目安: ${recipe.recipeIndication}
                </div>
            </div>
        `;

        recipeList.appendChild(card);
    });
}