/**
 * エラー回復とネットワーク管理
 * 指数バックオフ再試行、部分的同期失敗処理、ネットワーク状態監視を提供
 */

/**
 * エラー回復管理クラス
 * 指数バックオフ再試行、部分的同期失敗処理、ネットワーク状態監視を提供
 */
class ErrorRecoveryManager {
    /**
     * 指数バックオフによる再試行実行
     * @param {Function} fn - 実行する非同期関数
     * @param {Object} options - 再試行オプション
     * @param {number} options.maxRetries - 最大再試行回数（デフォルト: 3）
     * @param {number} options.baseDelay - 基本遅延時間（ミリ秒、デフォルト: 1000）
     * @param {number} options.maxDelay - 最大遅延時間（ミリ秒、デフォルト: 30000）
     * @param {Function} options.shouldRetry - 再試行判定関数
     * @returns {Promise<any>} 実行結果
     */
    static async retryWithBackoff(fn, options = {}) {
        const {
            maxRetries = 3,
            baseDelay = 1000,
            maxDelay = 30000,
            shouldRetry = (error) => this.isRetryableError(error)
        } = options;
        
        let lastError;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error;
                
                // 再試行不可能なエラーの場合は即座に失敗
                if (!shouldRetry(error)) {
                    throw error;
                }
                
                // 最後の試行の場合は再試行しない
                if (attempt === maxRetries - 1) {
                    break;
                }
                
                // 指数バックオフで待機
                const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
                console.log(`Retrying after ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        throw lastError;
    }
    
    /**
     * 再試行可能なエラーかどうかを判定
     * @param {Error} error - エラーオブジェクト
     * @returns {boolean} 再試行可能かどうか
     */
    static isRetryableError(error) {
        // ネットワークエラー
        if (error instanceof TypeError && error.message.includes('fetch')) {
            return true;
        }
        
        // GitHub APIエラー
        if (error.name === 'GitHubAPIError') {
            // レート制限エラーは再試行可能
            if (error.status === 403 && error.details.includes('rate limit')) {
                return true;
            }
            
            // サーバーエラーは再試行可能
            if (error.status >= 500) {
                return true;
            }
            
            // 一時的なサービス利用不可
            if (error.status === 503) {
                return true;
            }
            
            // 認証エラーやリソースが見つからない場合は再試行不可
            if (error.status === 401 || error.status === 404) {
                return false;
            }
        }
        
        // AbortErrorは再試行不可（ユーザーによるキャンセル）
        if (error.name === 'AbortError') {
            return false;
        }
        
        // その他のネットワーク関連エラーは再試行可能
        if (error.message.includes('network') || 
            error.message.includes('timeout') ||
            error.message.includes('connection')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 部分的な同期失敗の処理
     * @param {string} projectId - プロジェクトID
     * @param {Array} successfulResults - 成功したCI結果
     * @param {Array} errors - エラー配列
     */
    static async handlePartialSyncFailure(projectId, successfulResults, errors) {
        try {
            // 成功した結果を保存
            if (successfulResults.length > 0) {
                const dataManager = new DataManager();
                for (const result of successfulResults) {
                    dataManager.createCIResult(projectId, result);
                }
                console.log(`Saved ${successfulResults.length} successful CI results for project ${projectId}`);
            }
            
            // エラーを記録
            const syncRecord = {
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString(),
                projectId: projectId,
                projectName: await this.getProjectName(projectId),
                status: successfulResults.length > 0 ? 'partial' : 'failure',
                newCIResults: successfulResults.length,
                updatedCIResults: 0,
                errors: errors.map(e => e.message || e.toString()),
                repositoryUrl: await this.getRepositoryUrl(projectId),
                workflowRunsProcessed: successfulResults.length,
                apiRequestsUsed: this.estimateAPIRequests(successfulResults.length),
                durationMs: 0 // 実際の実装では測定
            };
            
            // 同期履歴に記録
            if (typeof GitHubSettingsManager !== 'undefined') {
                const settingsManager = new GitHubSettingsManager();
                settingsManager.addSyncRecord(syncRecord);
            }
            
            console.log(`Recorded sync failure for project ${projectId}:`, syncRecord);
        } catch (error) {
            console.error('Failed to handle partial sync failure:', error);
        }
    }
    
    /**
     * ネットワーク状態の監視を開始
     */
    static monitorNetworkStatus() {
        // オンライン復旧時の処理
        window.addEventListener('online', () => {
            console.log('Network connection restored');
            this.handleNetworkRestore();
        });
        
        // オフライン時の処理
        window.addEventListener('offline', () => {
            console.log('Network connection lost');
            this.handleNetworkLoss();
        });
        
        // 初期状態をチェック
        if (!navigator.onLine) {
            this.handleNetworkLoss();
        }
    }
    
    /**
     * ネットワーク復旧時の処理
     */
    static handleNetworkRestore() {
        // 自動同期の再開
        if (typeof AutoSyncScheduler !== 'undefined') {
            const scheduler = AutoSyncScheduler.getInstance();
            if (scheduler && scheduler.wasRunningBeforeOffline && scheduler.wasRunningBeforeOffline()) {
                scheduler.resume();
                console.log('Auto sync resumed after network restore');
            }
        }
        
        // UI状態の更新
        this.updateNetworkStatusUI(true);
    }
    
    /**
     * ネットワーク切断時の処理
     */
    static handleNetworkLoss() {
        // 自動同期の一時停止
        if (typeof AutoSyncScheduler !== 'undefined') {
            const scheduler = AutoSyncScheduler.getInstance();
            if (scheduler && scheduler.pauseForOffline) {
                scheduler.pauseForOffline();
                console.log('Auto sync paused due to network loss');
            }
        }
        
        // UI状態の更新
        this.updateNetworkStatusUI(false);
    }
    
    /**
     * ネットワーク状態UIの更新
     * @param {boolean} isOnline - オンライン状態
     */
    static updateNetworkStatusUI(isOnline) {
        // ネットワーク状態インジケーターの更新
        const indicators = document.querySelectorAll('.network-status-indicator');
        indicators.forEach(indicator => {
            indicator.textContent = isOnline ? 'オンライン' : 'オフライン';
            indicator.className = `network-status-indicator ${isOnline ? 'online' : 'offline'}`;
        });
        
        // 同期ボタンの有効/無効切り替え
        const syncButtons = document.querySelectorAll('.sync-button, .manual-sync-button');
        syncButtons.forEach(button => {
            button.disabled = !isOnline;
            if (!isOnline) {
                button.title = 'ネットワーク接続が必要です';
            } else {
                button.title = '';
            }
        });
        
        // オフライン時の通知表示
        if (!isOnline) {
            this.showOfflineNotification();
        } else {
            this.hideOfflineNotification();
        }
    }
    
    /**
     * オフライン通知の表示
     */
    static showOfflineNotification() {
        // 既存の通知を削除
        this.hideOfflineNotification();
        
        const notification = document.createElement('div');
        notification.id = 'offline-notification';
        notification.className = 'offline-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">⚠️</span>
                <span class="notification-text">オフラインモード: 手動入力のみ利用可能</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
    }
    
    /**
     * オフライン通知の非表示
     */
    static hideOfflineNotification() {
        const notification = document.getElementById('offline-notification');
        if (notification) {
            notification.remove();
        }
    }
    
    /**
     * レート制限エラーの特別処理
     * @param {GitHubAPIError} error - レート制限エラー
     */
    static async handleRateLimitError(error) {
        if (error.name === 'GitHubAPIError' && error.status === 403 && error.details.includes('rate limit')) {
            try {
                // レート制限情報を取得
                let resetTime = new Date(Date.now() + 60 * 60 * 1000); // デフォルト1時間後
                
                if (typeof RateLimitManager !== 'undefined') {
                    const rateLimitManager = RateLimitManager.getInstance();
                    if (rateLimitManager && rateLimitManager.getResetTime) {
                        resetTime = await rateLimitManager.getResetTime();
                    }
                }
                
                // ユーザーに通知
                if (typeof GitHubErrorHandler !== 'undefined') {
                    const errorHandler = new GitHubErrorHandler();
                    if (errorHandler.showRateLimitWarning) {
                        errorHandler.showRateLimitWarning(resetTime);
                    }
                }
                
                // 自動同期を一時停止
                if (typeof AutoSyncScheduler !== 'undefined') {
                    const scheduler = AutoSyncScheduler.getInstance();
                    if (scheduler && scheduler.pauseUntil) {
                        scheduler.pauseUntil(resetTime);
                    }
                }
                
                console.log(`Rate limit reached. Paused until ${resetTime.toISOString()}`);
            } catch (handlingError) {
                console.error('Failed to handle rate limit error:', handlingError);
            }
        }
    }
    
    /**
     * プロジェクト名を取得
     * @param {string} projectId - プロジェクトID
     * @returns {Promise<string>} プロジェクト名
     */
    static async getProjectName(projectId) {
        try {
            const dataManager = new DataManager();
            const project = dataManager.getProjectById(projectId);
            return project?.name || 'Unknown Project';
        } catch (error) {
            console.error('Failed to get project name:', error);
            return 'Unknown Project';
        }
    }
    
    /**
     * リポジトリURLを取得
     * @param {string} projectId - プロジェクトID
     * @returns {Promise<string>} リポジトリURL
     */
    static async getRepositoryUrl(projectId) {
        try {
            const dataManager = new DataManager();
            const project = dataManager.getProjectById(projectId);
            return project?.githubRepository?.url || '';
        } catch (error) {
            console.error('Failed to get repository URL:', error);
            return '';
        }
    }
    
    /**
     * API使用量を推定
     * @param {number} resultCount - 結果数
     * @returns {number} 推定API使用量
     */
    static estimateAPIRequests(resultCount) {
        // ワークフロー一覧取得 + 各ワークフローのジョブ取得 + ログ取得
        return 1 + resultCount * 2;
    }
    
    /**
     * 現在のネットワーク状態を取得
     * @returns {boolean} オンライン状態
     */
    static isOnline() {
        return navigator.onLine;
    }
    
    /**
     * ネットワーク接続をテスト
     * @returns {Promise<boolean>} 接続可能かどうか
     */
    static async testNetworkConnection() {
        try {
            // GitHub APIへの軽量なリクエストでテスト
            const response = await fetch('https://api.github.com/rate_limit', {
                method: 'HEAD',
                cache: 'no-cache'
            });
            return response.ok;
        } catch (error) {
            console.log('Network connection test failed:', error.message);
            return false;
        }
    }
}

// ページ読み込み時にネットワーク監視を開始
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        ErrorRecoveryManager.monitorNetworkStatus();
    });
}