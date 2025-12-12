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
// アプリケーション初期化
document.addEventListener('DOMContentLoaded', function() {
    // 現在のページを判定して適切な初期化を実行
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    if (currentPage === 'index.html' || currentPage === '') {
        initializeProjectListPage();
    } else if (currentPage === 'project-detail.html') {
        initializeProjectDetailPage();
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
function displayProjectInfo(project) {
    try {
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
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // すべてのタブボタンとコンテンツから active クラスを削除
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // クリックされたタブボタンと対応するコンテンツに active クラスを追加
            this.classList.add('active');
            const targetTabContent = document.getElementById(targetTab + '-tab');
            if (targetTabContent) {
                targetTabContent.classList.add('active');
                
                // タブ切り替え時にコンテンツを更新
                updateTabContent(targetTab);
            }
        });
    });
    
    // 初期表示時にアクティブなタブのコンテンツを更新
    const activeTab = document.querySelector('.tab-btn.active');
    if (activeTab) {
        const targetTab = activeTab.getAttribute('data-tab');
        updateTabContent(targetTab);
    }
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

// レビュー指摘テーブルを生成
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
        tableHTML += `
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
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    return tableHTML;
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
    const tableContainer = document.getElementById('project-table-container');
    
    if (emptyState && tableContainer) {
        emptyState.style.display = 'block';
        tableContainer.style.display = 'none';
    }
}

// プロジェクト一覧の表示
function showProjectList() {
    const emptyState = document.getElementById('empty-state');
    const tableContainer = document.getElementById('project-table-container');
    
    if (emptyState && tableContainer) {
        emptyState.style.display = 'none';
        tableContainer.style.display = 'block';
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
        
        // プロジェクト一覧テーブルを表示
        showProjectList();
        renderProjectTable(projects);
        
    } catch (error) {
        console.error('プロジェクト一覧の読み込みに失敗:', error);
        ErrorHandler.handleUnexpectedError(error, 'プロジェクト一覧の読み込み');
        showEmptyState();
    }
}

// プロジェクト一覧テーブルをレンダリング
function renderProjectTable(projects) {
    const tableBody = document.getElementById('project-table-body');
    if (!tableBody) {
        console.error('プロジェクトテーブルのbody要素が見つかりません');
        return;
    }
    
    // テーブルをクリア
    tableBody.innerHTML = '';
    
    // 各プロジェクトの行を作成
    projects.forEach(project => {
        const row = createProjectTableRow(project);
        tableBody.appendChild(row);
    });
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
    const ciStatus = DataManager.getLatestCIStatusByProjectId(project.id);
    if (ciStatus) {
        const statusSpan = document.createElement('span');
        statusSpan.className = `ci-status ci-status-${ciStatus}`;
        statusSpan.textContent = ciStatus === 'pass' ? '成功' : '失敗';
        ciStatusCell.appendChild(statusSpan);
    } else {
        ciStatusCell.textContent = '-';
    }
    row.appendChild(ciStatusCell);
    
    // レビュー指摘数
    const reviewCountCell = document.createElement('td');
    const reviewCount = DataManager.getReviewFindingCountByProjectId(project.id);
    reviewCountCell.textContent = formatNumber(reviewCount);
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
    // プロジェクト追加ボタン
    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', () => {
            showModal('add-project-modal');
        });
    }
    
    // データエクスポートボタン
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            exportData();
        });
    }
    
    // プロジェクト追加フォーム
    const addProjectForm = document.getElementById('add-project-form');
    if (addProjectForm) {
        addProjectForm.addEventListener('submit', handleAddProjectSubmit);
    }
    
    // プロジェクト追加モーダルのキャンセルボタン
    const cancelAddProjectBtn = document.getElementById('cancel-add-project');
    if (cancelAddProjectBtn) {
        cancelAddProjectBtn.addEventListener('click', () => {
            hideModal('add-project-modal');
            resetAddProjectForm();
        });
    }
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
        
        // フォーカス管理 - モーダル内の最初のフォーカス可能な要素にフォーカス
        const focusableElements = modal.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
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

        // モーダルを非表示
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        // フォーカスを元の要素に戻す（可能であれば）
        const previouslyFocusedElement = document.activeElement;
        if (previouslyFocusedElement && previouslyFocusedElement !== document.body) {
            previouslyFocusedElement.blur();
        }

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
        
        // アニメーション効果（フェードイン）
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(-10px)';
        
        // 次のフレームでアニメーション開始
        requestAnimationFrame(() => {
            messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            messageElement.style.opacity = '1';
            messageElement.style.transform = 'translateY(0)';
        });

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

        // フェードアウトアニメーション
        messageElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        messageElement.style.opacity = '0';
        messageElement.style.transform = 'translateY(-10px)';
        
        // アニメーション完了後に要素を削除
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 300);
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
        if (editProjectBtn) {
            editProjectBtn.addEventListener('click', () => {
                showEditProjectModal(projectId);
            });
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
        if (addCIResultBtn) {
            addCIResultBtn.addEventListener('click', () => {
                showAddCIResultModal(projectId);
            });
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
        if (addReviewFindingBtn) {
            addReviewFindingBtn.addEventListener('click', () => {
                showAddReviewFindingModal(projectId);
            });
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
        if (editEffectMetricsBtn) {
            editEffectMetricsBtn.addEventListener('click', () => {
                showEditEffectMetricsModal(projectId);
            });
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
 * 要素のアニメーション
 * @param {string|HTMLElement} element - アニメーション対象の要素IDまたは要素
 * @param {string} animationClass - アニメーションCSSクラス
 * @param {number} duration - アニメーション時間（ミリ秒）
 */
function animateElement(element, animationClass, duration = 300) {
    try {
        const el = typeof element === 'string' ? document.getElementById(element) : element;
        if (!el) return;

        el.classList.add(animationClass);
        
        setTimeout(() => {
            el.classList.remove(animationClass);
        }, duration);
    } catch (error) {
        console.error('要素アニメーション中にエラーが発生:', error);
    }
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