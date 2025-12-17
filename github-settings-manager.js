// GitHub設定管理クラス
// GitHub統合設定とPersonal Access Token、同期履歴を管理

/**
 * GitHub設定管理クラス
 * GitHub統合設定のCRUD操作、Personal Access Token管理、同期履歴管理を提供
 */
class GitHubSettingsManager {
    // LocalStorageのキー定数
    static KEYS = {
        GITHUB_SETTINGS: 'spec-tracking-site:githubSettings',
        SYNC_HISTORY: 'spec-tracking-site:syncHistory'
    };

    // デフォルト設定
    static DEFAULT_SETTINGS = {
        autoSyncEnabled: false,
        autoSyncInterval: 15, // 分単位
        maxRetries: 3,
        retryDelay: 2 // 秒単位
    };

    // 同期履歴の最大保持件数
    static MAX_SYNC_HISTORY = 100;

    /**
     * GitHub設定を取得
     * @returns {GitHubSettings} GitHub設定オブジェクト
     */
    getSettings() {
        try {
            const settingsJson = localStorage.getItem(GitHubSettingsManager.KEYS.GITHUB_SETTINGS);
            if (!settingsJson) {
                // 設定が存在しない場合はデフォルト設定を返す
                return { ...GitHubSettingsManager.DEFAULT_SETTINGS };
            }

            const parseResult = safeJSONParse(settingsJson);
            if (!parseResult.success) {
                console.error('GitHub設定データのパースに失敗:', parseResult.error);
                return { ...GitHubSettingsManager.DEFAULT_SETTINGS };
            }

            // デフォルト設定とマージ（新しいフィールドが追加された場合に対応）
            return {
                ...GitHubSettingsManager.DEFAULT_SETTINGS,
                ...parseResult.data
            };
        } catch (error) {
            console.error('GitHub設定データの取得に失敗:', error);
            return { ...GitHubSettingsManager.DEFAULT_SETTINGS };
        }
    }

