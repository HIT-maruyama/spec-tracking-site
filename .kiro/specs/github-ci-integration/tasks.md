# 実装計画

- [x] 1. プロジェクト構造とOctokit.js統合のセットアップ





  - Octokit.jsをCDN経由で追加（ブラウザ対応）
  - 新しいJavaScriptファイル（github-integration.js、settings.js）を作成
  - 設定ページ（settings.html）のHTMLファイルを作成
  - 既存のapp.jsファイルにGitHub統合機能のインポートを追加
  - _Requirements: 1.1, 2.1, 4.1, 7.1_

- [x] 2. データモデルとスキーマの拡張





- [x] 2.1 既存のProjectモデルを拡張


  - githubRepositoryフィールドを追加（owner、repo、url、lastSyncAt、syncEnabled、targetWorkflows）
  - 既存のCIResultモデルにsourceとgithubDataフィールドを追加
  - _Requirements: 1.3, 3.4_

- [x] 2.2 新しいデータモデルを定義


  - GitHubSettings、SyncRecord、WorkflowRun、Job、RateLimitのTypeScript型定義を作成
  - _Requirements: 2.2, 4.3, 7.2_

- [ ]* 2.3 データモデル拡張のプロパティテストを実装
  - **Property 2: リポジトリ情報の永続化**
  - **Validates: Requirements 1.3**

- [x] 3. 暗号化機能の実装




- [x] 3.1 TokenEncryptionクラスを実装


  - ブラウザフィンガープリント生成機能を実装
  - PBKDF2による鍵導出機能を実装
  - AES-GCMによる暗号化・復号化機能を実装
  - _Requirements: 2.2_

- [ ]* 3.2 暗号化機能のプロパティテストを実装
  - **Property 4: Personal Access Tokenの暗号化保存**
  - **Property 6: トークン削除の完全性**
  - **Validates: Requirements 2.2, 2.5**

- [x] 4. Octokit.js統合クライアントの実装




- [x] 4.1 Octokit.jsライブラリの統合


  - Octokit.jsをプロジェクトに追加（CDN経由でブラウザ対応）
  - GitHubIntegrationClientクラスの基本構造を実装
  - 自動レート制限とエラーハンドリング設定を実装
  - _Requirements: 3.2, 5.1_

- [x] 4.2 GitHub API呼び出しメソッドを実装


  - getWorkflowRuns、getAllWorkflowRuns（ページネーション対応）を実装
  - getJobsForRun、testConnection、validateRepositoryメソッドを実装
  - Octokit RequestErrorの統合エラーハンドリングを実装
  - _Requirements: 2.3, 3.3, 5.4_

- [ ]* 4.3 GitHub API Clientのプロパティテストを実装
  - **Property 5: GitHub API接続テスト**
  - **Property 7: ワークフロー実行データの取得**
  - **Validates: Requirements 2.3, 3.3**

- [x] 5. 拡張レート制限管理の実装




- [x] 5.1 RateLimitManagerクラスを実装


  - Octokit.jsのthrottling設定を管理
  - API使用状況の監視とレポート機能を実装
  - 複数プロジェクト同期時の最適間隔計算を実装
  - _Requirements: 5.1, 5.2, 5.5_



- [x] 5.2 カスタムレート制限ハンドリングを実装





  - onRateLimit、onSecondaryRateLimitコールバックを実装
  - ユーザー通知とUI更新機能を実装
  - 自動同期の一時停止・再開機能を実装
  - _Requirements: 5.3_

- [ ]* 5.3 レート制限管理のプロパティテストを実装
  - **Property 15: レート制限の監視と調整**
  - **Property 16: レート制限到達時の一時停止**
  - **Property 18: API呼び出し間隔の制御**
  - **Property 19: 認証状態に応じた制限値適用**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.5, 5.6**

- [x] 6. メトリクス抽出エンジンの実装





- [x] 6.1 MetricsExtractorクラスを実装


  - lint結果抽出機能（ESLint、その他）を実装
  - テスト結果抽出機能（Jest、Mocha、pytest、JUnit）を実装
  - カバレッジ結果抽出機能を実装
  - _Requirements: 6.2, 6.3, 6.4_


- [x] 6.2 SBOM検出とフォールバック機能を実装

  - SBOM生成ステップの検出機能を実装
  - メトリクス抽出失敗時の基本CI結果保存機能を実装
  - 一般的ワークフローのメトリクス対応を実装
  - _Requirements: 6.5, 6.6, 6.7_

- [ ]* 6.3 メトリクス抽出のプロパティテストを実装
  - **Property 20: メトリクス抽出の包括実行**
  - **Property 21: メトリクス抽出失敗時の基本保存**
  - **Property 22: 一般的ワークフローのメトリクス対応**
  - **Validates: Requirements 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

