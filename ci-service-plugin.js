// CI/CDサービスプラグイン基盤
// 将来的に複数のCI/CDサービス（GitHub Actions、GitLab CI、CircleCI等）に対応するための抽象化レイヤー

// ========================================
// CI/CDサービス基底インターフェース
// ========================================

/**
 * CI/CDサービスの基底クラス
 * すべてのCI/CDサービスプラグインはこのクラスを継承する必要があります
 * @abstract
 */
class CIServicePlugin {
    constructor(name, displayName) {
        if (new.target === CIServicePlugin) {
            throw new TypeError('CIServicePlugin is an abstract class and cannot be instantiated directly');
        }
        
        this.name = name; // サービス識別子（例: 'github', 'gitlab', 'circleci'）
        this.displayName = displayName; // 表示名（例: 'GitHub Actions', 'GitLab CI'）
        this.isAuthenticated = false;
        this.settingsManager = null;
    }

    /**
     * サービス名を取得
     * @returns {string} サービス名
     */
    getName() {
        return this.name;
    }

    /**
     * 表示名を取得
     * @returns {string} 表示名
     */
    getDisplayName() {
        return this.displayName;
    }

    /**
     * 認証状態を取得
     * @returns {boolean} 認証済みかどうか
     */
    isAuthenticatedStatus() {
        return this.isAuthenticated;
    }

    // ========================================
    // 抽象メソッド（サブクラスで実装必須）
    // ========================================

    /**
     * 認証情報を設定
     * @abstract
     * @param {Object} credentials - 認証情報
     * @returns {Promise<void>}
     */
    async setCredentials(credentials) {
        throw new Error('setCredentials() must be implemented by subclass');
    }

    /**
     * 認証情報をクリア
     * @abstract
     * @returns {Promise<void>}
     */
    async clearCredentials() {
        throw new Error('clearCredentials() must be implemented by subclass');
    }

    /**
     * 接続をテスト
     * @abstract
     * @returns {Promise<boolean>} 接続成功かどうか
     */
    async testConnection() {
        throw new Error('testConnection() must be implemented by subclass');
    }

    /**
     * リポジトリの存在を検証
     * @abstract
     * @param {string} repositoryUrl - リポジトリURL
     * @returns {Promise<boolean>} リポジトリが存在するかどうか
     */
    async validateRepository(repositoryUrl) {
        throw new Error('validateRepository() must be implemented by subclass');
    }

    /**
     * CI結果を取得
     * @abstract
     * @param {string} repositoryUrl - リポジトリURL
     * @param {Object} options - オプション
     * @returns {Promise<Array<CIResult>>} CI結果配列
     */
    async fetchCIResults(repositoryUrl, options = {}) {
        throw new Error('fetchCIResults() must be implemented by subclass');
    }

    /**
     * リポジトリURLを解析
     * @abstract
     * @param {string} url - リポジトリURL
     * @returns {Object|null} 解析結果（owner, repo等）
     */
    parseRepositoryUrl(url) {
        throw new Error('parseRepositoryUrl() must be implemented by subclass');
    }

    /**
     * リポジトリURL入力フィールドのプレースホルダーを取得
     * @abstract
     * @returns {string} プレースホルダーテキスト
     */
    getRepositoryUrlPlaceholder() {
        throw new Error('getRepositoryUrlPlaceholder() must be implemented by subclass');
    }

    /**
     * リポジトリURL入力フィールドのヘルプテキストを取得
     * @abstract
     * @returns {string} ヘルプテキスト
     */
    getRepositoryUrlHelpText() {
        throw new Error('getRepositoryUrlHelpText() must be implemented by subclass');
    }

    /**
     * 認証設定UIを生成
     * @abstract
     * @returns {HTMLElement} 認証設定UI要素
     */
    createAuthenticationUI() {
        throw new Error('createAuthenticationUI() must be implemented by subclass');
    }

    /**
     * サービス固有の設定UIを生成
     * @abstract
     * @returns {HTMLElement} 設定UI要素
     */
    createServiceSettingsUI() {
        throw new Error('createServiceSettingsUI() must be implemented by subclass');
    }

    /**
     * レート制限情報を取得
     * @abstract
     * @returns {Promise<Object>} レート制限情報
     */
    async getRateLimitInfo() {
        throw new Error('getRateLimitInfo() must be implemented by subclass');
    }

