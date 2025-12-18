# トークン保存エラーのトラブルシューティング

## 🐛 発生している問題

**症状**: トークンを貼り付けて保存ボタンをクリックすると「データ処理中に予期しないエラーが発生しました」と表示され、手動入力モードに遷移してしまう

---

## 🔍 エラーの原因を特定する方法

### ステップ1: ブラウザのコンソールを開く

1. **Windows/Linux**: `F12` または `Ctrl + Shift + I`
2. **Mac**: `Cmd + Option + I`
3. **Console** タブを選択

### ステップ2: エラーメッセージを確認

コンソールに表示される赤いエラーメッセージを確認してください。以下のようなエラーが表示されているはずです：

```
Failed to save token: [エラーの詳細]
```

---

## 🔧 考えられる原因と解決方法

### 原因1: 暗号化機能がサポートされていない

**エラーメッセージ例**:
```
crypto.subtle is not available
```

**原因**:
- HTTPSではなくHTTPでアクセスしている
- 古いブラウザを使用している

**解決方法**:
1. **GitHub Pagesでアクセス**（推奨）:
   ```
   https://hit-maruyama.github.io/spec-tracking-site/settings.html
   ```

2. **ローカルでテストする場合**:
   - `localhost` でアクセス（HTTPでも暗号化機能が利用可能）
   ```
   http://localhost:8000/settings.html
   ```

3. **ブラウザを更新**:
   - Chrome、Firefox、Safari、Edgeの最新版を使用

---

### 原因2: トークンの形式が正しくない

**エラーメッセージ例**:
```
Invalid token format
```

**原因**:
- トークンに余分な空白や改行が含まれている
- トークンが不完全

**解決方法**:
1. トークンを再度コピー
2. 余分な空白や改行を削除
3. トークンの形式を確認:
   - Classic token: `ghp_` で始まる
   - Fine-grained token: `github_pat_` で始まる

---

### 原因3: GitHub APIへの接続失敗

**エラーメッセージ例**:
```
Failed to connect to GitHub API
Network error
```

**原因**:
- インターネット接続の問題
- トークンの権限が不足
- トークンが無効または期限切れ

**解決方法**:
1. **インターネット接続を確認**

2. **トークンの権限を確認**:
   - Actions: Read-only
   - Commit statuses: Read-only
   - Contents: Read-only
   - Metadata: Read-only

3. **トークンの有効期限を確認**:
   - GitHub > Settings > Developer settings > Personal access tokens
   - トークンが有効期限内か確認

4. **新しいトークンを生成**:
   - 古いトークンを削除
   - 新しいトークンを生成して再試行

---

### 原因4: LocalStorageの問題

**エラーメッセージ例**:
```
QuotaExceededError
Failed to store data in localStorage
```

**原因**:
- LocalStorageの容量が不足
- プライベートブラウジングモード
- ブラウザの設定でLocalStorageが無効

**解決方法**:
1. **LocalStorageをクリア**:
   ```javascript
   // ブラウザのコンソールで実行
   localStorage.clear()
   ```

2. **通常モードでブラウザを開く**:
   - プライベート/シークレットモードを終了

3. **ブラウザの設定を確認**:
   - Cookie とサイトデータが許可されているか確認

---

### 原因5: CORS（Cross-Origin Resource Sharing）エラー

**エラーメッセージ例**:
```
CORS policy: No 'Access-Control-Allow-Origin' header
```

**原因**:
- ファイルを直接開いている（file://プロトコル）

**解決方法**:
1. **GitHub Pagesでアクセス**（推奨）:
   ```
   https://hit-maruyama.github.io/spec-tracking-site/settings.html
   ```

2. **ローカルサーバーを使用**:
   ```bash
   python -m http.server 8000
   ```
   その後、`http://localhost:8000/settings.html` でアクセス

---

## 🧪 デバッグ手順

### 手順1: 暗号化機能の確認

ブラウザのコンソールで以下を実行:

```javascript
// 暗号化機能がサポートされているか確認
console.log('crypto.subtle available:', typeof crypto.subtle !== 'undefined');
console.log('HTTPS:', window.location.protocol === 'https:');
console.log('localhost:', window.location.hostname === 'localhost');
```

