/**
 * Personal Access Tokenの暗号化・復号化を行うクラス
 * ブラウザの crypto.subtle API を使用してセキュアな暗号化を実現
 */
class TokenEncryption {
  /**
   * パスワードとソルトから暗号化キーを導出
   * @param {string} password - パスワード文字列
   * @param {Uint8Array} salt - ソルト
   * @returns {Promise<CryptoKey>} 導出された暗号化キー
   */
  static async deriveKey(password, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * トークンを暗号化
   * @param {string} token - 暗号化するトークン
   * @returns {Promise<string>} Base64エンコードされた暗号化データ
   */
  static async encrypt(token) {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    
    // ユーザーのブラウザ固有の情報からパスワードを生成
    const password = await this.generateBrowserFingerprint();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await this.deriveKey(password, salt);
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      data
    );
    
    // salt + iv + encrypted data を結合
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encrypted), salt.length + iv.length);
    
    // Base64エンコードして返す
    return btoa(String.fromCharCode(...combined));
  }

  /**
   * 暗号化されたトークンを復号化
   * @param {string} encryptedData - Base64エンコードされた暗号化データ
   * @returns {Promise<string>} 復号化されたトークン
   */
  static async decrypt(encryptedData) {
    const combined = new Uint8Array(
      atob(encryptedData).split('').map(char => char.charCodeAt(0))
    );
    
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encrypted = combined.slice(28);
    
    const password = await this.generateBrowserFingerprint();
    const key = await this.deriveKey(password, salt);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encrypted
    );
    
    return new TextDecoder().decode(decrypted);
  }

  /**
   * ブラウザ固有の情報を組み合わせてフィンガープリントを生成
   * @returns {Promise<string>} SHA-256ハッシュ化されたフィンガープリント
   */
  static async generateBrowserFingerprint() {
    // ブラウザ固有の情報を組み合わせてパスワードを生成
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset().toString(),
      'spec-tracking-site-salt' // アプリケーション固有のソルト
    ].join('|');
    
    const encoder = new TextEncoder();
    const data = encoder.encode(fingerprint);
    const hash = await crypto.subtle.digest('SHA-256', data);
    
    return Array.from(new Uint8Array(hash))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * 暗号化機能がサポートされているかチェック
   * @returns {boolean} サポートされている場合はtrue
   */
  static isSupported() {
    return (
      typeof crypto !== 'undefined' &&
      typeof crypto.subtle !== 'undefined' &&
      typeof crypto.getRandomValues !== 'undefined'
    );
  }

  /**
   * トークンが暗号化されているかチェック
   * @param {string} data - チェックするデータ
   * @returns {boolean} 暗号化されている場合はtrue
   */
  static isEncrypted(data) {
    try {
      // Base64デコードを試行
      const decoded = atob(data);
      // 最小長をチェック（salt 16 + iv 12 + 最小暗号化データ）
      return decoded.length >= 28;
    } catch (error) {
      return false;
    }
  }

  /**
   * 暗号化エラーのハンドリング
   * @param {Error} error - 発生したエラー
   * @returns {string} ユーザーフレンドリーなエラーメッセージ
   */
  static handleEncryptionError(error) {
    if (error.name === 'NotSupportedError') {
      return 'お使いのブラウザは暗号化機能をサポートしていません。最新のブラウザをご利用ください。';
    } else if (error.name === 'InvalidAccessError') {
      return '暗号化処理でアクセスエラーが発生しました。ページを再読み込みしてお試しください。';
    } else if (error.name === 'OperationError') {
      return '暗号化処理中にエラーが発生しました。データが破損している可能性があります。';
    } else {
      return `暗号化エラー: ${error.message}`;
    }
  }
}

// モジュールとしてエクスポート（必要に応じて）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TokenEncryption;
}