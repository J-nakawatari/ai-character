// 親密度の更新ロジック
const updateAffinity = async (user, characterId, interactionType = 'chat') => {
  // 既存の親密度を検索
  let affinity = user.affinities.find(
    a => a.character.toString() === characterId.toString()
  );

  // 親密度が存在しない場合は新規作成
  if (!affinity) {
    user.affinities.push({
      character: characterId,
      level: 0,
      lastInteractedAt: new Date(),
      lastVisitStreak: 1,
      decayStartAt: null
    });
    affinity = user.affinities[user.affinities.length - 1];
  }

  const now = new Date();
  const lastInteracted = new Date(affinity.lastInteractedAt);
  const timeDiff = now - lastInteracted;
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  // 連続ログインチェック
  if (daysDiff === 1) {
    // 連続ログイン
    affinity.lastVisitStreak += 1;
    affinity.level = Math.min(100, affinity.level + 2); // 連続ボーナス
  } else if (daysDiff === 0) {
    // 同日の複数回アクセス
    affinity.level = Math.min(100, affinity.level + 1);
  } else {
    // 連続が途切れた
    affinity.lastVisitStreak = 1;
    affinity.level = Math.min(100, affinity.level + 1);
  }

  // 親密度の減衰チェック（7日以上放置で減少開始）
  if (daysDiff >= 7) {
    const decayDays = daysDiff - 7;
    const decayAmount = Math.min(decayDays * 0.5, affinity.level * 0.3); // 最大30%まで減少
    affinity.level = Math.max(0, affinity.level - decayAmount);
    affinity.decayStartAt = affinity.decayStartAt || lastInteracted;
  } else {
    affinity.decayStartAt = null;
  }

  affinity.lastInteractedAt = now;
  
  return user;
};

// 親密度レベルに基づくトーンスタイルを取得
const getToneStyle = (level) => {
  if (level >= 85) return "恋人のように甘く親密な口調で";
  if (level >= 60) return "親友のようにフレンドリーで親しみやすい口調で";
  if (level >= 40) return "友達のように時々タメ口を交えた親しみやすい口調で";
  if (level >= 20) return "知り合いのように少しだけ砕けた丁寧な口調で";
  return "初対面のように丁寧語で礼儀正しい口調で";
};

// 親密度レベルの説明を取得
const getAffinityLevelDescription = (level) => {
  if (level >= 85) return { title: "恋人", color: "#FF69B4" };
  if (level >= 60) return { title: "親友", color: "#FFD700" };
  if (level >= 40) return { title: "友達", color: "#32CD32" };
  if (level >= 20) return { title: "知り合い", color: "#87CEEB" };
  return { title: "初対面", color: "#C0C0C0" };
};

module.exports = {
  updateAffinity,
  getToneStyle,
  getAffinityLevelDescription
};