    /**
     * サービス固有のエラーを処理
     * @abstract
     * @param {Error} error - エラーオブジェクト
     * @returns {Object} 処理されたエラー情報
     */
    handleServiceError(error) {
        throw new Error('handleServiceError() must be implemented by subclass');
    }

    // ========================================
    // 共通ユーティリティメソッド
    // ========================================

    /**
     * CI結果を標準フォーマットに変換
     * @param {Object} rawResult - サービス固有のCI結果
     * @returns {CIResult} 標準フォーマットのCI結果
     */
    normalizeCIResult(rawResult) {
        // サブクラスでオーバーライド可能
        return rawResult;
    }

    /**
     * エラーメッセージをユーザーフレンドリーに変換
     * @param {Error} error - エラーオブジェクト
     * @returns {string} ユーザーフレンドリーなエラーメッセージ
     */
    formatErrorMessage(error) {
        if (error.message) {
            return error.message;
        }
        return 'サービスとの通信中にエラーが発生しました';
    }

    /**
     * 設定を保存
     * @param {Object} settings - 設定オブジェクト
     */
    saveSettings(settings) {
        if (this.settingsManager) {
            this.settingsManager.saveServiceSettings(this.name, settings);
        }
    }

    /**
     * 設定を読み込み
     * @returns {Object} 設定オブジェクト
     */
    loadSettings() {
        if (this.settingsManager) {
            return this.settingsManager.loadServiceSettings(this.name);
        }
        return {};
    }
}

// ========================================
// GitHubサービスプラグイン
// ========================================

/**
 * GitHub Actions用のCI/CDサービスプラグイン
 * 既存のGitHub統合機能をプラグインとして実装
 */
class GitHubServicePlugin extends CIServicePlugin {
    constructor() {
        super('github', 'GitHub Actions');
        this.client = null;
        this.rateLimitManager = null;
    }

    /**
     * プラグインを初期化
     */
    initialize() {
        this.rateLimitManager = RateLimitManager.getInstance();
        this.client = new GitHubIntegrationClient(this.rateLimitManager);
    }

    /**
     * 認証情報を設定
     * @param {Object} credentials - 認証情報
     * @param {string} credentials.accessToken - Personal Access Token
     * @returns {Promise<void>}
     */
    async setCredentials(credentials) {
        if (!credentials.accessToken) {
            throw new Error('Personal Access Tokenが必要です');
        }

        // トークンを暗号化して保存
        const encryptedToken = await TokenEncryption.encrypt(credentials.accessToken);
        
        // GitHubSettingsManagerに保存
        const settingsManager = new GitHubSettingsManager();
        settingsManager.setAccessToken(encryptedToken);

        // クライアントに設定
        if (!this.client) {
            this.initialize();
        }
        this.client.setAccessToken(credentials.accessToken);
        this.isAuthenticated = true;
    }

    /**
     * 認証情報をクリア
     * @returns {Promise<void>}
     */
    async clearCredentials() {
        const settingsManager = new GitHubSettingsManager();
        settingsManager.clearAccessToken();
        this.isAuthenticated = false;
    }

    /**
     * 接続をテスト
     * @returns {Promise<boolean>} 接続成功かどうか
     */
    async testConnection() {
        if (!this.client) {
            this.initialize();
        }
        return await this.client.testConnection();
    }

    /**
     * リポジトリの存在を検証
     * @param {string} repositoryUrl - リポジトリURL
     * @returns {Promise<boolean>} リポジトリが存在するかどうか
     */
    async validateRepository(repositoryUrl) {
        const parsed = this.parseRepositoryUrl(repositoryUrl);
        if (!parsed) {
            return false;
        }

        if (!this.client) {
            this.initialize();
        }

        return await this.client.validateRepository(parsed.owner, parsed.repo);
    }

