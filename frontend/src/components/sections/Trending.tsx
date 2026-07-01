'use client';
import React, { useState } from 'react';

const TRENDING_VIDEOS: Record<string, { id: string; title: string; channel: string; duration: string }[]> = {
  'Agentic AI 2025':            [{ id: 'kCc8FmEb1nY', title: 'Agentic AI — The Complete Guide 2025', channel: 'AI Jason', duration: '45 min' }, { id: 'mES3CHetLcI', title: 'Building AI Agents from Scratch', channel: 'Fireship', duration: '15 min' }, { id: 'MGDIm7hT4Lg', title: 'ReAct Agents Explained', channel: 'LangChain', duration: '20 min' }, { id: 'kbz88Q51Koo', title: 'Multi-Agent Systems with CrewAI', channel: 'Sam Witteveen', duration: '35 min' }, { id: 'R8A54bL26cA', title: 'LangGraph Agents — Full Tutorial', channel: 'Greg Kamradt', duration: '50 min' }],
  'LLM Models 2025':            [{ id: '7xTGNNLxyYg', title: 'How Large Language Models Work', channel: 'Andrej Karpathy', duration: '1 hr 56 min' }, { id: '95nS2tV412U', title: 'GPT-4 vs Claude vs Gemini', channel: 'Fireship', duration: '12 min' }, { id: 'zjkBMFhNj_g', title: 'Llama 3 vs GPT-4 — Which is Better?', channel: 'Matt Wolfe', duration: '15 min' }, { id: 'hfIUstzHs9A', title: 'The State of LLMs in 2025', channel: 'Two Minute Papers', duration: '9 min' }],
  'RAG Tutorial 2025':          [{ id: 'v_hR85O7Mss', title: 'RAG from Scratch — Complete Tutorial', channel: 'Greg Kamradt', duration: '55 min' }, { id: 'ySEx_BqxvGo', title: 'Advanced RAG Techniques 2025', channel: 'LangChain', duration: '40 min' }, { id: 'zjkBMFhNj_g', title: 'RAG vs Fine-Tuning — Which to Use?', channel: 'Fireship', duration: '11 min' }, { id: 'oc6RV5c1yd0', title: 'GraphRAG Tutorial with LlamaIndex', channel: 'AI Jason', duration: '32 min' }],
  'LangGraph Tutorial':         [{ id: 'e-gwvmhyoFQ', title: 'LangGraph — Build Stateful AI Agents', channel: 'Greg Kamradt', duration: '60 min' }, { id: 'X53bM_dskYc', title: 'LangGraph vs LangChain — What Changed?', channel: 'LangChain', duration: '25 min' }, { id: 'zjkBMFhNj_g', title: 'LangGraph in 10 Minutes', channel: 'Fireship', duration: '10 min' }, { id: 'oc6RV5c1yd0', title: 'Multi-Agent Workflows with LangGraph', channel: 'AI Jason', duration: '45 min' }],
  'CrewAI Tutorial 2025':       [{ id: 'aD7gHSupwK0', title: 'CrewAI — Build Multi-Agent Teams', channel: 'AI Jason', duration: '40 min' }, { id: 'kbz88Q51Koo', title: 'CrewAI Full Course 2025', channel: 'Sam Witteveen', duration: '90 min' }, { id: 'zjkBMFhNj_g', title: 'CrewAI vs AutoGen vs LangGraph', channel: 'Fireship', duration: '12 min' }],
  'Google Gemini 2.5':          [{ id: 'lG7Ui62s50s', title: 'Gemini 2.5 Pro — Full Review', channel: 'Two Minute Papers', duration: '10 min' }, { id: 'kCc8FmEb1nY', title: 'Building with Gemini API', channel: 'Google Developers', duration: '35 min' }, { id: 'zjkBMFhNj_g', title: 'Gemini 2.5 vs GPT-4o', channel: 'Fireship', duration: '9 min' }],
  'Fine-Tuning LLMs':           [{ id: '7xTGNNLxyYg', title: 'Fine-Tuning LLMs — Complete Guide 2025', channel: 'Andrej Karpathy', duration: '2 hr' }, { id: 'zjkBMFhNj_g', title: 'LoRA Fine-Tuning Explained', channel: 'Fireship', duration: '13 min' }, { id: 'oc6RV5c1yd0', title: 'QLoRA Tutorial — Fine-Tune on Free GPU', channel: 'AI Jason', duration: '40 min' }],
  'AWS Bedrock Agents':         [{ id: 'hfIUstzHs9A', title: 'AWS Bedrock Agents — Complete Guide', channel: 'AWS', duration: '45 min' }, { id: 'kCc8FmEb1nY', title: 'Building AI Apps on AWS Bedrock', channel: 'AI Jason', duration: '50 min' }, { id: 'zjkBMFhNj_g', title: 'AWS Bedrock vs Azure OpenAI', channel: 'Fireship', duration: '11 min' }],
  'MCP Protocol Tutorial':      [{ id: 'kCc8FmEb1nY', title: 'MCP — Model Context Protocol Explained', channel: 'Anthropic', duration: '20 min' }, { id: 'zjkBMFhNj_g', title: 'Building MCP Servers from Scratch', channel: 'AI Jason', duration: '38 min' }, { id: 'oc6RV5c1yd0', title: 'MCP vs Function Calling', channel: 'Fireship', duration: '10 min' }],
  'Claude Code Tutorial':       [{ id: 'zjkBMFhNj_g', title: 'Claude Code — Full Tutorial for Beginners', channel: 'Anthropic', duration: '25 min' }, { id: 'kCc8FmEb1nY', title: 'Building Apps with Claude API', channel: 'AI Jason', duration: '30 min' }, { id: 'oc6RV5c1yd0', title: 'Claude vs ChatGPT for Coding', channel: 'Fireship', duration: '10 min' }],
};

