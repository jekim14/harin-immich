<!-- 대시보드 — 통계 + 최근 활동 + 다가오는 접종 -->
<script lang="ts">
  import { diaryApi, growthApi, healthApi, milestoneApi, type Diary, type Growth, type HealthRecord, type Milestone } from '$lib/harin/api';

  let diary = $state<Diary[]>([]);
  let growth = $state<Growth[]>([]);
  let vaccinations = $state<HealthRecord[]>([]);
  let milestones = $state<Milestone[]>([]);
  let loading = $state(true);

  async function loadAll() {
    loading = true;
    try {
      const [d, g, v, m] = await Promise.all([
        diaryApi.list().catch(() => []),
        growthApi.list().catch(() => []),
        healthApi.list('vaccination').catch(() => []),
        milestoneApi.list().catch(() => []),
      ]);
      diary = d;
      growth = g;
      vaccinations = v;
      milestones = m;
    } finally {
      loading = false;
    }
  }

  let latestGrowth = $derived(growth.length > 0 ? growth[growth.length - 1] : null);

  let recent = $derived.by(() => {
    const items: Array<{ icon: string; bg: string; title: string; date: string; href: string }> = [];
    diary.slice(0, 3).forEach((d) =>
      items.push({ icon: '📔', bg: '#fde9e3', title: d.title, date: d.date, href: '/diary' }),
    );
    [...growth].reverse().slice(0, 2).forEach((g) =>
      items.push({
        icon: '📏',
        bg: '#e8e3f4',
        title: `키 ${g.heightCm ?? '—'}cm / 몸무게 ${g.weightKg ?? '—'}kg`,
        date: g.date,
        href: '/growth',
      }),
    );
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
  });

  let upcoming = $derived(vaccinations.filter((v) => !(v.extra as Record<string, unknown>)?.completedDate).slice(0, 3));

  let achievedCount = $derived(milestones.filter((m) => m.achievedDate).length);

  $effect(() => {
    loadAll();
  });
</script>

<svelte:head><title>대시보드 — 하린이의 성장 일기</title></svelte:head>

<header class="header">
  <h1>🌸 하린이의 성장 일기</h1>
  <p class="subtitle">소중한 순간을 기록하세요</p>
</header>

{#if loading}
  <p class="muted">불러오는 중...</p>
{:else}
  <section class="stats">
    <div class="stat">
      <div class="value">{latestGrowth?.heightCm ?? '—'}</div>
      <div class="label">키 cm</div>
    </div>
    <div class="stat">
      <div class="value">{latestGrowth?.weightKg ?? '—'}</div>
      <div class="label">몸무게 kg</div>
    </div>
    <div class="stat">
      <div class="value">{latestGrowth?.headCircCm ?? '—'}</div>
      <div class="label">머리 cm</div>
    </div>
    <div class="stat">
      <div class="value">{achievedCount}</div>
      <div class="label">달성 마일스톤</div>
    </div>
  </section>

  <section class="card">
    <h2>⏰ 최근 활동</h2>
    {#if recent.length === 0}
      <p class="muted empty">아직 기록이 없습니다. 첫 기록을 시작해 보세요.</p>
    {:else}
      <ul>
        {#each recent as r}
          <li>
            <span class="icon" style="background:{r.bg}">{r.icon}</span>
            <div class="info">
              <h4>{r.title}</h4>
              <time>{r.date}</time>
            </div>
            <a href={r.href} class="arrow">→</a>
          </li>
        {/each}
      </ul>
    {/if}
  </section>

  <section class="card">
    <div class="card-head">
      <h2>💉 다가오는 접종</h2>
      <a href="/health">전체 보기</a>
    </div>
    {#if upcoming.length === 0}
      <p class="muted empty">모든 접종이 완료되었습니다 🎉</p>
    {:else}
      <ul>
        {#each upcoming as v}
          <li>
            <span class="icon" style="background:#e3f4eb">💉</span>
            <div class="info">
              <h4>{v.title}</h4>
              <time>{(v.extra as Record<string, string>)?.schedule || ''}</time>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </section>
{/if}

<style>
  .header { text-align: center; margin-bottom: 2rem; }
  .header h1 { margin: 0; font-size: 1.75rem; }
  .subtitle { color: #888; margin: 0.3rem 0 0; }

  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .stat {
    background: white;
    border: 1px solid #eee;
    border-radius: 0.6rem;
    padding: 1rem;
    text-align: center;
  }
  .stat .value { font-size: 1.8rem; font-weight: bold; color: #4a8; }
  .stat .label { color: #888; font-size: 0.85rem; margin-top: 0.3rem; }

  .card {
    background: white;
    border: 1px solid #eee;
    border-radius: 0.6rem;
    padding: 1rem 1.25rem;
    margin-bottom: 1rem;
  }
  .card h2 { margin: 0 0 0.75rem; font-size: 1.1rem; }
  .card-head { display: flex; justify-content: space-between; align-items: center; }
  .card-head a { color: #4a8; text-decoration: none; font-size: 0.9rem; }

  ul { list-style: none; padding: 0; margin: 0; }
  li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.6rem 0;
    border-bottom: 1px solid #f5f5f5;
  }
  li:last-child { border-bottom: none; }
  .icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 1.1rem;
  }
  .info { flex: 1; }
  .info h4 { margin: 0; font-size: 1rem; }
  .info time { color: #888; font-size: 0.85rem; }
  .arrow { color: #ccc; text-decoration: none; font-size: 1.2rem; }
  .muted { color: #888; }
  .empty { text-align: center; padding: 1.5rem; }
</style>
