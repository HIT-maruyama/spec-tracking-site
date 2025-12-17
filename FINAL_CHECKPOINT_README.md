# 最終チェックポイント - テスト実行ガイド

## 概要

このドキュメントは、GitHub CI統合機能の最終チェックポイント（タスク17）として、すべてのテストを実行し、実装が正しく動作することを確認するためのガイドです。

## 🚀 クイックスタート

### 1. ローカルサーバーの起動

テストを実行する前に、ローカルサーバーを起動してください：

```bash
# Python 3を使用
python -m http.server 8000

# または Node.jsのserveを使用
npx serve .
```

### 2. テストダッシュボードを開く

ブラウザで以下のURLを開いてください：

```
http://localhost:8000/run-tests.html
```

### 3. テストを実行

テストダッシュボードから以下のいずれかの方法でテストを実行してください：

- **個別実行**: 各テストカードをクリックして個別にテストを実行
- **一括実行**: 「すべてのテストを実行」ボタンをクリックして全テストを実行

### 4. 結果を確認

各テストページで以下を確認してください：

- ✅ すべてのテストケースが「成功」または「✓」と表示される
- ✅ ブラウザのコンソール（F12）にエラーメッセージがない
- ✅ 各機能が仕様通りに動作する

## 📋 テストファイル一覧

### コア機能テスト
- `test-token-encryption.html` - トークン暗号化機能
- `test-github-settings-manager.html` - GitHub設定管理
- `test-integration.html` - 統合テスト

### エラー処理とネットワーク管理テスト
- `test-error-recovery.html` - エラー回復機能
- `test-network-monitor.html` - ネットワーク監視
- `test-github-error-handler.html` - GitHubエラーハンドリング

### 同期機能テスト
- `test-auto-sync-scheduler.html` - 自動同期スケジューラー
- `test-manual-sync.html` - 手動同期
- `test-sync-history.html` - 同期履歴
- `test-sync-history-integration.html` - 同期履歴統合

### レート制限管理テスト
- `test-rate-limit-handling.html` - レート制限管理

### プラグイン基盤テスト
- `test-ci-service-plugin.html` - プラグイン基盤

## 📝 テスト結果の記録

テスト実行後、`TEST_RESULTS_CHECKLIST.md` を使用して結果を記録してください：

1. ファイルを開く
2. 各テストの結果をチェック
3. 問題があれば備考欄に記録
4. 総合評価を記入

## ✅ 成功基準

すべてのテストで以下の条件を満たすこと：

1. **エラーなし**: コンソールに赤色のエラーメッセージが表示されない
2. **テスト合格**: すべてのテストケースが「✓ 成功」または「PASS」と表示される
3. **機能動作**: 各機能が仕様通りに動作する
4. **データ整合性**: データの保存・取得・削除が正しく動作する

## 🔧 トラブルシューティング

### CORS エラーが発生する

**原因**: ファイルを直接開いている（file://プロトコル）

**解決**: ローカルサーバーを起動してhttp://経由でアクセス

### スクリプトが読み込まれない

**原因**: ファイルパスが正しくない

**解決**: ブラウザの開発者ツールのネットワークタブで確認

### 暗号化機能がサポートされていない

**原因**: 古いブラウザまたはHTTPS以外の環境

**解決**: モダンブラウザを使用し、localhost（HTTP可）またはHTTPS環境で実行

### LocalStorageエラー

**原因**: プライベートブラウジングモードまたはストレージ容量超過

**解決**: 通常モードで開き、LocalStorageをクリア

## 📚 関連ドキュメント

- `TEST_EXECUTION_SUMMARY.md` - 詳細なテスト実行手順
- `TEST_RESULTS_CHECKLIST.md` - テスト結果記録用チェックリスト
- `TESTING_INSTRUCTIONS.md` - UI機能テスト手順
- `.kiro/specs/github-ci-integration/requirements.md` - 要件定義書
- `.kiro/specs/github-ci-integration/design.md` - 設計文書
- `.kiro/specs/github-ci-integration/tasks.md` - 実装計画

## 🎯 次のステップ

すべてのテストが成功したら：

1. ✅ タスク17を完了としてマーク
2. 📝 テスト結果を記録
3. 🚀 実際のGitHubリポジトリとの統合テストを実行
4. ⚙️ 設定ページ（settings.html）で実際のPersonal Access Tokenを設定
5. 🔄 プロジェクト詳細ページで手動同期を実行
6. ⏰ 自動同期機能を有効化して動作確認

## ⚠️ 注意事項

- テスト実行時は必ずブラウザの開発者ツールを開いてコンソールを確認してください
- 一部のテストはGitHub APIの実際の呼び出しを行うため、レート制限に注意してください
- テスト用のPersonal Access Tokenは最小限の権限（repo:status、repo_deployment）のみを付与してください
- テスト後はLocalStorageをクリアして、本番データと混在しないようにしてください

## 📞 サポート

問題が発生した場合は、以下を確認してください：

1. ブラウザのコンソールでエラーメッセージを確認
2. ネットワークタブでファイルの読み込み状況を確認
3. LocalStorageの内容を確認（開発者ツール > Application > Local Storage）
4. 要件定義書と設計文書を参照して仕様を確認

---

**最終更新**: 2024年12月17日  
**バージョン**: 1.0.0  
**ステータス**: 最終チェックポイント実行中