const TOPICS = Object.keys(TRENDING_VIDEOS);

export default function TrendingSection() {
  const [topic, setTopic]         = useState(TOPICS[0]);
  const [searchQ, setSearchQ]     = useState('');
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [playingId, setPlayingId]   = useState<string | null>(null);

  const videos = TRENDING_VIDEOS[topic] || [];

  function playVideo(idx: number, id: string) {
    setPlayingIdx(idx);
    setPlayingId(id);
  }

  function ytSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQ.trim()) return;
    window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(searchQ)}`, '_blank');
  }

  return (
    <section id="section-trending" className="content-section active">
      <div className="section-header">
        <div>
          <h2>🔥 Trending Topics</h2>
          <p className="section-subtitle">Curated videos on the hottest AI topics</p>
        </div>
      </div>

      {/* Search */}
      <form className="yt-search-bar" onSubmit={ytSearch}>
        <span className="yt-search-icon">🔍</span>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Search YouTube for any AI topic..." />
        <button className="btn-yt-search" type="submit">Search</button>
      </form>

      {/* Topic Chips */}
      <div className="yt-topic-chips">
        {TOPICS.map(t => (
          <button key={t} className={`yt-chip${topic === t ? ' active' : ''}`} onClick={() => { setTopic(t); setPlayingIdx(null); setPlayingId(null); }}>
            {t}
          </button>
        ))}
      </div>

      {/* Active label + YouTube link */}
      <div className="yt-active-label">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--white)' }}>{topic}</h3>
        <a className="yt-open-all" href={`https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}`} target="_blank" rel="noreferrer">
          View all on YouTube ↗
        </a>
      </div>

      {/* Video Grid */}
      <div className="yt-video-grid">
        {videos.map((v, i) => (
          <div key={i} className={`yt-card${playingIdx === i ? ' playing' : ''}`}>
            <div className="yt-thumb-wrap" onClick={() => playVideo(i, v.id)}>
              {playingIdx === i && playingId === v.id ? (
                <iframe
                  className="yt-iframe"
                  src={`https://www.youtube.com/embed/${v.id}?autoplay=1&rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img className="yt-thumb" src={`https://img.youtube.com/vi/${v.id}/mqdefault.jpg`} alt={v.title} loading="lazy"
                    onError={e => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${v.id}/0.jpg`; }} />
                  <div className="yt-play-btn">▶</div>
                  <span className="yt-duration">{v.duration}</span>
                </>
              )}
            </div>
            <div className="yt-card-body">
              <h4 className="yt-card-title">{v.title}</h4>
              <p className="yt-card-channel">📺 {v.channel}</p>
              <div className="yt-card-actions">
                <button className="btn-yt-play" onClick={() => playVideo(i, v.id)}>▶ Watch</button>
                <a className="btn-yt-open" href={`https://www.youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer">↗ YouTube</a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
