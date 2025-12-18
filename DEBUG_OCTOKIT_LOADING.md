# Octokit.js 読み込みデバッグガイド

## 🔍 問題の診断

現在、以下のエラーが発生しています:
```
Octokit.js is not loaded. Please check the CDN link.
Available globals: Array(0)
```

これは、Octokit.js の CDN スクリプトが正常に読み込まれていないことを示しています。

---

## 🧪 デバッグ手順

### ステップ1: ブラウザのキャッシュを完全にクリア

1. **Chrome/Edge の場合**:
   - F12 でデベロッパーツールを開く
   - 右クリックで「再読み込み」ボタンを長押し
   - **「キャッシュの消去とハード再読み込み」** を選択

2. **Firefox の場合**:
   - Ctrl + Shift + Delete でキャッシュクリア画面を開く
   - 「キャッシュ」にチェックを入れて削除
   - Ctrl + F5 でハード再読み込み

### ステップ2: ネットワークタブで CDN の読み込みを確認

1. F12 でデベロッパーツールを開く
2. **Network（ネットワーク）** タブを選択
3. ページを再読み込み（Ctrl + Shift + R）
4. 以下のスクリプトが **200 OK** で読み込まれているか確認:

```
✅ @octokit/core@5.0.2/dist/bundle.min.js
✅ @octokit/plugin-rest-endpoint-methods@10.0.1/dist/bundle.min.js
✅ @octokit/plugin-paginate-rest@9.1.5/dist/bundle.min.js
✅ @octokit/plugin-throttling@8.1.3/dist/bundle.min.js
✅ @octokit/plugin-retry@6.0.1/dist/bundle.min.js
```

### ステップ3: コンソールでグローバル変数を確認

ページ読み込み後、コンソールで以下を実行:

```javascript
console.log('OctokitCore:', typeof window.OctokitCore);
console.log('RestEndpointMethods:', typeof window.OctokitRestEndpointMethods);
console.log('PaginateRest:', typeof window.OctokitPaginateRest);
console.log('Throttling:', typeof window.OctokitPluginThrottling);
console.log('Retry:', typeof window.OctokitPluginRetry);
```

**期待される結果**:
```
OctokitCore: object
RestEndpointMethods: object
PaginateRest: object
Throttling: object
Retry: object
```

**もし `undefined` が表示される場合**:
- CDN からのスクリプト読み込みが失敗しています
- ネットワークタブで詳細を確認してください

---

## 🔧 考えられる原因と対処法

### 原因1: ブラウザキャッシュの問題

**対処法**:
- 上記のステップ1を実行
- プライベートブラウジングモード（シークレットモード）で開いてみる

### 原因2: CDN の一時的な問題

**対処法**:
- しばらく待ってから再試行
- 別のネットワーク（モバイルホットスポットなど）で試す

### 原因3: 企業ファイアウォール/プロキシの制限

**対処法**:
- ネットワーク管理者に `cdn.jsdelivr.net` へのアクセスを確認
- 別のネットワーク環境で試す

### 原因4: GitHub Pages のデプロイ遅延

**対処法**:
- GitHub Pages のデプロイが完了するまで 2〜3分待つ
- GitHub リポジトリの Actions タブでデプロイ状況を確認

---

## 🎯 即座に試せる対処法

### 方法1: 別のブラウザで試す

現在使用しているブラウザとは別のブラウザで開いてみてください:
- Chrome → Firefox
- Edge → Chrome
- など

### 方法2: プライベートブラウジングモードで試す

- **Chrome/Edge**: Ctrl + Shift + N
- **Firefox**: Ctrl + Shift + P

プライベートモードでは、キャッシュや拡張機能の影響を受けません。

### 方法3: 直接 CDN にアクセスして確認

ブラウザで以下の URL を直接開いて、スクリプトが表示されるか確認:

```
https://cdn.jsdelivr.net/npm/@octokit/core@5.0.2/dist/bundle.min.js
```

**期待される結果**: JavaScript コードが表示される

**もしエラーが表示される場合**: CDN へのアクセスがブロックされています

---

## 📊 デバッグ情報の収集

以下の情報を収集して報告してください:

### 1. ブラウザ情報
```
ブラウザ名: 
バージョン: 
OS: 
```

### 2. ネットワークタブの情報
```
@octokit/core のステータス: (200 OK / 404 / その他)
@octokit/plugin-rest-endpoint-methods のステータス: 
@octokit/plugin-paginate-rest のステータス: 
@octokit/plugin-throttling のステータス: 
@octokit/plugin-retry のステータス: 
```

### 3. コンソールのグローバル変数チェック結果
```
OctokitCore: 
RestEndpointMethods: 
PaginateRest: 
Throttling: 
Retry: 
```

### 4. その他のエラーメッセージ
```
(コンソールに表示されているすべてのエラーをコピー)
```

---

## 🚀 緊急回避策

もし上記の方法でも解決しない場合、以下の緊急回避策を試してください:

### 回避策1: ローカルで Octokit.js をホスト

CDN の代わりに、Octokit.js をローカルにダウンロードしてホストする方法があります。
（この方法は最終手段として使用してください）

### 回避策2: 別の CDN を試す

unpkg.com など、別の CDN を試すこともできます。

---

**作成日**: 2024年12月18日  
**目的**: Octokit.js 読み込み問題のデバッグ
