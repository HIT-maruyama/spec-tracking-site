// メトリクス抽出エンジン - GitHub Actionsワークフローからメトリクスを抽出

// ========================================
// メトリクス抽出クラス
// ========================================

/**
 * GitHub Actionsワークフローからメトリクスを抽出するクラス
 * lint結果、テスト結果、カバレッジ情報、SBOM生成状況を抽出
 */
class MetricsExtractor {
    constructor() {
        // 各種ツールの出力パターンを定義
        this.lintPatterns = this.initializeLintPatterns();
        this.testPatterns = this.initializeTestPatterns();
        this.coveragePatterns = this.initializeCoveragePatterns();
        this.sbomPatterns = this.initializeSBOMPatterns();
    }

    /**
     * lint結果抽出パターンを初期化
     * @returns {Array} lintパターン配列
     */
    initializeLintPatterns() {
        return [
            // ESLint標準出力
            {
                name: 'eslint-standard',
                pattern: /(\d+) problems? \((\d+) errors?, (\d+) warnings?\)/,
                parser: (match) => ({
                    passed: parseInt(match[1]) === 0,
                    errorCount: parseInt(match[2]),
                    warningCount: parseInt(match[3])
                })
            },
            // ESLint要約形式
            {
                name: 'eslint-summary',
                pattern: /✖ (\d+) problems? \((\d+) errors?, (\d+) warnings?\)/,
                parser: (match) => ({
                    passed: parseInt(match[1]) === 0,
                    errorCount: parseInt(match[2]),
                    warningCount: parseInt(match[3])
                })
            },
            // GitHub Actions ESLint形式
            {
                name: 'eslint-github-actions',
                pattern: /Found (\d+) errors?, (\d+) warnings?/,
                parser: (match) => ({
                    passed: parseInt(match[1]) === 0 && parseInt(match[2]) === 0,
                    errorCount: parseInt(match[1]),
                    warningCount: parseInt(match[2])
                })
            },
            // TSLint形式
            {
                name: 'tslint',
                pattern: /ERROR: \((\d+)\) (.+)/g,
                parser: (logs) => {
                    const matches = [...logs.matchAll(/ERROR: \((\d+)\) (.+)/g)];
                    const errorCount = matches.length;
                    const warningMatches = [...logs.matchAll(/WARNING: \((\d+)\) (.+)/g)];
                    const warningCount = warningMatches.length;
                    return {
                        passed: errorCount === 0,
                        errorCount: errorCount,
                        warningCount: warningCount
                    };
                }
            },
            // Prettier形式
            {
                name: 'prettier',
                pattern: /Code style issues found in (\d+) files?/,
                parser: (match) => ({
                    passed: false,
                    errorCount: parseInt(match[1]),
                    warningCount: 0
                })
            },
            // 成功パターン
            {
                name: 'lint-success',
                pattern: /✓|All files pass linting|No linting errors found/,
                parser: () => ({
                    passed: true,
                    errorCount: 0,
                    warningCount: 0
                })
            }
        ];
    }

    /**
     * テスト結果抽出パターンを初期化
     * @returns {Array} テストパターン配列
     */
    initializeTestPatterns() {
        return [
            // Jest出力
            {
                name: 'jest-standard',
                pattern: /Tests:\s+(\d+) failed, (\d+) passed, (\d+) total/,
                parser: (match) => ({
                    passed: parseInt(match[1]) === 0,
                    totalTests: parseInt(match[3]),
                    passedTests: parseInt(match[2])
                })
            },
            // Jest代替形式
            {
                name: 'jest-suites',
                pattern: /Test Suites: (\d+) failed, (\d+) passed, (\d+) total/,
                parser: (match) => ({
                    passed: parseInt(match[1]) === 0,
                    totalTests: parseInt(match[3]),
                    passedTests: parseInt(match[2])
                })
            },
            // Jest簡潔形式
            {
                name: 'jest-simple',
                pattern: /(\d+) passing, (\d+) failing/,
                parser: (match) => {
                    const passed = parseInt(match[1]);
                    const failed = parseInt(match[2]);
                    return {
                        passed: failed === 0,
                        totalTests: passed + failed,
                        passedTests: passed
                    };
                }
            },
            // Mocha出力
            {
                name: 'mocha',
                pattern: /(\d+) passing \(.*?\)(?:\s+(\d+) failing)?/,
                parser: (match) => {
                    const passed = parseInt(match[1]);
                    const failed = parseInt(match[2] || '0');
                    return {
                        passed: failed === 0,
                        totalTests: passed + failed,
                        passedTests: passed
                    };
                }
            },
            // pytest出力
            {
                name: 'pytest',
                pattern: /=+ (\d+) failed, (\d+) passed/,
                parser: (match) => {
                    const failed = parseInt(match[1]);
                    const passed = parseInt(match[2]);
                    return {
                        passed: failed === 0,
                        totalTests: failed + passed,
                        passedTests: passed
                    };
                }
            },
            // pytest成功パターン
            {
                name: 'pytest-success',
                pattern: /=+ (\d+) passed/,
                parser: (match) => ({
                    passed: true,
                    totalTests: parseInt(match[1]),
                    passedTests: parseInt(match[1])
                })
            },
            // JUnit形式
            {
                name: 'junit',
                pattern: /Tests run: (\d+), Failures: (\d+), Errors: (\d+)/,
                parser: (match) => {
                    const total = parseInt(match[1]);
                    const failures = parseInt(match[2]);
                    const errors = parseInt(match[3]);
                    const failed = failures + errors;
                    return {
                        passed: failed === 0,
                        totalTests: total,
                        passedTests: total - failed
                    };
                }
            },
            // Go test形式
            {
                name: 'go-test',
                pattern: /PASS|FAIL/g,
                parser: (logs) => {
                    const passMatches = [...logs.matchAll(/PASS/g)];
                    const failMatches = [...logs.matchAll(/FAIL/g)];
                    const passed = passMatches.length;
                    const failed = failMatches.length;
                    return {
                        passed: failed === 0,
                        totalTests: passed + failed,
                        passedTests: passed
                    };
                }
            },
            // RSpec形式
            {
                name: 'rspec',
                pattern: /(\d+) examples?, (\d+) failures?/,
                parser: (match) => {
                    const total = parseInt(match[1]);
                    const failed = parseInt(match[2]);
                    return {
                        passed: failed === 0,
                        totalTests: total,
                        passedTests: total - failed
                    };
                }
            }
        ];
    }

    /**
     * カバレッジ抽出パターンを初期化
     * @returns {Array} カバレッジパターン配列
     */
    initializeCoveragePatterns() {
        return [
            // Istanbul/nyc出力
            {
                name: 'istanbul',
                pattern: /All files\s+\|\s+([\d.]+)/,
                parser: (match, logs) => ({
                    percentage: parseFloat(match[1]),
                    lines: this.extractLineNumbers(logs),
                    coveredLines: this.calculateCoveredLines(logs, parseFloat(match[1]))
                })
            },
            // Jest カバレッジ
            {
                name: 'jest-coverage',
                pattern: /All files.*?\|\s*([\d.]+)\s*\|/,
                parser: (match, logs) => ({
                    percentage: parseFloat(match[1]),
                    lines: this.extractLineNumbers(logs),
                    coveredLines: this.calculateCoveredLines(logs, parseFloat(match[1]))
                })
            },
            // Coverage.py出力
            {
                name: 'coverage-py',
                pattern: /TOTAL\s+\d+\s+\d+\s+([\d.]+)%/,
                parser: (match, logs) => ({
                    percentage: parseFloat(match[1]),
                    lines: this.extractLineNumbers(logs),
                    coveredLines: this.calculateCoveredLines(logs, parseFloat(match[1]))
                })
            },
            // Jacoco出力
            {
                name: 'jacoco',
                pattern: /Total.*?(\d+)%/,
                parser: (match, logs) => ({
                    percentage: parseFloat(match[1]),
                    lines: this.extractLineNumbers(logs),
                    coveredLines: this.calculateCoveredLines(logs, parseFloat(match[1]))
                })
            },
            // Go coverage
            {
                name: 'go-coverage',
                pattern: /coverage: ([\d.]+)% of statements/,
                parser: (match, logs) => ({
                    percentage: parseFloat(match[1]),
                    lines: this.extractLineNumbers(logs),
                    coveredLines: this.calculateCoveredLines(logs, parseFloat(match[1]))
                })
            },
            // SimpleCov (Ruby)
            {
                name: 'simplecov',
                pattern: /(\d+\.\d+)% covered/,
                parser: (match, logs) => ({
                    percentage: parseFloat(match[1]),
                    lines: this.extractLineNumbers(logs),
                    coveredLines: this.calculateCoveredLines(logs, parseFloat(match[1]))
                })
            }
        ];
    }

    /**
     * SBOM検出パターンを初期化
     * @returns {Array} SBOMパターン配列
     */
    initializeSBOMPatterns() {
        return [
            'sbom',
            'syft',
            'cyclone',
            'spdx',
            'generate-sbom',
            'create-sbom',
            'build-sbom',
            'software bill of materials',
            'dependency-track'
        ];
    }

