// CI/CDサービス設定管理
// 各サービス固有の認証設定と構成を独立して管理

// ========================================
// CI/CDサービス設定マネージャー
// ========================================

/**
 * CI/CDサービスの設定を管理するクラス
 * 各サービスの認証情報と設定を独立して保存・管理
 */
class CIServiceSettingsManager {
    constructor() {
        this.storageKey = 'spec-tracking-site:ciServiceSettings';
        this.settings = this.loadAllSettings();
    }

    /**
     * シングルトンインスタンスを取得
     * @returns {CIServiceSettingsManager} インスタンス
     */
    static getInstance() {
        if (!CIServiceSettingsManager.instance) {
            CIServiceSettingsManager.instance = new CIServiceSettingsManager();
        }
        return CIServiceSettingsManager.instance;
    }

    /**
     * すべての設定を読み込み
     * @returns {Object} すべてのサービス設定
     */
    loadAllSettings() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Failed to load CI service settings:', error);
        }
        
        // デフォルト設定
        return {
            activeService: 'github',
            services: {
                github: {
                    enabled: true,
                    autoSyncEnabled: false,
                    autoSyncInterval: 15,
                    lastSyncAt: null,
                    credentials: null // 暗号化されたトークン
                }
            }
        };
    }

    /**
     * すべての設定を保存
     */
    saveAllSettings() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save CI service settings:', error);
            throw new Error('設定の保存に失敗しました');
        }
    }

    /**
     * アクティブなサービスを取得
     * @returns {string} アクティブなサービス名
     */
    getActiveService() {
        return this.settings.activeService || 'github';
    }

    /**
     * アクティブなサービスを設定
     * @param {string} serviceName - サービス名
     */
    setActiveService(serviceName) {
        this.settings.activeService = serviceName;
        this.saveAllSettings();
    }

    /**
     * サービスの設定を取得
     * @param {string} serviceName - サービス名
     * @returns {Object} サービス設定
     */
    getServiceSettings(serviceName) {
        if (!this.settings.services[serviceName]) {
            // デフォルト設定を作成
            this.settings.services[serviceName] = {
                enabled: false,
                autoSyncEnabled: false,
                autoSyncInterval: 15,
                lastSyncAt: null,
                credentials: null
            };
            this.saveAllSettings();
        }
        return this.settings.services[serviceName];
    }

    /**
     * サービスの設定を更新
     * @param {string} serviceName - サービス名
     * @param {Object} updates - 更新内容
     */
    updateServiceSettings(serviceName, updates) {
        const currentSettings = this.getServiceSettings(serviceName);
        this.settings.services[serviceName] = {
            ...currentSettings,
            ...updates
        };
        this.saveAllSettings();
    }

    /**
     * サービスの認証情報を設定
     * @param {string} serviceName - サービス名
     * @param {Object} credentials - 認証情報（暗号化済み）
     */
    setServiceCredentials(serviceName, credentials) {
        this.updateServiceSettings(serviceName, { credentials });
    }

    /**
     * サービスの認証情報を取得
     * @param {string} serviceName - サービス名
     * @returns {Object|null} 認証情報
     */
    getServiceCredentials(serviceName) {
        const settings = this.getServiceSettings(serviceName);
        return settings.credentials;
    }

    /**
     * サービスの認証情報をクリア
     * @param {string} serviceName - サービス名
     */
    clearServiceCredentials(serviceName) {
        this.updateServiceSettings(serviceName, { credentials: null });
    }

    /**
     * サービスが有効かチェック
     * @param {string} serviceName - サービス名
     * @returns {boolean} 有効かどうか
     */
    isServiceEnabled(serviceName) {
        const settings = this.getServiceSettings(serviceName);
        return settings.enabled === true;
    }

    /**
     * サービスを有効化
     * @param {string} serviceName - サービス名
     */
    enableService(serviceName) {
        this.updateServiceSettings(serviceName, { enabled: true });
    }

    /**
     * サービスを無効化
     * @param {string} serviceName - サービス名
     */
    disableService(serviceName) {
        this.updateServiceSettings(serviceName, { enabled: false });
    }

    /**
     * 自動同期が有効かチェック
     * @param {string} serviceName - サービス名
     * @returns {boolean} 自動同期が有効かどうか
     */
    isAutoSyncEnabled(serviceName) {
        const settings = this.getServiceSettings(serviceName);
        return settings.autoSyncEnabled === true;
    }

    /**
     * 自動同期を設定
     * @param {string} serviceName - サービス名
     * @param {boolean} enabled - 有効/無効
     * @param {number} [interval] - 同期間隔（分）
     */
    setAutoSync(serviceName, enabled, interval) {
        const updates = { autoSyncEnabled: enabled };
        if (interval !== undefined) {
            updates.autoSyncInterval = interval;
        }
        this.updateServiceSettings(serviceName, updates);
    }

    /**
     * 最終同期時刻を更新
     * @param {string} serviceName - サービス名
     * @param {string} timestamp - ISO 8601形式のタイムスタンプ
     */
    updateLastSyncTime(serviceName, timestamp) {
        this.updateServiceSettings(serviceName, { lastSyncAt: timestamp });
    }

    /**
     * すべての有効なサービスを取得
     * @returns {Array<string>} 有効なサービス名の配列
     */
    getEnabledServices() {
        return Object.keys(this.settings.services).filter(serviceName => 
            this.isServiceEnabled(serviceName)
        );
    }

    /**
     * すべてのサービス設定をエクスポート
     * @returns {Object} エクスポートデータ
     */
    exportSettings() {
        return {
            ...this.settings,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }

    /**
     * サービス設定をインポート
     * @param {Object} data - インポートデータ
     */
    importSettings(data) {
        if (!data || !data.services) {
            throw new Error('無効なインポートデータ');
        }

        // 認証情報は除外してインポート（セキュリティのため）
        const sanitizedData = {
            activeService: data.activeService || 'github',
            services: {}
        };

        for (const [serviceName, settings] of Object.entries(data.services)) {
            sanitizedData.services[serviceName] = {
                ...settings,
                credentials: null // 認証情報は除外
            };
        }

        this.settings = sanitizedData;
        this.saveAllSettings();
    }

    /**
     * 設定をリセット
     */
    resetSettings() {
        this.settings = {
            activeService: 'github',
            services: {
                github: {
                    enabled: true,
                    autoSyncEnabled: false,
                    autoSyncInterval: 15,
                    lastSyncAt: null,
                    credentials: null
                }
            }
        };
        this.saveAllSettings();
    }
}

