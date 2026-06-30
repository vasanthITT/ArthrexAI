'use client';
import React, { useState } from 'react';
import EnrollModal from '@/components/ui/EnrollModal';

// ── Course Data (exact same as original index.html) ──────────────────────────
export const COURSE_SECTIONS = [
  {
    id: 'agentic', title: '🤖 Agentic AI', subtitle: 'Build autonomous AI systems that reason and act',
    filters: ['All', 'Professional', 'Cloud Based', 'Enterprise'],
    subsections: [
      {
        title: '⭐ Professional Programs', icon: '⭐',
        courses: [
          { title: 'Professional Agentic AI Engineer', tag: 'Agentic AI', badge: '🏆 Flagship', badgeCls: '', desc: 'Master LangChain, LangGraph, CrewAI, MCP, AWS Bedrock, and Azure AI for enterprise agentic systems.', meta: ['⏱ 6 Months', '⭐ 4.9', '👥 2.4k enrolled'], filter: 'professional' },
          { title: 'Advanced GPT Engineering', tag: 'Agentic AI', badge: '🔬 Advanced', badgeCls: 'advanced-badge', desc: 'Advanced prompt engineering, GPT fine-tuning, tool use, and production deployment of GPT-based systems.', meta: ['⏱ 3 Months', '⭐ 4.8', '👥 1.8k enrolled'], filter: 'professional' },
          { title: 'Deep Learning & NLP', tag: 'Agentic AI', badge: '🔬 Advanced', badgeCls: 'advanced-badge', desc: 'Transformers, attention mechanisms, BERT, GPT architectures from scratch to production deployment.', meta: ['⏱ 3 Months', '⭐ 4.9', '👥 2.1k enrolled'], filter: 'professional' },
        ]
      },
      {
        title: '☁️ Cloud Based AI', icon: '☁️',
        courses: [
          { title: 'AWS Bedrock & AI Services', tag: 'Cloud Based', badge: '☁️ Cloud', badgeCls: 'ops-badge', desc: 'Build enterprise AI apps with AWS Bedrock, Knowledge Bases, Guardrails and Claude on AWS.', meta: ['⏱ 6 Weeks', '⭐ 4.8', '👥 1.2k enrolled'], filter: 'cloud based' },
          { title: 'Azure AI & OpenAI Integration', tag: 'Cloud Based', badge: '☁️ Cloud', badgeCls: 'ops-badge', desc: 'Deploy AI models on Azure OpenAI, Cognitive Services and build scalable enterprise solutions.', meta: ['⏱ 6 Weeks', '⭐ 4.7', '👥 980 enrolled'], filter: 'cloud based' },
          { title: 'Google Cloud AI & Vertex AI', tag: 'Cloud Based', badge: '☁️ Cloud', badgeCls: 'ops-badge', desc: 'Develop and deploy AI solutions using Google Cloud AI Platform, Vertex AI and Gemini APIs.', meta: ['⏱ 6 Weeks', '⭐ 4.8', '👥 860 enrolled'], filter: 'cloud based' },
        ]
      },
      {
        title: '🏢 Enterprise Programs', icon: '🏢',
        courses: [
          { title: 'Enterprise Agentic AI Architect', tag: 'Enterprise', badge: '🏢 Enterprise', badgeCls: 'enterprise-badge', desc: 'Design and architect enterprise-grade multi-agent AI systems with security, scalability and governance.', meta: ['⏱ 6 Months', '⭐ 4.9', '👥 450 enrolled'], filter: 'enterprise', isEnterprise: true },
          { title: 'AI DevOps & MLOps Professional', tag: 'Enterprise', badge: '⚙️ Ops', badgeCls: 'ops-badge', desc: 'Production AI pipelines, MLflow, CI/CD for ML models, monitoring and enterprise deployment patterns.', meta: ['⏱ 3 Months', '⭐ 4.8', '👥 720 enrolled'], filter: 'enterprise', isEnterprise: true },
        ]
      },
    ]
  },
  {
    id: 'genai', title: '✨ Generative AI', subtitle: 'Build with LLMs, RAG, image generation and more',
    filters: ['All', 'Professional', 'Specialization'],
    subsections: [
      {
        title: '🏆 Professional Programs', icon: '🏆',
        courses: [
          { title: 'Professional Generative AI Engineer', tag: 'Generative AI', badge: '🏆 Flagship', badgeCls: '', desc: 'Complete GenAI stack — LLMs, RAG, fine-tuning, image generation, AI apps. Industry-ready certification.', meta: ['⏱ 6 Months', '⭐ 4.9', '👥 3.2k enrolled'], filter: 'professional' },
          { title: 'RAG Systems & Vector Databases', tag: 'RAG', badge: '🔗 RAG', badgeCls: 'advanced-badge', desc: 'Master Retrieval-Augmented Generation with Pinecone, Weaviate, ChromaDB, LangChain and production RAG.', meta: ['⏱ 6 Weeks', '⭐ 4.8', '👥 1.6k enrolled'], filter: 'professional' },
          { title: 'MCP — Model Context Protocol', tag: 'MCP', badge: '🔌 MCP', badgeCls: 'ops-badge', desc: 'Build MCP servers and clients, connect AI tools and create powerful developer workflows with Claude.', meta: ['⏱ 4 Weeks', '⭐ 4.9', '👥 890 enrolled'], filter: 'specialization' },
        ]
      },
    ]
  },
  {
    id: 'datascience', title: '🔬 Data Science & Analytics', subtitle: 'From raw data to actionable insights',
    filters: ['All', 'Professional', 'Analytics', 'Specialization'],
    subsections: [
      {
        title: '🏆 Professional Programs', icon: '🏆',
        courses: [
          { title: 'Professional Data Scientist', tag: 'Data Science', badge: '🏆 Flagship', badgeCls: '', desc: 'End-to-end data science — Python, ML, deep learning, stats and production model deployment.', meta: ['⏱ 6 Months', '⭐ 4.9', '👥 2.8k enrolled'], filter: 'professional' },
          { title: 'Data Science with Machine Learning', tag: 'Data Science & Analytics', badge: '🔬 ML', badgeCls: 'advanced-badge', desc: 'Scikit-learn, XGBoost, neural networks, feature engineering, model evaluation and deployment.', meta: ['⏱ 3 Months', '⭐ 4.8', '👥 2.1k enrolled'], filter: 'professional' },
          { title: 'Business Analytics & Power BI', tag: 'Data Science & Analytics', badge: '📊 Analytics', badgeCls: 'business-badge', desc: 'Transform business data into executive dashboards using Power BI, DAX, SQL and advanced analytics.', meta: ['⏱ 6 Weeks', '⭐ 4.7', '👥 1.8k enrolled'], filter: 'analytics' },
          { title: 'AI-Powered Data Analytics', tag: 'Data Science & Analytics', badge: '✨ AI', badgeCls: 'workflow-badge', desc: 'Use AI tools — ChatGPT, Copilot, AutoML — to supercharge your data analytics workflow.', meta: ['⏱ 4 Weeks', '⭐ 4.8', '👥 1.3k enrolled'], filter: 'specialization' },
        ]
      },
    ]
  },
  {
    id: 'domainai', title: '🏭 Industry AI', subtitle: 'AI applications for specific sectors',
    filters: ['All', 'Healthcare', 'Finance', 'Retail', 'Manufacturing'],
    subsections: [
      {
        title: '🏥 Healthcare AI', icon: '🏥',
        courses: [
          { title: 'AI in Healthcare & Medical Imaging', tag: 'Domain AI', badge: '🏥 Healthcare', badgeCls: 'workflow-badge', desc: 'Apply deep learning to medical imaging, diagnosis AI, clinical NLP and healthcare data compliance.', meta: ['⏱ 8 Weeks', '⭐ 4.8', '👥 680 enrolled'], filter: 'healthcare' },
        ]
      },
      {
        title: '💰 Finance AI', icon: '💰',
        courses: [
          { title: 'AI for Finance & Risk Management', tag: 'Domain AI', badge: '💰 FinAI', badgeCls: 'business-badge', desc: 'Fraud detection, algorithmic trading, credit scoring and regulatory compliance AI for fintech.', meta: ['⏱ 8 Weeks', '⭐ 4.7', '👥 540 enrolled'], filter: 'finance' },
        ]
      },
      {
        title: '🛒 Retail & E-Commerce AI', icon: '🛒',
        courses: [
          { title: 'AI in Retail & E-Commerce', tag: 'Domain AI', badge: '🛒 Retail', badgeCls: 'ops-badge', desc: 'Recommendation engines, demand forecasting, customer segmentation and AI-powered supply chains.', meta: ['⏱ 6 Weeks', '⭐ 4.7', '👥 420 enrolled'], filter: 'retail' },
        ]
      },
      {
        title: '🏭 Manufacturing AI', icon: '🏭',
        courses: [
          { title: 'AI in Manufacturing & Quality Control', tag: 'Domain AI', badge: '🏭 Industry', badgeCls: '', desc: 'Predictive maintenance, defect detection computer vision, production optimization using AI.', meta: ['⏱ 6 Weeks', '⭐ 4.8', '👥 380 enrolled'], filter: 'manufacturing' },
        ]
      },
    ]
  },
  {
    id: 'programming', title: '💻 Programming', subtitle: 'Master coding skills for the AI era',
    filters: ['All', 'Python', 'Database'],
    subsections: [
      {
        title: '🐍 Python', icon: '🐍',
        courses: [
          { title: 'Python for AI & Analytics', tag: 'Programming', badge: '🐍 Python', badgeCls: 'ops-badge', desc: 'Python from zero to hero — data structures, OOP, pandas, numpy, matplotlib, scikit-learn.', meta: ['⏱ 8 Weeks', '⭐ 4.8', '👥 3.5k enrolled'], filter: 'python' },
          { title: 'Python & ML for Beginners', tag: 'Programming', badge: '🐍 Python', badgeCls: 'ops-badge', desc: 'Zero to ML with Python — no prior coding experience needed. Build your first ML models.', meta: ['⏱ 6 Weeks', '⭐ 4.7', '👥 2.8k enrolled'], filter: 'python' },
        ]
      },
      {
        title: '🗄️ Databases', icon: '🗄️',
        courses: [
          { title: 'SQL, NoSQL & AI Databases', tag: 'Programming', badge: '🗄️ Database', badgeCls: 'workflow-badge', desc: 'PostgreSQL, MongoDB, Pinecone, Weaviate — master traditional and vector databases for AI.', meta: ['⏱ 6 Weeks', '⭐ 4.7', '👥 1.4k enrolled'], filter: 'database' },
        ]
      },
    ]
  },
];