    /**
     * CI結果を取得
     * @param {string} repositoryUrl - リポジトリURL
     * @param {Object} options - オプション
     * @param {number} [options.limit=10] - 取得件数
     * @param {string[]} [options.targetWorkflows] - 対象ワークフロー名
     * @returns {Promise<Array<CIResult>>} CI結果配列
     */
    async fetchCIResults(repositoryUrl, options = {}) {
        const parsed = this.parseRepositoryUrl(repositoryUrl);
        if (!parsed) {
            throw new Error('無効なGitHubリポジトリURL');
        }

        if (!this.client) {
            this.initialize();
        }

        const { owner, repo } = parsed;
        const limit = options.limit || 10;
        const targetWorkflows = options.targetWorkflows || [];

        // ワークフロー実行を取得
        const workflowRuns = await this.client.getWorkflowRuns(owner, repo, {
            per_page: limit,
            status: 'completed'
        });

        // ワークフローフィルタリング
        const filteredRuns = targetWorkflows.length > 0
            ? workflowRuns.filter(run => targetWorkflows.includes(run.name))
            : workflowRuns;

        const ciResults = [];
        const metricsExtractor = new MetricsExtractor();

        // 各ワークフロー実行を処理
        for (const run of filteredRuns) {
            try {
                // ジョブ詳細を取得
                const jobs = await this.client.getJobsForRun(owner, repo, run.id);

                // メトリクスを抽出
                const metrics = await metricsExtractor.extractAllMetrics(
                    jobs,
                    this.client,
                    owner,
                    repo
                );

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

                ciResults.push(ciResult);
            } catch (error) {
                console.error(`Failed to process workflow run ${run.id}:`, error);
                // 個別のワークフロー処理エラーは続行
            }
        }

        return ciResults;
    }

    /**
     * リポジトリURLを解析
     * @param {string} url - リポジトリURL
     * @returns {Object|null} 解析結果 {owner, repo}
     */
    parseRepositoryUrl(url) {
        return parseGitHubRepositoryUrl(url);
    }

    /**
     * リポジトリURL入力フィールドのプレースホルダーを取得
     * @returns {string} プレースホルダーテキスト
     */
    getRepositoryUrlPlaceholder() {
        return 'https://github.com/owner/repository';
    }

    /**
     * リポジトリURL入力フィールドのヘルプテキストを取得
     * @returns {string} ヘルプテキスト
     */
    getRepositoryUrlHelpText() {
        return 'GitHubリポジトリのURL（例: https://github.com/owner/repo）を入力してください';
    }

    /**
     * 認証設定UIを生成
     * @returns {HTMLElement} 認証設定UI要素
     */
    createAuthenticationUI() {
        const container = document.createElement('div');
        container.className = 'service-auth-ui github-auth-ui';
        container.innerHTML = `
            <div class="form-group">
                <label for="github-token">Personal Access Token</label>
                <input 
                    type="password" 
                    id="github-token" 
                    class="form-control" 
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                >
                <small class="form-text text-muted">
                    GitHub Settings → Developer settings → Personal access tokens から生成できます。
                    必要な権限: repo:status, actions:read
                </small>
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-primary" id="github-test-connection">
                    接続テスト
                </button>
                <button type="button" class="btn btn-secondary" id="github-save-token">
                    保存
                </button>
                <button type="button" class="btn btn-danger" id="github-clear-token">
                    削除
                </button>
            </div>
            <div id="github-connection-status" class="mt-2"></div>
        `;

        // イベントハンドラーを設定
        this.attachAuthenticationEventHandlers(container);

        return container;
    }