    /**
     * lint結果を抽出
     * @param {string} logs - ジョブログ
     * @returns {Object|null} lint結果
     */
    extractLintResults(logs) {
        if (!logs || typeof logs !== 'string') {
            return null;
        }

        // 各パターンを順次試行
        for (const pattern of this.lintPatterns) {
            try {
                if (pattern.name === 'tslint') {
                    // TSLintは特別処理（グローバルマッチ）
                    if (logs.includes('ERROR:') || logs.includes('WARNING:')) {
                        return pattern.parser(logs);
                    }
                } else if (pattern.name === 'lint-success') {
                    // 成功パターンの検査
                    if (pattern.pattern.test(logs)) {
                        return pattern.parser();
                    }
                } else {
                    // 通常のパターンマッチング
                    const match = logs.match(pattern.pattern);
                    if (match) {
                        return pattern.parser(match);
                    }
                }
            } catch (error) {
                console.warn(`Failed to parse lint pattern ${pattern.name}:`, error);
                continue;
            }
        }

        return null;
    }

    /**
     * テスト結果を抽出
     * @param {string} logs - ジョブログ
     * @returns {Object|null} テスト結果
     */
    extractTestResults(logs) {
        if (!logs || typeof logs !== 'string') {
            return null;
        }

        // 各パターンを順次試行
        for (const pattern of this.testPatterns) {
            try {
                if (pattern.name === 'go-test') {
                    // Go testは特別処理（グローバルマッチ）
                    if (logs.includes('PASS') || logs.includes('FAIL')) {
                        return pattern.parser(logs);
                    }
                } else {
                    // 通常のパターンマッチング
                    const match = logs.match(pattern.pattern);
                    if (match) {
                        return pattern.parser(match);
                    }
                }
            } catch (error) {
                console.warn(`Failed to parse test pattern ${pattern.name}:`, error);
                continue;
            }
        }

        return null;
    }

    /**
     * カバレッジ結果を抽出
     * @param {string} logs - ジョブログ
     * @returns {Object|null} カバレッジ結果
     */
    extractCoverageResults(logs) {
        if (!logs || typeof logs !== 'string') {
            return null;
        }

        // 各パターンを順次試行
        for (const pattern of this.coveragePatterns) {
            try {
                const match = logs.match(pattern.pattern);
                if (match) {
                    return pattern.parser(match, logs);
                }
            } catch (error) {
                console.warn(`Failed to parse coverage pattern ${pattern.name}:`, error);
                continue;
            }
        }

        return null;
    }

    /**
     * SBOM生成ステップを検出
     * @param {Job[]} jobs - ジョブ配列
     * @returns {'generated'|'not_generated'|'error'} SBOM状態
     */
    detectSBOMGeneration(jobs) {
        if (!Array.isArray(jobs)) {
            return 'not_generated';
        }

        for (const job of jobs) {
            if (!job.steps || !Array.isArray(job.steps)) {
                continue;
            }

            for (const step of job.steps) {
                if (!step.name || typeof step.name !== 'string') {
                    continue;
                }

                const stepName = step.name.toLowerCase();
                
                // SBOM関連のステップ名を検出
                const isSBOMStep = this.sbomPatterns.some(pattern => 
                    stepName.includes(pattern.toLowerCase())
                );

                if (isSBOMStep) {
                    if (step.conclusion === 'success') {
                        return 'generated';
                    } else if (step.conclusion === 'failure') {
                        return 'error';
                    }
                }
            }
        }

        return 'not_generated';
    }

    /**
     * 包括的なメトリクス抽出を実行
     * @param {Job[]} jobs - ジョブ配列
     * @param {GitHubIntegrationClient} apiClient - GitHub APIクライアント
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @returns {Promise<Object>} 抽出されたメトリクス
     */
    async extractAllMetrics(jobs, apiClient, owner, repo) {
        const results = {};

        if (!Array.isArray(jobs)) {
            console.warn('Invalid jobs array provided to extractAllMetrics');
            return results;
        }

        // 各ジョブのログを取得してメトリクスを抽出
        for (const job of jobs) {
            try {
                // ジョブログを取得
                let logs = '';
                if (apiClient && typeof apiClient.getJobLogs === 'function') {
                    try {
                        logs = await apiClient.getJobLogs(owner, repo, job.id);
                    } catch (error) {
                        console.warn(`Failed to fetch logs for job ${job.id}:`, error);
                        // ログ取得に失敗した場合は続行
                        continue;
                    }
                }

                // Lint結果の抽出（まだ見つかっていない場合のみ）
                if (!results.lintResult) {
                    const lintResult = this.extractLintResults(logs);
                    if (lintResult) {
                        results.lintResult = lintResult;
                    }
                }

                // テスト結果の抽出（まだ見つかっていない場合のみ）
                if (!results.contractTestResult) {
                    const testResult = this.extractTestResults(logs);
                    if (testResult) {
                        results.contractTestResult = testResult;
                    }
                }

                // カバレッジ結果の抽出（まだ見つかっていない場合のみ）
                if (!results.coverage) {
                    const coverageResult = this.extractCoverageResults(logs);
                    if (coverageResult) {
                        results.coverage = coverageResult;
                    }
                }

            } catch (error) {
                console.error(`Error processing job ${job.id}:`, error);
                // 個別ジョブのエラーは続行
                continue;
            }
        }

        // SBOM状態の検出
        results.sbomStatus = this.detectSBOMGeneration(jobs);

        return results;
    }

    /**
     * 基本的なCI結果を保存（メトリクス抽出失敗時のフォールバック）
     * @param {WorkflowRun} run - ワークフロー実行データ
     * @param {Job[]} jobs - ジョブ配列
     * @returns {Object} 基本CI結果
     */
    createBasicCIResult(run, jobs) {
        return {
            status: run.conclusion === 'success' ? 'pass' : 'fail',
            source: 'github',
            logUrl: run.html_url,
            githubData: {
                runId: run.id,
                workflowName: run.name,
                commitSha: run.head_sha,
                branch: run.head_branch,
                actor: run.actor.login,
                htmlUrl: run.html_url
            }
        };
    }

    /**
     * 一般的なワークフローパターンを検出
     * @param {Job[]} jobs - ジョブ配列
     * @returns {string[]} 検出されたワークフロータイプ
     */
    detectWorkflowTypes(jobs) {
        const detectedTypes = [];

        if (!Array.isArray(jobs)) {
            return detectedTypes;
        }

        for (const job of jobs) {
            if (!job.steps || !Array.isArray(job.steps)) {
                continue;
            }

            for (const step of job.steps) {
                if (!step.name || typeof step.name !== 'string') {
                    continue;
                }

                const stepName = step.name.toLowerCase();

                // Node.js関連
                if (stepName.includes('node') || stepName.includes('npm') || stepName.includes('yarn')) {
                    if (!detectedTypes.includes('nodejs')) {
                        detectedTypes.push('nodejs');
                    }
                }

                // Python関連
                if (stepName.includes('python') || stepName.includes('pip') || stepName.includes('pytest')) {
                    if (!detectedTypes.includes('python')) {
                        detectedTypes.push('python');
                    }
                }

                // Java関連
                if (stepName.includes('java') || stepName.includes('maven') || stepName.includes('gradle')) {
                    if (!detectedTypes.includes('java')) {
                        detectedTypes.push('java');
                    }
                }

                // .NET関連
                if (stepName.includes('dotnet') || stepName.includes('.net') || stepName.includes('nuget')) {
                    if (!detectedTypes.includes('dotnet')) {
                        detectedTypes.push('dotnet');
                    }
                }

                // Go関連
                if (stepName.includes('go ') || stepName.includes('golang')) {
                    if (!detectedTypes.includes('go')) {
                        detectedTypes.push('go');
                    }
                }

                // Ruby関連
                if (stepName.includes('ruby') || stepName.includes('gem') || stepName.includes('bundle')) {
                    if (!detectedTypes.includes('ruby')) {
                        detectedTypes.push('ruby');
                    }
                }
            }
        }

        return detectedTypes;
    }

    /**
     * ログから総行数を抽出
     * @param {string} logs - ログ文字列
     * @returns {number|undefined} 総行数
     */
    extractLineNumbers(logs) {
        if (!logs || typeof logs !== 'string') {
            return undefined;
        }

        // 様々な形式の行数表示を検出
        const patterns = [
            /(\d+)\s+total lines/i,
            /Lines:\s*(\d+)/i,
            /Total lines:\s*(\d+)/i,
            /(\d+)\s+lines covered/i
        ];

        for (const pattern of patterns) {
            const match = logs.match(pattern);
            if (match) {
                return parseInt(match[1]);
            }
        }

        return undefined;
    }

    /**
     * カバー済み行数を計算
     * @param {string} logs - ログ文字列
     * @param {number} percentage - カバレッジ率
     * @returns {number|undefined} カバー済み行数
     */
    calculateCoveredLines(logs, percentage) {
        const totalLines = this.extractLineNumbers(logs);
        if (totalLines && typeof percentage === 'number') {
            return Math.round(totalLines * percentage / 100);
        }
        return undefined;
    }

    /**
     * メトリクス抽出の詳細ログを出力
     * @param {Object} metrics - 抽出されたメトリクス
     * @param {Job[]} jobs - ジョブ配列
     */
    logExtractionDetails(metrics, jobs) {
        console.log('=== Metrics Extraction Results ===');
        
        if (metrics.lintResult) {
            console.log('Lint Result:', metrics.lintResult);
        } else {
            console.log('Lint Result: Not found');
        }

        if (metrics.contractTestResult) {
            console.log('Test Result:', metrics.contractTestResult);
        } else {
            console.log('Test Result: Not found');
        }

        if (metrics.coverage) {
            console.log('Coverage Result:', metrics.coverage);
        } else {
            console.log('Coverage Result: Not found');
        }

        console.log('SBOM Status:', metrics.sbomStatus);

        const workflowTypes = this.detectWorkflowTypes(jobs);
        if (workflowTypes.length > 0) {
            console.log('Detected Workflow Types:', workflowTypes);
        }

        console.log('=== End Extraction Results ===');
    }

