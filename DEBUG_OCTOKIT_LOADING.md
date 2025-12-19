# Octokit.js 読み込みデバッグガイド

## 🔍 問題の診断

### トラッキング防止エラー

以下のエラーが発生する場合があります:
```
Tracking Prevention blocked access to storage for https://unpkg.com/@octokit/core
```

これは、ブラウザのトラッキング防止機能（特にFirefoxやSafari）がunpkg.comからのスクリプト読み込みをブロックしていることを示しています。

### 解決策: jsDelivr CDNへの変更

unpkg.comの代わりに、トラッキング防止に強いjsDelivr CDNの統合版パッケージを使用するように変更しました:

```html
<!-- jsDelivr CDN (統合版、ブラウザ対応) -->
<script src="https://cdn.jsdelivr.net/npm/octokit@3.1.2/dist/octokit.min.js" crossorigin="anonymous"></script>
```

**利点**:
- 単一ファイルで全機能を提供（プラグイン統合済み）
- UMD形式でブラウザで直接`<script>`タグで読み込める
- トラッキング防止に強い
- メンテナンスが簡単

### その他の読み込みエラー

以下のエラーが発生する場合もあります:
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
✅ cdn.jsdelivr.net/npm/octokit@3.1.2/dist/octokit.min.js
```

**トラッキング防止エラーが表示される場合**:
- ブラウザのトラッキング防止設定を確認
- Firefoxの場合: `about:preferences#privacy` で「強化型トラッキング防止機能」を「標準」に設定
- Safariの場合: 設定 > プライバシー > 「サイト越えトラッキングを防ぐ」を一時的に無効化

### ステップ3: コンソールでグローバル変数を確認

ページ読み込み後、コンソールで以下を実行:

```javascript
console.log('Octokit:', typeof window.Octokit);
console.log('Octokit.Octokit:', typeof window.Octokit?.Octokit);
```

**期待される結果**:
```
Octokit: object
Octokit.Octokit: function
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
https://cdn.jsdelivr.net/npm/octokit@3.1.2/dist/octokit.min.js
```

**期待される結果**: JavaScript コードが表示される

**もしエラーが表示される場合**: CDN へのアクセスがブロックされています

### 方法4: ブラウザのトラッキング防止設定を確認

**Firefox の場合**:
1. `about:preferences#privacy` にアクセス
2. 「強化型トラッキング防止機能」を確認
3. 「カスタム」の場合、「トラッカー」のみにチェックを入れる
4. または、このサイトのみ例外として追加

**Safari の場合**:
1. 設定 > プライバシー
2. 「サイト越えトラッキングを防ぐ」を確認
3. 必要に応じて一時的に無効化

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
Octokit: 
Octokit.Octokit: 
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
