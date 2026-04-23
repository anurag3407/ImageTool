"use client";

import { useState } from "react";

export default function AuthPanel({ onLogin }: { onLogin: (u: string, p: string, r: boolean) => Promise<void> }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username || !password) {
      setError("REQUIRED: USERNAME & PASSWORD.");
      return;
    }
    setLoading(true);
    try {
      await onLogin(username, password, isRegistering);
    } catch (err: any) {
      setError(err.message || "AUTH FAILED.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#b7c6c2] border-2 border-black shadow-neo-lg p-8 rounded-lg text-black">
      <h2 className="font-heading text-3xl mb-6 font-black tracking-tighter uppercase">{isRegistering ? "CREATE ACCOUNT" : "SYSTEM LOGIN"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="block font-bold text-sm mb-1 uppercase tracking-widest">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border-2 border-black p-3 rounded-none bg-white text-black focus:outline-none focus:ring-0 font-sans shadow-neo"
            placeholder="USER_ID"
          />
        </div>
        <div>
          <label className="block font-bold text-sm mb-1 uppercase tracking-widest">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-black p-3 rounded-none bg-white text-black focus:outline-none focus:ring-0 font-sans shadow-neo"
            placeholder="••••••••"
          />
        </div>
        {error && <div className="bg-[#ff5f57] text-black font-bold p-2 border-2 border-black text-sm uppercase shadow-neo mt-2">{error}</div>}
        <button type="submit" disabled={loading} className="btn-neo w-full text-xl mt-4 py-4">
          {loading ? "PROCESSING..." : (isRegistering ? "REGISTER" : "AUTHENTICATE")}
        </button>
      </form>
      <div className="mt-6 text-center border-t-2 border-black pt-4">
        <button onClick={() => { setIsRegistering(!isRegistering); setError(null); }} className="text-black font-bold text-sm uppercase tracking-widest hover:underline decoration-2">
          {isRegistering ? "EXISTING USER? LOGIN" : "NEW USER? REGISTER"}
        </button>
      </div>
    </div>
  );
}