    /**
     * メトリクス抽出の統計情報を取得
     * @param {Object} metrics - 抽出されたメトリクス
     * @returns {Object} 統計情報
     */
    getExtractionStats(metrics) {
        return {
            hasLintResult: !!metrics.lintResult,
            hasTestResult: !!metrics.contractTestResult,
            hasCoverageResult: !!metrics.coverage,
            sbomStatus: metrics.sbomStatus || 'not_generated',
            extractedMetricsCount: [
                metrics.lintResult,
                metrics.contractTestResult,
                metrics.coverage
            ].filter(Boolean).length
        };
    }
}

// ========================================
// ワークフローデータ解析クラス
// ========================================

/**
 * GitHub APIレスポンスを既存のCI結果形式に変換するクラス
 * Requirements 3.4に対応：GitHub APIレスポンスのCIResult形式変換を実装
 */
class WorkflowDataParser {
    constructor() {
        this.metricsExtractor = new MetricsExtractor();
    }

    /**
     * ワークフロー実行データをCIResult形式に変換
     * Requirements 3.4: ワークフロー実行データの抽出機能を実装
     * @param {WorkflowRun} run - ワークフロー実行データ
     * @param {Job[]} jobs - ジョブ配列
     * @param {Object} [extractedMetrics] - 事前に抽出されたメトリクス
     * @returns {Object} CIResult形式のデータ
     */
    parseWorkflowRun(run, jobs, extractedMetrics = null) {
        if (!run || typeof run !== 'object') {
            throw new Error('Invalid workflow run data provided to parseWorkflowRun');
        }

        // 基本的なCI結果を作成
        const ciResult = {
            timestamp: this.extractTimestamp(run),
            status: this.determineStatus(run),
            source: 'github',
            logUrl: run.html_url,
            githubData: this.extractGitHubData(run)
        };

        // メトリクスが提供されている場合は追加
        if (extractedMetrics && typeof extractedMetrics === 'object') {
            this.addExtractedMetrics(ciResult, extractedMetrics);
        }

        return ciResult;
    }

    /**
     * ワークフロー実行からタイムスタンプを抽出
     * @param {WorkflowRun} run - ワークフロー実行データ
     * @returns {string} ISO 8601タイムスタンプ
     */
    extractTimestamp(run) {
        // 優先順位: updated_at > completed_at > run_started_at > created_at > 現在時刻
        return run.updated_at || 
               run.completed_at || 
               run.run_started_at || 
               run.created_at || 
               new Date().toISOString();
    }

    /**
     * ワークフロー実行のステータスを決定
     * @param {WorkflowRun} run - ワークフロー実行データ
     * @returns {'pass'|'fail'} CI結果ステータス
     */
    determineStatus(run) {
        // GitHub Actionsの結論をCI結果ステータスにマッピング
        switch (run.conclusion) {
            case 'success':
                return 'pass';
            case 'failure':
            case 'timed_out':
            case 'action_required':
                return 'fail';
            case 'cancelled':
            case 'skipped':
                return 'fail'; // キャンセル・スキップも失敗として扱う
            case 'neutral':
                return 'pass'; // ニュートラルは成功として扱う
            default:
                // 不明な結論の場合はstatusで判定
                return run.status === 'completed' ? 'pass' : 'fail';
        }
    }

    /**
     * GitHub固有データを抽出
     * @param {WorkflowRun} run - ワークフロー実行データ
     * @returns {Object} GitHub固有データ
     */
    extractGitHubData(run) {
        return {
            runId: run.id,
            workflowName: run.name || 'Unknown Workflow',
            commitSha: run.head_sha || '',
            branch: run.head_branch || 'unknown',
            actor: run.actor ? run.actor.login : 'unknown',
            htmlUrl: run.html_url || ''
        };
    }

    /**
     * 抽出されたメトリクスをCI結果に追加
     * @param {Object} ciResult - CI結果オブジェクト
     * @param {Object} extractedMetrics - 抽出されたメトリクス
     */
    addExtractedMetrics(ciResult, extractedMetrics) {
        if (extractedMetrics.lintResult) {
            ciResult.lintResult = extractedMetrics.lintResult;
        }
        if (extractedMetrics.contractTestResult) {
            ciResult.contractTestResult = extractedMetrics.contractTestResult;
        }
        if (extractedMetrics.coverage) {
            ciResult.coverage = extractedMetrics.coverage;
        }
        if (extractedMetrics.sbomStatus) {
            ciResult.sbomStatus = extractedMetrics.sbomStatus;
        }
    }

    /**
     * リポジトリURLを解析
     * Requirements 3.4: リポジトリURL解析機能を実装
     * @param {string} url - リポジトリURL
     * @returns {{owner: string, repo: string, isValid: boolean, normalizedUrl: string}|null} 解析結果
     */
    parseRepositoryUrl(url) {
        if (!url || typeof url !== 'string') {
            return null;
        }

        // URLを正規化（前後の空白を除去）
        const normalizedUrl = url.trim();

        // 様々なGitHub URL形式に対応
        const patterns = [
            // HTTPS形式: https://github.com/owner/repo
            /^https:\/\/github\.com\/([^\/\s]+)\/([^\/\s]+?)(?:\.git)?(?:\/.*)?$/,
            // SSH形式: git@github.com:owner/repo.git
            /^git@github\.com:([^\/\s]+)\/([^\/\s]+?)(?:\.git)?$/,
            // 短縮形式: github.com/owner/repo
            /^(?:https?:\/\/)?github\.com\/([^\/\s]+)\/([^\/\s]+?)(?:\.git)?(?:\/.*)?$/
        ];

        for (const pattern of patterns) {
            const match = normalizedUrl.match(pattern);
            if (match) {
                const owner = match[1];
                let repo = match[2];

                // .git拡張子を除去
                if (repo.endsWith('.git')) {
                    repo = repo.slice(0, -4);
                }

                // 有効性をチェック
                const isValid = this.validateRepositoryComponents(owner, repo);

                return {
                    owner: owner,
                    repo: repo,
                    isValid: isValid,
                    normalizedUrl: `https://github.com/${owner}/${repo}`
                };
            }
        }

        return null;
    }

    /**
     * リポジトリのオーナーとリポジトリ名の有効性をチェック
     * @param {string} owner - オーナー名
     * @param {string} repo - リポジトリ名
     * @returns {boolean} 有効かどうか
     */
    validateRepositoryComponents(owner, repo) {
        // GitHubのユーザー名・リポジトリ名の制約をチェック
        const validNamePattern = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?$/;
        
        // 長さの制約（GitHubの制限）
        if (owner.length > 39 || repo.length > 100) {
            return false;
        }

        // 予約語のチェック
        const reservedNames = [
            'api', 'www', 'github', 'help', 'support', 'blog', 'status',
            'security', 'about', 'contact', 'terms', 'privacy'
        ];

        if (reservedNames.includes(owner.toLowerCase()) || 
            reservedNames.includes(repo.toLowerCase())) {
            return false;
        }

        // パターンマッチング
        return validNamePattern.test(owner) && validNamePattern.test(repo);
    }

    /**
     * 複数のリポジトリURLを一括解析
     * @param {string[]} urls - リポジトリURL配列
     * @returns {Array} 解析結果配列
     */
    parseMultipleRepositoryUrls(urls) {
        if (!Array.isArray(urls)) {
            return [];
        }

        return urls.map(url => {
            const result = this.parseRepositoryUrl(url);
            return {
                originalUrl: url,
                parsed: result,
                isValid: result ? result.isValid : false
            };
        }).filter(result => result.parsed !== null);
    }

    /**
     * 複数のワークフロー実行を処理
     * Requirements 3.4: ワークフロー実行データの抽出機能を実装
     * @param {WorkflowRun[]} runs - ワークフロー実行配列
     * @param {Function} getJobsForRun - ジョブ取得関数
     * @param {Function} extractMetrics - メトリクス抽出関数
     * @param {Object} [options] - 処理オプション
     * @returns {Promise<Object>} 処理結果とメタデータ
     */
    async parseMultipleWorkflowRuns(runs, getJobsForRun, extractMetrics, options = {}) {
        if (!Array.isArray(runs)) {
            return {
                results: [],
                metadata: {
                    totalRuns: 0,
                    processedRuns: 0,
                    failedRuns: 0,
                    errors: []
                }
            };
        }

        const {
            maxConcurrency = 3, // 同時処理数の制限
            includeFailedRuns = true, // 失敗したワークフローも含めるか
            timeoutMs = 30000 // タイムアウト時間
        } = options;

        const results = [];
        const metadata = {
            totalRuns: runs.length,
            processedRuns: 0,
            failedRuns: 0,
            errors: [],
            processingStats: {
                withMetrics: 0,
                basicOnly: 0,
                skipped: 0
            }
        };

        // 並列処理のためのセマフォ
        const semaphore = new Semaphore(maxConcurrency);

        const processRun = async (run) => {
            return semaphore.acquire(async () => {
                try {
                    // フィルタリング：失敗したワークフローを除外する場合
                    if (!includeFailedRuns && run.conclusion === 'failure') {
                        metadata.processingStats.skipped++;
                        return null;
                    }

                    // タイムアウト付きでジョブを取得
                    const jobs = await this.withTimeout(
                        getJobsForRun(run.id),
                        timeoutMs,
                        `Job fetch timeout for run ${run.id}`
                    );
                    
                    // メトリクスを抽出
                    const metrics = await this.withTimeout(
                        extractMetrics(jobs),
                        timeoutMs,
                        `Metrics extraction timeout for run ${run.id}`
                    );
                    
                    // CI結果に変換
                    const ciResult = this.parseWorkflowRun(run, jobs, metrics);
                    
                    // 統計を更新
                    if (this.hasExtractedMetrics(metrics)) {
                        metadata.processingStats.withMetrics++;
                    } else {
                        metadata.processingStats.basicOnly++;
                    }
                    
                    metadata.processedRuns++;
                    return ciResult;

                } catch (error) {
                    console.error(`Failed to parse workflow run ${run.id}:`, error);
                    metadata.errors.push({
                        runId: run.id,
                        workflowName: run.name,
                        error: error.message
                    });
                    
                    // エラーが発生した場合は基本的なCI結果のみ作成
                    try {
                        const basicResult = this.metricsExtractor.createBasicCIResult(run, []);
                        metadata.failedRuns++;
                        metadata.processingStats.basicOnly++;
                        return basicResult;
                    } catch (fallbackError) {
                        console.error(`Failed to create basic CI result for run ${run.id}:`, fallbackError);
                        metadata.failedRuns++;
                        return null;
                    }
                }
            });
        };

        // 全てのワークフロー実行を並列処理
        const promises = runs.map(processRun);
        const processedResults = await Promise.all(promises);

        // null結果を除外
        results.push(...processedResults.filter(result => result !== null));

        return {
            results: results,
            metadata: metadata
        };
    }