import CategoryIcon from '@/components/ui/CategoryIcon';

interface CourseCardProps {
  course: { title: string; tag: string; badge: string; badgeCls: string; desc: string; meta: string[]; filter?: string; isEnterprise?: boolean };
  onEnroll: (name: string) => void;
}

function CourseCard({ course, onEnroll }: CourseCardProps) {
  const GRAD: Record<string, string> = {
    'Agentic AI': 'linear-gradient(135deg,#7c3aed,#2563eb)',
    'Generative AI': 'linear-gradient(135deg,#ec4899,#8b5cf6)',
    'RAG': 'linear-gradient(135deg,#06b6d4,#6366f1)',
    'Data Science': 'linear-gradient(135deg,#10b981,#0ea5e9)',
    'Data Science & Analytics': 'linear-gradient(135deg,#10b981,#0ea5e9)',
    'Domain AI': 'linear-gradient(135deg,#f59e0b,#ef4444)',
    'Programming': 'linear-gradient(135deg,#059669,#0ea5e9)',
    'Cloud Based': 'linear-gradient(135deg,#1e3a5f,#2563eb)',
    'Enterprise': 'linear-gradient(135deg,#1e3a5f,#2563eb)',
    default: 'linear-gradient(135deg,#7c3aed,#2563eb)',
  };
  const grad = GRAD[course.tag] || GRAD.default;

  return (
    <div className={`master-card course-card pro-card${course.isEnterprise ? ' enterprise-card' : ''}`} data-filter={course.filter || ''}>
      <div className="card-thumb" style={{ background: grad }}>
        <CategoryIcon category={course.tag} />
      </div>
      <div className="card-body">
        <span className={`pro-badge${course.badgeCls ? ' ' + course.badgeCls : ''}`}>{course.badge}</span>
        <span className={`tag${course.isEnterprise ? ' enterprise-tag' : ''}`}>{course.tag}</span>
        <h3>{course.title}</h3>
        <p>{course.desc}</p>
        <div className="card-meta">{course.meta.map((m, i) => <span key={i}>{m}</span>)}</div>
        <button className="btn-enroll" onClick={() => onEnroll(course.title)}>Enroll Now →</button>
      </div>
    </div>
  );
}

