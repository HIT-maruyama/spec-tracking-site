// 仕様駆動開発管理サイト - メインアプリケーション

// ========================================
// データモデル定義 (TypeScript風の型定義をJSDocで表現)
// ========================================

/**
 * プロジェクトデータモデル
 * @typedef {Object} Project
 * @property {string} id - UUID
 * @property {string} name - プロジェクト名
 * @property {string} framework - フレームワーク種別（任意の文字列）
 * @property {string} date - ISO 8601 date (YYYY-MM-DD)
 * @property {string} [assignee] - 担当者（オプション）
 * @property {CIResult[]} ciResults - CI結果の配列
 * @property {EffectMetrics} [effectMetrics] - 効果メトリクス（オプション）
 * @property {string} createdAt - ISO 8601 timestamp
 * @property {string} updatedAt - ISO 8601 timestamp
 */

/**
 * CI結果データモデル
 * @typedef {Object} CIResult
 * @property {string} timestamp - ISO 8601 timestamp
 * @property {'pass'|'fail'} status - 合否ステータス
 * @property {Object} [lintResult] - lint結果（オプション）
 * @property {boolean} lintResult.passed - lint通過フラグ
 * @property {number} [lintResult.errorCount] - エラー数
 * @property {number} [lintResult.warningCount] - 警告数
 * @property {Object} [contractTestResult] - 契約テスト結果（オプション）
 * @property {boolean} contractTestResult.passed - 契約テスト通過フラグ
 * @property {number} [contractTestResult.totalTests] - 総テスト数
 * @property {number} [contractTestResult.passedTests] - 通過テスト数
 * @property {Object} [coverage] - カバレッジ情報（オプション）
 * @property {number} coverage.percentage - カバレッジ率 (0-100)
 * @property {number} [coverage.lines] - 総行数
 * @property {number} [coverage.coveredLines] - カバー済み行数
 * @property {'generated'|'not_generated'|'error'} [sbomStatus] - SBOMステータス
 * @property {string} [logUrl] - 外部CIログへのURL
 */

/**
 * レビュー指摘データモデル
 * @typedef {Object} ReviewFinding
 * @property {string} id - UUID
 * @property {string} projectId - 関連プロジェクトID
 * @property {string} timestamp - ISO 8601 timestamp
 * @property {'planning'|'design'|'implementation'|'testing'|'documentation'} process - プロセス
 * @property {'spec'|'plan'|'design_doc'|'tasks'|'api_contract'|'test_case'|'user_docs'|'source_code'|'build_script'|'infra_config'|'ci_pipeline'|'test_code'} docType - ドキュメントタイプ
 * @property {'requirements_gap'|'spec_inconsistency'|'design_flaw'|'implementation_bug'|'security_issue'|'performance_issue'|'style_violation'|'test_deficiency'|'test_error'|'doc_deficiency'|'doc_error'} category - カテゴリ
 * @property {'spec_omission'|'design_decision_error'|'implementation_bug'|'test_deficiency'|'doc_deficiency'} rootCause - 根本原因
 * @property {'high'|'medium'|'low'} severity - 重要度
 * @property {'Open'|'InProgress'|'Resolved'|'Verified'|'Deferred'|'Rejected'} status - ステータス
 * @property {string} description - 指摘内容
 * @property {Object} docRef - ドキュメント参照
 * @property {string} docRef.path - ファイルパス
 * @property {string} [docRef.lines] - 行番号（例: "10-15" or "42"）
 * @property {string} [docRef.sectionId] - セクションID
 * @property {string} [reviewer] - レビュアー名
 * @property {string} [assignee] - 担当者名
 */

/**
 * 効果メトリクスデータモデル
 * @typedef {Object} EffectMetrics
 * @property {Object} [efficiency] - 効率性指標
 * @property {number} [efficiency.taskCompletionRate] - タスク完了率 (0-100)
 * @property {number} [efficiency.avgTaskDurationHours] - 平均タスク所要時間（時間）
 * @property {Object} [quality] - 品質指標
 * @property {number} [quality.preImplFindingsCount] - 実装前レビュー指摘数
 * @property {number} [quality.postImplFindingsCount] - 実装後レビュー指摘数
 * @property {number} [quality.highSeverityCount] - 重大度Highの指摘数
 * @property {number} [quality.ciSuccessRate] - CI成功率 (0-100)
 * @property {Object} [humanEffort] - 人間の手間指標
 * @property {number} [humanEffort.manualFixCount] - 手動修正回数
 * @property {number} [humanEffort.reviewEffortHours] - レビュー工数（時間）
 * @property {Object} [handoffAccuracy] - 引継ぎ正確性指標
 * @property {number} [handoffAccuracy.requirementsChangeCount] - 要件変更回数
 * @property {number} [handoffAccuracy.designChangeCount] - 設計変更回数
 * @property {number} [handoffAccuracy.specAmbiguityCount] - 実装時の仕様不明点数
 * @property {string} [comments] - コメント
 */

/**
 * フィルタ条件データモデル
 * @typedef {Object} FilterCriteria
 * @property {string[]} [process] - プロセスフィルタ
 * @property {string[]} [docType] - ドキュメントタイプフィルタ
 * @property {string[]} [category] - カテゴリフィルタ
 * @property {string[]} [severity] - 重要度フィルタ
 * @property {string[]} [status] - ステータスフィルタ
 */

/**
 * バリデーション結果データモデル
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - バリデーション結果
 * @property {ValidationError[]} errors - エラーリスト
 */

/**
 * バリデーションエラーデータモデル
 * @typedef {Object} ValidationError
 * @property {string} field - フィールド名
 * @property {string} message - エラーメッセージ
 */

// ========================================
// 分類システム定義
// ========================================

/**
 * 分類システムの定数定義
 */
const CLASSIFICATION_SYSTEM = {
    PROCESS: ['planning', 'design', 'implementation', 'testing', 'documentation'],
    DOC_TYPE: [
        'spec', 'plan', 'design_doc', 'tasks', 'api_contract', 'test_case', 'user_docs',
        'source_code', 'build_script', 'infra_config', 'ci_pipeline', 'test_code'
    ],
    CATEGORY: [
        'requirements_gap', 'spec_inconsistency', 'design_flaw', 'implementation_bug',
        'security_issue', 'performance_issue', 'style_violation', 'test_deficiency',
        'test_error', 'doc_deficiency', 'doc_error'
    ],
    ROOT_CAUSE: [
        'spec_omission', 'design_decision_error', 'implementation_bug',
        'test_deficiency', 'doc_deficiency'
    ],
    SEVERITY: ['high', 'medium', 'low'],
    STATUS: ['Open', 'InProgress', 'Resolved', 'Verified', 'Deferred', 'Rejected'],
    CI_STATUS: ['pass', 'fail'],
    SBOM_STATUS: ['generated', 'not_generated', 'error']
};

// ========================================
// バリデーション関数
// ========================================

/**
 * プロジェクトデータのバリデーション
 * @param {Partial<Project>} project - バリデーション対象のプロジェクトデータ
 * @returns {ValidationResult} バリデーション結果
 */
