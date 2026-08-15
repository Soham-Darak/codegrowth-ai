"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("Your AI response will appear here.");
  const [loading, setLoading] = useState(false);

  async function generate(event) {
    event.preventDefault();
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      setOutput(data.response ?? data.detail ?? "No response returned.");
    } catch {
      setOutput("Could not reach the AI engine. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="hero">
        <span className="eyebrow">CODEGROWTH AI</span>
        <h1>Build better code with a local AI engineering workspace.</h1>
        <p>Next.js + Spring Boot + FastAPI + PostgreSQL + Redis + Ollama.</p>
      </section>

      <section className="workspace">
        <form onSubmit={generate}>
          <label htmlFor="prompt">Ask CodeGrowth</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Explain this algorithm, review code, or generate an implementation..."
          />
          <button disabled={loading}>{loading ? "Generating..." : "Generate"}</button>
        </form>
        <article>
          <h2>AI Output</h2>
          <pre>{output}</pre>
        </article>
      </section>
    </main>
  );
}
