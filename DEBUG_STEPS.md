# 🔍 トークン保存エラーのデバッグ手順

## 現在の状況

**エラー**: 「データ処理中に予期しないエラーが発生しました」と表示され、手動入力モードに遷移

---

## 📋 今すぐ実行すべき手順

### ステップ1: ブラウザのコンソールを開く

1. **F12** キーを押す（または右クリック > 検証）
2. **Console** タブを選択
3. 赤いエラーメッセージを確認

### ステップ2: ページを再読み込み

1. **Ctrl + Shift + R**（Windows/Linux）または **Cmd + Shift + R**（Mac）でハードリロード
2. キャッシュをクリアして再読み込み

### ステップ3: 再度トークンを保存

1. Personal Access Token を入力
2. **保存** ボタンをクリック
3. コンソールに表示されるメッセージを確認

---

## 🔍 コンソールで確認すべき情報

### 期待される正常なログ

```
Starting token save process...
Token length: 93
Token prefix: github_pat_
Encryption supported, testing connection...
Connection test passed, encrypting token...
GitHubSettingsManager.setAccessToken called
Encrypting token...
Token encrypted, length: 200
Updating settings...
Settings updated: true
Token saved successfully
```

### エラーが発生した場合

コンソールに以下のような情報が表示されます：

```
Failed to save token: [エラーメッセージ]
Error stack: [スタックトレース]
=== デバッグ情報 ===
crypto.subtle available: true/false
HTTPS: true/false
localhost: true/false
TokenEncryption available: true/false
localStorage available: true/false
```

---

## 🛠️ エラー別の対処方法

### エラー1: 「暗号化機能が読み込まれていません」

**原因**: JavaScriptファイルの読み込み順序の問題

**解決方法**:
1. ページを完全にリロード（Ctrl + Shift + R）
2. ブラウザのキャッシュをクリア
3. 別のブラウザで試す

### エラー2: 「このブラウザは暗号化機能をサポートしていません」

**原因**: HTTPでアクセスしている、または古いブラウザ

**解決方法**:
1. **GitHub Pagesでアクセス**（推奨）:
   ```
   https://hit-maruyama.github.io/spec-tracking-site/settings.html
   ```

2. **ローカルの場合は localhost を使用**:
   ```
   http://localhost:8000/settings.html
   ```

3. **ブラウザを更新**:
   - Chrome、Firefox、Safari、Edgeの最新版

### エラー3: 「GitHub APIへの接続に失敗しました」

**原因**: トークンの権限不足、またはネットワークエラー

**解決方法**:
1. **トークンの権限を確認**:
   - Actions: Read-only ✅
   - Commit statuses: Read-only ✅
   - Contents: Read-only ✅
   - Metadata: Read-only ✅

2. **インターネット接続を確認**

3. **新しいトークンを生成**

### エラー4: 「設定の保存に失敗しました」

**原因**: LocalStorageの容量不足、またはブラウザの制限

**解決方法**:
1. **LocalStorageをクリア**:
   ```javascript
   // ブラウザのコンソールで実行
   localStorage.clear()
   ```

2. **プライベートモードを終了**:
   - 通常モードでブラウザを開く

3. **ブラウザの設定を確認**:
   - Cookie とサイトデータが許可されているか

---

## 🧪 手動デバッグ

### テスト1: 暗号化機能の確認

ブラウザのコンソールで以下を実行:

```javascript
// 暗号化機能がサポートされているか確認
console.log('=== 暗号化機能チェック ===');
console.log('crypto.subtle:', typeof crypto.subtle !== 'undefined');
console.log('Protocol:', window.location.protocol);
console.log('Hostname:', window.location.hostname);
console.log('TokenEncryption:', typeof TokenEncryption !== 'undefined');

if (typeof TokenEncryption !== 'undefined') {
    console.log('TokenEncryption.isSupported():', TokenEncryption.isSupported());
}
```

**期待される結果**:
```
=== 暗号化機能チェック ===
crypto.subtle: true
Protocol: https:
Hostname: hit-maruyama.github.io
TokenEncryption: true
TokenEncryption.isSupported(): true
```

