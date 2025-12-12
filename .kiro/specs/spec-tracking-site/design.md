# Design Document

## Overview

本システムは、仕様駆動開発の実践記録を管理する静的Webアプリケーションです。ブラウザのlocalStorageをデータストアとして使用し、完全にクライアントサイドで動作します。初回アクセス時に静的JSONファイルからサンプルデータを読み込み、以降はlocalStorageに保存されたデータを使用します。データのエクスポート機能により、バックアップが可能です。

## Architecture

### システム構成

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (Client)                      │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │              UI Layer (HTML/CSS/JS)                │ │
│  │  - Project List Page                               │ │
│  │  - Project Detail Page (Tabs: CI/Review/Effects)   │ │
│  │  - Forms (Add/Edit Project, CI, Review, Effects)   │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │           Application Logic Layer                  │ │
│  │  - Data Manager                                    │ │
│  │  - Validation Engine                               │ │
│  │  - Classification System Enforcer                  │ │
│  │  - Aggregation Calculator                          │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │            Data Storage Layer                      │ │
│  │  - LocalStorage Manager                            │ │
│  │  - Sample Data Loader                              │ │
│  └────────────────┬───────────────────────────────────┘ │
│                   │                                      │
│  ┌────────────────▼───────────────────────────────────┐ │
│  │              LocalStorage                          │ │
│  │  - projects: Array<Project>                        │ │
│  │  - reviewFindings: Array<ReviewFinding>            │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              Static Files (GitHub Pages)                 │
│  - index.html                                           │
│  - project-detail.html                                  │
│  - styles.css                                           │
│  - app.js                                               │
│  - data/projects.json (sample data)                     │
│  - data/review_log.json (sample data)                   │
└─────────────────────────────────────────────────────────┘
```

### ページ構成

1. **プロジェクト一覧ページ (index.html)**
   - プロジェクト一覧テーブル
   - プロジェクト追加ボタン
   - データエクスポートボタン

2. **プロジェクト詳細ページ (project-detail.html)**
   - プロジェクト情報表示・編集
   - タブ切り替え（CI結果、レビュー指摘、効果メトリクス）
   - 各タブ内での追加・編集・削除機能

## Components and Interfaces

### 1. Data Manager

プロジェクトとレビュー指摘のCRUD操作を管理するコアコンポーネント。

```typescript
interface DataManager {
  // Project operations
  getAllProjects(): Project[];
  getProjectById(id: string): Project | null;
  createProject(project: Omit<Project, 'id'>): Project;
  updateProject(id: string, updates: Partial<Project>): boolean;
  deleteProject(id: string): boolean;
  
  // Review Finding operations
  getReviewFindingsByProjectId(projectId: string): ReviewFinding[];
  createReviewFinding(finding: Omit<ReviewFinding, 'id' | 'timestamp'>): ReviewFinding;
  updateReviewFinding(id: string, updates: Partial<ReviewFinding>): boolean;
  deleteReviewFinding(id: string): boolean;
  
  // CI Result operations
  getCIResultsByProjectId(projectId: string): CIResult[];
  createCIResult(projectId: string, result: Omit<CIResult, 'timestamp'>): CIResult;
  deleteCIResult(projectId: string, timestamp: string): boolean;
  
  // Effect Metrics operations
  updateEffectMetrics(projectId: string, metrics: EffectMetrics): boolean;
  
  // Aggregation
  getReviewFindingCountByProjectId(projectId: string): number;
  getLatestCIStatusByProjectId(projectId: string): 'pass' | 'fail' | null;
}
```

### 2. LocalStorage Manager

localStorageへの読み書きを抽象化するコンポーネント。

```typescript
interface LocalStorageManager {
  // Core operations
  getProjects(): Project[];
  setProjects(projects: Project[]): void;
  getReviewFindings(): ReviewFinding[];
  setReviewFindings(findings: ReviewFinding[]): void;
  
  // Initialization
  initialize(): void;
  isInitialized(): boolean;
  
  // Export
  exportData(): { projects: Project[]; reviewFindings: ReviewFinding[] };
  