**期待される結果**:
```
crypto.subtle available: true
HTTPS: true (または localhost: true)
```

---

### 手順2: トークンの形式確認

ブラウザのコンソールで以下を実行:

```javascript
// トークンの形式を確認（実際のトークンは表示されません）
const token = document.getElementById('github-token').value;
console.log('Token length:', token.length);
console.log('Token starts with:', token.substring(0, 10));
console.log('Has whitespace:', /\s/.test(token));
```

**期待される結果**:
```
Token length: 40以上
Token starts with: ghp_ または github_pat_
Has whitespace: false
```

---

### 手順3: GitHub API接続テスト

ブラウザのコンソールで以下を実行:

```javascript
// GitHub APIへの接続テスト
const token = document.getElementById('github-token').value.trim();
fetch('https://api.github.com/rate_limit', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json'
    }
})
.then(response => {
    console.log('API Response status:', response.status);
    return response.json();
})
.then(data => {
    console.log('API Response:', data);
})
.catch(error => {
    console.error('API Error:', error);
});
```

**期待される結果**:
```
API Response status: 200
API Response: { resources: { core: { ... } } }
```

---

### 手順4: LocalStorage確認

ブラウザのコンソールで以下を実行:

```javascript
// LocalStorageの状態を確認
console.log('localStorage available:', typeof localStorage !== 'undefined');
console.log('localStorage keys:', Object.keys(localStorage));
console.log('localStorage size:', JSON.stringify(localStorage).length);
```

**期待される結果**:
```
localStorage available: true
localStorage keys: [...]
localStorage size: 数値
```

---

## 🔄 一時的な回避策

エラーが解決しない場合の一時的な回避策：

### 方法1: テストページで確認

1. テスト用ページを開く:
   ```
   https://hit-maruyama.github.io/spec-tracking-site/test-token-encryption.html
   ```

2. 基本的な暗号化・復号化テストを実行

3. すべてのテストが成功することを確認

---

### 方法2: ブラウザを変更

1. 別のブラウザで試す:
   - Chrome
   - Firefox
   - Safari
   - Edge

2. 最新版に更新

---

### 方法3: シークレットモードで試す

1. シークレット/プライベートモードを**使用しない**
2. 通常モードで開く
3. 拡張機能を無効化

---

## 📝 エラー報告テンプレート

問題が解決しない場合は、以下の情報を含めて報告してください：

```
### 環境情報
- ブラウザ: [Chrome/Firefox/Safari/Edge] バージョン: [XX.X]
- OS: [Windows/Mac/Linux]
- アクセス方法: [GitHub Pages/localhost/file://]
- URL: [実際のURL]

### エラー内容
- エラーメッセージ: [コンソールのエラーメッセージ]
- 発生タイミング: [保存ボタンクリック時]
- 再現手順: [1. ... 2. ... 3. ...]

### デバッグ結果
- crypto.subtle available: [true/false]
- HTTPS: [true/false]
- Token length: [数値]
- API Response status: [数値]
- localStorage available: [true/false]

### その他
- [追加情報]
```

---

## 🆘 緊急対応

すぐに使用を開始したい場合：

### オプション1: Classic Tokenを使用

Fine-grained tokenで問題が発生する場合、Classic tokenを試してください：

1. GitHub > Settings > Developer settings
2. Personal access tokens > **Tokens (classic)**
3. Generate new token (classic)
4. Scopes: `repo:status`, `repo_deployment`, `public_repo`

---

### オプション2: 手動入力モードを使用

GitHub統合が動作しない場合は、従来の手動入力モードを使用できます：

1. プロジェクト詳細ページを開く
2. CI結果タブで手動でCI結果を入力
3. GitHub統合は後で設定

---

## 📞 サポート

上記の手順で解決しない場合：

1. ブラウザのコンソールのスクリーンショットを取得
2. エラーメッセージ全文をコピー
3. GitHubのIssueで報告

---

**最終更新**: 2024年12月17日  
**バージョン**: 1.0.0
