import { createSignal } from "solid-js";
import { useI18n } from "@utsukta/spa-core/i18n";
import { encryptBody, isEncryptedBody, decryptPayload, extractCryptPayload } from "@utsukta/spa-core/lib/postCrypto";

/**
 * Shared encrypt state + logic for all composers.
 * Call once inside the component body and pass store.body / store.setBody.
 */
export function useEncrypt(getBody: () => string, setBody: (b: string) => void) {
  const { t } = useI18n();

  const [open, setOpen]       = createSignal(false);
  const [password, setPassword] = createSignal("");
  const [confirm, setConfirm]   = createSignal("");
  const [hint, setHint]         = createSignal("");
  const [encrypting, setEncrypting] = createSignal(false);
  const [error, setError]       = createSignal("");

  // ── Decrypt-to-edit — reveals the plaintext of an already-encrypted body
  // so it can be modified, since WYSIWYG/Source can only ever show ciphertext
  // otherwise. Re-encrypting afterward (if desired) goes through doEncrypt()
  // above like any other new content, once the body no longer looks encrypted.
  const [decryptOpen, setDecryptOpen] = createSignal(false);
  const [decryptPassword, setDecryptPassword] = createSignal("");
  const [decrypting, setDecrypting] = createSignal(false);
  const [decryptError, setDecryptError] = createSignal("");

  async function doDecrypt() {
    const pw = decryptPassword().trim();
    if (!pw) { setDecryptError(t("editor.decrypt_error_no_password")); return; }

    setDecrypting(true);
    setDecryptError("");
    try {
      const plain = await decryptPayload(extractCryptPayload(getBody()), pw);
      setBody(plain);
      setDecryptOpen(false);
      setDecryptPassword("");
    } catch (err) {
      setDecryptError(err instanceof Error ? err.message : "Decryption failed");
    } finally {
      setDecrypting(false);
    }
  }

  function resetDecrypt() {
    setDecryptOpen(false);
    setDecryptPassword("");
    setDecryptError("");
  }

  async function doEncrypt() {
    const body = getBody().trim();
    if (!body)              { setError(t("editor.encrypt_error_empty"));       return; }
    if (isEncryptedBody(body)) { setError(t("editor.encrypt_error_already")); return; }
    const pw = password().trim();
    if (!pw)                { setError(t("editor.encrypt_error_no_password")); return; }
    if (pw !== confirm().trim()) { setError(t("editor.encrypt_error_mismatch")); return; }

    setEncrypting(true);
    setError("");
    try {
      setBody(await encryptBody(body, pw, hint().trim()));
      setOpen(false);
      setPassword("");
      setConfirm("");
      setHint("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Encryption failed");
    } finally {
      setEncrypting(false);
    }
  }

  function reset() {
    setOpen(false);
    setPassword("");
    setConfirm("");
    setHint("");
    setError("");
    resetDecrypt();
  }

  return {
    open, setOpen,
    password, setPassword,
    confirm, setConfirm,
    hint, setHint,
    encrypting, error,
    doEncrypt, reset,
    decryptOpen, setDecryptOpen,
    decryptPassword, setDecryptPassword,
    decrypting, decryptError,
    doDecrypt, resetDecrypt,
  };
}
