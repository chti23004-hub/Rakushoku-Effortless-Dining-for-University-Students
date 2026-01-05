// ▼▼▼ アプリID設定済み ▼▼▼
const APP_ID = '1079362588947129175'; 
// ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

// ■ カテゴリグループ定義
// 1つのボタンに対して複数のカテゴリIDを登録しておき、ここからランダムに検索します。
// これにより「毎回違う提案」が可能になります。
const categoryGroups = {
    // 🇰🇷 トレンド: 韓国料理(17)、丼(14)、豚キムチ(11-73-345)
    'trendy': ['17', '14', '11-73-345'],
    
    // ⏱️ 時短: レンジ調理(30-318)、5分以内(30-302)、缶詰(21)
    'lazy': ['30-318', '30-302', '21'],
    
    // 💪 ヘルシー: オートミール(35-467)、鶏むね肉(11-70)、きのこ(12-114)
    'healthy': ['35-467', '11-70', '12-114'],
    
    // 💸 節約: もやし(12-108)、豆腐(12-110)、卵料理(12-100)、厚揚げ(12-112)
    'cheap': ['12-108', '12-110', '12-100', '12-112']
};

const buttons = document.querySelectorAll('.mood-btn');
const recipeList = document.getElementById('recipe-list');
const loading = document.getElementById('loading');

// ボタン操作の設定
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // 1. 押されたボタンのグループ名を取得
        const groupName = button.getAttribute('data-group');
        
        // 2. そのグループの中からランダムに1つのカテゴリIDを抽選
        const ids = categoryGroups[groupName];
        const randomId = ids[Math.floor(Math.random() * ids.length)];

        // 3. 抽選されたIDで検索実行
        fetchRecipes(randomId);
    });
});

async function fetchRecipes(categoryId) {
    recipeList.innerHTML = '';          
    loading.classList.remove('hidden'); 

    // APIリクエスト
    const url = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?format=json&categoryId=${categoryId}&applicationId=${APP_ID}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        loading.classList.add('hidden');
        
        // ■ 工夫ポイント: シャッフル表示
        // 取得した4つのレシピの並び順をランダムに入れ替えます。
        // これにより、マンネリ化を防ぎ「常に新しい提案」に見せます。
        const shuffledRecipes = shuffleArray(data.result);
        
        displayRecipes(shuffledRecipes);

    } catch (error) {
        console.error('Error:', error);
        loading.classList.add('hidden');
        recipeList.innerHTML = '<p style="text-align:center">読み込みに失敗しました。<br>もう一度押してみてください。</p>';
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
        
        // 日付の整形 (例: 2024/01/01)
        const dateStr = recipe.recipePublishDate ? recipe.recipePublishDate.split(' ')[0] : '';

        card.innerHTML = `
            <img src="${recipe.foodImageUrl}" alt="${recipe.recipeTitle}">
            <div class="card-content">
                <h3 class="card-title">${recipe.recipeTitle}</h3>
                <div class="cook-time">
                    <span style="font-size:0.8rem; color:#888;">📅 ${dateStr}</span>
                    <br>
                    <span>⏱️</span> 目安: ${recipe.recipeIndication}
                </div>
            </div>
        `;
        recipeList.appendChild(card);
    });
}

// 配列をランダムに混ぜる関数（フィッシャー・イェーツのシャッフル）
function shuffleArray(array) {
    const newArray = [...array]; // 元の配列を壊さないようにコピー
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}