// ========================================
// CI結果統合マネージャー
// ========================================

/**
 * 複数のCI/CDサービスからのCI結果を統合して管理するクラス
 */
class CIResultsAggregator {
    constructor() {
        this.serviceRegistry = CIServiceRegistry.getInstance();
        this.settingsManager = CIServiceSettingsManager.getInstance();
    }

    /**
     * シングルトンインスタンスを取得
     * @returns {CIResultsAggregator} インスタンス
     */
    static getInstance() {
        if (!CIResultsAggregator.instance) {
            CIResultsAggregator.instance = new CIResultsAggregator();
        }
        return CIResultsAggregator.instance;
    }

    /**
     * プロジェクトのすべてのCI結果を取得（すべてのサービスから）
     * @param {string} projectId - プロジェクトID
     * @returns {Array<CIResult>} CI結果配列
     */
    getAllCIResults(projectId) {
        const dataManager = new DataManager();
        const project = dataManager.getProjectById(projectId);
        
        if (!project) {
            return [];
        }

        // プロジェクトに保存されているすべてのCI結果を返す
        // 各結果にはsourceフィールドがあり、どのサービスからのものか識別可能
        return project.ciResults || [];
    }

    /**
     * サービス別にCI結果をグループ化
     * @param {string} projectId - プロジェクトID
     * @returns {Object} サービス名をキーとしたCI結果のマップ
     */
    getCIResultsByService(projectId) {
        const allResults = this.getAllCIResults(projectId);
        const groupedResults = {};

        for (const result of allResults) {
            const source = result.source || 'manual';
            if (!groupedResults[source]) {
                groupedResults[source] = [];
            }
            groupedResults[source].push(result);
        }

        return groupedResults;
    }

    /**
     * 特定のサービスからのCI結果のみを取得
     * @param {string} projectId - プロジェクトID
     * @param {string} serviceName - サービス名
     * @returns {Array<CIResult>} CI結果配列
     */
    getCIResultsForService(projectId, serviceName) {
        const allResults = this.getAllCIResults(projectId);
        return allResults.filter(result => result.source === serviceName);
    }

