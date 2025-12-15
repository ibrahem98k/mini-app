<script>
  import { createEventDispatcher } from 'svelte';
  export let current = 'home';
  const dispatch = createEventDispatcher();
  function go(tab) { dispatch('change', { tab }); }
</script>

<nav class="bottom-nav">
  <div class="bottom-nav-inner">
    <button class="tab" aria-current={current==='home' ? 'page' : undefined} on:click={() => go('home')}>
      <div class="ico">🏠</div>
      <div class="lbl">الرئيسية</div>
    </button>
    <button class="tab" aria-current={current==='new' ? 'page' : undefined} on:click={() => go('new')}>
      <div class="ico">➕</div>
      <div class="lbl">طلب صيانة</div>
    </button>
    <button class="tab" aria-current={current==='my' ? 'page' : undefined} on:click={() => go('my')}>
      <div class="ico">📋</div>
      <div class="lbl">طلباتي</div>
    </button>
    <button class="tab" aria-current={current==='account' ? 'page' : undefined} on:click={() => go('account')}>
      <div class="ico">👤</div>
      <div class="lbl">حساب</div>
    </button>
  </div>
</nav>
