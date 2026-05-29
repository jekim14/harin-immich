<!-- 마일스톤 페이지 — 카테고리 필터, 카드 그리드, 달성 토글 -->
<script lang="ts">
  import { milestoneApi, type Milestone, type MilestoneCategory } from '$lib/harin/api';

  let items = $state<Milestone[]>([]);
  let loading = $state(false);
  let filter = $state<MilestoneCategory | 'all'>('all');
  let creating = $state(false);
  let form = $state({
    category: 'physical' as MilestoneCategory,
    title: '',
    emoji: '⭐',
    achievedDate: '',
    note: '',
  });

  const EMOJI_BY_CATEGORY: Record<MilestoneCategory, string> = {
    physical: '🏃',
    language: '💬',
    social: '🤝',
    cognitive: '🧠',
  };

  async function load() {
    loading = true;
    try {
      items = await milestoneApi.list(filter === 'all' ? undefined : filter);
    } catch (e) {
      console.error('milestone 로드 실패', e);
      items = [];
    } finally {
      loading = false;
    }
  }

  async function save(e: SubmitEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await milestoneApi.create({
      category: form.category,
      title: form.title.trim(),
      emoji: form.emoji || EMOJI_BY_CATEGORY[form.category],
      achievedDate: form.achievedDate || null,
      note: form.note.trim(),
      assetIds: [],
    });
    if (form.achievedDate) celebrate();
    form = { category: 'physical', title: '', emoji: '⭐', achievedDate: '', note: '' };
    creating = false;
    await load();
  }

  async function toggleAchieved(m: Milestone) {
    const next = m.achievedDate ? null : new Date().toISOString().slice(0, 10);
    await milestoneApi.update(m.id, { achievedDate: next });
    if (next) celebrate();
    await load();
  }

  async function remove(id: string) {
    if (!confirm('이 마일스톤을 삭제할까요?')) return;
    await milestoneApi.remove(id);
    await load();
  }

  // 간단 컨페티 — DOM에 spans 흩뿌리기
  function celebrate() {
    const root = document.createElement('div');
    root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden';
    const colors = ['#e87b6b', '#9b8bd6', '#7bc8a4', '#f5d76e', '#f48fb1'];
    for (let i = 0; i < 60; i++) {
      const s = document.createElement('span');
      const c = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const dur = 1.5 + Math.random();
      const delay = Math.random() * 0.5;
      s.style.cssText = `position:absolute;top:-10px;left:${left}%;width:8px;height:14px;background:${c};border-radius:2px;transform:rotate(${Math.random() * 360}deg);animation:harin-fall ${dur}s ${delay}s ease-out forwards`;
      root.appendChild(s);
    }
    const style = document.createElement('style');
    style.textContent = `@keyframes harin-fall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`;
    root.appendChild(style);
    document.body.appendChild(root);
    setTimeout(() => root.remove(), 3000);
  }

  $effect(() => {
    load();
  });
</script>

<svelte:head><title>마일스톤 — 하린이의 성장 일기</title></svelte:head>

<header class="header">
  <h1>🏆 발달 마일스톤</h1>
  <button class="primary" onclick={() => (creating = !creating)}>{creating ? '취소' : '+ 마일스톤'}</button>
</header>

<nav class="filters">
  <button class:active={filter === 'all'} onclick={() => { filter = 'all'; load(); }}>전체</button>
  <button class:active={filter === 'physical'} onclick={() => { filter = 'physical'; load(); }}>🏃 신체</button>
  <button class:active={filter === 'language'} onclick={() => { filter = 'language'; load(); }}>💬 언어</button>
  <button class:active={filter === 'social'} onclick={() => { filter = 'social'; load(); }}>🤝 사회성</button>
  <button class:active={filter === 'cognitive'} onclick={() => { filter = 'cognitive'; load(); }}>🧠 인지</button>
</nav>

{#if creating}
  <form class="form" onsubmit={save}>
    <div class="row">
      <select bind:value={form.category}>
        <option value="physical">🏃 신체</option>
        <option value="language">💬 언어</option>
        <option value="social">🤝 사회성</option>
        <option value="cognitive">🧠 인지</option>
      </select>
      <input type="date" bind:value={form.achievedDate} />
    </div>
    <input type="text" placeholder="마일스톤 제목 (예: 자전거 타기 성공!)" bind:value={form.title} required />
    <input type="text" placeholder="이모지" bind:value={form.emoji} maxlength="2" />
    <textarea placeholder="메모" bind:value={form.note} rows="2"></textarea>
    <button type="submit" class="primary">저장</button>
  </form>
{/if}

{#if loading}<p class="muted">불러오는 중...</p>{/if}

<div class="grid">
  {#each items as m (m.id)}
    <article class="card {m.achievedDate ? 'achieved' : ''}" onclick={() => toggleAchieved(m)} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && toggleAchieved(m)}>
      <div class="emoji">{m.emoji}</div>
      <h4>{m.title}</h4>
      {#if m.note}<p class="note">{m.note}</p>{/if}
      <div class="status">
        {m.achievedDate ? `🎉 ${m.achievedDate}` : '⏳ 미달성'}
      </div>
      <button class="x" onclick={(e) => { e.stopPropagation(); remove(m.id); }}>✕</button>
    </article>
  {/each}
</div>

<style>
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
  .filters { display:flex; gap:.4rem; flex-wrap:wrap; margin-bottom:1rem; }
  .filters button { padding:.3rem .8rem; border:1px solid #ddd; background:white; border-radius:1rem; cursor:pointer; }
  .filters button.active { background:#4a8; color:white; border-color:#4a8; }
  .form { display:grid; gap:.5rem; padding:1rem; border:1px solid #ddd; border-radius:.5rem; background:#fafafa; margin-bottom:1rem; }
  .form .row { display:flex; gap:.5rem; }
  .form input, .form select, .form textarea { padding:.5rem; border:1px solid #ccc; border-radius:.4rem; font-size:1rem; }
  button.primary { background:#4a8; color:white; border:none; padding:.5rem 1rem; border-radius:.4rem; cursor:pointer; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(180px, 1fr)); gap:.75rem; }
  .card { position:relative; border:1px solid #eee; border-radius:.6rem; padding:1rem; text-align:center; background:white; cursor:pointer; transition:transform .15s; }
  .card:hover { transform:translateY(-2px); }
  .card.achieved { background:linear-gradient(135deg, #fff8dc, #ffe4e1); border-color:#f48fb1; }
  .emoji { font-size:2.2rem; }
  .card h4 { margin:.4rem 0; font-size:1rem; }
  .note { color:#666; font-size:.85rem; }
  .status { margin-top:.5rem; font-size:.85rem; color:#888; }
  .card.achieved .status { color:#d63384; font-weight:bold; }
  .x { position:absolute; top:.3rem; right:.5rem; background:transparent; border:none; color:#999; cursor:pointer; }
  .muted { color:#888; }
</style>