    /**
     * すべての有効なサービスからCI結果を同期
     * @param {string} projectId - プロジェクトID
     * @returns {Promise<Object>} 同期結果の統計情報
     */
    async syncAllServices(projectId) {
        const dataManager = new DataManager();
        const project = dataManager.getProjectById(projectId);
        
        if (!project) {
            throw new Error('プロジェクトが見つかりません');
        }

        const enabledServices = this.settingsManager.getEnabledServices();
        const results = {
            totalServices: enabledServices.length,
            successfulServices: 0,
            failedServices: 0,
            totalNewResults: 0,
            errors: []
        };

        for (const serviceName of enabledServices) {
            try {
                const service = this.serviceRegistry.getService(serviceName);
                if (!service) {
                    console.warn(`Service not found: ${serviceName}`);
                    continue;
                }

                // サービス固有のリポジトリ設定を取得
                const repositoryConfig = this.getRepositoryConfigForService(project, serviceName);
                if (!repositoryConfig || !repositoryConfig.url) {
                    console.log(`No repository configured for service: ${serviceName}`);
                    continue;
                }

                // CI結果を取得
                const ciResults = await service.fetchCIResults(repositoryConfig.url, {
                    limit: 10,
                    targetWorkflows: repositoryConfig.targetWorkflows
                });

                // 重複を除いて保存
                let newResultsCount = 0;
                for (const ciResult of ciResults) {
                    const isDuplicate = this.isDuplicateResult(project, ciResult);
                    if (!isDuplicate) {
                        dataManager.createCIResult(projectId, ciResult);
                        newResultsCount++;
                    }
                }

                results.successfulServices++;
                results.totalNewResults += newResultsCount;

                // 最終同期時刻を更新
                this.settingsManager.updateLastSyncTime(serviceName, new Date().toISOString());

            } catch (error) {
                console.error(`Failed to sync service ${serviceName}:`, error);
                results.failedServices++;
                results.errors.push({
                    service: serviceName,
                    error: error.message
                });
            }
        }

        return results;
    }

    /**
     * サービス固有のリポジトリ設定を取得
     * @param {Object} project - プロジェクトオブジェクト
     * @param {string} serviceName - サービス名
     * @returns {Object|null} リポジトリ設定
     */
    getRepositoryConfigForService(project, serviceName) {
        // 現在はGitHubのみサポート
        if (serviceName === 'github' && project.githubRepository) {
            return project.githubRepository;
        }

        // 将来的に他のサービスもサポート
        // if (serviceName === 'gitlab' && project.gitlabRepository) {
        //     return project.gitlabRepository;
        // }

        return null;
    }

    /**
     * CI結果が重複しているかチェック
     * @param {Object} project - プロジェクトオブジェクト
     * @param {CIResult} newResult - 新しいCI結果
     * @returns {boolean} 重複しているかどうか
     */
    isDuplicateResult(project, newResult) {
        return project.ciResults.some(existingResult => {
            // ソースが異なる場合は重複ではない
            if (existingResult.source !== newResult.source) {
                return false;
            }

            // GitHub固有の重複チェック
            if (newResult.source === 'github' && newResult.githubData && existingResult.githubData) {
                return existingResult.githubData.runId === newResult.githubData.runId;
            }

            // 他のサービスの場合はタイムスタンプとステータスで判定
            return existingResult.timestamp === newResult.timestamp &&
                   existingResult.status === newResult.status;
        });
    }

    /**
     * CI結果の統計情報を取得
     * @param {string} projectId - プロジェクトID
     * @returns {Object} 統計情報
     */
    getCIResultsStatistics(projectId) {
        const groupedResults = this.getCIResultsByService(projectId);
        const statistics = {
            totalResults: 0,
            byService: {},
            overallPassRate: 0
        };

        let totalPassed = 0;
        let totalResults = 0;

        for (const [serviceName, results] of Object.entries(groupedResults)) {
            const passed = results.filter(r => r.status === 'pass').length;
            const failed = results.filter(r => r.status === 'fail').length;
            const passRate = results.length > 0 ? (passed / results.length) * 100 : 0;

            statistics.byService[serviceName] = {
                total: results.length,
                passed: passed,
                failed: failed,
                passRate: Math.round(passRate * 100) / 100
            };

            totalPassed += passed;
            totalResults += results.length;
        }

        statistics.totalResults = totalResults;
        statistics.overallPassRate = totalResults > 0 
            ? Math.round((totalPassed / totalResults) * 100 * 100) / 100 
            : 0;

        return statistics;
    }

