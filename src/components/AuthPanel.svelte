<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  let loading = false;

  function getAuthCode() {
    loading = true;
    my.getAuthCode({
      scopes: ['auth_base'],
      success: (res) => {
        loading = false;
        my.alert({
          content: res.authCode,
        });
        dispatch('success');
      },
      fail: (res) => {
        loading = false;
        console.log(res.authErrorScopes);
      },
    });
  }
</script>

<div class="card" style="margin:16px;">
  <h3 style="text-align: center; margin-bottom: 20px;">المصادقة</h3>
  <p style="text-align: center; margin-bottom: 20px;">اضغط على زر المتابعة للحصول على رمز المصادقة</p>

  <div class="spacer"></div>
  <button class="btn btn-primary" on:click={getAuthCode} disabled={loading}>
    {loading ? 'جارٍ...' : 'متابعة'}
  </button>
  <p style="text-align: center; margin-top: 10px; font-size: 12px; color: var(--muted);">
    سيتم طلب رمز المصادقة من النظام
  </p>
</div>
