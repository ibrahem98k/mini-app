<script>
  import { createEventDispatcher } from 'svelte';
  import CategoryPicker from './CategoryPicker.svelte';
  import { requests, makeId } from '../stores/requests';
  import { getCategory } from '../lib/categories';
  import { currentUser } from '../stores/auth';

  export let preselectedCategory = '';

  let name = '';
  let phone = '';
  let city = '';
  let address = '';
  let description = '';
  let preferredDate = '';
  let category = preselectedCategory || '';
  let photos = [];
  let error = '';

  const dispatch = createEventDispatcher();

  function onFilesChange(e) {
    const files = Array.from(e.target.files || []).slice(0, 3);
    photos = [];
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = () => {
        photos = [...photos, reader.result];
      };
      reader.readAsDataURL(f);
    });
  }

  function submit(e) {
    e.preventDefault();
    error = '';
    if (!category) { error = 'يرجى اختيار نوع الصيانة'; return; }
    if (!name || !phone) { error = 'يرجى إدخال الاسم والجوال'; return; }
    if (!description) { error = 'يرجى وصف المشكلة'; return; }
    const cat = getCategory(category);
    const data = {
      id: makeId(),
      userId: $currentUser?.id || null,
      name,
      phone,
      city,
      address,
      description,
      preferredDate,
      categoryKey: category,
      categoryName: cat ? cat.name : '',
      photos,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    requests.addRequest(data);
    name = '';
    phone = '';
    city = '';
    address = '';
    description = '';
    preferredDate = '';
    category = preselectedCategory || '';
    photos = [];
    dispatch('submitted', { request: data });
  }

  // Prefill from current user if present
  $: if ($currentUser) {
    if (!name) name = $currentUser.name || '';
    if (!phone) phone = $currentUser.phone || '';
  }
</script>

<div class="container">
  <div class="card" style="margin-bottom:12px;">
    <form on:submit={submit}>
      <label class="label">اختر نوع الصيانة</label>
      <CategoryPicker bind:value={category} />

      <div class="spacer"></div>

      <div class="row">
        <div>
          <label class="label">الاسم</label>
          <input class="input" bind:value={name} placeholder="اسمك الكامل" required />
        </div>
        <div>
          <label class="label">الجوال</label>
          <input class="input" type="tel" bind:value={phone} placeholder="05xxxxxxx" required />
        </div>
      </div>

      <div class="spacer"></div>

      <div class="row">
        <div>
          <label class="label">المدينة</label>
          <input class="input" bind:value={city} placeholder="اختياري" />
        </div>
        <div>
          <label class="label">التاريخ المناسب</label>
          <input class="input" type="date" bind:value={preferredDate} />
        </div>
      </div>

      <div class="spacer"></div>

      <div>
        <label class="label">العنوان</label>
        <input class="input" bind:value={address} placeholder="الحي - الشارع - رقم المنزل" />
      </div>

      <div class="spacer"></div>

      <div>
        <label class="label">وصف المشكلة</label>
        <textarea class="textarea" rows="4" bind:value={description} placeholder="اكتب تفاصيل المشكلة" required></textarea>
      </div>

      <div class="spacer"></div>

      <div>
        <label class="label">صور المشكلة (حتى 3)</label>
        <input class="input" type="file" accept="image/*" multiple on:change={onFilesChange} />
        {#if photos.length}
          <div class="thumb-row" style="margin-top:8px;">
            {#each photos as p}
              <img class="thumb" src={p} alt="صورة"/>
            {/each}
          </div>
        {/if}
      </div>

      {#if error}
        <div class="small" style="color: var(--danger); margin-top:8px;">{error}</div>
      {/if}

      <div class="spacer"></div>

      <button class="btn btn-primary" type="submit">إرسال الطلب</button>
    </form>
  </div>
</div>
