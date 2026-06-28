"use client";
import { useState } from "react";
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [slider, setSlider] = useState(50);
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };
  const handleEnhance = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/enhance", { method: "POST", body: form });
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-sky-900 via-black to-blue-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">letsenhance</h1>
        <p className="text-xl text-gray-300 mb-8">AI upscale & sharpen images</p>
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8">
          <input type="file" accept="image/*" onChange={handleUpload}
            className="block w-full text-sm text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:bg-sky-600 file:text-white hover:file:bg-sky-500 cursor-pointer" />
          <button onClick={handleEnhance} disabled={!file || loading}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-sky-600 to-blue-600 rounded-full font-semibold hover:opacity-90 disabled:opacity-50 transition">
            {loading ? "Enhancing..." : "Enhance Image"}
          </button>
        </div>
        {preview && !result && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <img src={preview} alt="Preview" className="max-w-full rounded-lg" />
          </div>
        )}
        {result && (
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-4">Before / After</h2>
            <div className="relative rounded-lg overflow-hidden">
              <img src={preview} alt="Before" className="w-full" />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${slider}%` }}>
                <img src={result.enhanced_url} alt="After" className="w-full" />
              </div>
              <input type="range" min="0" max="100" value={slider} onChange={(e) => setSlider(Number(e.target.value))}
                className="absolute bottom-4 left-0 w-full" />
            </div>
            <p className="text-sm text-gray-400 mt-2">Scale: {result.scale}</p>
          </div>
        )}
      </div>
    </main>
  );
}