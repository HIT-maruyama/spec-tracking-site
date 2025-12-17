// GitHub統合機能 - メインモジュール

// ========================================
// GitHub統合データモデル定義
// ========================================

/**
 * GitHub設定データモデル
 * @typedef {Object} GitHubSettings
 * @property {string} [accessToken] - 暗号化されたPersonal Access Token
 * @property {boolean} autoSyncEnabled - 自動同期の有効/無効
 * @property {number} autoSyncInterval - 自動同期間隔（分）
 * @property {string} [lastSyncAt] - 最終同期時刻（ISO 8601）
 * @property {number} [rateLimitRemaining] - 残りAPI呼び出し回数
 * @property {string} [rateLimitResetAt] - レート制限リセット時刻（ISO 8601）
 * @property {number} maxRetries - 最大再試行回数
 * @property {number} retryDelay - 再試行間隔（秒）
 */

/**
 * 同期記録データモデル
 * @typedef {Object} SyncRecord
 * @property {string} id - UUID
 * @property {string} timestamp - 実行時刻（ISO 8601）
 * @property {string} projectId - 対象プロジェクトID
 * @property {string} projectName - プロジェクト名
 * @property {'success'|'failure'|'partial'} status - 同期結果
 * @property {number} newCIResults - 新規CI結果数
 * @property {number} updatedCIResults - 更新CI結果数
 * @property {string[]} errors - エラーメッセージ配列
 * @property {string} repositoryUrl - リポジトリURL
 * @property {number} workflowRunsProcessed - 処理したワークフロー実行数
 * @property {number} apiRequestsUsed - 使用したAPI呼び出し回数
 * @property {number} durationMs - 処理時間（ミリ秒）
 */

/**
 * GitHub APIレート制限情報
 * @typedef {Object} RateLimit
 * @property {number} limit - 制限数
 * @property {number} remaining - 残り回数
 * @property {number} reset - リセット時刻（Unix timestamp）
 * @property {number} used - 使用済み回数
 * @property {string} resource - リソース種別
 */

/**
 * ワークフロー実行データ（GitHub API Response）
 * @typedef {Object} WorkflowRun
 * @property {number} id - ワークフロー実行ID
 * @property {string} name - ワークフロー名
 * @property {string} head_branch - ブランチ名
 * @property {string} head_sha - コミットSHA
 * @property {'queued'|'in_progress'|'completed'} status - 実行状態
 * @property {'success'|'failure'|'neutral'|'cancelled'|'skipped'|'timed_out'|'action_required'|null} conclusion - 実行結果
 * @property {number} workflow_id - ワークフローID
 * @property {string} created_at - 作成時刻
 * @property {string} updated_at - 更新時刻
 * @property {string} run_started_at - 実行開始時刻
 * @property {string} html_url - GitHub上のURL
 * @property {Object} actor - 実行者情報
 * @property {string} actor.login - 実行者ユーザー名
 * @property {string} actor.avatar_url - アバターURL
 */

/**
 * ジョブデータ（GitHub API Response）
 * @typedef {Object} Job
 * @property {number} id - ジョブID
 * @property {number} run_id - ワークフロー実行ID
 * @property {string} name - ジョブ名
 * @property {'queued'|'in_progress'|'completed'} status - 実行状態
 * @property {'success'|'failure'|'neutral'|'cancelled'|'skipped'|'timed_out'|'action_required'|null} conclusion - 実行結果
 * @property {string} started_at - 開始時刻
 * @property {string} completed_at - 完了時刻
 * @property {JobStep[]} steps - ステップ配列
 */

/**
 * ジョブステップデータ
 * @typedef {Object} JobStep
 * @property {string} name - ステップ名
 * @property {'queued'|'in_progress'|'completed'} status - 実行状態
 * @property {'success'|'failure'|'neutral'|'cancelled'|'skipped'|'timed_out'|'action_required'|null} conclusion - 実行結果
 * @property {number} number - ステップ番号
 * @property {string} started_at - 開始時刻
 * @property {string} completed_at - 完了時刻
 */

// ========================================
// トークン暗号化クラス
// ========================================

// TokenEncryptionクラスは token-encryption.js で定義されています

// ========================================
// GitHub API統合クライアント
// ========================================

/**
 * GitHub APIとの統合を行うクライアントクラス
 * Octokit.jsを使用した自動レート制限管理とエラーハンドリングを提供
 */
class GitHubIntegrationClient {
    constructor(rateLimitManager = null) {
        this.octokit = null;
        this.rateLimitManager = rateLimitManager || RateLimitManager.getInstance();
        this.initializeOctokit();
    }

    /**
     * Octokitインスタンスを初期化
     * 自動レート制限管理とエラーハンドリング設定を含む
     */
    initializeOctokit() {
        // Octokit.jsがCDN経由で読み込まれていることを確認
        if (typeof window.Octokit === 'undefined') {
            console.error('Octokit.js is not loaded. Please check the CDN link.');
            return;
        }

        const { Octokit } = window.Octokit;
        
        // RateLimitManagerからthrottling設定を取得
        const throttleConfig = this.rateLimitManager.configureThrottling();
        
        this.octokit = new Octokit({
            throttle: throttleConfig,
            retry: {
                doNotRetry: ["400", "401", "403", "404", "422"],
                retries: 3
            }
        });
    }

    /**
     * Personal Access Tokenを設定
     * @param {string} token - Personal Access Token
     */
    setAccessToken(token) {
        if (!this.octokit) {
            this.initializeOctokit();
        }

        const { Octokit } = window.Octokit;
        
        // RateLimitManagerからthrottling設定を取得
        const throttleConfig = this.rateLimitManager.configureThrottling();
        
        // 認証状態をRateLimitManagerに通知
        this.rateLimitManager.setAuthenticationStatus(!!token);
        
        this.octokit = new Octokit({
            auth: token,
            throttle: throttleConfig,
            retry: {
                doNotRetry: ["400", "401", "403", "404", "422"],
                retries: 3
            }
        });
    }

    /**
     * GitHub APIへの接続をテスト
     * @returns {Promise<boolean>} 接続成功かどうか
     */
    async testConnection() {
        try {
            await this.octokit.rest.rateLimit.get();
            return true;
        } catch (error) {
            console.error('GitHub API connection test failed:', error);
            return false;
        }
    }

    /**
     * リポジトリの存在を検証
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @returns {Promise<boolean>} リポジトリが存在するかどうか
     */
    async validateRepository(owner, repo) {
        try {
            await this.octokit.rest.repos.get({ owner, repo });
            return true;
        } catch (error) {
            console.error(`Repository validation failed for ${owner}/${repo}:`, error);
            return false;
        }
    }