function validateProject(project) {
    const errors = [];

    // 必須フィールドの検証
    if (!project.name || typeof project.name !== 'string' || project.name.trim() === '') {
        errors.push({ field: 'name', message: 'プロジェクト名は必須です' });
    }

    if (!project.framework || typeof project.framework !== 'string' || project.framework.trim() === '') {
        errors.push({ field: 'framework', message: 'フレームワーク種別は必須です' });
    }

    if (!project.date || typeof project.date !== 'string') {
        errors.push({ field: 'date', message: '日付は必須です' });
    } else {
        // 日付形式の検証 (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(project.date)) {
            errors.push({ field: 'date', message: '日付はYYYY-MM-DD形式で入力してください' });
        } else {
            const date = new Date(project.date);
            if (isNaN(date.getTime())) {
                errors.push({ field: 'date', message: '有効な日付を入力してください' });
            }
        }
    }

    // オプションフィールドの検証
    if (project.assignee !== undefined && (typeof project.assignee !== 'string' || project.assignee.trim() === '')) {
        errors.push({ field: 'assignee', message: '担当者名は空文字列にできません' });
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * CI結果データのバリデーション
 * @param {Partial<CIResult>} ciResult - バリデーション対象のCI結果データ
 * @returns {ValidationResult} バリデーション結果
 */
function validateCIResult(ciResult) {
    const errors = [];

    // 必須フィールドの検証
    if (!ciResult.status || !CLASSIFICATION_SYSTEM.CI_STATUS.includes(ciResult.status)) {
        errors.push({ field: 'status', message: '合否ステータスは必須です（pass または fail）' });
    }

    // オプションフィールドの検証
    if (ciResult.lintResult) {
        if (typeof ciResult.lintResult.passed !== 'boolean') {
            errors.push({ field: 'lintResult.passed', message: 'lint結果の通過フラグはboolean値である必要があります' });
        }
        if (ciResult.lintResult.errorCount !== undefined && (!Number.isInteger(ciResult.lintResult.errorCount) || ciResult.lintResult.errorCount < 0)) {
            errors.push({ field: 'lintResult.errorCount', message: 'エラー数は0以上の整数である必要があります' });
        }
        if (ciResult.lintResult.warningCount !== undefined && (!Number.isInteger(ciResult.lintResult.warningCount) || ciResult.lintResult.warningCount < 0)) {
            errors.push({ field: 'lintResult.warningCount', message: '警告数は0以上の整数である必要があります' });
        }
    }

    if (ciResult.contractTestResult) {
        if (typeof ciResult.contractTestResult.passed !== 'boolean') {
            errors.push({ field: 'contractTestResult.passed', message: '契約テスト結果の通過フラグはboolean値である必要があります' });
        }
        if (ciResult.contractTestResult.totalTests !== undefined && (!Number.isInteger(ciResult.contractTestResult.totalTests) || ciResult.contractTestResult.totalTests < 0)) {
            errors.push({ field: 'contractTestResult.totalTests', message: '総テスト数は0以上の整数である必要があります' });
        }
        if (ciResult.contractTestResult.passedTests !== undefined && (!Number.isInteger(ciResult.contractTestResult.passedTests) || ciResult.contractTestResult.passedTests < 0)) {
            errors.push({ field: 'contractTestResult.passedTests', message: '通過テスト数は0以上の整数である必要があります' });
        }
    }

    if (ciResult.coverage) {
        if (typeof ciResult.coverage.percentage !== 'number' || ciResult.coverage.percentage < 0 || ciResult.coverage.percentage > 100) {
            errors.push({ field: 'coverage.percentage', message: 'カバレッジ率は0-100の数値である必要があります' });
        }
        if (ciResult.coverage.lines !== undefined && (!Number.isInteger(ciResult.coverage.lines) || ciResult.coverage.lines < 0)) {
            errors.push({ field: 'coverage.lines', message: '総行数は0以上の整数である必要があります' });
        }
        if (ciResult.coverage.coveredLines !== undefined && (!Number.isInteger(ciResult.coverage.coveredLines) || ciResult.coverage.coveredLines < 0)) {
            errors.push({ field: 'coverage.coveredLines', message: 'カバー済み行数は0以上の整数である必要があります' });
        }
    }

    if (ciResult.sbomStatus && !CLASSIFICATION_SYSTEM.SBOM_STATUS.includes(ciResult.sbomStatus)) {
        errors.push({ field: 'sbomStatus', message: 'SBOMステータスは generated、not_generated、error のいずれかである必要があります' });
    }

    if (ciResult.logUrl && (typeof ciResult.logUrl !== 'string' || ciResult.logUrl.trim() === '')) {
        errors.push({ field: 'logUrl', message: 'ログURLは空文字列にできません' });
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * レビュー指摘データのバリデーション
 * @param {Partial<ReviewFinding>} finding - バリデーション対象のレビュー指摘データ
 * @returns {ValidationResult} バリデーション結果
 */
function validateReviewFinding(finding) {
    const errors = [];

    // 必須フィールドの検証
    if (!finding.process || !CLASSIFICATION_SYSTEM.PROCESS.includes(finding.process)) {
        errors.push({ field: 'process', message: 'プロセスは必須です（planning、design、implementation、testing、documentation のいずれか）' });
    }

    if (!finding.docType || !CLASSIFICATION_SYSTEM.DOC_TYPE.includes(finding.docType)) {
        errors.push({ field: 'docType', message: 'ドキュメントタイプは必須です' });
    }

    if (!finding.category || !CLASSIFICATION_SYSTEM.CATEGORY.includes(finding.category)) {
        errors.push({ field: 'category', message: 'カテゴリは必須です' });
    }

    if (!finding.rootCause || !CLASSIFICATION_SYSTEM.ROOT_CAUSE.includes(finding.rootCause)) {
        errors.push({ field: 'rootCause', message: '根本原因は必須です' });
    }

    if (!finding.severity || !CLASSIFICATION_SYSTEM.SEVERITY.includes(finding.severity)) {
        errors.push({ field: 'severity', message: '重要度は必須です（high、medium、low のいずれか）' });
    }

    if (!finding.status || !CLASSIFICATION_SYSTEM.STATUS.includes(finding.status)) {
        errors.push({ field: 'status', message: 'ステータスは必須です' });
    }

    if (!finding.description || typeof finding.description !== 'string' || finding.description.trim() === '') {
        errors.push({ field: 'description', message: '指摘内容は必須です' });
    }

    // ドキュメント参照の検証
    if (!finding.docRef || typeof finding.docRef !== 'object') {
        errors.push({ field: 'docRef', message: 'ドキュメント参照は必須です' });
    } else {
        if (!finding.docRef.path || typeof finding.docRef.path !== 'string' || finding.docRef.path.trim() === '') {
            errors.push({ field: 'docRef.path', message: 'ファイルパスは必須です' });
        }
        if (finding.docRef.lines !== undefined && (typeof finding.docRef.lines !== 'string' || finding.docRef.lines.trim() === '')) {
            errors.push({ field: 'docRef.lines', message: '行番号は空文字列にできません' });
        }
        if (finding.docRef.sectionId !== undefined && (typeof finding.docRef.sectionId !== 'string' || finding.docRef.sectionId.trim() === '')) {
            errors.push({ field: 'docRef.sectionId', message: 'セクションIDは空文字列にできません' });
        }
    }

    // オプションフィールドの検証
    if (finding.reviewer !== undefined && (typeof finding.reviewer !== 'string' || finding.reviewer.trim() === '')) {
        errors.push({ field: 'reviewer', message: 'レビュアー名は空文字列にできません' });
    }

    if (finding.assignee !== undefined && (typeof finding.assignee !== 'string' || finding.assignee.trim() === '')) {
        errors.push({ field: 'assignee', message: '担当者名は空文字列にできません' });
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 効果メトリクスデータのバリデーション
 * @param {Partial<EffectMetrics>} metrics - バリデーション対象の効果メトリクスデータ
 * @returns {ValidationResult} バリデーション結果
 */
function validateEffectMetrics(metrics) {
    const errors = [];

    // 効率性指標の検証
    if (metrics.efficiency) {
        if (metrics.efficiency.taskCompletionRate !== undefined) {
            if (typeof metrics.efficiency.taskCompletionRate !== 'number' || 
                metrics.efficiency.taskCompletionRate < 0 || 
                metrics.efficiency.taskCompletionRate > 100) {
                errors.push({ field: 'efficiency.taskCompletionRate', message: 'タスク完了率は0-100の数値である必要があります' });
            }
        }
        if (metrics.efficiency.avgTaskDurationHours !== undefined) {
            if (typeof metrics.efficiency.avgTaskDurationHours !== 'number' || metrics.efficiency.avgTaskDurationHours < 0) {
                errors.push({ field: 'efficiency.avgTaskDurationHours', message: '平均タスク所要時間は0以上の数値である必要があります' });
            }
        }
    }

    // 品質指標の検証
    if (metrics.quality) {
        if (metrics.quality.preImplFindingsCount !== undefined) {
            if (!Number.isInteger(metrics.quality.preImplFindingsCount) || metrics.quality.preImplFindingsCount < 0) {
                errors.push({ field: 'quality.preImplFindingsCount', message: '実装前レビュー指摘数は0以上の整数である必要があります' });
            }
        }
        if (metrics.quality.postImplFindingsCount !== undefined) {
            if (!Number.isInteger(metrics.quality.postImplFindingsCount) || metrics.quality.postImplFindingsCount < 0) {
                errors.push({ field: 'quality.postImplFindingsCount', message: '実装後レビュー指摘数は0以上の整数である必要があります' });
            }
        }
        if (metrics.quality.highSeverityCount !== undefined) {
            if (!Number.isInteger(metrics.quality.highSeverityCount) || metrics.quality.highSeverityCount < 0) {
                errors.push({ field: 'quality.highSeverityCount', message: '重大度Highの指摘数は0以上の整数である必要があります' });
            }
        }
        if (metrics.quality.ciSuccessRate !== undefined) {
            if (typeof metrics.quality.ciSuccessRate !== 'number' || 
                metrics.quality.ciSuccessRate < 0 || 
                metrics.quality.ciSuccessRate > 100) {
                errors.push({ field: 'quality.ciSuccessRate', message: 'CI成功率は0-100の数値である必要があります' });
            }
        }
    }

    // 人間の手間指標の検証
    if (metrics.humanEffort) {
        if (metrics.humanEffort.manualFixCount !== undefined) {
            if (!Number.isInteger(metrics.humanEffort.manualFixCount) || metrics.humanEffort.manualFixCount < 0) {
                errors.push({ field: 'humanEffort.manualFixCount', message: '手動修正回数は0以上の整数である必要があります' });
            }
        }
        if (metrics.humanEffort.reviewEffortHours !== undefined) {
            if (typeof metrics.humanEffort.reviewEffortHours !== 'number' || metrics.humanEffort.reviewEffortHours < 0) {
                errors.push({ field: 'humanEffort.reviewEffortHours', message: 'レビュー工数は0以上の数値である必要があります' });
            }
        }
    }

    // 引継ぎ正確性指標の検証
    if (metrics.handoffAccuracy) {
        if (metrics.handoffAccuracy.requirementsChangeCount !== undefined) {
            if (!Number.isInteger(metrics.handoffAccuracy.requirementsChangeCount) || metrics.handoffAccuracy.requirementsChangeCount < 0) {
                errors.push({ field: 'handoffAccuracy.requirementsChangeCount', message: '要件変更回数は0以上の整数である必要があります' });
            }
        }
        if (metrics.handoffAccuracy.designChangeCount !== undefined) {
            if (!Number.isInteger(metrics.handoffAccuracy.designChangeCount) || metrics.handoffAccuracy.designChangeCount < 0) {
                errors.push({ field: 'handoffAccuracy.designChangeCount', message: '設計変更回数は0以上の整数である必要があります' });
            }
        }
        if (metrics.handoffAccuracy.specAmbiguityCount !== undefined) {
            if (!Number.isInteger(metrics.handoffAccuracy.specAmbiguityCount) || metrics.handoffAccuracy.specAmbiguityCount < 0) {
                errors.push({ field: 'handoffAccuracy.specAmbiguityCount', message: '実装時の仕様不明点数は0以上の整数である必要があります' });
            }
        }
    }

    // コメントの検証
    if (metrics.comments !== undefined && (typeof metrics.comments !== 'string' || metrics.comments.trim() === '')) {
        errors.push({ field: 'comments', message: 'コメントは空文字列にできません' });
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 分類値の検証
 * @param {string} field - フィールド名
 * @param {string} value - 検証する値
 * @returns {boolean} 有効な分類値かどうか
 */
function validateClassificationValue(field, value) {
    switch (field) {
        case 'process':
            return CLASSIFICATION_SYSTEM.PROCESS.includes(value);
        case 'docType':
            return CLASSIFICATION_SYSTEM.DOC_TYPE.includes(value);
        case 'category':
            return CLASSIFICATION_SYSTEM.CATEGORY.includes(value);
        case 'rootCause':
            return CLASSIFICATION_SYSTEM.ROOT_CAUSE.includes(value);
        case 'severity':
            return CLASSIFICATION_SYSTEM.SEVERITY.includes(value);
        case 'status':
            return CLASSIFICATION_SYSTEM.STATUS.includes(value);
        case 'ciStatus':
            return CLASSIFICATION_SYSTEM.CI_STATUS.includes(value);
        case 'sbomStatus':
            return CLASSIFICATION_SYSTEM.SBOM_STATUS.includes(value);
        case 'framework':
            return ClassificationSystemEnforcer.isValidFramework(value);
        default:
            return false;
    }
}

// ========================================
// 分類システム管理クラス
// ========================================

/**
 * 分類システムの値を強制・管理するクラス
 */
class ClassificationSystemEnforcer {
    /**
     * プロセス値のリストを取得
     * @returns {string[]} プロセス値の配列
     */
    static getProcessValues() {
        return [...CLASSIFICATION_SYSTEM.PROCESS];
    }

    /**
     * ドキュメントタイプ値のリストを取得
     * @returns {string[]} ドキュメントタイプ値の配列
     */
    static getDocTypeValues() {
        return [...CLASSIFICATION_SYSTEM.DOC_TYPE];
    }

    /**
     * カテゴリ値のリストを取得
     * @returns {string[]} カテゴリ値の配列
     */
    static getCategoryValues() {
        return [...CLASSIFICATION_SYSTEM.CATEGORY];
    }

    /**
     * 根本原因値のリストを取得
     * @returns {string[]} 根本原因値の配列
     */
    static getRootCauseValues() {
        return [...CLASSIFICATION_SYSTEM.ROOT_CAUSE];
    }

    /**
     * 重要度値のリストを取得
     * @returns {string[]} 重要度値の配列
     */
    static getSeverityValues() {
        return [...CLASSIFICATION_SYSTEM.SEVERITY];
    }

    /**
     * ステータス値のリストを取得
     * @returns {string[]} ステータス値の配列
     */
    static getStatusValues() {
        return [...CLASSIFICATION_SYSTEM.STATUS];
    }

    /**
     * CI ステータス値のリストを取得
     * @returns {string[]} CI ステータス値の配列
     */
    static getCIStatusValues() {
        return [...CLASSIFICATION_SYSTEM.CI_STATUS];
    }

    /**
     * SBOM ステータス値のリストを取得
     * @returns {string[]} SBOM ステータス値の配列
     */
    static getSBOMStatusValues() {
        return [...CLASSIFICATION_SYSTEM.SBOM_STATUS];
    }

    /**
     * プロセス値の有効性を検証
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか
     */
    static isValidProcess(value) {
        return CLASSIFICATION_SYSTEM.PROCESS.includes(value);
    }

    /**
     * ドキュメントタイプ値の有効性を検証
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか
     */
    static isValidDocType(value) {
        return CLASSIFICATION_SYSTEM.DOC_TYPE.includes(value);
    }

    /**
     * カテゴリ値の有効性を検証
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか
     */
    static isValidCategory(value) {
        return CLASSIFICATION_SYSTEM.CATEGORY.includes(value);
    }

    /**
     * 根本原因値の有効性を検証
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか
     */
    static isValidRootCause(value) {
        return CLASSIFICATION_SYSTEM.ROOT_CAUSE.includes(value);
    }

    /**
     * 重要度値の有効性を検証
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか
     */
    static isValidSeverity(value) {
        return CLASSIFICATION_SYSTEM.SEVERITY.includes(value);
    }

    /**
     * ステータス値の有効性を検証
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか
     */
    static isValidStatus(value) {
        return CLASSIFICATION_SYSTEM.STATUS.includes(value);
    }

    /**
     * CI ステータス値の有効性を検証
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか
     */
    static isValidCIStatus(value) {
        return CLASSIFICATION_SYSTEM.CI_STATUS.includes(value);
    }

    /**
     * SBOM ステータス値の有効性を検証
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか
     */
    static isValidSBOMStatus(value) {
        return CLASSIFICATION_SYSTEM.SBOM_STATUS.includes(value);
    }

    /**
     * フレームワーク種別の有効性を検証
     * 要件8.6: フレームワーク種別として任意の文字列を受け入れる
     * @param {string} value - 検証する値
     * @returns {boolean} 有効かどうか（空文字列でなければ有効）
     */
    static isValidFramework(value) {
        return typeof value === 'string' && value.trim() !== '';
    }

    /**
     * すべての分類システムの値を取得
     * @returns {Object} 分類システムの全値
     */
    static getAllClassificationValues() {
        return {
            process: this.getProcessValues(),
            docType: this.getDocTypeValues(),
            category: this.getCategoryValues(),
            rootCause: this.getRootCauseValues(),
            severity: this.getSeverityValues(),
            status: this.getStatusValues(),
            ciStatus: this.getCIStatusValues(),
            sbomStatus: this.getSBOMStatusValues()
        };
    }
}

// ========================================
// バリデーションエンジンクラス
// ========================================

/**
 * 入力データの検証を行うクラス
 */
class ValidationEngine {
    /**
     * プロジェクトデータのバリデーション
     * @param {Partial<Project>} project - バリデーション対象のプロジェクトデータ
     * @returns {ValidationResult} バリデーション結果
     */
    static validateProject(project) {
        return validateProject(project);
    }

    /**
     * CI結果データのバリデーション
     * @param {Partial<CIResult>} ciResult - バリデーション対象のCI結果データ
     * @returns {ValidationResult} バリデーション結果
     */
    static validateCIResult(ciResult) {
        return validateCIResult(ciResult);
    }

    /**
     * レビュー指摘データのバリデーション
     * @param {Partial<ReviewFinding>} finding - バリデーション対象のレビュー指摘データ
     * @returns {ValidationResult} バリデーション結果
     */
    static validateReviewFinding(finding) {
        return validateReviewFinding(finding);
    }

    /**
     * 効果メトリクスデータのバリデーション
     * @param {Partial<EffectMetrics>} metrics - バリデーション対象の効果メトリクスデータ
     * @returns {ValidationResult} バリデーション結果
     */
    static validateEffectMetrics(metrics) {
        return validateEffectMetrics(metrics);
    }

    /**
     * 分類値の検証
     * @param {string} field - フィールド名
     * @param {string} value - 検証する値
     * @returns {boolean} 有効な分類値かどうか
     */
    static validateClassificationValue(field, value) {
        return validateClassificationValue(field, value);
    }

    /**
     * 複数のバリデーション結果をマージ
     * @param {ValidationResult[]} results - バリデーション結果の配列
     * @returns {ValidationResult} マージされたバリデーション結果
     */
    static mergeValidationResults(results) {
        const allErrors = results.reduce((acc, result) => {
            return acc.concat(result.errors);
        }, []);

        return {
            isValid: allErrors.length === 0,
            errors: allErrors
        };
    }

    /**
     * バリデーションエラーメッセージを生成
     * @param {ValidationResult} result - バリデーション結果
     * @returns {string} エラーメッセージ
     */
    static formatValidationErrors(result) {
        if (result.isValid) {
            return '';
        }

        return result.errors.map(error => `${error.field}: ${error.message}`).join('\n');
    }
}

// ========================================
// JSONスキーマバリデーション関数
// ========================================

/**
 * プロジェクト配列のJSONスキーマバリデーション
 * @param {any} data - 検証するデータ
 * @returns {ValidationResult} バリデーション結果
 */
function validateProjectsJSONSchema(data) {
    const errors = [];

    if (!Array.isArray(data)) {
        errors.push({ field: 'root', message: 'プロジェクトデータは配列である必要があります' });
        return { isValid: false, errors: errors };
    }

    data.forEach((project, index) => {
        if (typeof project !== 'object' || project === null) {
            errors.push({ field: `projects[${index}]`, message: 'プロジェクトはオブジェクトである必要があります' });
            return;
        }

        // 必須フィールドの存在確認
        const requiredFields = ['id', 'name', 'framework', 'date', 'createdAt', 'updatedAt'];
        requiredFields.forEach(field => {
            if (!(field in project)) {
                errors.push({ field: `projects[${index}].${field}`, message: `${field}は必須フィールドです` });
            }
        });

        // ciResults配列の検証
        if ('ciResults' in project) {
            if (!Array.isArray(project.ciResults)) {
                errors.push({ field: `projects[${index}].ciResults`, message: 'ciResultsは配列である必要があります' });
            } else {
                project.ciResults.forEach((ciResult, ciIndex) => {
                    if (typeof ciResult !== 'object' || ciResult === null) {
                        errors.push({ field: `projects[${index}].ciResults[${ciIndex}]`, message: 'CI結果はオブジェクトである必要があります' });
                    }
                });
            }
        }

        // effectMetricsの検証
        if ('effectMetrics' in project && project.effectMetrics !== null) {
            if (typeof project.effectMetrics !== 'object') {
                errors.push({ field: `projects[${index}].effectMetrics`, message: '効果メトリクスはオブジェクトである必要があります' });
            }
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * レビュー指摘配列のJSONスキーマバリデーション
 * @param {any} data - 検証するデータ
 * @returns {ValidationResult} バリデーション結果
 */
function validateReviewFindingsJSONSchema(data) {
    const errors = [];

    if (!Array.isArray(data)) {
        errors.push({ field: 'root', message: 'レビュー指摘データは配列である必要があります' });
        return { isValid: false, errors: errors };
    }

    data.forEach((finding, index) => {
        if (typeof finding !== 'object' || finding === null) {
            errors.push({ field: `reviewFindings[${index}]`, message: 'レビュー指摘はオブジェクトである必要があります' });
            return;
        }

        // 必須フィールドの存在確認
        const requiredFields = [
            'id', 'projectId', 'timestamp', 'process', 'docType', 'category',
            'rootCause', 'severity', 'status', 'description', 'docRef'
        ];
        requiredFields.forEach(field => {
            if (!(field in finding)) {
                errors.push({ field: `reviewFindings[${index}].${field}`, message: `${field}は必須フィールドです` });
            }
        });

        // docRefオブジェクトの検証
        if ('docRef' in finding) {
            if (typeof finding.docRef !== 'object' || finding.docRef === null) {
                errors.push({ field: `reviewFindings[${index}].docRef`, message: 'docRefはオブジェクトである必要があります' });
            } else {
                if (!('path' in finding.docRef)) {
                    errors.push({ field: `reviewFindings[${index}].docRef.path`, message: 'docRef.pathは必須フィールドです' });
                }
            }
        }
    });

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * エクスポートデータのJSONスキーマバリデーション
 * @param {any} data - 検証するデータ
 * @returns {ValidationResult} バリデーション結果
 */
function validateExportDataJSONSchema(data) {
    const errors = [];

    if (typeof data !== 'object' || data === null) {
        errors.push({ field: 'root', message: 'エクスポートデータはオブジェクトである必要があります' });
        return { isValid: false, errors: errors };
    }

    // 必須フィールドの存在確認
    const requiredFields = ['version', 'exportedAt', 'projects', 'reviewFindings'];
    requiredFields.forEach(field => {
        if (!(field in data)) {
            errors.push({ field: field, message: `${field}は必須フィールドです` });
        }
    });

    // projects配列の検証
    if ('projects' in data) {
        const projectsValidation = validateProjectsJSONSchema(data.projects);
        if (!projectsValidation.isValid) {
            errors.push(...projectsValidation.errors);
        }
    }

    // reviewFindings配列の検証
    if ('reviewFindings' in data) {
        const findingsValidation = validateReviewFindingsJSONSchema(data.reviewFindings);
        if (!findingsValidation.isValid) {
            errors.push(...findingsValidation.errors);
        }
    }

    // バージョンの検証
    if ('version' in data && typeof data.version !== 'string') {
        errors.push({ field: 'version', message: 'バージョンは文字列である必要があります' });
    }

    // エクスポート日時の検証
    if ('exportedAt' in data) {
        if (typeof data.exportedAt !== 'string') {
            errors.push({ field: 'exportedAt', message: 'エクスポート日時は文字列である必要があります' });
        } else {
            const date = new Date(data.exportedAt);
            if (isNaN(date.getTime())) {
                errors.push({ field: 'exportedAt', message: 'エクスポート日時は有効なISO 8601形式である必要があります' });
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

/**
 * 汎用JSONパース関数（エラーハンドリング付き）
 * @param {string} jsonString - パースするJSON文字列
 * @returns {Object} パース結果 { success: boolean, data?: any, error?: string }
 */
function safeJSONParse(jsonString) {
    try {
        const data = JSON.parse(jsonString);
        return { success: true, data: data };
    } catch (error) {
        return { 
            success: false, 
            error: `JSONパースエラー: ${error.message}` 
        };
    }
}

/**
 * 汎用JSON文字列化関数（エラーハンドリング付き）
 * @param {any} data - 文字列化するデータ
 * @param {number} [space=2] - インデント用のスペース数
 * @returns {Object} 文字列化結果 { success: boolean, json?: string, error?: string }
 */
function safeJSONStringify(data, space = 2) {
    try {
        const json = JSON.stringify(data, null, space);
        return { success: true, json: json };
    } catch (error) {
        return { 
            success: false, 
            error: `JSON文字列化エラー: ${error.message}` 
        };
    }
}

// ========================================
// データモデル作成ヘルパー関数
// ========================================

/**
 * 新しいプロジェクトオブジェクトを作成
 * @param {Object} projectData - プロジェクトデータ
 * @returns {Project} 新しいプロジェクトオブジェクト
 */
function createProject(projectData) {
    const now = getCurrentTimestamp();
    return {
        id: generateUUID(),
        name: projectData.name,
        framework: projectData.framework,
        date: projectData.date,
        assignee: projectData.assignee || undefined,
        ciResults: [],
        effectMetrics: undefined,
        createdAt: now,
        updatedAt: now
    };
}

/**
 * 新しいCI結果オブジェクトを作成
 * @param {Object} ciData - CI結果データ
 * @returns {CIResult} 新しいCI結果オブジェクト
 */
function createCIResult(ciData) {
    return {
        timestamp: getCurrentTimestamp(),
        status: ciData.status,
        lintResult: ciData.lintResult || undefined,
        contractTestResult: ciData.contractTestResult || undefined,
        coverage: ciData.coverage || undefined,
        sbomStatus: ciData.sbomStatus || undefined,
        logUrl: ciData.logUrl || undefined
    };
}

/**
 * 新しいレビュー指摘オブジェクトを作成
 * @param {Object} findingData - レビュー指摘データ
 * @returns {ReviewFinding} 新しいレビュー指摘オブジェクト
 */
function createReviewFinding(findingData) {
    return {
        id: generateUUID(),
        projectId: findingData.projectId,
        timestamp: getCurrentTimestamp(),
        process: findingData.process,
        docType: findingData.docType,
        category: findingData.category,
        rootCause: findingData.rootCause,
        severity: findingData.severity,
        status: findingData.status,
        description: findingData.description,
        docRef: {
            path: findingData.docRef.path,
            lines: findingData.docRef.lines || undefined,
            sectionId: findingData.docRef.sectionId || undefined
        },
        reviewer: findingData.reviewer || undefined,
        assignee: findingData.assignee || undefined
    };
}

/**
 * 効果メトリクスオブジェクトを作成
 * @param {Object} metricsData - 効果メトリクスデータ
 * @returns {EffectMetrics} 効果メトリクスオブジェクト
 */
function createEffectMetrics(metricsData) {
    const metrics = {};

    if (metricsData.efficiency) {
        metrics.efficiency = {};
        if (metricsData.efficiency.taskCompletionRate !== undefined) {
            metrics.efficiency.taskCompletionRate = metricsData.efficiency.taskCompletionRate;
        }
        if (metricsData.efficiency.avgTaskDurationHours !== undefined) {
            metrics.efficiency.avgTaskDurationHours = metricsData.efficiency.avgTaskDurationHours;
        }
    }

    if (metricsData.quality) {
        metrics.quality = {};
        if (metricsData.quality.preImplFindingsCount !== undefined) {
            metrics.quality.preImplFindingsCount = metricsData.quality.preImplFindingsCount;
        }
        if (metricsData.quality.postImplFindingsCount !== undefined) {
            metrics.quality.postImplFindingsCount = metricsData.quality.postImplFindingsCount;
        }
        if (metricsData.quality.highSeverityCount !== undefined) {
            metrics.quality.highSeverityCount = metricsData.quality.highSeverityCount;
        }
        if (metricsData.quality.ciSuccessRate !== undefined) {
            metrics.quality.ciSuccessRate = metricsData.quality.ciSuccessRate;
        }
    }

    if (metricsData.humanEffort) {
        metrics.humanEffort = {};
        if (metricsData.humanEffort.manualFixCount !== undefined) {
            metrics.humanEffort.manualFixCount = metricsData.humanEffort.manualFixCount;
        }
        if (metricsData.humanEffort.reviewEffortHours !== undefined) {
            metrics.humanEffort.reviewEffortHours = metricsData.humanEffort.reviewEffortHours;
        }
    }

    if (metricsData.handoffAccuracy) {
        metrics.handoffAccuracy = {};
        if (metricsData.handoffAccuracy.requirementsChangeCount !== undefined) {
            metrics.handoffAccuracy.requirementsChangeCount = metricsData.handoffAccuracy.requirementsChangeCount;
        }
        if (metricsData.handoffAccuracy.designChangeCount !== undefined) {
            metrics.handoffAccuracy.designChangeCount = metricsData.handoffAccuracy.designChangeCount;
        }
        if (metricsData.handoffAccuracy.specAmbiguityCount !== undefined) {
            metrics.handoffAccuracy.specAmbiguityCount = metricsData.handoffAccuracy.specAmbiguityCount;
        }
    }

    if (metricsData.comments !== undefined) {
        metrics.comments = metricsData.comments;
    }

    return metrics;
}

// ========================================
// LocalStorage Manager クラス
// ========================================

/**
 * LocalStorageへの読み書きを抽象化するクラス
 */
class LocalStorageManager {
    // LocalStorageのキー定数
    static KEYS = {
        PROJECTS: 'spec-tracking-site:projects',
        REVIEW_FINDINGS: 'spec-tracking-site:reviewFindings',
        INITIALIZED: 'spec-tracking-site:initialized'
    };

    /**
     * プロジェクト一覧を取得
     * @returns {Project[]} プロジェクト配列
     */
    static getProjects() {
        try {
            const projectsJson = localStorage.getItem(this.KEYS.PROJECTS);
            if (!projectsJson) {
                return [];
            }

            const parseResult = safeJSONParse(projectsJson);
            if (!parseResult.success) {
                console.error('プロジェクトデータのパースに失敗:', parseResult.error);
                ErrorHandler.handleStorageError(new Error(parseResult.error));
                return [];
            }

            // JSONスキーマバリデーション
            const validationResult = validateProjectsJSONSchema(parseResult.data);
            if (!validationResult.isValid) {
                console.error('プロジェクトデータのスキーマバリデーションに失敗:', validationResult.errors);
                ErrorHandler.handleValidationError(validationResult);
                return [];
            }

            return parseResult.data;
        } catch (error) {
            console.error('プロジェクトデータの取得に失敗:', error);
            ErrorHandler.handleStorageError(error);
            return [];
        }
    }

    /**
     * プロジェクト一覧を保存
     * @param {Project[]} projects - 保存するプロジェクト配列
     * @returns {boolean} 保存成功フラグ
     */
    static setProjects(projects) {
        try {
            // 入力データのバリデーション
            if (!Array.isArray(projects)) {
                const validationError = {
                    isValid: false,
                    errors: [{ field: 'projects', message: 'プロジェクトデータは配列である必要があります' }]
                };
                console.error('プロジェクトデータは配列である必要があります');
                ErrorHandler.handleValidationError(validationError);
                return false;
            }

            // JSONスキーマバリデーション
            const validationResult = validateProjectsJSONSchema(projects);
            if (!validationResult.isValid) {
                console.error('プロジェクトデータのスキーマバリデーションに失敗:', validationResult.errors);
                ErrorHandler.handleValidationError(validationResult);
                return false;
            }

            // JSON文字列化
            const stringifyResult = safeJSONStringify(projects);
            if (!stringifyResult.success) {
                console.error('プロジェクトデータの文字列化に失敗:', stringifyResult.error);
                ErrorHandler.handleStorageError(new Error(stringifyResult.error));
                return false;
            }

            // LocalStorageに保存
            localStorage.setItem(this.KEYS.PROJECTS, stringifyResult.json);
            return true;
        } catch (error) {
            console.error('プロジェクトデータの保存に失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * レビュー指摘一覧を取得
     * @returns {ReviewFinding[]} レビュー指摘配列
     */
    static getReviewFindings() {
        try {
            const findingsJson = localStorage.getItem(this.KEYS.REVIEW_FINDINGS);
            if (!findingsJson) {
                return [];
            }

            const parseResult = safeJSONParse(findingsJson);
            if (!parseResult.success) {
                console.error('レビュー指摘データのパースに失敗:', parseResult.error);
                ErrorHandler.handleStorageError(new Error(parseResult.error));
                return [];
            }

            // JSONスキーマバリデーション
            const validationResult = validateReviewFindingsJSONSchema(parseResult.data);
            if (!validationResult.isValid) {
                console.error('レビュー指摘データのスキーマバリデーションに失敗:', validationResult.errors);
                ErrorHandler.handleValidationError(validationResult);
                return [];
            }

            return parseResult.data;
        } catch (error) {
            console.error('レビュー指摘データの取得に失敗:', error);
            ErrorHandler.handleStorageError(error);
            return [];
        }
    }

    /**
     * レビュー指摘一覧を保存
     * @param {ReviewFinding[]} reviewFindings - 保存するレビュー指摘配列
     * @returns {boolean} 保存成功フラグ
     */
    static setReviewFindings(reviewFindings) {
        try {
            // 入力データのバリデーション
            if (!Array.isArray(reviewFindings)) {
                console.error('レビュー指摘データは配列である必要があります');
                return false;
            }

            // JSONスキーマバリデーション
            const validationResult = validateReviewFindingsJSONSchema(reviewFindings);
            if (!validationResult.isValid) {
                console.error('レビュー指摘データのスキーマバリデーションに失敗:', validationResult.errors);
                return false;
            }

            // JSON文字列化
            const stringifyResult = safeJSONStringify(reviewFindings);
            if (!stringifyResult.success) {
                console.error('レビュー指摘データの文字列化に失敗:', stringifyResult.error);
                return false;
            }

            // LocalStorageに保存
            localStorage.setItem(this.KEYS.REVIEW_FINDINGS, stringifyResult.json);
            return true;
        } catch (error) {
            console.error('レビュー指摘データの保存に失敗:', error);
            return false;
        }
    }

    /**
     * 初期化済みかどうかを確認
     * @returns {boolean} 初期化済みフラグ
     */
    static isInitialized() {
        try {
            const initialized = localStorage.getItem(this.KEYS.INITIALIZED);
            return initialized === 'true';
        } catch (error) {
            console.error('初期化状態の確認に失敗:', error);
            return false;
        }
    }

    /**
     * 初期化処理（サンプルデータの読み込み）
     * @returns {Promise<boolean>} 初期化成功フラグ
     */
    static async initialize() {
        try {
            // 既に初期化済みの場合はスキップ
            if (this.isInitialized()) {
                console.log('既に初期化済みです');
                return true;
            }

            console.log('初回アクセス - サンプルデータを読み込み中...');

            // サンプルデータの読み込み
            const [projectsResult, reviewFindingsResult] = await Promise.all([
                this.loadSampleProjects(),
                this.loadSampleReviewFindings()
            ]);

            if (!projectsResult.success || !reviewFindingsResult.success) {
                console.warn('サンプルデータの読み込みに失敗しましたが、空の状態で初期化します');
                // 空の配列で初期化
                this.setProjects([]);
                this.setReviewFindings([]);
            } else {
                // サンプルデータをLocalStorageに保存
                this.setProjects(projectsResult.data);
                this.setReviewFindings(reviewFindingsResult.data);
                console.log('サンプルデータの読み込みが完了しました');
            }

            // 初期化完了フラグを設定
            localStorage.setItem(this.KEYS.INITIALIZED, 'true');
            return true;
        } catch (error) {
            console.error('初期化処理に失敗:', error);
            return false;
        }
    }

    /**
     * サンプルプロジェクトデータを読み込み
     * @returns {Promise<Object>} 読み込み結果 { success: boolean, data?: Project[], error?: string }
     */
    static async loadSampleProjects() {
        try {
            const response = await fetch('data/projects.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // JSONスキーマバリデーション
            const validationResult = validateProjectsJSONSchema(data);
            if (!validationResult.isValid) {
                throw new Error(`サンプルプロジェクトデータのバリデーションに失敗: ${ValidationEngine.formatValidationErrors(validationResult)}`);
            }

            return { success: true, data: data };
        } catch (error) {
            console.error('サンプルプロジェクトデータの読み込みに失敗:', error);
            ErrorHandler.handleImportError(error);
            return { success: false, error: error.message };
        }
    }

    /**
     * サンプルレビュー指摘データを読み込み
     * @returns {Promise<Object>} 読み込み結果 { success: boolean, data?: ReviewFinding[], error?: string }
     */
    static async loadSampleReviewFindings() {
        try {
            const response = await fetch('data/review_log.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            // JSONスキーマバリデーション
            const validationResult = validateReviewFindingsJSONSchema(data);
            if (!validationResult.isValid) {
                throw new Error(`サンプルレビュー指摘データのバリデーションに失敗: ${ValidationEngine.formatValidationErrors(validationResult)}`);
            }

            return { success: true, data: data };
        } catch (error) {
            console.error('サンプルレビュー指摘データの読み込みに失敗:', error);
            ErrorHandler.handleImportError(error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 全データをエクスポート用オブジェクトとして取得
     * @returns {Object} エクスポートデータ { projects: Project[], reviewFindings: ReviewFinding[] }
     */
    static exportData() {
        try {
            const projects = this.getProjects();
            const reviewFindings = this.getReviewFindings();

            const exportData = {
                version: '1.0',
                exportedAt: getCurrentTimestamp(),
                projects: projects,
                reviewFindings: reviewFindings
            };

            // エクスポートデータのバリデーション
            const validationResult = validateExportDataJSONSchema(exportData);
            if (!validationResult.isValid) {
                console.error('エクスポートデータのバリデーションに失敗:', validationResult.errors);
                return null;
            }

            return exportData;
        } catch (error) {
            console.error('データエクスポートに失敗:', error);
            return null;
        }
    }

    /**
     * データをJSONファイルとしてダウンロード
     * @param {string} [filename] - ダウンロードファイル名（省略時は自動生成）
     * @returns {boolean} ダウンロード成功フラグ
     */
    static downloadDataAsJSON(filename = null) {
        try {
            // エクスポートデータを取得
            const exportData = this.exportData();
            if (!exportData) {
                console.error('エクスポートデータの取得に失敗しました');
                return false;
            }

            // JSON文字列化
            const stringifyResult = safeJSONStringify(exportData);
            if (!stringifyResult.success) {
                console.error('エクスポートデータの文字列化に失敗:', stringifyResult.error);
                return false;
            }

            // ファイル名の生成
            if (!filename) {
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
                const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS
                filename = `spec-tracking-site-export-${dateStr}-${timeStr}.json`;
            }

            // Blobオブジェクトを作成
            const blob = new Blob([stringifyResult.json], { type: 'application/json' });

            // ダウンロードリンクを作成
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            // ダウンロードを実行
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // オブジェクトURLを解放
            URL.revokeObjectURL(url);

            console.log(`データを ${filename} としてエクスポートしました`);
            return true;
        } catch (error) {
            console.error('JSONファイルのダウンロードに失敗:', error);
            return false;
        }
    }

    /**
     * LocalStorageの全データをクリア
     */
    static clearAll() {
        try {
            localStorage.removeItem(this.KEYS.PROJECTS);
            localStorage.removeItem(this.KEYS.REVIEW_FINDINGS);
            localStorage.removeItem(this.KEYS.INITIALIZED);
            console.log('LocalStorageのデータをクリアしました');
        } catch (error) {
            console.error('LocalStorageのクリアに失敗:', error);
        }
    }
}

// ========================================
// Data Manager クラス
// ========================================

/**
 * プロジェクトとレビュー指摘のCRUD操作を管理するコアコンポーネント
 */
class DataManager {
    /**
     * 全プロジェクトを取得
     * @returns {Project[]} プロジェクト配列
     */
    static getAllProjects() {
        return LocalStorageManager.getProjects();
    }

    /**
     * IDでプロジェクトを取得
     * @param {string} id - プロジェクトID
     * @returns {Project|null} プロジェクトオブジェクト（見つからない場合はnull）
     */
    static getProjectById(id) {
        const projects = this.getAllProjects();
        return projects.find(project => project.id === id) || null;
    }

    /**
     * 新しいプロジェクトを作成
     * @param {Omit<Project, 'id'>} projectData - プロジェクトデータ（IDを除く）
     * @returns {Project|null} 作成されたプロジェクト（失敗時はnull）
     */
    static createProject(projectData) {
        try {
            // バリデーション
            const validationResult = ValidationEngine.validateProject(projectData);
            if (!validationResult.isValid) {
                console.error('プロジェクトのバリデーションに失敗:', validationResult.errors);
                ErrorHandler.handleValidationError(validationResult);
                return null;
            }

            // 新しいプロジェクトオブジェクトを作成
            const newProject = createProject(projectData);

            // 既存のプロジェクト一覧を取得
            const projects = this.getAllProjects();

            // IDの重複チェック（念のため）
            if (projects.some(p => p.id === newProject.id)) {
                console.error('プロジェクトIDが重複しています:', newProject.id);
                return null;
            }

            // プロジェクトを追加
            projects.push(newProject);

            // LocalStorageに保存
            const success = LocalStorageManager.setProjects(projects);
            if (!success) {
                console.error('プロジェクトの保存に失敗しました');
                return null;
            }

            console.log('プロジェクトを作成しました:', newProject.id);
            return newProject;
        } catch (error) {
            console.error('プロジェクトの作成中にエラーが発生:', error);
            return null;
        }
    }

    /**
     * プロジェクトを更新
     * @param {string} id - プロジェクトID
     * @param {Partial<Project>} updates - 更新データ
     * @returns {boolean} 更新成功フラグ
     */
    static updateProject(id, updates) {
        try {
            const projects = this.getAllProjects();
            const projectIndex = projects.findIndex(project => project.id === id);

            if (projectIndex === -1) {
                console.error('プロジェクトが見つかりません:', id);
                return false;
            }

            // 現在のプロジェクトデータを取得
            const currentProject = projects[projectIndex];

            // 更新データをマージ（IDは変更不可）
            const updatedProject = {
                ...currentProject,
                ...updates,
                id: currentProject.id, // IDは変更不可
                updatedAt: getCurrentTimestamp() // 更新日時を自動設定
            };

            // バリデーション
            const validationResult = ValidationEngine.validateProject(updatedProject);
            if (!validationResult.isValid) {
                console.error('更新後のプロジェクトデータのバリデーションに失敗:', validationResult.errors);
                return false;
            }

            // プロジェクトを更新
            projects[projectIndex] = updatedProject;

            // LocalStorageに保存
            const success = LocalStorageManager.setProjects(projects);
            if (!success) {
                console.error('プロジェクトの更新保存に失敗しました');
                return false;
            }

            console.log('プロジェクトを更新しました:', id);
            return true;
        } catch (error) {
            console.error('プロジェクトの更新中にエラーが発生:', error);
            return false;
        }
    }

    /**
     * プロジェクトを削除（関連するCI結果とレビュー指摘も削除）
     * @param {string} id - プロジェクトID
     * @returns {boolean} 削除成功フラグ
     */
    static deleteProject(id) {
        try {
            const projects = this.getAllProjects();
            const projectIndex = projects.findIndex(project => project.id === id);

            if (projectIndex === -1) {
                console.error('プロジェクトが見つかりません:', id);
                return false;
            }

            // プロジェクトを削除
            projects.splice(projectIndex, 1);

            // 関連するレビュー指摘も削除
            const reviewFindings = LocalStorageManager.getReviewFindings();
            const filteredFindings = reviewFindings.filter(finding => finding.projectId !== id);

            // LocalStorageに保存
            const projectsSaveSuccess = LocalStorageManager.setProjects(projects);
            const findingsSaveSuccess = LocalStorageManager.setReviewFindings(filteredFindings);

            if (!projectsSaveSuccess || !findingsSaveSuccess) {
                console.error('プロジェクトまたは関連データの削除保存に失敗しました');
                return false;
            }

            console.log('プロジェクトと関連データを削除しました:', id);
            return true;
        } catch (error) {
            console.error('プロジェクトの削除中にエラーが発生:', error);
            return false;
        }
    }

    /**
     * プロジェクトIDでレビュー指摘を取得
     * @param {string} projectId - プロジェクトID
     * @returns {ReviewFinding[]} レビュー指摘配列
     */
    static getReviewFindingsByProjectId(projectId) {
        const reviewFindings = LocalStorageManager.getReviewFindings();
        return reviewFindings.filter(finding => finding.projectId === projectId);
    }

    /**
     * IDでレビュー指摘を取得
     * @param {string} findingId - レビュー指摘ID
     * @returns {ReviewFinding|null} レビュー指摘（見つからない場合はnull）
     */
    static getReviewFindingById(findingId) {
        const reviewFindings = LocalStorageManager.getReviewFindings();
        return reviewFindings.find(finding => finding.id === findingId) || null;
    }

    /**
     * 新しいレビュー指摘を作成
     * @param {Omit<ReviewFinding, 'id'|'timestamp'>} findingData - レビュー指摘データ（IDとタイムスタンプを除く）
     * @returns {ReviewFinding|null} 作成されたレビュー指摘（失敗時はnull）
     */
    static createReviewFinding(findingData) {
        try {
            // プロジェクトの存在確認
            const project = this.getProjectById(findingData.projectId);
            if (!project) {
                console.error('指定されたプロジェクトが存在しません:', findingData.projectId);
                return null;
            }

            // バリデーション
            const validationResult = ValidationEngine.validateReviewFinding(findingData);
            if (!validationResult.isValid) {
                console.error('レビュー指摘のバリデーションに失敗:', validationResult.errors);
                ErrorHandler.handleValidationError(validationResult);
                return null;
            }

            // 新しいレビュー指摘オブジェクトを作成
            const newFinding = createReviewFinding(findingData);

            // 既存のレビュー指摘一覧を取得
            const reviewFindings = LocalStorageManager.getReviewFindings();

            // IDの重複チェック（念のため）
            if (reviewFindings.some(f => f.id === newFinding.id)) {
                console.error('レビュー指摘IDが重複しています:', newFinding.id);
                return null;
            }

            // レビュー指摘を追加
            reviewFindings.push(newFinding);

            // LocalStorageに保存
            const success = LocalStorageManager.setReviewFindings(reviewFindings);
            if (!success) {
                console.error('レビュー指摘の保存に失敗しました');
                return null;
            }

            console.log('レビュー指摘を作成しました:', newFinding.id);
            return newFinding;
        } catch (error) {
            console.error('レビュー指摘の作成中にエラーが発生:', error);
            return null;
        }
    }

    /**
     * レビュー指摘を更新
     * @param {string} id - レビュー指摘ID
     * @param {Partial<ReviewFinding>} updates - 更新データ
     * @returns {boolean} 更新成功フラグ
     */
    static updateReviewFinding(id, updates) {
        try {
            const reviewFindings = LocalStorageManager.getReviewFindings();
            const findingIndex = reviewFindings.findIndex(finding => finding.id === id);

            if (findingIndex === -1) {
                console.error('レビュー指摘が見つかりません:', id);
                return false;
            }

            // 現在のレビュー指摘データを取得
            const currentFinding = reviewFindings[findingIndex];

            // 更新データをマージ（IDとタイムスタンプは変更不可）
            const updatedFinding = {
                ...currentFinding,
                ...updates,
                id: currentFinding.id, // IDは変更不可
                timestamp: currentFinding.timestamp // タイムスタンプは変更不可
            };

            // バリデーション
            const validationResult = ValidationEngine.validateReviewFinding(updatedFinding);
            if (!validationResult.isValid) {
                console.error('更新後のレビュー指摘データのバリデーションに失敗:', validationResult.errors);
                return false;
            }

            // レビュー指摘を更新
            reviewFindings[findingIndex] = updatedFinding;

            // LocalStorageに保存
            const success = LocalStorageManager.setReviewFindings(reviewFindings);
            if (!success) {
                console.error('レビュー指摘の更新保存に失敗しました');
                return false;
            }

            console.log('レビュー指摘を更新しました:', id);
            return true;
        } catch (error) {
            console.error('レビュー指摘の更新中にエラーが発生:', error);
            return false;
        }
    }

    /**
     * レビュー指摘を削除
     * @param {string} id - レビュー指摘ID
     * @returns {boolean} 削除成功フラグ
     */
    static deleteReviewFinding(id) {
        try {
            const reviewFindings = LocalStorageManager.getReviewFindings();
            const findingIndex = reviewFindings.findIndex(finding => finding.id === id);

            if (findingIndex === -1) {
                console.error('レビュー指摘が見つかりません:', id);
                return false;
            }

            // レビュー指摘を削除
            reviewFindings.splice(findingIndex, 1);

            // LocalStorageに保存
            const success = LocalStorageManager.setReviewFindings(reviewFindings);
            if (!success) {
                console.error('レビュー指摘の削除保存に失敗しました');
                return false;
            }

            console.log('レビュー指摘を削除しました:', id);
            return true;
        } catch (error) {
            console.error('レビュー指摘の削除中にエラーが発生:', error);
            return false;
        }
    }

    /**
     * プロジェクトIDでCI結果を取得
     * @param {string} projectId - プロジェクトID
     * @returns {CIResult[]} CI結果配列
     */
    static getCIResultsByProjectId(projectId) {
        const project = this.getProjectById(projectId);
        return project ? project.ciResults || [] : [];
    }

    /**
     * 新しいCI結果を作成
     * @param {string} projectId - プロジェクトID
     * @param {Omit<CIResult, 'timestamp'>} resultData - CI結果データ（タイムスタンプを除く）
     * @returns {CIResult|null} 作成されたCI結果（失敗時はnull）
     */
    static createCIResult(projectId, resultData) {
        try {
            // プロジェクトの存在確認
            const project = this.getProjectById(projectId);
            if (!project) {
                console.error('指定されたプロジェクトが存在しません:', projectId);
                return null;
            }

            // バリデーション
            const validationResult = ValidationEngine.validateCIResult(resultData);
            if (!validationResult.isValid) {
                console.error('CI結果のバリデーションに失敗:', validationResult.errors);
                ErrorHandler.handleValidationError(validationResult);
                return null;
            }

            // 新しいCI結果オブジェクトを作成
            const newCIResult = createCIResult(resultData);

            // プロジェクトのCI結果配列に追加
            const updatedProject = {
                ...project,
                ciResults: [...(project.ciResults || []), newCIResult],
                updatedAt: getCurrentTimestamp()
            };

            // プロジェクトを更新
            const success = this.updateProject(projectId, updatedProject);
            if (!success) {
                console.error('CI結果の追加に失敗しました');
                return null;
            }

            console.log('CI結果を作成しました:', newCIResult.timestamp);
            return newCIResult;
        } catch (error) {
            console.error('CI結果の作成中にエラーが発生:', error);
            return null;
        }
    }

    /**
     * CI結果を削除
     * @param {string} projectId - プロジェクトID
     * @param {string} timestamp - CI結果のタイムスタンプ
     * @returns {boolean} 削除成功フラグ
     */
    static deleteCIResult(projectId, timestamp) {
        try {
            const project = this.getProjectById(projectId);
            if (!project) {
                console.error('指定されたプロジェクトが存在しません:', projectId);
                return false;
            }

            const ciResults = project.ciResults || [];
            const resultIndex = ciResults.findIndex(result => result.timestamp === timestamp);

            if (resultIndex === -1) {
                console.error('指定されたCI結果が見つかりません:', timestamp);
                return false;
            }

            // CI結果を削除
            const updatedCIResults = [...ciResults];
            updatedCIResults.splice(resultIndex, 1);

            // プロジェクトを更新
            const updatedProject = {
                ...project,
                ciResults: updatedCIResults,
                updatedAt: getCurrentTimestamp()
            };

            const success = this.updateProject(projectId, updatedProject);
            if (!success) {
                console.error('CI結果の削除に失敗しました');
                return false;
            }

            console.log('CI結果を削除しました:', timestamp);
            return true;
        } catch (error) {
            console.error('CI結果の削除中にエラーが発生:', error);
            return false;
        }
    }

    /**
     * 効果メトリクスを更新
     * @param {string} projectId - プロジェクトID
     * @param {EffectMetrics} metrics - 効果メトリクス
     * @returns {boolean} 更新成功フラグ
     */
    static updateEffectMetrics(projectId, metrics) {
        try {
            const project = this.getProjectById(projectId);
            if (!project) {
                console.error('指定されたプロジェクトが存在しません:', projectId);
                return false;
            }

            // バリデーション
            const validationResult = ValidationEngine.validateEffectMetrics(metrics);
            if (!validationResult.isValid) {
                console.error('効果メトリクスのバリデーションに失敗:', validationResult.errors);
                return false;
            }

            // 効果メトリクスオブジェクトを作成
            const effectMetrics = createEffectMetrics(metrics);

            // プロジェクトを更新
            const updatedProject = {
                ...project,
                effectMetrics: effectMetrics,
                updatedAt: getCurrentTimestamp()
            };

            const success = this.updateProject(projectId, updatedProject);
            if (!success) {
                console.error('効果メトリクスの更新に失敗しました');
                return false;
            }

            console.log('効果メトリクスを更新しました:', projectId);
            return true;
        } catch (error) {
            console.error('効果メトリクスの更新中にエラーが発生:', error);
            return false;
        }
    }

    /**
     * プロジェクトIDでレビュー指摘数を取得
     * @param {string} projectId - プロジェクトID
     * @returns {number} レビュー指摘数
     */
    static getReviewFindingCountByProjectId(projectId) {
        const reviewFindings = this.getReviewFindingsByProjectId(projectId);
        return reviewFindings.length;
    }

    /**
     * プロジェクトIDで最新のCIステータスを取得
     * @param {string} projectId - プロジェクトID
     * @returns {'pass'|'fail'|null} 最新のCIステータス（CI結果がない場合はnull）
     */
    static getLatestCIStatusByProjectId(projectId) {
        const ciResults = this.getCIResultsByProjectId(projectId);
        
        if (ciResults.length === 0) {
            return null;
        }

        // タイムスタンプでソートして最新のCI結果を取得
        const sortedResults = ciResults.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        return sortedResults[0].status;
    }
}

// ========================================
// ナビゲーション状態管理
// ========================================

/**
 * 現在のページに基づいてナビゲーション状態を更新
 */
function updateNavigationState() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // リンクのhref属性と現在のパスを比較
        const linkPath = link.getAttribute('href');
        if (linkPath) {
            // 相対パスを絶対パスに変換して比較
            const linkUrl = new URL(linkPath, window.location.origin);
            if (linkUrl.pathname === currentPath) {
                link.classList.add('active');
            }
        }
    });
}

/**
 * ページ遷移時のナビゲーション状態更新
 */
function initializeNavigationState() {
    // 初期状態を設定
    updateNavigationState();
    
    // ページ遷移を監視（SPAの場合）
    window.addEventListener('popstate', updateNavigationState);
    
    // ナビゲーションリンクのクリック時に状態を更新
    document.addEventListener('click', (e) => {
        if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
            // 少し遅延してから状態を更新（ページ遷移後）
            setTimeout(updateNavigationState, 100);
        }
    });
}

// ========================================
// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM読み込み完了 - アプリケーション初期化開始');
    
    try {
        // 各種マネージャーの初期化
        console.log('マネージャーを初期化中...');
        
        // ThemeManagerの初期化
        themeManager = new ThemeManager();
        console.log('ThemeManager が初期化されました');
        
        // ResponsiveLayoutManagerの初期化
        responsiveLayoutManager = new ResponsiveLayoutManager();
        console.log('ResponsiveLayoutManager が初期化されました');
        
        // AnimationControllerの初期化
        animationController = initializeAnimationController();
        
        // AccessibilityManagerの初期化
        accessibilityManager = initializeAccessibilityManager();
        
        // 既存のボタンにリップル効果を追加
        enhanceButtonsWithRippleEffect();
        
        // アニメーション設定UIを追加
        addAnimationToggleToDesktopNav();
        addAnimationToggleToMobileNav();
        
        // 動的に追加されるボタンを監視
        observeButtonAdditions();
        
        // 仮想スクロール機能の強化
        enhanceExistingVirtualScroll();
        
        // ナビゲーション状態の初期化
        initializeNavigationState();
        
        console.log('マネージャーの初期化完了');
        
        // 現在のページを判定して適切な初期化を実行
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        
        if (currentPage === 'index.html' || currentPage === '') {
            initializeProjectListPage();
        } else if (currentPage === 'project-detail.html') {
            initializeProjectDetailPage();
        }
        
        console.log('アプリケーション初期化完了');
    } catch (error) {
        console.error('アプリケーション初期化中にエラーが発生:', error);
        // エラーが発生してもページの基本機能は動作するようにする
        try {
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            if (currentPage === 'index.html' || currentPage === '') {
                initializeProjectListPage();
            } else if (currentPage === 'project-detail.html') {
                initializeProjectDetailPage();
            }
        } catch (fallbackError) {
            console.error('フォールバック初期化も失敗:', fallbackError);
        }
    }
});

// プロジェクト一覧ページの初期化
async function initializeProjectListPage() {
    console.log('プロジェクト一覧ページを初期化中...');
    
    try {
        // LocalStorageManagerの初期化
        console.log('LocalStorageManagerを初期化中...');
        await LocalStorageManager.initialize();
        console.log('LocalStorageManagerの初期化完了');
        
        // プロジェクト一覧の表示
        console.log('プロジェクト一覧を読み込み中...');
        loadAndDisplayProjects();
        console.log('プロジェクト一覧の表示完了');
        
        // イベントリスナーの設定
        console.log('イベントリスナーを設定中...');
        setupProjectListEventListeners();
        console.log('イベントリスナーの設定完了');
        
        // プロジェクト追加フォームの初期化
        console.log('プロジェクト追加フォームを初期化中...');
        initializeAddProjectForm();
        console.log('プロジェクト追加フォームの初期化完了');
        
        console.log('プロジェクト一覧ページの初期化が完了しました');
    } catch (error) {
        console.error('プロジェクト一覧ページの初期化に失敗:', error);
        ErrorHandler.handleUnexpectedError(error, 'ページ初期化');
        showEmptyState();
    }
}

// プロジェクト詳細ページの初期化
async function initializeProjectDetailPage() {
    console.log('プロジェクト詳細ページを初期化中...');
    
    try {
        // LocalStorageManagerの初期化
        await LocalStorageManager.initialize();
        
        // URLパラメータからプロジェクトIDを取得
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) {
            console.error('プロジェクトIDが指定されていません');
            ErrorHandler.showErrorMessage('プロジェクトIDが指定されていません');
            window.location.href = 'index.html';
            return;
        }
        
        // プロジェクトデータを取得
        const project = DataManager.getProjectById(projectId);
        if (!project) {
            console.error('指定されたプロジェクトが見つかりません:', projectId);
            ErrorHandler.showErrorMessage('指定されたプロジェクトが見つかりません');
            window.location.href = 'index.html';
            return;
        }
        
        // プロジェクト情報を表示
        displayProjectInfo(project);
        
        // タブ機能の初期化
        initializeTabs();
        
        // イベントリスナーの設定
        setupProjectDetailEventListeners(projectId);
        
        console.log('プロジェクト詳細ページの初期化が完了しました');
    } catch (error) {
        console.error('プロジェクト詳細ページの初期化に失敗:', error);
        ErrorHandler.handleUnexpectedError(error, 'ページ初期化');
        window.location.href = 'index.html';
    }
}

// プロジェクト情報を表示
/**
 * ブレッドクラムのプロジェクト名を更新
 * @param {string} projectName - プロジェクト名
 */
function updateBreadcrumb(projectName) {
    const breadcrumbProjectName = document.getElementById('breadcrumb-project-name');
    if (breadcrumbProjectName && projectName) {
        breadcrumbProjectName.textContent = projectName;
        // ページタイトルも更新
        document.title = `${projectName} - 仕様駆動開発管理サイト`;
    }
}

function displayProjectInfo(project) {
    try {
        // ブレッドクラムを更新
        updateBreadcrumb(project.name);
        
        // プロジェクトタイトルを更新
        const projectTitle = document.getElementById('project-title');
        if (projectTitle) {
            projectTitle.textContent = project.name;
        }
        
        // プロジェクト情報コンテナを取得
        const projectInfoContainer = document.getElementById('project-info');
        if (!projectInfoContainer) {
            console.error('プロジェクト情報コンテナが見つかりません');
            return;
        }
        
        // プロジェクト情報のHTMLを生成
        const projectInfoHTML = `
            <div class="project-info-grid">
                <div class="info-item">
                    <label>プロジェクト名:</label>
                    <span class="info-value">${escapeHtml(project.name)}</span>
                </div>
                <div class="info-item">
                    <label>フレームワーク種別:</label>
                    <span class="info-value">${escapeHtml(project.framework)}</span>
                </div>
                <div class="info-item">
                    <label>日付:</label>
                    <span class="info-value">${formatDate(project.date)}</span>
                </div>
                <div class="info-item">
                    <label>担当者:</label>
                    <span class="info-value">${project.assignee ? escapeHtml(project.assignee) : '-'}</span>
                </div>
                <div class="info-item">
                    <label>作成日時:</label>
                    <span class="info-value">${formatDateTime(project.createdAt)}</span>
                </div>
                <div class="info-item">
                    <label>更新日時:</label>
                    <span class="info-value">${formatDateTime(project.updatedAt)}</span>
                </div>
            </div>
        `;
        
        projectInfoContainer.innerHTML = projectInfoHTML;
        
    } catch (error) {
        console.error('プロジェクト情報の表示中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'プロジェクト情報表示');
    }
}

// タブ機能の初期化
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabNavigation = document.querySelector('.tab-navigation');
    
    // タブインジケーターの位置を更新する関数
    function updateTabIndicator(activeButton) {
        if (!tabNavigation || !activeButton) return;
        
        const buttonRect = activeButton.getBoundingClientRect();
        const navRect = tabNavigation.getBoundingClientRect();
        const left = buttonRect.left - navRect.left;
        const width = buttonRect.width;
        
        // インジケーターの位置を更新
        const indicator = tabNavigation.querySelector('::after') || tabNavigation;
        if (indicator) {
            tabNavigation.style.setProperty('--indicator-left', `${left}px`);
            tabNavigation.style.setProperty('--indicator-width', `${width}px`);
        }
    }
    
    tabButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 現在アクティブなコンテンツを取得
            const currentActiveContent = document.querySelector('.tab-content.active');
            
            // すべてのタブボタンから active クラスを削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // クリックされたタブボタンに active クラスを追加
            this.classList.add('active');
            
            // タブインジケーターの位置を更新
            updateTabIndicator(this);
            
            // 現在のコンテンツをフェードアウト
            if (currentActiveContent) {
                currentActiveContent.classList.add('slide-out');
                
                setTimeout(() => {
                    // すべてのコンテンツから active クラスを削除
                    tabContents.forEach(content => {
                        content.classList.remove('active', 'slide-in', 'slide-out');
                    });
                    
                    // 新しいコンテンツを表示
                    const targetTabContent = document.getElementById(targetTab + '-tab');
                    if (targetTabContent) {
                        targetTabContent.classList.add('active', 'slide-in');
                        
                        // タブ切り替え時にコンテンツを更新
                        updateTabContent(targetTab);
                    }
                }, 150); // アニメーション時間の半分
            } else {
                // 初回表示の場合
                tabContents.forEach(content => content.classList.remove('active'));
                const targetTabContent = document.getElementById(targetTab + '-tab');
                if (targetTabContent) {
                    targetTabContent.classList.add('active');
                    updateTabContent(targetTab);
                }
            }
        });
        
        // キーボードナビゲーション対応
        button.addEventListener('keydown', function(e) {
            let newIndex = index;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    newIndex = index > 0 ? index - 1 : tabButtons.length - 1;
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    newIndex = index < tabButtons.length - 1 ? index + 1 : 0;
                    break;
                case 'Home':
                    e.preventDefault();
                    newIndex = 0;
                    break;
                case 'End':
                    e.preventDefault();
                    newIndex = tabButtons.length - 1;
                    break;
                default:
                    return;
            }
            
            tabButtons[newIndex].focus();
            tabButtons[newIndex].click();
        });
    });
    
    // 初期表示時にアクティブなタブのコンテンツを更新
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const targetTab = activeTab.getAttribute('data-tab');
        updateTabContent(targetTab);
        updateTabIndicator(activeTab);
    }
    
    // ウィンドウリサイズ時にインジケーターの位置を更新
    window.addEventListener('resize', () => {
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            updateTabIndicator(activeTab);
        }
    });
}

// タブコンテンツを更新
function updateTabContent(tabName) {
    try {
        // URLパラメータからプロジェクトIDを取得
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) {
            console.error('プロジェクトIDが取得できません');
            return;
        }
        
        switch (tabName) {
            case 'ci-results':
                loadCIResultsTab(projectId);
                break;
            case 'review-findings':
                loadReviewFindingsTab(projectId);
                break;
            case 'effect-metrics':
                loadEffectMetricsTab(projectId);
                break;
            default:
                console.warn('未知のタブ:', tabName);
        }
    } catch (error) {
        console.error('タブコンテンツの更新中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'タブコンテンツ更新');
    }
}

// CI結果タブを読み込み
function loadCIResultsTab(projectId) {
    try {
        const ciResults = DataManager.getCIResultsByProjectId(projectId);
        const container = document.getElementById('ci-results-container');
        
        if (!container) {
            console.error('CI結果コンテナが見つかりません');
            return;
        }
        
        if (ciResults.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>CI結果がまだ登録されていません</p>
                </div>
            `;
        } else {
            // CI結果テーブルを生成
            const tableHTML = generateCIResultsTable(ciResults);
            container.innerHTML = tableHTML;
        }
        
    } catch (error) {
        console.error('CI結果タブの読み込み中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'CI結果タブ読み込み');
    }
}

// レビュー指摘タブを読み込み
function loadReviewFindingsTab(projectId) {
    try {
        const reviewFindings = DataManager.getReviewFindingsByProjectId(projectId);
        const container = document.getElementById('review-findings-container');
        
        if (!container) {
            console.error('レビュー指摘コンテナが見つかりません');
            return;
        }
        
        if (reviewFindings.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>レビュー指摘がまだ登録されていません</p>
                </div>
            `;
        } else {
            // レビュー指摘テーブルを生成
            const tableHTML = generateReviewFindingsTable(reviewFindings);
            container.innerHTML = tableHTML;
            
            // ソートクラスを更新
            setTimeout(() => {
                updateSortClasses();
                setupTableScrollHandlers();
                
                // 仮想スクロールデータを更新（該当する場合）
                if (window.updateVirtualScrollData && reviewFindings.length > 100) {
                    let sortedFindings = [...reviewFindings];
                    if (window.currentSort && window.currentSort.column) {
                        sortedFindings = sortReviewFindings(sortedFindings, window.currentSort.column, window.currentSort.direction);
                    } else {
                        sortedFindings = sortedFindings.sort((a, b) => 
                            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                        );
                    }
                    window.updateVirtualScrollData(sortedFindings);
                }
            }, 0);
        }
        
        // フィルタコントロールを初期化
        initializeFilterControls();
        
    } catch (error) {
        console.error('レビュー指摘タブの読み込み中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'レビュー指摘タブ読み込み');
    }
}

// 効果メトリクスタブを読み込み
function loadEffectMetricsTab(projectId) {
    try {
        const project = DataManager.getProjectById(projectId);
        const container = document.getElementById('effect-metrics-container');
        
        if (!container) {
            console.error('効果メトリクスコンテナが見つかりません');
            return;
        }
        
        if (!project || !project.effectMetrics || isEffectMetricsEmpty(project.effectMetrics)) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>効果メトリクスがまだ登録されていません</p>
                    <button class="btn btn-primary mt-2" onclick="showEditEffectMetricsModal('${projectId}')">効果メトリクスを追加</button>
                </div>
            `;
        } else {
            // 効果メトリクス表示を生成
            const metricsHTML = generateEffectMetricsDisplay(project.effectMetrics);
            container.innerHTML = metricsHTML;
        }
        
    } catch (error) {
        console.error('効果メトリクスタブの読み込み中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, '効果メトリクスタブ読み込み');
    }
}

// CI結果テーブルを生成
function generateCIResultsTable(ciResults) {
    // タイムスタンプでソート（新しい順）
    const sortedResults = ciResults.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let tableHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>実行日時</th>
                    <th>ステータス</th>
                    <th>Lint結果</th>
                    <th>契約テスト結果</th>
                    <th>カバレッジ率</th>
                    <th>SBOMステータス</th>
                    <th>ログURL</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedResults.forEach(result => {
        tableHTML += `
            <tr>
                <td>${formatDateTime(result.timestamp)}</td>
                <td><span class="ci-status ci-status-${result.status}">${result.status === 'pass' ? '成功' : '失敗'}</span></td>
                <td>${formatLintResult(result.lintResult)}</td>
                <td>${formatContractTestResult(result.contractTestResult)}</td>
                <td>${formatCoverageResult(result.coverage)}</td>
                <td>${formatSBOMStatus(result.sbomStatus)}</td>
                <td>${formatLogUrl(result.logUrl)}</td>
                <td>
                    <button class="btn btn-danger btn-small" onclick="deleteCIResult('${result.timestamp}')">削除</button>
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    return tableHTML;
}

// レビュー指摘テーブルを生成（仮想スクロール対応）
function generateReviewFindingsTable(reviewFindings) {
    // 現在のソート設定を適用
    let sortedFindings = [...reviewFindings];
    if (window.currentSort && window.currentSort.column) {
        sortedFindings = sortReviewFindings(sortedFindings, window.currentSort.column, window.currentSort.direction);
    } else {
        // デフォルトはタイムスタンプでソート（新しい順）
        sortedFindings = sortedFindings.sort((a, b) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
    }
    
    // 大量データの場合は仮想スクロールを使用
    const VIRTUAL_SCROLL_THRESHOLD = 100;
    if (sortedFindings.length > VIRTUAL_SCROLL_THRESHOLD) {
        return generateVirtualScrollTable(sortedFindings);
    }
    
    // 通常のテーブル生成
    let tableHTML = `
        <table class="data-table review-findings-table">
            <thead>
                <tr>
                    <th class="sortable" data-column="timestamp">
                        日時 ${getSortIcon('timestamp')}
                    </th>
                    <th class="sortable" data-column="process">
                        プロセス ${getSortIcon('process')}
                    </th>
                    <th class="sortable" data-column="docType">
                        ドキュメント種別 ${getSortIcon('docType')}
                    </th>
                    <th class="sortable" data-column="category">
                        カテゴリ ${getSortIcon('category')}
                    </th>
                    <th class="sortable" data-column="rootCause">
                        根本原因 ${getSortIcon('rootCause')}
                    </th>
                    <th class="sortable" data-column="severity">
                        重要度 ${getSortIcon('severity')}
                    </th>
                    <th class="sortable" data-column="status">
                        ステータス ${getSortIcon('status')}
                    </th>
                    <th>内容</th>
                    <th>ファイル</th>
                    <th>レビュアー</th>
                    <th>担当者</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    sortedFindings.forEach(finding => {
        tableHTML += generateTableRow(finding);
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    return tableHTML;
}

// テーブル行を生成
function generateTableRow(finding) {
    return `
        <tr>
            <td>${formatDateTime(finding.timestamp)}</td>
            <td>${escapeHtml(finding.process)}</td>
            <td>${escapeHtml(finding.docType)}</td>
            <td>${escapeHtml(finding.category)}</td>
            <td>${escapeHtml(finding.rootCause)}</td>
            <td><span class="severity-${finding.severity}">${escapeHtml(finding.severity)}</span></td>
            <td><span class="status-${finding.status.toLowerCase()}">${escapeHtml(finding.status)}</span></td>
            <td class="description-cell" title="${escapeHtml(finding.description)}">${escapeHtml(finding.description)}</td>
            <td>${formatDocRef(finding.docRef)}</td>
            <td>${finding.reviewer ? escapeHtml(finding.reviewer) : '-'}</td>
            <td>${finding.assignee ? escapeHtml(finding.assignee) : '-'}</td>
            <td class="action-buttons">
                <button class="btn btn-primary btn-small" onclick="editReviewFinding('${finding.id}')">編集</button>
                <button class="btn btn-danger btn-small" onclick="deleteReviewFinding('${finding.id}')">削除</button>
            </td>
        </tr>
    `;
}

// 仮想スクロールテーブルを生成
function generateVirtualScrollTable(sortedFindings) {
    const ROW_HEIGHT = 60; // 行の高さ（px）
    const VISIBLE_ROWS = 20; // 表示する行数
    const BUFFER_ROWS = 5; // バッファ行数
    
    // 仮想スクロールコンテナを作成
    const virtualScrollHTML = `
        <div class="virtual-scroll-container" style="height: ${VISIBLE_ROWS * ROW_HEIGHT}px; overflow-y: auto; position: relative;">
            <div class="virtual-scroll-spacer" style="height: ${sortedFindings.length * ROW_HEIGHT}px; position: relative;">
                <table class="data-table review-findings-table virtual-scroll-table" style="position: absolute; top: 0; width: 100%;">
                    <thead style="position: sticky; top: 0; z-index: 10;">
                        <tr>
                            <th class="sortable" data-column="timestamp">
                                日時 ${getSortIcon('timestamp')}
                            </th>
                            <th class="sortable" data-column="process">
                                プロセス ${getSortIcon('process')}
                            </th>
                            <th class="sortable" data-column="docType">
                                ドキュメント種別 ${getSortIcon('docType')}
                            </th>
                            <th class="sortable" data-column="category">
                                カテゴリ ${getSortIcon('category')}
                            </th>
                            <th class="sortable" data-column="rootCause">
                                根本原因 ${getSortIcon('rootCause')}
                            </th>
                            <th class="sortable" data-column="severity">
                                重要度 ${getSortIcon('severity')}
                            </th>
                            <th class="sortable" data-column="status">
                                ステータス ${getSortIcon('status')}
                            </th>
                            <th>内容</th>
                            <th>ファイル</th>
                            <th>レビュアー</th>
                            <th>担当者</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody class="virtual-scroll-tbody">
                    </tbody>
                </table>
            </div>
        </div>
        <div class="virtual-scroll-info">
            <small class="text-secondary">
                ${sortedFindings.length}件中 最大${VISIBLE_ROWS}件を表示（仮想スクロール）
            </small>
        </div>
    `;
    
    // 仮想スクロールの初期化を遅延実行
    setTimeout(() => {
        initializeVirtualScroll(sortedFindings, ROW_HEIGHT, VISIBLE_ROWS, BUFFER_ROWS);
    }, 0);
    
    return virtualScrollHTML;
}

// 仮想スクロールを初期化
function initializeVirtualScroll(data, rowHeight, visibleRows, bufferRows) {
    try {
        const container = document.querySelector('.virtual-scroll-container');
        const tbody = document.querySelector('.virtual-scroll-tbody');
        const table = document.querySelector('.virtual-scroll-table');
        
        if (!container || !tbody || !table) return;
        
        let startIndex = 0;
        let endIndex = Math.min(visibleRows + bufferRows, data.length);
        
        function updateVisibleRows() {
            const scrollTop = container.scrollTop;
            const newStartIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
            const newEndIndex = Math.min(data.length, newStartIndex + visibleRows + (bufferRows * 2));
            
            if (newStartIndex !== startIndex || newEndIndex !== endIndex) {
                startIndex = newStartIndex;
                endIndex = newEndIndex;
                
                // テーブル位置を調整
                table.style.top = `${startIndex * rowHeight}px`;
                
                // 表示行を更新
                let rowsHTML = '';
                for (let i = startIndex; i < endIndex; i++) {
                    if (data[i]) {
                        rowsHTML += generateTableRow(data[i]);
                    }
                }
                tbody.innerHTML = rowsHTML;
            }
        }
        
        // 初期表示
        updateVisibleRows();
        
        // スクロールイベントリスナー
        container.addEventListener('scroll', updateVisibleRows);
        
        // データ更新用の関数をグローバルに保存
        window.updateVirtualScrollData = function(newData) {
            data = newData;
            const spacer = document.querySelector('.virtual-scroll-spacer');
            if (spacer) {
                spacer.style.height = `${data.length * rowHeight}px`;
            }
            updateVisibleRows();
        };
        
    } catch (error) {
        console.error('仮想スクロール初期化中にエラーが発生:', error);
    }
}

// レビュー指摘のソート機能
function sortReviewFindings(findings, column, direction) {
    return findings.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        // 日時の場合は Date オブジェクトに変換
        if (column === 'timestamp') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        // 文字列の場合は小文字で比較
        if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }
        
        let result = 0;
        if (aValue < bValue) result = -1;
        else if (aValue > bValue) result = 1;
        
        return direction === 'desc' ? -result : result;
    });
}

// ソートアイコンを取得
function getSortIcon(column) {
    if (!window.currentSort || window.currentSort.column !== column) {
        return '<span class="sort-icon">↕</span>';
    }
    return window.currentSort.direction === 'asc' 
        ? '<span class="sort-icon">↑</span>' 
        : '<span class="sort-icon">↓</span>';
}

// テーブルヘッダーのソートクラスを更新
function updateSortClasses() {
    try {
        // すべてのソート可能なヘッダーからソートクラスを削除
        const sortableHeaders = document.querySelectorAll('.data-table th.sortable');
        sortableHeaders.forEach(header => {
            header.classList.remove('sort-asc', 'sort-desc');
        });
        
        // 現在のソート列にクラスを追加
        if (window.currentSort && window.currentSort.column) {
            const currentHeader = document.querySelector(
                `.data-table th.sortable[data-column="${window.currentSort.column}"]`
            );
            if (currentHeader) {
                const sortClass = window.currentSort.direction === 'asc' ? 'sort-asc' : 'sort-desc';
                currentHeader.classList.add(sortClass);
            }
        }
    } catch (error) {
        console.error('ソートクラス更新中にエラーが発生:', error);
    }
}

// テーブルのスクロール状態を管理
function setupTableScrollHandlers() {
    try {
        const tableContainers = document.querySelectorAll('.table-container');
        
        tableContainers.forEach(container => {
            // スクロール可能かどうかを判定
            function updateScrollState() {
                const isScrollable = container.scrollWidth > container.clientWidth;
                const isAtEnd = container.scrollLeft >= (container.scrollWidth - container.clientWidth - 5);
                
                container.classList.toggle('scrollable', isScrollable);
                container.classList.toggle('scrolled-end', isAtEnd);
            }
            
            // 初期状態を設定
            updateScrollState();
            
            // スクロールイベントリスナーを追加
            container.addEventListener('scroll', updateScrollState);
            
            // リサイズイベントリスナーを追加
            window.addEventListener('resize', updateScrollState);
        });
    } catch (error) {
        console.error('テーブルスクロールハンドラー設定中にエラーが発生:', error);
    }
}

// テキストを切り詰める
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// 効果メトリクスが空かどうかを判定
function isEffectMetricsEmpty(effectMetrics) {
    if (!effectMetrics || typeof effectMetrics !== 'object') {
        return true;
    }
    
    // すべてのセクションが空または未定義かチェック
    const hasEfficiency = effectMetrics.efficiency && 
        (effectMetrics.efficiency.taskCompletionRate !== undefined || 
         effectMetrics.efficiency.avgTaskDurationHours !== undefined);
    
    const hasQuality = effectMetrics.quality && 
        (effectMetrics.quality.preImplFindingsCount !== undefined || 
         effectMetrics.quality.postImplFindingsCount !== undefined ||
         effectMetrics.quality.highSeverityCount !== undefined ||
         effectMetrics.quality.ciSuccessRate !== undefined);
    
    const hasHumanEffort = effectMetrics.humanEffort && 
        (effectMetrics.humanEffort.manualFixCount !== undefined || 
         effectMetrics.humanEffort.reviewEffortHours !== undefined);
    
    const hasHandoffAccuracy = effectMetrics.handoffAccuracy && 
        (effectMetrics.handoffAccuracy.requirementsChangeCount !== undefined || 
         effectMetrics.handoffAccuracy.designChangeCount !== undefined ||
         effectMetrics.handoffAccuracy.specAmbiguityCount !== undefined);
    
    const hasComments = effectMetrics.comments && effectMetrics.comments.trim() !== '';
    
    return !hasEfficiency && !hasQuality && !hasHumanEffort && !hasHandoffAccuracy && !hasComments;
}

// 効果メトリクス表示を生成
function generateEffectMetricsDisplay(effectMetrics) {
    let html = '<div class="effect-metrics-display">';
    
    // 効率性指標
    if (effectMetrics.efficiency) {
        html += `
            <div class="metrics-section">
                <h4>効率性指標</h4>
                <div class="metrics-grid">
        `;
        if (effectMetrics.efficiency.taskCompletionRate !== undefined) {
            html += `<div class="metric-item">
                <label>タスク完了率:</label>
                <span class="metric-value">${formatPercentage(effectMetrics.efficiency.taskCompletionRate)}</span>
            </div>`;
        }
        if (effectMetrics.efficiency.avgTaskDurationHours !== undefined) {
            html += `<div class="metric-item">
                <label>平均タスク所要時間:</label>
                <span class="metric-value">${formatHours(effectMetrics.efficiency.avgTaskDurationHours)}</span>
            </div>`;
        }
        html += '</div></div>';
    }
    
    // 品質指標
    if (effectMetrics.quality) {
        html += `
            <div class="metrics-section">
                <h4>品質指標</h4>
                <div class="metrics-grid">
        `;
        if (effectMetrics.quality.preImplFindingsCount !== undefined) {
            html += `<div class="metric-item">
                <label>実装前レビュー指摘数:</label>
                <span class="metric-value">${formatNumber(effectMetrics.quality.preImplFindingsCount)}</span>
            </div>`;
        }
        if (effectMetrics.quality.postImplFindingsCount !== undefined) {
            html += `<div class="metric-item">
                <label>実装後レビュー指摘数:</label>
                <span class="metric-value">${formatNumber(effectMetrics.quality.postImplFindingsCount)}</span>
            </div>`;
        }
        if (effectMetrics.quality.highSeverityCount !== undefined) {
            html += `<div class="metric-item">
                <label>重大度Highの指摘数:</label>
                <span class="metric-value">${formatNumber(effectMetrics.quality.highSeverityCount)}</span>
            </div>`;
        }
        if (effectMetrics.quality.ciSuccessRate !== undefined) {
            html += `<div class="metric-item">
                <label>CI成功率:</label>
                <span class="metric-value">${formatPercentage(effectMetrics.quality.ciSuccessRate)}</span>
            </div>`;
        }
        html += '</div></div>';
    }
    
    // 人間の手間指標
    if (effectMetrics.humanEffort) {
        html += `
            <div class="metrics-section">
                <h4>人間の手間指標</h4>
                <div class="metrics-grid">
        `;
        if (effectMetrics.humanEffort.manualFixCount !== undefined) {
            html += `<div class="metric-item">
                <label>手動修正回数:</label>
                <span class="metric-value">${formatNumber(effectMetrics.humanEffort.manualFixCount)}</span>
            </div>`;
        }
        if (effectMetrics.humanEffort.reviewEffortHours !== undefined) {
            html += `<div class="metric-item">
                <label>レビュー工数:</label>
                <span class="metric-value">${formatHours(effectMetrics.humanEffort.reviewEffortHours)}</span>
            </div>`;
        }
        html += '</div></div>';
    }
    
    // 引継ぎ正確性指標
    if (effectMetrics.handoffAccuracy) {
        html += `
            <div class="metrics-section">
                <h4>引継ぎ正確性指標</h4>
                <div class="metrics-grid">
        `;
        if (effectMetrics.handoffAccuracy.requirementsChangeCount !== undefined) {
            html += `<div class="metric-item">
                <label>要件変更回数:</label>
                <span class="metric-value">${formatNumber(effectMetrics.handoffAccuracy.requirementsChangeCount)}</span>
            </div>`;
        }
        if (effectMetrics.handoffAccuracy.designChangeCount !== undefined) {
            html += `<div class="metric-item">
                <label>設計変更回数:</label>
                <span class="metric-value">${formatNumber(effectMetrics.handoffAccuracy.designChangeCount)}</span>
            </div>`;
        }
        if (effectMetrics.handoffAccuracy.specAmbiguityCount !== undefined) {
            html += `<div class="metric-item">
                <label>実装時の仕様不明点数:</label>
                <span class="metric-value">${formatNumber(effectMetrics.handoffAccuracy.specAmbiguityCount)}</span>
            </div>`;
        }
        html += '</div></div>';
    }
    
    // コメント
    if (effectMetrics.comments) {
        html += `
            <div class="metrics-section">
                <h4>コメント</h4>
                <div class="comments-display">
                    <p>${escapeHtml(effectMetrics.comments)}</p>
                </div>
            </div>
        `;
    }
    
    html += '</div>';
    return html;
}



// 空状態の表示
function showEmptyState() {
    const emptyState = document.getElementById('empty-state');
    const projectGrid = document.getElementById('project-grid');
    const tableContainer = document.getElementById('project-table-container');
    
    if (emptyState) {
        emptyState.style.display = 'block';
    }
    if (projectGrid) {
        projectGrid.style.display = 'none';
    }
    if (tableContainer) {
        tableContainer.style.display = 'none';
    }
}

// プロジェクト一覧の表示
function showProjectList() {
    const emptyState = document.getElementById('empty-state');
    const projectGrid = document.getElementById('project-grid');
    const tableContainer = document.getElementById('project-table-container');
    
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    if (projectGrid) {
        projectGrid.style.display = 'grid';
    }
    if (tableContainer) {
        tableContainer.style.display = 'none';
    }
}

// プロジェクト一覧を読み込んで表示
function loadAndDisplayProjects() {
    try {
        const projects = DataManager.getAllProjects();
        
        if (projects.length === 0) {
            showEmptyState();
            return;
        }
        
        // プロジェクト一覧カードグリッドを表示
        showProjectList();
        renderProjectCards(projects);
        
    } catch (error) {
        console.error('プロジェクト一覧の読み込みに失敗:', error);
        ErrorHandler.handleUnexpectedError(error, 'プロジェクト一覧の読み込み');
        showEmptyState();
    }
}

// プロジェクト一覧カードをレンダリング
function renderProjectCards(projects) {
    const projectGrid = document.getElementById('project-grid');
    if (!projectGrid) {
        console.error('プロジェクトグリッド要素が見つかりません');
        return;
    }
    
    // グリッドをクリア
    projectGrid.innerHTML = '';
    
    // 各プロジェクトのカードを作成
    projects.forEach(project => {
        const card = createProjectCard(project);
        projectGrid.appendChild(card);
    });
}

// プロジェクトカードを作成
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'card project-card';
    card.setAttribute('data-project-id', project.id);
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    
    // CIステータスを取得
    const ciStatus = DataManager.getLatestCIStatusByProjectId(project.id);
    
    // アクセシビリティ情報を構築
    const ciStatusText = ciStatus ? (ciStatus === 'pass' ? '成功' : '失敗') : '不明';
    const reviewCount = DataManager.getReviewFindingCountByProjectId(project.id);
    const taskCompletion = project.effectMetrics?.efficiency?.taskCompletionRate;
    const taskCompletionText = taskCompletion !== undefined ? `${taskCompletion}%` : '不明';
    
    const ariaLabel = `プロジェクト ${project.name}、フレームワーク ${project.framework}、CIステータス ${ciStatusText}、レビュー指摘数 ${reviewCount}件、タスク完了率 ${taskCompletionText}。クリックまたはEnterキーで詳細を表示`;
    card.setAttribute('aria-label', ariaLabel);
    
    // カードヘッダー
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    const titleContainer = document.createElement('div');
    
    const projectName = document.createElement('h3');
    projectName.className = 'card-title project-name';
    projectName.textContent = project.name;
    titleContainer.appendChild(projectName);
    
    const projectFramework = document.createElement('p');
    projectFramework.className = 'card-subtitle project-framework';
    projectFramework.textContent = project.framework;
    titleContainer.appendChild(projectFramework);
    
    cardHeader.appendChild(titleContainer);
    
    // CIステータスバッジ
    if (ciStatus) {
        const statusBadge = document.createElement('span');
        statusBadge.className = `badge ci-status ci-status-${ciStatus}`;
        statusBadge.textContent = ciStatus === 'pass' ? '成功' : '失敗';
        statusBadge.setAttribute('aria-label', `CIステータス: ${ciStatus === 'pass' ? '成功' : '失敗'}`);
        cardHeader.appendChild(statusBadge);
    }
    
    card.appendChild(cardHeader);
    
    // カードコンテンツ - プロジェクトメタ情報
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content project-meta';
    
    // 日付
    const dateRow = document.createElement('div');
    dateRow.className = 'meta-row';
    const dateLabel = document.createElement('span');
    dateLabel.className = 'meta-label';
    dateLabel.textContent = '日付:';
    const dateValue = document.createElement('span');
    dateValue.className = 'meta-value';
    dateValue.textContent = formatDate(project.date);
    dateRow.appendChild(dateLabel);
    dateRow.appendChild(dateValue);
    cardContent.appendChild(dateRow);
    
    // レビュー指摘数
    const reviewCountRow = document.createElement('div');
    reviewCountRow.className = 'meta-row';
    const reviewLabel = document.createElement('span');
    reviewLabel.className = 'meta-label';
    reviewLabel.textContent = 'レビュー指摘数:';
    const reviewValue = document.createElement('span');
    reviewValue.className = 'meta-value';
    reviewValue.textContent = formatNumber(reviewCount);
    reviewCountRow.appendChild(reviewLabel);
    reviewCountRow.appendChild(reviewValue);
    cardContent.appendChild(reviewCountRow);
    
    // タスク完了率
    const taskCompletionRow = document.createElement('div');
    taskCompletionRow.className = 'meta-row';
    const taskLabel = document.createElement('span');
    taskLabel.className = 'meta-label';
    taskLabel.textContent = 'タスク完了率:';
    const taskValue = document.createElement('span');
    taskValue.className = 'meta-value';
    if (project.effectMetrics && project.effectMetrics.efficiency && 
        project.effectMetrics.efficiency.taskCompletionRate !== undefined) {
        taskValue.textContent = formatPercentage(project.effectMetrics.efficiency.taskCompletionRate);
    } else {
        taskValue.textContent = '-';
    }
    taskCompletionRow.appendChild(taskLabel);
    taskCompletionRow.appendChild(taskValue);
    cardContent.appendChild(taskCompletionRow);
    
    card.appendChild(cardContent);
    
    // カードフッター - アクションボタン
    const cardFooter = document.createElement('div');
    cardFooter.className = 'card-footer';
    
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'project-actions';
    
    const detailButton = document.createElement('button');
    detailButton.className = 'btn btn-small btn-primary';
    detailButton.textContent = '詳細表示';
    detailButton.setAttribute('aria-label', `${project.name}の詳細を表示`);
    detailButton.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToProjectDetail(project.id);
    });
    actionsContainer.appendChild(detailButton);
    
    cardFooter.appendChild(actionsContainer);
    card.appendChild(cardFooter);
    
    // カードクリックで詳細ページへ遷移
    const handleCardClick = (e) => {
        // ボタンクリックの場合は無視
        if (e.target.closest('.btn')) {
            return;
        }
        
        // リップル効果を追加
        addRippleEffect(card, e);
        
        // 少し遅延してから遷移（リップル効果を見せるため）
        setTimeout(() => {
            navigateToProjectDetail(project.id);
        }, 150);
    };
    
    card.addEventListener('click', handleCardClick);
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            // キーボード操作の場合は即座に遷移
            navigateToProjectDetail(project.id);
        }
    });
    
    return card;
}

// プロジェクトテーブルの行を作成
function createProjectTableRow(project) {
    const row = document.createElement('tr');
    row.className = 'project-row';
    row.setAttribute('data-project-id', project.id);
    
    // プロジェクト名
    const nameCell = document.createElement('td');
    nameCell.className = 'project-name';
    nameCell.textContent = project.name;
    nameCell.style.cursor = 'pointer';
    nameCell.title = 'クリックして詳細を表示';
    row.appendChild(nameCell);
    
    // フレームワーク種別
    const frameworkCell = document.createElement('td');
    frameworkCell.textContent = project.framework;
    row.appendChild(frameworkCell);
    
    // 日付
    const dateCell = document.createElement('td');
    dateCell.textContent = formatDate(project.date);
    row.appendChild(dateCell);
    
    // CIステータス
    const ciStatusCell = document.createElement('td');
    const tableCiStatus = DataManager.getLatestCIStatusByProjectId(project.id);
    if (tableCiStatus) {
        const statusSpan = document.createElement('span');
        statusSpan.className = `ci-status ci-status-${tableCiStatus}`;
        statusSpan.textContent = tableCiStatus === 'pass' ? '成功' : '失敗';
        ciStatusCell.appendChild(statusSpan);
    } else {
        ciStatusCell.textContent = '-';
    }
    row.appendChild(ciStatusCell);
    
    // レビュー指摘数
    const reviewCountCell = document.createElement('td');
    const projectReviewCount = DataManager.getReviewFindingCountByProjectId(project.id);
    reviewCountCell.textContent = formatNumber(projectReviewCount);
    row.appendChild(reviewCountCell);
    
    // タスク完了率
    const taskCompletionCell = document.createElement('td');
    if (project.effectMetrics && project.effectMetrics.efficiency && 
        project.effectMetrics.efficiency.taskCompletionRate !== undefined) {
        taskCompletionCell.textContent = formatPercentage(project.effectMetrics.efficiency.taskCompletionRate);
    } else {
        taskCompletionCell.textContent = '-';
    }
    row.appendChild(taskCompletionCell);
    
    // 操作列
    const actionsCell = document.createElement('td');
    actionsCell.className = 'actions';
    
    // 詳細ボタン
    const detailButton = document.createElement('button');
    detailButton.className = 'btn btn-small btn-primary';
    detailButton.textContent = '詳細';
    detailButton.addEventListener('click', (e) => {
        e.stopPropagation();
        navigateToProjectDetail(project.id);
    });
    actionsCell.appendChild(detailButton);
    
    row.appendChild(actionsCell);
    
    // 行クリックで詳細ページへ遷移
    row.addEventListener('click', () => {
        navigateToProjectDetail(project.id);
    });
    
    return row;
}

// プロジェクト詳細ページへ遷移
function navigateToProjectDetail(projectId) {
    if (!projectId) {
        console.error('プロジェクトIDが指定されていません');
        return;
    }
    
    window.location.href = `project-detail.html?id=${encodeURIComponent(projectId)}`;
}

// プロジェクト一覧ページのイベントリスナーを設定
function setupProjectListEventListeners() {
    console.log('setupProjectListEventListeners: 開始');
    
    // プロジェクト追加ボタン
    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) {
        console.log('プロジェクト追加ボタンが見つかりました');
        addProjectBtn.addEventListener('click', () => {
            console.log('プロジェクト追加ボタンがクリックされました');
            showModal('add-project-modal');
        });
    } else {
        console.error('プロジェクト追加ボタンが見つかりません: add-project-btn');
    }
    
    // データエクスポートボタン
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        console.log('データエクスポートボタンが見つかりました');
        exportDataBtn.addEventListener('click', () => {
            console.log('データエクスポートボタンがクリックされました');
            exportData();
        });
    } else {
        console.error('データエクスポートボタンが見つかりません: export-data-btn');
    }
    
    // モバイル版プロジェクト追加ボタン
    const mobileAddProjectBtn = document.getElementById('mobile-add-project-btn');
    if (mobileAddProjectBtn) {
        console.log('モバイル版プロジェクト追加ボタンが見つかりました');
        mobileAddProjectBtn.addEventListener('click', () => {
            console.log('モバイル版プロジェクト追加ボタンがクリックされました');
            showModal('add-project-modal');
        });
    } else {
        console.error('モバイル版プロジェクト追加ボタンが見つかりません: mobile-add-project-btn');
    }
    
    // モバイル版データエクスポートボタン
    const mobileExportDataBtn = document.getElementById('mobile-export-data-btn');
    if (mobileExportDataBtn) {
        console.log('モバイル版データエクスポートボタンが見つかりました');
        mobileExportDataBtn.addEventListener('click', () => {
            console.log('モバイル版データエクスポートボタンがクリックされました');
            exportData();
        });
    } else {
        console.error('モバイル版データエクスポートボタンが見つかりません: mobile-export-data-btn');
    }
    
    // プロジェクト追加フォーム
    const addProjectForm = document.getElementById('add-project-form');
    if (addProjectForm) {
        console.log('プロジェクト追加フォームが見つかりました');
        addProjectForm.addEventListener('submit', handleAddProjectSubmit);
    } else {
        console.error('プロジェクト追加フォームが見つかりません: add-project-form');
    }
    
    // プロジェクト追加モーダルのキャンセルボタン
    const cancelAddProjectBtn = document.getElementById('cancel-add-project');
    if (cancelAddProjectBtn) {
        console.log('キャンセルボタンが見つかりました');
        cancelAddProjectBtn.addEventListener('click', () => {
            console.log('キャンセルボタンがクリックされました');
            hideModal('add-project-modal');
            resetAddProjectForm();
        });
    } else {
        console.error('キャンセルボタンが見つかりません: cancel-add-project');
    }
    
    console.log('setupProjectListEventListeners: 完了');
}

// ========================================
// UI ヘルパー関数 - モーダル表示・非表示機能
// ========================================

/**
 * モーダルを表示する
 * @param {string} modalId - 表示するモーダルのID
 * @returns {boolean} 表示成功フラグ
 */
function showModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`モーダルが見つかりません: ${modalId}`);
            return false;
        }

        // モーダルを表示
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // AnimationControllerを使用してフェードイン
        const controller = getAnimationController();
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent && controller.isAnimationEnabled()) {
            controller.scaleIn(modalContent, 300);
        }
        
        // AccessibilityManagerを使用してフォーカストラップを設定
        const accessibilityManager = getAccessibilityManager();
        accessibilityManager.trapFocus(modal);
        
        // スクリーンリーダーにモーダル表示をアナウンス
        const modalTitle = modal.querySelector('.modal-header h3');
        if (modalTitle) {
            accessibilityManager.announceToScreenReader(`モーダルダイアログが開きました: ${modalTitle.textContent}`);
        }

        // モーダル外クリックで閉じる機能
        const handleBackdropClick = function(e) {
            if (e.target === modal) {
                hideModal(modalId);
            }
        };
        
        // 既存のイベントリスナーを削除してから新しいものを追加
        modal.removeEventListener('click', handleBackdropClick);
        modal.addEventListener('click', handleBackdropClick);
        
        // ESCキーで閉じる機能
        const handleEscapeKey = function(e) {
            if (e.key === 'Escape') {
                hideModal(modalId);
            }
        };
        
        // ESCキーイベントリスナーを追加
        document.removeEventListener('keydown', handleEscapeKey);
        document.addEventListener('keydown', handleEscapeKey);
        
        // 閉じるボタンのイベントリスナー
        const closeButtons = modal.querySelectorAll('.modal-close');
        closeButtons.forEach(button => {
            const handleCloseClick = () => hideModal(modalId);
            button.removeEventListener('click', handleCloseClick);
            button.addEventListener('click', handleCloseClick);
        });

        console.log(`モーダルを表示しました: ${modalId}`);
        return true;
    } catch (error) {
        console.error(`モーダル表示中にエラーが発生: ${modalId}`, error);
        return false;
    }
}

/**
 * モーダルを非表示にする
 * @param {string} modalId - 非表示にするモーダルのID
 * @returns {boolean} 非表示成功フラグ
 */
function hideModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`モーダルが見つかりません: ${modalId}`);
            return false;
        }

        // AccessibilityManagerを使用してフォーカストラップを解除
        const accessibilityManager = getAccessibilityManager();
        accessibilityManager.releaseFocusTrap();
        
        // AnimationControllerを使用してフェードアウト
        const controller = getAnimationController();
        const modalContent = modal.querySelector('.modal-content');
        
        if (modalContent && controller.isAnimationEnabled()) {
            // アニメーション後にモーダルを非表示
            controller.fadeOut(modalContent, 200).then(() => {
                modal.style.display = 'none';
                modal.setAttribute('aria-hidden', 'true');
            });
        } else {
            // アニメーション無効時は即座に非表示
            modal.style.display = 'none';
            modal.setAttribute('aria-hidden', 'true');
        }
        
        // スクリーンリーダーにモーダル閉じるをアナウンス
        accessibilityManager.announceToScreenReader('モーダルダイアログが閉じられました');

        // ESCキーイベントリスナーを削除
        const handleEscapeKey = function(e) {
            if (e.key === 'Escape') {
                hideModal(modalId);
            }
        };
        document.removeEventListener('keydown', handleEscapeKey);

        console.log(`モーダルを非表示にしました: ${modalId}`);
        return true;
    } catch (error) {
        console.error(`モーダル非表示中にエラーが発生: ${modalId}`, error);
        return false;
    }
}

// ========================================
// UI ヘルパー関数 - メッセージ表示機能
// ========================================

/**
 * メッセージを表示する（自動消去機能付き）
 * @param {string} message - 表示するメッセージ
 * @param {string} type - メッセージタイプ ('success', 'error', 'warning', 'info')
 * @param {number} duration - 表示時間（ミリ秒、デフォルト: 3000）
 * @returns {boolean} 表示成功フラグ
 */
function showMessage(message, type = 'success', duration = 3000) {
    try {
        const messageContainer = document.getElementById('message-container');
        if (!messageContainer) {
            console.error('メッセージコンテナが見つかりません');
            return false;
        }

        // 入力値の検証
        if (!message || typeof message !== 'string') {
            console.error('有効なメッセージが指定されていません');
            return false;
        }

        if (!['success', 'error', 'warning', 'info'].includes(type)) {
            console.warn(`無効なメッセージタイプ: ${type}、デフォルトの 'success' を使用します`);
            type = 'success';
        }

        // メッセージ要素を作成
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.setAttribute('role', 'alert');
        messageElement.setAttribute('aria-live', 'polite');
        
        // メッセージテキストを設定（XSS対策でtextContentを使用）
        messageElement.textContent = message;
        
        // 閉じるボタンを追加
        const closeButton = document.createElement('button');
        closeButton.className = 'message-close';
        closeButton.innerHTML = '&times;';
        closeButton.setAttribute('aria-label', 'メッセージを閉じる');
        closeButton.addEventListener('click', () => {
            removeMessage(messageElement);
        });
        
        messageElement.appendChild(closeButton);
        
        // メッセージコンテナに追加
        messageContainer.appendChild(messageElement);
        
        // AnimationControllerを使用してスライドイン
        const controller = getAnimationController();
        if (controller.isAnimationEnabled()) {
            controller.slideIn(messageElement, 'down', 300);
        }
        
        // AccessibilityManagerを使用してスクリーンリーダーにアナウンス
        const accessibilityManager = getAccessibilityManager();
        const priority = type === 'error' ? 'assertive' : 'polite';
        accessibilityManager.announceToScreenReader(message, priority);

        // 指定時間後に自動削除
        if (duration > 0) {
            setTimeout(() => {
                removeMessage(messageElement);
            }, duration);
        }

        console.log(`メッセージを表示しました: ${type} - ${message}`);
        return true;
    } catch (error) {
        console.error('メッセージ表示中にエラーが発生:', error);
        return false;
    }
}

/**
 * メッセージ要素を削除する（アニメーション付き）
 * @param {HTMLElement} messageElement - 削除するメッセージ要素
 */
function removeMessage(messageElement) {
    try {
        if (!messageElement || !messageElement.parentNode) {
            return;
        }

        // AnimationControllerを使用してフェードアウト
        const controller = getAnimationController();
        if (controller.isAnimationEnabled()) {
            controller.fadeOut(messageElement, 300).then(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            });
        } else {
            // アニメーション無効時は即座に削除
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }
    } catch (error) {
        console.error('メッセージ削除中にエラーが発生:', error);
    }
}

/**
 * エラーメッセージを表示する
 * @param {string} message - エラーメッセージ
 * @param {number} duration - 表示時間（ミリ秒、デフォルト: 5000）
 * @returns {boolean} 表示成功フラグ
 */
function showError(message, duration = 5000) {
    return showMessage(message, 'error', duration);
}

/**
 * 成功メッセージを表示する
 * @param {string} message - 成功メッセージ
 * @param {number} duration - 表示時間（ミリ秒、デフォルト: 3000）
 * @returns {boolean} 表示成功フラグ
 */
function showSuccess(message, duration = 3000) {
    return showMessage(message, 'success', duration);
}

/**
 * 警告メッセージを表示する
 * @param {string} message - 警告メッセージ
 * @param {number} duration - 表示時間（ミリ秒、デフォルト: 4000）
 * @returns {boolean} 表示成功フラグ
 */
function showWarning(message, duration = 4000) {
    return showMessage(message, 'warning', duration);
}

/**
 * 情報メッセージを表示する
 * @param {string} message - 情報メッセージ
 * @param {number} duration - 表示時間（ミリ秒、デフォルト: 3000）
 * @returns {boolean} 表示成功フラグ
 */
function showInfo(message, duration = 3000) {
    return showMessage(message, 'info', duration);
}

/**
 * 全てのメッセージを削除する
 */
function clearAllMessages() {
    try {
        const messageContainer = document.getElementById('message-container');
        if (messageContainer) {
            const messages = messageContainer.querySelectorAll('.message');
            messages.forEach(message => {
                removeMessage(message);
            });
        }
    } catch (error) {
        console.error('メッセージクリア中にエラーが発生:', error);
    }
}

// プロジェクト詳細ページのイベントリスナーを設定
function setupProjectDetailEventListeners(projectId) {
    try {
        // プロジェクト編集ボタン
        const editProjectBtn = document.getElementById('edit-project-btn');
        console.log('プロジェクト編集ボタン:', editProjectBtn);
        if (editProjectBtn) {
            console.log('プロジェクト編集ボタンにイベントリスナーを設定');
            editProjectBtn.addEventListener('click', () => {
                console.log('プロジェクト編集ボタンがクリックされました');
                showEditProjectModal(projectId);
            });
        } else {
            console.warn('プロジェクト編集ボタンが見つかりません');
        }
        
        // プロジェクト削除ボタン
        const deleteProjectBtn = document.getElementById('delete-project-btn');
        if (deleteProjectBtn) {
            deleteProjectBtn.addEventListener('click', () => {
                showDeleteProjectModal(projectId);
            });
        }
        
        // プロジェクト編集フォーム
        const editProjectForm = document.getElementById('edit-project-form');
        if (editProjectForm) {
            editProjectForm.addEventListener('submit', (event) => {
                handleEditProjectSubmit(event, projectId);
            });
        }
        
        // プロジェクト編集キャンセルボタン
        const cancelEditProjectBtn = document.getElementById('cancel-edit-project');
        if (cancelEditProjectBtn) {
            cancelEditProjectBtn.addEventListener('click', () => {
                hideModal('edit-project-modal');
            });
        }
        
        // 削除確認ボタン
        const confirmDeleteBtn = document.getElementById('confirm-delete');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                handleDeleteProject(projectId);
            });
        }
        
        // 削除キャンセルボタン
        const cancelDeleteBtn = document.getElementById('cancel-delete');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                hideModal('delete-confirm-modal');
            });
        }
        
        // CI結果追加ボタン
        const addCIResultBtn = document.getElementById('add-ci-result-btn');
        console.log('CI結果追加ボタン:', addCIResultBtn);
        if (addCIResultBtn) {
            console.log('CI結果追加ボタンにイベントリスナーを設定');
            addCIResultBtn.addEventListener('click', () => {
                console.log('CI結果追加ボタンがクリックされました');
                showAddCIResultModal(projectId);
            });
        } else {
            console.warn('CI結果追加ボタンが見つかりません');
        }
        
        // CI結果追加フォーム
        const addCIResultForm = document.getElementById('add-ci-result-form');
        if (addCIResultForm) {
            addCIResultForm.addEventListener('submit', (event) => {
                handleAddCIResultSubmit(event, projectId);
            });
        }
        
        // CI結果追加キャンセルボタン
        const cancelAddCIResultBtn = document.getElementById('cancel-add-ci-result');
        if (cancelAddCIResultBtn) {
            cancelAddCIResultBtn.addEventListener('click', () => {
                hideModal('add-ci-result-modal');
            });
        }
        
        // CI結果削除確認ボタン
        const confirmDeleteCIResultBtn = document.getElementById('confirm-delete-ci-result');
        if (confirmDeleteCIResultBtn) {
            confirmDeleteCIResultBtn.addEventListener('click', () => {
                handleDeleteCIResult(projectId);
            });
        }
        
        // CI結果削除キャンセルボタン
        const cancelDeleteCIResultBtn = document.getElementById('cancel-delete-ci-result');
        if (cancelDeleteCIResultBtn) {
            cancelDeleteCIResultBtn.addEventListener('click', () => {
                hideModal('delete-ci-result-modal');
            });
        }

        // レビュー指摘追加ボタン
        const addReviewFindingBtn = document.getElementById('add-review-finding-btn');
        console.log('レビュー指摘追加ボタン:', addReviewFindingBtn);
        if (addReviewFindingBtn) {
            console.log('レビュー指摘追加ボタンにイベントリスナーを設定');
            addReviewFindingBtn.addEventListener('click', () => {
                console.log('レビュー指摘追加ボタンがクリックされました');
                showAddReviewFindingModal(projectId);
            });
        } else {
            console.warn('レビュー指摘追加ボタンが見つかりません');
        }
        
        // レビュー指摘追加フォーム
        const addReviewFindingForm = document.getElementById('add-review-finding-form');
        if (addReviewFindingForm) {
            addReviewFindingForm.addEventListener('submit', (event) => {
                handleAddReviewFindingSubmit(event, projectId);
            });
        }
        
        // レビュー指摘追加キャンセルボタン
        const cancelAddReviewFindingBtn = document.getElementById('cancel-add-review-finding');
        if (cancelAddReviewFindingBtn) {
            cancelAddReviewFindingBtn.addEventListener('click', () => {
                hideModal('add-review-finding-modal');
            });
        }
        
        // レビュー指摘編集フォーム
        const editReviewFindingForm = document.getElementById('edit-review-finding-form');
        if (editReviewFindingForm) {
            editReviewFindingForm.addEventListener('submit', (event) => {
                handleEditReviewFindingSubmit(event);
            });
        }
        
        // レビュー指摘編集キャンセルボタン
        const cancelEditReviewFindingBtn = document.getElementById('cancel-edit-review-finding');
        if (cancelEditReviewFindingBtn) {
            cancelEditReviewFindingBtn.addEventListener('click', () => {
                hideModal('edit-review-finding-modal');
            });
        }
        
        // レビュー指摘削除確認ボタン
        const confirmDeleteReviewFindingBtn = document.getElementById('confirm-delete-review-finding');
        if (confirmDeleteReviewFindingBtn) {
            confirmDeleteReviewFindingBtn.addEventListener('click', () => {
                handleDeleteReviewFinding();
            });
        }
        
        // レビュー指摘削除キャンセルボタン
        const cancelDeleteReviewFindingBtn = document.getElementById('cancel-delete-review-finding');
        if (cancelDeleteReviewFindingBtn) {
            cancelDeleteReviewFindingBtn.addEventListener('click', () => {
                hideModal('delete-review-finding-modal');
            });
        }
        
        // フィルタクリアボタン
        const clearFiltersBtn = document.getElementById('clear-filters-btn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                clearAllFilters(projectId);
            });
        }

        // 効果メトリクス編集ボタン
        const editEffectMetricsBtn = document.getElementById('edit-effect-metrics-btn');
        console.log('効果メトリクス編集ボタン:', editEffectMetricsBtn);
        if (editEffectMetricsBtn) {
            console.log('効果メトリクス編集ボタンにイベントリスナーを設定');
            editEffectMetricsBtn.addEventListener('click', () => {
                console.log('効果メトリクス編集ボタンがクリックされました');
                showEditEffectMetricsModal(projectId);
            });
        } else {
            console.warn('効果メトリクス編集ボタンが見つかりません');
        }
        
        // 効果メトリクス編集フォーム
        const editEffectMetricsForm = document.getElementById('edit-effect-metrics-form');
        if (editEffectMetricsForm) {
            editEffectMetricsForm.addEventListener('submit', handleEditEffectMetricsSubmit);
        }
        
        // 効果メトリクス編集キャンセルボタン
        const cancelEditEffectMetricsBtn = document.getElementById('cancel-edit-effect-metrics');
        if (cancelEditEffectMetricsBtn) {
            cancelEditEffectMetricsBtn.addEventListener('click', () => {
                hideModal('edit-effect-metrics-modal');
            });
        }

        // モーダルの閉じるボタン
        const modalCloseButtons = document.querySelectorAll('.modal-close');
        modalCloseButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                const modal = event.target.closest('.modal');
                if (modal) {
                    modal.style.display = 'none';
                }
            });
        });
        
    } catch (error) {
        console.error('イベントリスナーの設定中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'イベントリスナー設定');
    }
}

// 日付フォーマット機能
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// 日時フォーマット機能
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// パーセンテージフォーマット機能
function formatPercentage(value) {
    if (value === null || value === undefined) return '-';
    // 小数点1桁まで表示
    return `${parseFloat(value).toFixed(1)}%`;
}

// 数値フォーマット機能
function formatNumber(value) {
    if (value === null || value === undefined) return '-';
    // 整数の場合は3桁区切り、小数の場合は小数点以下1桁まで表示
    if (Number.isInteger(value)) {
        return value.toLocaleString('ja-JP');
    } else {
        return parseFloat(value).toFixed(1).replace(/\.0$/, '');
    }
}

// 時間フォーマット機能
function formatHours(value) {
    if (value === null || value === undefined) return '-';
    // 小数点1桁まで表示し、「時間」を付加
    return `${parseFloat(value).toFixed(1)}時間`;
}

// Lint結果フォーマット機能
function formatLintResult(lintResult) {
    if (!lintResult) return '-';
    
    let result = lintResult.passed ? '✓' : '✗';
    if (lintResult.errorCount !== undefined || lintResult.warningCount !== undefined) {
        // 数値を3桁区切りでフォーマット
        const errors = (lintResult.errorCount || 0).toLocaleString('ja-JP');
        const warnings = (lintResult.warningCount || 0).toLocaleString('ja-JP');
        result += ` (E:${errors}, W:${warnings})`;
    }
    return result;
}

// 契約テスト結果フォーマット機能
function formatContractTestResult(contractTestResult) {
    if (!contractTestResult) return '-';
    
    let result = contractTestResult.passed ? '✓' : '✗';
    if (contractTestResult.totalTests !== undefined && contractTestResult.passedTests !== undefined) {
        // 数値を3桁区切りでフォーマット
        const totalTests = contractTestResult.totalTests.toLocaleString('ja-JP');
        const passedTests = contractTestResult.passedTests.toLocaleString('ja-JP');
        result += ` (${passedTests}/${totalTests})`;
    }
    return result;
}

// カバレッジ結果フォーマット機能
function formatCoverageResult(coverage) {
    if (!coverage) return '-';
    
    // パーセンテージを小数点1桁まで表示
    let result = `${coverage.percentage.toFixed(1)}%`;
    if (coverage.lines !== undefined && coverage.coveredLines !== undefined) {
        // 数値を3桁区切りでフォーマット
        const totalLines = coverage.lines.toLocaleString('ja-JP');
        const coveredLines = coverage.coveredLines.toLocaleString('ja-JP');
        result += ` (${coveredLines}/${totalLines})`;
    }
    return result;
}

// SBOMステータスフォーマット機能
function formatSBOMStatus(sbomStatus) {
    if (!sbomStatus) return '-';
    
    switch (sbomStatus) {
        case 'generated':
            return '✓ 生成済み';
        case 'not_generated':
            return '✗ 未生成';
        case 'error':
            return '⚠ エラー';
        default:
            return sbomStatus;
    }
}

// ログURLフォーマット機能
function formatLogUrl(logUrl) {
    if (!logUrl) return '-';
    
    return `<a href="${escapeHtml(logUrl)}" target="_blank" rel="noopener noreferrer">ログを表示</a>`;
}

// CI結果追加モーダルを表示
function showAddCIResultModal(projectId) {
    try {
        // フォームをリセット
        const form = document.getElementById('add-ci-result-form');
        if (form) {
            form.reset();
        }
        
        // モーダルを表示
        showModal('add-ci-result-modal');
        
    } catch (error) {
        console.error('CI結果追加モーダルの表示中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'CI結果追加モーダル表示');
    }
}

// CI結果追加フォーム送信ハンドラー
function handleAddCIResultSubmit(event, projectId) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        
        // CI結果データを構築
        const ciResultData = {
            status: formData.get('status')
        };
        
        // Lint結果の処理
        const lintPassed = formData.get('lintPassed');
        if (lintPassed !== '') {
            ciResultData.lintResult = {
                passed: lintPassed === 'true'
            };
            
            const lintErrorCount = formData.get('lintErrorCount');
            if (lintErrorCount !== '') {
                ciResultData.lintResult.errorCount = parseInt(lintErrorCount, 10);
            }
            
            const lintWarningCount = formData.get('lintWarningCount');
            if (lintWarningCount !== '') {
                ciResultData.lintResult.warningCount = parseInt(lintWarningCount, 10);
            }
        }
        
        // 契約テスト結果の処理
        const contractTestPassed = formData.get('contractTestPassed');
        if (contractTestPassed !== '') {
            ciResultData.contractTestResult = {
                passed: contractTestPassed === 'true'
            };
            
            const contractTestTotal = formData.get('contractTestTotal');
            if (contractTestTotal !== '') {
                ciResultData.contractTestResult.totalTests = parseInt(contractTestTotal, 10);
            }
            
            const contractTestPassedCount = formData.get('contractTestPassedCount');
            if (contractTestPassedCount !== '') {
                ciResultData.contractTestResult.passedTests = parseInt(contractTestPassedCount, 10);
            }
        }
        
        // カバレッジ情報の処理
        const coveragePercentage = formData.get('coveragePercentage');
        if (coveragePercentage !== '') {
            ciResultData.coverage = {
                percentage: parseFloat(coveragePercentage)
            };
            
            const coverageLines = formData.get('coverageLines');
            if (coverageLines !== '') {
                ciResultData.coverage.lines = parseInt(coverageLines, 10);
            }
            
            const coverageCoveredLines = formData.get('coverageCoveredLines');
            if (coverageCoveredLines !== '') {
                ciResultData.coverage.coveredLines = parseInt(coverageCoveredLines, 10);
            }
        }
        
        // SBOMステータスの処理
        const sbomStatus = formData.get('sbomStatus');
        if (sbomStatus !== '') {
            ciResultData.sbomStatus = sbomStatus;
        }
        
        // ログURLの処理
        const logUrl = formData.get('logUrl');
        if (logUrl !== '') {
            ciResultData.logUrl = logUrl;
        }
        
        // CI結果を作成
        const newCIResult = DataManager.createCIResult(projectId, ciResultData);
        if (newCIResult) {
            ErrorHandler.showSuccessMessage('CI結果を追加しました');
            hideModal('add-ci-result-modal');
            
            // CI結果タブを再読み込み
            loadCIResultsTab(projectId);
        } else {
            ErrorHandler.showErrorMessage('CI結果の追加に失敗しました');
        }
        
    } catch (error) {
        console.error('CI結果追加フォーム送信中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'CI結果追加');
    }
}

// CI結果削除ボタンのクリックハンドラー（グローバル関数として定義）
function deleteCIResult(timestamp) {
    try {
        // URLパラメータからプロジェクトIDを取得
        const urlParams = new URLSearchParams(window.location.search);
        const projectId = urlParams.get('id');
        
        if (!projectId) {
            ErrorHandler.showErrorMessage('プロジェクトIDが取得できません');
            return;
        }
        
        // 削除対象のタイムスタンプを保存
        window.currentDeletingCIResultTimestamp = timestamp;
        
        // 削除確認モーダルを表示
        showModal('delete-ci-result-modal');
        
    } catch (error) {
        console.error('CI結果削除ボタンクリック中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'CI結果削除');
    }
}

// CI結果削除確認ハンドラー
function handleDeleteCIResult(projectId) {
    try {
        const timestamp = window.currentDeletingCIResultTimestamp;
        if (!timestamp) {
            ErrorHandler.showErrorMessage('削除対象のCI結果が特定できません');
            return;
        }
        
        // CI結果を削除
        const success = DataManager.deleteCIResult(projectId, timestamp);
        if (success) {
            ErrorHandler.showSuccessMessage('CI結果を削除しました');
            hideModal('delete-ci-result-modal');
            
            // CI結果タブを再読み込み
            loadCIResultsTab(projectId);
        } else {
            ErrorHandler.showErrorMessage('CI結果の削除に失敗しました');
        }
        
        // 削除対象のタイムスタンプをクリア
        window.currentDeletingCIResultTimestamp = null;
        
    } catch (error) {
        console.error('CI結果削除中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'CI結果削除');
    }
}

// ドキュメント参照フォーマット機能
function formatDocRef(docRef) {
    if (!docRef || !docRef.path) return '-';
    
    let result = escapeHtml(docRef.path);
    if (docRef.lines) {
        result += `:${escapeHtml(docRef.lines)}`;
    }
    if (docRef.sectionId) {
        result += ` (${escapeHtml(docRef.sectionId)})`;
    }
    return result;
}

// プロジェクト編集モーダルを表示
function showEditProjectModal(projectId) {
    try {
        const project = DataManager.getProjectById(projectId);
        if (!project) {
            ErrorHandler.showErrorMessage('プロジェクトが見つかりません');
            return;
        }
        
        // フォームに現在の値を設定
        const nameInput = document.getElementById('edit-project-name');
        const frameworkInput = document.getElementById('edit-project-framework');
        const dateInput = document.getElementById('edit-project-date');
        const assigneeInput = document.getElementById('edit-project-assignee');
        
        if (nameInput) nameInput.value = project.name;
        if (frameworkInput) frameworkInput.value = project.framework;
        if (dateInput) dateInput.value = project.date;
        if (assigneeInput) assigneeInput.value = project.assignee || '';
        
        // モーダルを表示
        showModal('edit-project-modal');
        
    } catch (error) {
        console.error('プロジェクト編集モーダルの表示中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'プロジェクト編集モーダル表示');
    }
}

// プロジェクト削除モーダルを表示
function showDeleteProjectModal(projectId) {
    try {
        const project = DataManager.getProjectById(projectId);
        if (!project) {
            ErrorHandler.showErrorMessage('プロジェクトが見つかりません');
            return;
        }
        
        // 削除確認メッセージを更新
        const modalBody = document.querySelector('#delete-confirm-modal .modal-body p');
        if (modalBody) {
            modalBody.textContent = `プロジェクト「${project.name}」を削除しますか？この操作は取り消せません。`;
        }
        
        // モーダルを表示
        showModal('delete-confirm-modal');
        
    } catch (error) {
        console.error('プロジェクト削除モーダルの表示中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'プロジェクト削除モーダル表示');
    }
}

// プロジェクト編集フォームの送信処理
function handleEditProjectSubmit(event, projectId) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const updateData = {
            name: formData.get('name')?.trim(),
            framework: formData.get('framework')?.trim(),
            date: formData.get('date'),
            assignee: formData.get('assignee')?.trim() || undefined
        };
        
        // 空文字列チェック
        if (!updateData.name) {
            ErrorHandler.showErrorMessage('プロジェクト名を入力してください');
            return;
        }
        
        if (!updateData.framework) {
            ErrorHandler.showErrorMessage('フレームワーク種別を入力してください');
            return;
        }
        
        if (!updateData.date) {
            ErrorHandler.showErrorMessage('日付を選択してください');
            return;
        }
        
        // プロジェクトを更新
        const success = DataManager.updateProject(projectId, updateData);
        
        if (success) {
            // 成功時の処理
            ErrorHandler.showSuccessMessage('プロジェクトを更新しました');
            hideModal('edit-project-modal');
            
            // プロジェクト情報を再表示
            const updatedProject = DataManager.getProjectById(projectId);
            if (updatedProject) {
                displayProjectInfo(updatedProject);
            }
        } else {
            ErrorHandler.showErrorMessage('プロジェクトの更新に失敗しました');
        }
        
    } catch (error) {
        console.error('プロジェクト更新処理でエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'プロジェクト更新');
    }
}

// プロジェクト削除処理
function handleDeleteProject(projectId) {
    try {
        const success = DataManager.deleteProject(projectId);
        
        if (success) {
            // 成功時の処理
            ErrorHandler.showSuccessMessage('プロジェクトを削除しました');
            hideModal('delete-confirm-modal');
            
            // プロジェクト一覧ページに戻る
            window.location.href = 'index.html';
        } else {
            ErrorHandler.showErrorMessage('プロジェクトの削除に失敗しました');
        }
        
    } catch (error) {
        console.error('プロジェクト削除処理でエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'プロジェクト削除');
    }
}

// 効果メトリクス編集モーダルを表示
function showEditEffectMetricsModal(projectId) {
    try {
        const project = DataManager.getProjectById(projectId);
        if (!project) {
            ErrorHandler.showErrorMessage('プロジェクトが見つかりません');
            return;
        }
        
        const modal = document.getElementById('edit-effect-metrics-modal');
        if (!modal) {
            console.error('効果メトリクス編集モーダルが見つかりません');
            return;
        }
        
        // プロジェクトIDを設定
        const projectIdInput = document.getElementById('edit-effect-metrics-project-id');
        if (projectIdInput) {
            projectIdInput.value = projectId;
        }
        
        // 既存の効果メトリクスデータをフォームに設定
        populateEffectMetricsForm(project.effectMetrics);
        
        // モーダルを表示
        showModal('edit-effect-metrics-modal');
        
    } catch (error) {
        console.error('効果メトリクス編集モーダルの表示中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, '効果メトリクス編集モーダル表示');
    }
}

// 効果メトリクスフォームにデータを設定
function populateEffectMetricsForm(effectMetrics) {
    try {
        // 効率性指標
        if (effectMetrics && effectMetrics.efficiency) {
            setFormValue('task-completion-rate', effectMetrics.efficiency.taskCompletionRate);
            setFormValue('avg-task-duration-hours', effectMetrics.efficiency.avgTaskDurationHours);
        }
        
        // 品質指標
        if (effectMetrics && effectMetrics.quality) {
            setFormValue('pre-impl-findings-count', effectMetrics.quality.preImplFindingsCount);
            setFormValue('post-impl-findings-count', effectMetrics.quality.postImplFindingsCount);
            setFormValue('high-severity-count', effectMetrics.quality.highSeverityCount);
            setFormValue('ci-success-rate', effectMetrics.quality.ciSuccessRate);
        }
        
        // 人間の手間指標
        if (effectMetrics && effectMetrics.humanEffort) {
            setFormValue('manual-fix-count', effectMetrics.humanEffort.manualFixCount);
            setFormValue('review-effort-hours', effectMetrics.humanEffort.reviewEffortHours);
        }
        
        // 引継ぎ正確性指標
        if (effectMetrics && effectMetrics.handoffAccuracy) {
            setFormValue('requirements-change-count', effectMetrics.handoffAccuracy.requirementsChangeCount);
            setFormValue('design-change-count', effectMetrics.handoffAccuracy.designChangeCount);
            setFormValue('spec-ambiguity-count', effectMetrics.handoffAccuracy.specAmbiguityCount);
        }
        
        // コメント
        if (effectMetrics && effectMetrics.comments) {
            setFormValue('effect-metrics-comments', effectMetrics.comments);
        }
        
    } catch (error) {
        console.error('効果メトリクスフォームの設定中にエラーが発生:', error);
    }
}

// フォーム要素に値を設定するヘルパー関数
function setFormValue(elementId, value) {
    const element = document.getElementById(elementId);
    if (element && value !== undefined && value !== null) {
        element.value = value;
    }
}

// 効果メトリクス編集フォームの送信処理
function handleEditEffectMetricsSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const projectId = formData.get('projectId');
        
        if (!projectId) {
            ErrorHandler.showErrorMessage('プロジェクトIDが見つかりません');
            return;
        }
        
        // フォームデータから効果メトリクスオブジェクトを構築
        const effectMetrics = buildEffectMetricsFromForm(formData);
        
        // 効果メトリクスを更新
        const success = DataManager.updateEffectMetrics(projectId, effectMetrics);
        
        if (success) {
            // 成功時の処理
            ErrorHandler.showSuccessMessage('効果メトリクスを更新しました');
            hideModal('edit-effect-metrics-modal');
            
            // 効果メトリクスタブを再読み込み
            loadEffectMetricsTab(projectId);
        } else {
            ErrorHandler.showErrorMessage('効果メトリクスの更新に失敗しました');
        }
        
    } catch (error) {
        console.error('効果メトリクス更新処理でエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, '効果メトリクス更新');
    }
}

// フォームデータから効果メトリクスオブジェクトを構築
function buildEffectMetricsFromForm(formData) {
    const effectMetrics = {};
    
    // 効率性指標
    const taskCompletionRate = parseFloat(formData.get('taskCompletionRate'));
    const avgTaskDurationHours = parseFloat(formData.get('avgTaskDurationHours'));
    
    if (!isNaN(taskCompletionRate) || !isNaN(avgTaskDurationHours)) {
        effectMetrics.efficiency = {};
        if (!isNaN(taskCompletionRate)) {
            effectMetrics.efficiency.taskCompletionRate = taskCompletionRate;
        }
        if (!isNaN(avgTaskDurationHours)) {
            effectMetrics.efficiency.avgTaskDurationHours = avgTaskDurationHours;
        }
    }
    
    // 品質指標
    const preImplFindingsCount = parseInt(formData.get('preImplFindingsCount'));
    const postImplFindingsCount = parseInt(formData.get('postImplFindingsCount'));
    const highSeverityCount = parseInt(formData.get('highSeverityCount'));
    const ciSuccessRate = parseFloat(formData.get('ciSuccessRate'));
    
    if (!isNaN(preImplFindingsCount) || !isNaN(postImplFindingsCount) || 
        !isNaN(highSeverityCount) || !isNaN(ciSuccessRate)) {
        effectMetrics.quality = {};
        if (!isNaN(preImplFindingsCount)) {
            effectMetrics.quality.preImplFindingsCount = preImplFindingsCount;
        }
        if (!isNaN(postImplFindingsCount)) {
            effectMetrics.quality.postImplFindingsCount = postImplFindingsCount;
        }
        if (!isNaN(highSeverityCount)) {
            effectMetrics.quality.highSeverityCount = highSeverityCount;
        }
        if (!isNaN(ciSuccessRate)) {
            effectMetrics.quality.ciSuccessRate = ciSuccessRate;
        }
    }
    
    // 人間の手間指標
    const manualFixCount = parseInt(formData.get('manualFixCount'));
    const reviewEffortHours = parseFloat(formData.get('reviewEffortHours'));
    
    if (!isNaN(manualFixCount) || !isNaN(reviewEffortHours)) {
        effectMetrics.humanEffort = {};
        if (!isNaN(manualFixCount)) {
            effectMetrics.humanEffort.manualFixCount = manualFixCount;
        }
        if (!isNaN(reviewEffortHours)) {
            effectMetrics.humanEffort.reviewEffortHours = reviewEffortHours;
        }
    }
    
    // 引継ぎ正確性指標
    const requirementsChangeCount = parseInt(formData.get('requirementsChangeCount'));
    const designChangeCount = parseInt(formData.get('designChangeCount'));
    const specAmbiguityCount = parseInt(formData.get('specAmbiguityCount'));
    
    if (!isNaN(requirementsChangeCount) || !isNaN(designChangeCount) || !isNaN(specAmbiguityCount)) {
        effectMetrics.handoffAccuracy = {};
        if (!isNaN(requirementsChangeCount)) {
            effectMetrics.handoffAccuracy.requirementsChangeCount = requirementsChangeCount;
        }
        if (!isNaN(designChangeCount)) {
            effectMetrics.handoffAccuracy.designChangeCount = designChangeCount;
        }
        if (!isNaN(specAmbiguityCount)) {
            effectMetrics.handoffAccuracy.specAmbiguityCount = specAmbiguityCount;
        }
    }
    
    // コメント
    const comments = formData.get('comments')?.trim();
    if (comments) {
        effectMetrics.comments = comments;
    }
    
    return effectMetrics;
}

// HTMLエスケープ機能
function escapeHtml(text) {
    if (typeof text !== 'string') {
        return text;
    }
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// UUID生成機能
function generateUUID() {
    // crypto.randomUUID()が利用可能な場合は使用
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    
    // フォールバック実装
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// 現在のタイムスタンプ取得
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// デバッグ用ログ機能
function debugLog(message, data = null) {
    if (console && console.log) {
        if (data) {
            console.log(`[Debug] ${message}`, data);
        } else {
            console.log(`[Debug] ${message}`);
        }
    }
}

// プロジェクト追加フォームの送信処理
function handleAddProjectSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const projectData = {
            name: formData.get('name')?.trim(),
            framework: formData.get('framework')?.trim(),
            date: formData.get('date'),
            assignee: formData.get('assignee')?.trim() || undefined
        };
        
        // 空文字列チェック
        if (!projectData.name) {
            ErrorHandler.showErrorMessage('プロジェクト名を入力してください');
            return;
        }
        
        if (!projectData.framework) {
            ErrorHandler.showErrorMessage('フレームワーク種別を入力してください');
            return;
        }
        
        if (!projectData.date) {
            ErrorHandler.showErrorMessage('日付を選択してください');
            return;
        }
        
        // プロジェクトを作成
        const newProject = DataManager.createProject(projectData);
        
        if (newProject) {
            // 成功時の処理
            ErrorHandler.showSuccessMessage('プロジェクトを追加しました');
            hideModal('add-project-modal');
            resetAddProjectForm();
            
            // プロジェクト一覧を再読み込み
            loadAndDisplayProjects();
        } else {
            ErrorHandler.showErrorMessage('プロジェクトの追加に失敗しました');
        }
        
    } catch (error) {
        console.error('プロジェクト追加処理でエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'プロジェクト追加');
    }
}

// プロジェクト追加フォームの初期化
function initializeAddProjectForm() {
    const dateInput = document.getElementById('project-date');
    if (dateInput) {
        // 今日の日付をデフォルトに設定
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

// プロジェクト追加フォームをリセット
function resetAddProjectForm() {
    const form = document.getElementById('add-project-form');
    if (form) {
        form.reset();
        
        // 今日の日付をデフォルトに設定
        const dateInput = form.querySelector('#project-date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
        }
    }
}

// エクスポート機能
function exportData() {
    try {
        const success = LocalStorageManager.downloadDataAsJSON();
        if (success) {
            ErrorHandler.showSuccessMessage('データのエクスポートが完了しました');
        } else {
            ErrorHandler.showErrorMessage('データのエクスポートに失敗しました');
        }
    } catch (error) {
        console.error('エクスポート処理でエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'データエクスポート');
    }
}

// グローバルエラーハンドラー
window.addEventListener('error', function(e) {
    console.error('アプリケーションエラー:', e.error);
    ErrorHandler.handleUnexpectedError(e.error, 'アプリケーション実行');
});

// 未処理のPromise拒否をキャッチ
window.addEventListener('unhandledrejection', function(e) {
    console.error('未処理のPromise拒否:', e.reason);
    ErrorHandler.handleUnexpectedError(e.reason, 'データ処理');
});

// ========================================
// エラーハンドリングクラス
// ========================================

/**
 * エラーハンドリングを統一的に管理するクラス
 * 要件7.8: エラーハンドリングの実装
 */
class ErrorHandler {
    /**
     * バリデーションエラーを処理
     * @param {ValidationResult} validationResult - バリデーション結果
     */
    static handleValidationError(validationResult) {
        try {
            if (!validationResult || typeof validationResult !== 'object') {
                console.error('無効なバリデーション結果:', validationResult);
                this.showErrorMessage('入力データの検証中にエラーが発生しました');
                return;
            }

            if (validationResult.isValid) {
                // バリデーションが成功している場合は何もしない
                return;
            }

            if (!validationResult.errors || !Array.isArray(validationResult.errors)) {
                console.error('バリデーションエラーの形式が不正:', validationResult);
                this.showErrorMessage('入力データの検証中にエラーが発生しました');
                return;
            }

            // エラーメッセージを生成
            let errorMessage = '入力データに以下の問題があります：\n';
            validationResult.errors.forEach((error, index) => {
                if (error && error.field && error.message) {
                    errorMessage += `• ${error.field}: ${error.message}`;
                    if (index < validationResult.errors.length - 1) {
                        errorMessage += '\n';
                    }
                }
            });

            // エラーメッセージを表示
            this.showErrorMessage(errorMessage);

            // コンソールにも詳細を出力
            console.error('バリデーションエラー:', validationResult.errors);
        } catch (error) {
            console.error('バリデーションエラーの処理中にエラーが発生:', error);
            this.showErrorMessage('入力データの検証中に予期しないエラーが発生しました');
        }
    }

    /**
     * ストレージエラーを処理
     * @param {Error} error - ストレージエラー
     */
    static handleStorageError(error) {
        try {
            console.error('ストレージエラー:', error);

            let userMessage = 'データの保存中にエラーが発生しました';
            let suggestion = '';

            // エラーの種類に応じてメッセージを調整
            if (error && error.message) {
                const errorMessage = error.message.toLowerCase();

                if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
                    userMessage = 'ストレージ容量が不足しています';
                    suggestion = 'ブラウザのデータを整理するか、不要なデータを削除してください。';
                } else if (errorMessage.includes('private') || errorMessage.includes('incognito')) {
                    userMessage = 'プライベートモードではデータを保存できません';
                    suggestion = '通常のブラウザモードでアクセスしてください。';
                } else if (errorMessage.includes('permission') || errorMessage.includes('access')) {
                    userMessage = 'データへのアクセス権限がありません';
                    suggestion = 'ブラウザの設定を確認してください。';
                } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                    userMessage = 'ネットワークエラーが発生しました';
                    suggestion = 'インターネット接続を確認してください。';
                }
            }

            // エラーメッセージを表示
            const fullMessage = suggestion ? `${userMessage}\n\n${suggestion}` : userMessage;
            this.showErrorMessage(fullMessage);
        } catch (handlingError) {
            console.error('ストレージエラーの処理中にエラーが発生:', handlingError);
            this.showErrorMessage('データの保存中に予期しないエラーが発生しました');
        }
    }

    /**
     * インポートエラーを処理
     * @param {Error} error - インポートエラー
     */
    static handleImportError(error) {
        try {
            console.error('インポートエラー:', error);

            let userMessage = 'データの読み込み中にエラーが発生しました';
            let suggestion = '';

            // エラーの種類に応じてメッセージを調整
            if (error && error.message) {
                const errorMessage = error.message.toLowerCase();

                if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                    userMessage = 'データファイルが見つかりません';
                    suggestion = 'ファイルパスを確認してください。';
                } else if (errorMessage.includes('json') || errorMessage.includes('parse')) {
                    userMessage = 'データファイルの形式が正しくありません';
                    suggestion = 'JSONファイルの構文を確認してください。';
                } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                    userMessage = 'ネットワークエラーが発生しました';
                    suggestion = 'インターネット接続を確認してください。';
                } else if (errorMessage.includes('cors') || errorMessage.includes('cross-origin')) {
                    userMessage = 'ファイルへのアクセスが制限されています';
                    suggestion = 'ローカルサーバーを使用してアクセスしてください。';
                } else if (errorMessage.includes('validation') || errorMessage.includes('schema')) {
                    userMessage = 'データファイルの内容が仕様に合いません';
                    suggestion = 'データファイルの構造を確認してください。';
                }
            }

            // エラーメッセージを表示
            const fullMessage = suggestion ? `${userMessage}\n\n${suggestion}` : userMessage;
            this.showErrorMessage(fullMessage);
        } catch (handlingError) {
            console.error('インポートエラーの処理中にエラーが発生:', handlingError);
            this.showErrorMessage('データの読み込み中に予期しないエラーが発生しました');
        }
    }

    /**
     * エラーメッセージを表示
     * @param {string} message - エラーメッセージ
     * @param {number} duration - 表示時間（ミリ秒、デフォルト: 5000）
     */
    static showErrorMessage(message, duration = 5000) {
        try {
            if (typeof message !== 'string' || message.trim() === '') {
                console.error('無効なエラーメッセージ:', message);
                message = '予期しないエラーが発生しました';
            }

            // 新しいshowError関数を使用
            if (typeof showError === 'function') {
                showError(message, duration);
            } else {
                // フォールバック: コンソールに出力
                console.error('エラーメッセージ表示機能が利用できません:', message);
                alert(message); // 最後の手段としてalertを使用
            }
        } catch (error) {
            console.error('エラーメッセージの表示中にエラーが発生:', error);
            // 最後の手段
            try {
                alert('予期しないエラーが発生しました');
            } catch (alertError) {
                console.error('alert表示も失敗:', alertError);
            }
        }
    }

    /**
     * 成功メッセージを表示
     * @param {string} message - 成功メッセージ
     * @param {number} duration - 表示時間（ミリ秒、デフォルト: 3000）
     */
    static showSuccessMessage(message, duration = 3000) {
        try {
            if (typeof message !== 'string' || message.trim() === '') {
                console.error('無効な成功メッセージ:', message);
                message = '操作が完了しました';
            }

            // 新しいshowSuccess関数を使用
            if (typeof showSuccess === 'function') {
                showSuccess(message, duration);
            } else {
                // フォールバック: コンソールに出力
                console.log('成功メッセージ:', message);
            }
        } catch (error) {
            console.error('成功メッセージの表示中にエラーが発生:', error);
        }
    }

    /**
     * 警告メッセージを表示
     * @param {string} message - 警告メッセージ
     * @param {number} duration - 表示時間（ミリ秒、デフォルト: 4000）
     */
    static showWarningMessage(message, duration = 4000) {
        try {
            if (typeof message !== 'string' || message.trim() === '') {
                console.error('無効な警告メッセージ:', message);
                message = '注意が必要です';
            }

            // 新しいshowWarning関数を使用
            if (typeof showWarning === 'function') {
                showWarning(message, duration);
            } else {
                // フォールバック: エラーメッセージとして表示
                this.showErrorMessage(message, duration);
            }
        } catch (error) {
            console.error('警告メッセージの表示中にエラーが発生:', error);
        }
    }

    /**
     * 情報メッセージを表示
     * @param {string} message - 情報メッセージ
     * @param {number} duration - 表示時間（ミリ秒、デフォルト: 3000）
     */
    static showInfoMessage(message, duration = 3000) {
        try {
            if (typeof message !== 'string' || message.trim() === '') {
                console.error('無効な情報メッセージ:', message);
                message = '情報があります';
            }

            // 新しいshowInfo関数を使用
            if (typeof showInfo === 'function') {
                showInfo(message, duration);
            } else {
                // フォールバック: 成功メッセージとして表示
                this.showSuccessMessage(message, duration);
            }
        } catch (error) {
            console.error('情報メッセージの表示中にエラーが発生:', error);
        }
    }

    /**
     * 汎用エラーハンドラー（予期しないエラー用）
     * @param {Error} error - エラーオブジェクト
     * @param {string} context - エラーが発生したコンテキスト
     */
    static handleUnexpectedError(error, context = '操作') {
        try {
            console.error(`予期しないエラー (${context}):`, error);

            let userMessage = `${context}中に予期しないエラーが発生しました`;
            
            // 開発環境では詳細なエラー情報を表示
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                if (error && error.message) {
                    userMessage += `\n\n詳細: ${error.message}`;
                }
            }

            this.showErrorMessage(userMessage);
        } catch (handlingError) {
            console.error('予期しないエラーの処理中にエラーが発生:', handlingError);
            this.showErrorMessage('システムエラーが発生しました');
        }
    }

    /**
     * 複数のエラーを一括処理
     * @param {Error[]} errors - エラー配列
     * @param {string} context - エラーが発生したコンテキスト
     */
    static handleMultipleErrors(errors, context = '操作') {
        try {
            if (!Array.isArray(errors) || errors.length === 0) {
                return;
            }

            console.error(`複数のエラー (${context}):`, errors);

            if (errors.length === 1) {
                // 単一エラーの場合は通常の処理
                this.handleUnexpectedError(errors[0], context);
                return;
            }

            // 複数エラーの場合はまとめて表示
            let userMessage = `${context}中に複数のエラーが発生しました (${errors.length}件)`;
            
            // 開発環境では詳細を表示
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                userMessage += '\n\n詳細:';
                errors.forEach((error, index) => {
                    if (error && error.message) {
                        userMessage += `\n${index + 1}. ${error.message}`;
                    }
                });
            }

            this.showErrorMessage(userMessage);
        } catch (handlingError) {
            console.error('複数エラーの処理中にエラーが発生:', handlingError);
            this.showErrorMessage('システムエラーが発生しました');
        }
    }

    /**
     * エラーの詳細情報を取得
     * @param {Error} error - エラーオブジェクト
     * @returns {Object} エラー詳細情報
     */
    static getErrorDetails(error) {
        try {
            if (!error) {
                return {
                    message: '不明なエラー',
                    type: 'unknown',
                    stack: null
                };
            }

            return {
                message: error.message || '不明なエラー',
                type: error.name || 'Error',
                stack: error.stack || null,
                toString: error.toString ? error.toString() : String(error)
            };
        } catch (detailError) {
            console.error('エラー詳細の取得中にエラーが発生:', detailError);
            return {
                message: '詳細情報の取得に失敗',
                type: 'unknown',
                stack: null
            };
        }
    }
}

// 開発用：グローバル関数をwindowオブジェクトに追加
if (typeof window !== 'undefined') {
    window.debugLog = debugLog;
    window.showMessage = showMessage;
    window.showError = showError;
    window.showSuccess = showSuccess;
    window.ErrorHandler = ErrorHandler;
}

// ========================================
// レビュー指摘管理機能
// ========================================

// レビュー指摘追加モーダルを表示
function showAddReviewFindingModal(projectId) {
    try {
        const modal = document.getElementById('add-review-finding-modal');
        const form = document.getElementById('add-review-finding-form');
        
        if (!modal || !form) {
            console.error('レビュー指摘追加モーダルまたはフォームが見つかりません');
            return;
        }
        
        // フォームをリセット
        form.reset();
        
        // プロジェクトIDを保存
        window.currentProjectId = projectId;
        
        // モーダルを表示
        modal.style.display = 'block';
        
        // 最初の入力フィールドにフォーカス
        const firstInput = form.querySelector('select, input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
        
    } catch (error) {
        console.error('レビュー指摘追加モーダル表示中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'レビュー指摘追加モーダル表示');
    }
}

// レビュー指摘追加フォーム送信処理
function handleAddReviewFindingSubmit(event, projectId) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        
        // フォームデータを取得
        const reviewFindingData = {
            projectId: projectId,
            process: formData.get('process'),
            docType: formData.get('docType'),
            category: formData.get('category'),
            rootCause: formData.get('rootCause'),
            severity: formData.get('severity'),
            status: formData.get('status'),
            description: formData.get('description'),
            docRef: {
                path: formData.get('docPath'),
                lines: formData.get('docLines') || undefined,
                sectionId: formData.get('docSection') || undefined
            },
            reviewer: formData.get('reviewer') || undefined,
            assignee: formData.get('assignee') || undefined
        };
        
        // バリデーション
        const validationResult = ValidationEngine.validateReviewFinding(reviewFindingData);
        if (!validationResult.isValid) {
            const errorMessages = validationResult.errors.map(error => `${error.field}: ${error.message}`);
            ErrorHandler.showErrorMessage('入力エラー:\n' + errorMessages.join('\n'));
            return;
        }
        
        // レビュー指摘を作成
        const newFinding = DataManager.createReviewFinding(reviewFindingData);
        
        if (newFinding) {
            // 成功メッセージを表示
            ErrorHandler.showSuccessMessage('レビュー指摘を追加しました');
            
            // モーダルを閉じる
            hideModal('add-review-finding-modal');
            
            // フィルタを再適用（状態を維持）
            applyFilters();
        } else {
            ErrorHandler.showErrorMessage('レビュー指摘の追加に失敗しました');
        }
        
    } catch (error) {
        console.error('レビュー指摘追加中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'レビュー指摘追加');
    }
}

// レビュー指摘編集モーダルを表示
function editReviewFinding(findingId) {
    try {
        const finding = DataManager.getReviewFindingById(findingId);
        if (!finding) {
            ErrorHandler.showErrorMessage('指定されたレビュー指摘が見つかりません');
            return;
        }
        
        const modal = document.getElementById('edit-review-finding-modal');
        const form = document.getElementById('edit-review-finding-form');
        
        if (!modal || !form) {
            console.error('レビュー指摘編集モーダルまたはフォームが見つかりません');
            return;
        }
        
        // フォームに既存データを設定
        document.getElementById('edit-review-finding-id').value = finding.id;
        document.getElementById('edit-review-process').value = finding.process;
        document.getElementById('edit-review-doc-type').value = finding.docType;
        document.getElementById('edit-review-category').value = finding.category;
        document.getElementById('edit-review-root-cause').value = finding.rootCause;
        document.getElementById('edit-review-severity').value = finding.severity;
        document.getElementById('edit-review-status').value = finding.status;
        document.getElementById('edit-review-description').value = finding.description;
        document.getElementById('edit-review-doc-path').value = finding.docRef.path;
        document.getElementById('edit-review-doc-lines').value = finding.docRef.lines || '';
        document.getElementById('edit-review-doc-section').value = finding.docRef.sectionId || '';
        document.getElementById('edit-review-reviewer').value = finding.reviewer || '';
        document.getElementById('edit-review-assignee').value = finding.assignee || '';
        
        // モーダルを表示
        modal.style.display = 'block';
        
    } catch (error) {
        console.error('レビュー指摘編集モーダル表示中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'レビュー指摘編集モーダル表示');
    }
}

// レビュー指摘編集フォーム送信処理
function handleEditReviewFindingSubmit(event) {
    event.preventDefault();
    
    try {
        const formData = new FormData(event.target);
        const findingId = formData.get('id');
        
        // フォームデータを取得
        const updateData = {
            process: formData.get('process'),
            docType: formData.get('docType'),
            category: formData.get('category'),
            rootCause: formData.get('rootCause'),
            severity: formData.get('severity'),
            status: formData.get('status'),
            description: formData.get('description'),
            docRef: {
                path: formData.get('docPath'),
                lines: formData.get('docLines') || undefined,
                sectionId: formData.get('docSection') || undefined
            },
            reviewer: formData.get('reviewer') || undefined,
            assignee: formData.get('assignee') || undefined
        };
        
        // バリデーション
        const validationResult = ValidationEngine.validateReviewFinding(updateData);
        if (!validationResult.isValid) {
            const errorMessages = validationResult.errors.map(error => `${error.field}: ${error.message}`);
            ErrorHandler.showErrorMessage('入力エラー:\n' + errorMessages.join('\n'));
            return;
        }
        
        // レビュー指摘を更新
        const success = DataManager.updateReviewFinding(findingId, updateData);
        
        if (success) {
            // 成功メッセージを表示
            ErrorHandler.showSuccessMessage('レビュー指摘を更新しました');
            
            // モーダルを閉じる
            hideModal('edit-review-finding-modal');
            
            // フィルタを再適用（状態を維持）
            applyFilters();
        } else {
            ErrorHandler.showErrorMessage('レビュー指摘の更新に失敗しました');
        }
        
    } catch (error) {
        console.error('レビュー指摘更新中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'レビュー指摘更新');
    }
}

// レビュー指摘削除確認モーダルを表示
function deleteReviewFinding(findingId) {
    try {
        const finding = DataManager.getReviewFindingById(findingId);
        if (!finding) {
            ErrorHandler.showErrorMessage('指定されたレビュー指摘が見つかりません');
            return;
        }
        
        // 削除対象のIDを保存
        window.deleteTargetFindingId = findingId;
        
        // 削除確認モーダルを表示
        const modal = document.getElementById('delete-review-finding-modal');
        if (modal) {
            modal.style.display = 'block';
        }
        
    } catch (error) {
        console.error('レビュー指摘削除確認モーダル表示中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'レビュー指摘削除確認');
    }
}

// レビュー指摘削除実行
function handleDeleteReviewFinding() {
    try {
        const findingId = window.deleteTargetFindingId;
        if (!findingId) {
            ErrorHandler.showErrorMessage('削除対象が指定されていません');
            return;
        }
        
        // レビュー指摘を削除
        const success = DataManager.deleteReviewFinding(findingId);
        
        if (success) {
            // 成功メッセージを表示
            ErrorHandler.showSuccessMessage('レビュー指摘を削除しました');
            
            // モーダルを閉じる
            hideModal('delete-review-finding-modal');
            
            // フィルタを再適用（状態を維持）
            applyFilters();
        } else {
            ErrorHandler.showErrorMessage('レビュー指摘の削除に失敗しました');
        }
        
        // 削除対象IDをクリア
        window.deleteTargetFindingId = null;
        
    } catch (error) {
        console.error('レビュー指摘削除中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'レビュー指摘削除');
    }
}

// URLからプロジェクトIDを取得
function getProjectIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// フィルタコントロールを初期化
function initializeFilterControls() {
    try {
        // 分類システムの値を取得
        const processValues = ClassificationSystemEnforcer.getProcessValues();
        const docTypeValues = ClassificationSystemEnforcer.getDocTypeValues();
        const categoryValues = ClassificationSystemEnforcer.getCategoryValues();
        const severityValues = ClassificationSystemEnforcer.getSeverityValues();
        const statusValues = ClassificationSystemEnforcer.getStatusValues();
        
        // 各フィルタのオプションを設定
        populateFilterOptions('filter-process', processValues);
        populateFilterOptions('filter-doc-type', docTypeValues);
        populateFilterOptions('filter-category', categoryValues);
        populateFilterOptions('filter-severity', severityValues);
        populateFilterOptions('filter-status', statusValues);
        
        // フィルタ変更イベントリスナーを設定
        setupFilterEventListeners();
        
    } catch (error) {
        console.error('フィルタコントロール初期化中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'フィルタコントロール初期化');
    }
}

// フィルタオプションを設定
function populateFilterOptions(selectId, values) {
    try {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // 既存のオプション（「すべて」以外）をクリア
        const allOption = select.querySelector('option[value=""]');
        const allOptionText = allOption ? allOption.textContent : 'すべて';
        select.innerHTML = '';
        
        // 「すべて」オプションを再作成
        const newAllOption = document.createElement('option');
        newAllOption.value = '';
        newAllOption.textContent = allOptionText;
        select.appendChild(newAllOption);
        
        // 新しいオプションを追加
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
        
    } catch (error) {
        console.error('フィルタオプション設定中にエラーが発生:', error);
    }
}

// フィルタイベントリスナーを設定
function setupFilterEventListeners() {
    try {
        const filterSelects = [
            'filter-process',
            'filter-doc-type', 
            'filter-category',
            'filter-severity',
            'filter-status'
        ];
        
        filterSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                select.addEventListener('change', () => {
                    applyFilters();
                });
            }
        });
        
        // ソート機能のイベントリスナーを設定
        setupSortEventListeners();
        
    } catch (error) {
        console.error('フィルタイベントリスナー設定中にエラーが発生:', error);
    }
}

// ソートイベントリスナーを設定
function setupSortEventListeners() {
    try {
        // テーブルヘッダーのクリックイベントを設定（イベント委譲）
        document.addEventListener('click', (event) => {
            if (event.target.closest('.sortable')) {
                const header = event.target.closest('.sortable');
                const column = header.dataset.column;
                if (column) {
                    toggleSort(column);
                }
            }
        });
        
    } catch (error) {
        console.error('ソートイベントリスナー設定中にエラーが発生:', error);
    }
}

// フィルタを適用
function applyFilters() {
    try {
        const projectId = window.currentProjectId || getProjectIdFromUrl();
        if (!projectId) return;
        
        // 現在のフィルタ値を取得
        const filters = {
            process: getSelectedValues('filter-process'),
            docType: getSelectedValues('filter-doc-type'),
            category: getSelectedValues('filter-category'),
            severity: getSelectedValues('filter-severity'),
            status: getSelectedValues('filter-status')
        };
        
        // フィルタ状態を保存
        window.currentFilters = filters;
        
        // レビュー指摘を取得してフィルタリング
        let reviewFindings = DataManager.getReviewFindingsByProjectId(projectId);
        reviewFindings = filterReviewFindings(reviewFindings, filters);
        
        // テーブルを更新
        const container = document.getElementById('review-findings-container');
        if (container) {
            if (reviewFindings.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>フィルタ条件に一致するレビュー指摘がありません</p>
                    </div>
                `;
            } else {
                const tableHTML = generateReviewFindingsTable(reviewFindings);
                container.innerHTML = tableHTML;
                
                // ソートクラスを更新
                setTimeout(() => {
                    updateSortClasses();
                    setupTableScrollHandlers();
                    
                    // 仮想スクロールデータを更新（該当する場合）
                    if (window.updateVirtualScrollData && reviewFindings.length > 100) {
                        let sortedFindings = [...reviewFindings];
                        if (window.currentSort && window.currentSort.column) {
                            sortedFindings = sortReviewFindings(sortedFindings, window.currentSort.column, window.currentSort.direction);
                        } else {
                            sortedFindings = sortedFindings.sort((a, b) => 
                                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                            );
                        }
                        window.updateVirtualScrollData(sortedFindings);
                    }
                }, 0);
            }
        }
        
    } catch (error) {
        console.error('フィルタ適用中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'フィルタ適用');
    }
}

// 選択された値を取得
function getSelectedValues(selectId) {
    try {
        const select = document.getElementById(selectId);
        if (!select) return [];
        
        const selectedOptions = Array.from(select.selectedOptions);
        const values = selectedOptions.map(option => option.value).filter(value => value !== '');
        
        return values;
    } catch (error) {
        console.error('選択値取得中にエラーが発生:', error);
        return [];
    }
}

// レビュー指摘をフィルタリング
function filterReviewFindings(findings, filters) {
    try {
        return findings.filter(finding => {
            // 各フィルタ条件をチェック
            if (filters.process.length > 0 && !filters.process.includes(finding.process)) {
                return false;
            }
            if (filters.docType.length > 0 && !filters.docType.includes(finding.docType)) {
                return false;
            }
            if (filters.category.length > 0 && !filters.category.includes(finding.category)) {
                return false;
            }
            if (filters.severity.length > 0 && !filters.severity.includes(finding.severity)) {
                return false;
            }
            if (filters.status.length > 0 && !filters.status.includes(finding.status)) {
                return false;
            }
            
            return true;
        });
    } catch (error) {
        console.error('レビュー指摘フィルタリング中にエラーが発生:', error);
        return findings;
    }
}

// ソートを切り替え
function toggleSort(column) {
    try {
        // 現在のソート状態を取得
        if (!window.currentSort) {
            window.currentSort = { column: null, direction: 'asc' };
        }
        
        if (window.currentSort.column === column) {
            // 同じ列の場合は方向を切り替え
            window.currentSort.direction = window.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            // 異なる列の場合は新しい列で昇順
            window.currentSort.column = column;
            window.currentSort.direction = 'asc';
        }
        
        // フィルタを再適用（ソートも含む）
        applyFilters();
        
        // ソートクラスを更新
        updateSortClasses();
        
    } catch (error) {
        console.error('ソート切り替え中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'ソート切り替え');
    }
}

// すべてのフィルタをクリア
function clearAllFilters(projectId) {
    try {
        // フィルタ選択をリセット
        const filterSelects = [
            'filter-process',
            'filter-doc-type',
            'filter-category', 
            'filter-severity',
            'filter-status'
        ];
        
        filterSelects.forEach(selectId => {
            const select = document.getElementById(selectId);
            if (select) {
                // すべての選択を解除
                Array.from(select.options).forEach(option => {
                    option.selected = false;
                });
            }
        });
        
        // ソート状態もリセット
        window.currentSort = null;
        window.currentFilters = null;
        
        // フィルタを再適用（すべてクリアされた状態で）
        applyFilters();
        
    } catch (error) {
        console.error('フィルタクリア中にエラーが発生:', error);
        ErrorHandler.handleUnexpectedError(error, 'フィルタクリア');
    }
}

// ========================================
// 追加のUI ヘルパー関数
// ========================================

/**
 * 全てのモーダルを閉じる
 */
function closeAllModals() {
    try {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'flex') {
                hideModal(modal.id);
            }
        });
        console.log('全てのモーダルを閉じました');
    } catch (error) {
        console.error('モーダル一括閉じ中にエラーが発生:', error);
    }
}

/**
 * モーダルが開いているかチェック
 * @param {string} modalId - チェックするモーダルのID
 * @returns {boolean} モーダルが開いているかどうか
 */
function isModalOpen(modalId) {
    try {
        const modal = document.getElementById(modalId);
        return modal && modal.style.display === 'flex';
    } catch (error) {
        console.error('モーダル状態チェック中にエラーが発生:', error);
        return false;
    }
}

/**
 * リップル効果を要素に追加（レガシー関数 - AnimationControllerを使用）
 * @param {HTMLElement} element - リップル効果を適用する要素
 * @param {Event} event - クリックイベント
 */
function addRippleEffect(element, event) {
    const controller = getAnimationController();
    controller.triggerRipple(element, event);
}

/**
 * 現在開いているモーダルのIDを取得
 * @returns {string|null} 開いているモーダルのID（複数ある場合は最初の1つ）
 */
function getCurrentOpenModal() {
    try {
        const modals = document.querySelectorAll('.modal');
        for (const modal of modals) {
            if (modal.style.display === 'flex') {
                return modal.id;
            }
        }
        return null;
    } catch (error) {
        console.error('現在のモーダル取得中にエラーが発生:', error);
        return null;
    }
}

/**
 * フォームをリセットする
 * @param {string} formId - リセットするフォームのID
 */
function resetForm(formId) {
    try {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
            
            // カスタムバリデーションメッセージもクリア
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.setCustomValidity('');
                input.classList.remove('error');
            });
            
            console.log(`フォームをリセットしました: ${formId}`);
        }
    } catch (error) {
        console.error('フォームリセット中にエラーが発生:', error);
    }
}

/**
 * 要素にローディング状態を設定
 * @param {string|HTMLElement} element - 要素IDまたは要素
 * @param {boolean} loading - ローディング状態
 * @param {string} loadingText - ローディング中のテキスト
 */
function setLoadingState(element, loading, loadingText = '読み込み中...') {
    try {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (!el) return;

        if (loading) {
            el.disabled = true;
            el.dataset.originalText = el.textContent;
            el.textContent = loadingText;
            el.classList.add('loading');
        } else {
            el.disabled = false;
            if (el.dataset.originalText) {
                el.textContent = el.dataset.originalText;
                delete el.dataset.originalText;
            }
            el.classList.remove('loading');
        }
    } catch (error) {
        console.error('ローディング状態設定中にエラーが発生:', error);
    }
}

/**
 * 確認ダイアログを表示
 * @param {string} message - 確認メッセージ
 * @param {Function} onConfirm - 確認時のコールバック
 * @param {Function} onCancel - キャンセル時のコールバック
 */
function showConfirmDialog(message, onConfirm, onCancel = null) {
    try {
        // ブラウザの標準確認ダイアログを使用
        // 将来的にはカスタムモーダルに置き換え可能
        if (confirm(message)) {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        } else {
            if (typeof onCancel === 'function') {
                onCancel();
            }
        }
    } catch (error) {
        console.error('確認ダイアログ表示中にエラーが発生:', error);
    }
}

/**
 * 要素の表示/非表示を切り替え
 * @param {string|HTMLElement} element - 要素IDまたは要素
 * @param {boolean} visible - 表示するかどうか
 */
function toggleElementVisibility(element, visible) {
    try {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (!el) return;

        if (visible) {
            el.style.display = '';
            el.removeAttribute('hidden');
        } else {
            el.style.display = 'none';
            el.setAttribute('hidden', '');
        }
    } catch (error) {
        console.error('要素表示切り替え中にエラーが発生:', error);
    }
}

/**
 * スムーズスクロール
 * @param {string|HTMLElement} element - スクロール先の要素IDまたは要素
 * @param {Object} options - スクロールオプション
 */
function smoothScrollTo(element, options = {}) {
    try {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (!el) return;

        const defaultOptions = {
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
        };

        el.scrollIntoView({ ...defaultOptions, ...options });
    } catch (error) {
        console.error('スムーズスクロール中にエラーが発生:', error);
    }
}

/**
 * デバウンス関数
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ミリ秒）
 * @returns {Function} デバウンスされた関数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * スロットル関数
 * @param {Function} func - 実行する関数
 * @param {number} limit - 制限時間（ミリ秒）
 * @returns {Function} スロットルされた関数
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * 要素のアニメーション（レガシー関数 - AnimationControllerを使用）
 * @param {string|HTMLElement} element - アニメーション対象の要素IDまたは要素
 * @param {string} animationClass - アニメーションCSSクラス
 * @param {number} duration - アニメーション時間（ミリ秒）
 */
function animateElement(element, animationClass, duration = 300) {
    const controller = getAnimationController();
    return controller.animateElement(element, animationClass, duration);
}

/**
 * キーボードショートカットの設定
 * @param {string} key - キー（例: 'Escape', 'Enter'）
 * @param {Function} callback - コールバック関数
 * @param {Object} options - オプション
 */
function addKeyboardShortcut(key, callback, options = {}) {
    try {
        const { ctrlKey = false, altKey = false, shiftKey = false } = options;
        
        const handler = (event) => {
            if (event.key === key && 
                event.ctrlKey === ctrlKey && 
                event.altKey === altKey && 
                event.shiftKey === shiftKey) {
                event.preventDefault();
                callback(event);
            }
        };
        
        document.addEventListener('keydown', handler);
        
        // クリーンアップ関数を返す
        return () => {
            document.removeEventListener('keydown', handler);
        };
    } catch (error) {
        console.error('キーボードショートカット設定中にエラーが発生:', error);
        return () => {}; // 空のクリーンアップ関数
    }
}

// ========================================
// グローバルキーボードショートカットの設定
// ========================================

// ESCキーで全てのモーダルを閉じる
addKeyboardShortcut('Escape', () => {
    const openModal = getCurrentOpenModal();
    if (openModal) {
        hideModal(openModal);
    }
});

// Ctrl+Sでデータエクスポート（ブラウザのデフォルト保存を防ぐ）
addKeyboardShortcut('s', () => {
    const exportBtn = document.getElementById('export-data-btn');
    if (exportBtn) {
        exportBtn.click();
    }
}, { ctrlKey: true });

console.log('UI ヘルパー関数とキーボードショートカットが初期化されました');

// ========================================
// AnimationController クラス
// ========================================

/**
 * マイクロインタラクションとアニメーションを管理するクラス
 */
class AnimationController {
    constructor() {
        this.animationsEnabled = true;
        this.reducedMotionPreferred = false;
        this.init();
    }

    /**
     * 初期化処理
     */
    init() {
        // システムのreduced-motion設定を検出
        this.detectReducedMotionPreference();
        
        // メディアクエリの変更を監視
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            mediaQuery.addEventListener('change', () => {
                this.detectReducedMotionPreference();
            });
        }

        // LocalStorageからアニメーション設定を読み込み
        this.loadAnimationSettings();
    }

    /**
     * reduced-motion設定を検出
     */
    detectReducedMotionPreference() {
        if (window.matchMedia) {
            this.reducedMotionPreferred = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }
    }

    /**
     * アニメーション設定をLocalStorageから読み込み
     */
    loadAnimationSettings() {
        try {
            const saved = localStorage.getItem('spec-tracking-site:animationsEnabled');
            if (saved !== null) {
                this.animationsEnabled = JSON.parse(saved);
            }
        } catch (error) {
            console.error('アニメーション設定の読み込みに失敗:', error);
        }
    }

    /**
     * アニメーション設定をLocalStorageに保存
     */
    saveAnimationSettings() {
        try {
            localStorage.setItem('spec-tracking-site:animationsEnabled', JSON.stringify(this.animationsEnabled));
        } catch (error) {
            console.error('アニメーション設定の保存に失敗:', error);
        }
    }

    /**
     * アニメーションが有効かどうかを確認
     * @returns {boolean} アニメーション有効フラグ
     */
    isAnimationEnabled() {
        return this.animationsEnabled && !this.reducedMotionPreferred;
    }

    /**
     * アニメーション有効/無効を設定
     * @param {boolean} enabled - アニメーション有効フラグ
     */
    setAnimationEnabled(enabled) {
        this.animationsEnabled = enabled;
        this.saveAnimationSettings();
        
        // DOM要素にクラスを追加/削除してアニメーションを制御
        if (enabled && !this.reducedMotionPreferred) {
            document.body.classList.remove('animations-disabled');
        } else {
            document.body.classList.add('animations-disabled');
        }
    }

    /**
     * reduced-motion設定を尊重するかどうか
     * @returns {boolean} reduced-motion設定
     */
    respectsReducedMotion() {
        return this.reducedMotionPreferred;
    }

    /**
     * 要素をフェードイン
     * @param {HTMLElement} element - 対象要素
     * @param {number} duration - アニメーション時間（ミリ秒）
     * @returns {Promise<void>} アニメーション完了Promise
     */
    fadeIn(element, duration = 300) {
        return new Promise((resolve) => {
            if (!this.isAnimationEnabled()) {
                element.style.opacity = '1';
                resolve();
                return;
            }

            element.style.opacity = '0';
            element.style.transition = `opacity ${duration}ms ease-in`;
            
            // 次のフレームで実行（CSSトランジションを確実に適用）
            requestAnimationFrame(() => {
                element.style.opacity = '1';
                
                setTimeout(() => {
                    element.style.transition = '';
                    resolve();
                }, duration);
            });
        });
    }

    /**
     * 要素をフェードアウト
     * @param {HTMLElement} element - 対象要素
     * @param {number} duration - アニメーション時間（ミリ秒）
     * @returns {Promise<void>} アニメーション完了Promise
     */
    fadeOut(element, duration = 300) {
        return new Promise((resolve) => {
            if (!this.isAnimationEnabled()) {
                element.style.opacity = '0';
                resolve();
                return;
            }

            element.style.transition = `opacity ${duration}ms ease-out`;
            element.style.opacity = '0';
            
            setTimeout(() => {
                element.style.transition = '';
                resolve();
            }, duration);
        });
    }

    /**
     * 要素をスライドイン
     * @param {HTMLElement} element - 対象要素
     * @param {'up'|'down'|'left'|'right'} direction - スライド方向
     * @param {number} duration - アニメーション時間（ミリ秒）
     * @returns {Promise<void>} アニメーション完了Promise
     */
    slideIn(element, direction = 'up', duration = 300) {
        return new Promise((resolve) => {
            if (!this.isAnimationEnabled()) {
                element.style.transform = 'translate(0, 0)';
                element.style.opacity = '1';
                resolve();
                return;
            }

            // 初期位置を設定
            let initialTransform;
            switch (direction) {
                case 'up':
                    initialTransform = 'translateY(20px)';
                    break;
                case 'down':
                    initialTransform = 'translateY(-20px)';
                    break;
                case 'left':
                    initialTransform = 'translateX(20px)';
                    break;
                case 'right':
                    initialTransform = 'translateX(-20px)';
                    break;
                default:
                    initialTransform = 'translateY(20px)';
            }

            element.style.transform = initialTransform;
            element.style.opacity = '0';
            element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
            
            requestAnimationFrame(() => {
                element.style.transform = 'translate(0, 0)';
                element.style.opacity = '1';
                
                setTimeout(() => {
                    element.style.transition = '';
                    resolve();
                }, duration);
            });
        });
    }

    /**
     * 要素をスケールイン
     * @param {HTMLElement} element - 対象要素
     * @param {number} duration - アニメーション時間（ミリ秒）
     * @returns {Promise<void>} アニメーション完了Promise
     */
    scaleIn(element, duration = 300) {
        return new Promise((resolve) => {
            if (!this.isAnimationEnabled()) {
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
                resolve();
                return;
            }

            element.style.transform = 'scale(0.9)';
            element.style.opacity = '0';
            element.style.transition = `transform ${duration}ms ease-out, opacity ${duration}ms ease-out`;
            
            requestAnimationFrame(() => {
                element.style.transform = 'scale(1)';
                element.style.opacity = '1';
                
                setTimeout(() => {
                    element.style.transition = '';
                    resolve();
                }, duration);
            });
        });
    }

    /**
     * ボタンにリップル効果を追加
     * @param {HTMLElement} button - 対象ボタン
     */
    addRippleEffect(button) {
        if (!this.isAnimationEnabled()) {
            return;
        }

        button.addEventListener('click', (event) => {
            this.triggerRipple(button, event);
        });
    }

    /**
     * リップル効果をトリガー
     * @param {HTMLElement} button - 対象ボタン
     * @param {MouseEvent} event - クリックイベント
     */
    triggerRipple(button, event) {
        if (!this.isAnimationEnabled()) {
            return;
        }

        try {
            // 既存のリップル要素を削除
            const existingRipple = button.querySelector('.ripple');
            if (existingRipple) {
                existingRipple.remove();
            }

            // リップル要素を作成
            const ripple = document.createElement('span');
            ripple.className = 'ripple';
            
            // 要素の位置とサイズを取得
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = event.clientX - rect.left - size / 2;
            const y = event.clientY - rect.top - size / 2;
            
            // リップルのスタイルを設定
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            // 要素にリップルを追加
            button.appendChild(ripple);
            
            // アニメーション完了後にリップル要素を削除
            setTimeout(() => {
                if (ripple.parentNode) {
                    ripple.parentNode.removeChild(ripple);
                }
            }, 600);
            
        } catch (error) {
            console.error('リップル効果の追加中にエラーが発生:', error);
        }
    }

    /**
     * 要素にアニメーションクラスを適用
     * @param {HTMLElement|string} element - 対象要素またはID
     * @param {string} animationClass - アニメーションCSSクラス
     * @param {number} duration - アニメーション時間（ミリ秒）
     * @returns {Promise<void>} アニメーション完了Promise
     */
    animateElement(element, animationClass, duration = 300) {
        return new Promise((resolve) => {
            try {
                const el = typeof element === 'string' ? document.getElementById(element) : element;
                if (!el) {
                    resolve();
                    return;
                }

                if (!this.isAnimationEnabled()) {
                    resolve();
                    return;
                }

                el.classList.add(animationClass);
                
                setTimeout(() => {
                    el.classList.remove(animationClass);
                    resolve();
                }, duration);
            } catch (error) {
                console.error('要素アニメーション中にエラーが発生:', error);
                resolve();
            }
        });
    }
}

// AnimationControllerのグローバルインスタンス
let animationController = null;

/**
 * AnimationControllerを初期化
 */
function initializeAnimationController() {
    if (!animationController) {
        animationController = new AnimationController();
        console.log('AnimationControllerが初期化されました');
    }
    return animationController;
}

/**
 * AnimationControllerインスタンスを取得
 * @returns {AnimationController} AnimationControllerインスタンス
 */
function getAnimationController() {
    if (!animationController) {
        return initializeAnimationController();
    }
    return animationController;
}

/**
 * 既存のボタンにリップル効果を追加
 */
function enhanceButtonsWithRippleEffect() {
    try {
        const controller = getAnimationController();
        
        // すべてのボタンにリップル効果を追加
        const buttons = document.querySelectorAll('.btn, button:not(.modal-close):not(.theme-toggle)');
        buttons.forEach(button => {
            try {
                // 既にリップル効果が追加されていない場合のみ追加
                if (!button.hasAttribute('data-ripple-enhanced')) {
                    controller.addRippleEffect(button);
                    button.setAttribute('data-ripple-enhanced', 'true');
                }
            } catch (buttonError) {
                console.error('ボタンへのリップル効果追加に失敗:', buttonError);
            }
        });
    } catch (error) {
        console.error('ボタンリップル効果の強化に失敗:', error);
    }
}

/**
 * アニメーション設定切り替えUI要素を作成
 */
function createAnimationToggleUI() {
    const controller = getAnimationController();
    
    // アニメーション設定切り替えボタンを作成
    const toggleButton = document.createElement('button');
    toggleButton.className = 'btn btn-secondary animation-toggle';
    toggleButton.innerHTML = `
        <span class="nav-icon">${controller.isAnimationEnabled() ? '🎬' : '⏸️'}</span>
        <span class="nav-text">${controller.isAnimationEnabled() ? 'アニメーション有効' : 'アニメーション無効'}</span>
    `;
    toggleButton.title = 'アニメーション設定を切り替え';
    toggleButton.setAttribute('aria-label', 'アニメーション設定を切り替え');
    
    // クリックイベントを追加
    toggleButton.addEventListener('click', () => {
        const newState = !controller.isAnimationEnabled();
        controller.setAnimationEnabled(newState);
        
        // ボタンの表示を更新
        const icon = toggleButton.querySelector('.nav-icon');
        const text = toggleButton.querySelector('.nav-text');
        
        if (icon) icon.textContent = newState ? '🎬' : '⏸️';
        if (text) text.textContent = newState ? 'アニメーション有効' : 'アニメーション無効';
        
        // 成功メッセージを表示
        showMessage(
            `アニメーションを${newState ? '有効' : '無効'}にしました`,
            'success'
        );
    });
    
    return toggleButton;
}

/**
 * モバイルナビゲーションにアニメーション設定を追加
 */
function addAnimationToggleToMobileNav() {
    try {
        const mobileNavContent = document.querySelector('.mobile-nav-content');
        if (mobileNavContent) {
            // 既に追加されている場合はスキップ
            if (mobileNavContent.querySelector('.animation-toggle-mobile')) {
                return;
            }
            
            const toggleButton = createAnimationToggleUI();
            toggleButton.className = 'mobile-nav-item animation-toggle-mobile';
            
            // テーマ切り替えボタンの後に挿入
            const themeToggle = mobileNavContent.querySelector('.theme-toggle-mobile');
            if (themeToggle) {
                themeToggle.parentNode.insertBefore(toggleButton, themeToggle.nextSibling);
            } else {
                mobileNavContent.appendChild(toggleButton);
            }
        }
    } catch (error) {
        console.error('モバイルナビゲーションへのアニメーション設定追加に失敗:', error);
    }
}

/**
 * デスクトップナビゲーションにアニメーション設定を追加
 */
function addAnimationToggleToDesktopNav() {
    try {
        const desktopNav = document.querySelector('.desktop-nav');
        if (desktopNav) {
            // 既に追加されている場合はスキップ
            if (desktopNav.querySelector('.animation-toggle')) {
                return;
            }
            
            const toggleButton = createAnimationToggleUI();
            toggleButton.className = 'btn btn-secondary animation-toggle';
            
            // テーマ切り替えボタンの後に挿入
            const themeToggle = desktopNav.querySelector('.theme-toggle');
            if (themeToggle) {
                themeToggle.parentNode.insertBefore(toggleButton, themeToggle.nextSibling);
            } else {
                desktopNav.appendChild(toggleButton);
            }
        }
    } catch (error) {
        console.error('デスクトップナビゲーションへのアニメーション設定追加に失敗:', error);
    }
}

/**
 * 動的に追加されるボタンを監視してリップル効果を追加
 */
function observeButtonAdditions() {
    const controller = getAnimationController();
    
    // MutationObserverを作成
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // 追加されたノードがボタンの場合
                    if (node.matches && (node.matches('.btn') || node.matches('button:not(.modal-close):not(.theme-toggle)'))) {
                        if (!node.hasAttribute('data-ripple-enhanced')) {
                            controller.addRippleEffect(node);
                            node.setAttribute('data-ripple-enhanced', 'true');
                        }
                    }
                    
                    // 追加されたノード内のボタンを検索
                    const buttons = node.querySelectorAll && node.querySelectorAll('.btn, button:not(.modal-close):not(.theme-toggle)');
                    if (buttons) {
                        buttons.forEach(button => {
                            if (!button.hasAttribute('data-ripple-enhanced')) {
                                controller.addRippleEffect(button);
                                button.setAttribute('data-ripple-enhanced', 'true');
                            }
                        });
                    }
                }
            });
        });
    });
    
    // DOM全体を監視
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    return observer;
}

