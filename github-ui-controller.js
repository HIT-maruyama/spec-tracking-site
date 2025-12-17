/**
 * GitHub統合UIコントローラー
 * 設定ページとプロジェクト詳細ページのイベントハンドリングを統合
 */

/**
 * GitHub統合UIコントローラークラス
 * 設定ページ、プロジェクト詳細ページ、自動同期のイベントハンドリングを統合
 */
class GitHubUIController {
    constructor() {
        this.errorHandler = null;
        this.settingsManager = null;
        this.githubClient = null;
        this.autoSyncScheduler = null;
        this.isInitialized = false;
    }
    
    /**
     * UIコントローラーを初期化
     */
    async initialize() {
        if (this.isInitialized) return;
        
        // 依存関係の確認
        if (typeof GitHubErrorHandler === 'undefined') {
            console.error('GitHubErrorHandler not available');
            return;
        }
        
        // エラーハンドラーを初期化
        this.errorHandler = new GitHubErrorHandler();
        
        // GitHub統合機能が初期化されるまで待機
        await this.waitForGitHubIntegration();
        
        // 設定ページのイベントハンドラーを設定
        this.setupSettingsPageHandlers();
        
        // プロジェクト詳細ページのイベントハンドラーを設定
        this.setupProjectDetailHandlers();
        
        // 自動同期のイベントハンドラーを設定
        this.setupAutoSyncHandlers();
        
        // グローバルイベントリスナーを設定
        this.setupGlobalEventListeners();
        
        this.isInitialized = true;
        console.log('GitHubUIController initialized');
    }
    
