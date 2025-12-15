<script>
  import { createEventDispatcher } from 'svelte';
  import { signup, login } from '../stores/auth';

  export let mode = 'login';
  const dispatch = createEventDispatcher();

  let name = '';
  let phone = '';
  let email = '';
  let password = '';
  let confirm = '';
  let identifier = '';
  let error = '';
  let loading = false;

  async function doSignup(e) {
    e.preventDefault();
    error = '';
    if (password !== confirm) { error = 'كلمتا المرور غير متطابقتين'; return; }
    loading = true;
    const res = await signup({ name, phone, email, password });
    loading = false;
    if (!res.ok) { error = res.error || 'تعذر إنشاء الحساب'; return; }
    dispatch('success');
  }

  async function doLogin(e) {
    e.preventDefault();
    error = '';
    loading = true;
    const res = await login({ identifier, password });
    loading = false;
    if (!res.ok) { error = res.error || 'تعذر تسجيل الدخول'; return; }
    dispatch('success');
  }
</script>

<div class="card" style="margin:16px;">
  <div class="row" style="margin-bottom:10px;">
    <button class="btn" aria-pressed={mode==='login'} on:click={() => mode='login'}>تسجيل الدخول</button>
    <button class="btn" aria-pressed={mode==='signup'} on:click={() => mode='signup'}>إنشاء حساب</button>
  </div>

  {#if mode === 'login'}
    <form on:submit={doLogin}>
      <label class="label">الجوال أو البريد</label>
      <input class="input" bind:value={identifier} placeholder="05xxxxxxx أو email@example.com" required />
      <div class="spacer"></div>
      <label class="label">كلمة المرور</label>
      <input class="input" type="password" bind:value={password} placeholder="••••••••" required />

      {#if error}<div class="small" style="color: var(--danger); margin-top:8px;">{error}</div>{/if}

      <div class="spacer"></div>
      <button class="btn btn-primary" type="submit" disabled={loading}>{loading ? 'جارٍ...' : 'دخول'}</button>
    </form>
  {:else}
    <form on:submit={doSignup}>
      <label class="label">الاسم</label>
      <input class="input" bind:value={name} placeholder="اسمك الكامل" required />
      <div class="spacer"></div>
      <label class="label">الجوال</label>
      <input class="input" type="tel" bind:value={phone} placeholder="05xxxxxxx" required />
      <div class="spacer"></div>
      <label class="label">البريد (اختياري)</label>
      <input class="input" type="email" bind:value={email} placeholder="email@example.com" />
      <div class="spacer"></div>
      <div class="row">
        <div>
          <label class="label">كلمة المرور</label>
          <input class="input" type="password" bind:value={password} placeholder="••••••••" required />
        </div>
        <div>
          <label class="label">تأكيد كلمة المرور</label>
          <input class="input" type="password" bind:value={confirm} placeholder="••••••••" required />
        </div>
      </div>

      {#if error}<div class="small" style="color: var(--danger); margin-top:8px;">{error}</div>{/if}

      <div class="spacer"></div>
      <button class="btn btn-primary" type="submit" disabled={loading}>{loading ? 'جارٍ...' : 'إنشاء حساب'}</button>
    </form>
  {/if}
</div>