// ========================================
// AccessibilityManager クラス
// ========================================

/**
 * アクセシビリティ機能を管理するクラス
 */
class AccessibilityManager {
    constructor() {
        this.focusTrapStack = [];
        this.lastFocusedElement = null;
        this.announceElement = null;
        this.init();
    }

    /**
     * 初期化処理
     */
    init() {
        // スクリーンリーダー用のアナウンス要素を作成
        this.createAnnounceElement();
        
        // キーボードナビゲーションの初期化
        this.initializeKeyboardNavigation();
        
        // フォーカス表示の強化
        this.enhanceFocusVisibility();
    }

    /**
     * スクリーンリーダー用のアナウンス要素を作成
     */
    createAnnounceElement() {
        if (!this.announceElement) {
            this.announceElement = document.createElement('div');
            this.announceElement.setAttribute('aria-live', 'polite');
            this.announceElement.setAttribute('aria-atomic', 'true');
            this.announceElement.className = 'sr-only';
            this.announceElement.id = 'accessibility-announcer';
            document.body.appendChild(this.announceElement);
        }
    }

    /**
     * フォーカス表示を設定
     * @param {HTMLElement} element - 対象要素
     */
    setFocusVisible(element) {
        if (!element) return;
        
        element.classList.add('focus-visible');
        element.setAttribute('tabindex', '0');
        
        // フォーカスイベントリスナーを追加
        element.addEventListener('focus', () => {
            element.classList.add('focus-visible');
        });
        
        element.addEventListener('blur', () => {
            element.classList.remove('focus-visible');
        });
    }