    /**
     * 認証UIのイベントハンドラーを設定
     * @param {HTMLElement} container - コンテナ要素
     */
    attachAuthenticationEventHandlers(container) {
        const tokenInput = container.querySelector('#github-token');
        const testButton = container.querySelector('#github-test-connection');
        const saveButton = container.querySelector('#github-save-token');
        const clearButton = container.querySelector('#github-clear-token');
        const statusDiv = container.querySelector('#github-connection-status');

        // 接続テスト
        testButton.addEventListener('click', async () => {
            const token = tokenInput.value.trim();
            if (!token) {
                statusDiv.innerHTML = '<div class="alert alert-warning">トークンを入力してください</div>';
                return;
            }

            statusDiv.innerHTML = '<div class="alert alert-info">接続テスト中...</div>';

            try {
                await this.setCredentials({ accessToken: token });
                const isConnected = await this.testConnection();

                if (isConnected) {
                    statusDiv.innerHTML = '<div class="alert alert-success">接続成功！</div>';
                } else {
                    statusDiv.innerHTML = '<div class="alert alert-danger">接続失敗。トークンを確認してください。</div>';
                }
            } catch (error) {
                statusDiv.innerHTML = `<div class="alert alert-danger">エラー: ${error.message}</div>`;
            }
        });

        // 保存
        saveButton.addEventListener('click', async () => {
            const token = tokenInput.value.trim();
            if (!token) {
                statusDiv.innerHTML = '<div class="alert alert-warning">トークンを入力してください</div>';
                return;
            }

            try {
                await this.setCredentials({ accessToken: token });
                statusDiv.innerHTML = '<div class="alert alert-success">トークンを保存しました</div>';
                tokenInput.value = '';
            } catch (error) {
                statusDiv.innerHTML = `<div class="alert alert-danger">保存エラー: ${error.message}</div>`;
            }
        });

        // 削除
        clearButton.addEventListener('click', async () => {
            if (confirm('保存されているトークンを削除しますか？')) {
                try {
                    await this.clearCredentials();
                    statusDiv.innerHTML = '<div class="alert alert-success">トークンを削除しました</div>';
                    tokenInput.value = '';
                } catch (error) {
                    statusDiv.innerHTML = `<div class="alert alert-danger">削除エラー: ${error.message}</div>`;
                }
            }
        });
    }

    /**
     * サービス固有の設定UIを生成
     * @returns {HTMLElement} 設定UI要素
     */
    createServiceSettingsUI() {
        const container = document.createElement('div');
        container.className = 'service-settings-ui github-settings-ui';
        container.innerHTML = `
            <div class="form-group">
                <label>
                    <input type="checkbox" id="github-auto-sync-enabled">
                    自動同期を有効にする
                </label>
            </div>
            <div class="form-group">
                <label for="github-sync-interval">同期間隔</label>
                <select id="github-sync-interval" class="form-control">
                    <option value="5">5分</option>
                    <option value="15" selected>15分</option>
                    <option value="30">30分</option>
                    <option value="60">1時間</option>
                </select>
            </div>
            <div class="form-group">
                <button type="button" class="btn btn-primary" id="github-save-settings">
                    設定を保存
                </button>
            </div>
            <div id="github-settings-status" class="mt-2"></div>
        `;

        // 現在の設定を読み込み
        this.loadCurrentSettings(container);

        // イベントハンドラーを設定
        this.attachSettingsEventHandlers(container);

        return container;
    }

    /**
     * 現在の設定を読み込んでUIに反映
     * @param {HTMLElement} container - コンテナ要素
     */
    loadCurrentSettings(container) {
        const settingsManager = new GitHubSettingsManager();
        const settings = settingsManager.getSettings();

        const autoSyncCheckbox = container.querySelector('#github-auto-sync-enabled');
        const syncIntervalSelect = container.querySelector('#github-sync-interval');

        if (autoSyncCheckbox) {
            autoSyncCheckbox.checked = settings.autoSyncEnabled || false;
        }

        if (syncIntervalSelect) {
            syncIntervalSelect.value = settings.autoSyncInterval || 15;
        }
    }

    /**
     * 設定UIのイベントハンドラーを設定
     * @param {HTMLElement} container - コンテナ要素
     */
    attachSettingsEventHandlers(container) {
        const saveButton = container.querySelector('#github-save-settings');
        const statusDiv = container.querySelector('#github-settings-status');

        saveButton.addEventListener('click', () => {
            const autoSyncCheckbox = container.querySelector('#github-auto-sync-enabled');
            const syncIntervalSelect = container.querySelector('#github-sync-interval');

            const settings = {
                autoSyncEnabled: autoSyncCheckbox.checked,
                autoSyncInterval: parseInt(syncIntervalSelect.value, 10)
            };

            try {
                const settingsManager = new GitHubSettingsManager();
                settingsManager.updateSettings(settings);

                // 自動同期スケジューラーを更新
                const scheduler = AutoSyncScheduler.getInstance();
                if (settings.autoSyncEnabled) {
                    scheduler.start(settings.autoSyncInterval);
                } else {
                    scheduler.stop();
                }

                statusDiv.innerHTML = '<div class="alert alert-success">設定を保存しました</div>';
            } catch (error) {
                statusDiv.innerHTML = `<div class="alert alert-danger">保存エラー: ${error.message}</div>`;
            }
        });
    }

