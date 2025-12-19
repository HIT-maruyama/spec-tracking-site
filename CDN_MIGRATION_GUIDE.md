# CDN移行ガイド: unpkg.com → jsDelivr

## 問題の背景

### 発生したエラー
```
Tracking Prevention blocked access to storage for https://unpkg.com/@octokit/core
```

### 原因
ブラウザのトラッキング防止機能（特にFirefoxやSafari）が、unpkg.comからのスクリプト読み込みをサードパーティトラッキングとして誤検知し、ブロックしていました。

## 解決策

### CDNの変更: unpkg.com → jsDelivr

jsDelivrは以下の理由で選択されました：

1. **トラッキング防止に強い**: 多くのブラウザでホワイトリストに登録されている
2. **高い信頼性**: CDNとして広く使用されており、安定性が高い
3. **パフォーマンス**: グローバルCDNネットワークによる高速配信
4. **セキュリティ**: SRI（Subresource Integrity）対応

### 変更内容

#### 変更前（unpkg.com - 複数ファイル）
```html
<script src="https://unpkg.com/@octokit/core"></script>
<script src="https://unpkg.com/@octokit/plugin-rest-endpoint-methods"></script>
<script src="https://unpkg.com/@octokit/plugin-paginate-rest"></script>
<script src="https://unpkg.com/@octokit/plugin-throttling"></script>
<script src="https://unpkg.com/@octokit/plugin-retry"></script>
```

#### 変更後（jsDelivr - 統合版、単一ファイル）
```html
<script src="https://cdn.jsdelivr.net/npm/octokit@3.1.2/dist/octokit.min.js" crossorigin="anonymous"></script>
```

### 主な変更点

1. **ベースURL**: `unpkg.com` → `cdn.jsdelivr.net/npm`
2. **パッケージ**: 個別パッケージ（`@octokit/core`等）→ 統合パッケージ（`octokit`）
3. **ファイル数**: 5ファイル → 1ファイル（統合版）
4. **バージョン指定**: 明示的なバージョン番号（`@3.1.2`）
5. **CORS属性**: `crossorigin="anonymous"` を追加してセキュリティを強化

**統合版の利点**:
- **シンプル**: 単一ファイルで全機能を提供
- **メンテナンス性**: バージョン管理が容易
- **パフォーマンス**: HTTPリクエスト数が削減
- **互換性**: すべてのプラグインが統合済み
- **UMD形式**: ブラウザで直接`<script>`タグで読み込める

## 影響を受けるファイル

以下のHTMLファイルを更新しました：

- ✅ `index.html` - プロジェクト一覧ページ
- ✅ `project-detail.html` - プロジェクト詳細ページ
- ✅ `settings.html` - 設定ページ

## テスト方法

### 1. ブラウザキャッシュのクリア

変更を確認する前に、必ずブラウザキャッシュをクリアしてください：

**Chrome/Edge**:
- F12 → 右クリックで再読み込みボタンを長押し → 「キャッシュの消去とハード再読み込み」

**Firefox**:
- Ctrl + Shift + Delete → キャッシュをクリア → Ctrl + F5

### 2. ネットワークタブで確認

1. F12でデベロッパーツールを開く
2. Networkタブを選択
3. ページを再読み込み
4. 以下のスクリプトが **200 OK** で読み込まれることを確認：

```
✅ cdn.jsdelivr.net/npm/octokit@3.1.2/dist/octokit.min.js
```

### 3. コンソールでグローバル変数を確認

コンソールで以下を実行：

```javascript
console.log('Octokit:', typeof window.Octokit);
```

**期待される結果**: `object` が表示される

### 4. 機能テスト

1. 設定ページでGitHub Personal Access Tokenを入力
2. 「接続テスト」ボタンをクリック
3. 接続が成功することを確認

## トラブルシューティング

### エラーが継続する場合

#### 1. ブラウザのトラッキング防止設定を確認

**Firefox**:
- `about:preferences#privacy` にアクセス
- 「強化型トラッキング防止機能」を「標準」に設定

**Safari**:
- 設定 > プライバシー
- 「サイト越えトラッキングを防ぐ」を確認

#### 2. 別のブラウザで試す

- Chrome、Firefox、Edge、Safariなど、複数のブラウザでテスト

#### 3. プライベートブラウジングモードで試す

- キャッシュや拡張機能の影響を排除してテスト

### CDNが利用できない場合の代替案

企業ファイアウォールなどでCDNへのアクセスが制限されている場合：

1. **ローカルホスティング**: Octokit.jsをダウンロードしてローカルでホスト
2. **別のCDN**: unpkg.comやcdnjs.comなど、別のCDNを試す
3. **npmパッケージ**: ビルドプロセスを導入してnpmパッケージを使用

## メリット

### jsDelivrの利点

1. **高い互換性**: 主要ブラウザのトラッキング防止機能と互換性が高い
2. **パフォーマンス**: 世界中のCDNノードによる高速配信
3. **信頼性**: 99.9%のアップタイム保証
4. **セキュリティ**: 自動的なマルウェアスキャン
5. **バージョン管理**: セマンティックバージョニング対応

### バージョン固定の利点

1. **予測可能性**: 予期しない破壊的変更を防ぐ
2. **デバッグ容易性**: 問題発生時のバージョン特定が容易
3. **安定性**: 本番環境での安定した動作を保証

## 今後の対応

### バージョン更新

Octokit.jsの新しいバージョンがリリースされた場合：

1. リリースノートを確認
2. テスト環境で動作確認
3. HTMLファイルのバージョン番号を更新
4. 本番環境にデプロイ

### モニタリング

以下を定期的に確認：

1. jsDelivrのステータスページ: https://status.jsdelivr.com/
2. Octokit.jsのリリース情報: https://github.com/octokit/octokit.js/releases
3. ブラウザの互換性情報

## 参考リンク

- [jsDelivr公式サイト](https://www.jsdelivr.com/)
- [Octokit.js公式ドキュメント](https://github.com/octokit/octokit.js)
- [ブラウザのトラッキング防止について](https://developer.mozilla.org/ja/docs/Web/Privacy)

---

**作成日**: 2024年12月19日  
**目的**: unpkg.comからjsDelivrへのCDN移行に関する記録