    /**
     * フォーカス順序を管理
     * @param {HTMLElement} container - コンテナ要素
     */
    manageFocusOrder(container) {
        if (!container) return;
        
        const focusableElements = this.getFocusableElements(container);
        
        focusableElements.forEach((element, index) => {
            element.setAttribute('tabindex', index === 0 ? '0' : '-1');
            
            // 矢印キーナビゲーションを追加
            element.addEventListener('keydown', (e) => {
                this.handleArrowKeyNavigation(e, focusableElements, index);
            });
        });
    }

    /**
     * フォーカス可能な要素を取得
     * @param {HTMLElement} container - コンテナ要素
     * @returns {HTMLElement[]} フォーカス可能な要素の配列
     */
    getFocusableElements(container) {
        const selector = [
            'button:not([disabled])',
            '[href]',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        return Array.from(container.querySelectorAll(selector))
            .filter(element => {
                return element.offsetWidth > 0 && 
                       element.offsetHeight > 0 && 
                       !element.hidden;
            });
    }

    /**
     * 矢印キーナビゲーションを処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @param {HTMLElement[]} elements - フォーカス可能な要素の配列
     * @param {number} currentIndex - 現在のインデックス
     */
    handleArrowKeyNavigation(event, elements, currentIndex) {
        let newIndex = currentIndex;
        
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowRight':
                event.preventDefault();
                newIndex = (currentIndex + 1) % elements.length;
                break;
            case 'ArrowUp':
            case 'ArrowLeft':
                event.preventDefault();
                newIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1;
                break;
            case 'Home':
                event.preventDefault();
                newIndex = 0;
                break;
            case 'End':
                event.preventDefault();
                newIndex = elements.length - 1;
                break;
            default:
                return;
        }
        
        // tabindexを更新
        elements.forEach((el, index) => {
            el.setAttribute('tabindex', index === newIndex ? '0' : '-1');
        });
        
        // 新しい要素にフォーカス
        elements[newIndex].focus();
    }

