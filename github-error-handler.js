/**
 * GitHub APIエラーハンドリング
 * APIエラー、レート制限、接続エラーの処理とユーザー通知を提供
 */

/**
 * GitHub APIエラークラス
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
 * GitHubエラーハンドラークラス
 * APIエラーハンドリング、レート制限警告表示、接続エラー表示を提供
 */
class GitHubErrorHandler {
    /**
     * GitHub APIエラーを処理
     * @param {Error} error - エラーオブジェクト
     * @param {Object} context - エラーコンテキスト情報
     * @returns {GitHubAPIError} 処理されたエラー
     */
    handleAPIError(error, context = {}) {
        console.error('GitHub API Error:', error);
        
        // GitHubAPIErrorの場合
        if (error instanceof GitHubAPIError) {
            return this.processGitHubAPIError(error, context);
        }
        
        // Fetch APIエラーの場合
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            return this.handleNetworkError(error, context);
        }
        
        // レスポンスステータスがある場合
        if (error.response) {
            return this.handleResponseError(error.response, context);
        }
        
        // その他のエラー
        return this.handleGenericError(error, context);
    }
    
    /**
     * GitHubAPIErrorを処理
     * @param {GitHubAPIError} error - GitHubAPIError
     * @param {Object} context - コンテキスト
     * @returns {GitHubAPIError} 処理されたエラー
     */
    processGitHubAPIError(error, context) {
        switch (error.status) {
            case 401:
                this.showAuthenticationError();
                break;
            case 403:
                if (error.details.includes('rate limit')) {
                    this.handleRateLimitError(error);
                } else {
                    this.showPermissionError();
                }
                break;
            case 404:
                this.showNotFoundError(context);
                break;
            case 422:
                this.showValidationError(error.details);
                break;
            case 500:
            case 502:
            case 503:
            case 504:
                this.showServerError(error.status);
                break;
            default:
                this.showGenericAPIError(error);
        }
        
        return error;
    }
    
    /**
     * レスポンスエラーを処理
     * @param {Response} response - Fetchレスポンス
     * @param {Object} context - コンテキスト
     * @returns {GitHubAPIError} 処理されたエラー
     */
    async handleResponseError(response, context) {
        let details = '';
        try {
            const data = await response.json();
            details = data.message || JSON.stringify(data);
        } catch (e) {
            details = await response.text();
        }
        
        const error = new GitHubAPIError(
            `GitHub API request failed: ${response.statusText}`,
            response.status,
            details
        );
        
        return this.processGitHubAPIError(error, context);
    }
    
    /**
     * ネットワークエラーを処理
     * @param {Error} error - ネットワークエラー
     * @param {Object} context - コンテキスト
     * @returns {GitHubAPIError} 処理されたエラー
     */
    handleNetworkError(error, context) {
        this.showConnectionError();
        
        return new GitHubAPIError(
            'ネットワーク接続エラーが発生しました',
            0,
            error.message
        );
    }
    
    /**
     * 一般的なエラーを処理
     * @param {Error} error - エラー
     * @param {Object} context - コンテキスト
     * @returns {GitHubAPIError} 処理されたエラー
     */
    handleGenericError(error, context) {
        this.showGenericError(error.message);
        
        return new GitHubAPIError(
            error.message || '不明なエラーが発生しました',
            0,
            error.stack || ''
        );
    }
    
    /**
     * レート制限エラーを処理
     * @param {GitHubAPIError} error - レート制限エラー
     */
    async handleRateLimitError(error) {
        try {
            // レート制限情報を取得
            let resetTime = new Date(Date.now() + 60 * 60 * 1000); // デフォルト1時間後
            
            if (typeof RateLimitManager !== 'undefined') {
                const rateLimitManager = RateLimitManager.getInstance();
                if (rateLimitManager && rateLimitManager.getResetTime) {
                    resetTime = await rateLimitManager.getResetTime();
                }
            }
            
            this.showRateLimitWarning(resetTime);
            
            // ErrorRecoveryManagerに処理を委譲
            if (typeof ErrorRecoveryManager !== 'undefined') {
                await ErrorRecoveryManager.handleRateLimitError(error);
            }
        } catch (handlingError) {
            console.error('Failed to handle rate limit error:', handlingError);
            this.showGenericError('レート制限エラーの処理中に問題が発生しました');
        }
    }
    
    /**
     * レート制限警告を表示
     * @param {Date} resetTime - リセット時刻
     */
    showRateLimitWarning(resetTime) {
        const now = new Date();
        const minutesUntilReset = Math.ceil((resetTime - now) / (60 * 1000));
        
        const message = `
            <strong>GitHub APIレート制限に達しました</strong><br>
            リセット時刻: ${this.formatDateTime(resetTime)}<br>
            残り時間: 約${minutesUntilReset}分<br><br>
            自動同期は一時停止されました。リセット後に自動的に再開されます。
        `;
        
        this.showNotification(message, 'warning', 0); // 0 = 自動で閉じない
    }
    
    /**
     * 認証エラーを表示
     */
    showAuthenticationError() {
        const message = `
            <strong>GitHub認証エラー</strong><br>
            Personal Access Tokenが無効または期限切れです。<br><br>
            <a href="settings.html">設定ページ</a>でトークンを確認してください。
        `;
        
        this.showNotification(message, 'error', 10000);
    }
    
    /**
     * 権限エラーを表示
     */
    showPermissionError() {
        const message = `
            <strong>アクセス権限エラー</strong><br>
            このリポジトリへのアクセス権限がありません。<br><br>
            Personal Access Tokenに適切な権限があることを確認してください。
        `;
        
        this.showNotification(message, 'error', 8000);
    }
    
    /**
     * リソースが見つからないエラーを表示
     * @param {Object} context - コンテキスト情報
     */
    showNotFoundError(context) {
        let message = '<strong>リソースが見つかりません</strong><br>';
        
        if (context.repository) {
            message += `リポジトリ「${context.repository}」が見つかりません。<br>`;
        } else if (context.workflow) {
            message += `ワークフロー「${context.workflow}」が見つかりません。<br>`;
        } else {
            message += '指定されたリソースが見つかりません。<br>';
        }
        
        message += '<br>URLを確認してください。';
        
        this.showNotification(message, 'error', 8000);
    }
    
    /**
     * バリデーションエラーを表示
     * @param {string} details - エラー詳細
     */
    showValidationError(details) {
        const message = `
            <strong>入力エラー</strong><br>
            ${details || '入力内容に問題があります。'}<br><br>
            入力内容を確認してください。
        `;
        
        this.showNotification(message, 'error', 8000);
    }
    
    /**
     * サーバーエラーを表示
     * @param {number} status - HTTPステータスコード
     */
    showServerError(status) {
        const message = `
            <strong>GitHub APIサーバーエラー (${status})</strong><br>
            GitHubのサーバーで一時的な問題が発生しています。<br><br>
            しばらく待ってから再試行してください。
        `;
        
        this.showNotification(message, 'error', 8000);
    }
    
    /**
     * 一般的なAPIエラーを表示
     * @param {GitHubAPIError} error - エラー
     */
    showGenericAPIError(error) {
        const message = `
            <strong>GitHub APIエラー</strong><br>
            ${error.message}<br><br>
            ${error.details ? `詳細: ${error.details}` : ''}
        `;
        
        this.showNotification(message, 'error', 8000);
    }
    
    /**
     * 接続エラーを表示
     */
    showConnectionError() {
        const message = `
            <strong>ネットワーク接続エラー</strong><br>
            GitHub APIに接続できません。<br><br>
            インターネット接続を確認してください。<br>
            手動入力モードに切り替わります。
        `;
        
        this.showNotification(message, 'error', 8000);
    }
    
    /**
     * 一般的なエラーを表示
     * @param {string} errorMessage - エラーメッセージ
     */
    showGenericError(errorMessage) {
        const message = `
            <strong>エラーが発生しました</strong><br>
            ${errorMessage || '不明なエラーが発生しました。'}
        `;
        
        this.showNotification(message, 'error', 8000);
    }
    
    /**
     * 成功メッセージを表示
     * @param {string} message - メッセージ
     * @param {number} duration - 表示時間（ミリ秒）
     */
    showSuccess(message, duration = 5000) {
        this.showNotification(message, 'success', duration);
    }
    
    /**
     * 情報メッセージを表示
     * @param {string} message - メッセージ
     * @param {number} duration - 表示時間（ミリ秒）
     */
    showInfo(message, duration = 5000) {
        this.showNotification(message, 'info', duration);
    }
    
    /**
     * 通知を表示
     * @param {string} message - メッセージ（HTML可）
     * @param {string} type - 通知タイプ（success, error, warning, info）
     * @param {number} duration - 表示時間（ミリ秒、0で自動で閉じない）
     */
    showNotification(message, type = 'info', duration = 5000) {
        // 通知コンテナを取得または作成
        let container = document.getElementById('github-notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'github-notification-container';
            container.className = 'github-notification-container';
            document.body.appendChild(container);
        }
        
        // 通知要素を作成
        const notification = document.createElement('div');
        notification.className = `github-notification github-notification-${type}`;
        
        // アイコンを選択
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        const icon = icons[type] || icons.info;
        
        notification.innerHTML = `
            <div class="github-notification-content">
                <span class="github-notification-icon">${icon}</span>
                <div class="github-notification-message">${message}</div>
                <button class="github-notification-close" aria-label="閉じる">×</button>
            </div>
        `;
        
        // 閉じるボタンのイベントリスナー
        const closeButton = notification.querySelector('.github-notification-close');
        closeButton.addEventListener('click', () => {
            this.removeNotification(notification);
        });
        
        // 通知を追加
        container.appendChild(notification);
        
        // アニメーション用のクラスを追加
        setTimeout(() => {
            notification.classList.add('github-notification-show');
        }, 10);
        
        // 自動で閉じる
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }
        
        return notification;
    }
    
    /**
     * 通知を削除
     * @param {HTMLElement} notification - 通知要素
     */
    removeNotification(notification) {
        notification.classList.remove('github-notification-show');
        notification.classList.add('github-notification-hide');
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }
    
    /**
     * すべての通知をクリア
     */
    clearAllNotifications() {
        const container = document.getElementById('github-notification-container');
        if (container) {
            const notifications = container.querySelectorAll('.github-notification');
            notifications.forEach(notification => {
                this.removeNotification(notification);
            });
        }
    }
    
    /**
     * 日時をフォーマット
     * @param {Date} date - 日時
     * @returns {string} フォーマットされた日時
     */
    formatDateTime(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}/${month}/${day} ${hours}:${minutes}`;
    }
    
    /**
     * エラーをログに記録
     * @param {Error} error - エラー
     * @param {Object} context - コンテキスト
     */
    logError(error, context = {}) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack
            },
            context: context
        };
        
        console.error('GitHub Error Log:', logEntry);
        
        // 将来的にはエラーログをlocalStorageに保存することも可能
        // this.saveErrorLog(logEntry);
    }
}

// グローバルに公開
if (typeof window !== 'undefined') {
    window.GitHubAPIError = GitHubAPIError;
    window.GitHubErrorHandler = GitHubErrorHandler;
}