### テスト2: トークンの形式確認

```javascript
// トークンの形式を確認
const token = document.getElementById('github-token').value;
console.log('=== トークン形式チェック ===');
console.log('Length:', token.length);
console.log('Starts with:', token.substring(0, 15));
console.log('Has whitespace:', /\s/.test(token));
console.log('Is valid format:', /^(ghp_|github_pat_)/.test(token));
```

**期待される結果**:
```
=== トークン形式チェック ===
Length: 93 (または40以上)
Starts with: github_pat_xxxx (または ghp_xxxx)
Has whitespace: false
Is valid format: true
```

### テスト3: GitHub API接続テスト

```javascript
// GitHub APIへの接続テスト
const token = document.getElementById('github-token').value.trim();
console.log('=== GitHub API接続テスト ===');

fetch('https://api.github.com/rate_limit', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28'
    }
})
.then(response => {
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    return response.json();
})
.then(data => {
    console.log('Response:', data);
    if (data.resources && data.resources.core) {
        console.log('Rate limit:', data.resources.core.limit);
        console.log('Remaining:', data.resources.core.remaining);
    }
})
.catch(error => {
    console.error('Error:', error);
});
```

**期待される結果**:
```
=== GitHub API接続テスト ===
Status: 200
Status Text: OK
Response: { resources: { core: { limit: 5000, remaining: 4999, ... } } }
Rate limit: 5000
Remaining: 4999
```

### テスト4: 暗号化テスト

```javascript
// 暗号化・復号化テスト
console.log('=== 暗号化テスト ===');

const testToken = 'test_token_12345';

TokenEncryption.encrypt(testToken)
    .then(encrypted => {
        console.log('Encrypted:', encrypted.substring(0, 50) + '...');
        console.log('Encrypted length:', encrypted.length);
        return TokenEncryption.decrypt(encrypted);
    })
    .then(decrypted => {
        console.log('Decrypted:', decrypted);
        console.log('Match:', testToken === decrypted);
    })
    .catch(error => {
        console.error('Encryption test failed:', error);
    });
```

**期待される結果**:
```
=== 暗号化テスト ===
Encrypted: YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXoxMjM0NTY3ODkw...
Encrypted length: 200
Decrypted: test_token_12345
Match: true
```

---

## 📸 スクリーンショットを取得

以下の情報のスクリーンショットを取得してください：

1. **エラーメッセージ**
   - 画面に表示されるエラーメッセージ

2. **コンソールのエラー**
   - ブラウザのコンソール（F12）に表示される赤いエラー

3. **デバッグ情報**
   - コンソールに表示される「=== デバッグ情報 ===」セクション

---

## 🔄 次のステップ

### ケース1: すべてのテストが成功する場合

→ 問題は一時的なものだった可能性があります
→ もう一度トークンを保存してみてください

### ケース2: 暗号化機能のテストが失敗する場合

→ HTTPSまたはlocalhostでアクセスしてください
→ ブラウザを更新してください

### ケース3: GitHub API接続テストが失敗する場合

→ トークンの権限を確認してください
→ 新しいトークンを生成してください

### ケース4: 暗号化テストが失敗する場合

→ ページを完全にリロードしてください
→ 別のブラウザで試してください

---

## 💬 報告する場合

問題が解決しない場合は、以下の情報を含めて報告してください：

```
### 環境
- URL: [実際のURL]
- ブラウザ: [Chrome/Firefox/Safari/Edge] バージョン: [XX.X]
- OS: [Windows/Mac/Linux]

### エラー内容
[コンソールのエラーメッセージをコピー]

### デバッグ情報
crypto.subtle: [true/false]
Protocol: [https:/http:]
TokenEncryption: [true/false]
TokenEncryption.isSupported(): [true/false]

### テスト結果
- 暗号化機能チェック: [成功/失敗]
- トークン形式チェック: [成功/失敗]
- GitHub API接続テスト: [成功/失敗]
- 暗号化テスト: [成功/失敗]

### スクリーンショット
[添付]
```

---

**最終更新**: 2024年12月17日  
**バージョン**: 1.0.0
