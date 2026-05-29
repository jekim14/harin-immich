<!-- 성장 기록 페이지 — 표 + SVG 라인 차트 -->
<script lang="ts">
  import { growthApi, type Growth } from '$lib/harin/api';

  let items = $state<Growth[]>([]);
  let loading = $state(false);
  let creating = $state(false);
  let form = $state({
    date: new Date().toISOString().slice(0, 10),
    heightCm: '' as string,
    weightKg: '' as string,
    headCircCm: '' as string,
    note: '',
  });
  let activeMetrics = $state<Set<'height' | 'weight' | 'head'>>(new Set(['height', 'weight']));

  async function load() {
    loading = true;
    try {
      items = await growthApi.list();
    } catch (e) {
      console.error('성장 로드 실패', e);
    } finally {
      loading = false;
    }
  }

  async function save(e: SubmitEvent) {
    e.preventDefault();
    await growthApi.create({
      date: form.date,
      heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      headCircCm: form.headCircCm ? parseFloat(form.headCircCm) : null,
      note: form.note.trim(),
    });
    form = { date: new Date().toISOString().slice(0, 10), heightCm: '', weightKg: '', headCircCm: '', note: '' };
    creating = false;
    await load();
  }

  async function remove(id: string) {
    if (!confirm('이 기록을 삭제할까요?')) return;
    await growthApi.remove(id);
    await load();
  }

  function toggleMetric(m: 'height' | 'weight' | 'head') {
    const s = new Set(activeMetrics);
    s.has(m) ? s.delete(m) : s.add(m);
    activeMetrics = s;
  }

  let chart = $derived.by(() => {
    const W = 600, H = 240, padL = 40, padR = 10, padT = 20, padB = 30;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    if (items.length === 0) return { W, H, lines: [], xLabels: [], yLabels: [] };

    const series: { key: 'height' | 'weight' | 'head'; label: string; color: string; vals: (number | null)[] }[] = [];
    if (activeMetrics.has('height')) series.push({ key: 'height', label: '키 cm', color: '#e87b6b', vals: items.map((g) => g.heightCm) });
    if (activeMetrics.has('weight')) series.push({ key: 'weight', label: '몸무게 kg', color: '#9b8bd6', vals: items.map((g) => g.weightKg) });
    if (activeMetrics.has('head')) series.push({ key: 'head', label: '머리 cm', color: '#7bc8a4', vals: items.map((g) => g.headCircCm) });

    const allVals = series.flatMap((s) => s.vals.filter((v): v is number => v != null));
    const yMin = allVals.length ? Math.min(...allVals) * 0.95 : 0;
    const yMax = allVals.length ? Math.max(...allVals) * 1.05 : 1;

    const lines = series.map((s) => {
      const pts = s.vals
        .map((v, i) => {
          if (v == null) return null;
          const x = padL + (items.length > 1 ? (i / (items.length - 1)) * innerW : innerW / 2);
          const y = padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .filter(Boolean);
      return { ...s, path: pts.join(' L ') };
    });

    const xLabels = items.map((g, i) => ({
      x: padL + (items.length > 1 ? (i / (items.length - 1)) * innerW : innerW / 2),
      label: g.date.slice(5),
    }));
    const yLabels = [0, 0.5, 1].map((t) => ({
      y: padT + innerH - t * innerH,
      val: (yMin + t * (yMax - yMin)).toFixed(1),
    }));

    return { W, H, lines, xLabels, yLabels };
  });

  $effect(() => {
    load();
  });
</script>

<svelte:head><title>성장 — 하린이의 성장 일기</title></svelte:head>

<header class="header">
  <h1>📏 성장 기록</h1>
  <button class="primary" onclick={() => (creating = !creating)}>{creating ? '취소' : '+ 기록 추가'}</button>
</header>

{#if creating}
  <form class="form" onsubmit={save}>
    <div class="row">
      <label>날짜 <input type="date" bind:value={form.date} required /></label>
    </div>
    <div class="row">
      <label>키 cm <input type="number" step="0.1" bind:value={form.heightCm} placeholder="105.5" /></label>
      <label>몸무게 kg <input type="number" step="0.1" bind:value={form.weightKg} placeholder="17.2" /></label>
      <label>머리둘레 cm <input type="number" step="0.1" bind:value={form.headCircCm} placeholder="50.0" /></label>
    </div>
    <input type="text" placeholder="메모" bind:value={form.note} />
    <button type="submit" class="primary">저장</button>
  </form>
{/if}

<section class="chart">
  <div class="chips">
    <button class:active={activeMetrics.has('height')} onclick={() => toggleMetric('height')}>키</button>
    <button class:active={activeMetrics.has('weight')} onclick={() => toggleMetric('weight')}>몸무게</button>
    <button class:active={activeMetrics.has('head')} onclick={() => toggleMetric('head')}>머리둘레</button>
  </div>
  {#if items.length === 0}
    <p class="muted empty">아직 데이터가 없습니다.</p>
  {:else}
    <svg viewBox="0 0 {chart.W} {chart.H}" preserveAspectRatio="xMidYMid meet" class="chart-svg">
      {#each chart.yLabels as l}
        <line x1="40" x2={chart.W - 10} y1={l.y} y2={l.y} stroke="#eee" />
        <text x="35" y={l.y + 3} text-anchor="end" font-size="10" fill="#888">{l.val}</text>
      {/each}
      {#each chart.lines as ln}
        <path d="M {ln.path}" fill="none" stroke={ln.color} stroke-width="2" />
      {/each}
      {#each chart.xLabels as l, i}
        {#if i % Math.max(1, Math.floor(chart.xLabels.length / 6)) === 0}
          <text x={l.x} y={chart.H - 10} text-anchor="middle" font-size="10" fill="#888">{l.label}</text>
        {/if}
      {/each}
    </svg>
    <div class="legend">
      {#each chart.lines as ln}
        <span style="color:{ln.color}">● {ln.label}</span>
      {/each}
    </div>
  {/if}
</section>

<section class="table-wrap">
  <h2>기록 목록</h2>
  {#if loading}<p class="muted">불러오는 중...</p>{/if}
  <table>
    <thead>
      <tr><th>날짜</th><th>키 cm</th><th>몸무게 kg</th><th>머리 cm</th><th>메모</th><th></th></tr>
    </thead>
    <tbody>
      {#each [...items].reverse() as g (g.id)}
        <tr>
          <td>{g.date}</td>
          <td>{g.heightCm ?? '—'}</td>
          <td>{g.weightKg ?? '—'}</td>
          <td>{g.headCircCm ?? '—'}</td>
          <td>{g.note || ''}</td>
          <td><button class="delete" onclick={() => remove(g.id)}>삭제</button></td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>

<style>
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
  .form { display:grid; gap:.5rem; padding:1rem; border:1px solid #ddd; border-radius:.5rem; background:#fafafa; margin-bottom:1rem; }
  .form .row { display:flex; gap:.5rem; flex-wrap:wrap; }
  .form label { display:flex; flex-direction:column; flex:1; font-size:.85rem; color:#555; }
  .form input { padding:.5rem; border:1px solid #ccc; border-radius:.4rem; font-size:1rem; }
  button.primary { background:#4a8; color:white; border:none; padding:.5rem 1rem; border-radius:.4rem; cursor:pointer; }
  button.primary:hover { background:#3a7; }
  .chart { margin:1.5rem 0; padding:1rem; border:1px solid #eee; border-radius:.5rem; }
  .chips { display:flex; gap:.4rem; margin-bottom:.75rem; }
  .chips button { padding:.3rem .8rem; border:1px solid #ddd; background:white; border-radius:1rem; cursor:pointer; }
  .chips button.active { background:#4a8; color:white; border-color:#4a8; }
  .chart-svg { width:100%; max-width:600px; height:auto; }
  .legend { display:flex; gap:1rem; font-size:.85rem; margin-top:.5rem; }
  .table-wrap { margin-top:1.5rem; }
  table { width:100%; border-collapse:collapse; }
  th, td { padding:.5rem; border-bottom:1px solid #eee; text-align:left; }
  th { background:#f5f5f5; font-size:.85rem; }
  .delete { background:transparent; border:1px solid #d66; color:#d66; padding:.2rem .6rem; border-radius:.3rem; cursor:pointer; font-size:.8rem; }
  .muted { color:#888; }
  .empty { text-align:center; padding:1rem; }
</style>