    /**
     * タイムアウト付きでPromiseを実行
     * @param {Promise} promise - 実行するPromise
     * @param {number} timeoutMs - タイムアウト時間（ミリ秒）
     * @param {string} errorMessage - タイムアウト時のエラーメッセージ
     * @returns {Promise} タイムアウト付きPromise
     */
    async withTimeout(promise, timeoutMs, errorMessage) {
        return Promise.race([
            promise,
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
            )
        ]);
    }

    /**
     * メトリクスが抽出されているかチェック
     * @param {Object} metrics - メトリクスオブジェクト
     * @returns {boolean} メトリクスが抽出されているか
     */
    hasExtractedMetrics(metrics) {
        if (!metrics || typeof metrics !== 'object') {
            return false;
        }

        return !!(metrics.lintResult || 
                 metrics.contractTestResult || 
                 metrics.coverage || 
                 metrics.sbomStatus);
    }

    /**
     * ワークフロー実行データから詳細情報を抽出
     * Requirements 3.4: ワークフロー実行データの抽出機能を実装
     * @param {WorkflowRun} run - ワークフロー実行データ
     * @returns {Object} 抽出された詳細情報
     */
    extractWorkflowRunDetails(run) {
        if (!run || typeof run !== 'object') {
            return null;
        }

        return {
            // 基本情報
            id: run.id,
            name: run.name,
            displayTitle: run.display_title || run.name,
            
            // 実行情報
            status: run.status,
            conclusion: run.conclusion,
            workflowId: run.workflow_id,
            
            // Git情報
            headBranch: run.head_branch,
            headSha: run.head_sha,
            headCommit: run.head_commit ? {
                id: run.head_commit.id,
                message: run.head_commit.message,
                timestamp: run.head_commit.timestamp,
                author: run.head_commit.author
            } : null,
            
            // 実行者情報
            actor: run.actor ? {
                login: run.actor.login,
                id: run.actor.id,
                avatarUrl: run.actor.avatar_url,
                type: run.actor.type
            } : null,
            
            // トリガー情報
            event: run.event,
            triggeringActor: run.triggering_actor ? {
                login: run.triggering_actor.login,
                id: run.triggering_actor.id,
                avatarUrl: run.triggering_actor.avatar_url
            } : null,
            
            // 時刻情報
            createdAt: run.created_at,
            updatedAt: run.updated_at,
            runStartedAt: run.run_started_at,
            runAttempt: run.run_attempt,
            
            // URL情報
            htmlUrl: run.html_url,
            jobsUrl: run.jobs_url,
            logsUrl: run.logs_url,
            checkSuiteUrl: run.check_suite_url,
            artifactsUrl: run.artifacts_url,
            cancelUrl: run.cancel_url,
            rerunUrl: run.rerun_url,
            
            // リポジトリ情報
            repository: run.repository ? {
                id: run.repository.id,
                name: run.repository.name,
                fullName: run.repository.full_name,
                owner: run.repository.owner,
                private: run.repository.private
            } : null,
            
            // ワークフロー情報
            workflowUrl: run.workflow_url,
            
            // その他
            runNumber: run.run_number,
            previousAttemptUrl: run.previous_attempt_url,
            pullRequests: run.pull_requests || []
        };
    }

    /**
     * 重複するCI結果をチェック
     * Requirements 3.5: 既存CI結果との重複回避機能を実装
     * @param {Object[]} existingResults - 既存のCI結果配列
     * @param {WorkflowRun} run - 新しいワークフロー実行
     * @param {Object} [options] - チェックオプション
     * @returns {Object} 重複チェック結果
     */
    isDuplicateCIResult(existingResults, run, options = {}) {
        if (!Array.isArray(existingResults) || !run) {
            return {
                isDuplicate: false,
                reason: 'invalid_input',
                existingResult: null
            };
        }

        const {
            checkByRunId = true,
            checkByCommitSha = false,
            checkByTimestamp = false,
            timestampToleranceMs = 60000 // 1分の許容範囲
        } = options;

        // GitHub由来のCI結果のみをチェック対象とする
        const githubResults = existingResults.filter(result => 
            result.source === 'github' && result.githubData
        );

        for (const existingResult of githubResults) {
            const githubData = existingResult.githubData;

            // Run IDによる重複チェック（最も確実）
            if (checkByRunId && githubData.runId === run.id) {
                return {
                    isDuplicate: true,
                    reason: 'same_run_id',
                    existingResult: existingResult,
                    matchedField: 'runId',
                    matchedValue: run.id
                };
            }

            // Commit SHAによる重複チェック（同じコミットの別実行を検出）
            if (checkByCommitSha && 
                githubData.commitSha && 
                run.head_sha && 
                githubData.commitSha === run.head_sha &&
                githubData.workflowName === run.name) {
                return {
                    isDuplicate: true,
                    reason: 'same_commit_and_workflow',
                    existingResult: existingResult,
                    matchedField: 'commitSha',
                    matchedValue: run.head_sha
                };
            }

            // タイムスタンプによる重複チェック（近い時刻の同一ワークフロー）
            if (checkByTimestamp && 
                githubData.workflowName === run.name &&
                githubData.branch === run.head_branch) {
                
                const existingTime = new Date(existingResult.timestamp).getTime();
                const newTime = new Date(run.updated_at || run.run_started_at).getTime();
                
                if (Math.abs(existingTime - newTime) <= timestampToleranceMs) {
                    return {
                        isDuplicate: true,
                        reason: 'similar_timestamp',
                        existingResult: existingResult,
                        matchedField: 'timestamp',
                        timeDifference: Math.abs(existingTime - newTime)
                    };
                }
            }
        }

        return {
            isDuplicate: false,
            reason: 'no_match',
            existingResult: null
        };
    }

    /**
     * 複数のワークフロー実行から重複を除去
     * Requirements 3.5: 既存CI結果との重複回避機能を実装
     * @param {WorkflowRun[]} runs - ワークフロー実行配列
     * @param {Object[]} existingResults - 既存のCI結果配列
     * @param {Object} [options] - 重複チェックオプション
     * @returns {Object} 重複除去結果
     */
    removeDuplicateWorkflowRuns(runs, existingResults, options = {}) {
        if (!Array.isArray(runs)) {
            return {
                uniqueRuns: [],
                duplicateRuns: [],
                stats: {
                    total: 0,
                    unique: 0,
                    duplicates: 0
                }
            };
        }

        const uniqueRuns = [];
        const duplicateRuns = [];

        for (const run of runs) {
            const duplicateCheck = this.isDuplicateCIResult(existingResults, run, options);
            
            if (duplicateCheck.isDuplicate) {
                duplicateRuns.push({
                    run: run,
                    duplicateInfo: duplicateCheck
                });
            } else {
                uniqueRuns.push(run);
            }
        }

        return {
            uniqueRuns: uniqueRuns,
            duplicateRuns: duplicateRuns,
            stats: {
                total: runs.length,
                unique: uniqueRuns.length,
                duplicates: duplicateRuns.length
            }
        };
    }

    /**
     * CI結果の更新が必要かチェック
     * @param {Object} existingResult - 既存のCI結果
     * @param {WorkflowRun} newRun - 新しいワークフロー実行
     * @returns {boolean} 更新が必要かどうか
     */
    shouldUpdateExistingResult(existingResult, newRun) {
        if (!existingResult || !newRun || !existingResult.githubData) {
            return false;
        }

        // 同じRun IDの場合は更新不要
        if (existingResult.githubData.runId === newRun.id) {
            return false;
        }

        // より新しい実行の場合は更新を検討
        const existingTime = new Date(existingResult.timestamp).getTime();
        const newTime = new Date(newRun.updated_at || newRun.run_started_at).getTime();

        return newTime > existingTime;
    }

    /**
     * CI結果をタイムスタンプでソート
     * @param {Object[]} results - CI結果配列
     * @param {'asc'|'desc'} order - ソート順序
     * @returns {Object[]} ソートされたCI結果配列
     */
    sortCIResultsByTimestamp(results, order = 'desc') {
        if (!Array.isArray(results)) {
            return [];
        }

        return results.sort((a, b) => {
            const timeA = new Date(a.timestamp).getTime();
            const timeB = new Date(b.timestamp).getTime();
            
            return order === 'desc' ? timeB - timeA : timeA - timeB;
        });
    }

    /**
     * 複数ワークフローの結果統合機能
     * Requirements 8.1, 8.2: 複数ワークフローの結果統合機能とワークフロー名の記録機能を実装
     * @param {Object[]} ciResults - CI結果配列
     * @param {Object} [options] - 統合オプション
     * @returns {Object} 統合結果
     */
    integrateMultipleWorkflowResults(ciResults, options = {}) {
        if (!Array.isArray(ciResults)) {
            return {
                integratedResults: [],
                workflowSummary: {},
                integrationStats: {}
            };
        }

        const {
            groupByCommit = true,
            groupByBranch = false,
            groupByTimeWindow = false,
            timeWindowMs = 300000, // 5分
            mergeStrategy = 'latest' // 'latest', 'best', 'all'
        } = options;

        const workflowSummary = {};
        const integrationStats = {
            totalResults: ciResults.length,
            githubResults: 0,
            manualResults: 0,
            workflowCount: 0,
            integratedGroups: 0
        };

        // GitHub由来の結果を分析
        const githubResults = ciResults.filter(result => {
            if (result.source === 'github') {
                integrationStats.githubResults++;
                return true;
            } else {
                integrationStats.manualResults++;
                return false;
            }
        });

        // ワークフロー別の統計を作成
        for (const result of githubResults) {
            if (result.githubData && result.githubData.workflowName) {
                const workflowName = result.githubData.workflowName;
                
                if (!workflowSummary[workflowName]) {
                    workflowSummary[workflowName] = {
                        name: workflowName,
                        totalRuns: 0,
                        successfulRuns: 0,
                        failedRuns: 0,
                        latestRun: null,
                        branches: new Set(),
                        commits: new Set()
                    };
                    integrationStats.workflowCount++;
                }

                const summary = workflowSummary[workflowName];
                summary.totalRuns++;
                
                if (result.status === 'pass') {
                    summary.successfulRuns++;
                } else {
                    summary.failedRuns++;
                }

                // 最新実行を追跡
                if (!summary.latestRun || 
                    new Date(result.timestamp) > new Date(summary.latestRun.timestamp)) {
                    summary.latestRun = result;
                }

                // ブランチとコミットを追跡
                if (result.githubData.branch) {
                    summary.branches.add(result.githubData.branch);
                }
                if (result.githubData.commitSha) {
                    summary.commits.add(result.githubData.commitSha);
                }
            }
        }

        // Set を配列に変換
        for (const summary of Object.values(workflowSummary)) {
            summary.branches = Array.from(summary.branches);
            summary.commits = Array.from(summary.commits);
        }

        // グループ化戦略に基づいて結果を統合
        let integratedResults = [];

        if (groupByCommit) {
            integratedResults = this.groupResultsByCommit(githubResults, mergeStrategy);
        } else if (groupByBranch) {
            integratedResults = this.groupResultsByBranch(githubResults, mergeStrategy);
        } else if (groupByTimeWindow) {
            integratedResults = this.groupResultsByTimeWindow(githubResults, timeWindowMs, mergeStrategy);
        } else {
            // グループ化しない場合はそのまま返す
            integratedResults = ciResults;
        }

        // 手動結果を追加
        const manualResults = ciResults.filter(result => result.source !== 'github');
        integratedResults.push(...manualResults);

        integrationStats.integratedGroups = integratedResults.length;

        return {
            integratedResults: integratedResults,
            workflowSummary: workflowSummary,
            integrationStats: integrationStats
        };
    }

    /**
     * コミット別にCI結果をグループ化
     * @param {Object[]} results - CI結果配列
     * @param {string} mergeStrategy - マージ戦略
     * @returns {Object[]} グループ化されたCI結果
     */
    groupResultsByCommit(results, mergeStrategy) {
        const commitGroups = {};

        for (const result of results) {
            if (!result.githubData || !result.githubData.commitSha) {
                continue;
            }

            const commitSha = result.githubData.commitSha;
            if (!commitGroups[commitSha]) {
                commitGroups[commitSha] = [];
            }
            commitGroups[commitSha].push(result);
        }

        return Object.values(commitGroups).map(group => 
            this.mergeResultGroup(group, mergeStrategy)
        );
    }

    /**
     * ブランチ別にCI結果をグループ化
     * @param {Object[]} results - CI結果配列
     * @param {string} mergeStrategy - マージ戦略
     * @returns {Object[]} グループ化されたCI結果
     */
    groupResultsByBranch(results, mergeStrategy) {
        const branchGroups = {};

        for (const result of results) {
            if (!result.githubData || !result.githubData.branch) {
                continue;
            }

            const branch = result.githubData.branch;
            if (!branchGroups[branch]) {
                branchGroups[branch] = [];
            }
            branchGroups[branch].push(result);
        }

        return Object.values(branchGroups).map(group => 
            this.mergeResultGroup(group, mergeStrategy)
        );
    }

    /**
     * 時間窓別にCI結果をグループ化
     * @param {Object[]} results - CI結果配列
     * @param {number} timeWindowMs - 時間窓（ミリ秒）
     * @param {string} mergeStrategy - マージ戦略
     * @returns {Object[]} グループ化されたCI結果
     */
    groupResultsByTimeWindow(results, timeWindowMs, mergeStrategy) {
        // タイムスタンプでソート
        const sortedResults = results.sort((a, b) => 
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const timeGroups = [];
        let currentGroup = [];
        let groupStartTime = null;

        for (const result of sortedResults) {
            const resultTime = new Date(result.timestamp).getTime();

            if (groupStartTime === null || 
                resultTime - groupStartTime <= timeWindowMs) {
                // 現在のグループに追加
                currentGroup.push(result);
                if (groupStartTime === null) {
                    groupStartTime = resultTime;
                }
            } else {
                // 新しいグループを開始
                if (currentGroup.length > 0) {
                    timeGroups.push(currentGroup);
                }
                currentGroup = [result];
                groupStartTime = resultTime;
            }
        }

        // 最後のグループを追加
        if (currentGroup.length > 0) {
            timeGroups.push(currentGroup);
        }

        return timeGroups.map(group => 
            this.mergeResultGroup(group, mergeStrategy)
        );
    }

    /**
     * CI結果グループをマージ
     * @param {Object[]} group - CI結果グループ
     * @param {string} mergeStrategy - マージ戦略
     * @returns {Object} マージされたCI結果
     */
    mergeResultGroup(group, mergeStrategy) {
        if (!Array.isArray(group) || group.length === 0) {
            return null;
        }

        if (group.length === 1) {
            return group[0];
        }

        switch (mergeStrategy) {
            case 'latest':
                return this.selectLatestResult(group);
            case 'best':
                return this.selectBestResult(group);
            case 'all':
                return this.combineAllResults(group);
            default:
                return group[0];
        }
    }

    /**
     * 最新のCI結果を選択
     * @param {Object[]} group - CI結果グループ
     * @returns {Object} 最新のCI結果
     */
    selectLatestResult(group) {
        return group.reduce((latest, current) => {
            const latestTime = new Date(latest.timestamp).getTime();
            const currentTime = new Date(current.timestamp).getTime();
            return currentTime > latestTime ? current : latest;
        });
    }

    /**
     * 最良のCI結果を選択（成功を優先）
     * @param {Object[]} group - CI結果グループ
     * @returns {Object} 最良のCI結果
     */
    selectBestResult(group) {
        // 成功した結果を優先
        const passedResults = group.filter(result => result.status === 'pass');
        if (passedResults.length > 0) {
            return this.selectLatestResult(passedResults);
        }

        // 成功した結果がない場合は最新を選択
        return this.selectLatestResult(group);
    }

    /**
     * 全ての結果を組み合わせ
     * @param {Object[]} group - CI結果グループ
     * @returns {Object} 組み合わせられたCI結果
     */
    combineAllResults(group) {
        const latest = this.selectLatestResult(group);
        
        // 複数ワークフローの情報を統合
        const workflowNames = [...new Set(
            group.map(result => result.githubData?.workflowName).filter(Boolean)
        )];

        // 統合されたGitHubデータを作成
        const combinedGithubData = {
            ...latest.githubData,
            workflowNames: workflowNames,
            totalRuns: group.length,
            combinedFrom: group.map(result => ({
                runId: result.githubData?.runId,
                workflowName: result.githubData?.workflowName,
                status: result.status,
                timestamp: result.timestamp
            }))
        };

        return {
            ...latest,
            githubData: combinedGithubData
        };
    }

    /**
     * ワークフロー名でCI結果をフィルタリング
     * Requirements 8.3: ワークフローフィルタリング機能を実装
     * @param {Object[]} results - CI結果配列
     * @param {string[]} workflowNames - フィルタするワークフロー名配列
     * @param {Object} [options] - フィルタオプション
     * @returns {Object} フィルタ結果
     */
    filterCIResultsByWorkflow(results, workflowNames, options = {}) {
        if (!Array.isArray(results) || !Array.isArray(workflowNames)) {
            return {
                filteredResults: results || [],
                filterStats: {
                    total: Array.isArray(results) ? results.length : 0,
                    filtered: 0,
                    excluded: 0
                }
            };
        }

        const {
            includeManualResults = true,
            exactMatch = true,
            caseInsensitive = false
        } = options;

        const filteredResults = [];
        let excludedCount = 0;

        for (const result of results) {
            // 手動結果の処理
            if (result.source !== 'github' || !result.githubData) {
                if (includeManualResults) {
                    filteredResults.push(result);
                } else {
                    excludedCount++;
                }
                continue;
            }

            // ワークフロー名でのフィルタリング
            const resultWorkflowName = result.githubData.workflowName;
            let shouldInclude = false;

            for (const filterName of workflowNames) {
                if (exactMatch) {
                    if (caseInsensitive) {
                        shouldInclude = resultWorkflowName.toLowerCase() === filterName.toLowerCase();
                    } else {
                        shouldInclude = resultWorkflowName === filterName;
                    }
                } else {
                    if (caseInsensitive) {
                        shouldInclude = resultWorkflowName.toLowerCase().includes(filterName.toLowerCase());
                    } else {
                        shouldInclude = resultWorkflowName.includes(filterName);
                    }
                }

                if (shouldInclude) {
                    break;
                }
            }

            if (shouldInclude) {
                filteredResults.push(result);
            } else {
                excludedCount++;
            }
        }

        return {
            filteredResults: filteredResults,
            filterStats: {
                total: results.length,
                filtered: filteredResults.length,
                excluded: excludedCount
            }
        };
    }

    /**
     * ワークフロー名の記録と管理
     * Requirements 8.2: ワークフロー名の記録機能を実装
     * @param {Object[]} ciResults - CI結果配列
     * @returns {Object} ワークフロー名の統計情報
     */
    recordWorkflowNames(ciResults) {
        if (!Array.isArray(ciResults)) {
            return {
                workflowNames: [],
                workflowStats: {},
                totalWorkflows: 0
            };
        }

        const workflowStats = {};
        const workflowNames = new Set();

        for (const result of ciResults) {
            if (result.source === 'github' && 
                result.githubData && 
                result.githubData.workflowName) {
                
                const workflowName = result.githubData.workflowName;
                workflowNames.add(workflowName);

                if (!workflowStats[workflowName]) {
                    workflowStats[workflowName] = {
                        name: workflowName,
                        totalRuns: 0,
                        successfulRuns: 0,
                        failedRuns: 0,
                        firstSeen: result.timestamp,
                        lastSeen: result.timestamp,
                        branches: new Set(),
                        commits: new Set()
                    };
                }

                const stats = workflowStats[workflowName];
                stats.totalRuns++;

                if (result.status === 'pass') {
                    stats.successfulRuns++;
                } else {
                    stats.failedRuns++;
                }

                // 時刻の更新
                if (new Date(result.timestamp) < new Date(stats.firstSeen)) {
                    stats.firstSeen = result.timestamp;
                }
                if (new Date(result.timestamp) > new Date(stats.lastSeen)) {
                    stats.lastSeen = result.timestamp;
                }

                // ブランチとコミットの追跡
                if (result.githubData.branch) {
                    stats.branches.add(result.githubData.branch);
                }
                if (result.githubData.commitSha) {
                    stats.commits.add(result.githubData.commitSha);
                }
            }
        }

        // Set を配列に変換
        for (const stats of Object.values(workflowStats)) {
            stats.branches = Array.from(stats.branches);
            stats.commits = Array.from(stats.commits);
            stats.successRate = stats.totalRuns > 0 ? 
                (stats.successfulRuns / stats.totalRuns * 100).toFixed(2) : 0;
        }

        return {
            workflowNames: Array.from(workflowNames).sort(),
            workflowStats: workflowStats,
            totalWorkflows: workflowNames.size
        };
    }

    /**
     * CI結果の統計情報を生成
     * @param {Object[]} results - CI結果配列
     * @returns {Object} 統計情報
     */
    generateCIResultStats(results) {
        if (!Array.isArray(results)) {
            return {
                total: 0,
                passed: 0,
                failed: 0,
                githubResults: 0,
                manualResults: 0,
                withMetrics: 0
            };
        }

        const stats = {
            total: results.length,
            passed: 0,
            failed: 0,
            githubResults: 0,
            manualResults: 0,
            withMetrics: 0
        };

        for (const result of results) {
            // 合否統計
            if (result.status === 'pass') {
                stats.passed++;
            } else {
                stats.failed++;
            }

            // ソース統計
            if (result.source === 'github') {
                stats.githubResults++;
            } else {
                stats.manualResults++;
            }

            // メトリクス統計
            if (result.lintResult || result.contractTestResult || result.coverage) {
                stats.withMetrics++;
            }
        }

        return stats;
    }
}

