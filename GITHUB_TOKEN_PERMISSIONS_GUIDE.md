# GitHub Personal Access Token - 権限設定ガイド

## 🎯 あなたの設定（Fine-grained tokens）

GitHubの新しいFine-grained personal access tokensを使用されていますね。以下の手順で設定してください。

---

## ✅ 正しい設定手順

### 1. Repository access（リポジトリアクセス）

**選択**: `Only select repositories`（特定のリポジトリのみ）

**設定方法**:
1. **Only select repositories** を選択
2. **Select repositories** ドロップダウンをクリック
3. 監視したいリポジトリを選択
   - 例: `HIT-maruyama/spec-tracking-site`

✅ **あなたの設定**: `HIT-maruyama/spec-tracking-site` を選択済み

---

### 2. Permissions（権限）

**Repository permissions** セクションで以下を設定してください：

#### 📋 設定する権限一覧

| 権限項目 | 設定値 | 必須 | 説明 |
|---------|--------|------|------|
| **Actions** | `Read-only` | ✅ 必須 | GitHub Actionsのワークフロー実行結果を読み取る |
| **Commit statuses** | `Read-only` | ✅ 必須 | コミットステータスを読み取る |
| **Contents** | `Read-only` | ✅ 必須 | リポジトリの内容を読み取る |
| **Metadata** | `Read-only` | ✅ 自動 | リポジトリのメタデータ（自動的に設定される） |

---

## 🔍 詳細な設定手順

### ステップ1: Permissionsセクションを見つける

トークン作成ページを下にスクロールして、**Permissions** セクションを見つけます。

### ステップ2: Repository permissionsを展開

**Repository permissions** の見出しをクリックして展開します。

### ステップ3: 各権限を設定

以下の権限を1つずつ設定します：

#### 3-1. Actions（アクション）

1. **Actions** の行を見つける
2. ドロップダウンをクリック
3. **Read-only** を選択

```
Actions: No access → Read-only
```

**この権限で取得できる情報**:
- ワークフローの実行履歴
- ワークフローの実行結果（成功/失敗）
- ジョブの詳細情報
- ステップの実行ログ

#### 3-2. Commit statuses（コミットステータス）

1. **Commit statuses** の行を見つける
2. ドロップダウンをクリック
3. **Read-only** を選択

```
Commit statuses: No access → Read-only
```

**この権限で取得できる情報**:
- コミットのステータス（成功/失敗/保留中）
- CI/CDパイプラインの結果
- チェックの詳細

#### 3-3. Contents（コンテンツ）

1. **Contents** の行を見つける
2. ドロップダウンをクリック
3. **Read-only** を選択

```
Contents: No access → Read-only
```

**この権限で取得できる情報**:
- リポジトリのファイル
- ブランチ情報
- コミット情報

#### 3-4. Metadata（メタデータ）

**自動的に設定されます** - 手動設定は不要

```
Metadata: Read-only (自動)
```

**この権限で取得できる情報**:
- リポジトリの基本情報
- リポジトリ名、説明、URL

---

## 📸 設定画面のイメージ