    /**
     * ワークフロー実行一覧を取得
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @param {Object} options - オプション
     * @param {number} [options.per_page=10] - 1ページあたりの件数
     * @param {'completed'|'in_progress'|'queued'} [options.status='completed'] - 実行状態
     * @returns {Promise<WorkflowRun[]>} ワークフロー実行配列
     */
    async getWorkflowRuns(owner, repo, options = {}) {
        try {
            const { data } = await this.octokit.rest.actions.listWorkflowRunsForRepo({
                owner,
                repo,
                per_page: options.per_page || 10,
                status: options.status || 'completed'
            });
            return data.workflow_runs;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    /**
     * すべてのワークフロー実行を取得（ページネーション対応）
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @param {Object} options - オプション
     * @param {number} [options.maxPages=10] - 最大ページ数
     * @param {'completed'|'in_progress'|'queued'} [options.status='completed'] - 実行状態
     * @returns {Promise<WorkflowRun[]>} すべてのワークフロー実行配列
     */
    async getAllWorkflowRuns(owner, repo, options = {}) {
        try {
            const { maxPages = 10, status = 'completed' } = options;
            
            // Octokitの自動ページネーション機能を使用
            const runs = await this.octokit.paginate(
                this.octokit.rest.actions.listWorkflowRunsForRepo,
                { 
                    owner, 
                    repo, 
                    per_page: 100,
                    status: status
                },
                (response, done) => {
                    // 最大ページ数に達したら停止
                    if (response.data.length === 0 || response.data.length < maxPages) {
                        done();
                    }
                    return response.data;
                }
            );
            return runs;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    /**
     * ワークフロー実行のジョブ一覧を取得
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @param {number} runId - ワークフロー実行ID
     * @returns {Promise<Job[]>} ジョブ配列
     */
    async getJobsForRun(owner, repo, runId) {
        try {
            const { data } = await this.octokit.rest.actions.listJobsForWorkflowRun({
                owner,
                repo,
                run_id: runId
            });
            return data.jobs;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    /**
     * ジョブのログを取得
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @param {number} jobId - ジョブID
     * @returns {Promise<string>} ジョブログ
     */
    async getJobLogs(owner, repo, jobId) {
        try {
            const { data } = await this.octokit.rest.actions.downloadJobLogsForWorkflowRun({
                owner,
                repo,
                job_id: jobId
            });
            
            // ログデータがバイナリの場合はテキストに変換
            if (typeof data === 'string') {
                return data;
            } else {
                // ArrayBufferやBlobの場合の処理
                return new TextDecoder().decode(data);
            }
        } catch (error) {
            // ログが取得できない場合は空文字列を返す
            if (error.status === 404) {
                console.warn(`Job logs not found for job ${jobId}`);
                return '';
            }
            this.handleRequestError(error);
            throw error;
        }
    }

    /**
     * ワークフロー実行のアーティファクト一覧を取得
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @param {number} runId - ワークフロー実行ID
     * @returns {Promise<Array>} アーティファクト配列
     */
    async getArtifactsForRun(owner, repo, runId) {
        try {
            const { data } = await this.octokit.rest.actions.listWorkflowRunArtifacts({
                owner,
                repo,
                run_id: runId
            });
            return data.artifacts;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    /**
     * リポジトリのワークフロー一覧を取得
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @returns {Promise<Array>} ワークフロー配列
     */
    async getWorkflows(owner, repo) {
        try {
            const { data } = await this.octokit.rest.actions.listRepoWorkflows({
                owner,
                repo
            });
            return data.workflows;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    /**
     * 特定のワークフローの実行一覧を取得
     * @param {string} owner - リポジトリオーナー
     * @param {string} repo - リポジトリ名
     * @param {number} workflowId - ワークフローID
     * @param {Object} options - オプション
     * @returns {Promise<WorkflowRun[]>} ワークフロー実行配列
     */
    async getWorkflowRunsById(owner, repo, workflowId, options = {}) {
        try {
            const { data } = await this.octokit.rest.actions.listWorkflowRuns({
                owner,
                repo,
                workflow_id: workflowId,
                per_page: options.per_page || 10,
                status: options.status || 'completed'
            });
            return data.workflow_runs;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    /**
     * レート制限情報を取得
     * @returns {Promise<RateLimit>} レート制限情報
     */
    async getRateLimit() {
        try {
            const { data } = await this.octokit.rest.rateLimit.get();
            return data.rate;
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }

    /**
     * 現在のレート制限使用状況を取得
     * @returns {Promise<Object>} 使用状況情報
     */
    async getUsageStatus() {
        try {
            const rateLimit = await this.getRateLimit();
            const resetTime = new Date(rateLimit.reset * 1000);
            const percentageUsed = ((rateLimit.limit - rateLimit.remaining) / rateLimit.limit) * 100;
            
            return {
                remaining: rateLimit.remaining,
                resetTime: resetTime,
                percentageUsed: Math.round(percentageUsed * 100) / 100,
                limit: rateLimit.limit,
                used: rateLimit.used
            };
        } catch (error) {
            this.handleRequestError(error);
            throw error;
        }
    }



    /**
     * 通知を表示
     * @param {string} message - メッセージ
     * @param {'info'|'warning'|'error'} type - 通知タイプ
     */
    showNotification(message, type = 'info') {
        // 既存の通知システムを使用
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * リクエストエラーを処理
     * @param {Error} error - エラーオブジェクト
     */
    handleRequestError(error) {
        const apiError = GitHubErrorHandler.handleAPIError(error);
        
        console.error(`GitHub API Error: ${apiError.status} - ${apiError.message}`);
        if (error.request) {
            console.error(`Request: ${error.request.method || 'Unknown'} ${error.request.url || 'Unknown'}`);
        }
        
        // 特定のエラーに対する処理
        switch (apiError.status) {
            case 401:
                throw new Error('GitHub認証が無効です。Personal Access Tokenを確認してください。');
            case 403:
                if (apiError.message && apiError.message.includes('rate limit')) {
                    throw new Error('GitHub APIのレート制限に達しました。しばらく待ってから再試行してください。');
                }
                throw new Error('GitHub APIへのアクセスが拒否されました。権限を確認してください。');
            case 404:
                throw new Error('指定されたリポジトリが見つかりません。URLを確認してください。');
            case 422:
                throw new Error('リクエストパラメータが無効です。設定を確認してください。');
            case 500:
            case 502:
            case 503:
            case 504:
                throw new Error('GitHub APIサーバーエラーが発生しました。しばらく待ってから再試行してください。');
            default:
                if (apiError.status === 0) {
                    throw new Error('ネットワークエラーが発生しました。接続を確認してください。');
                }
                throw new Error(`GitHub API エラー: ${apiError.message}`);
        }
    }
}

// ========================================
// GitHub APIエラーハンドリングクラス
// ========================================

/**
 * GitHub API専用エラークラス
 */
class GitHubAPIError extends Error {
    constructor(message, status, details = '') {
        super(message);
        this.name = 'GitHubAPIError';
        this.status = status;
        this.details = details;
    }
}

/**
 * GitHub統合エラーハンドラー
 */
class GitHubErrorHandler {
    /**
     * APIエラーを処理
     * @param {Error} error - エラーオブジェクト
     * @returns {GitHubAPIError} 処理されたエラー
     */
    static handleAPIError(error) {
        if (error.name === 'RequestError' || error.status) {
            const status = error.status || 0;
            const message = error.message || 'Unknown error';
            const details = error.response?.data?.message || '';
            
            return new GitHubAPIError(message, status, details);
        }
        
        // ネットワークエラーなど
        return new GitHubAPIError(error.message || 'Network error', 0, '');
    }

    /**
     * レート制限警告を表示
     * @param {Date} resetTime - リセット時刻
     */
    static showRateLimitWarning(resetTime) {
        const message = `GitHub APIのレート制限に達しました。${resetTime.toLocaleTimeString()}に再開されます。`;
        
        if (typeof showMessage === 'function') {
            showMessage(message, 'warning');
        } else {
            console.warn(message);
        }
    }

    /**
     * 同期エラーを表示
     * @param {string} projectName - プロジェクト名
     * @param {string} error - エラーメッセージ
     */
    static showSyncError(projectName, error) {
        const message = `プロジェクト「${projectName}」の同期でエラーが発生しました: ${error}`;
        
        if (typeof showMessage === 'function') {
            showMessage(message, 'error');
        } else {
            console.error(message);
        }
    }

    /**
     * 接続エラーを表示
     */
    static showConnectionError() {
        const message = 'GitHub APIへの接続に失敗しました。ネットワーク接続とトークンを確認してください。';
        
        if (typeof showMessage === 'function') {
            showMessage(message, 'error');
        } else {
            console.error(message);
        }
    }
}

// ========================================
// レート制限管理クラス
// ========================================

/**
 * GitHub APIレート制限管理クラス
 * Octokit.jsのthrottling設定を管理し、API使用状況の監視とレポート機能を提供
 */
class RateLimitManager {
    constructor() {
        this.lastRateLimit = null;
        this.lastCheck = null;
        this.rateLimitBuffer = 10; // 安全のため10リクエスト分のバッファを保持
        this.usageHistory = []; // API使用履歴
        this.maxHistorySize = 100; // 履歴の最大保持数
        this.isAuthenticated = false; // 認証状態
        this.throttleConfig = this.getDefaultThrottleConfig();
    }

    /**
     * シングルトンインスタンスを取得
     * @returns {RateLimitManager} インスタンス
     */
    static getInstance() {
        if (!RateLimitManager.instance) {
            RateLimitManager.instance = new RateLimitManager();
        }
        return RateLimitManager.instance;
    }

    /**
     * デフォルトのthrottling設定を取得
     * @returns {Object} throttling設定
     */
    getDefaultThrottleConfig() {
        return {
            onRateLimit: (retryAfter, options, octokit, retryCount) => {
                return this.onRateLimit(retryAfter, options, octokit, retryCount);
            },
            onSecondaryRateLimit: (retryAfter, options, octokit, retryCount) => {
                return this.onSecondaryRateLimit(retryAfter, options, octokit, retryCount);
            }
        };
    }

    /**
     * レート制限到達時のカスタムハンドリング
     * @param {number} retryAfter - 再試行までの秒数
     * @param {Object} options - リクエストオプション
     * @param {Object} octokit - Octokitインスタンス
     * @param {number} retryCount - 再試行回数
     * @returns {boolean} 再試行するかどうか
     */
    onRateLimit(retryAfter, options, octokit, retryCount) {
        console.warn(`Rate limit exceeded for ${options.method} ${options.url}`);
        
        // レート制限情報を記録
        this.recordRateLimitHit(retryAfter, options);
        
        // ユーザーに通知とUI更新
        this.notifyRateLimit(retryAfter);
        this.updateUIForRateLimit(retryAfter);
        
        // 自動同期を一時停止
        this.pauseAutoSyncForRateLimit(retryAfter);
        
        // レート制限状態をグローバルに通知
        this.broadcastRateLimitStatus(true, retryAfter, 'primary');
        
        // 3回まで自動リトライ
        if (retryCount < 3) {
            console.info(`Retrying after ${retryAfter} seconds (attempt ${retryCount + 1}/3)`);
            return true;
        }
        
        console.warn('Max retry attempts reached for rate limit');
        return false;
    }

    /**
     * セカンダリレート制限到達時のカスタムハンドリング
     * @param {number} retryAfter - 再試行までの秒数
     * @param {Object} options - リクエストオプション
     * @param {Object} octokit - Octokitインスタンス
     * @param {number} retryCount - 再試行回数
     * @returns {boolean} 再試行するかどうか
     */
    onSecondaryRateLimit(retryAfter, options, octokit, retryCount) {
        console.warn(`Secondary rate limit exceeded for ${options.method} ${options.url}`);
        
        // セカンダリレート制限情報を記録
        this.recordSecondaryRateLimitHit(retryAfter, options);
        
        // ユーザーに通知とUI更新
        this.notifySecondaryRateLimit(retryAfter);
        this.updateUIForSecondaryRateLimit(retryAfter);
        
        // レート制限状態をグローバルに通知
        this.broadcastRateLimitStatus(true, retryAfter, 'secondary');
        
        // 1回だけリトライ
        if (retryCount === 0) {
            console.info(`Retrying after ${retryAfter} seconds for secondary rate limit`);
            return true;
        }
        
        console.warn('Secondary rate limit retry failed');
        return false;
    }

    /**
     * Octokit.js用のthrottling設定を取得
     * @returns {Object} throttling設定オブジェクト
     */
    configureThrottling() {
        return this.throttleConfig;
    }

    /**
     * 認証状態を設定
     * @param {boolean} authenticated - 認証済みかどうか
     */
    setAuthenticationStatus(authenticated) {
        this.isAuthenticated = authenticated;
    }

    /**
     * リクエスト実行可能かチェック
     * @returns {Promise<boolean>} 実行可能かどうか
     */
    async canMakeRequest() {
        try {
            // 最後のチェックから1分以内の場合はキャッシュを使用
            if (this.lastCheck && Date.now() - this.lastCheck < 60000 && this.lastRateLimit) {
                return this.lastRateLimit.remaining > this.rateLimitBuffer;
            }

            // GitHub APIクライアントが利用可能な場合のみチェック
            if (githubClient && githubClient.octokit) {
                const rateLimit = await githubClient.getRateLimit();
                this.lastRateLimit = rateLimit;
                this.lastCheck = Date.now();
                
                // 使用状況を記録
                this.recordUsage(rateLimit);
                
                return rateLimit.remaining > this.rateLimitBuffer;
            }

            // APIクライアントが利用できない場合は実行を許可
            return true;
        } catch (error) {
            console.warn('Rate limit check failed:', error);
            // エラーの場合は実行を許可
            return true;
        }
    }

    /**
     * API使用状況を記録
     * @param {RateLimit} rateLimit - レート制限情報
     */
    recordUsage(rateLimit) {
        const usage = {
            timestamp: new Date().toISOString(),
            remaining: rateLimit.remaining,
            limit: rateLimit.limit,
            used: rateLimit.used,
            resetTime: new Date(rateLimit.reset * 1000).toISOString(),
            percentageUsed: ((rateLimit.limit - rateLimit.remaining) / rateLimit.limit) * 100
        };

        this.usageHistory.unshift(usage);
        
        // 履歴サイズを制限
        if (this.usageHistory.length > this.maxHistorySize) {
            this.usageHistory.splice(this.maxHistorySize);
        }
    }

    /**
     * レート制限到達を記録
     * @param {number} retryAfter - 再試行までの秒数
     * @param {Object} options - リクエストオプション
     */
    recordRateLimitHit(retryAfter, options) {
        const resetTime = new Date(Date.now() + retryAfter * 1000);
        
        this.lastRateLimit = {
            remaining: 0,
            reset: Math.floor(resetTime.getTime() / 1000),
            limit: this.isAuthenticated ? 5000 : 60
        };
        this.lastCheck = Date.now();

        // 使用履歴に記録
        const usage = {
            timestamp: new Date().toISOString(),
            remaining: 0,
            limit: this.lastRateLimit.limit,
            used: this.lastRateLimit.limit,
            resetTime: resetTime.toISOString(),
            percentageUsed: 100,
            rateLimitHit: true,
            endpoint: `${options.method} ${options.url}`
        };

        this.usageHistory.unshift(usage);
        
        if (this.usageHistory.length > this.maxHistorySize) {
            this.usageHistory.splice(this.maxHistorySize);
        }
    }

    /**
     * セカンダリレート制限到達を記録
     * @param {number} retryAfter - 再試行までの秒数
     * @param {Object} options - リクエストオプション
     */
    recordSecondaryRateLimitHit(retryAfter, options) {
        const usage = {
            timestamp: new Date().toISOString(),
            remaining: this.lastRateLimit?.remaining || 0,
            limit: this.lastRateLimit?.limit || (this.isAuthenticated ? 5000 : 60),
            used: this.lastRateLimit?.used || 0,
            resetTime: new Date(Date.now() + retryAfter * 1000).toISOString(),
            percentageUsed: this.lastRateLimit ? 
                ((this.lastRateLimit.limit - this.lastRateLimit.remaining) / this.lastRateLimit.limit) * 100 : 0,
            secondaryRateLimitHit: true,
            endpoint: `${options.method} ${options.url}`
        };

        this.usageHistory.unshift(usage);
        
        if (this.usageHistory.length > this.maxHistorySize) {
            this.usageHistory.splice(this.maxHistorySize);
        }
    }

    /**
     * 現在のAPI使用状況を取得
     * @returns {Promise<Object>} 使用状況情報
     */
    async getUsageStatus() {
        try {
            if (githubClient && githubClient.octokit) {
                const rateLimit = await githubClient.getRateLimit();
                this.lastRateLimit = rateLimit;
                this.lastCheck = Date.now();
                
                // 使用状況を記録
                this.recordUsage(rateLimit);
                
                const resetTime = new Date(rateLimit.reset * 1000);
                const percentageUsed = ((rateLimit.limit - rateLimit.remaining) / rateLimit.limit) * 100;
                
                return {
                    remaining: rateLimit.remaining,
                    resetTime: resetTime,
                    percentageUsed: Math.round(percentageUsed * 100) / 100,
                    limit: rateLimit.limit,
                    used: rateLimit.used,
                    isNearLimit: rateLimit.remaining < this.rateLimitBuffer * 2,
                    timeUntilReset: Math.max(0, resetTime.getTime() - Date.now()),
                    authenticated: this.isAuthenticated
                };
            }
        } catch (error) {
            console.warn('Failed to get usage status:', error);
        }
        
        // デフォルト値を返す
        return {
            remaining: this.isAuthenticated ? 5000 : 60,
            resetTime: new Date(Date.now() + 3600000),
            percentageUsed: 0,
            limit: this.isAuthenticated ? 5000 : 60,
            used: 0,
            isNearLimit: false,
            timeUntilReset: 3600000,
            authenticated: this.isAuthenticated
        };
    }

    /**
     * API使用履歴を取得
     * @param {number} [limit=50] - 取得する履歴数
     * @returns {Array} 使用履歴配列
     */
    getUsageHistory(limit = 50) {
        return this.usageHistory.slice(0, limit);
    }

    /**
     * 使用状況レポートを生成
     * @returns {Object} レポート情報
     */
    generateUsageReport() {
        const now = Date.now();
        const oneHourAgo = now - 3600000; // 1時間前
        const oneDayAgo = now - 86400000; // 1日前

        const recentHistory = this.usageHistory.filter(usage => 
            new Date(usage.timestamp).getTime() > oneHourAgo
        );

        const dailyHistory = this.usageHistory.filter(usage => 
            new Date(usage.timestamp).getTime() > oneDayAgo
        );

        const rateLimitHits = this.usageHistory.filter(usage => 
            usage.rateLimitHit || usage.secondaryRateLimitHit
        );

        const averageUsage = recentHistory.length > 0 ? 
            recentHistory.reduce((sum, usage) => sum + usage.percentageUsed, 0) / recentHistory.length : 0;

        return {
            currentStatus: this.lastRateLimit,
            recentUsageCount: recentHistory.length,
            dailyUsageCount: dailyHistory.length,
            rateLimitHitsToday: rateLimitHits.filter(hit => 
                new Date(hit.timestamp).getTime() > oneDayAgo
            ).length,
            averageUsagePercentage: Math.round(averageUsage * 100) / 100,
            peakUsage: Math.max(...dailyHistory.map(usage => usage.percentageUsed), 0),
            authenticated: this.isAuthenticated,
            bufferSize: this.rateLimitBuffer
        };
    }

    /**
     * レート制限情報を記録
     * @param {Date} resetTime - リセット時刻
     */
    recordRateLimit(resetTime) {
        this.lastRateLimit = {
            remaining: 0,
            reset: Math.floor(resetTime.getTime() / 1000),
            limit: this.isAuthenticated ? 5000 : 60
        };
        this.lastCheck = Date.now();
    }

    /**
     * リセット時刻を取得
     * @returns {Promise<Date>} リセット時刻
     */
    async getResetTime() {
        try {
            if (githubClient && githubClient.octokit) {
                const rateLimit = await githubClient.getRateLimit();
                return new Date(rateLimit.reset * 1000);
            }
        } catch (error) {
            console.warn('Failed to get reset time:', error);
        }
        
        // デフォルトで1時間後を返す
        return new Date(Date.now() + 3600000);
    }

    /**
     * 複数プロジェクト同期時の最適間隔を計算
     * @param {number} projectCount - プロジェクト数
     * @returns {number} 推奨間隔（分）
     */
    calculateOptimalSyncInterval(projectCount) {
        if (!this.lastRateLimit) {
            return 15; // デフォルト15分
        }

        // 1プロジェクトあたりの平均リクエスト数を計算
        // ワークフロー一覧取得(1) + 各ワークフローのジョブ取得(平均2) + ログ取得(平均2) = 5リクエスト
        const requestsPerProject = 5;
        const totalRequests = projectCount * requestsPerProject;
        
        // 1時間あたりの利用可能リクエスト数（バッファを考慮）
        const availableRequests = this.lastRateLimit.limit - this.rateLimitBuffer;
        
        // 安全な同期間隔を計算（分単位）
        // 1時間で全プロジェクトを同期できるように間隔を調整
        const safeInterval = Math.ceil((totalRequests / availableRequests) * 60);
        
        // 認証状態に応じて最小間隔を調整
        const minInterval = this.isAuthenticated ? 5 : 15;
        const maxInterval = 60;
        
        const calculatedInterval = Math.max(minInterval, Math.min(maxInterval, safeInterval));
        
        console.log(`Calculated optimal sync interval: ${calculatedInterval} minutes for ${projectCount} projects`);
        
        return calculatedInterval;
    }

    /**
     * API呼び出し間の最適な遅延時間を計算
     * @param {number} requestCount - 予定リクエスト数
     * @returns {number} 遅延時間（ミリ秒）
     */
    calculateOptimalDelay(requestCount) {
        if (!this.lastRateLimit || this.lastRateLimit.remaining > 100) {
            return 0; // 十分な余裕がある場合は遅延なし
        }

        // 残りリクエスト数に基づいて遅延を計算
        const remainingTime = (this.lastRateLimit.reset * 1000) - Date.now();
        const safeDelay = Math.max(0, remainingTime / this.lastRateLimit.remaining);
        
        // 最大10秒の遅延
        const calculatedDelay = Math.min(10000, safeDelay * requestCount);
        
        if (calculatedDelay > 0) {
            console.log(`Calculated API delay: ${calculatedDelay}ms for ${requestCount} requests`);
        }
        
        return calculatedDelay;
    }

    /**
     * レート制限通知
     * @param {number} retryAfter - 再試行までの秒数
     */
    notifyRateLimit(retryAfter) {
        const resetTime = new Date(Date.now() + retryAfter * 1000);
        const message = `GitHub APIのレート制限に達しました。${resetTime.toLocaleTimeString()}に再開されます。`;
        
        // UIに通知を表示
        this.showNotification(message, 'warning');
    }

    /**
     * セカンダリレート制限通知
     * @param {number} retryAfter - 再試行までの秒数
     */
    notifySecondaryRateLimit(retryAfter) {
        const message = `GitHub APIのセカンダリレート制限に達しました。${retryAfter}秒後に再試行します。`;
        this.showNotification(message, 'warning');
    }

    /**
     * レート制限時のUI更新
     * @param {number} retryAfter - 再試行までの秒数
     */
    updateUIForRateLimit(retryAfter) {
        const resetTime = new Date(Date.now() + retryAfter * 1000);
        
        // レート制限状態をUIに反映
        this.updateRateLimitStatus({
            isLimited: true,
            resetTime: resetTime,
            retryAfter: retryAfter,
            type: 'primary'
        });
        
        // 同期ボタンを無効化
        this.disableSyncButtons(resetTime);
        
        // 進行中の同期があれば停止
        this.stopActiveSyncs();
    }

    /**
     * セカンダリレート制限時のUI更新
     * @param {number} retryAfter - 再試行までの秒数
     */
    updateUIForSecondaryRateLimit(retryAfter) {
        const resetTime = new Date(Date.now() + retryAfter * 1000);
        
        // セカンダリレート制限状態をUIに反映
        this.updateRateLimitStatus({
            isLimited: true,
            resetTime: resetTime,
            retryAfter: retryAfter,
            type: 'secondary'
        });
    }

    /**
     * レート制限状態をUIに更新
     * @param {Object} status - レート制限状態
     */
    updateRateLimitStatus(status) {
        // レート制限インジケーターを更新
        const indicators = document.querySelectorAll('.rate-limit-indicator');
        indicators.forEach(indicator => {
            if (status.isLimited) {
                indicator.classList.add('rate-limited');
                indicator.textContent = `レート制限中 (${status.resetTime.toLocaleTimeString()}まで)`;
            } else {
                indicator.classList.remove('rate-limited');
                indicator.textContent = 'API利用可能';
            }
        });

        // 設定ページのレート制限情報を更新
        const rateLimitInfo = document.getElementById('rate-limit-info');
        if (rateLimitInfo) {
            if (status.isLimited) {
                rateLimitInfo.innerHTML = `
                    <div class="rate-limit-warning">
                        <strong>${status.type === 'secondary' ? 'セカンダリ' : ''}レート制限に達しました</strong><br>
                        リセット時刻: ${status.resetTime.toLocaleString()}<br>
                        残り時間: ${Math.ceil(status.retryAfter / 60)}分
                    </div>
                `;
            } else {
                rateLimitInfo.innerHTML = '<div class="rate-limit-ok">API利用可能</div>';
            }
        }
    }

    /**
     * 同期ボタンを無効化
     * @param {Date} resetTime - リセット時刻
     */
    disableSyncButtons(resetTime) {
        const syncButtons = document.querySelectorAll('.sync-button, .manual-sync-button');
        syncButtons.forEach(button => {
            button.disabled = true;
            button.title = `レート制限中 - ${resetTime.toLocaleTimeString()}に再開`;
            
            // 元のテキストを保存
            if (!button.dataset.originalText) {
                button.dataset.originalText = button.textContent;
            }
            button.textContent = 'レート制限中';
        });

        // リセット時刻にボタンを再有効化
        const timeUntilReset = resetTime.getTime() - Date.now();
        if (timeUntilReset > 0) {
            setTimeout(() => {
                this.enableSyncButtons();
            }, timeUntilReset);
        }
    }

    /**
     * 同期ボタンを有効化
     */
    enableSyncButtons() {
        const syncButtons = document.querySelectorAll('.sync-button, .manual-sync-button');
        syncButtons.forEach(button => {
            button.disabled = false;
            button.title = '';
            
            // 元のテキストを復元
            if (button.dataset.originalText) {
                button.textContent = button.dataset.originalText;
                delete button.dataset.originalText;
            }
        });

        // レート制限状態をクリア
        this.updateRateLimitStatus({ isLimited: false });
    }

    /**
     * 進行中の同期を停止
     */
    stopActiveSyncs() {
        // 進行中の同期インジケーターを停止
        const syncIndicators = document.querySelectorAll('.sync-in-progress');
        syncIndicators.forEach(indicator => {
            indicator.classList.remove('sync-in-progress');
            indicator.textContent = 'レート制限により停止';
        });
    }

    /**
     * レート制限のため自動同期を一時停止
     * @param {number} retryAfter - 再試行までの秒数
     */
    pauseAutoSyncForRateLimit(retryAfter) {
        const scheduler = AutoSyncScheduler.getInstance();
        const resetTime = new Date(Date.now() + retryAfter * 1000);
        
        if (scheduler.isRunning()) {
            scheduler.pauseUntil(resetTime);
            console.log(`Auto sync paused due to rate limit until ${resetTime.toLocaleTimeString()}`);
        }
    }

    /**
     * 自動同期を再開
     */
    resumeAutoSync() {
        const scheduler = AutoSyncScheduler.getInstance();
        
        if (scheduler.isPaused) {
            scheduler.resume();
            console.log('Auto sync resumed after rate limit reset');
        }
    }

    /**
     * 通知を表示
     * @param {string} message - メッセージ
     * @param {'info'|'warning'|'error'} type - 通知タイプ
     */
    showNotification(message, type = 'info') {
        // 既存の通知システムを使用
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * 使用状況をリセット
     */
    resetUsageHistory() {
        this.usageHistory = [];
        this.lastRateLimit = null;
        this.lastCheck = null;
    }

    /**
     * レート制限状態をグローバルに通知
     * @param {boolean} isLimited - レート制限中かどうか
     * @param {number} retryAfter - 再試行までの秒数
     * @param {'primary'|'secondary'} type - レート制限の種類
     */
    broadcastRateLimitStatus(isLimited, retryAfter, type) {
        const resetTime = new Date(Date.now() + retryAfter * 1000);
        
        // カスタムイベントを発火してアプリケーション全体に通知
        const event = new CustomEvent('rateLimitStatusChanged', {
            detail: {
                isLimited: isLimited,
                resetTime: resetTime,
                retryAfter: retryAfter,
                type: type,
                timestamp: new Date().toISOString()
            }
        });
        
        window.dispatchEvent(event);
        
        // 設定ページが開いている場合は直接更新
        if (typeof updateRateLimitDisplay === 'function') {
            updateRateLimitDisplay({
                isLimited: isLimited,
                resetTime: resetTime,
                retryAfter: retryAfter,
                type: type
            });
        }
    }

    /**
     * レート制限解除時の処理
     */
    handleRateLimitReset() {
        console.log('Rate limit has been reset');
        
        // UI状態をリセット
        this.enableSyncButtons();
        this.updateRateLimitStatus({ isLimited: false });
        
        // 自動同期を再開
        this.resumeAutoSync();
        
        // グローバル通知
        this.broadcastRateLimitStatus(false, 0, 'reset');
        
        // 成功通知
        this.showNotification('GitHub APIのレート制限が解除されました。同期を再開できます。', 'success');
    }

    /**
     * レート制限の自動監視を開始
     */
    startRateLimitMonitoring() {
        // 1分ごとにレート制限状態をチェック
        setInterval(async () => {
            try {
                const status = await this.getUsageStatus();
                
                // レート制限が解除された場合の処理
                if (this.lastRateLimit && this.lastRateLimit.remaining === 0 && status.remaining > 0) {
                    this.handleRateLimitReset();
                }
                
                // レート制限に近づいている場合の警告
                if (status.isNearLimit && !this.nearLimitWarningShown) {
                    this.showNotification(
                        `GitHub APIのレート制限に近づいています。残り${status.remaining}リクエスト`, 
                        'warning'
                    );
                    this.nearLimitWarningShown = true;
                }
                
                // 制限から十分離れた場合は警告フラグをリセット
                if (!status.isNearLimit) {
                    this.nearLimitWarningShown = false;
                }
                
            } catch (error) {
                console.warn('Rate limit monitoring failed:', error);
            }
        }, 60000); // 1分間隔
    }
}

// ========================================
// 自動同期スケジューラークラス
// ========================================

/**
 * 自動同期のスケジューリングを管理するクラス
 */
class AutoSyncScheduler {
    constructor() {
        this.intervalId = null;
        this.isRunning = false;
        this.isPaused = false;
        this.pauseUntilTime = null;
        this.wasRunningBeforeOffline = false;
        this.currentInterval = 15; // デフォルト15分
    }

    /**
     * シングルトンインスタンスを取得
     * @returns {AutoSyncScheduler} インスタンス
     */
    static getInstance() {
        if (!AutoSyncScheduler.instance) {
            AutoSyncScheduler.instance = new AutoSyncScheduler();
        }
        return AutoSyncScheduler.instance;
    }

    /**
     * 自動同期を開始
     * @param {number} intervalMinutes - 同期間隔（分）
     */
    start(intervalMinutes) {
        this.stop(); // 既存のスケジュールを停止
        
        this.isRunning = true;
        this.isPaused = false;
        this.currentInterval = intervalMinutes;
        
        console.log(`Starting auto sync with ${intervalMinutes} minute interval`);
        
        this.intervalId = setInterval(
            () => this.executeScheduledSync(),
            intervalMinutes * 60 * 1000
        );
        
        // 即座に一回実行
        setTimeout(() => this.executeScheduledSync(), 1000);
    }

    /**
     * 自動同期を停止
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isRunning = false;
        this.isPaused = false;
        console.log('Auto sync stopped');
    }

    /**
     * 自動同期を一時停止
     */
    pause() {
        this.isPaused = true;
        console.log('Auto sync paused');
    }

    /**
     * 自動同期を再開
     */
    resume() {
        this.isPaused = false;
        this.pauseUntilTime = null;
        console.log('Auto sync resumed');
    }

    /**
     * 指定時刻まで一時停止
     * @param {Date} until - 再開時刻
     */
    pauseUntil(until) {
        this.isPaused = true;
        this.pauseUntilTime = until;
        console.log(`Auto sync paused until ${until.toLocaleTimeString()}`);
    }

    /**
     * オフライン時の一時停止
     */
    pauseForOffline() {
        this.wasRunningBeforeOffline = this.isRunning && !this.isPaused;
        this.pause();
        console.log('Auto sync paused for offline');
    }

    /**
     * オフライン前に実行中だったかチェック
     * @returns {boolean} オフライン前に実行中だったか
     */
    wasRunningBeforeOffline() {
        return this.wasRunningBeforeOffline;
    }

    /**
     * レート制限による一時停止から復旧
     */
    resumeFromRateLimit() {
        if (this.isPaused && this.pauseUntilTime) {
            const now = new Date();
            if (now >= this.pauseUntilTime) {
                this.resume();
                console.log('Auto sync resumed from rate limit pause');
                
                // 通知
                if (typeof showMessage === 'function') {
                    showMessage('レート制限が解除されました。自動同期を再開します。', 'success');
                }
            }
        }
    }

    /**
     * 実行中かチェック
     * @returns {boolean} 実行中かどうか
     */
    isRunning() {
        return this.isRunning && !this.isPaused;
    }

    /**
     * 現在の状態を取得
     * @returns {Object} 状態情報
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            interval: this.currentInterval,
            pauseUntilTime: this.pauseUntilTime,
            wasRunningBeforeOffline: this.wasRunningBeforeOffline
        };
    }

    /**
     * スケジュールされた同期を実行
     */
    async executeScheduledSync() {
        // 一時停止中の場合はスキップ
        if (this.isPaused) {
            // 時間指定の一時停止の場合、時間をチェック
            if (this.pauseUntilTime && new Date() > this.pauseUntilTime) {
                this.resume();
            } else {
                return;
            }
        }
        
        // オフライン状態の場合はスキップ
        if (!ErrorRecoveryManager.isOnline()) {
            console.log('Skipping sync: offline');
            return;
        }

        try {
            console.log('Executing scheduled sync...');
            
            // ErrorRecoveryManagerの再試行機能を使用
            await ErrorRecoveryManager.retryWithBackoff(
                async () => {
                    return await this.syncAllProjects();
                },
                {
                    maxRetries: 2,
                    baseDelay: 2000,
                    maxDelay: 10000
                }
            );
        } catch (error) {
            console.error('Scheduled sync failed after retries:', error);
            
            // レート制限エラーの場合は特別処理
            if (error.name === 'GitHubAPIError' && error.status === 403) {
                await this.handleRateLimitError(error);
            }
        }
    }

    /**
     * すべてのプロジェクトを同期
     * @returns {Promise<Array>} 同期結果配列
     */
    async syncAllProjects() {
        // DataManagerが利用可能かチェック
        if (typeof DataManager === 'undefined') {
            console.warn('DataManager not available for auto sync');
            return [];
        }

        const dataManager = new DataManager();
        const projects = dataManager.getAllProjects();
        
        // GitHubリポジトリが関連付けられたプロジェクトのみを対象
        const githubProjects = projects.filter(p => 
            p.githubRepository && p.githubRepository.syncEnabled
        );
        
        if (githubProjects.length === 0) {
            console.log('No GitHub projects configured for sync');
            return [];
        }

        console.log(`Syncing ${githubProjects.length} GitHub projects`);
        
        const results = [];
        const rateLimitManager = RateLimitManager.getInstance();
        
        // プロジェクトを順次同期（並列実行はレート制限を考慮して避ける）
        for (const project of githubProjects) {
            try {
                // レート制限チェック
                if (!(await rateLimitManager.canMakeRequest())) {
                    console.log(`Skipping project ${project.name} due to rate limit`);
                    continue;
                }
                
                const result = await this.syncProject(project.id);
                results.push(result);
                
                // プロジェクト間で適切な間隔を空ける
                const delay = rateLimitManager.calculateOptimalDelay(1);
                if (delay > 0) {
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
            } catch (error) {
                console.error(`Failed to sync project ${project.name}:`, error);
                
                // ErrorRecoveryManagerで部分的同期失敗を処理
                await ErrorRecoveryManager.handlePartialSyncFailure(project.id, [], [error]);
                
                const errorResult = {
                    projectId: project.id,
                    projectName: project.name,
                    success: false,
                    error: error.message,
                    newCIResults: 0,
                    apiRequestsUsed: 0
                };
                
                results.push(errorResult);
            }
        }
        
        // 同期完了を通知
        this.notifySyncComplete(results);
        
        return results;
    }

    /**
     * 個別プロジェクトを同期
     * @param {string} projectId - プロジェクトID
     * @returns {Promise<Object>} 同期結果
     */
    async syncProject(projectId) {
        console.log(`Syncing project: ${projectId}`);
        
        try {
            // ErrorRecoveryManagerの再試行機能を使用して同期を実行
            const result = await ErrorRecoveryManager.retryWithBackoff(
                async () => {
                    return await this.performProjectSync(projectId);
                },
                {
                    maxRetries: 3,
                    baseDelay: 1000,
                    maxDelay: 10000
                }
            );
            
            return result;
        } catch (error) {
            console.error(`Project sync failed after retries: ${projectId}`, error);
            
            // 部分的な同期失敗として処理
            await ErrorRecoveryManager.handlePartialSyncFailure(projectId, [], [error]);
            
            return {
                projectId: projectId,
                projectName: await ErrorRecoveryManager.getProjectName(projectId),
                success: false,
                error: error.message,
                newCIResults: 0,
                apiRequestsUsed: 0
            };
        }
    }
    
    /**
     * 実際のプロジェクト同期処理を実行
     * @param {string} projectId - プロジェクトID
     * @returns {Promise<Object>} 同期結果
     */
    async performProjectSync(projectId) {
        const startTime = Date.now();
        
        // ネットワーク状態をチェック
        if (!ErrorRecoveryManager.isOnline()) {
            throw new Error('ネットワーク接続が利用できません');
        }
        
        // DataManagerとプロジェクト情報を取得
        const dataManager = new DataManager();
        const project = dataManager.getProjectById(projectId);
        
        if (!project) {
            throw new Error(`プロジェクトが見つかりません: ${projectId}`);
        }
        
        if (!project.githubRepository) {
            throw new Error('GitHubリポジトリが設定されていません');
        }
        
        // リポジトリURLを解析
        const parsed = parseGitHubRepositoryUrl(project.githubRepository.url);
        if (!parsed) {
            throw new Error('無効なGitHubリポジトリURL');
        }
        
        const { owner, repo } = parsed;
        
        // GitHub APIクライアントを取得
        if (!githubClient) {
            throw new Error('GitHub APIクライアントが初期化されていません');
        }
        
        // アクセストークンを設定
        const settingsManager = new GitHubSettingsManager();
        const token = await settingsManager.getAccessToken();
        if (token) {
            githubClient.setAccessToken(token);
        }
        
        let apiRequestsUsed = 0;
        let newCIResults = 0;
        const successfulResults = [];
        const errors = [];
        
        try {
            // ワークフロー実行を取得
            const workflowRuns = await githubClient.getWorkflowRuns(owner, repo, {
                per_page: 10,
                status: 'completed'
            });
            apiRequestsUsed++;
            
            console.log(`Found ${workflowRuns.length} workflow runs for ${project.name}`);
            
            // 各ワークフロー実行を処理
            for (const run of workflowRuns) {
                try {
                    // 既存のCI結果と重複チェック
                    const isDuplicate = project.ciResults.some(result => 
                        result.source === 'github' && 
                        result.githubData?.runId === run.id
                    );
                    
                    if (isDuplicate) {
                        console.log(`Skipping duplicate workflow run: ${run.id}`);
                        continue;
                    }
                    
                    // ジョブ詳細を取得
                    const jobs = await githubClient.getJobsForRun(owner, repo, run.id);
                    apiRequestsUsed++;
                    
                    // メトリクスを抽出
                    const metricsExtractor = new MetricsExtractor();
                    const metrics = await metricsExtractor.extractAllMetrics(
                        jobs, 
                        githubClient, 
                        owner, 
                        repo
                    );
                    
                    // ログ取得のAPIリクエスト数を加算
                    apiRequestsUsed += jobs.length;
                    
                    // CI結果を作成
                    const ciResult = {
                        timestamp: run.run_started_at || run.created_at,
                        status: run.conclusion === 'success' ? 'pass' : 'fail',
                        source: 'github',
                        logUrl: run.html_url,
                        ...metrics,
                        githubData: {
                            runId: run.id,
                            workflowName: run.name,
                            commitSha: run.head_sha,
                            branch: run.head_branch,
                            actor: run.actor.login,
                            htmlUrl: run.html_url
                        }
                    };
                    
                    // CI結果を保存
                    dataManager.createCIResult(projectId, ciResult);
                    newCIResults++;
                    successfulResults.push(ciResult);
                    
                    console.log(`Added CI result from workflow run ${run.id} for ${project.name}`);
                    
                } catch (error) {
                    console.error(`Failed to process workflow run ${run.id}:`, error);
                    errors.push(error);
                    // 個別のワークフロー処理エラーは続行
                }
            }
            
            // プロジェクトの最終同期時刻を更新
            project.githubRepository.lastSyncAt = new Date().toISOString();
            dataManager.updateProject(projectId, {
                githubRepository: project.githubRepository
            });
            
            const duration = Date.now() - startTime;
            
            // 同期記録を作成
            const syncRecord = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                projectId: projectId,
                projectName: project.name,
                status: errors.length === 0 ? 'success' : (newCIResults > 0 ? 'partial' : 'failure'),
                newCIResults: newCIResults,
                updatedCIResults: 0,
                errors: errors.map(e => e.message || e.toString()),
                repositoryUrl: project.githubRepository.url,
                workflowRunsProcessed: workflowRuns.length,
                apiRequestsUsed: apiRequestsUsed,
                durationMs: duration
            };
            
            settingsManager.addSyncRecord(syncRecord);
            
            // 部分的な失敗の場合はErrorRecoveryManagerで処理
            if (errors.length > 0 && newCIResults > 0) {
                await ErrorRecoveryManager.handlePartialSyncFailure(
                    projectId, 
                    successfulResults, 
                    errors
                );
            }
            
            // 結果を返す
            const result = {
                projectId: projectId,
                projectName: project.name,
                success: errors.length === 0,
                newCIResults: newCIResults,
                apiRequestsUsed: apiRequestsUsed,
                workflowRunsProcessed: workflowRuns.length,
                partialSuccess: errors.length > 0 && newCIResults > 0,
                errorCount: errors.length,
                error: errors.length > 0 ? this.formatSyncErrors(errors) : undefined
            };
            
            return result;
            
        } catch (error) {
            // 同期全体が失敗した場合
            const duration = Date.now() - startTime;
            
            const syncRecord = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                projectId: projectId,
                projectName: project.name,
                status: 'failure',
                newCIResults: newCIResults,
                updatedCIResults: 0,
                errors: [error.message || error.toString()],
                repositoryUrl: project.githubRepository.url,
                workflowRunsProcessed: 0,
                apiRequestsUsed: apiRequestsUsed,
                durationMs: duration
            };
            
            settingsManager.addSyncRecord(syncRecord);
            
            throw error;
        }
    }

    /**
     * レート制限エラーを処理
     * @param {GitHubAPIError} error - エラーオブジェクト
     */
    async handleRateLimitError(error) {
        // ErrorRecoveryManagerに処理を委譲
        await ErrorRecoveryManager.handleRateLimitError(error);
        
        // 追加の自動同期停止処理
        if (error.status === 403 && error.details.includes('rate limit')) {
            const rateLimitManager = RateLimitManager.getInstance();
            if (rateLimitManager && rateLimitManager.getResetTime) {
                const resetTime = await rateLimitManager.getResetTime();
                this.pauseUntil(resetTime);
            }
        }
    }

    /**
     * 同期完了を通知
     * @param {Array} results - 同期結果配列
     */
    notifySyncComplete(results) {
        const successCount = results.filter(r => r.success).length;
        const totalCount = results.length;
        
        if (successCount === totalCount && totalCount > 0) {
            const totalNewResults = results.reduce((sum, r) => sum + r.newCIResults, 0);
            const message = `自動同期完了: ${totalCount}プロジェクト、${totalNewResults}件の新しいCI結果`;
            
            if (typeof showMessage === 'function') {
                showMessage(message, 'success');
            } else {
                console.log(message);
            }
            
            // 表示を自動更新
            this.refreshDisplays(results);
        } else if (totalCount > 0) {
            const message = `自動同期完了: ${successCount}/${totalCount}プロジェクトが成功`;
            
            if (typeof showMessage === 'function') {
                showMessage(message, 'warning');
            } else {
                console.log(message);
            }
            
            // 表示を自動更新（部分的な成功でも更新）
            this.refreshDisplays(results);
        }
    }
    
    /**
     * 同期エラーをフォーマット
     * @param {Array<Error>} errors - エラー配列
     * @returns {string} フォーマットされたエラーメッセージ
     */
    formatSyncErrors(errors) {
        if (errors.length === 0) {
            return '';
        }
        
        if (errors.length === 1) {
            return errors[0].message || errors[0].toString();
        }
        
        // 複数のエラーがある場合は要約
        const errorTypes = {};
        errors.forEach(error => {
            const message = error.message || error.toString();
            const type = this.categorizeError(message);
            errorTypes[type] = (errorTypes[type] || 0) + 1;
        });
        
        const summary = Object.entries(errorTypes)
            .map(([type, count]) => `${type}: ${count}件`)
            .join(', ');
        
        return `${errors.length}件のエラーが発生しました (${summary})`;
    }
    
    /**
     * エラーをカテゴリ分類
     * @param {string} errorMessage - エラーメッセージ
     * @returns {string} エラーカテゴリ
     */
    categorizeError(errorMessage) {
        if (errorMessage.includes('ネットワーク') || errorMessage.includes('Network')) {
            return 'ネットワークエラー';
        } else if (errorMessage.includes('レート制限') || errorMessage.includes('rate limit')) {
            return 'レート制限';
        } else if (errorMessage.includes('認証') || errorMessage.includes('authentication')) {
            return '認証エラー';
        } else if (errorMessage.includes('404') || errorMessage.includes('見つかりません')) {
            return 'リソース未検出';
        } else if (errorMessage.includes('500') || errorMessage.includes('サーバー')) {
            return 'サーバーエラー';
        } else {
            return 'その他のエラー';
        }
    }
    
    /**
     * 同期後に表示を更新
     * @param {Array} results - 同期結果配列
     */
    refreshDisplays(results) {
        // プロジェクト一覧ページが表示されている場合は更新
        if (typeof refreshProjectList === 'function') {
            refreshProjectList();
        }
        
        // プロジェクト詳細ページが表示されている場合は更新
        const currentProjectId = this.getCurrentProjectId();
        if (currentProjectId) {
            const projectResult = results.find(r => r.projectId === currentProjectId);
            if (projectResult && projectResult.newCIResults > 0) {
                // CI結果タブを更新
                if (typeof refreshCIResultsTab === 'function') {
                    refreshCIResultsTab(currentProjectId);
                }
                
                // 同期ステータスを更新
                this.updateSyncStatus(currentProjectId, projectResult);
            }
        }
        
        // カスタムイベントを発火して他のコンポーネントに通知
        const event = new CustomEvent('syncCompleted', {
            detail: {
                results: results,
                timestamp: new Date().toISOString()
            }
        });
        window.dispatchEvent(event);
    }
    
    /**
     * 現在表示中のプロジェクトIDを取得
     * @returns {string|null} プロジェクトID
     */
    getCurrentProjectId() {
        // URLパラメータからプロジェクトIDを取得
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
    
    /**
     * 同期ステータスを更新
     * @param {string} projectId - プロジェクトID
     * @param {Object} result - 同期結果
     */
    updateSyncStatus(projectId, result) {
        const statusElements = document.querySelectorAll(`.sync-status[data-project-id="${projectId}"]`);
        statusElements.forEach(element => {
            if (result.success) {
                element.textContent = `最終同期: ${new Date().toLocaleTimeString('ja-JP')}`;
                element.className = 'sync-status success';
            } else {
                element.textContent = `同期エラー: ${result.error}`;
                element.className = 'sync-status error';
            }
        });
        
        // 新しいCI結果数を表示
        if (result.newCIResults > 0) {
            const badge = document.createElement('span');
            badge.className = 'new-results-badge';
            badge.textContent = `+${result.newCIResults}`;
            
            const ciTab = document.querySelector('.tab-button[data-tab="ci-results"]');
            if (ciTab) {
                // 既存のバッジを削除
                const existingBadge = ciTab.querySelector('.new-results-badge');
                if (existingBadge) {
                    existingBadge.remove();
                }
                ciTab.appendChild(badge);
                
                // 3秒後にバッジを削除
                setTimeout(() => {
                    badge.remove();
                }, 3000);
            }
        }
    }
}

// ========================================
// GitHub設定管理クラス
// ========================================

/**
 * GitHub統合設定を管理するクラス
 */
class GitHubSettingsManager {
    constructor() {
        this.storageKey = 'spec-tracking-site:githubSettings';
        this.syncHistoryKey = 'spec-tracking-site:syncHistory';
    }

    /**
     * デフォルト設定を取得
     * @returns {GitHubSettings} デフォルト設定
     */
    getDefaultSettings() {
        return {
            autoSyncEnabled: false,
            autoSyncInterval: 15, // 15分
            maxRetries: 3,
            retryDelay: 2 // 2秒
        };
    }

    /**
     * 設定を取得
     * @returns {GitHubSettings} GitHub設定
     */
    getSettings() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const settings = JSON.parse(stored);
                return { ...this.getDefaultSettings(), ...settings };
            }
        } catch (error) {
            console.error('Failed to load GitHub settings:', error);
        }
        return this.getDefaultSettings();
    }

    /**
     * 設定を更新
     * @param {Partial<GitHubSettings>} updates - 更新する設定
     */
    updateSettings(updates) {
        try {
            const currentSettings = this.getSettings();
            const newSettings = { ...currentSettings, ...updates };
            localStorage.setItem(this.storageKey, JSON.stringify(newSettings));
        } catch (error) {
            console.error('Failed to save GitHub settings:', error);
            throw new Error('設定の保存に失敗しました');
        }
    }

    /**
     * Personal Access Tokenを設定
     * @param {string} token - Personal Access Token
     */
    async setAccessToken(token) {
        try {
            const encryptedToken = await TokenEncryption.encrypt(token);
            this.updateSettings({ accessToken: encryptedToken });
        } catch (error) {
            console.error('Failed to encrypt and save token:', error);
            throw new Error('トークンの暗号化に失敗しました');
        }
    }

    /**
     * Personal Access Tokenを取得
     * @returns {Promise<string|null>} 復号化されたトークン
     */
    async getAccessToken() {
        try {
            const settings = this.getSettings();
            if (settings.accessToken) {
                return await TokenEncryption.decrypt(settings.accessToken);
            }
        } catch (error) {
            console.error('Failed to decrypt token:', error);
        }
        return null;
    }

    /**
     * Personal Access Tokenを削除
     */
    clearAccessToken() {
        this.updateSettings({ accessToken: undefined });
    }

    /**
     * 自動同期の有効/無効を設定
     * @param {boolean} enabled - 有効かどうか
     */
    setAutoSyncEnabled(enabled) {
        this.updateSettings({ autoSyncEnabled: enabled });
    }

    /**
     * 自動同期間隔を設定
     * @param {number} minutes - 間隔（分）
     */
    setAutoSyncInterval(minutes) {
        this.updateSettings({ autoSyncInterval: minutes });
    }

    /**
     * 同期記録を追加
     * @param {SyncRecord} record - 同期記録
     */
    addSyncRecord(record) {
        try {
            const history = this.getSyncHistory();
            history.unshift(record); // 最新を先頭に追加
            
            // 最新100件を保持
            if (history.length > 100) {
                history.splice(100);
            }
            
            localStorage.setItem(this.syncHistoryKey, JSON.stringify(history));
        } catch (error) {
            console.error('Failed to save sync record:', error);
        }
    }

    /**
     * 同期履歴を取得
     * @returns {SyncRecord[]} 同期履歴配列
     */
    getSyncHistory() {
        try {
            const stored = localStorage.getItem(this.syncHistoryKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load sync history:', error);
        }
        return [];
    }

    /**
     * 同期履歴をクリア
     */
    clearSyncHistory() {
        try {
            localStorage.removeItem(this.syncHistoryKey);
        } catch (error) {
            console.error('Failed to clear sync history:', error);
            throw new Error('履歴のクリアに失敗しました');
        }
    }
}

// ========================================
// ユーティリティ関数
// ========================================

/**
 * GitHubリポジトリURLを解析
 * @param {string} url - GitHubリポジトリURL
 * @returns {{owner: string, repo: string}|null} 解析結果
 */
function parseGitHubRepositoryUrl(url) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
        return null;
    }
    
    let repo = match[2];
    // .git拡張子を除去
    if (repo.endsWith('.git')) {
        repo = repo.slice(0, -4);
    }
    
    return { owner: match[1], repo: repo };
}

/**
 * GitHubリポジトリURLの形式を検証
 * @param {string} url - 検証するURL
 * @returns {boolean} 有効なGitHubリポジトリURLかどうか
 */
function validateGitHubRepositoryUrl(url) {
    if (!url || typeof url !== 'string') {
        return false;
    }
    
    // GitHub URLの基本パターンをチェック
    const githubUrlPattern = /^https:\/\/github\.com\/[^\/]+\/[^\/]+\/?$/;
    return githubUrlPattern.test(url.trim());
}

/**
 * 時刻を相対的な表現に変換
 * @param {string} timestamp - ISO 8601 timestamp
 * @returns {string} 相対時刻表現
 */
function formatRelativeTime(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) {
        return 'たった今';
    } else if (diffMinutes < 60) {
        return `${diffMinutes}分前`;
    } else if (diffHours < 24) {
        return `${diffHours}時間前`;
    } else if (diffDays < 7) {
        return `${diffDays}日前`;
    } else {
        return time.toLocaleDateString('ja-JP');
    }
}

/**
 * バイト数を人間が読みやすい形式に変換
 * @param {number} bytes - バイト数
 * @returns {string} 人間が読みやすい形式
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// ========================================
// グローバル変数
// ========================================

// GitHub統合クライアントのグローバルインスタンス
let githubClient = null;
let githubSettingsManager = null;
let rateLimitManager = null;

/**
 * ネットワーク状態監視を初期化
 */
function initializeNetworkMonitoring() {
    // オンライン状態の監視
    window.addEventListener('online', () => {
        console.log('Network connection restored');
        
        // レート制限状態をクリア
        const rateLimitManager = RateLimitManager.getInstance();
        rateLimitManager.enableSyncButtons();
        
        // 自動同期の再開
        const scheduler = AutoSyncScheduler.getInstance();
        if (scheduler.wasRunningBeforeOffline()) {
            scheduler.resume();
            
            // 通知
            if (typeof showMessage === 'function') {
                showMessage('ネットワーク接続が復旧しました。自動同期を再開します。', 'success');
            }
        }
    });

    window.addEventListener('offline', () => {
        console.log('Network connection lost');
        
        // 自動同期の一時停止
        const scheduler = AutoSyncScheduler.getInstance();
        scheduler.pauseForOffline();
        
        // UI更新
        const rateLimitManager = RateLimitManager.getInstance();
        rateLimitManager.updateRateLimitStatus({
            isLimited: true,
            resetTime: new Date(Date.now() + 3600000), // 1時間後
            retryAfter: 3600,
            type: 'offline'
        });
        
        // 通知
        if (typeof showMessage === 'function') {
            showMessage('ネットワーク接続が失われました。オフラインモードに切り替えます。', 'warning');
        }
    });
}

/**
 * GitHub統合機能を初期化
 */
function initializeGitHubIntegration() {
    if (!rateLimitManager) {
        rateLimitManager = RateLimitManager.getInstance();
        // レート制限監視を開始
        rateLimitManager.startRateLimitMonitoring();
    }
    if (!githubClient) {
        githubClient = new GitHubIntegrationClient(rateLimitManager);
    }
    if (!githubSettingsManager) {
        githubSettingsManager = new GitHubSettingsManager();
    }
    
    // ネットワーク監視を初期化
    initializeNetworkMonitoring();
    
    // レート制限状態変更イベントのリスナーを設定
    window.addEventListener('rateLimitStatusChanged', (event) => {
        const { isLimited, resetTime, type } = event.detail;
        
        if (isLimited) {
            console.log(`Rate limit detected: ${type}, reset at ${resetTime.toLocaleTimeString()}`);
        } else {
            console.log('Rate limit cleared');
            
            // 自動同期スケジューラーの復旧チェック
            const scheduler = AutoSyncScheduler.getInstance();
            scheduler.resumeFromRateLimit();
        }
    });
}

/**
 * レート制限表示を更新（設定ページ用）
 * @param {Object} status - レート制限状態
 */
function updateRateLimitDisplay(status) {
    const rateLimitInfo = document.getElementById('rate-limit-info');
    if (!rateLimitInfo) return;
    
    if (status.isLimited) {
        const resetTimeStr = status.resetTime.toLocaleString('ja-JP');
        const minutesUntilReset = Math.ceil(status.retryAfter / 60);
        
        rateLimitInfo.innerHTML = `
            <div class="rate-limit-warning">
                <i class="icon-warning"></i>
                <div>
                    <strong>${status.type === 'secondary' ? 'セカンダリ' : ''}レート制限に達しました</strong><br>
                    <small>リセット時刻: ${resetTimeStr}</small><br>
                    <small>残り時間: 約${minutesUntilReset}分</small>
                </div>
            </div>
        `;
        rateLimitInfo.className = 'rate-limit-status limited';
    } else {
        rateLimitInfo.innerHTML = `
            <div class="rate-limit-ok">
                <i class="icon-check"></i>
                <span>API利用可能</span>
            </div>
        `;
        rateLimitInfo.className = 'rate-limit-status ok';
    }
}

/**
 * API使用状況を表示（設定ページ用）
 * @param {Object} usage - 使用状況情報
 */
function updateAPIUsageDisplay(usage) {
    const usageInfo = document.getElementById('api-usage-info');
    if (!usageInfo) return;
    
    const percentageClass = usage.percentageUsed > 80 ? 'high' : 
                           usage.percentageUsed > 50 ? 'medium' : 'low';
    
    usageInfo.innerHTML = `
        <div class="api-usage-display">
            <div class="usage-bar">
                <div class="usage-fill ${percentageClass}" style="width: ${usage.percentageUsed}%"></div>
            </div>
            <div class="usage-details">
                <span>使用済み: ${usage.used}/${usage.limit} リクエスト (${usage.percentageUsed}%)</span>
                <span>残り: ${usage.remaining} リクエスト</span>
                <span>リセット: ${usage.resetTime.toLocaleTimeString('ja-JP')}</span>
                <span>認証状態: ${usage.authenticated ? '認証済み' : '未認証'}</span>
            </div>
        </div>
    `;
}

// ページ読み込み時に初期化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initializeGitHubIntegration);
}