    /**
     * フォーカストラップを設定
     * @param {HTMLElement} container - トラップするコンテナ
     */
    trapFocus(container) {
        if (!container) return;
        
        const focusableElements = this.getFocusableElements(container);
        if (focusableElements.length === 0) return;
        
        // 現在のフォーカス要素を記録
        this.lastFocusedElement = document.activeElement;
        
        // フォーカストラップをスタックに追加
        this.focusTrapStack.push({
            container,
            focusableElements,
            firstElement: focusableElements[0],
            lastElement: focusableElements[focusableElements.length - 1]
        });
        
        // 最初の要素にフォーカス
        focusableElements[0].focus();
        
        // キーボードイベントリスナーを追加
        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                this.handleTabInTrap(e, focusableElements);
            } else if (e.key === 'Escape') {
                this.releaseFocusTrap();
            }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        
        // クリーンアップ関数を保存
        const currentTrap = this.focusTrapStack[this.focusTrapStack.length - 1];
        currentTrap.cleanup = () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }

    /**
     * フォーカストラップ内でのTabキーを処理
     * @param {KeyboardEvent} event - キーボードイベント
     * @param {HTMLElement[]} focusableElements - フォーカス可能な要素
     */
    handleTabInTrap(event, focusableElements) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    /**
     * フォーカストラップを解除
     */
    releaseFocusTrap() {
        if (this.focusTrapStack.length === 0) return;
        
        const trap = this.focusTrapStack.pop();
        
        // クリーンアップ
        if (trap.cleanup) {
            trap.cleanup();
        }
        
        // 元の要素にフォーカスを戻す
        if (this.lastFocusedElement && this.lastFocusedElement.focus) {
            this.lastFocusedElement.focus();
        }
        
        this.lastFocusedElement = null;
    }

    /**
     * ARIA ラベルを設定
     * @param {HTMLElement} element - 対象要素
     * @param {string} label - ラベルテキスト
     */
    setAriaLabel(element, label) {
        if (!element || !label) return;
        
        element.setAttribute('aria-label', label);
    }

    /**
     * ARIA ロールを設定
     * @param {HTMLElement} element - 対象要素
     * @param {string} role - ロール名
     */
    setAriaRole(element, role) {
        if (!element || !role) return;
        
        element.setAttribute('role', role);
    }

    /**
     * スクリーンリーダーにメッセージをアナウンス
     * @param {string} message - アナウンスするメッセージ
     * @param {'polite'|'assertive'} priority - 優先度
     */
    announceToScreenReader(message, priority = 'polite') {
        if (!message || !this.announceElement) return;
        
        // aria-liveを設定
        this.announceElement.setAttribute('aria-live', priority);
        
        // メッセージを設定
        this.announceElement.textContent = message;
        
        // 少し遅延してからクリア（スクリーンリーダーが読み上げるため）
        setTimeout(() => {
            if (this.announceElement) {
                this.announceElement.textContent = '';
            }
        }, 1000);
    }

    /**
     * キーボードナビゲーションを有効化
     * @param {HTMLElement} container - コンテナ要素
     */
    enableKeyboardNavigation(container) {
        if (!container) return;
        
        // フォーカス順序を管理
        this.manageFocusOrder(container);
        
        // キーボードショートカットを追加
        container.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }

    /**
     * キーボードショートカットを処理
     * @param {KeyboardEvent} event - キーボードイベント
     */
    handleKeyboardShortcuts(event) {
        // Enter または Space でボタンをアクティベート
        if ((event.key === 'Enter' || event.key === ' ') && 
            event.target.matches('button, [role="button"]')) {
            event.preventDefault();
            event.target.click();
        }
        
        // Escapeでモーダルを閉じる
        if (event.key === 'Escape') {
            const openModal = document.querySelector('.modal[style*="display: flex"]');
            if (openModal) {
                const modalId = openModal.id;
                if (modalId && typeof hideModal === 'function') {
                    hideModal(modalId);
                }
            }
        }
    }

    /**
     * フォーカス表示を強化
     */
    enhanceFocusVisibility() {
        // すべてのインタラクティブ要素にフォーカス表示を追加
        const interactiveElements = document.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"]'
        );
        
        interactiveElements.forEach(element => {
            this.setFocusVisible(element);
        });
    }

    /**
     * カラーコントラスト比を検証
     * @param {string} foreground - 前景色（例: '#000000'）
     * @param {string} background - 背景色（例: '#ffffff'）
     * @returns {boolean} WCAG AA基準を満たすかどうか
     */
    validateColorContrast(foreground, background) {
        try {
            // 簡易的なコントラスト比計算
            const getLuminance = (color) => {
                const rgb = parseInt(color.slice(1), 16);
                const r = (rgb >> 16) & 0xff;
                const g = (rgb >> 8) & 0xff;
                const b = (rgb >> 0) & 0xff;
                
                const [rs, gs, bs] = [r, g, b].map(c => {
                    c = c / 255;
                    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
                });
                
                return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
            };
            
            const l1 = getLuminance(foreground);
            const l2 = getLuminance(background);
            const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
            
            // WCAG AA基準: 4.5:1以上
            return ratio >= 4.5;
        } catch (error) {
            console.error('カラーコントラスト検証中にエラーが発生:', error);
            return false;
        }
    }

    /**
     * ハイコントラストモードに調整
     */
    adjustForHighContrast() {
        // システムのハイコントラスト設定を検出
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
            this.announceToScreenReader('ハイコントラストモードが有効になりました');
        }
    }

    /**
     * キーボードナビゲーションの初期化
     */
    initializeKeyboardNavigation() {
        // 全体的なキーボードナビゲーションを設定
        this.enableKeyboardNavigation(document.body);
        
        // ハイコントラスト設定を適用
        this.adjustForHighContrast();
        
        // メディアクエリの変更を監視
        if (window.matchMedia) {
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            contrastQuery.addEventListener('change', () => {
                this.adjustForHighContrast();
            });
        }
    }
}