  // Clear
  clearAll(): void;
}
```

### 3. Validation Engine

入力データの検証を行うコンポーネント。

```typescript
interface ValidationEngine {
  validateProject(project: Partial<Project>): ValidationResult;
  validateCIResult(result: Partial<CIResult>): ValidationResult;
  validateReviewFinding(finding: Partial<ReviewFinding>): ValidationResult;
  validateEffectMetrics(metrics: Partial<EffectMetrics>): ValidationResult;
  validateClassificationValue(field: string, value: string): boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: { field: string; message: string }[];
}
```

### 4. Classification System Enforcer

分類体系の値を強制するコンポーネント。

```typescript
interface ClassificationSystemEnforcer {
  getProcessValues(): string[];
  getDocTypeValues(): string[];
  getCategoryValues(): string[];
  getRootCauseValues(): string[];
  getSeverityValues(): string[];
  getStatusValues(): string[];
  isValidProcess(value: string): boolean;
  isValidDocType(value: string): boolean;
  isValidCategory(value: string): boolean;
  isValidRootCause(value: string): boolean;
  isValidSeverity(value: string): boolean;
  isValidStatus(value: string): boolean;
}
```

### 5. Sample Data Loader

初回アクセス時に静的JSONファイルからサンプルデータを読み込むコンポーネント。

```typescript
interface SampleDataLoader {
  loadSampleProjects(): Promise<Project[]>;
  loadSampleReviewFindings(): Promise<ReviewFinding[]>;
  initializeWithSampleData(): Promise<void>;
}
```

### 6. UI Controller

UIイベントとアプリケーションロジックを接続するコンポーネント。

```typescript
interface UIController {
  // Page initialization
  initializeProjectListPage(): void;
  initializeProjectDetailPage(projectId: string): void;
  
  // Project operations
  handleCreateProject(formData: FormData): void;
  handleUpdateProject(projectId: string, formData: FormData): void;
  handleDeleteProject(projectId: string): void;
  
  // CI Result operations
  handleCreateCIResult(projectId: string, formData: FormData): void;
  handleDeleteCIResult(projectId: string, timestamp: string): void;
  
  // Review Finding operations
  handleCreateReviewFinding(projectId: string, formData: FormData): void;
  handleUpdateReviewFinding(findingId: string, formData: FormData): void;
  handleDeleteReviewFinding(findingId: string): void;
  
  // Effect Metrics operations
  handleUpdateEffectMetrics(projectId: string, formData: FormData): void;
  
  // Export
  handleExportData(): void;
  
