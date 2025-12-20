<script>
  import { createEventDispatcher } from 'svelte';
  import { authenticateWithToken } from '../stores/auth.js';
  const dispatch = createEventDispatcher();

  let loading = false;
  let error = '';

  async function getAuthCode() {
    loading = true;
    error = '';
    
    my.getAuthCode({
      scopes: ['auth_base',"USER_ID"],
      success: async (res) => {
        try {
          const authResult = await authenticateWithToken(res.authCode);
          
          if (authResult.ok) {
            my.alert({
              content: 'تم تسجيل الدخول بنجاح!',
            });
            dispatch('success', { user: authResult.user });
          } else {
            error = authResult.error || 'فشل تسجيل الدخول';
            my.alert({
              content: error,
            });
          }
        } catch (err) {
          error = 'حدث خطأ أثناء المصادقة';
          my.alert({
            content: error,
          });
        } finally {
          loading = false;
        }
      },
      fail: (res) => {
        loading = false;
        error = 'فشل الحصول على رمز المصادقة';
        console.log(res.authErrorScopes);
        my.alert({
          content: error,
        });
      },
    });
  }
</script>

<div class="card" style="margin:16px;">
  <h3 style="text-align: center; margin-bottom: 20px;">المصادقة</h3>
  <p style="text-align: center; margin-bottom: 20px;">اضغط على زر المتابعة للحصول على رمز المصادقة</p>

  <div class="spacer"></div>
  
  {#if error}
    <div style="color: var(--danger); text-align: center; margin-bottom: 10px; font-size: 14px;">
      {error}
    </div>
  {/if}
  
  <button class="btn btn-primary" on:click={getAuthCode} disabled={loading}>
    {loading ? 'جاري المصادقة...' : 'متابعة'}
  </button>
  <p style="text-align: center; margin-top: 10px; font-size: 12px; color: var(--muted);">
    سيتم طلب رمز المصادقة من النظام
  </p>
</div>