    /**
     * CI結果の統合表示用HTMLを生成
     * @param {string} projectId - プロジェクトID
     * @returns {HTMLElement} 統合表示UI要素
     */
    createAggregatedResultsUI(projectId) {
        const container = document.createElement('div');
        container.className = 'ci-results-aggregated';

        const groupedResults = this.getCIResultsByService(projectId);
        const statistics = this.getCIResultsStatistics(projectId);

        // 統計情報を表示
        const statsHTML = `
            <div class="ci-stats-summary">
                <h4>CI結果サマリー</h4>
                <div class="stats-grid">
                    <div class="stat-item">
                        <span class="stat-label">総CI結果数:</span>
                        <span class="stat-value">${statistics.totalResults}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">全体成功率:</span>
                        <span class="stat-value">${statistics.overallPassRate}%</span>
                    </div>
                </div>
            </div>
        `;

        // サービス別の結果を表示
        let servicesHTML = '<div class="ci-results-by-service">';
        
        for (const [serviceName, results] of Object.entries(groupedResults)) {
            const serviceStats = statistics.byService[serviceName];
            const service = this.serviceRegistry.getService(serviceName);
            const displayName = service ? service.getDisplayName() : serviceName;

            servicesHTML += `
                <div class="service-results-section">
                    <h5>${displayName}</h5>
                    <div class="service-stats">
                        <span>総数: ${serviceStats.total}</span>
                        <span>成功: ${serviceStats.passed}</span>
                        <span>失敗: ${serviceStats.failed}</span>
                        <span>成功率: ${serviceStats.passRate}%</span>
                    </div>
                    <div class="results-list">
                        ${this.createResultsListHTML(results)}
                    </div>
                </div>
            `;
        }

        servicesHTML += '</div>';

        container.innerHTML = statsHTML + servicesHTML;

        return container;
    }

    /**
     * CI結果リストのHTMLを生成
     * @param {Array<CIResult>} results - CI結果配列
     * @returns {string} HTML文字列
     */
    createResultsListHTML(results) {
        if (results.length === 0) {
            return '<p class="no-results">CI結果がありません</p>';
        }

        // 最新の結果から表示
        const sortedResults = [...results].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );

        return sortedResults.slice(0, 10).map(result => {
            const statusClass = result.status === 'pass' ? 'status-pass' : 'status-fail';
            const statusText = result.status === 'pass' ? '成功' : '失敗';
            const timestamp = new Date(result.timestamp).toLocaleString('ja-JP');

            let detailsHTML = '';
            if (result.githubData) {
                detailsHTML = `
                    <div class="result-details">
                        <span>ワークフロー: ${result.githubData.workflowName}</span>
                        <span>ブランチ: ${result.githubData.branch}</span>
                        <span>実行者: ${result.githubData.actor}</span>
                    </div>
                `;
            }

            return `
                <div class="ci-result-item ${statusClass}">
                    <div class="result-header">
                        <span class="result-status">${statusText}</span>
                        <span class="result-timestamp">${timestamp}</span>
                    </div>
                    ${detailsHTML}
                    ${result.logUrl ? `<a href="${result.logUrl}" target="_blank" class="result-log-link">ログを表示</a>` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * サービス選択フィルターUIを生成
     * @param {string} projectId - プロジェクトID
     * @param {Function} onFilterChange - フィルター変更時のコールバック
     * @returns {HTMLElement} フィルターUI要素
     */
    createServiceFilterUI(projectId, onFilterChange) {
        const container = document.createElement('div');
        container.className = 'ci-service-filter';

        const groupedResults = this.getCIResultsByService(projectId);
        const services = Object.keys(groupedResults);

        if (services.length <= 1) {
            // サービスが1つ以下の場合はフィルター不要
            return container;
        }

        container.innerHTML = `
            <div class="filter-group">
                <label>CI/CDサービスでフィルター:</label>
                <select id="ci-service-filter" class="form-control">
                    <option value="all">すべて</option>
                    ${services.map(serviceName => {
                        const service = this.serviceRegistry.getService(serviceName);
                        const displayName = service ? service.getDisplayName() : serviceName;
                        return `<option value="${serviceName}">${displayName}</option>`;
                    }).join('')}
                </select>
            </div>
        `;

        // イベントハンドラーを設定
        const select = container.querySelector('#ci-service-filter');
        select.addEventListener('change', (e) => {
            if (onFilterChange) {
                onFilterChange(e.target.value);
            }
        });

        return container;
    }
}

// ========================================
// 初期化
// ========================================

// グローバルインスタンスを作成
const ciServiceSettingsManager = CIServiceSettingsManager.getInstance();
const ciResultsAggregator = CIResultsAggregator.getInstance();

console.log('CI Service Settings Manager initialized');
