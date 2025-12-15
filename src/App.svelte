<script>
  import BottomNav from './components/BottomNav.svelte';
  import RequestForm from './components/RequestForm.svelte';
  import RequestsList from './components/RequestsList.svelte';
  import { categories } from './lib/categories';
  import { theme } from './stores/theme';
  import { currentUser } from './stores/auth';
  import Account from './components/Account.svelte';
  import { requests } from './stores/requests';

  let tab = 'home';
  let toast = '';
  let preselectedCategory = '';
  let pendingTab = null;
  $: current = tab;

  function onTabChange(e) {
    const t = e.detail.tab;
    if (t === 'new' || t === 'my') {
      if (!ensureAuth(t)) return;
    }
    tab = t;
  }

  function quickSelect(key) {
    preselectedCategory = key;
    if (!ensureAuth('new')) return;
    tab = 'new';
  }

  let clearToastTimeout;
  function showToast(msg) {
    toast = msg;
    clearTimeout(clearToastTimeout);
    clearToastTimeout = setTimeout(() => { toast = ''; }, 1800);
  }

  function ensureAuth(next) {
    if ($currentUser) return true;
    pendingTab = next;
    tab = 'account';
    showToast('يرجى تسجيل الدخول أولاً');
    return false;
  }

  function onLoggedIn() {
    const go = pendingTab;
    pendingTab = null;
    // migrate existing requests to current user if they were created before auth
    requests.update((list) => list.map(r => r.userId ? r : { ...r, userId: $currentUser?.id || null }));
    if (go) tab = go;
    showToast('تم تسجيل الدخول');
  }
</script>

<header class="header">
  <div class="header-inner">
    <div class="brand">
      <div class="brand-badge">🧰</div>
      <div>صيانتي</div>
    </div>
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="theme-toggle" title="تبديل المظهر" on:click={() => theme.toggle()}>{$theme==='dark' ? '☀️' : '🌙'}</button>
      <button class="btn" on:click={() => onTabChange({ detail: { tab: 'account' } })}>{$currentUser ? 'حسابي' : 'دخول'}</button>
    </div>
  </div>
</header>

{#if tab === 'home'}
  <div class="hero">
    <h1>كل خدمات الصيانة في تطبيق واحد</h1>
    <p>فنيون موثوقون للمنزل والعمل. اطلب الآن وتابع حالة الطلب بسهولة.</p>
    <div style="margin-top:10px; display:flex; gap:8px;">
      <button class="btn btn-primary" on:click={() => { if(ensureAuth('new')) tab='new'; }}>طلب صيانة الآن</button>
      <button class="btn" on:click={() => onTabChange({ detail:{ tab: 'my' }})}>عرض طلباتي</button>
    </div>
  </div>

  <div class="section-title">أقسام شائعة</div>
  <div class="grid">
    {#each categories as c}
      <button class="category" on:click={() => quickSelect(c.key)}>
        <div class="emoji">{c.emoji}</div>
        <div class="name">{c.name}</div>
      </button>
    {/each}
  </div>
{/if}

{#if tab === 'new'}
  <RequestForm {preselectedCategory} on:submitted={() => { tab='my'; showToast('تم إرسال طلبك'); }} />
{/if}

{#if tab === 'my'}
  <RequestsList />
{/if}

{#if tab === 'account'}
  <Account on:loggedIn={onLoggedIn} />
{/if}

<BottomNav {current} on:change={onTabChange} />

{#if toast}
  <div class="toast">{toast}</div>
{/if}
