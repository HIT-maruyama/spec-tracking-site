// TokenEncryptionクラスの統合テスト

/**
 * TokenEncryptionクラスの基本機能をテスト
 */
async function testTokenEncryptionIntegration() {
    console.log('=== TokenEncryption統合テスト開始 ===');
    
    try {
        // 1. サポート確認
        console.log('1. 暗号化機能サポート確認');
        const isSupported = TokenEncryption.isSupported();
        console.log(`   サポート状況: ${isSupported ? '✓ サポート済み' : '✗ 未サポート'}`);
        
        if (!isSupported) {
            console.error('暗号化機能がサポートされていません');
            return false;
        }

        // 2. 基本的な暗号化・復号化テスト
        console.log('2. 基本的な暗号化・復号化テスト');
        const testToken = 'ghp_test123456789abcdefghijklmnopqrstuvwxyz';
        
        const encrypted = await TokenEncryption.encrypt(testToken);
        console.log(`   暗号化完了: ${encrypted.substring(0, 50)}...`);
        
        const decrypted = await TokenEncryption.decrypt(encrypted);
        console.log(`   復号化完了: ${decrypted}`);
        
        const isMatch = testToken === decrypted;
        console.log(`   一致確認: ${isMatch ? '✓ 一致' : '✗ 不一致'}`);
        
        if (!isMatch) {
            console.error('暗号化・復号化テストに失敗しました');
            return false;
        }

        // 3. フィンガープリント生成テスト
        console.log('3. ブラウザフィンガープリント生成テスト');
        const fingerprint1 = await TokenEncryption.generateBrowserFingerprint();
        const fingerprint2 = await TokenEncryption.generateBrowserFingerprint();
        
        console.log(`   フィンガープリント1: ${fingerprint1}`);
        console.log(`   フィンガープリント2: ${fingerprint2}`);
        
        const fingerprintMatch = fingerprint1 === fingerprint2;
        console.log(`   一致確認: ${fingerprintMatch ? '✓ 一致（正常）' : '✗ 不一致（異常）'}`);
        
        if (!fingerprintMatch) {
            console.error('フィンガープリント生成テストに失敗しました');
            return false;
        }

        // 4. 暗号化データ検証テスト
        console.log('4. 暗号化データ検証テスト');
        const validEncrypted = await TokenEncryption.encrypt('test');
        const isValidEncrypted = TokenEncryption.isEncrypted(validEncrypted);
        const isInvalidEncrypted = TokenEncryption.isEncrypted('plain_text');
        
        console.log(`   有効な暗号化データ: ${isValidEncrypted ? '✓ 正しく検出' : '✗ 検出失敗'}`);
        console.log(`   無効なデータ: ${!isInvalidEncrypted ? '✓ 正しく検出' : '✗ 検出失敗'}`);
        
        if (!isValidEncrypted || isInvalidEncrypted) {
            console.error('暗号化データ検証テストに失敗しました');
            return false;
        }

        // 5. GitHubSettingsManagerとの統合テスト
        console.log('5. GitHubSettingsManagerとの統合テスト');
        
        if (typeof GitHubSettingsManager !== 'undefined') {
            const settingsManager = new GitHubSettingsManager();
            
            // トークン保存テスト
            await settingsManager.setAccessToken(testToken);
            console.log('   トークン保存: ✓ 完了');
            
            // トークン取得テスト
            const retrievedToken = await settingsManager.getAccessToken();
            const integrationMatch = testToken === retrievedToken;
            console.log(`   トークン取得: ${integrationMatch ? '✓ 一致' : '✗ 不一致'}`);
            
            // トークン削除テスト
            settingsManager.clearAccessToken();
            const deletedToken = await settingsManager.getAccessToken();
            const isDeleted = deletedToken === null;
            console.log(`   トークン削除: ${isDeleted ? '✓ 削除確認' : '✗ 削除失敗'}`);
            
            if (!integrationMatch || !isDeleted) {
                console.error('GitHubSettingsManagerとの統合テストに失敗しました');
                return false;
            }
        } else {
            console.log('   GitHubSettingsManagerが見つかりません（スキップ）');
        }

        // 6. GitHubIntegrationClientの基本テスト
        console.log('6. GitHubIntegrationClientの基本テスト');
        
        if (typeof GitHubIntegrationClient !== 'undefined') {
            try {
                const client = new GitHubIntegrationClient();
                console.log('   クライアント初期化: ✓ 完了');
                
                // Octokitの初期化確認
                const hasOctokit = client.octokit !== null;
                console.log(`   Octokit初期化: ${hasOctokit ? '✓ 完了' : '✗ 失敗'}`);
                
                // レート制限管理の確認
                if (typeof RateLimitManager !== 'undefined') {
                    const rateLimitManager = RateLimitManager.getInstance();
                    const canMakeRequest = await rateLimitManager.canMakeRequest();
                    console.log(`   レート制限チェック: ${canMakeRequest ? '✓ 実行可能' : '⚠ 制限中'}`);
                }
                
                // エラーハンドリングの確認
                if (typeof GitHubErrorHandler !== 'undefined') {
                    console.log('   エラーハンドラー: ✓ 利用可能');
                }
                
            } catch (error) {
                console.error('   GitHubIntegrationClientテストエラー:', error);
                return false;
            }
        } else {
            console.log('   GitHubIntegrationClientが見つかりません（スキップ）');
        }

        console.log('=== すべてのテストが成功しました ===');
        return true;

    } catch (error) {
        console.error('テスト実行中にエラーが発生しました:', error);
        console.error('エラー詳細:', error.stack);
        return false;
    }
}

// テスト実行
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        // GitHub統合機能の初期化を待つ
        setTimeout(async () => {
            const success = await testTokenEncryptionIntegration();
            
            if (success) {
                console.log('🎉 TokenEncryption統合テスト完了 - すべて成功');
            } else {
                console.error('❌ TokenEncryption統合テスト完了 - 失敗あり');
            }
        }, 1000);
    });
}