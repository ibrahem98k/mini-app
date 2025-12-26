<script>
  import { requests } from '../stores/requests';
  import { categories } from '../lib/categories';
  import { currentUser } from '../stores/auth';

  let statusFilter = 'all';
  let categoryFilter = 'all';
  let search = '';
  $: mine = $requests.filter(r => !$currentUser ? false : r.userId === $currentUser.id);
  $: filtered = mine.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (categoryFilter !== 'all' && r.categoryKey !== categoryFilter) return false;
    const hay = `${r.categoryName} ${r.description} ${r.city || ''} ${r.address || ''}`.toLowerCase();
    const needle = (search||'').toLowerCase();
    if (needle && !hay.includes(needle)) return false;
    return true;
  });

  function formatDate(s) {
    try { return new Date(s).toLocaleString('ar'); } catch(e) { return s; }
  }

  function statusLabel(s) {
    if (s === 'pending') return 'قيد المراجعة';
    if (s === 'in_progress') return 'جاري التنفيذ';
    if (s === 'completed') return 'مكتمل';
    return s;
  }

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

  async function pay(r) {
    const paymentUrl = await getPaymentUrl(r.id);
    if (typeof my !== 'undefined' && my && typeof my.tradePay === 'function') {
      try {
        my.tradePay({
          paymentUrl,
          success: (res) => {
            alert(JSON.stringify(res));
          },
          fail: (res) => {
            alert(JSON.stringify(res));
          }
        });
        return;
      } catch (e) {}
    }
    window.location.href = paymentUrl;
  }
</script>

<div class="container">
  <div class="card" style="margin-bottom:12px;">
    <div class="row">
      <select class="select" bind:value={statusFilter}>
        <option value="all">كل الحالات</option>
        <option value="pending">قيد المراجعة</option>
        <option value="in_progress">جاري التنفيذ</option>
        <option value="completed">مكتمل</option>
      </select>
      <select class="select" bind:value={categoryFilter}>
        <option value="all">كل الأقسام</option>
        {#each categories as c}
          <option value={c.key}>{c.name}</option>
        {/each}
      </select>
    </div>
    <div class="spacer"></div>
    <input class="input" placeholder="بحث..." bind:value={search} />
  </div>

  {#if !$currentUser}
    <div class="card"><div class="small">يرجى تسجيل الدخول لمشاهدة طلباتك.</div></div>
  {:else if filtered.length === 0}
    <div class="card">
      <div class="small">لا توجد طلبات مطابقة. يمكنك إنشاء طلب جديد من تبويب "طلب صيانة".</div>
    </div>
  {/if}

  {#each filtered as r (r.id)}
    <div class="card req-card">
      <div class="req-header">
        <div class="req-title">
          <div class="emoji">{categories.find(c=>c.key===r.categoryKey)?.emoji}</div>
          <div>{r.categoryName}</div>
        </div>
        <div class="badge {r.status}">
          {statusLabel(r.status)}
        </div>
      </div>

      <div class="small">{formatDate(r.createdAt)}</div>

      <div>{r.description}</div>

      {#if r.photos?.length}
        <div class="thumb-row">
          {#each r.photos as p}
            <img class="thumb" src={p} alt="صورة"/>
          {/each}
        </div>
      {/if}

      <div class="small">الاسم: {r.name} • الجوال: {r.phone}</div>
      {#if r.city || r.address}
        <div class="small">الموقع: {r.city}{r.city && r.address ? ' - ' : ''}{r.address}</div>
      {/if}

      <div class="row" style="grid-template-columns: 1fr auto auto;">
        <select class="select" on:change={(e)=>requests.updateStatus(r.id, e.target.value)}>
          <option value="pending" selected={r.status==='pending'}>قيد المراجعة</option>
          <option value="in_progress" selected={r.status==='in_progress'}>جاري التنفيذ</option>
          <option value="completed" selected={r.status==='completed'}>مكتمل</option>
        </select>
        <button class="btn btn-primary" on:click={() => pay(r)}>الدفع</button>
        <button class="btn btn-danger" on:click={() => requests.remove(r.id)}>حذف</button>
      </div>
    </div>
  {/each}
</div>