// ========================================
// ユーティリティクラス
// ========================================

/**
 * 並列処理制御用のセマフォクラス
 */
class Semaphore {
    constructor(maxConcurrency) {
        this.maxConcurrency = maxConcurrency;
        this.currentCount = 0;
        this.waitingQueue = [];
    }

    /**
     * セマフォを取得してタスクを実行
     * @param {Function} task - 実行するタスク
     * @returns {Promise} タスクの実行結果
     */
    async acquire(task) {
        return new Promise((resolve, reject) => {
            const executeTask = async () => {
                this.currentCount++;
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                } finally {
                    this.currentCount--;
                    if (this.waitingQueue.length > 0) {
                        const nextTask = this.waitingQueue.shift();
                        nextTask();
                    }
                }
            };

            if (this.currentCount < this.maxConcurrency) {
                executeTask();
            } else {
                this.waitingQueue.push(executeTask);
            }
        });
    }
}

// ========================================
// エクスポート（グローバル変数として設定）
// ========================================

// グローバルスコープで利用可能にする
if (typeof window !== 'undefined') {
    window.MetricsExtractor = MetricsExtractor;
    window.WorkflowDataParser = WorkflowDataParser;
}

// Node.js環境での利用（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MetricsExtractor,
        WorkflowDataParser
    };
}

