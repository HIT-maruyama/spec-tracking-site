# GitHubSettingsManager 使用ガイド

## 概要

`GitHubSettingsManager`は、GitHub統合機能の設定とPersonal Access Token、同期履歴を管理するクラスです。

## 主な機能

### 1. GitHub設定管理

#### デフォルト設定の取得
```javascript
const manager = new GitHubSettingsManager();
const settings = manager.getSettings();
// {
//   autoSyncEnabled: false,
//   autoSyncInterval: 15,
//   maxRetries: 3,
//   retryDelay: 2
// }
```

#### 設定の更新
```javascript
const success = manager.updateSettings({
    autoSyncEnabled: true,
    autoSyncInterval: 30
});
```

#### 設定のリセット
```javascript
const success = manager.resetSettings();
```

### 2. Personal Access Token管理

#### トークンの設定（暗号化して保存）
```javascript
const token = 'ghp_your_personal_access_token';
const success = await manager.setAccessToken(token);
```

#### 暗号化されたトークンの取得
```javascript
const encryptedToken = manager.getAccessToken();
```

#### トークンの復号化
```javascript
const decryptedToken = await manager.getDecryptedAccessToken();
```

#### トークンの削除
```javascript
const success = manager.clearAccessToken();
```

### 3. 自動同期設定

#### 自動同期の有効化/無効化
```javascript
const success = manager.setAutoSyncEnabled(true);
```

#### 同期間隔の設定（分単位）
```javascript
const success = manager.setAutoSyncInterval(60); // 60分
```

### 4. 同期履歴管理

#### 同期記録の追加
```javascript
const record = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    projectId: 'project-123',
    projectName: 'マイプロジェクト',
    status: 'success', // 'success' | 'failure' | 'partial'
    newCIResults: 5,
    updatedCIResults: 0,
    errors: [],
    repositoryUrl: 'https://github.com/owner/repo',
    workflowRunsProcessed: 5,
    apiRequestsUsed: 10,
    durationMs: 1500
};

const success = manager.addSyncRecord(record);
```

#### 同期履歴の取得（新しい順）
```javascript
const history = manager.getSyncHistory();
```

#### プロジェクト別の履歴取得
```javascript
const projectHistory = manager.getSyncHistoryByProject('project-123');
```

#### 最新の同期記録取得
```javascript
const latest = manager.getLatestSyncRecord();
// または特定のプロジェクトの最新記録
const latestForProject = manager.getLatestSyncRecord('project-123');
```

#### 失敗した同期記録の取得
```javascript
const failedRecords = manager.getFailedSyncRecords();
```

#### 同期履歴のクリア
```javascript
const success = manager.clearSyncHistory();
```

### 5. レート制限情報管理

#### レート制限情報の更新
```javascript
const remaining = 4500;
const resetAt = new Date(Date.now() + 3600000).toISOString(); // 1時間後
const success = manager.updateRateLimitInfo(remaining, resetAt);
```

#### 最終同期日時の更新
```javascript
const success = manager.updateLastSyncAt();
// または特定の日時を指定
const success = manager.updateLastSyncAt('2024-01-01T12:00:00Z');
```

### 6. すべてのデータのクリア

#### 設定と履歴をすべてクリア
```javascript
const success = manager.clearAll();
```

## データ構造

### GitHubSettings
```typescript
{
    accessToken?: string;           // Personal Access Token（暗号化済み）
    autoSyncEnabled: boolean;       // 自動同期有効フラグ
    autoSyncInterval: number;       // 自動同期間隔（分単位）
    lastSyncAt?: string;            // 最終同期日時（ISO 8601）
    rateLimitRemaining?: number;    // 残りレート制限数
    rateLimitResetAt?: string;      // レート制限リセット日時（ISO 8601）
    maxRetries: number;             // 最大再試行回数
    retryDelay: number;             // 再試行遅延時間（秒単位）
}
```

### SyncRecord
```typescript
{
    id: string;                     // UUID
    timestamp: string;              // 同期実行日時（ISO 8601）
    projectId: string;              // 対象プロジェクトID
    projectName: string;            // プロジェクト名
    status: 'success' | 'failure' | 'partial'; // 同期ステータス
    newCIResults: number;           // 新規CI結果数
    updatedCIResults: number;       // 更新CI結果数
    errors: string[];               // エラーメッセージ配列
    repositoryUrl: string;          // リポジトリURL
    workflowRunsProcessed: number;  // 処理したワークフロー実行数
    apiRequestsUsed: number;        // 使用したAPIリクエスト数
    durationMs: number;             // 処理時間（ミリ秒）
}
```

## LocalStorageキー

- `spec-tracking-site:githubSettings` - GitHub設定
- `spec-tracking-site:syncHistory` - 同期履歴

## 制限事項

- 同期履歴は最大100件まで保持されます
- 100件を超えると古い記録から自動的に削除されます
- Personal Access Tokenは暗号化されてlocalStorageに保存されます

## テスト

テストページ `test-github-settings-manager.html` を開いて、各機能をテストできます。

```bash
# ローカルサーバーを起動
python -m http.server 8000

# ブラウザで開く
# http://localhost:8000/test-github-settings-manager.html
```

## 依存関係

- `app.js` - バリデーション関数、ヘルパー関数
- `token-encryption.js` - トークン暗号化機能

## 使用例

### 完全な同期フロー
```javascript
const manager = new GitHubSettingsManager();

// 1. トークンを設定
await manager.setAccessToken('ghp_your_token');

// 2. 自動同期を有効化
manager.setAutoSyncEnabled(true);
manager.setAutoSyncInterval(30);

// 3. 同期を実行（別のコンポーネントで）
// ... 同期処理 ...

// 4. 同期結果を記録
const record = {
    id: generateUUID(),
    timestamp: new Date().toISOString(),
    projectId: 'project-123',
    projectName: 'マイプロジェクト',
    status: 'success',
    newCIResults: 5,
    updatedCIResults: 0,
    errors: [],
    repositoryUrl: 'https://github.com/owner/repo',
    workflowRunsProcessed: 5,
    apiRequestsUsed: 10,
    durationMs: 1500
};
manager.addSyncRecord(record);

// 5. 履歴を確認
const history = manager.getSyncHistory();
console.log(`同期履歴: ${history.length}件`);
```

## エラーハンドリング

すべてのメソッドは成功/失敗を示すbooleanまたはPromise<boolean>を返します。エラーが発生した場合は、コンソールにエラーメッセージが出力され、`ErrorHandler`によって処理されます。

```javascript
const success = manager.updateSettings({ autoSyncEnabled: true });
if (!success) {
    console.error('設定の更新に失敗しました');
}
```

## セキュリティ

- Personal Access Tokenは`TokenEncryption`クラスを使用してAES-GCM暗号化されます
- 暗号化キーはブラウザフィンガープリントから生成されます
- トークンは平文でlocalStorageに保存されることはありません
