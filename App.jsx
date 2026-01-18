import { useState } from 'react'
import './App.css'

const APP_ID = '1079362588947129175';

const CATEGORY_GROUPS = {
  trendy:  ['17', '14', '11-73-345'],    
  lazy:    ['30-318', '30-302', '21'],     
  healthy: ['35-467', '11-70', '12-114'],   
  cheap:   ['12-108', '12-110', '12-100']   
};

function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(false) 

  const moods = [
    { key: 'trendy',  name: '流行り', icon: '🍖' },
    { key: 'lazy',    name: '秒で',   icon: '⏱️' },
    { key: 'healthy', name: '健康',   icon: '🥗' },
    { key: 'cheap',   name: '節約',   icon: '💸' }
  ]

  const fetchRecipes = async (groupKey) => {
    // 連打防止：ロード中はクリックを無効化
    if (loading || cooldown) return;

    setLoading(true);
    setRecipes([]); // 画面をクリアして反応を示す
    setCooldown(true); // クールダウン開始

    try {
      const ids = CATEGORY_GROUPS[groupKey];
      const randomId = ids[Math.floor(Math.random() * ids.length)];

      const url = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?format=json&categoryId=${randomId}&applicationId=${APP_ID}`;

      const response = await fetch(url);
      
      if (response.status === 429) {
        alert("ちょっと焦りすぎ！少し待ってから押してね♡");
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error('APIエラー');
      
      const data = await response.json();

      if (data.result) {
        const shuffled = [...data.result].sort(() => Math.random() - 0.5);
        setRecipes(shuffled.slice(0, 4));
      }

    } catch (error) {
      console.error("エラー:", error);
      alert("レシピの読み込みに失敗しました。もう一度試してみてね！");
    } finally {
      setLoading(false);
      //2秒後にボタンを復活させる
      setTimeout(() => setCooldown(false), 2000);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>🍚 ラクショク 🍽️</h1>
        <p className="catchphrase">”楽に”　”食を”　”楽しむ”</p>
        <p className="subtitle">今の気分を選ぶだけ。<br/>あなたに代わって最高のメニューを提案します。</p>
      </header>

      {/* 第一回目の骨格：ひし形配置のグリッド */}
      <div className="diamond-grid">
        {moods.map((mood) => (
          <button 
            key={mood.key}
            className={`diamond-button ${cooldown ? 'disabled' : ''}`}
            onClick={() => fetchRecipes(mood.key)}
            disabled={cooldown || loading}
          >
            <div className="button-content">
              <span className="icon">{mood.icon}</span>
              <span className="label">
                {/* 読み込み中は「...」にして反応を示す */}
                {loading && cooldown ? '...' : mood.name}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ステータス表示 */}
      {loading && (
        <div className="status-area">
          <div className="spinner"></div>
          <p>あなたにぴったりのレシピをピックアップ中...</p>
        </div>
      )}

      {!loading && recipes.length === 0 && !cooldown && (
        <p className="placeholder">☝️ 今日の気分のボタンを押してね</p>
      )}

      {/* レシピリスト */}
      <div className="recipe-list">
        {recipes.map((recipe, index) => (
          <a key={index} href={recipe.recipeUrl} target="_blank" rel="noreferrer" className="recipe-card">
            <img src={recipe.foodImageUrl} alt={recipe.recipeTitle} />
            <div className="card-info">
              <h3>{recipe.recipeTitle}</h3>
              <p>⏱️ 目安: {recipe.recipeIndication}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export default App