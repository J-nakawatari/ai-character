/**
 * キャラクターのアクセス制限に関するメッセージ
 */
const ACCESS_MESSAGES = {
  ja: {
    locked: 'ロック中',
    select: '選択する',
    accessDenied: {
      subscription: 'このキャラクターは有料会員限定です',
      purchaseOnly: 'このキャラクターは購入が必要です',
      default: 'このキャラクターを選択する権限がありません'
    }
  },
  en: {
    locked: 'Locked',
    select: 'Select',
    accessDenied: {
      subscription: 'This character is for paid members only',
      purchaseOnly: 'This character requires purchase',
      default: 'You do not have permission to select this character'
    }
  }
};

/**
 * ユーザーがキャラクターを利用できるか判定する関数
 * @param {Object} user - ユーザーオブジェクト
 * @param {Object} character - キャラクターオブジェクト
 * @returns {boolean} 利用可能な場合はtrue、不可能な場合はfalse
 */
export function canAccessCharacter(user, character) {
  if (!user || !character) return false;

  // 1. 無料キャラは全員OK
  if (character.characterAccessType === 'free') return true;

  // 2. サブスクキャラは有効なサブスク会員のみ
  if (character.characterAccessType === 'subscription') {
    return user.membershipType === 'subscription' && user.subscriptionStatus === 'active';
  }

  // 3. 買い切りキャラは購入済みのみ
  if (character.characterAccessType === 'purchaseOnly') {
    if (!Array.isArray(user.purchasedCharacters)) return false;
    
    return user.purchasedCharacters.some(pc => {
      const purchasedCharId = pc.character?.toString();
      const currentCharId = character._id?.toString();
      return purchasedCharId && currentCharId && 
             purchasedCharId === currentCharId && 
             pc.purchaseType === 'buy';
    });
  }

  return false;
}

/**
 * キャラクターのアクセス制限に関するメッセージを取得する関数
 * @param {Object} character - キャラクターオブジェクト
 * @param {string} lang - 言語コード ('ja' | 'en')
 * @returns {Object} アクセス制限に関するメッセージ
 */
export function getAccessMessages(character, lang = 'ja') {
  const messages = ACCESS_MESSAGES[lang] || ACCESS_MESSAGES.ja;
  
  return {
    buttonText: messages.select,
    lockedText: messages.locked,
    accessDeniedMessage: character.characterAccessType === 'subscription' 
      ? messages.accessDenied.subscription
      : character.characterAccessType === 'purchaseOnly'
        ? messages.accessDenied.purchaseOnly
        : messages.accessDenied.default
  };
} 