```
┌─────────────────────────────────────────────────────────┐
│ Permissions                                              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Repository permissions                                   │
│ ▼ (展開)                                                 │
│                                                          │
│ Actions                    [Read-only ▼]                │
│ Commit statuses            [Read-only ▼]                │
│ Contents                   [Read-only ▼]                │
│ Metadata                   Read-only (Required)          │
│                                                          │
│ ... (その他の権限は No access のまま)                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ⚠️ 注意事項

### ✅ 設定すべき権限

以下の4つの権限のみを設定してください：
- ✅ Actions: Read-only
- ✅ Commit statuses: Read-only
- ✅ Contents: Read-only
- ✅ Metadata: Read-only（自動）

### ❌ 設定不要な権限

以下の権限は **No access** のままで問題ありません：
- ❌ Administration
- ❌ Code scanning alerts
- ❌ Codespaces
- ❌ Dependabot alerts
- ❌ Deployments
- ❌ Discussions
- ❌ Environments
- ❌ Issues
- ❌ Pages
- ❌ Pull requests
- ❌ Repository security advisories
- ❌ Secret scanning alerts
- ❌ Secrets
- ❌ Variables
- ❌ Webhooks
- ❌ Workflows

### 🔒 セキュリティのポイント

1. **Read-only（読み取り専用）のみ**
   - すべての権限を Read-only に設定
   - Write（書き込み）権限は不要

2. **最小権限の原則**
   - 必要な権限のみを付与
   - 不要な権限は No access のまま

3. **特定のリポジトリのみ**
   - All repositories ではなく Only select repositories を選択
   - 監視が必要なリポジトリのみを選択

---

## 🎉 設定完了の確認

すべての設定が完了したら、以下を確認してください：

### チェックリスト

- [ ] Repository access: `Only select repositories` を選択
- [ ] 監視したいリポジトリを選択（例: `HIT-maruyama/spec-tracking-site`）
- [ ] Actions: `Read-only` に設定
- [ ] Commit statuses: `Read-only` に設定
- [ ] Contents: `Read-only` に設定
- [ ] Metadata: `Read-only`（自動設定を確認）
- [ ] その他の権限: `No access` のまま

### 設定完了後

1. ページ下部の **Generate token** ボタンをクリック
2. 生成されたトークンをコピー
3. 設定ページ（settings.html）でトークンを設定

---

## 🔧 トラブルシューティング

### 問題: 権限の項目が見つからない

**解決方法**:
1. **Repository permissions** セクションが展開されているか確認
2. ページを下にスクロールして探す
3. ブラウザの検索機能（Ctrl+F / Cmd+F）で「Actions」を検索

### 問題: Read-onlyが選択できない

**解決方法**:
1. Repository access で特定のリポジトリを選択しているか確認
2. ページをリロードして再試行
3. 別のブラウザで試す

### 問題: Metadataが設定できない

**解決方法**:
- Metadata は自動的に設定されます
- 手動で設定する必要はありません
- Read-only と表示されていれば正常です

---

## 📚 参考情報

### 各権限の詳細

#### Actions（アクション）
GitHub Actionsのワークフロー実行に関する情報にアクセスします。
- ワークフローの実行履歴
- ジョブの詳細
- ステップのログ
- アーティファクト情報

#### Commit statuses（コミットステータス）
コミットに関連するステータス情報にアクセスします。
- CI/CDの実行結果
- チェックの状態
- ステータスチェックの詳細

#### Contents（コンテンツ）
リポジトリの内容にアクセスします。
- ファイルとディレクトリ
- ブランチ情報
- コミット履歴
- タグ情報

#### Metadata（メタデータ）
リポジトリの基本情報にアクセスします（自動設定）。
- リポジトリ名
- 説明
- URL
- 可視性（public/private）

---

## 💡 よくある質問

### Q: なぜ Read-only で十分なのですか？

**A**: このシステムはCI結果を読み取るだけで、GitHubに書き込む必要がないためです。Read-only 権限で以下が可能です：
- ワークフローの実行結果を取得
- CI結果を表示
- メトリクスを抽出

### Q: Write 権限を付与するとどうなりますか？

**A**: セキュリティリスクが高まります。Write 権限があると：
- リポジトリの内容を変更できる
- ワークフローを実行できる
- 設定を変更できる

このシステムでは不要な権限です。

### Q: All repositories を選択してもいいですか？

**A**: 推奨しません。理由：
- セキュリティリスクが高い
- すべてのリポジトリにアクセス可能になる
- トークンが漏洩した場合の影響が大きい

特定のリポジトリのみを選択することを強く推奨します。

---

**最終更新**: 2024年12月17日  
**対象**: Fine-grained personal access tokens  
**バージョン**: 1.0.0