    /**
     * GitHub統合機能の初期化を待機
     */
    async waitForGitHubIntegration() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof githubSettingsManager !== 'undefined' && 
                    typeof githubClient !== 'undefined' &&
                    typeof AutoSyncScheduler !== 'undefined') {
                    
                    this.settingsManager = githubSettingsManager;
                    this.githubClient = githubClient;
                    this.autoSyncScheduler = AutoSyncScheduler.getInstance();
                    
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
            
            // タイムアウト（10秒）
            setTimeout(() => {
                clearInterval(checkInterval);
                console.warn('GitHub integration initialization timeout');
                resolve();
            }, 10000);
        });
    }
    
    /**
     * 設定ページのイベントハンドラーを設定
     */
    setupSettingsPageHandlers() {
        // 設定ページでない場合はスキップ
        if (!this.isSettingsPage()) return;
        
        // Personal Access Token関連
        this.setupTokenHandlers();
        
        // 自動同期設定関連
        this.setupAutoSyncSettingsHandlers();
        
        // API使用状況関連
        this.setupRateLimitHandlers();
        
        // 同期履歴関連
        this.setupSyncHistoryHandlers();
        
        console.log('Settings page handlers initialized');
    }
    
    /**
     * トークン関連のイベントハンドラーを設定
     */
    setupTokenHandlers() {
        const tokenInput = document.getElementById('github-token');
        const testConnectionBtn = document.getElementById('test-connection-btn');
        const saveTokenBtn = document.getElementById('save-token-btn');
        const deleteTokenBtn = document.getElementById('delete-token-btn');
        
        if (tokenInput) {
            tokenInput.addEventListener('input', () => {
                const hasValue = tokenInput.value.trim() !== '';
                if (testConnectionBtn) testConnectionBtn.disabled = !hasValue;
                if (saveTokenBtn) saveTokenBtn.disabled = !hasValue;
            });
        }
        
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.handleTestConnection());
        }
        
        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', () => this.handleSaveToken());
        }
        
        if (deleteTokenBtn) {
            deleteTokenBtn.addEventListener('click', () => this.handleDeleteToken());
        }
    }
    
    /**
     * 接続テストを処理
     */
    async handleTestConnection() {
        const tokenInput = document.getElementById('github-token');
        const testConnectionBtn = document.getElementById('test-connection-btn');
        
        if (!tokenInput || !tokenInput.value.trim()) {
            this.errorHandler.showValidationError('Personal Access Tokenを入力してください');
            return;
        }
        
        try {
            testConnectionBtn.disabled = true;
            testConnectionBtn.textContent = 'テスト中...';
            
            // 一時的にトークンを設定してテスト
            this.githubClient.setAccessToken(tokenInput.value.trim());
            const isConnected = await this.githubClient.testConnection();
            
            if (isConnected) {
                this.errorHandler.showSuccess('GitHub APIへの接続に成功しました');
                
                // レート制限情報も更新
                if (typeof settingsPageController !== 'undefined' && settingsPageController.updateRateLimitInfo) {
                    await settingsPageController.updateRateLimitInfo();
                }
            } else {
                this.errorHandler.showConnectionError();
            }
            
        } catch (error) {
            console.error('Connection test failed:', error);
            this.errorHandler.handleAPIError(error, { operation: 'testConnection' });
        } finally {
            testConnectionBtn.disabled = false;
            testConnectionBtn.textContent = '接続テスト';
        }
    }
    
    /**
     * トークン保存を処理
     */
    async handleSaveToken() {
        const tokenInput = document.getElementById('github-token');
        
        if (!tokenInput || !tokenInput.value.trim()) {
            this.errorHandler.showValidationError('Personal Access Tokenを入力してください');
            return;
        }
        
        try {
            const token = tokenInput.value.trim();
            
            // まず接続テストを実行
            this.githubClient.setAccessToken(token);
            const isConnected = await this.githubClient.testConnection();
            
            if (!isConnected) {
                this.errorHandler.showValidationError('無効なトークンです。接続テストを実行してください');
                return;
            }
            
            // トークンを暗号化して保存
            await this.settingsManager.setAccessToken(token);
            
            // UIを更新
            tokenInput.value = '';
            this.errorHandler.showSuccess('Personal Access Tokenを保存しました');
            
            // 設定ページコントローラーのUIを更新
            if (typeof settingsPageController !== 'undefined') {
                if (settingsPageController.updateTokenUI) {
                    settingsPageController.updateTokenUI(true);
                }
                if (settingsPageController.updateRateLimitInfo) {
                    await settingsPageController.updateRateLimitInfo();
                }
            }
            
        } catch (error) {
            console.error('Failed to save token:', error);
            this.errorHandler.handleAPIError(error, { operation: 'saveToken' });
        }
    }
    
    /**
     * トークン削除を処理
     */
    handleDeleteToken() {
        // 確認ダイアログを表示
        if (typeof settingsPageController !== 'undefined' && settingsPageController.showConfirmDialog) {
            settingsPageController.showConfirmDialog(
                'トークンの削除',
                'Personal Access Tokenを削除しますか？この操作は取り消せません。',
                () => this.executeDeleteToken()
            );
        } else {
            // フォールバック: 直接確認
            if (confirm('Personal Access Tokenを削除しますか？この操作は取り消せません。')) {
                this.executeDeleteToken();
            }
        }
    }
    
    /**
     * トークン削除を実行
     */
    executeDeleteToken() {
        try {
            this.settingsManager.clearAccessToken();
            this.errorHandler.showSuccess('Personal Access Tokenを削除しました');
            
            // 設定ページコントローラーのUIを更新
            if (typeof settingsPageController !== 'undefined') {
                if (settingsPageController.updateTokenUI) {
                    settingsPageController.updateTokenUI(false);
                }
                if (settingsPageController.clearRateLimitInfo) {
                    settingsPageController.clearRateLimitInfo();
                }
            }
            
        } catch (error) {
            console.error('Failed to delete token:', error);
            this.errorHandler.handleAPIError(error, { operation: 'deleteToken' });
        }
    }
    
    /**
     * 自動同期設定のイベントハンドラーを設定
     */
    setupAutoSyncSettingsHandlers() {
        const autoSyncEnabled = document.getElementById('auto-sync-enabled');
        const syncInterval = document.getElementById('sync-interval');
        
        if (autoSyncEnabled) {
            autoSyncEnabled.addEventListener('change', () => this.handleAutoSyncToggle());
        }
        
        if (syncInterval) {
            syncInterval.addEventListener('change', () => this.handleSyncIntervalChange());
        }
    }
    
    /**
     * 自動同期の有効/無効切り替えを処理
     */
    handleAutoSyncToggle() {
        const autoSyncEnabled = document.getElementById('auto-sync-enabled');
        if (!autoSyncEnabled) return;
        
        const enabled = autoSyncEnabled.checked;
        
        try {
            this.settingsManager.setAutoSyncEnabled(enabled);
            
            // 自動同期スケジューラーを開始/停止
            if (enabled) {
                const settings = this.settingsManager.getSettings();
                this.autoSyncScheduler.start(settings.autoSyncInterval);
                this.errorHandler.showSuccess('自動同期を有効にしました');
            } else {
                this.autoSyncScheduler.stop();
                this.errorHandler.showSuccess('自動同期を無効にしました');
            }
            
            // 設定ページコントローラーのUIを更新
            if (typeof settingsPageController !== 'undefined' && settingsPageController.updateSyncStatus) {
                const settings = this.settingsManager.getSettings();
                settingsPageController.updateSyncStatus(settings);
            }
            
        } catch (error) {
            console.error('Failed to toggle auto sync:', error);
            this.errorHandler.handleAPIError(error, { operation: 'toggleAutoSync' });
        }
    }
    
    /**
     * 同期間隔の変更を処理
     */
    handleSyncIntervalChange() {
        const syncInterval = document.getElementById('sync-interval');
        if (!syncInterval) return;
        
        const interval = parseInt(syncInterval.value);
        
        try {
            this.settingsManager.setAutoSyncInterval(interval);
            
            // 自動同期が有効な場合は再起動
            const settings = this.settingsManager.getSettings();
            if (settings.autoSyncEnabled) {
                this.autoSyncScheduler.stop();
                this.autoSyncScheduler.start(interval);
            }
            
            this.errorHandler.showSuccess(`同期間隔を${interval}分に設定しました`);
            
            // 設定ページコントローラーのUIを更新
            if (typeof settingsPageController !== 'undefined' && settingsPageController.updateSyncStatus) {
                settingsPageController.updateSyncStatus(settings);
            }
            
        } catch (error) {
            console.error('Failed to change sync interval:', error);
            this.errorHandler.handleAPIError(error, { operation: 'changeSyncInterval' });
        }
    }
    
    /**
     * レート制限関連のイベントハンドラーを設定
     */
    setupRateLimitHandlers() {
        const refreshRateLimitBtn = document.getElementById('refresh-rate-limit-btn');
        
        if (refreshRateLimitBtn) {
            refreshRateLimitBtn.addEventListener('click', () => this.handleRefreshRateLimit());
        }
    }
    
    /**
     * レート制限情報の更新を処理
     */
    async handleRefreshRateLimit() {
        try {
            if (typeof settingsPageController !== 'undefined' && settingsPageController.updateRateLimitInfo) {
                await settingsPageController.updateRateLimitInfo();
                this.errorHandler.showSuccess('API使用状況を更新しました');
            }
        } catch (error) {
            console.error('Failed to refresh rate limit:', error);
            this.errorHandler.handleAPIError(error, { operation: 'refreshRateLimit' });
        }
    }
    
    /**
     * 同期履歴関連のイベントハンドラーを設定
     */
    setupSyncHistoryHandlers() {
        const refreshHistoryBtn = document.getElementById('refresh-history-btn');
        const clearHistoryBtn = document.getElementById('clear-history-btn');
        
        if (refreshHistoryBtn) {
            refreshHistoryBtn.addEventListener('click', () => this.handleRefreshHistory());
        }
        
        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.handleClearHistory());
        }
    }
    
    /**
     * 同期履歴の更新を処理
     */
    handleRefreshHistory() {
        try {
            if (typeof settingsPageController !== 'undefined' && settingsPageController.updateSyncHistory) {
                settingsPageController.updateSyncHistory();
                this.errorHandler.showSuccess('同期履歴を更新しました');
            }
        } catch (error) {
            console.error('Failed to refresh history:', error);
            this.errorHandler.handleAPIError(error, { operation: 'refreshHistory' });
        }
    }
    
    /**
     * 同期履歴のクリアを処理
     */
    handleClearHistory() {
        // 確認ダイアログを表示
        if (typeof settingsPageController !== 'undefined' && settingsPageController.showConfirmDialog) {
            settingsPageController.showConfirmDialog(
                '履歴のクリア',
                'すべての同期履歴を削除しますか？この操作は取り消せません。',
                () => this.executeClearHistory()
            );
        } else {
            // フォールバック: 直接確認
            if (confirm('すべての同期履歴を削除しますか？この操作は取り消せません。')) {
                this.executeClearHistory();
            }
        }
    }
    
    /**
     * 同期履歴クリアを実行
     */
    executeClearHistory() {
        try {
            this.settingsManager.clearSyncHistory();
            this.errorHandler.showSuccess('同期履歴をクリアしました');
            
            // 設定ページコントローラーのUIを更新
            if (typeof settingsPageController !== 'undefined' && settingsPageController.updateSyncHistory) {
                settingsPageController.updateSyncHistory();
            }
            
        } catch (error) {
            console.error('Failed to clear history:', error);
            this.errorHandler.handleAPIError(error, { operation: 'clearHistory' });
        }
    }
    
    /**
     * プロジェクト詳細ページのイベントハンドラーを設定
     */
    setupProjectDetailHandlers() {
        // プロジェクト詳細ページでない場合はスキップ
        if (!this.isProjectDetailPage()) return;
        
        // 手動同期ボタン
        const manualSyncBtn = document.getElementById('manual-sync-btn');
        if (manualSyncBtn) {
            // 既存のイベントリスナーを削除して新しいものを追加
            const newBtn = manualSyncBtn.cloneNode(true);
            manualSyncBtn.parentNode.replaceChild(newBtn, manualSyncBtn);
            
            newBtn.addEventListener('click', () => {
                const projectId = this.getCurrentProjectId();
                if (projectId) {
                    this.handleManualSync(projectId);
                }
            });
        }
        
        // GitHubリポジトリ削除ボタン
        const removeRepoBtn = document.getElementById('remove-github-repo-btn');
        if (removeRepoBtn) {
            const newBtn = removeRepoBtn.cloneNode(true);
            removeRepoBtn.parentNode.replaceChild(newBtn, removeRepoBtn);
            
            newBtn.addEventListener('click', () => {
                const projectId = this.getCurrentProjectId();
                if (projectId) {
                    this.handleRemoveRepository(projectId);
                }
            });
        }
        
        console.log('Project detail handlers initialized');
    }
    
    /**
     * 手動同期を処理
     * @param {string} projectId - プロジェクトID
     */
    async handleManualSync(projectId) {
        try {
            // 既存のhandleManualSync関数を呼び出し
            if (typeof handleManualSync === 'function') {
                await handleManualSync(projectId);
            } else {
                this.errorHandler.showGenericError('手動同期機能が利用できません');
            }
        } catch (error) {
            console.error('Manual sync failed:', error);
            this.errorHandler.handleAPIError(error, { 
                operation: 'manualSync',
                projectId: projectId 
            });
        }
    }
    
    /**
     * リポジトリ削除を処理
     * @param {string} projectId - プロジェクトID
     */
    handleRemoveRepository(projectId) {
        try {
            // 既存のhandleRemoveGitHubRepository関数を呼び出し
            if (typeof handleRemoveGitHubRepository === 'function') {
                handleRemoveGitHubRepository(projectId);
            } else {
                this.errorHandler.showGenericError('リポジトリ削除機能が利用できません');
            }
        } catch (error) {
            console.error('Remove repository failed:', error);
            this.errorHandler.handleAPIError(error, { 
                operation: 'removeRepository',
                projectId: projectId 
            });
        }
    }
    
    /**
     * 自動同期のイベントハンドラーを設定
     */
    setupAutoSyncHandlers() {
        // 自動同期の開始/停止イベントをリスニング
        window.addEventListener('autoSyncStarted', (event) => {
            this.handleAutoSyncStarted(event.detail);
        });
        
        window.addEventListener('autoSyncStopped', (event) => {
            this.handleAutoSyncStopped(event.detail);
        });
        
        window.addEventListener('autoSyncCompleted', (event) => {
            this.handleAutoSyncCompleted(event.detail);
        });
        
        window.addEventListener('autoSyncError', (event) => {
            this.handleAutoSyncError(event.detail);
        });
    }
    
    /**
     * 自動同期開始を処理
     * @param {Object} detail - イベント詳細
     */
    handleAutoSyncStarted(detail) {
        console.log('Auto sync started:', detail);
        this.errorHandler.showInfo('自動同期を開始しました');
    }
    
    /**
     * 自動同期停止を処理
     * @param {Object} detail - イベント詳細
     */
    handleAutoSyncStopped(detail) {
        console.log('Auto sync stopped:', detail);
        this.errorHandler.showInfo('自動同期を停止しました');
    }
    
    /**
     * 自動同期完了を処理
     * @param {Object} detail - イベント詳細
     */
    handleAutoSyncCompleted(detail) {
        console.log('Auto sync completed:', detail);
        
        if (detail.newCIResults > 0) {
            this.errorHandler.showSuccess(
                `自動同期完了: ${detail.newCIResults}件の新しいCI結果を取得しました`
            );
            
            // 現在のページがプロジェクト詳細ページの場合、表示を更新
            if (this.isProjectDetailPage()) {
                const currentProjectId = this.getCurrentProjectId();
                if (currentProjectId === detail.projectId) {
                    // CI結果タブを再読み込み
                    if (typeof loadCIResultsTab === 'function') {
                        loadCIResultsTab(currentProjectId);
                    }
                }
            }
        }
    }
    
    /**
     * 自動同期エラーを処理
     * @param {Object} detail - イベント詳細
     */
    handleAutoSyncError(detail) {
        console.error('Auto sync error:', detail);
        
        // エラーハンドラーで処理
        if (detail.error) {
            this.errorHandler.handleAPIError(detail.error, {
                operation: 'autoSync',
                projectId: detail.projectId
            });
        }
    }
    
    /**
     * グローバルイベントリスナーを設定
     */
    setupGlobalEventListeners() {
        // レート制限状態変更イベント
        window.addEventListener('rateLimitStatusChanged', (event) => {
            this.handleRateLimitStatusChanged(event.detail);
        });
        
        // ネットワーク状態変更イベント
        window.addEventListener('online', () => {
            this.errorHandler.showSuccess('ネットワーク接続が復旧しました');
        });
        
        window.addEventListener('offline', () => {
            this.errorHandler.showInfo('オフラインモード: 手動入力のみ利用可能');
        });
    }
    
    /**
     * レート制限状態変更を処理
     * @param {Object} detail - イベント詳細
     */
    handleRateLimitStatusChanged(detail) {
        const { isLimited, resetTime, type } = detail;
        
        if (isLimited) {
            this.errorHandler.showRateLimitWarning(resetTime);
        } else if (type === 'reset') {
            this.errorHandler.showSuccess('レート制限が解除されました');
        }
    }
    
    /**
     * 現在のページが設定ページかどうかを判定
     * @returns {boolean} 設定ページかどうか
     */
    isSettingsPage() {
        return document.body.classList.contains('settings-page') || 
               document.title.includes('設定') ||
               window.location.pathname.includes('settings.html');
    }
    
    /**
     * 現在のページがプロジェクト詳細ページかどうかを判定
     * @returns {boolean} プロジェクト詳細ページかどうか
     */
    isProjectDetailPage() {
        return document.body.classList.contains('project-detail-page') || 
               document.title.includes('プロジェクト詳細') ||
               window.location.pathname.includes('project-detail.html');
    }
    
    /**
     * 現在のプロジェクトIDを取得
     * @returns {string|null} プロジェクトID
     */
    getCurrentProjectId() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('id');
    }
}

// グローバルインスタンス
let githubUIController = null;

/**
 * GitHub UIコントローラーを初期化
 */
function initializeGitHubUIController() {
    if (!githubUIController) {
        githubUIController = new GitHubUIController();
    }
    githubUIController.initialize();
}

// ページ読み込み時に初期化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        // GitHub統合機能の初期化を待ってから実行
        setTimeout(initializeGitHubUIController, 500);
    });
    
    // グローバルに公開
    window.GitHubUIController = GitHubUIController;
    window.githubUIController = githubUIController;
}
