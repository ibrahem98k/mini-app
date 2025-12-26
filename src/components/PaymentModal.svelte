<script>
  import { session } from '../stores/auth';
  export let show = false;
  export let requestId = '';
  export let fee = 0;

  let loading = false;
  let error = '';

  async function getPaymentUrl(orderId) {
    try {
      const res = await fetch(`/api/payment-url?orderId=${encodeURIComponent(orderId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && (data.redirectUrl || data.paymentUrl)) {
          return data.redirectUrl || data.paymentUrl;
        }
      }
    } catch (e) {}
    return `https://www.wallet.com/cashier?orderId=${encodeURIComponent(orderId)}`;
  }

  async function getAuthToken() {
    try {
      if ($session?.authToken) return $session.authToken;
      if ($session?.token) return $session.token;
      if (typeof my !== 'undefined' && my && typeof my.getAuthCode === 'function') {
        return await new Promise((resolve) => {
          my.getAuthCode({
            scopes: ['auth_base'],
            success: (res) => resolve(res.authCode || ''),
            fail: () => resolve('')
          });
        });
      }
    } catch (e) {}
    return '';
  }

  async function pay() {
    loading = true;
    error = '';
    let url = '';
    const token = await getAuthToken();
    try {
      const res = await fetch('https://its.mouamle.space/api/payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && (data.url || data.paymentUrl || data.redirectUrl)) {
          url = data.url || data.paymentUrl || data.redirectUrl;
        }
      }
    } catch (e) {}
    if (!url) url = await getPaymentUrl(requestId);
    if (typeof my !== 'undefined' && my && typeof my.tradePay === 'function') {
      try {
        my.tradePay({
          paymentUrl: url,
          success: (res) => {
            alert(JSON.stringify(res));
            close();
          },
          fail: (res) => {
            alert(JSON.stringify(res));
            close();
          }
        });
        return;
      } catch (e) {}
    }
    window.location.href = url;
  }

  function close() {
    show = false;
    loading = false;
    error = '';
  }

  function handleKeydown(e) {
    if (e.key === 'Escape' && show) close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />
{#if show}
  <div class="modal-root">
    <button class="modal-backdrop" type="button" aria-label="Close modal" on:click={close}></button>
    <div class="modal" role="dialog" aria-modal="true" tabindex="-1">
      <div class="modal-header">
        <h2>الدفع</h2>
        <button class="close-btn" type="button" on:click={close}>×</button>
      </div>

      <div class="modal-body">
        <div class="fee-row">
          <span>رسوم الخدمة</span>
          <span class="fee">{new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD' }).format(fee)}</span>
        </div>

        {#if error}
          <div class="error">{error}</div>
        {/if}

        <button class="btn btn-primary" on:click={pay} disabled={loading}>
          {loading ? 'جاري الدفع...' : 'ادفع الآن'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-root {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    border: none;
    padding: 0;
    margin: 0;
    cursor: default;
  }

  .modal {
    background: var(--surface);
    border-radius: var(--radius);
    padding: 20px;
    max-width: 360px;
    width: 90%;
    box-shadow: var(--shadow);
    position: relative;
    z-index: 1001;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .modal-header h2 {
    margin: 0;
    font-size: 20px;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    line-height: 1;
  }

  .modal-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .fee-row {
    display: flex;
    justify-content: space-between;
    font-size: 18px;
    font-weight: 600;
  }

  .fee {
    color: var(--primary);
  }

  .error {
    color: var(--danger);
    font-size: 14px;
  }
</style>
