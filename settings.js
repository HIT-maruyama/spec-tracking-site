// 設定ページ専用JavaScript

// ========================================
// 設定ページコントローラー
// ========================================

/**
 * 設定ページのUI制御を行うクラス
 */
class SettingsPageController {
    constructor() {
        this.settingsManager = null;
        this.githubClient = null;
        this.isInitialized = false;
    }

    /**
     * 設定ページを初期化
     */
    async initialize() {
        if (this.isInitialized) return;

        // GitHub統合機能が初期化されるまで待機
        if (typeof githubSettingsManager === 'undefined' || typeof githubClient === 'undefined') {
            setTimeout(() => this.initialize(), 100);
            return;
        }

        this.settingsManager = githubSettingsManager;
        this.githubClient = githubClient;

        this.setupEventListeners();
        await this.loadCurrentSettings();
        await this.updateRateLimitInfo();
        this.updateSyncHistory();

        // CI/CDサービス選択UIを初期化
        this.initializeServiceSelector();

        // レート制限状態変更イベントのリスナーを設定
        window.addEventListener('rateLimitStatusChanged', (event) => {
            this.handleRateLimitStatusChange(event.detail);
        });

        this.isInitialized = true;
        console.log('Settings page initialized');
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // Personal Access Token関連
        const tokenInput = document.getElementById('github-token');
        const testConnectionBtn = document.getElementById('test-connection-btn');
        const saveTokenBtn = document.getElementById('save-token-btn');
        const deleteTokenBtn = document.getElementById('delete-token-btn');

        if (tokenInput) {
            tokenInput.addEventListener('input', () => this.onTokenInputChange());
        }

        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.testConnection());
        }

        if (saveTokenBtn) {
            saveTokenBtn.addEventListener('click', () => this.saveToken());
        }

        if (deleteTokenBtn) {
            deleteTokenBtn.addEventListener('click', () => this.deleteToken());
        }

        // 自動同期設定関連
        const autoSyncEnabled = document.getElementById('auto-sync-enabled');
        const syncInterval = document.getElementById('sync-interval');

        if (autoSyncEnabled) {
            autoSyncEnabled.addEventListener('change', () => this.onAutoSyncToggle());
        }

        if (syncInterval) {
            syncInterval.addEventListener('change', () => this.onSyncIntervalChange());
        }

        // API使用状況関連
        const refreshRateLimitBtn = document.getElementById('refresh-rate-limit-btn');
        if (refreshRateLimitBtn) {
            refreshRateLimitBtn.addEventListener('click', () => this.updateRateLimitInfo());
        }

        // 同期履歴関連
        const refreshHistoryBtn = document.getElementById('refresh-history-btn');
        const clearHistoryBtn = document.getElementById('clear-history-btn');

        if (refreshHistoryBtn) {
            refreshHistoryBtn.addEventListener('click', () => this.updateSyncHistory());
        }

        if (clearHistoryBtn) {
            clearHistoryBtn.addEventListener('click', () => this.clearSyncHistory());
        }

        // 確認ダイアログ関連
        const confirmDialogCancel = document.getElementById('confirm-dialog-cancel');
        const confirmDialogConfirm = document.getElementById('confirm-dialog-confirm');

        if (confirmDialogCancel) {
            confirmDialogCancel.addEventListener('click', () => this.hideConfirmDialog());
        }

        if (confirmDialogConfirm) {
            confirmDialogConfirm.addEventListener('click', () => this.executeConfirmedAction());
        }
    }

    /**
     * 現在の設定を読み込んでUIに反映
     */
    async loadCurrentSettings() {
        try {
            const settings = this.settingsManager.getSettings();

            // Personal Access Tokenの状態を確認
            const hasToken = await this.settingsManager.getAccessToken() !== null;
            this.updateTokenUI(hasToken);

            // 自動同期設定を反映
            const autoSyncEnabled = document.getElementById('auto-sync-enabled');
            const syncInterval = document.getElementById('sync-interval');
            const syncIntervalGroup = document.getElementById('sync-interval-group');

            if (autoSyncEnabled) {
                autoSyncEnabled.checked = settings.autoSyncEnabled;
            }

            if (syncInterval) {
                syncInterval.value = settings.autoSyncInterval.toString();
            }

            if (syncIntervalGroup) {
                syncIntervalGroup.style.display = settings.autoSyncEnabled ? 'block' : 'none';
            }

            this.updateSyncStatus(settings);

        } catch (error) {
            console.error('Failed to load current settings:', error);
            this.showMessage('設定の読み込みに失敗しました', 'error');
        }
    }

    /**
     * トークン入力フィールドの変更を処理
     */
    onTokenInputChange() {
        const tokenInput = document.getElementById('github-token');
        const testConnectionBtn = document.getElementById('test-connection-btn');
        const saveTokenBtn = document.getElementById('save-token-btn');

        const hasValue = tokenInput && tokenInput.value.trim() !== '';

        if (testConnectionBtn) {
            testConnectionBtn.disabled = !hasValue;
        }

        if (saveTokenBtn) {
            saveTokenBtn.disabled = !hasValue;
        }

        // 接続状態をクリア
        this.clearConnectionStatus();
    }

    /**
     * GitHub API接続テストを実行
     */
    async testConnection() {
        const tokenInput = document.getElementById('github-token');
        const testConnectionBtn = document.getElementById('test-connection-btn');

        if (!tokenInput || !tokenInput.value.trim()) {
            this.showMessage('Personal Access Tokenを入力してください', 'error');
            return;
        }

        try {
            testConnectionBtn.disabled = true;
            testConnectionBtn.textContent = 'テスト中...';

            // 一時的にトークンを設定してテスト
            this.githubClient.setAccessToken(tokenInput.value.trim());
            const isConnected = await this.githubClient.testConnection();

            this.showConnectionStatus(isConnected);

            if (isConnected) {
                // レート制限情報も更新
                await this.updateRateLimitInfo();
            }

        } catch (error) {
            console.error('Connection test failed:', error);
            this.showConnectionStatus(false, error.message);
        } finally {
            testConnectionBtn.disabled = false;
            testConnectionBtn.textContent = '接続テスト';
        }
    }

    /**
     * Personal Access Tokenを保存
     */
    async saveToken() {
        const tokenInput = document.getElementById('github-token');

        if (!tokenInput || !tokenInput.value.trim()) {
            this.showMessage('Personal Access Tokenを入力してください', 'error');
            return;
        }

        try {
            const token = tokenInput.value.trim();

            // まず接続テストを実行
            this.githubClient.setAccessToken(token);
            const isConnected = await this.githubClient.testConnection();

            if (!isConnected) {
                this.showMessage('無効なトークンです。接続テストを実行してください', 'error');
                return;
            }

            // トークンを暗号化して保存
            await this.settingsManager.setAccessToken(token);

            // UIを更新
            tokenInput.value = '';
            this.updateTokenUI(true);
            this.showMessage('Personal Access Tokenを保存しました', 'success');

            // レート制限情報を更新
            await this.updateRateLimitInfo();

        } catch (error) {
            console.error('Failed to save token:', error);
            this.showMessage('トークンの保存に失敗しました: ' + error.message, 'error');
        }
    }

    /**
     * Personal Access Tokenを削除
     */
    deleteToken() {
        this.showConfirmDialog(
            'トークンの削除',
            'Personal Access Tokenを削除しますか？この操作は取り消せません。',
            () => this.executeDeleteToken()
        );
    }

    /**
     * トークン削除を実行
     */
    executeDeleteToken() {
        try {
            this.settingsManager.clearAccessToken();
            this.updateTokenUI(false);
            this.clearRateLimitInfo();
            this.showMessage('Personal Access Tokenを削除しました', 'success');
        } catch (error) {
            console.error('Failed to delete token:', error);
            this.showMessage('トークンの削除に失敗しました', 'error');
        }
    }

    /**
     * 自動同期の有効/無効切り替えを処理
     */
    onAutoSyncToggle() {
        const autoSyncEnabled = document.getElementById('auto-sync-enabled');
        const syncIntervalGroup = document.getElementById('sync-interval-group');

        if (!autoSyncEnabled) return;

        const enabled = autoSyncEnabled.checked;

        // 同期間隔設定の表示/非表示を切り替え
        if (syncIntervalGroup) {
            syncIntervalGroup.style.display = enabled ? 'block' : 'none';
        }

        // 設定を保存
        this.settingsManager.setAutoSyncEnabled(enabled);

        // 同期状態を更新
        const settings = this.settingsManager.getSettings();
        this.updateSyncStatus(settings);

        this.showMessage(
            enabled ? '自動同期を有効にしました' : '自動同期を無効にしました',
            'success'
        );
    }

    /**
     * 同期間隔の変更を処理
     */
    onSyncIntervalChange() {
        const syncInterval = document.getElementById('sync-interval');

        if (!syncInterval) return;

        const interval = parseInt(syncInterval.value);
        this.settingsManager.setAutoSyncInterval(interval);

        // 同期状態を更新
        const settings = this.settingsManager.getSettings();
        this.updateSyncStatus(settings);

        this.showMessage(`同期間隔を${interval}分に設定しました`, 'success');
    }

    /**
     * トークンUIの状態を更新
     * @param {boolean} hasToken - トークンが設定されているかどうか
     */
    updateTokenUI(hasToken) {
        const tokenInput = document.getElementById('github-token');
        const testConnectionBtn = document.getElementById('test-connection-btn');
        const saveTokenBtn = document.getElementById('save-token-btn');
        const deleteTokenBtn = document.getElementById('delete-token-btn');

        if (hasToken) {
            if (tokenInput) {
                tokenInput.placeholder = '設定済み（暗号化されて保存されています）';
                tokenInput.value = '';
            }
            if (testConnectionBtn) testConnectionBtn.disabled = true;
            if (saveTokenBtn) saveTokenBtn.disabled = true;
            if (deleteTokenBtn) deleteTokenBtn.style.display = 'inline-block';
        } else {
            if (tokenInput) {
                tokenInput.placeholder = 'ghp_xxxxxxxxxxxxxxxxxxxx';
            }
            if (deleteTokenBtn) deleteTokenBtn.style.display = 'none';
        }

        this.clearConnectionStatus();
    }

    /**
     * 接続状態を表示
     * @param {boolean} isConnected - 接続成功かどうか
     * @param {string} [errorMessage] - エラーメッセージ
     */
    showConnectionStatus(isConnected, errorMessage = '') {
        const statusElement = document.getElementById('connection-status');
        if (!statusElement) return;

        statusElement.style.display = 'block';

        if (isConnected) {
            statusElement.className = 'connection-status success';
            statusElement.innerHTML = `
                <div class="status-icon">✓</div>
                <div class="status-message">GitHub APIへの接続に成功しました</div>
            `;
        } else {
            statusElement.className = 'connection-status error';
            statusElement.innerHTML = `
                <div class="status-icon">✗</div>
                <div class="status-message">
                    接続に失敗しました
                    ${errorMessage ? `<br><small>${errorMessage}</small>` : ''}
                </div>
            `;
        }
    }

    /**
     * 接続状態表示をクリア
     */
    clearConnectionStatus() {
        const statusElement = document.getElementById('connection-status');
        if (statusElement) {
            statusElement.style.display = 'none';
        }
    }

    /**
     * 同期状態を更新
     * @param {GitHubSettings} settings - GitHub設定
     */
    updateSyncStatus(settings) {
        const syncStatusContent = document.getElementById('sync-status-content');
        if (!syncStatusContent) return;

        if (settings.autoSyncEnabled) {
            syncStatusContent.innerHTML = `
                <p class="sync-status-active">
                    自動同期が有効です（${settings.autoSyncInterval}分間隔）
                </p>
                ${settings.lastSyncAt ? `
                    <p class="sync-last-time">
                        最終同期: ${formatRelativeTime(settings.lastSyncAt)}
                    </p>
                ` : ''}
            `;
        } else {
            syncStatusContent.innerHTML = '<p>自動同期は無効です</p>';
        }
    }

    /**
     * レート制限情報を更新
     */
    async updateRateLimitInfo() {
        try {
            // トークンが設定されているかチェック
            const token = await this.settingsManager.getAccessToken();
            if (!token) {
                this.clearRateLimitInfo();
                return;
            }

            // GitHub APIからレート制限情報を取得
            this.githubClient.setAccessToken(token);
            const usageStatus = await this.githubClient.getUsageStatus();

            this.displayRateLimitInfo(usageStatus);
            this.updateRateLimitStatus(usageStatus);

        } catch (error) {
            console.error('Failed to update rate limit info:', error);
            this.clearRateLimitInfo();
        }
    }

    /**
     * レート制限情報を表示
     * @param {Object} usageStatus - 使用状況情報
     */
    displayRateLimitInfo(usageStatus) {
        // API使用状況の詳細表示を更新
        if (typeof updateAPIUsageDisplay === 'function') {
            updateAPIUsageDisplay(usageStatus);
        }

        // 個別要素の更新
        const remainingElement = document.getElementById('rate-limit-remaining');
        const limitElement = document.getElementById('rate-limit-limit');
        const resetElement = document.getElementById('rate-limit-reset');
        const percentageElement = document.getElementById('rate-limit-percentage');
        const usedElement = document.getElementById('rate-limit-used');
        const authStatusElement = document.getElementById('auth-status');

        if (remainingElement) {
            remainingElement.textContent = usageStatus.remaining.toLocaleString();
        }

        if (limitElement) {
            limitElement.textContent = usageStatus.limit.toLocaleString();
        }

        if (usedElement) {
            usedElement.textContent = usageStatus.used.toLocaleString();
        }

        if (resetElement) {
            resetElement.textContent = usageStatus.resetTime.toLocaleTimeString('ja-JP');
        }

        if (percentageElement) {
            percentageElement.textContent = Math.round(usageStatus.percentageUsed);
        }

        if (authStatusElement) {
            authStatusElement.textContent = usageStatus.authenticated ? '認証済み' : '未認証';
        }

        // 使用率バーの更新
        const usageFill = document.querySelector('.usage-fill');
        if (usageFill) {
            usageFill.style.width = `${usageStatus.percentageUsed}%`;
            
            // 使用率に応じてクラスを変更
            usageFill.className = 'usage-fill ' + 
                (usageStatus.percentageUsed > 80 ? 'high' : 
                 usageStatus.percentageUsed > 50 ? 'medium' : 'low');
        }
    }

    /**
     * レート制限状態を更新
     * @param {Object} usageStatus - 使用状況情報
     */
    updateRateLimitStatus(usageStatus) {
        const isLimited = usageStatus.remaining === 0;
        const isNearLimit = usageStatus.isNearLimit;

        if (typeof updateRateLimitDisplay === 'function') {
            updateRateLimitDisplay({
                isLimited: isLimited,
                resetTime: usageStatus.resetTime,
                retryAfter: Math.max(0, usageStatus.timeUntilReset / 1000),
                type: 'primary'
            });
        }

        // 制限に近づいている場合の警告表示
        if (isNearLimit && !isLimited) {
            this.showMessage(
                `GitHub APIのレート制限に近づいています。残り${usageStatus.remaining}リクエスト`,
                'warning'
            );
        }
    }

    /**
     * レート制限情報をクリア
     */
    clearRateLimitInfo() {
        const elements = [
            'rate-limit-remaining',
            'rate-limit-limit',
            'rate-limit-reset',
            'rate-limit-percentage',
            'rate-limit-used'
        ];

        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = '-';
            }
        });

        const authStatusElement = document.getElementById('auth-status');
        if (authStatusElement) {
            authStatusElement.textContent = '未認証';
        }

        // 使用率バーをリセット
        const usageFill = document.querySelector('.usage-fill');
        if (usageFill) {
            usageFill.style.width = '0%';
            usageFill.className = 'usage-fill low';
        }

        // レート制限状態表示をリセット
        if (typeof updateRateLimitDisplay === 'function') {
            updateRateLimitDisplay({
                isLimited: false,
                resetTime: new Date(),
                retryAfter: 0,
                type: 'reset'
            });
        }
    }

    /**
     * 同期履歴を更新
     */
    updateSyncHistory() {
        const historyContainer = document.getElementById('sync-history-container');
        if (!historyContainer) return;

        const history = this.settingsManager.getSyncHistory();

        if (history.length === 0) {
            historyContainer.innerHTML = `
                <div class="sync-history-empty">
                    <p>同期履歴がありません</p>
                </div>
            `;
            return;
        }

        const historyHTML = history.map(record => this.createSyncHistoryItem(record)).join('');
        historyContainer.innerHTML = `
            <div class="sync-history-list">
                ${historyHTML}
            </div>
        `;
        
        // 詳細表示ボタンのイベントリスナーを設定
        const detailButtons = historyContainer.querySelectorAll('.view-details-btn');
        detailButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const recordId = button.getAttribute('data-record-id');
                this.showSyncHistoryDetails(recordId);
            });
        });
    }

    /**
     * 同期履歴アイテムのHTMLを生成
     * @param {SyncRecord} record - 同期記録
     * @returns {string} HTML文字列
     */
    createSyncHistoryItem(record) {
        const statusClass = record.status === 'success' ? 'success' : 
                           record.status === 'partial' ? 'warning' : 'error';
        
        const statusText = record.status === 'success' ? '成功' :
                          record.status === 'partial' ? '部分成功' : '失敗';

        return `
            <div class="sync-history-item" data-record-id="${record.id}">
                <div class="sync-history-header">
                    <div class="sync-history-time">
                        ${formatRelativeTime(record.timestamp)}
                    </div>
                    <div class="sync-history-status ${statusClass}">
                        ${statusText}
                    </div>
                </div>
                <div class="sync-history-details">
                    <div class="sync-history-project">
                        ${record.projectName}
                    </div>
                    <div class="sync-history-stats">
                        新規: ${record.newCIResults}件 | 
                        API使用: ${record.apiRequestsUsed}回 |
                        処理時間: ${record.durationMs}ms
                    </div>
                    ${record.errors.length > 0 ? `
                        <div class="sync-history-errors">
                            ${record.errors.map(error => `<div class="error-message">${error}</div>`).join('')}
                        </div>
                    ` : ''}
                    <div class="sync-history-actions">
                        <button class="btn-link view-details-btn" data-record-id="${record.id}">
                            詳細を表示
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * 同期履歴の詳細を表示
     * @param {string} recordId - 同期記録ID
     */
    showSyncHistoryDetails(recordId) {
        const history = this.settingsManager.getSyncHistory();
        const record = history.find(r => r.id === recordId);
        
        if (!record) {
            this.showMessage('同期履歴が見つかりません', 'error');
            return;
        }
        
        const detailsHTML = this.createSyncHistoryDetailsHTML(record);
        
        // モーダルダイアログで詳細を表示
        this.showDetailsDialog('同期履歴の詳細', detailsHTML);
    }
    
    /**
     * 同期履歴詳細のHTMLを生成
     * @param {SyncRecord} record - 同期記録
     * @returns {string} HTML文字列
     */
    createSyncHistoryDetailsHTML(record) {
        const statusClass = record.status === 'success' ? 'success' : 
                           record.status === 'partial' ? 'warning' : 'error';
        
        const statusText = record.status === 'success' ? '成功' :
                          record.status === 'partial' ? '部分成功' : '失敗';
        
        const timestamp = new Date(record.timestamp);
        
        return `
            <div class="sync-details-container">
                <div class="sync-details-section">
                    <h4>基本情報</h4>
                    <table class="sync-details-table">
                        <tr>
                            <th>実行時刻</th>
                            <td>${timestamp.toLocaleString('ja-JP')}</td>
                        </tr>
                        <tr>
                            <th>プロジェクト</th>
                            <td>${record.projectName}</td>
                        </tr>
                        <tr>
                            <th>リポジトリ</th>
                            <td><a href="${record.repositoryUrl}" target="_blank" rel="noopener noreferrer">${record.repositoryUrl}</a></td>
                        </tr>
                        <tr>
                            <th>ステータス</th>
                            <td><span class="sync-history-status ${statusClass}">${statusText}</span></td>
                        </tr>
                    </table>
                </div>
                
                <div class="sync-details-section">
                    <h4>同期結果</h4>
                    <table class="sync-details-table">
                        <tr>
                            <th>新規CI結果</th>
                            <td>${record.newCIResults}件</td>
                        </tr>
                        <tr>
                            <th>更新CI結果</th>
                            <td>${record.updatedCIResults}件</td>
                        </tr>
                        <tr>
                            <th>処理ワークフロー数</th>
                            <td>${record.workflowRunsProcessed}件</td>
                        </tr>
                    </table>
                </div>
                
                <div class="sync-details-section">
                    <h4>パフォーマンス</h4>
                    <table class="sync-details-table">
                        <tr>
                            <th>処理時間</th>
                            <td>${record.durationMs}ms (${(record.durationMs / 1000).toFixed(2)}秒)</td>
                        </tr>
                        <tr>
                            <th>API使用回数</th>
                            <td>${record.apiRequestsUsed}回</td>
                        </tr>
                        <tr>
                            <th>平均処理時間/ワークフロー</th>
                            <td>${record.workflowRunsProcessed > 0 ? Math.round(record.durationMs / record.workflowRunsProcessed) : 0}ms</td>
                        </tr>
                    </table>
                </div>
                
                ${record.errors.length > 0 ? `
                    <div class="sync-details-section">
                        <h4>エラー詳細</h4>
                        <div class="sync-details-errors">
                            ${record.errors.map((error, index) => `
                                <div class="error-detail-item">
                                    <strong>エラー ${index + 1}:</strong>
                                    <pre>${error}</pre>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    /**
     * 詳細ダイアログを表示
     * @param {string} title - ダイアログタイトル
     * @param {string} content - コンテンツHTML
     */
    showDetailsDialog(title, content) {
        // 既存のダイアログがあれば削除
        const existingDialog = document.getElementById('details-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // 新しいダイアログを作成
        const dialog = document.createElement('div');
        dialog.id = 'details-dialog';
        dialog.className = 'modal';
        dialog.style.display = 'flex';
        dialog.innerHTML = `
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" aria-label="閉じる">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-details-btn">閉じる</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // イベントリスナーを設定
        const closeBtn = dialog.querySelector('.close-details-btn');
        const modalClose = dialog.querySelector('.modal-close');
        
        const closeDialog = () => {
            dialog.remove();
        };
        
        if (closeBtn) {
            closeBtn.addEventListener('click', closeDialog);
        }
        
        if (modalClose) {
            modalClose.addEventListener('click', closeDialog);
        }
        
        // 背景クリックで閉じる
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                closeDialog();
            }
        });
    }

    /**
     * 同期履歴をクリア
     */
    clearSyncHistory() {
        this.showConfirmDialog(
            '履歴のクリア',
            'すべての同期履歴を削除しますか？この操作は取り消せません。',
            () => this.executeClearSyncHistory()
        );
    }

    /**
     * 同期履歴クリアを実行
     */
    executeClearSyncHistory() {
        try {
            this.settingsManager.clearSyncHistory();
            this.updateSyncHistory();
            this.showMessage('同期履歴をクリアしました', 'success');
        } catch (error) {
            console.error('Failed to clear sync history:', error);
            this.showMessage('履歴のクリアに失敗しました', 'error');
        }
    }

    /**
     * 確認ダイアログを表示
     * @param {string} title - ダイアログタイトル
     * @param {string} message - メッセージ
     * @param {Function} onConfirm - 確認時のコールバック
     */
    showConfirmDialog(title, message, onConfirm) {
        const dialog = document.getElementById('confirm-dialog');
        const titleElement = document.getElementById('confirm-dialog-title');
        const messageElement = document.getElementById('confirm-dialog-message');

        if (!dialog || !titleElement || !messageElement) return;

        titleElement.textContent = title;
        messageElement.textContent = message;
        
        this.pendingConfirmAction = onConfirm;
        dialog.style.display = 'flex';
    }

    /**
     * 確認ダイアログを非表示
     */
    hideConfirmDialog() {
        const dialog = document.getElementById('confirm-dialog');
        if (dialog) {
            dialog.style.display = 'none';
        }
        this.pendingConfirmAction = null;
    }

    /**
     * 確認されたアクションを実行
     */
    executeConfirmedAction() {
        if (this.pendingConfirmAction) {
            this.pendingConfirmAction();
        }
        this.hideConfirmDialog();
    }

    /**
     * レート制限状態変更を処理
     * @param {Object} detail - イベント詳細
     */
    handleRateLimitStatusChange(detail) {
        const { isLimited, resetTime, type } = detail;
        
        // レート制限表示を更新
        if (typeof updateRateLimitDisplay === 'function') {
            updateRateLimitDisplay({
                isLimited: isLimited,
                resetTime: resetTime,
                retryAfter: isLimited ? Math.max(0, (resetTime.getTime() - Date.now()) / 1000) : 0,
                type: type
            });
        }

        // 通知メッセージ
        if (isLimited) {
            const resetTimeStr = resetTime.toLocaleTimeString('ja-JP');
            const message = type === 'secondary' ? 
                `セカンダリレート制限に達しました。${resetTimeStr}に再開されます。` :
                `レート制限に達しました。${resetTimeStr}に再開されます。`;
            this.showMessage(message, 'warning');
        } else if (type === 'reset') {
            this.showMessage('レート制限が解除されました。', 'success');
        }

        // API使用状況を更新
        setTimeout(() => {
            this.updateRateLimitInfo();
        }, 1000);
    }

    /**
     * メッセージを表示
     * @param {string} message - メッセージ
     * @param {'success'|'error'|'info'|'warning'} type - メッセージタイプ
     */
    showMessage(message, type = 'info') {
        // 既存のapp.jsのメッセージ表示機能を使用
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// ========================================
// 設定ページ初期化
// ========================================

let settingsPageController = null;

/**
 * 設定ページを初期化
 */
function initializeSettingsPage() {
    // 設定ページでのみ初期化
    if (document.body.classList.contains('settings-page') || 
        document.title.includes('設定') ||
        window.location.pathname.includes('settings.html')) {
        
        if (!settingsPageController) {
            settingsPageController = new SettingsPageController();
        }
        settingsPageController.initialize();
    }
    /**
     * CI/CDサービス選択UIを初期化
     */
    initializeServiceSelector() {
        const container = document.getElementById('ci-service-selector-container');
        if (!container) {
            console.warn('CI service selector container not found');
            return;
        }

        // サービスレジストリが利用可能かチェック
        if (typeof ciServiceRegistry === 'undefined') {
            console.warn('CI service registry not available');
            return;
        }

        // サービス選択UIを生成
        const selectorUI = ciServiceRegistry.createServiceSelectorUI();
        container.appendChild(selectorUI);

        // サービス変更イベントのリスナーを設定
        window.addEventListener('ciServiceChanged', (event) => {
            console.log(`CI service changed to: ${event.detail.serviceName}`);
            // 必要に応じてUIを更新
            this.onServiceChanged(event.detail.serviceName);
        });

        console.log('CI service selector initialized');
    }

    /**
     * サービス変更時の処理
     * @param {string} serviceName - 新しいサービス名
     */
    onServiceChanged(serviceName) {
        // 現在のサービスに応じてUIを更新
        const githubSection = document.querySelector('.github-feature');
        
        if (githubSection) {
            if (serviceName === 'github') {
                githubSection.style.display = 'block';
            } else {
                // 将来的に他のサービスのUIを表示
                githubSection.style.display = 'none';
            }
        }
    }
}

// ページ読み込み時に初期化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initializeSettingsPage);
    
    // 既にDOMが読み込まれている場合
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeSettingsPage);
    } else {
        initializeSettingsPage();
    }
}
// ========================================
// ネットワーク状態パネル制御
// ========================================

/**
 * ネットワーク状態パネルの制御を行うクラス
 */
class NetworkStatusPanel {
    constructor() {
        this.networkMonitor = null;
        this.updateInterval = null;
    }
    
    /**
     * ネットワーク状態パネルを初期化
     */
    initialize() {
        // NetworkMonitorインスタンスを取得
        this.networkMonitor = getNetworkMonitor();
        
        if (!this.networkMonitor) {
            console.error('NetworkMonitor not available');
            return;
        }
        
        this.setupEventListeners();
        this.startPeriodicUpdate();
        this.updateNetworkStatus();
        
        console.log('NetworkStatusPanel initialized');
    }
    
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        // 接続テストボタン
        const testNetworkBtn = document.getElementById('test-network-btn');
        if (testNetworkBtn) {
            testNetworkBtn.addEventListener('click', () => this.testNetworkConnection());
        }
        
        // 保留操作処理ボタン
        const processQueueBtn = document.getElementById('process-queue-btn');
        if (processQueueBtn) {
            processQueueBtn.addEventListener('click', () => this.processOfflineQueue());
        }
        
        // NetworkMonitorのイベントリスナーを追加
        this.networkMonitor.addListener((event, status) => {
            this.handleNetworkStatusChange(event, status);
        });
    }
    
    /**
     * 定期的な状態更新を開始
     */
    startPeriodicUpdate() {
        // 10秒ごとに状態を更新
        this.updateInterval = setInterval(() => {
            this.updateNetworkStatus();
        }, 10000);
    }
    
    /**
     * ネットワーク状態を更新
     */
    updateNetworkStatus() {
        if (!this.networkMonitor) return;
        
        const status = this.networkMonitor.getStatus();
        
        // 接続状態インジケーター
        const statusElement = document.getElementById('network-status');
        if (statusElement) {
            if (status.isOnline) {
                statusElement.textContent = `オンライン (${status.connectionQuality})`;
                statusElement.className = `network-status-indicator online ${status.connectionQuality}`;
            } else {
                statusElement.textContent = 'オフライン';
                statusElement.className = 'network-status-indicator offline';
            }
        }
        
        // 保留操作数
        const queuedElement = document.getElementById('queued-operations');
        if (queuedElement) {
            queuedElement.textContent = `${status.queuedOperations}件`;
        }
        
        // 最終オンライン時刻
        const lastOnlineElement = document.getElementById('last-online');
        if (lastOnlineElement) {
            if (status.lastOnlineTime) {
                lastOnlineElement.textContent = status.lastOnlineTime.toLocaleString();
            } else {
                lastOnlineElement.textContent = '-';
            }
        }
        
        // 再接続試行回数
        const reconnectElement = document.getElementById('reconnect-attempts');
        if (reconnectElement) {
            reconnectElement.textContent = `${status.reconnectAttempts}回`;
        }
        
        // 保留操作処理ボタンの状態
        const processQueueBtn = document.getElementById('process-queue-btn');
        if (processQueueBtn) {
            processQueueBtn.disabled = !status.isOnline || status.queuedOperations === 0;
        }
    }
    
    /**
     * ネットワーク接続をテスト
     */
    async testNetworkConnection() {
        const testBtn = document.getElementById('test-network-btn');
        if (testBtn) {
            testBtn.disabled = true;
            testBtn.textContent = 'テスト中...';
        }
        
        try {
            const isConnected = await this.networkMonitor.testConnection();
            
            if (isConnected) {
                this.showMessage('ネットワーク接続テストが成功しました', 'success');
            } else {
                this.showMessage('ネットワーク接続テストが失敗しました', 'error');
            }
            
            // 接続品質も更新
            await this.networkMonitor.checkConnectionQuality();
            this.updateNetworkStatus();
            
        } catch (error) {
            this.showMessage(`接続テストエラー: ${error.message}`, 'error');
        } finally {
            if (testBtn) {
                testBtn.disabled = false;
                testBtn.textContent = '接続テスト';
            }
        }
    }
    
    /**
     * オフラインキューを処理
     */
    async processOfflineQueue() {
        const processBtn = document.getElementById('process-queue-btn');
        if (processBtn) {
            processBtn.disabled = true;
            processBtn.textContent = '処理中...';
        }
        
        try {
            await this.networkMonitor.processOfflineQueue();
            this.showMessage('保留操作の処理が完了しました', 'success');
            this.updateNetworkStatus();
        } catch (error) {
            this.showMessage(`保留操作の処理エラー: ${error.message}`, 'error');
        } finally {
            if (processBtn) {
                processBtn.disabled = false;
                processBtn.textContent = '保留操作を処理';
            }
        }
    }
    
    /**
     * ネットワーク状態変更を処理
     * @param {string} event - イベントタイプ
     * @param {Object} status - ネットワーク状態
     */
    handleNetworkStatusChange(event, status) {
        console.log(`Network status changed: ${event}`, status);
        
        // UI状態を即座に更新
        this.updateNetworkStatus();
        
        // イベントに応じたメッセージ表示
        if (event === 'online') {
            this.showMessage('ネットワーク接続が復旧しました', 'success');
        } else if (event === 'offline') {
            this.showMessage('ネットワーク接続が切断されました', 'warning');
        }
    }
    
    /**
     * メッセージを表示
     * @param {string} message - メッセージ
     * @param {string} type - メッセージタイプ
     */
    showMessage(message, type = 'info') {
        if (this.networkMonitor) {
            this.networkMonitor.showConnectionMessage(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    /**
     * パネルを破棄
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        if (this.networkMonitor) {
            // リスナーを削除（実装されている場合）
            // this.networkMonitor.removeListener(this.handleNetworkStatusChange);
        }
    }
}

// ネットワーク状態パネルのインスタンス
let networkStatusPanel = null;

// 設定ページ読み込み時にネットワーク状態パネルを初期化
document.addEventListener('DOMContentLoaded', () => {
    // 少し遅延させてNetworkMonitorの初期化を待つ
    setTimeout(() => {
        networkStatusPanel = new NetworkStatusPanel();
        networkStatusPanel.initialize();
    }, 500);
});

// ページアンロード時のクリーンアップ
window.addEventListener('beforeunload', () => {
    if (networkStatusPanel) {
        networkStatusPanel.destroy();
    }
});