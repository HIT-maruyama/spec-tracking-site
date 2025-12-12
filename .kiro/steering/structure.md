# プロジェクト構造と組織化

## ディレクトリレイアウト

```
/
├── .kiro/                          # Kiro設定
│   ├── specs/                      # プロジェクト仕様
│   │   └── spec-tracking-site/     # 現在のプロジェクト仕様
│   └── steering/                   # AIアシスタントガイダンス
├── index.html                      # メインプロジェクト一覧ページ
├── project-detail.html             # タブ付きプロジェクト詳細ビュー
├── styles.css                      # グローバルスタイルシート
├── app.js                          # メインアプリケーションロジック
└── data/                           # 静的データファイル
    ├── projects.json               # サンプルプロジェクトデータ
    └── review_log.json             # サンプルレビュー指摘
```

## コード組織化の原則

### JavaScript アーキテクチャ

**モジュラーコンポーネント** - 集中した単一責任のクラスにコードを組織化：

- `DataManager` - プロジェクトとレビュー指摘のコアCRUD操作
- `LocalStorageManager` - ブラウザストレージの抽象化レイヤー
- `ValidationEngine` - 入力バリデーションとエラーハンドリング
- `ClassificationSystemEnforcer` - 事前定義された分類体系の強制
- `UIController` - イベントハンドリングとDOM操作
- `ErrorHandler` - ユーザーフレンドリーなエラーメッセージング

### データフローパターン

```
UI Events → UIController → DataManager → LocalStorageManager → LocalStorage
                     ↓
              ValidationEngine ← ClassificationSystemEnforcer
```

### ファイル命名規則

- **HTML**: ケバブケース (`project-detail.html`)
- **CSS**: コンポーネントベース組織化による単一スタイルシート
- **JavaScript**: キャメルケースクラス、説明的メソッド名
- **Data**: アンダースコア付き小文字 (`review_log.json`)

## 主要アーキテクチャ決定

### 静的サイト制約
- ビルドプロセス不要 - 直接ファイル配信
- すべてのロジックをvanilla JavaScript (ES6+)で実装
- 外部依存やCDNリソースなし
- GitHub Pages互換構造

### データ管理戦略
- 構造化キーによるLocalStorageをプライマリデータストアとして使用：
  - `spec-tracking-site:projects`
  - `spec-tracking-site:reviewFindings`
  - `spec-tracking-site:initialized`
- データバックアップのためのJSONエクスポート
- 一意識別子としてのUUID v4

### UI組織化
- **2ページ構造**: リストビューと詳細ビュー
- **タブベース詳細ページ**: CI結果、レビュー指摘、効果メトリクス
- **モーダルフォーム**: 追加・編集操作用
- **インライン編集**: 迅速な更新に適した箇所

### 分類システム
すべてのデータで一貫した分類体系を強制：
- プロセスフェーズ: planning、design、implementation、testing、documentation
- ドキュメントタイプ: spec、design_doc、source_code、test_case等
- カテゴリ: requirements_gap、implementation_bug、security_issue等
- 重要度レベル: high、medium、low
- ステータス追跡: Open、InProgress、Resolved、Verified、Deferred、Rejected

## 開発ワークフロー

1. **HTML構造優先** - アクセシビリティを考慮したセマンティックマークアップ
2. **CSSスタイリング** - モバイルファーストレスポンシブデザイン
3. **JavaScript機能** - プログレッシブエンハンスメントアプローチ
4. **データ統合** - UIとlocalStorage操作の接続
5. **バリデーションレイヤー** - 包括的な入力バリデーション
6. **エラーハンドリング** - ユーザーフレンドリーなエラーメッセージと復旧