// AccessibilityManagerのグローバルインスタンス
let accessibilityManager = null;

/**
 * AccessibilityManagerを初期化
 */
function initializeAccessibilityManager() {
    if (!accessibilityManager) {
        accessibilityManager = new AccessibilityManager();
        console.log('AccessibilityManagerが初期化されました');
    }
    return accessibilityManager;
}

/**
 * AccessibilityManagerインスタンスを取得
 * @returns {AccessibilityManager} AccessibilityManagerインスタンス
 */
function getAccessibilityManager() {
    if (!accessibilityManager) {
        return initializeAccessibilityManager();
    }
    return accessibilityManager;
}

// ========================================
// ResponsiveLayoutManager クラス
// ========================================

/**
 * レスポンシブデザインとレイアウト管理を行うクラス
 */
class ResponsiveLayoutManager {
    constructor() {
        this.mobileNavOpen = false;
        this.currentBreakpoint = this.getCurrentBreakpoint();
        this.mobileMenuToggle = null;
        this.mobileNav = null;
        this.mobileNavOverlay = null;
        
        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupResizeObserver();
        this.updateLayoutForCurrentBreakpoint();
    }

    /**
     * DOM要素の取得
     */
    setupElements() {
        this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.mobileNav = document.getElementById('mobile-nav');
        this.mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // ハンバーガーメニューボタンのクリック
        if (this.mobileMenuToggle) {
            this.mobileMenuToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleMobileNav();
            });
        }

        // オーバーレイのクリック
        if (this.mobileNavOverlay) {
            this.mobileNavOverlay.addEventListener('click', () => {
                this.hideMobileNav();
            });
        }

        // ESCキーでモバイルナビを閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.mobileNavOpen) {
                this.hideMobileNav();
            }
        });

        // モバイルナビ内のボタンイベント
        this.setupMobileNavButtons();
    }

    /**
     * モバイルナビ内のボタンイベントを設定
     */
    setupMobileNavButtons() {
        // モバイル版テーマ切り替えボタン
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
        if (mobileThemeToggle) {
            mobileThemeToggle.addEventListener('click', () => {
                // デスクトップ版のテーマ切り替えボタンをクリック
                const desktopThemeToggle = document.getElementById('theme-toggle');
                if (desktopThemeToggle) {
                    desktopThemeToggle.click();
                }
                this.hideMobileNav();
            });
        }

        // モバイル版プロジェクト追加ボタン
        const mobileAddProjectBtn = document.getElementById('mobile-add-project-btn');
        if (mobileAddProjectBtn) {
            mobileAddProjectBtn.addEventListener('click', () => {
                // デスクトップ版のプロジェクト追加ボタンをクリック
                const desktopAddProjectBtn = document.getElementById('add-project-btn');
                if (desktopAddProjectBtn) {
                    desktopAddProjectBtn.click();
                }
                this.hideMobileNav();
            });
        }

        // モバイル版データエクスポートボタン
        const mobileExportDataBtn = document.getElementById('mobile-export-data-btn');
        if (mobileExportDataBtn) {
            mobileExportDataBtn.addEventListener('click', () => {
                // デスクトップ版のデータエクスポートボタンをクリック
                const desktopExportDataBtn = document.getElementById('export-data-btn');
                if (desktopExportDataBtn) {
                    desktopExportDataBtn.click();
                }
                this.hideMobileNav();
            });
        }
    }

    /**
     * リサイズオブザーバーの設定
     */
    setupResizeObserver() {
        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.updateLayoutForCurrentBreakpoint();
                }
            });
            resizeObserver.observe(document.body);
        } else {
            // ResizeObserverが利用できない場合はwindow.resizeイベントを使用
            window.addEventListener('resize', () => {
                const newBreakpoint = this.getCurrentBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.updateLayoutForCurrentBreakpoint();
                }
            });
        }
    }

    /**
     * 現在のブレークポイントを取得
     * @returns {string} ブレークポイント名
     */
    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width <= 480) return 'xs';
        if (width <= 768) return 'sm';
        if (width <= 1024) return 'md';
        if (width <= 1280) return 'lg';
        return 'xl';
    }

    /**
     * モバイル表示かどうかを判定
     * @returns {boolean} モバイル表示かどうか
     */
    isMobile() {
        return this.currentBreakpoint === 'xs' || this.currentBreakpoint === 'sm';
    }

    /**
     * タブレット表示かどうかを判定
     * @returns {boolean} タブレット表示かどうか
     */
    isTablet() {
        return this.currentBreakpoint === 'md';
    }

    /**
     * デスクトップ表示かどうかを判定
     * @returns {boolean} デスクトップ表示かどうか
     */
    isDesktop() {
        return this.currentBreakpoint === 'lg' || this.currentBreakpoint === 'xl';
    }

    /**
     * ブレークポイントに応じてレイアウトを調整
     */
    updateLayoutForCurrentBreakpoint() {
        // モバイル表示でない場合はモバイルナビを閉じる
        if (!this.isMobile() && this.mobileNavOpen) {
            this.hideMobileNav();
        }

        // レイアウト調整のイベントを発火
        document.dispatchEvent(new CustomEvent('breakpointChange', {
            detail: {
                breakpoint: this.currentBreakpoint,
                isMobile: this.isMobile(),
                isTablet: this.isTablet(),
                isDesktop: this.isDesktop()
            }
        }));
    }

    /**
     * モバイルナビゲーションを表示
     */
    showMobileNav() {
        if (!this.mobileNav || !this.mobileNavOverlay || !this.mobileMenuToggle) {
            return;
        }

        this.mobileNavOpen = true;
        
        // クラスを追加
        this.mobileNav.classList.add('open');
        this.mobileNavOverlay.classList.add('show');
        this.mobileMenuToggle.classList.add('active');
        
        // ARIA属性を更新
        this.mobileNav.setAttribute('aria-hidden', 'false');
        this.mobileNavOverlay.setAttribute('aria-hidden', 'false');
        this.mobileMenuToggle.setAttribute('aria-expanded', 'true');
        this.mobileMenuToggle.setAttribute('aria-label', 'メニューを閉じる');
        
        // ボディのスクロールを無効化
        document.body.style.overflow = 'hidden';
        
        // フォーカスをモバイルナビ内の最初の要素に移動
        const firstFocusableElement = this.mobileNav.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
        if (firstFocusableElement) {
            setTimeout(() => {
                firstFocusableElement.focus();
            }, 100);
        }
    }

    /**
     * モバイルナビゲーションを非表示
     */
    hideMobileNav() {
        if (!this.mobileNav || !this.mobileNavOverlay || !this.mobileMenuToggle) {
            return;
        }

        this.mobileNavOpen = false;
        
        // クラスを削除
        this.mobileNav.classList.remove('open');
        this.mobileNavOverlay.classList.remove('show');
        this.mobileMenuToggle.classList.remove('active');
        
        // ARIA属性を更新
        this.mobileNav.setAttribute('aria-hidden', 'true');
        this.mobileNavOverlay.setAttribute('aria-hidden', 'true');
        this.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        this.mobileMenuToggle.setAttribute('aria-label', 'メニューを開く');
        
        // ボディのスクロールを有効化
        document.body.style.overflow = '';
        
        // フォーカスをハンバーガーメニューボタンに戻す
        this.mobileMenuToggle.focus();
    }

    /**
     * モバイルナビゲーションの表示/非表示を切り替え
     */
    toggleMobileNav() {
        if (this.mobileNavOpen) {
            this.hideMobileNav();
        } else {
            this.showMobileNav();
        }
    }

    /**
     * カードレイアウトに切り替え
     */
    switchToCardLayout() {
        const projectGrid = document.getElementById('project-grid');
        const projectTableContainer = document.getElementById('project-table-container');
        
        if (projectGrid && projectTableContainer) {
            projectGrid.style.display = 'grid';
            projectTableContainer.style.display = 'none';
        }
    }

    /**
     * テーブルレイアウトに切り替え
     */
    switchToTableLayout() {
        const projectGrid = document.getElementById('project-grid');
        const projectTableContainer = document.getElementById('project-table-container');
        
        if (projectGrid && projectTableContainer) {
            projectGrid.style.display = 'none';
            projectTableContainer.style.display = 'block';
        }
    }

    /**
     * ブレークポイントに応じてレイアウトを調整
     * @param {string} breakpoint - ブレークポイント名
     */
    adjustLayoutForBreakpoint(breakpoint) {
        // モバイル・タブレットではカードレイアウト、デスクトップではテーブルレイアウト
        if (breakpoint === 'xs' || breakpoint === 'sm') {
            this.switchToCardLayout();
        } else {
            // デスクトップでは両方のレイアウトを利用可能にする
            // デフォルトはカードレイアウト
            this.switchToCardLayout();
        }
    }
}

