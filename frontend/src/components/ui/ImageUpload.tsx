'use client';
import React, { useRef, useState, DragEvent } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ImageUploadProps {
  value: string;           // current URL (empty = none)
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({ value, onChange, label = 'Thumbnail Image' }: ImageUploadProps) {
  const [dragging, setDragging]   = useState(false);
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError('');
    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const token = JSON.parse(localStorage.getItem('aai_session') || 'null')?.token;
      const res = await fetch(`${API}/api/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(err.detail);
      }
      const data = await res.json();
      onChange(`${API}${data.url}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    uploadFile(files[0]);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const inputStyle: React.CSSProperties = {
    background: dragging ? 'rgba(124,58,237,0.12)' : 'rgba(255,255,255,0.03)',
    border: `2px dashed ${dragging ? '#7c3aed' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: 10,
    padding: '18px 16px',
    textAlign: 'center' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative' as const,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>{label}</label>

      {/* Preview */}
      {value && (
        <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 6 }}>
          <img src={value} alt="Preview" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{ position: 'absolute', top: 6, right: 6, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >×</button>
        </div>
      )}

      {/* Drop zone */}
      {!value && (
        <div
          style={inputStyle}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
        >
          {loading ? (
            <div style={{ color: '#a78bfa', fontSize: '0.82rem' }}>
              <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>⏳</div>
              Uploading…
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '1.6rem', marginBottom: 6 }}>🖼️</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 4 }}>
                {dragging ? 'Drop to upload' : 'Drag & drop or click to upload'}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>JPG, PNG, WebP — max 5 MB</div>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* URL input alternative */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Or paste image URL…"
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '7px 12px', color: '#e2e8f0', fontSize: '0.8rem', outline: 'none', fontFamily: 'inherit' }}
        />
        {value && (
          <button type="button" onClick={() => onChange('')}
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '0.75rem', whiteSpace: 'nowrap', fontFamily: 'inherit' }}>
            Clear
          </button>
        )}
      </div>

      {error && <div style={{ fontSize: '0.75rem', color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 7, padding: '6px 10px' }}>{error}</div>}
    </div>
  );
}