- [x] 7. ワークフローデータ解析の実装




- [x] 7.1 WorkflowDataParserクラスを実装


  - GitHub APIレスポンスのCIResult形式変換を実装
  - リポジトリURL解析機能を実装
  - ワークフロー実行データの抽出機能を実装
  - _Requirements: 3.4_

- [x] 7.2 重複チェックと統合機能を実装


  - 既存CI結果との重複回避機能を実装
  - 複数ワークフローの結果統合機能を実装
  - ワークフロー名の記録機能を実装
  - _Requirements: 3.5, 8.1, 8.2_

- [ ]* 7.3 ワークフローデータ解析のプロパティテストを実装
  - **Property 8: CI結果データの抽出**
  - **Property 9: 重複CI結果の回避**
  - **Property 27: 複数ワークフローの完全取得**
  - **Property 29: 同時実行ワークフローの個別記録**
  - **Validates: Requirements 3.4, 3.5, 8.1, 8.2, 8.4**

- [x] 8. エラー回復とネットワーク管理の実装








- [x] 8.1 ErrorRecoveryManagerクラスを実装


  - 指数バックオフ再試行機能を実装
  - 再試行可能エラーの判定ロジックを実装
  - 部分的同期失敗の処理機能を実装
  - _Requirements: 3.6, 10.5_

- [x] 8.2 ネットワーク状態監視を実装


  - オンライン/オフライン状態の監視機能を実装
  - ネットワーク復旧時の同期再開機能を実装
  - オフライン時の手動モード切り替え機能を実装
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ]* 8.3 エラー回復のプロパティテストを実装
  - **Property 33: オフライン時の手動モード切り替え**
  - **Property 34: オフライン検出時の処理**
  - **Property 35: ネットワーク復旧時の同期再開**
  - **Property 36: オフライン時の表示機能維持**
  - **Property 37: 部分同期データの保持と再試行**
  - **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5**

- [x] 9. GitHub設定管理の実装




- [x] 9.1 GitHubSettingsManagerクラスを実装


  - GitHub設定のCRUD操作を実装
  - Personal Access Tokenの管理機能を実装
  - 自動同期設定の管理機能を実装
  - _Requirements: 2.2, 4.3_

- [x] 9.2 同期履歴管理を実装


  - 同期履歴の記録機能を実装
  - 履歴の自動削除機能（100件制限）を実装
  - 履歴クリア機能を実装
  - _Requirements: 7.2, 7.3, 7.5, 7.6_

- [ ]* 9.3 GitHub設定管理のプロパティテストを実装
  - **Property 11: 自動同期設定の永続化**
  - **Property 23: 同期履歴の包括記録**
  - **Property 25: 履歴の自動管理**
  - **Property 26: 履歴のクリア機能**
  - **Validates: Requirements 4.3, 7.2, 7.3, 7.5, 7.6**

- [x] 10. 自動同期スケジューラーの実装





- [x] 10.1 AutoSyncSchedulerクラスを実装


  - シングルトンパターンによるスケジューラー管理を実装
  - 自動同期の開始・停止・一時停止機能を実装
  - オフライン状態の考慮機能を実装
  - _Requirements: 4.4, 4.7, 10.2_

- [x] 10.2 プロジェクト同期機能を実装


  - 全プロジェクトの同期機能を実装
  - 個別プロジェクトの同期機能を実装
  - レート制限を考慮した順次実行を実装
  - _Requirements: 4.4, 5.5_

- [x] 10.3 同期結果の処理を実装


  - 同期完了時の成功表示機能を実装
  - 表示の自動更新機能を実装
  - エラー時の記録機能を実装
  - _Requirements: 3.7, 4.6_

- [ ]* 10.4 自動同期スケジューラーのプロパティテストを実装
  - **Property 10: 同期完了時の成功表示**
  - **Property 12: バックグラウンド同期の対象選択**
  - **Property 13: 自動同期の表示更新**
  - **Property 14: 自動同期の停止**
  - **Validates: Requirements 3.7, 4.4, 4.6, 4.7**

- [-] 11. 設定ページのUI実装


- [x] 11.1 設定ページの基本構造を実装


  - settings.htmlファイルの作成
  - GitHub統合設定セクションの実装
  - 自動同期設定セクションの実装
  - _Requirements: 2.1, 4.1_

- [x] 11.2 Personal Access Token管理UIを実装


  - トークン入力フィールドとセキュリティ表示を実装
  - 接続テストボタンと結果表示を実装
  - トークン削除機能を実装
  - _Requirements: 2.2, 2.3, 2.4, 2.5_

