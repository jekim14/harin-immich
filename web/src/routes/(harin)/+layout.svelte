<!-- Harin's Moments 도메인 페이지 공통 레이아웃 + 상단 네비 -->
<script lang="ts">
  import { page } from '$app/state';

  interface Props {
    children?: import('svelte').Snippet;
  }
  let { children }: Props = $props();

  const links = [
    { href: '/dashboard', label: '🏠 대시보드' },
    { href: '/diary', label: '📔 일지' },
    { href: '/growth', label: '📏 성장' },
    { href: '/health', label: '🏥 건강' },
    { href: '/milestones', label: '🏆 마일스톤' },
    { href: '/photos', label: '📸 사진' },
    { href: '/videos', label: '🎬 동영상' },
  ];
</script>

<nav class="harin-nav">
  <div class="brand">🌸 Harin's Moments</div>
  <ul>
    {#each links as l}
      <li>
        <a href={l.href} class:active={page.url.pathname.startsWith(l.href)}>{l.label}</a>
      </li>
    {/each}
  </ul>
</nav>

<div class="harin-shell">
  {@render children?.()}
</div>

<style>
  .harin-nav {
    background: white;
    border-bottom: 1px solid #eee;
    padding: 0.6rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 2rem;
    position: sticky;
    top: 0;
    z-index: 50;
  }
  .brand { font-weight: bold; font-size: 1.05rem; }
  .harin-nav ul { list-style: none; padding: 0; margin: 0; display: flex; gap: 0.4rem; flex: 1; flex-wrap: wrap; }
  .harin-nav a {
    display: block;
    padding: 0.4rem 0.9rem;
    text-decoration: none;
    color: #555;
    border-radius: 0.4rem;
    font-size: 0.95rem;
  }
  .harin-nav a:hover { background: #f5f5f5; }
  .harin-nav a.active { background: #4a8; color: white; }
  .harin-shell {
    padding: 1.5rem;
    max-width: 1100px;
    margin: 0 auto;
  }
</style>