// ========================================
// エラー回復とフォールバック機能
// ========================================

/**
 * メトリクス抽出のエラー回復とフォールバック機能を提供するクラス
 */
class MetricsExtractionFallback {
    constructor() {
        this.fallbackStrategies = this.initializeFallbackStrategies();
        this.workflowTypeDetectors = this.initializeWorkflowTypeDetectors();
    }

    /**
     * フォールバック戦略を初期化
     * @returns {Object} フォールバック戦略マップ
     */
    initializeFallbackStrategies() {
        return {
            // ログ取得失敗時の戦略
            logFetchFailure: {
                strategy: 'use-job-conclusion',
                description: 'ジョブの結論からCI結果を推定'
            },
            // メトリクス抽出失敗時の戦略
            metricsExtractionFailure: {
                strategy: 'basic-ci-result',
                description: '基本的なCI結果のみ保存'
            },
            // 部分的メトリクス抽出時の戦略
            partialMetricsExtraction: {
                strategy: 'save-available-metrics',
                description: '取得できたメトリクスのみ保存'
            },
            // ワークフロータイプ不明時の戦略
            unknownWorkflowType: {
                strategy: 'generic-patterns',
                description: '汎用パターンでメトリクス抽出を試行'
            }
        };
    }

    /**
     * ワークフロータイプ検出器を初期化
     * @returns {Object} ワークフロータイプ検出器マップ
     */
    initializeWorkflowTypeDetectors() {
        return {
            nodejs: {
                indicators: ['node', 'npm', 'yarn', 'package.json', 'jest', 'eslint'],
                lintTools: ['eslint', 'tslint', 'prettier'],
                testTools: ['jest', 'mocha', 'jasmine'],
                coverageTools: ['nyc', 'istanbul', 'c8']
            },
            python: {
                indicators: ['python', 'pip', 'requirements.txt', 'setup.py', 'pytest'],
                lintTools: ['pylint', 'flake8', 'black', 'mypy'],
                testTools: ['pytest', 'unittest', 'nose'],
                coverageTools: ['coverage.py', 'pytest-cov']
            },
            java: {
                indicators: ['java', 'maven', 'gradle', 'pom.xml', 'build.gradle'],
                lintTools: ['checkstyle', 'spotbugs', 'pmd'],
                testTools: ['junit', 'testng', 'spock'],
                coverageTools: ['jacoco', 'cobertura']
            },
            dotnet: {
                indicators: ['dotnet', '.net', 'nuget', 'csproj', 'sln'],
                lintTools: ['roslyn', 'stylecop'],
                testTools: ['mstest', 'nunit', 'xunit'],
                coverageTools: ['coverlet', 'dotcover']
            },
            go: {
                indicators: ['go', 'golang', 'go.mod', 'go.sum'],
                lintTools: ['golint', 'golangci-lint', 'gofmt'],
                testTools: ['go test'],
                coverageTools: ['go tool cover']
            },
            ruby: {
                indicators: ['ruby', 'gem', 'bundle', 'gemfile', 'rakefile'],
                lintTools: ['rubocop', 'reek'],
                testTools: ['rspec', 'minitest'],
                coverageTools: ['simplecov']
            }
        };
    }