- [x] 11.3 自動同期設定UIを実装


  - 自動同期の有効/無効切り替えを実装
  - 同期間隔選択機能を実装
  - 現在の同期状態表示を実装
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 11.4 API使用状況とレート制限表示を実装



  - 現在のAPI使用状況表示を実装
  - レート制限リセット時刻表示を実装
  - 使用量の可視化を実装
  - _Requirements: 5.4_

- [ ]* 11.5 設定ページUIのプロパティテストを実装
  - **Property 17: API使用状況の表示**
  - **Validates: Requirements 5.4**

- [x] 12. 同期履歴UIの実装





- [x] 12.1 同期履歴表示を実装


  - 履歴テーブルの表示機能を実装
  - 実行時刻、対象プロジェクト、結果、取得件数の表示を実装
  - エラー詳細の表示機能を実装
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 12.2 履歴詳細と管理機能を実装


  - 履歴詳細の表示機能を実装
  - 履歴クリア機能を実装
  - 確認ダイアログの実装
  - _Requirements: 7.4, 7.6_

- [ ]* 12.3 同期履歴UIのプロパティテストを実装
  - **Property 24: 履歴詳細の表示**
  - **Validates: Requirements 7.4**

- [x] 13. プロジェクト詳細ページの拡張




- [x] 13.1 GitHubリポジトリ関連付けUIを実装


  - プロジェクト編集フォームにリポジトリURL入力フィールドを追加
  - リポジトリ情報の表示機能を実装
  - 関連付け解除機能を実装
  - _Requirements: 1.1, 1.4, 1.5_


- [x] 13.2 CI結果タブの拡張を実装

  - 手動同期ボタンの追加
  - 同期ステータスインジケーターの実装
  - GitHub/手動の結果区別表示を実装
  - ワークフロー名の表示を実装
  - _Requirements: 3.1, 8.2_

- [x] 13.3 ワークフローフィルタリング機能を実装


  - ワークフロー名でのフィルタリング機能を実装
  - 対象ワークフローの選択機能を実装
  - _Requirements: 8.3, 8.5_

- [ ]* 13.4 プロジェクト詳細ページ拡張のプロパティテストを実装
  - **Property 1: GitHubリポジトリURL検証**
  - **Property 3: リポジトリ関連付け時の同期ボタン表示**
  - **Property 28: ワークフローフィルタリング**
  - **Validates: Requirements 1.2, 3.1, 8.3**

- [x] 14. 手動同期機能の実装




- [x] 14.1 手動同期の実行機能を実装


  - 同期ボタンクリック時の処理を実装
  - 同期進行状況の表示を実装
  - 同期完了時の結果表示を実装
  - _Requirements: 3.2, 3.7_

- [x] 14.2 同期エラーハンドリングを実装


  - 同期エラー時の表示機能を実装
  - 部分的成功時の処理を実装
  - 再試行機能を実装
  - _Requirements: 3.6_

- [x] 15. 将来拡張のためのプラグイン基盤実装




- [x] 15.1 CI/CDサービス抽象化を実装


  - CI/CDサービスの基底インターフェースを実装
  - GitHub統合をプラグインとして実装
  - サービス選択UIの基盤を実装
  - _Requirements: 9.2, 9.3_

- [x] 15.2 独立した設定管理を実装


  - 各サービス固有の認証設定管理を実装
  - 複数サービス結果の統合表示機能を実装
  - _Requirements: 9.4, 9.5_

- [ ]* 15.3 プラグイン基盤のプロパティテストを実装
  - **Property 30: 新サービス統合時の既存機能保護**
  - **Property 31: 独立した認証設定管理**
  - **Property 32: 複数サービス結果の統合表示**
  - **Validates: Requirements 9.2, 9.4, 9.5**

- [x] 16. 統合テストとエラーハンドリングの実装





- [x] 16.1 GitHubErrorHandlerクラスを実装

  - API エラーハンドリング機能を実装
  - レート制限警告表示機能を実装
  - 接続エラー表示機能を実装
  - _Requirements: 2.4, 5.3_

- [x] 16.2 UIコントローラーとイベントハンドリングを実装


  - 設定ページのイベントハンドラーを実装
  - プロジェクト詳細ページの拡張イベントハンドラーを実装
  - 自動同期の開始・停止イベントハンドラーを実装
  - _Requirements: 2.1, 3.1, 4.1_

- [x] 17. 最終チェックポイント - すべてのテストが通ることを確認





  - すべてのテストを実行し、通過することを確認
  - ユーザーに質問がある場合は確認