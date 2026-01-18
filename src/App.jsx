import { useState } from 'react'
import './App.css'

function App() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(false) 

  const fetchRecipes = async () => {
    if (cooldown) return 

    setLoading(true)
    setCooldown(true)

    try {
      const response = await fetch(
        `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?applicationId=YOUR_APP_ID`
      )
      const data = await response.json()
      setRecipes(data.result || [])
    } catch (error) {
      console.error("通信エラー:", error)
    } finally {
      setLoading(false)
      setTimeout(() => {
        setCooldown(false)
      }, 2000)
    }
  }

  return (
    <div className="container">
      <h1>ラクショク 🍽️</h1>
      <p>大学生のための楽に、食を楽しむサイト</p>

      {/* ひし形レイアウトのボタン */}
      <div className="diamond-container">
        <button 
          className={`diamond-button ${cooldown ? 'disabled' : ''}`}
          onClick={fetchRecipes}
          disabled={cooldown || loading}
        >
          {loading ? '検索中...' : cooldown ? '待機中' : 'レシピを探す'}
        </button>
      </div>

      <div className="recipe-list">
        {recipes.map((recipe, index) => (
          <div key={index} className="recipe-card">
            <img src={recipe.foodImageUrl} alt={recipe.recipeTitle} />
            <h3>{recipe.recipeTitle}</h3>
            <p>{recipe.recipeDescription}</p>
            <a href={recipe.recipeUrl} target="_blank" rel="noreferrer">作り方を見る</a>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App