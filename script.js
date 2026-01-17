import React, { useState } from 'react';
import './App.css';

// 1. 定数とデータ構造は元の「骨格」を維持
const APP_ID = '1079362588947129175';

const CATEGORY_GROUPS = {
    'trendy': ['17', '14', '11-73-345'],
    'lazy': ['30-318', '30-302', '21'],
    'healthy': ['35-467', '11-70', '12-114'],
    'cheap': ['12-108', '12-110', '12-100']
};

function App() {
    // 2. Reactの状態管理（State）を定義
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCooldown, setIsCooldown] = useState(false); // 連打防止フラグ
    const [errorMsg, setErrorMsg] = useState('');

    // 3. 元の fetchRecipes ロジックを React 用に調整
    const fetchRecipes = async (groupName) => {
        // 読み込み中やクールダウン中（連打）はリクエストを遮断
        if (loading || isCooldown) return;

        setLoading(true);
        setErrorMsg('');
        setRecipes([]);

        // 元のロジック：ランダムにIDを選択
        const ids = CATEGORY_GROUPS[groupName];
        const randomId = ids[Math.floor(Math.random() * ids.length)];
        const url = `https://app.rakuten.co.jp/services/api/Recipe/CategoryRanking/20170426?format=json&categoryId=${randomId}&applicationId=${APP_ID}`;

        try {
            const response = await fetch(url);
            
            // 教授の指摘対策：API制限（429 Too Many Requests）時の遊び心ある対応
            if (response.status === 429) {
                setErrorMsg('ちょっと焦りすぎよ！落ち着いて選んでね🍵');
                setLoading(false);
                return;
            }

            if (!response.ok) throw new Error('通信エラー');

            const data = await response.json();

            // 元のロジック：シャッフルして4件表示
            const shuffled = shuffleArray(data.result);
            setRecipes(shuffled.slice(0, 4));

            // 【超重要】表示後に2秒間のクールダウンを設定してAPIを保護
            setIsCooldown(true);
            setTimeout(() => setIsCooldown(false), 2000);

        } catch (error) {
            setErrorMsg('読み込みに失敗しました。しばらく時間をおいて試してください。');
        } finally {
            setLoading(false);
        }
    };

    // 4. 元の shuffleArray ユーティリティ関数
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    return (
        <div className="container">
            <header>
                <h1>🍽️ ラクショク</h1>
                <p className="subtitle">”楽に”　”楽しく”　”食す”</p>
            </header>

            {/* ボタンエリア：disabled属性で連打を物理的に防ぐ */}
            <section className="action-area">
                <button className="mood-btn" onClick={() => fetchRecipes('trendy')} disabled={loading || isCooldown}>🍖 流行りをガッツリ</button>
                <button className="mood-btn" onClick={() => fetchRecipes('lazy')} disabled={loading || isCooldown}>⏱️ 秒でごはん</button>
                <button className="mood-btn" onClick={() => fetchRecipes('healthy')} disabled={loading || isCooldown}>💪 体づくり</button>
                <button className="mood-btn" onClick={() => fetchRecipes('cheap')} disabled={loading || isCooldown}>💸 限界・節約メシ</button>
            </section>

            <div className="status-area">
                {loading && <div className="spinner">おすすめをピックアップ中...</div>}
                {errorMsg && <p className="error-text">{errorMsg}</p>}
                {!loading && isCooldown && <p className="cooldown-text">じっくり見てね！次の提案まであと少し...</p>}
            </div>

            <main className="recipe-grid">
                {recipes.length === 0 && !loading && !errorMsg && (
                    <p className="placeholder">☝️ 今日の気分ボタンを押してください</p>
                )}
                
                {recipes.map((recipe, index) => (
                    <a key={index} href={recipe.recipeUrl} target="_blank" rel="noopener noreferrer" className="recipe-card">
                        <img src={recipe.foodImageUrl} alt={recipe.recipeTitle} />
                        <div className="card-content">
                            <h3 className="card-title">{recipe.recipeTitle}</h3>
                            <div className="cook-time">
                                <span className="date">📅 {recipe.recipePublishDate?.split(' ')[0]}</span><br />
                                <span>⏱️</span> 目安: {recipe.recipeIndication}
                            </div>
                        </div>
                    </a>
                ))}
            </main>
        </div>
    );
}

export default App;