// 画像サイズ設定
// この設定を変更することで、アップロード時のクロップサイズを一括で変更できます

export const IMAGE_SIZES = {
  // キャラクター選択画面用
  characterSelect: { width: 238, height: 260 },
  
  // ダッシュボード画面用
  dashboard: { width: 320, height: 528 },
  
  // チャット背景用
  chatBackground: { width: 455, height: 745 },
  
  // チャットアバター用
  chatAvatar: { width: 400, height: 400 },
};

// ギャラリー画像サイズ（ダッシュボードと同じサイズに統一）
export const GALLERY_IMAGE_SIZE = { width: 320, height: 528 };

// 全ギャラリー画像のサイズ設定を生成
export const getGalleryImageSizes = () => {
  const galleryImageSizes = {};
  for (let i = 1; i <= 10; i++) {
    galleryImageSizes[`gallery${i}`] = GALLERY_IMAGE_SIZE;
  }
  return galleryImageSizes;
};

// 全画像サイズ設定をまとめて取得
export const getAllImageSizes = () => {
  return {
    ...IMAGE_SIZES,
    ...getGalleryImageSizes()
  };
};

// サイズ変更履歴（参考用）
// 2024-01-30: ギャラリー画像サイズを400x400から320x528に変更（ダッシュボードと統一）