    /**
     * メトリクス抽出の包括実行（フォールバック付き）
     * @param {Job[]} jobs - ジョブ配列
     * @param {GitHubIntegrationClient} apiClient - GitHub APIクライアント
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @returns {Promise<Object>} 抽出結果とフォールバック情報
     */
    async executeComprehensiveMetricsExtraction(jobs, apiClient, owner, repo) {
        const result = {
            metrics: {},
            fallbacksUsed: [],
            errors: [],
            extractionStats: {
                totalJobs: Array.isArray(jobs) ? jobs.length : 0,
                processedJobs: 0,
                failedJobs: 0,
                logsFetched: 0,
                logsFailed: 0
            }
        };

        if (!Array.isArray(jobs) || jobs.length === 0) {
            result.fallbacksUsed.push('no-jobs-available');
            return result;
        }

        // ワークフロータイプを検出
        const detectedTypes = this.detectWorkflowTypesAdvanced(jobs);
        result.detectedWorkflowTypes = detectedTypes;

        // 各ジョブを処理
        for (const job of jobs) {
            try {
                result.extractionStats.processedJobs++;
                
                // ジョブログを取得
                let logs = '';
                let logFetchSuccess = false;
                
                if (apiClient && typeof apiClient.getJobLogs === 'function') {
                    try {
                        logs = await apiClient.getJobLogs(owner, repo, job.id);
                        logFetchSuccess = true;
                        result.extractionStats.logsFetched++;
                    } catch (error) {
                        result.extractionStats.logsFailed++;
                        result.errors.push(`Log fetch failed for job ${job.id}: ${error.message}`);
                        
                        // ログ取得失敗時のフォールバック
                        const fallbackResult = this.handleLogFetchFailure(job);
                        if (fallbackResult) {
                            this.mergeFallbackResult(result.metrics, fallbackResult);
                            result.fallbacksUsed.push(`log-fetch-failure-job-${job.id}`);
                        }
                        continue;
                    }
                }

                // メトリクス抽出を試行
                const extractionResult = await this.extractMetricsWithFallback(
                    logs, 
                    job, 
                    detectedTypes
                );

                // 結果をマージ
                this.mergeFallbackResult(result.metrics, extractionResult.metrics);
                result.fallbacksUsed.push(...extractionResult.fallbacksUsed);
                result.errors.push(...extractionResult.errors);

            } catch (error) {
                result.extractionStats.failedJobs++;
                result.errors.push(`Job processing failed for ${job.id}: ${error.message}`);
                
                // 完全失敗時のフォールバック
                const emergencyFallback = this.createEmergencyFallback(job);
                if (emergencyFallback) {
                    this.mergeFallbackResult(result.metrics, emergencyFallback);
                    result.fallbacksUsed.push(`emergency-fallback-job-${job.id}`);
                }
            }
        }

        // SBOM検出（フォールバック付き）
        try {
            result.metrics.sbomStatus = this.detectSBOMGenerationWithFallback(jobs);
        } catch (error) {
            result.errors.push(`SBOM detection failed: ${error.message}`);
            result.metrics.sbomStatus = 'not_generated';
            result.fallbacksUsed.push('sbom-detection-fallback');
        }

        return result;
    }

    /**
     * 高度なワークフロータイプ検出
     * @param {Job[]} jobs - ジョブ配列
     * @returns {string[]} 検出されたワークフロータイプ
     */
    detectWorkflowTypesAdvanced(jobs) {
        const detectedTypes = new Set();
        const confidence = {};

        if (!Array.isArray(jobs)) {
            return [];
        }

        for (const job of jobs) {
            if (!job.steps || !Array.isArray(job.steps)) {
                continue;
            }

            // ジョブ名からの推定
            if (job.name && typeof job.name === 'string') {
                const jobName = job.name.toLowerCase();
                for (const [type, detector] of Object.entries(this.workflowTypeDetectors)) {
                    for (const indicator of detector.indicators) {
                        if (jobName.includes(indicator)) {
                            detectedTypes.add(type);
                            confidence[type] = (confidence[type] || 0) + 2; // ジョブ名は高い信頼度
                        }
                    }
                }
            }

            // ステップ名からの推定
            for (const step of job.steps) {
                if (!step.name || typeof step.name !== 'string') {
                    continue;
                }

                const stepName = step.name.toLowerCase();
                for (const [type, detector] of Object.entries(this.workflowTypeDetectors)) {
                    for (const indicator of detector.indicators) {
                        if (stepName.includes(indicator)) {
                            detectedTypes.add(type);
                            confidence[type] = (confidence[type] || 0) + 1;
                        }
                    }
                }
            }
        }

        // 信頼度でソート
        const sortedTypes = Array.from(detectedTypes).sort((a, b) => 
            (confidence[b] || 0) - (confidence[a] || 0)
        );

        return sortedTypes;
    }

    /**
     * フォールバック付きメトリクス抽出
     * @param {string} logs - ジョブログ
     * @param {Job} job - ジョブデータ
     * @param {string[]} workflowTypes - 検出されたワークフロータイプ
     * @returns {Promise<Object>} 抽出結果
     */
    async extractMetricsWithFallback(logs, job, workflowTypes) {
        const result = {
            metrics: {},
            fallbacksUsed: [],
            errors: []
        };

        const metricsExtractor = new MetricsExtractor();

        // 標準的なメトリクス抽出を試行
        try {
            // Lint結果の抽出
            const lintResult = metricsExtractor.extractLintResults(logs);
            if (lintResult) {
                result.metrics.lintResult = lintResult;
            } else {
                // ワークフロータイプ固有のフォールバック
                const fallbackLint = this.extractLintWithWorkflowFallback(logs, job, workflowTypes);
                if (fallbackLint) {
                    result.metrics.lintResult = fallbackLint;
                    result.fallbacksUsed.push('lint-workflow-fallback');
                }
            }

            // テスト結果の抽出
            const testResult = metricsExtractor.extractTestResults(logs);
            if (testResult) {
                result.metrics.contractTestResult = testResult;
            } else {
                // ワークフロータイプ固有のフォールバック
                const fallbackTest = this.extractTestWithWorkflowFallback(logs, job, workflowTypes);
                if (fallbackTest) {
                    result.metrics.contractTestResult = fallbackTest;
                    result.fallbacksUsed.push('test-workflow-fallback');
                }
            }

            // カバレッジ結果の抽出
            const coverageResult = metricsExtractor.extractCoverageResults(logs);
            if (coverageResult) {
                result.metrics.coverage = coverageResult;
            } else {
                // ワークフロータイプ固有のフォールバック
                const fallbackCoverage = this.extractCoverageWithWorkflowFallback(logs, job, workflowTypes);
                if (fallbackCoverage) {
                    result.metrics.coverage = fallbackCoverage;
                    result.fallbacksUsed.push('coverage-workflow-fallback');
                }
            }

        } catch (error) {
            result.errors.push(`Metrics extraction failed: ${error.message}`);
            
            // 緊急フォールバック：ジョブの結論から推定
            const emergencyMetrics = this.inferMetricsFromJobConclusion(job);
            if (emergencyMetrics) {
                Object.assign(result.metrics, emergencyMetrics);
                result.fallbacksUsed.push('emergency-job-conclusion-inference');
            }
        }

        return result;
    }

    /**
     * ログ取得失敗時のフォールバック処理
     * @param {Job} job - ジョブデータ
     * @returns {Object|null} フォールバック結果
     */
    handleLogFetchFailure(job) {
        if (!job || typeof job !== 'object') {
            return null;
        }

        // ジョブの結論とステップ情報から推定
        const fallbackMetrics = {};

        // ジョブが成功している場合の推定
        if (job.conclusion === 'success') {
            // 成功したジョブからは基本的な成功メトリクスを推定
            if (this.isLikelyLintJob(job)) {
                fallbackMetrics.lintResult = {
                    passed: true,
                    errorCount: 0,
                    warningCount: 0
                };
            }

            if (this.isLikelyTestJob(job)) {
                fallbackMetrics.contractTestResult = {
                    passed: true,
                    totalTests: 1, // 最低限の推定
                    passedTests: 1
                };
            }
        } else if (job.conclusion === 'failure') {
            // 失敗したジョブからは失敗メトリクスを推定
            if (this.isLikelyLintJob(job)) {
                fallbackMetrics.lintResult = {
                    passed: false,
                    errorCount: 1, // 最低限の推定
                    warningCount: 0
                };
            }

            if (this.isLikelyTestJob(job)) {
                fallbackMetrics.contractTestResult = {
                    passed: false,
                    totalTests: 1,
                    passedTests: 0
                };
            }
        }

        return Object.keys(fallbackMetrics).length > 0 ? fallbackMetrics : null;
    }

    /**
     * ワークフロータイプ固有のlint抽出フォールバック
     * @param {string} logs - ログ
     * @param {Job} job - ジョブデータ
     * @param {string[]} workflowTypes - ワークフロータイプ
     * @returns {Object|null} lint結果
     */
    extractLintWithWorkflowFallback(logs, job, workflowTypes) {
        if (!logs || typeof logs !== 'string') {
            return null;
        }

        // ワークフロータイプ固有のパターンを試行
        for (const type of workflowTypes) {
            const detector = this.workflowTypeDetectors[type];
            if (!detector) continue;

            for (const tool of detector.lintTools) {
                // ツール固有のパターンを試行
                const result = this.tryToolSpecificLintPattern(logs, tool);
                if (result) {
                    return result;
                }
            }
        }

        // 汎用フォールバックパターン
        return this.tryGenericLintFallback(logs, job);
    }

    /**
     * ワークフロータイプ固有のテスト抽出フォールバック
     * @param {string} logs - ログ
     * @param {Job} job - ジョブデータ
     * @param {string[]} workflowTypes - ワークフロータイプ
     * @returns {Object|null} テスト結果
     */
    extractTestWithWorkflowFallback(logs, job, workflowTypes) {
        if (!logs || typeof logs !== 'string') {
            return null;
        }

        // ワークフロータイプ固有のパターンを試行
        for (const type of workflowTypes) {
            const detector = this.workflowTypeDetectors[type];
            if (!detector) continue;

            for (const tool of detector.testTools) {
                // ツール固有のパターンを試行
                const result = this.tryToolSpecificTestPattern(logs, tool);
                if (result) {
                    return result;
                }
            }
        }

        // 汎用フォールバックパターン
        return this.tryGenericTestFallback(logs, job);
    }

