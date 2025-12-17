/**
 * ネットワーク状態監視とオフライン対応
 * より詳細なネットワーク状態管理とオフライン時の機能制限を提供
 */

/**
 * ネットワーク状態監視クラス
 * オンライン/オフライン状態の詳細な監視とオフライン時の機能制限を管理
 */
class NetworkMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.connectionQuality = 'unknown';
        this.lastOnlineTime = this.isOnline ? new Date() : null;
        this.lastOfflineTime = this.isOnline ? null : new Date();
        this.offlineQueue = [];
        this.listeners = [];
        this.connectionTestInterval = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        
        this.initializeMonitoring();
    }
    
    /**
     * ネットワーク監視を初期化
     */
    initializeMonitoring() {
        // ブラウザのオンライン/オフラインイベントを監視
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
        
        // 定期的な接続品質チェック
        this.startConnectionQualityMonitoring();
        
        // 初期状態の設定
        this.updateConnectionStatus();
        
        console.log('NetworkMonitor initialized');
    }
    
    /**
     * オンライン状態になった時の処理
     */
    async handleOnline() {
        console.log('Network: Online event detected');
        
        // 実際の接続をテスト
        const isReallyOnline = await this.testConnection();
        
        if (isReallyOnline) {
            this.isOnline = true;
            this.lastOnlineTime = new Date();
            this.reconnectAttempts = 0;
            
            // UI状態を更新
            this.updateConnectionStatus();
            
            // オフラインキューを処理
            await this.processOfflineQueue();
            
            // 自動同期を再開
            this.resumeAutoSync();
            
            // リスナーに通知
            this.notifyListeners('online');
            
            // 成功メッセージを表示
            this.showConnectionMessage('ネットワーク接続が復旧しました', 'success');
        } else {
            // 偽のオンラインイベントの場合
            console.warn('False online event detected');
            this.scheduleReconnectAttempt();
        }
    }
    
    /**
     * オフライン状態になった時の処理
     */
    handleOffline() {
        console.log('Network: Offline event detected');
        
        this.isOnline = false;
        this.lastOfflineTime = new Date();
        this.connectionQuality = 'offline';
        
        // UI状態を更新
        this.updateConnectionStatus();
        
        // 自動同期を一時停止
        this.pauseAutoSync();
        
        // 手動モードに切り替え
        this.switchToManualMode();
        
        // リスナーに通知
        this.notifyListeners('offline');
        
        // オフライン通知を表示
        this.showOfflineNotification();
        
        // 再接続試行をスケジュール
        this.scheduleReconnectAttempt();
    }
    
    /**
     * 接続品質の監視を開始
     */
    startConnectionQualityMonitoring() {
        // 30秒ごとに接続品質をチェック
        this.connectionTestInterval = setInterval(async () => {
            if (this.isOnline) {
                await this.checkConnectionQuality();
            }
        }, 30000);
    }
    
    /**
     * 接続品質をチェック
     */
    async checkConnectionQuality() {
        try {
            const startTime = performance.now();
            
            // GitHub APIへの軽量リクエストで品質測定
            const response = await fetch('https://api.github.com/rate_limit', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: AbortSignal.timeout(10000) // 10秒タイムアウト
            });
            
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            
            if (response.ok) {
                // レスポンス時間に基づいて品質を判定
                if (responseTime < 1000) {
                    this.connectionQuality = 'excellent';
                } else if (responseTime < 3000) {
                    this.connectionQuality = 'good';
                } else if (responseTime < 5000) {
                    this.connectionQuality = 'fair';
                } else {
                    this.connectionQuality = 'poor';
                }
                
                console.log(`Connection quality: ${this.connectionQuality} (${responseTime.toFixed(0)}ms)`);
            } else {
                this.connectionQuality = 'poor';
            }
        } catch (error) {
            console.log('Connection quality check failed:', error.message);
            this.connectionQuality = 'poor';
            
            // 接続エラーが続く場合はオフライン状態に移行
            if (this.isOnline) {
                this.handleOffline();
            }
        }
        
        // UI更新
        this.updateConnectionStatus();
    }
    
    /**
     * 実際の接続をテスト
     * @returns {Promise<boolean>} 接続可能かどうか
     */
    async testConnection() {
        try {
            const response = await fetch('https://api.github.com/rate_limit', {
                method: 'HEAD',
                cache: 'no-cache',
                signal: AbortSignal.timeout(5000)
            });
            return response.ok;
        } catch (error) {
            console.log('Connection test failed:', error.message);
            return false;
        }
    }
    
    /**
     * 再接続試行をスケジュール
     */
    scheduleReconnectAttempt() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnect attempts reached');
            return;
        }
        
        const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // 最大30秒
        this.reconnectAttempts++;
        
        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        
        setTimeout(async () => {
            if (!this.isOnline) {
                console.log(`Reconnect attempt ${this.reconnectAttempts}`);
                const isConnected = await this.testConnection();
                
                if (isConnected) {
                    this.handleOnline();
                } else {
                    this.scheduleReconnectAttempt();
                }
            }
        }, delay);
    }
    
    /**
     * 接続状態UIを更新
     */
    updateConnectionStatus() {
        // ネットワーク状態インジケーターを更新
        const indicators = document.querySelectorAll('.network-status-indicator');
        indicators.forEach(indicator => {
            if (this.isOnline) {
                indicator.textContent = `オンライン (${this.connectionQuality})`;
                indicator.className = `network-status-indicator online ${this.connectionQuality}`;
            } else {
                indicator.textContent = 'オフライン';
                indicator.className = 'network-status-indicator offline';
            }
        });
        
        // 同期関連ボタンの状態を更新
        this.updateSyncButtonStates();
        
        // 接続品質に応じた警告表示
        if (this.isOnline && this.connectionQuality === 'poor') {
            this.showConnectionMessage('接続が不安定です。同期に時間がかかる場合があります。', 'warning');
        }
    }
    
    /**
     * 同期ボタンの状態を更新
     */
    updateSyncButtonStates() {
        const syncButtons = document.querySelectorAll('.sync-button, .manual-sync-button');
        syncButtons.forEach(button => {
            button.disabled = !this.isOnline;
            
            if (!this.isOnline) {
                button.title = 'ネットワーク接続が必要です';
                button.classList.add('disabled-offline');
            } else {
                button.title = '';
                button.classList.remove('disabled-offline');
                
                if (this.connectionQuality === 'poor') {
                    button.title = '接続が不安定です';
                }
            }
        });
        
        // 自動同期設定の無効化
        const autoSyncToggles = document.querySelectorAll('.auto-sync-toggle');
        autoSyncToggles.forEach(toggle => {
            if (!this.isOnline) {
                toggle.disabled = true;
                toggle.title = 'オンライン時のみ利用可能';
            } else {
                toggle.disabled = false;
                toggle.title = '';
            }
        });
    }
    
    /**
     * 手動モードに切り替え
     */
    switchToManualMode() {
        console.log('Switching to manual mode');
        
        // 自動同期を無効化
        this.pauseAutoSync();
        
        // 手動入力モードの表示
        const manualModeIndicators = document.querySelectorAll('.manual-mode-indicator');
        manualModeIndicators.forEach(indicator => {
            indicator.style.display = 'block';
            indicator.textContent = '手動入力モード (オフライン)';
        });
        
        // GitHub統合機能を無効化
        const githubFeatures = document.querySelectorAll('.github-feature');
        githubFeatures.forEach(feature => {
            feature.classList.add('disabled-offline');
        });
    }
    
    /**
     * オンラインモードに復帰
     */
    switchToOnlineMode() {
        console.log('Switching to online mode');
        
        // 手動入力モードの非表示
        const manualModeIndicators = document.querySelectorAll('.manual-mode-indicator');
        manualModeIndicators.forEach(indicator => {
            indicator.style.display = 'none';
        });
        
        // GitHub統合機能を有効化
        const githubFeatures = document.querySelectorAll('.github-feature');
        githubFeatures.forEach(feature => {
            feature.classList.remove('disabled-offline');
        });
    }
    
    /**
     * 自動同期を一時停止
     */
    pauseAutoSync() {
        if (typeof AutoSyncScheduler !== 'undefined') {
            const scheduler = AutoSyncScheduler.getInstance();
            if (scheduler && scheduler.pauseForOffline) {
                scheduler.pauseForOffline();
                console.log('Auto sync paused due to network loss');
            }
        }
    }
    
    /**
     * 自動同期を再開
     */
    resumeAutoSync() {
        if (typeof AutoSyncScheduler !== 'undefined') {
            const scheduler = AutoSyncScheduler.getInstance();
            if (scheduler && scheduler.resume) {
                scheduler.resume();
                console.log('Auto sync resumed after network restore');
            }
        }
        
        // オンラインモードに復帰
        this.switchToOnlineMode();
    }
    
    /**
     * オフラインキューを処理
     */
    async processOfflineQueue() {
        if (this.offlineQueue.length === 0) {
            return;
        }
        
        console.log(`Processing ${this.offlineQueue.length} queued operations`);
        
        const processedItems = [];
        
        for (const item of this.offlineQueue) {
            try {
                await item.operation();
                processedItems.push(item);
                console.log(`Processed queued operation: ${item.description}`);
            } catch (error) {
                console.error(`Failed to process queued operation: ${item.description}`, error);
                // 失敗した操作はキューに残す
            }
        }
        
        // 処理済みの操作をキューから削除
        this.offlineQueue = this.offlineQueue.filter(item => !processedItems.includes(item));
        
        if (processedItems.length > 0) {
            this.showConnectionMessage(`${processedItems.length}件の保留操作を処理しました`, 'success');
        }
    }
    
    /**
     * 操作をオフラインキューに追加
     * @param {Function} operation - 実行する操作
     * @param {string} description - 操作の説明
     */
    queueOperation(operation, description) {
        this.offlineQueue.push({
            operation,
            description,
            timestamp: new Date()
        });
        
        console.log(`Queued operation: ${description}`);
        this.showConnectionMessage('操作を保留しました。接続復旧時に実行されます。', 'info');
    }
    
    /**
     * オフライン通知を表示
     */
    showOfflineNotification() {
        ErrorRecoveryManager.showOfflineNotification();
    }
    
    /**
     * 接続メッセージを表示
     * @param {string} message - メッセージ
     * @param {string} type - メッセージタイプ (success, warning, error, info)
     */
    showConnectionMessage(message, type = 'info') {
        // 既存の接続メッセージを削除
        const existingMessage = document.getElementById('connection-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.id = 'connection-message';
        messageElement.className = `connection-message ${type}`;
        messageElement.innerHTML = `
            <div class="message-content">
                <span class="message-text">${message}</span>
                <button class="message-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;
        
        document.body.appendChild(messageElement);
        
        // 5秒後に自動削除（エラーメッセージは除く）
        if (type !== 'error') {
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.remove();
                }
            }, 5000);
        }
    }
    
    /**
     * ネットワーク状態変更リスナーを追加
     * @param {Function} listener - リスナー関数
     */
    addListener(listener) {
        this.listeners.push(listener);
    }
    
    /**
     * ネットワーク状態変更リスナーを削除
     * @param {Function} listener - リスナー関数
     */
    removeListener(listener) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }
    
    /**
     * リスナーに通知
     * @param {string} event - イベントタイプ
     */
    notifyListeners(event) {
        this.listeners.forEach(listener => {
            try {
                listener(event, {
                    isOnline: this.isOnline,
                    connectionQuality: this.connectionQuality,
                    lastOnlineTime: this.lastOnlineTime,
                    lastOfflineTime: this.lastOfflineTime
                });
            } catch (error) {
                console.error('Error in network listener:', error);
            }
        });
    }
    
    /**
     * 現在のネットワーク状態を取得
     * @returns {Object} ネットワーク状態情報
     */
    getStatus() {
        return {
            isOnline: this.isOnline,
            connectionQuality: this.connectionQuality,
            lastOnlineTime: this.lastOnlineTime,
            lastOfflineTime: this.lastOfflineTime,
            queuedOperations: this.offlineQueue.length,
            reconnectAttempts: this.reconnectAttempts
        };
    }
    
    /**
     * 監視を停止
     */
    destroy() {
        if (this.connectionTestInterval) {
            clearInterval(this.connectionTestInterval);
        }
        
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        
        this.listeners = [];
        console.log('NetworkMonitor destroyed');
    }
}

// シングルトンインスタンス
let networkMonitorInstance = null;

/**
 * NetworkMonitorのシングルトンインスタンスを取得
 * @returns {NetworkMonitor} NetworkMonitorインスタンス
 */
function getNetworkMonitor() {
    if (!networkMonitorInstance) {
        networkMonitorInstance = new NetworkMonitor();
    }
    return networkMonitorInstance;
}

// ページ読み込み時に自動初期化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        getNetworkMonitor();
    });
}