    /**
     * GitHub設定を更新
     * @param {Partial<GitHubSettings>} settings - 更新する設定（部分更新可能）
     * @returns {boolean} 更新成功フラグ
     */
    updateSettings(settings) {
        try {
            // 現在の設定を取得
            const currentSettings = this.getSettings();

            // 設定をマージ
            const updatedSettings = {
                ...currentSettings,
                ...settings
            };

            // バリデーション
            const validationResult = validateGitHubSettings(updatedSettings);
            if (!validationResult.isValid) {
                console.error('GitHub設定のバリデーションに失敗:', validationResult.errors);
                ErrorHandler.handleValidationError(validationResult);
                return false;
            }

            // JSON文字列化
            const stringifyResult = safeJSONStringify(updatedSettings);
            if (!stringifyResult.success) {
                console.error('GitHub設定データの文字列化に失敗:', stringifyResult.error);
                return false;
            }

            // LocalStorageに保存
            localStorage.setItem(GitHubSettingsManager.KEYS.GITHUB_SETTINGS, stringifyResult.json);
            return true;
        } catch (error) {
            console.error('GitHub設定データの更新に失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * Personal Access Tokenを設定
     * @param {string} token - Personal Access Token（平文）
     * @returns {Promise<boolean>} 設定成功フラグ
     */
    async setAccessToken(token) {
        try {
            if (!token || typeof token !== 'string' || token.trim() === '') {
                console.error('有効なアクセストークンを指定してください');
                return false;
            }

            // トークンを暗号化
            const encryptedToken = await TokenEncryption.encrypt(token.trim());

            // 設定を更新
            return this.updateSettings({
                accessToken: encryptedToken
            });
        } catch (error) {
            console.error('アクセストークンの設定に失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * Personal Access Tokenを取得（暗号化済み）
     * @returns {string|null} 暗号化されたアクセストークン、または null
     */
    getAccessToken() {
        const settings = this.getSettings();
        return settings.accessToken || null;
    }

    /**
     * Personal Access Tokenを復号化して取得
     * @returns {Promise<string|null>} 復号化されたアクセストークン、または null
     */
    async getDecryptedAccessToken() {
        try {
            const encryptedToken = this.getAccessToken();
            if (!encryptedToken) {
                return null;
            }

            return await TokenEncryption.decrypt(encryptedToken);
        } catch (error) {
            console.error('アクセストークンの復号化に失敗:', error);
            return null;
        }
    }

    /**
     * Personal Access Tokenを削除
     * @returns {boolean} 削除成功フラグ
     */
    clearAccessToken() {
        try {
            const currentSettings = this.getSettings();
            delete currentSettings.accessToken;

            // JSON文字列化
            const stringifyResult = safeJSONStringify(currentSettings);
            if (!stringifyResult.success) {
                console.error('GitHub設定データの文字列化に失敗:', stringifyResult.error);
                return false;
            }

            // LocalStorageに保存
            localStorage.setItem(GitHubSettingsManager.KEYS.GITHUB_SETTINGS, stringifyResult.json);
            return true;
        } catch (error) {
            console.error('アクセストークンの削除に失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * 自動同期を有効化/無効化
     * @param {boolean} enabled - 有効化フラグ
     * @returns {boolean} 更新成功フラグ
     */
    setAutoSyncEnabled(enabled) {
        if (typeof enabled !== 'boolean') {
            console.error('有効化フラグはboolean値である必要があります');
            return false;
        }

        return this.updateSettings({
            autoSyncEnabled: enabled
        });
    }

    /**
     * 自動同期間隔を設定
     * @param {number} minutes - 同期間隔（分単位）
     * @returns {boolean} 更新成功フラグ
     */
    setAutoSyncInterval(minutes) {
        if (!Number.isInteger(minutes) || minutes <= 0) {
            console.error('同期間隔は正の整数である必要があります');
            return false;
        }

        return this.updateSettings({
            autoSyncInterval: minutes
        });
    }

    /**
     * 同期履歴を取得
     * @returns {SyncRecord[]} 同期履歴配列（新しい順）
     */
    getSyncHistory() {
        try {
            const historyJson = localStorage.getItem(GitHubSettingsManager.KEYS.SYNC_HISTORY);
            if (!historyJson) {
                return [];
            }

            const parseResult = safeJSONParse(historyJson);
            if (!parseResult.success) {
                console.error('同期履歴データのパースに失敗:', parseResult.error);
                return [];
            }

            // 配列であることを確認
            if (!Array.isArray(parseResult.data)) {
                console.error('同期履歴データは配列である必要があります');
                return [];
            }

            // 新しい順にソート
            return parseResult.data.sort((a, b) => {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
        } catch (error) {
            console.error('同期履歴データの取得に失敗:', error);
            return [];
        }
    }

    /**
     * 同期履歴を保存（内部用）
     * @param {SyncRecord[]} history - 保存する同期履歴配列
     * @returns {boolean} 保存成功フラグ
     */
    _saveSyncHistory(history) {
        try {
            if (!Array.isArray(history)) {
                console.error('同期履歴データは配列である必要があります');
                return false;
            }

            // JSON文字列化
            const stringifyResult = safeJSONStringify(history);
            if (!stringifyResult.success) {
                console.error('同期履歴データの文字列化に失敗:', stringifyResult.error);
                return false;
            }

            // LocalStorageに保存
            localStorage.setItem(GitHubSettingsManager.KEYS.SYNC_HISTORY, stringifyResult.json);
            return true;
        } catch (error) {
            console.error('同期履歴データの保存に失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * 同期履歴を追加
     * @param {SyncRecord} record - 追加する同期記録
     * @returns {boolean} 追加成功フラグ
     */
    addSyncRecord(record) {
        try {
            // バリデーション
            const validationResult = validateSyncRecord(record);
            if (!validationResult.isValid) {
                console.error('同期記録のバリデーションに失敗:', validationResult.errors);
                ErrorHandler.handleValidationError(validationResult);
                return false;
            }

            // IDとタイムスタンプを設定（未設定の場合）
            if (!record.id) {
                record.id = generateUUID();
            }
            if (!record.timestamp) {
                record.timestamp = new Date().toISOString();
            }

            // 現在の履歴を取得
            const history = this.getSyncHistory();

            // 新しい記録を追加
            history.unshift(record);

            // 最大件数を超えた場合は古い記録を削除
            if (history.length > GitHubSettingsManager.MAX_SYNC_HISTORY) {
                history.splice(GitHubSettingsManager.MAX_SYNC_HISTORY);
            }

            // 保存
            return this._saveSyncHistory(history);
        } catch (error) {
            console.error('同期記録の追加に失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * 同期履歴をクリア
     * @returns {boolean} クリア成功フラグ
     */
    clearSyncHistory() {
        try {
            localStorage.removeItem(GitHubSettingsManager.KEYS.SYNC_HISTORY);
            return true;
        } catch (error) {
            console.error('同期履歴のクリアに失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * 特定のプロジェクトの同期履歴を取得
     * @param {string} projectId - プロジェクトID
     * @returns {SyncRecord[]} 同期履歴配列（新しい順）
     */
    getSyncHistoryByProject(projectId) {
        const history = this.getSyncHistory();
        return history.filter(record => record.projectId === projectId);
    }

    /**
     * 最新の同期記録を取得
     * @param {string} [projectId] - プロジェクトID（オプション）
     * @returns {SyncRecord|null} 最新の同期記録、または null
     */
    getLatestSyncRecord(projectId = null) {
        const history = projectId 
            ? this.getSyncHistoryByProject(projectId)
            : this.getSyncHistory();

        return history.length > 0 ? history[0] : null;
    }

    /**
     * 失敗した同期記録を取得
     * @returns {SyncRecord[]} 失敗した同期記録配列（新しい順）
     */
    getFailedSyncRecords() {
        const history = this.getSyncHistory();
        return history.filter(record => record.status === 'failure' || record.status === 'partial');
    }

    /**
     * レート制限情報を更新
     * @param {number} remaining - 残りリクエスト数
     * @param {string} resetAt - リセット日時（ISO 8601 timestamp）
     * @returns {boolean} 更新成功フラグ
     */
    updateRateLimitInfo(remaining, resetAt) {
        if (!Number.isInteger(remaining) || remaining < 0) {
            console.error('残りリクエスト数は0以上の整数である必要があります');
            return false;
        }

        if (!resetAt || typeof resetAt !== 'string') {
            console.error('リセット日時は文字列である必要があります');
            return false;
        }

        return this.updateSettings({
            rateLimitRemaining: remaining,
            rateLimitResetAt: resetAt
        });
    }

    /**
     * 最終同期日時を更新
     * @param {string} [timestamp] - 同期日時（ISO 8601 timestamp）、省略時は現在時刻
     * @returns {boolean} 更新成功フラグ
     */
    updateLastSyncAt(timestamp = null) {
        const syncTime = timestamp || new Date().toISOString();
        return this.updateSettings({
            lastSyncAt: syncTime
        });
    }

    /**
     * すべての設定をリセット
     * @returns {boolean} リセット成功フラグ
     */
    resetSettings() {
        try {
            localStorage.removeItem(GitHubSettingsManager.KEYS.GITHUB_SETTINGS);
            return true;
        } catch (error) {
            console.error('GitHub設定のリセットに失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }

    /**
     * すべてのデータをクリア（設定と履歴）
     * @returns {boolean} クリア成功フラグ
     */
    clearAll() {
        try {
            const settingsCleared = this.resetSettings();
            const historyCleared = this.clearSyncHistory();
            return settingsCleared && historyCleared;
        } catch (error) {
            console.error('GitHub統合データのクリアに失敗:', error);
            ErrorHandler.handleStorageError(error);
            return false;
        }
    }
}