// ========================================
// ResponsiveLayoutManager の初期化
// ========================================

// グローバル変数として ResponsiveLayoutManager インスタンスを作成
let responsiveLayoutManager;

// ResponsiveLayoutManagerの初期化（メイン初期化に統合）

// ========================================
// モバイルナビゲーション用のグローバル関数
// ========================================

/**
 * モバイルナビゲーションを表示
 */
function showMobileNav() {
    if (responsiveLayoutManager) {
        responsiveLayoutManager.showMobileNav();
    }
}

/**
 * モバイルナビゲーションを非表示
 */
function hideMobileNav() {
    if (responsiveLayoutManager) {
        responsiveLayoutManager.hideMobileNav();
    }
}

/**
 * モバイルナビゲーションの表示/非表示を切り替え
 */
function toggleMobileNav() {
    if (responsiveLayoutManager) {
        responsiveLayoutManager.toggleMobileNav();
    }
}

/**
 * 現在のブレークポイントを取得
 * @returns {string} ブレークポイント名
 */
function getCurrentBreakpoint() {
    if (responsiveLayoutManager) {
        return responsiveLayoutManager.getCurrentBreakpoint();
    }
    return 'xl'; // デフォルト値
}

/**
 * モバイル表示かどうかを判定
 * @returns {boolean} モバイル表示かどうか
 */