// ── Courses Section ───────────────────────────────────────────────────────────
interface CoursesSectionProps { sectionId: string; }

export default function CoursesSection({ sectionId }: CoursesSectionProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [enrollTarget, setEnrollTarget] = useState<string | null>(null);

  const sec = COURSE_SECTIONS.find(s => s.id === sectionId);
  if (!sec) return null;

  return (
    <section id={`section-${sec.id}`} className="content-section active">
      <div className="section-header">
        <div>
          <h2>{sec.title}</h2>
          <p className="section-subtitle">{sec.subtitle}</p>
        </div>
        <div className="filter-tabs">
          {sec.filters.map(f => (
            <button key={f} className={`filter-btn${activeFilter === f ? ' active' : ''}`} onClick={() => setActiveFilter(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="cards-grid">
        {sec.subsections.map(sub => {
          const filtered = sub.courses.filter(c =>
            activeFilter === 'All' || (c.filter || '').toLowerCase().includes(activeFilter.toLowerCase())
          );
          if (filtered.length === 0) return null;
          return (
            <React.Fragment key={sub.title}>
              <div className="subsection-header">
                <span className="subsection-icon">{sub.icon}</span>
                <h3>{sub.title}</h3>
              </div>
              {filtered.map(c => <CourseCard key={c.title} course={c} onEnroll={setEnrollTarget} />)}
            </React.Fragment>
          );
        })}
      </div>

      {enrollTarget && <EnrollModal courseName={enrollTarget} onClose={() => setEnrollTarget(null)} />}
    </section>
  );
}