    /**
     * レート制限情報を取得
     * @returns {Promise<Object>} レート制限情報
     */
    async getRateLimitInfo() {
        if (!this.rateLimitManager) {
            this.initialize();
        }
        return await this.rateLimitManager.getUsageStatus();
    }

    /**
     * サービス固有のエラーを処理
     * @param {Error} error - エラーオブジェクト
     * @returns {Object} 処理されたエラー情報
     */
    handleServiceError(error) {
        return GitHubErrorHandler.handleAPIError(error);
    }
}

// ========================================
// CI/CDサービスレジストリ
// ========================================

/**
 * CI/CDサービスプラグインを管理するレジストリ
 */
class CIServiceRegistry {
    constructor() {
        this.services = new Map();
        this.activeService = null;
    }

    /**
     * シングルトンインスタンスを取得
     * @returns {CIServiceRegistry} インスタンス
     */
    static getInstance() {
        if (!CIServiceRegistry.instance) {
            CIServiceRegistry.instance = new CIServiceRegistry();
        }
        return CIServiceRegistry.instance;
    }

    /**
     * サービスを登録
     * @param {CIServicePlugin} service - サービスプラグイン
     */
    registerService(service) {
        if (!(service instanceof CIServicePlugin)) {
            throw new TypeError('Service must be an instance of CIServicePlugin');
        }

        this.services.set(service.getName(), service);
        console.log(`Registered CI/CD service: ${service.getDisplayName()}`);
    }

    /**
     * サービスを取得
     * @param {string} name - サービス名
     * @returns {CIServicePlugin|null} サービスプラグイン
     */
    getService(name) {
        return this.services.get(name) || null;
    }

    /**
     * すべてのサービスを取得
     * @returns {Array<CIServicePlugin>} サービスプラグイン配列
     */
    getAllServices() {
        return Array.from(this.services.values());
    }

    /**
     * アクティブなサービスを設定
     * @param {string} name - サービス名
     */
    setActiveService(name) {
        const service = this.getService(name);
        if (!service) {
            throw new Error(`Service not found: ${name}`);
        }
        this.activeService = service;
        console.log(`Active CI/CD service set to: ${service.getDisplayName()}`);
    }

    /**
     * アクティブなサービスを取得
     * @returns {CIServicePlugin|null} アクティブなサービスプラグイン
     */
    getActiveService() {
        return this.activeService;
    }

    /**
     * サービスが登録されているかチェック
     * @param {string} name - サービス名
     * @returns {boolean} 登録されているかどうか
     */
    hasService(name) {
        return this.services.has(name);
    }

    /**
     * サービス選択UIを生成
     * @returns {HTMLElement} サービス選択UI要素
     */
    createServiceSelectorUI() {
        const container = document.createElement('div');
        container.className = 'service-selector-ui';

        const services = this.getAllServices();
        if (services.length === 0) {
            container.innerHTML = '<p>利用可能なCI/CDサービスがありません</p>';
            return container;
        }

        container.innerHTML = `
            <div class="form-group">
                <label for="ci-service-select">CI/CDサービス</label>
                <select id="ci-service-select" class="form-control">
                    ${services.map(service => `
                        <option value="${service.getName()}" ${service === this.activeService ? 'selected' : ''}>
                            ${service.getDisplayName()}
                        </option>
                    `).join('')}
                </select>
            </div>
        `;

        // イベントハンドラーを設定
        const select = container.querySelector('#ci-service-select');
        select.addEventListener('change', (e) => {
            this.setActiveService(e.target.value);
            
            // サービス変更イベントを発火
            const event = new CustomEvent('ciServiceChanged', {
                detail: { serviceName: e.target.value }
            });
            window.dispatchEvent(event);
        });

        return container;
    }
}

// ========================================
// 初期化
// ========================================

// グローバルレジストリを初期化
const ciServiceRegistry = CIServiceRegistry.getInstance();

// GitHubサービスプラグインを登録
const githubService = new GitHubServicePlugin();
githubService.initialize();
ciServiceRegistry.registerService(githubService);

// デフォルトでGitHubをアクティブに設定
ciServiceRegistry.setActiveService('github');

console.log('CI/CD Service Plugin system initialized');