function isMobile() {
    if (responsiveLayoutManager) {
        return responsiveLayoutManager.isMobile();
    }
    return window.innerWidth <= 768; // フォールバック
}

console.log('モバイルナビゲーション機能が読み込まれました');

// ========================================
// テーマ管理クラス
// ========================================

/**
 * テーマの切り替えとダークモード対応を管理するクラス
 */
class ThemeManager {
    constructor() {
        this.currentTheme = 'auto';
        this.storageKey = 'spec-tracking-site:theme';
        this.initialize();
    }

    /**
     * テーママネージャーを初期化
     */
    initialize() {
        this.loadThemePreference();
        this.detectSystemTheme();
        this.applyTheme(this.resolveTheme());
        this.setupEventListeners();
        this.setupSystemThemeListener();
    }

    /**
     * 現在のテーマを取得
     * @returns {'light'|'dark'|'auto'} 現在のテーマ
     */
    getCurrentTheme() {
        return this.currentTheme;
    }

    /**
     * テーマを設定
     * @param {'light'|'dark'|'auto'} theme - 設定するテーマ
     */
    setTheme(theme) {
        if (!['light', 'dark', 'auto'].includes(theme)) {
            console.warn('無効なテーマが指定されました:', theme);
            return;
        }

        this.currentTheme = theme;
        this.saveThemePreference(theme);
        this.applyTheme(this.resolveTheme());
        this.updateThemeToggleButtons();
    }

    /**
     * テーマを切り替え
     */
    toggleTheme() {
        const themes = ['light', 'dark', 'auto'];
        const currentIndex = themes.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        this.setTheme(themes[nextIndex]);
    }

    /**
     * システムテーマを検出
     * @returns {'light'|'dark'} システムテーマ
     */
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * 実際に適用するテーマを解決
     * @returns {'light'|'dark'} 解決されたテーマ
     */
    resolveTheme() {
        if (this.currentTheme === 'auto') {
            return this.detectSystemTheme();
        }
        return this.currentTheme;
    }

    /**
     * テーマ設定をlocalStorageに保存
     * @param {string} theme - 保存するテーマ
     */
    saveThemePreference(theme) {
        try {
            localStorage.setItem(this.storageKey, theme);
        } catch (error) {
            console.warn('テーマ設定の保存に失敗しました:', error);
        }
    }

    /**
     * テーマ設定をlocalStorageから読み込み
     * @returns {string|null} 保存されたテーマ設定
     */
    loadThemePreference() {
        try {
            const savedTheme = localStorage.getItem(this.storageKey);
            if (savedTheme && ['light', 'dark', 'auto'].includes(savedTheme)) {
                this.currentTheme = savedTheme;
                return savedTheme;
            }
        } catch (error) {
            console.warn('テーマ設定の読み込みに失敗しました:', error);
        }
        return null;
    }

    /**
     * DOMにテーマを適用
     * @param {'light'|'dark'} theme - 適用するテーマ
     */
    applyTheme(theme) {
        const root = document.documentElement;
        
        // 既存のテーマクラスを削除
        root.removeAttribute('data-theme');
        
        // 新しいテーマを適用
        if (theme === 'dark') {
            root.setAttribute('data-theme', 'dark');
        }
        
        // テーマ切り替えアニメーション
        this.addThemeTransition();
        
        console.log('テーマが適用されました:', theme);
    }

    /**
     * テーマ切り替えアニメーションを追加
     */
    addThemeTransition() {
        const root = document.documentElement;
        root.style.transition = 'background-color 0.3s ease, color 0.3s ease';
        
        // アニメーション完了後にtransitionを削除
        setTimeout(() => {
            root.style.transition = '';
        }, 300);
    }

    /**
     * テーマ切り替えボタンを更新
     */
    updateThemeToggleButtons() {
        const desktopToggle = document.getElementById('theme-toggle');
        const mobileToggle = document.getElementById('mobile-theme-toggle');
        
        const resolvedTheme = this.resolveTheme();
        const icon = this.getThemeIcon();
        const label = this.getThemeLabel();
        
        if (desktopToggle) {
            desktopToggle.innerHTML = icon;
            desktopToggle.setAttribute('title', label);
            desktopToggle.setAttribute('aria-label', label);
        }
        
        if (mobileToggle) {
            const iconSpan = mobileToggle.querySelector('.nav-icon');
            const textSpan = mobileToggle.querySelector('.nav-text');
            
            if (iconSpan) iconSpan.textContent = icon;
            if (textSpan) textSpan.textContent = label;
            
            mobileToggle.setAttribute('aria-label', label);
        }
    }

    /**
     * 現在のテーマに応じたアイコンを取得
     * @returns {string} テーマアイコン
     */
    getThemeIcon() {
        switch (this.currentTheme) {
            case 'light':
                return '☀️';
            case 'dark':
                return '🌙';
            case 'auto':
                return '🔄';
            default:
                return '🌙';
        }
    }

    /**
     * 現在のテーマに応じたラベルを取得
     * @returns {string} テーマラベル
     */
    getThemeLabel() {
        switch (this.currentTheme) {
            case 'light':
                return 'ライトモード (ダークモードに切り替え)';
            case 'dark':
                return 'ダークモード (自動に切り替え)';
            case 'auto':
                return '自動テーマ (ライトモードに切り替え)';
            default:
                return 'テーマ切り替え';
        }
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // デスクトップ版テーマ切り替えボタン
        const desktopToggle = document.getElementById('theme-toggle');
        if (desktopToggle) {
            desktopToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // モバイル版テーマ切り替えボタン
        const mobileToggle = document.getElementById('mobile-theme-toggle');
        if (mobileToggle) {
            mobileToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }
    }

    /**
     * システムテーマ変更の監視を設定
     */
    setupSystemThemeListener() {
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            // 初期設定
            this.handleSystemThemeChange(mediaQuery);
            
            // 変更監視
            if (mediaQuery.addEventListener) {
                mediaQuery.addEventListener('change', (e) => {
                    this.handleSystemThemeChange(e);
                });
            } else {
                // 古いブラウザ対応
                mediaQuery.addListener((e) => {
                    this.handleSystemThemeChange(e);
                });
            }
        }
    }

    /**
     * システムテーマ変更を処理
     * @param {MediaQueryList} mediaQuery - メディアクエリオブジェクト
     */
    handleSystemThemeChange(mediaQuery) {
        if (this.currentTheme === 'auto') {
            const systemTheme = mediaQuery.matches ? 'dark' : 'light';
            this.applyTheme(systemTheme);
            console.log('システムテーマが変更されました:', systemTheme);
        }
    }
}

// ========================================
// ThemeManager の初期化
// ========================================

// グローバル変数として ThemeManager インスタンスを作成
let themeManager;

// ThemeManager、AnimationController、AccessibilityManagerの初期化（メイン初期化に統合）

// ========================================
// テーマ管理用のグローバル関数
// ========================================

/**
 * 現在のテーマを取得
 * @returns {'light'|'dark'|'auto'} 現在のテーマ
 */
function getCurrentTheme() {
    if (themeManager) {
        return themeManager.getCurrentTheme();
    }
    return 'auto'; // デフォルト値
}

/**
 * テーマを設定
 * @param {'light'|'dark'|'auto'} theme - 設定するテーマ
 */
function setTheme(theme) {
    if (themeManager) {
        themeManager.setTheme(theme);
    }
}

/**
 * テーマを切り替え
 */
function toggleTheme() {
    if (themeManager) {
        themeManager.toggleTheme();
    }
}

/**
 * システムテーマを検出
 * @returns {'light'|'dark'} システムテーマ
 */
function detectSystemTheme() {
    if (themeManager) {
        return themeManager.detectSystemTheme();
    }
    // フォールバック
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
    }
    return 'light';
}
// ========================================
// 12.2 大量データ表示の最適化 - 遅延読み込み機能
// ========================================

/**
 * 遅延読み込みマネージャークラス
 * 大量データの段階的読み込みとキャッシュ管理を行う
 */
class LazyLoadManager {
    constructor() {
        this.cache = new Map();
        this.loadingPromises = new Map();
        this.batchSize = 50; // 一度に読み込むデータ数
        this.maxCacheSize = 1000; // キャッシュの最大サイズ
    }

    /**
     * データを遅延読み込みする
     * @param {string} key - キャッシュキー
     * @param {Function} loadFunction - データ読み込み関数
     * @param {number} offset - オフセット
     * @param {number} limit - 読み込み件数
     * @returns {Promise<any[]>} 読み込まれたデータ
     */
    async loadData(key, loadFunction, offset = 0, limit = this.batchSize) {
        const cacheKey = `${key}_${offset}_${limit}`;
        
        // キャッシュから取得を試行
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        // 既に読み込み中の場合は同じPromiseを返す
        if (this.loadingPromises.has(cacheKey)) {
            return this.loadingPromises.get(cacheKey);
        }

        // 新しい読み込みを開始
        const loadPromise = this._performLoad(loadFunction, offset, limit);
        this.loadingPromises.set(cacheKey, loadPromise);

        try {
            const data = await loadPromise;
            
            // キャッシュサイズ管理
            this._manageCacheSize();
            
            // キャッシュに保存
            this.cache.set(cacheKey, data);
            
            return data;
        } finally {
            this.loadingPromises.delete(cacheKey);
        }
    }

    /**
     * 実際のデータ読み込みを実行
     * @private
     */
    async _performLoad(loadFunction, offset, limit) {
        return new Promise((resolve) => {
            // 非同期でデータを読み込み（UIをブロックしない）
            setTimeout(() => {
                try {
                    const data = loadFunction(offset, limit);
                    resolve(data);
                } catch (error) {
                    console.error('データ読み込みエラー:', error);
                    resolve([]);
                }
            }, 0);
        });
    }

    /**
     * キャッシュサイズを管理（LRU方式）
     * @private
     */
    _manageCacheSize() {
        if (this.cache.size >= this.maxCacheSize) {
            // 最も古いエントリを削除
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.cache.clear();
        this.loadingPromises.clear();
    }

    /**
     * プリロード（事前読み込み）
     * @param {string} key - キャッシュキー
     * @param {Function} loadFunction - データ読み込み関数
     * @param {number} totalCount - 総データ数
     */
    async preload(key, loadFunction, totalCount) {
        const batches = Math.ceil(totalCount / this.batchSize);
        const preloadPromises = [];

        // 最初の3バッチを事前読み込み
        for (let i = 0; i < Math.min(3, batches); i++) {
            const offset = i * this.batchSize;
            preloadPromises.push(
                this.loadData(key, loadFunction, offset, this.batchSize)
            );
        }

        await Promise.all(preloadPromises);
    }
}

/**
 * 改良された仮想スクロールクラス
 * 遅延読み込みと組み合わせた高性能な大量データ表示
 */
class EnhancedVirtualScroll {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            rowHeight: options.rowHeight || 60,
            visibleRows: options.visibleRows || 20,
            bufferRows: options.bufferRows || 5,
            batchSize: options.batchSize || 50,
            ...options
        };
        
        this.lazyLoader = new LazyLoadManager();
        this.data = [];
        this.totalCount = 0;
        this.renderedRows = new Map();
        this.isScrolling = false;
        this.scrollTimeout = null;
        
        this.init();
    }

    /**
     * 初期化
     */
    init() {
        this.createScrollContainer();
        this.bindEvents();
    }

    /**
     * スクロールコンテナを作成
     */
    createScrollContainer() {
        this.container.innerHTML = `
            <div class="enhanced-virtual-scroll" style="height: ${this.options.visibleRows * this.options.rowHeight}px; overflow-y: auto; position: relative;">
                <div class="scroll-spacer" style="position: relative;">
                    <div class="visible-content" style="position: absolute; top: 0; width: 100%;"></div>
                </div>
                <div class="loading-indicator" style="display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
                    <div class="spinner"></div>
                    <span>読み込み中...</span>
                </div>
            </div>
        `;

        this.scrollContainer = this.container.querySelector('.enhanced-virtual-scroll');
        this.spacer = this.container.querySelector('.scroll-spacer');
        this.visibleContent = this.container.querySelector('.visible-content');
        this.loadingIndicator = this.container.querySelector('.loading-indicator');
    }

    /**
     * イベントをバインド
     */
    bindEvents() {
        this.scrollContainer.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Intersection Observer for preloading
        this.intersectionObserver = new IntersectionObserver(
            this.handleIntersection.bind(this),
            { threshold: 0.1 }
        );
    }

    /**
     * スクロールイベントハンドラ
     */
    handleScroll() {
        if (!this.isScrolling) {
            this.isScrolling = true;
            this.showLoadingIndicator();
        }

        // スクロール終了の検出
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.isScrolling = false;
            this.hideLoadingIndicator();
        }, 150);

        this.updateVisibleRows();
        this.preloadNearbyData();
    }

    /**
     * 表示行を更新
     */
    async updateVisibleRows() {
        const scrollTop = this.scrollContainer.scrollTop;
        const startIndex = Math.floor(scrollTop / this.options.rowHeight);
        const endIndex = Math.min(
            startIndex + this.options.visibleRows + this.options.bufferRows * 2,
            this.totalCount
        );

        // 必要なデータを遅延読み込み
        await this.ensureDataLoaded(startIndex, endIndex);

        // 表示内容を更新
        this.renderVisibleRows(startIndex, endIndex);
    }

    /**
     * データが読み込まれていることを確認
     */
    async ensureDataLoaded(startIndex, endIndex) {
        const batchStart = Math.floor(startIndex / this.options.batchSize) * this.options.batchSize;
        const batchEnd = Math.ceil(endIndex / this.options.batchSize) * this.options.batchSize;

        const loadPromises = [];
        for (let offset = batchStart; offset < batchEnd; offset += this.options.batchSize) {
            if (!this.isDataLoaded(offset)) {
                loadPromises.push(
                    this.lazyLoader.loadData(
                        'virtualScroll',
                        this.options.loadFunction,
                        offset,
                        this.options.batchSize
                    )
                );
            }
        }

        if (loadPromises.length > 0) {
            await Promise.all(loadPromises);
        }
    }

    /**
     * データが読み込まれているかチェック
     */
    isDataLoaded(offset) {
        const cacheKey = `virtualScroll_${offset}_${this.options.batchSize}`;
        return this.lazyLoader.cache.has(cacheKey);
    }

    /**
     * 表示行をレンダリング
     */
    renderVisibleRows(startIndex, endIndex) {
        const fragment = document.createDocumentFragment();
        
        for (let i = startIndex; i < endIndex; i++) {
            if (i >= this.totalCount) break;
            
            const rowElement = this.createRowElement(i);
            if (rowElement) {
                rowElement.style.position = 'absolute';
                rowElement.style.top = `${i * this.options.rowHeight}px`;
                rowElement.style.width = '100%';
                rowElement.style.height = `${this.options.rowHeight}px`;
                fragment.appendChild(rowElement);
            }
        }

        // 既存の内容をクリアして新しい内容を追加
        this.visibleContent.innerHTML = '';
        this.visibleContent.appendChild(fragment);
    }

    /**
     * 行要素を作成
     */
    createRowElement(index) {
        if (this.options.createRowElement) {
            return this.options.createRowElement(index, this.getDataAtIndex(index));
        }
        
        // デフォルトの行要素
        const row = document.createElement('div');
        row.className = 'virtual-row';
        row.textContent = `Row ${index}`;
        return row;
    }

    /**
     * 指定インデックスのデータを取得
     */
    getDataAtIndex(index) {
        const batchIndex = Math.floor(index / this.options.batchSize);
        const batchOffset = batchIndex * this.options.batchSize;
        const cacheKey = `virtualScroll_${batchOffset}_${this.options.batchSize}`;
        
        const batchData = this.lazyLoader.cache.get(cacheKey);
        if (batchData) {
            const localIndex = index - batchOffset;
            return batchData[localIndex];
        }
        
        return null;
    }

    /**
     * 近くのデータを事前読み込み
     */
    async preloadNearbyData() {
        const scrollTop = this.scrollContainer.scrollTop;
        const currentIndex = Math.floor(scrollTop / this.options.rowHeight);
        
        // 前後のバッチを事前読み込み
        const preloadPromises = [];
        for (let i = -1; i <= 1; i++) {
            const batchIndex = Math.floor((currentIndex + i * this.options.batchSize) / this.options.batchSize);
            const offset = batchIndex * this.options.batchSize;
            
            if (offset >= 0 && offset < this.totalCount && !this.isDataLoaded(offset)) {
                preloadPromises.push(
                    this.lazyLoader.loadData(
                        'virtualScroll',
                        this.options.loadFunction,
                        offset,
                        this.options.batchSize
                    )
                );
            }
        }

        if (preloadPromises.length > 0) {
            await Promise.all(preloadPromises);
        }
    }

    /**
     * Intersection Observer ハンドラ
     */
    handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // 表示領域に入った要素の近くのデータを事前読み込み
                this.preloadNearbyData();
            }
        });
    }

    /**
     * データを設定
     */
    setData(totalCount, loadFunction) {
        this.totalCount = totalCount;
        this.options.loadFunction = loadFunction;
        
        // スペーサーの高さを設定
        this.spacer.style.height = `${totalCount * this.options.rowHeight}px`;
        
        // 初期データを読み込み
        this.updateVisibleRows();
        
        // 事前読み込みを開始
        this.lazyLoader.preload('virtualScroll', loadFunction, totalCount);
    }

    /**
     * ローディングインジケーターを表示
     */
    showLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }

    /**
     * ローディングインジケーターを非表示
     */
    hideLoadingIndicator() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    /**
     * 破棄
     */
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
        }
        
        this.lazyLoader.clearCache();
    }
}

// グローバルインスタンス
window.lazyLoadManager = new LazyLoadManager();
window.EnhancedVirtualScroll = EnhancedVirtualScroll;

/**
 * 既存の仮想スクロール機能を強化
 */
function enhanceExistingVirtualScroll() {
    // 既存の仮想スクロール関数を拡張
    const originalGenerateVirtualScrollTable = window.generateVirtualScrollTable;
    
    if (originalGenerateVirtualScrollTable) {
        window.generateVirtualScrollTable = function(sortedFindings) {
            // 大量データの場合は新しい拡張仮想スクロールを使用
            if (sortedFindings.length > 500) {
                return generateEnhancedVirtualScrollTable(sortedFindings);
            }
            
            // 通常の仮想スクロールを使用
            return originalGenerateVirtualScrollTable(sortedFindings);
        };
    }
}

/**
 * 拡張仮想スクロールテーブルを生成
 */
function generateEnhancedVirtualScrollTable(sortedFindings) {
    const container = document.createElement('div');
    container.className = 'enhanced-virtual-scroll-container';
    
    // データ読み込み関数
    const loadFunction = (offset, limit) => {
        return sortedFindings.slice(offset, offset + limit);
    };
    
    // 行作成関数
    const createRowElement = (index, finding) => {
        if (!finding) return null;
        
        const row = document.createElement('div');
        row.className = 'virtual-table-row';
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.borderBottom = '1px solid var(--neutral-200)';
        row.style.padding = '0.5rem';
        
        // 簡略化された行内容（パフォーマンス重視）
        row.innerHTML = `
            <div style="flex: 0 0 120px; font-size: 0.8rem;">${finding.timestamp.split('T')[0]}</div>
            <div style="flex: 0 0 100px; font-size: 0.8rem;">${finding.process}</div>
            <div style="flex: 0 0 120px; font-size: 0.8rem;">${finding.docType}</div>
            <div style="flex: 0 0 120px; font-size: 0.8rem;">${finding.category}</div>
            <div style="flex: 0 0 80px;">
                <span class="severity-${finding.severity}">${finding.severity}</span>
            </div>
            <div style="flex: 0 0 80px;">
                <span class="status-${finding.status.toLowerCase()}">${finding.status}</span>
            </div>
            <div style="flex: 1; min-width: 200px; font-size: 0.85rem;">${finding.description}</div>
            <div style="flex: 0 0 100px;">
                <button class="btn btn-small btn-primary" onclick="editReviewFinding('${finding.id}')">編集</button>
            </div>
        `;
        
        return row;
    };
    
    // 拡張仮想スクロールを初期化
    const virtualScroll = new EnhancedVirtualScroll(container, {
        rowHeight: 60,
        visibleRows: 15,
        bufferRows: 5,
        batchSize: 100,
        createRowElement: createRowElement
    });
    
    virtualScroll.setData(sortedFindings.length, loadFunction);
    
    // 情報表示を追加
    const infoDiv = document.createElement('div');
    infoDiv.className = 'virtual-scroll-info';
    infoDiv.innerHTML = `
        <small class="text-secondary">
            ${sortedFindings.length}件のデータ（拡張仮想スクロール - 遅延読み込み対応）
        </small>
    `;
    
    const wrapper = document.createElement('div');
    wrapper.appendChild(container);
    wrapper.appendChild(infoDiv);
    
    return wrapper.outerHTML;
}

// 仮想スクロール機能の強化（メイン初期化に統合）