  // Filtering and Sorting
  handleFilterReviewFindings(filters: FilterCriteria): void;
  handleSortReviewFindings(column: string, direction: 'asc' | 'desc'): void;
}
```

## Data Models

### Project

```typescript
interface Project {
  id: string;                    // UUID
  name: string;                  // プロジェクト名
  framework: string;                   // フレームワーク種別（任意の文字列）
  date: string;                  // ISO 8601 date (YYYY-MM-DD)
  assignee?: string;             // 担当者（オプション）
  ciResults: CIResult[];         // CI結果の配列
  effectMetrics?: EffectMetrics; // 効果メトリクス（オプション）
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

### CIResult

```typescript
interface CIResult {
  timestamp: string;             // ISO 8601 timestamp
  status: 'pass' | 'fail';       // 合否ステータス
  lintResult?: {
    passed: boolean;
    errorCount?: number;
    warningCount?: number;
  };
  contractTestResult?: {
    passed: boolean;
    totalTests?: number;
    passedTests?: number;
  };
  coverage?: {
    percentage: number;          // 0-100
    lines?: number;
    coveredLines?: number;
  };
  sbomStatus?: 'generated' | 'not_generated' | 'error';
  logUrl?: string;               // 外部CIログへのURL
}
```

### ReviewFinding

```typescript
interface ReviewFinding {
  id: string;                    // UUID
  projectId: string;             // 関連プロジェクトID
  timestamp: string;             // ISO 8601 timestamp
  
  // Classification fields (required)
  process: 'planning' | 'design' | 'implementation' | 'testing' | 'documentation';
  docType: 'spec' | 'plan' | 'design_doc' | 'tasks' | 'api_contract' | 
           'test_case' | 'user_docs' | 'source_code' | 'build_script' | 
           'infra_config' | 'ci_pipeline' | 'test_code';
  category: 'requirements_gap' | 'spec_inconsistency' | 'design_flaw' | 
            'implementation_bug' | 'security_issue' | 'performance_issue' | 
            'style_violation' | 'test_deficiency' | 'test_error' | 
            'doc_deficiency' | 'doc_error';
  rootCause: 'spec_omission' | 'design_decision_error' | 'implementation_bug' | 
             'test_deficiency' | 'doc_deficiency';
  severity: 'high' | 'medium' | 'low';
  status: 'Open' | 'InProgress' | 'Resolved' | 'Verified' | 'Deferred' | 'Rejected';
  
  // Content
  description: string;           // 指摘内容
  
  // Document reference
  docRef: {
    path: string;                // ファイルパス
    lines?: string;              // 行番号（例: "10-15" or "42"）
    sectionId?: string;          // セクションID
  };
  
  // Optional fields
  reviewer?: string;             // レビュアー名
  assignee?: string;             // 担当者名
}
```

### EffectMetrics

```typescript
interface EffectMetrics {
  // 効率性指標 (Efficiency)
  efficiency?: {
    taskCompletionRate?: number;      // タスク完了率 (0-100)
    avgTaskDurationHours?: number;    // 平均タスク所要時間（時間）
  };
  
  // 品質指標 (Quality)
  quality?: {
    preImplFindingsCount?: number;    // 実装前レビュー指摘数
    postImplFindingsCount?: number;   // 実装後レビュー指摘数
    highSeverityCount?: number;       // 重大度Highの指摘数
    ciSuccessRate?: number;           // CI成功率 (0-100)
  };
  
  // 人間の手間指標 (Human Effort)
  humanEffort?: {
    manualFixCount?: number;          // 手動修正回数
    reviewEffortHours?: number;       // レビュー工数（時間）
  };
  
  // 引継ぎ正確性指標 (Handoff Accuracy)
  handoffAccuracy?: {
    requirementsChangeCount?: number; // 要件変更回数
    designChangeCount?: number;       // 設計変更回数
    specAmbiguityCount?: number;      // 実装時の仕様不明点数
  };
  
  // その他
  comments?: string;                  // コメント
}
```

### FilterCriteria

```typescript
interface FilterCriteria {
  process?: string[];
  docType?: string[];
  category?: string[];
  severity?: string[];
  status?: string[];
}
```

## Error Handling

### エラーの種類

1. **Validation Errors**: 入力データの検証エラー
   - 必須フィールドの欠落
   - 無効な分類値
   - 数値範囲の違反

2. **Storage Errors**: localStorageへのアクセスエラー
   - ストレージ容量超過
   - ブラウザのプライベートモード

3. **Import Errors**: 静的JSONファイルの読み込みエラー
   - ネットワークエラー
   - 無効なJSONフォーマット
   - ファイルが見つからない



### エラー処理戦略

```typescript
interface ErrorHandler {
  handleValidationError(error: ValidationResult): void;
  handleStorageError(error: Error): void;
  handleImportError(error: Error): void;
  showErrorMessage(message: string): void;
  showSuccessMessage(message: string): void;
}
```

- すべてのエラーはユーザーフレンドリーなメッセージとして表示
- 重大なエラー（ストレージ容量超過等）は明確な対処方法を提示
- バリデーションエラーはフィールド単位でインラインに表示

## Testing Strategy

### Unit Tests

以下のコンポーネントに対してユニットテストを実装：

1. **Data Manager**
   - CRUD操作の正確性
   - 集計計算の正確性
   - エッジケース（存在しないID、空配列等）

2. **Validation Engine**
   - 各フィールドの検証ロジック
   - 分類値の検証
   - エラーメッセージの生成

3. **Classification System Enforcer**
   - 分類値リストの完全性
   - 検証メソッドの正確性

4. **LocalStorage Manager**
   - データの読み書き
   - JSON変換の正確性
   - 初期化ロジック

### Integration Tests

1. **データフロー全体**
   - プロジェクト作成からlocalStorage保存まで
   - データエクスポート機能
   - フィルタリング・ソート機能

2. **UI操作**
   - フォーム送信
   - タブ切り替え
   - モーダル表示・非表示

### Manual Testing

1. **ブラウザ互換性**
   - Chrome、Firefox、Safari、Edgeでの動作確認
   - localStorageの動作確認

2. **GitHub Pages**
   - サブディレクトリパスでの動作確認
   - キャッシュ動作の確認

3. **データ永続性**
   - ページリロード後のデータ保持
   - エクスポート機能の確認

## Implementation Notes

### LocalStorage Key Structure

```
spec-tracking-site:projects        -> JSON string of Project[]
spec-tracking-site:reviewFindings  -> JSON string of ReviewFinding[]
spec-tracking-site:initialized     -> "true" | "false"
```

### ID Generation

UUIDv4を使用してプロジェクトIDとレビュー指摘IDを生成。ブラウザの`crypto.randomUUID()`を使用（フォールバックとして簡易実装を提供）。

### Timestamp Format

すべてのタイムスタンプはISO 8601形式（`YYYY-MM-DDTHH:mm:ss.sssZ`）を使用。JavaScriptの`new Date().toISOString()`で生成。

### Sample Data Loading

初回アクセス時（localStorageが空の場合）、以下のファイルからサンプルデータを読み込み：
- `data/projects.json`
- `data/review_log.json`

読み込みに失敗した場合は空の状態で開始。

### Export Format

エクスポートされるJSONファイルの構造：

```json
{
  "version": "1.0",
  "exportedAt": "2025-01-01T00:00:00.000Z",
  "projects": [...],
  "reviewFindings": [...]
}
```

### GitHub Pages Deployment

- ルートディレクトリまたは`/docs`ディレクトリから配信可能
- 相対パスを使用してサブディレクトリ配置に対応
- `index.html`をエントリーポイントとして設定

### Browser Compatibility

- 最小要件: ES6サポート、localStorage、Fetch API
- 対象ブラウザ: Chrome 60+、Firefox 60+、Safari 12+、Edge 79+

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: プロジェクト一覧表示の完全性
*For any* プロジェクトリスト、一覧ページに表示される各プロジェクトは、プロジェクト名、フレームワーク種別、日付、最新のCIステータス、レビュー指摘数、タスク完了率のすべてのフィールドを含まなければならない
**Validates: Requirements 1.2**

### Property 2: LocalStorageからのデータ読み込み
*For any* localStorageに保存されたプロジェクトデータ、システムは正しくデータを読み込み、一覧ページに表示しなければならない
**Validates: Requirements 1.4**

### Property 3: レビュー指摘数の集計正確性
*For any* プロジェクトとそれに関連するレビュー指摘のセット、システムが計算するレビュー指摘数は、実際のレビュー指摘の数と一致しなければならない
**Validates: Requirements 1.5**

### Property 4: CI結果の必須フィールド検証
*For any* CI結果の入力、合否ステータスが欠落している場合、システムはバリデーションエラーを返さなければならない
**Validates: Requirements 2.3**

### Property 5: CI結果のタイムスタンプ自動付与
*For any* 有効なCI結果、システムは自動的にISO 8601形式のタイムスタンプを付与し、localStorageに保存しなければならない
**Validates: Requirements 2.4**

### Property 6: CI結果の削除
*For any* プロジェクトとCI結果のタイムスタンプ、削除操作後にlocalStorageから該当のCI結果が存在しなくなることを確認しなければならない
**Validates: Requirements 2.7**

### Property 7: レビュー指摘の必須フィールド検証
*For any* レビュー指摘の入力、process、doc_type、category、root_cause、severity、status、description、document referenceのいずれかが欠落している場合、システムはバリデーションエラーを返さなければならない
**Validates: Requirements 3.3**

### Property 8: レビュー指摘のID・タイムスタンプ自動付与
*For any* 有効なレビュー指摘、システムは一意のIDとISO 8601形式のタイムスタンプを自動的に付与し、localStorageに保存しなければならない
**Validates: Requirements 3.4**

### Property 9: レビュー指摘のドキュメント参照
*For any* 保存されたレビュー指摘、プロジェクトID、path、line numbers（オプション）、section_id（オプション）を含むドキュメント参照が含まれなければならない
**Validates: Requirements 3.5**

### Property 10: 分類値の強制
*For any* レビュー指摘の入力、事前定義された分類語彙に含まれない値が指定された場合、システムはバリデーションエラーを返さなければならない
**Validates: Requirements 3.6, 5.8**

### Property 11: レビュー指摘の削除
*For any* レビュー指摘ID、削除操作後にlocalStorageから該当の指摘が存在しなくなることを確認しなければならない
**Validates: Requirements 3.7**

### Property 12: 効果メトリクスの数値検証
*For any* 効果メトリクスの入力、パーセンテージフィールド（タスク完了率、CI成功率）が0-100の範囲外、または数値フィールドが負の値の場合、システムはバリデーションエラーを返さなければならない
**Validates: Requirements 4.7**

### Property 13: 効果メトリクスの更新
*For any* 有効な効果メトリクス、更新操作後にlocalStorageの該当プロジェクトの効果データが新しい値に更新されなければならない
**Validates: Requirements 4.8**

### Property 14: 数値フォーマット
*For any* パーセンテージまたは数値メトリクス、システムは適切なフォーマット（例：パーセンテージには"%"記号、数値には桁区切り）を適用して表示しなければならない
**Validates: Requirements 2.6, 4.9**

### Property 15: 分類体系の完全性
*For any* 分類フィールド（process、doc_type、category、root_cause、severity、status）、システムは要件5で定義されたすべての値を含むリストを提供しなければならない
**Validates: Requirements 5.1-5.7**

### Property 16: 静的JSONファイルからの初回読み込み
*For any* 空のlocalStorage、システムは初回アクセス時にprojects.jsonとreview_log.jsonからサンプルデータを読み込み、localStorageに保存しなければならない
**Validates: Requirements 6.2, 7.7**

### Property 17: プロジェクトIDの一意性
*For any* 新規プロジェクト、システムは既存のプロジェクトIDと重複しない一意のIDを割り当てなければならない
**Validates: Requirements 7.3**

### Property 18: プロジェクトの更新
*For any* プロジェクトIDと更新データ、更新操作後にlocalStorageの該当プロジェクトが新しい値に更新されなければならない
**Validates: Requirements 7.4**

### Property 19: カスケード削除
*For any* プロジェクトID、削除操作後にlocalStorageから該当プロジェクト、関連するレビュー指摘、CI結果のすべてが存在しなくなることを確認しなければならない
**Validates: Requirements 7.5**

### Property 20: データエクスポート
*For any* localStorageに保存されたデータ、エクスポート操作によりJSON形式でダウンロードできなければならない
**Validates: Requirements 7.6**

### Property 21: 静的サイト制約の遵守
*For any* デプロイメント環境、システムはサーバーサイド処理なしでHTML、CSS、JavaScriptファイルのみで動作しなければならない
**Validates: Requirements 6.1**

### Property 22: プロジェクトの必須フィールド検証
*For any* プロジェクトの入力、プロジェクト名、フレームワーク種別、日付のいずれかが欠落している場合、システムはバリデーションエラーを返さなければならない
**Validates: Requirements 8.2**

### Property 23: プロジェクトの作成
*For any* 有効なプロジェクト、作成操作後にlocalStorageに該当プロジェクトが存在し、一意のIDが割り当てられなければならない
**Validates: Requirements 8.3**

### Property 24: プロジェクトの削除
*For any* プロジェクトID、削除操作後にlocalStorageから該当プロジェクトが存在しなくなることを確認しなければならない
**Validates: Requirements 8.5**

### Property 25: フレームワーク種別の自由入力
*For any* プロジェクトの入力、フレームワーク種別として任意の文字列を受け入れなければならない
**Validates: Requirements 8.6**

### Property 26: レビュー指摘のフィルタリング
*For any* レビュー指摘のセットとフィルタ条件、フィルタ適用後に表示される指摘はすべてフィルタ条件に一致しなければならない
**Validates: Requirements 9.2**

### Property 27: レビュー指摘のソート
*For any* レビュー指摘のセットとソート列、ソート適用後に表示される指摘は指定された列で昇順または降順に並んでいなければならない
**Validates: Requirements 9.3**

### Property 28: フィルタ・ソート状態の維持
*For any* フィルタ・ソート状態、タブ内での操作（追加、編集、削除）後も同じフィルタ・ソート状態が維持されなければならない
**Validates: Requirements 9.4**

### Property 29: フィルタクリア
*For any* フィルタが適用された状態、フィルタクリア操作後に現在のプロジェクトのすべてのレビュー指摘が表示されなければならない
**Validates: Requirements 9.5**