    /**
     * ワークフロータイプ固有のカバレッジ抽出フォールバック
     * @param {string} logs - ログ
     * @param {Job} job - ジョブデータ
     * @param {string[]} workflowTypes - ワークフロータイプ
     * @returns {Object|null} カバレッジ結果
     */
    extractCoverageWithWorkflowFallback(logs, job, workflowTypes) {
        if (!logs || typeof logs !== 'string') {
            return null;
        }

        // ワークフロータイプ固有のパターンを試行
        for (const type of workflowTypes) {
            const detector = this.workflowTypeDetectors[type];
            if (!detector) continue;

            for (const tool of detector.coverageTools) {
                // ツール固有のパターンを試行
                const result = this.tryToolSpecificCoveragePattern(logs, tool);
                if (result) {
                    return result;
                }
            }
        }

        // 汎用フォールバックパターン
        return this.tryGenericCoverageFallback(logs, job);
    }

    /**
     * SBOM検出（フォールバック付き）
     * @param {Job[]} jobs - ジョブ配列
     * @returns {'generated'|'not_generated'|'error'} SBOM状態
     */
    detectSBOMGenerationWithFallback(jobs) {
        if (!Array.isArray(jobs)) {
            return 'not_generated';
        }

        const metricsExtractor = new MetricsExtractor();
        
        // 標準的なSBOM検出を試行
        try {
            const standardResult = metricsExtractor.detectSBOMGeneration(jobs);
            if (standardResult !== 'not_generated') {
                return standardResult;
            }
        } catch (error) {
            console.warn('Standard SBOM detection failed:', error);
        }

        // フォールバック：より広範囲なパターンで検索
        const extendedSBOMPatterns = [
            'dependency',
            'vulnerability',
            'security',
            'audit',
            'license',
            'component',
            'supply-chain',
            'third-party'
        ];

        for (const job of jobs) {
            if (!job.steps || !Array.isArray(job.steps)) {
                continue;
            }

            for (const step of job.steps) {
                if (!step.name || typeof step.name !== 'string') {
                    continue;
                }

                const stepName = step.name.toLowerCase();
                
                // 拡張パターンでの検索
                const isSBOMRelated = extendedSBOMPatterns.some(pattern => 
                    stepName.includes(pattern)
                );

                if (isSBOMRelated) {
                    if (step.conclusion === 'success') {
                        return 'generated';
                    } else if (step.conclusion === 'failure') {
                        return 'error';
                    }
                }
            }
        }

        return 'not_generated';
    }

    /**
     * ジョブの結論からメトリクスを推定
     * @param {Job} job - ジョブデータ
     * @returns {Object|null} 推定メトリクス
     */
    inferMetricsFromJobConclusion(job) {
        if (!job || typeof job !== 'object') {
            return null;
        }

        const metrics = {};

        // ジョブ名からタイプを推定
        const isLintJob = this.isLikelyLintJob(job);
        const isTestJob = this.isLikelyTestJob(job);

        if (job.conclusion === 'success') {
            if (isLintJob) {
                metrics.lintResult = {
                    passed: true,
                    errorCount: 0,
                    warningCount: 0
                };
            }
            if (isTestJob) {
                metrics.contractTestResult = {
                    passed: true,
                    totalTests: 1,
                    passedTests: 1
                };
            }
        } else if (job.conclusion === 'failure') {
            if (isLintJob) {
                metrics.lintResult = {
                    passed: false,
                    errorCount: 1,
                    warningCount: 0
                };
            }
            if (isTestJob) {
                metrics.contractTestResult = {
                    passed: false,
                    totalTests: 1,
                    passedTests: 0
                };
            }
        }

        return Object.keys(metrics).length > 0 ? metrics : null;
    }

    /**
     * 緊急フォールバック結果を作成
     * @param {Job} job - ジョブデータ
     * @returns {Object|null} 緊急フォールバック結果
     */
    createEmergencyFallback(job) {
        // 最低限の情報でもCI結果を作成
        return this.inferMetricsFromJobConclusion(job);
    }

    /**
     * フォールバック結果をマージ
     * @param {Object} target - マージ先
     * @param {Object} source - マージ元
     */
    mergeFallbackResult(target, source) {
        if (!source || typeof source !== 'object') {
            return;
        }

        // 既存の結果を上書きしない（最初に見つかった結果を優先）
        for (const [key, value] of Object.entries(source)) {
            if (!target[key] && value !== null && value !== undefined) {
                target[key] = value;
            }
        }
    }

    /**
     * ジョブがlint関連かどうかを判定
     * @param {Job} job - ジョブデータ
     * @returns {boolean} lint関連かどうか
     */
    isLikelyLintJob(job) {
        if (!job || !job.name || typeof job.name !== 'string') {
            return false;
        }

        const jobName = job.name.toLowerCase();
        const lintKeywords = ['lint', 'format', 'style', 'check', 'quality', 'eslint', 'tslint', 'prettier'];
        
        return lintKeywords.some(keyword => jobName.includes(keyword));
    }

    /**
     * ジョブがテスト関連かどうかを判定
     * @param {Job} job - ジョブデータ
     * @returns {boolean} テスト関連かどうか
     */
    isLikelyTestJob(job) {
        if (!job || !job.name || typeof job.name !== 'string') {
            return false;
        }

        const jobName = job.name.toLowerCase();
        const testKeywords = ['test', 'spec', 'jest', 'mocha', 'pytest', 'junit', 'coverage'];
        
        return testKeywords.some(keyword => jobName.includes(keyword));
    }

    /**
     * ツール固有のlintパターンを試行
     * @param {string} logs - ログ
     * @param {string} tool - ツール名
     * @returns {Object|null} lint結果
     */
    tryToolSpecificLintPattern(logs, tool) {
        // ツール固有のフォールバックパターンを実装
        // 実装は省略（必要に応じて拡張）
        return null;
    }

    /**
     * ツール固有のテストパターンを試行
     * @param {string} logs - ログ
     * @param {string} tool - ツール名
     * @returns {Object|null} テスト結果
     */
    tryToolSpecificTestPattern(logs, tool) {
        // ツール固有のフォールバックパターンを実装
        // 実装は省略（必要に応じて拡張）
        return null;
    }

    /**
     * ツール固有のカバレッジパターンを試行
     * @param {string} logs - ログ
     * @param {string} tool - ツール名
     * @returns {Object|null} カバレッジ結果
     */
    tryToolSpecificCoveragePattern(logs, tool) {
        // ツール固有のフォールバックパターンを実装
        // 実装は省略（必要に応じて拡張）
        return null;
    }

    /**
     * 汎用lintフォールバック
     * @param {string} logs - ログ
     * @param {Job} job - ジョブデータ
     * @returns {Object|null} lint結果
     */
    tryGenericLintFallback(logs, job) {
        // エラーや警告の一般的なパターンを検索
        const errorPatterns = [
            /error/gi,
            /fail/gi,
            /✗/g,
            /✖/g
        ];

        let errorCount = 0;
        for (const pattern of errorPatterns) {
            const matches = logs.match(pattern);
            if (matches) {
                errorCount += matches.length;
            }
        }

        if (errorCount > 0 || job.conclusion === 'failure') {
            return {
                passed: false,
                errorCount: Math.max(1, errorCount),
                warningCount: 0
            };
        } else if (job.conclusion === 'success') {
            return {
                passed: true,
                errorCount: 0,
                warningCount: 0
            };
        }

        return null;
    }

    /**
     * 汎用テストフォールバック
     * @param {string} logs - ログ
     * @param {Job} job - ジョブデータ
     * @returns {Object|null} テスト結果
     */
    tryGenericTestFallback(logs, job) {
        // 成功/失敗の一般的なパターンを検索
        const successPatterns = [/pass/gi, /success/gi, /✓/g, /ok/gi];
        const failurePatterns = [/fail/gi, /error/gi, /✗/g, /✖/g];

        let passCount = 0;
        let failCount = 0;

        for (const pattern of successPatterns) {
            const matches = logs.match(pattern);
            if (matches) {
                passCount += matches.length;
            }
        }

        for (const pattern of failurePatterns) {
            const matches = logs.match(pattern);
            if (matches) {
                failCount += matches.length;
            }
        }

        const totalTests = passCount + failCount;
        if (totalTests > 0) {
            return {
                passed: failCount === 0,
                totalTests: totalTests,
                passedTests: passCount
            };
        } else if (job.conclusion === 'success') {
            return {
                passed: true,
                totalTests: 1,
                passedTests: 1
            };
        } else if (job.conclusion === 'failure') {
            return {
                passed: false,
                totalTests: 1,
                passedTests: 0
            };
        }

        return null;
    }

    /**
     * 汎用カバレッジフォールバック
     * @param {string} logs - ログ
     * @param {Job} job - ジョブデータ
     * @returns {Object|null} カバレッジ結果
     */
    tryGenericCoverageFallback(logs, job) {
        // パーセンテージパターンの一般的な検索
        const percentagePattern = /(\d+(?:\.\d+)?)%/g;
        const matches = [...logs.matchAll(percentagePattern)];
        
        if (matches.length > 0) {
            // 最も高い値を採用（カバレッジの可能性が高い）
            const percentages = matches.map(match => parseFloat(match[1]));
            const maxPercentage = Math.max(...percentages);
            
            if (maxPercentage <= 100) {
                return {
                    percentage: maxPercentage,
                    lines: undefined,
                    coveredLines: undefined
                };
            }
        }

        return null;
    }
}

// グローバルスコープで利用可能にする
if (typeof window !== 'undefined') {
    window.MetricsExtractionFallback = MetricsExtractionFallback;
}

// Node.js環境での利用（テスト用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports.MetricsExtractionFallback = MetricsExtractionFallback;
}