/* eslint-disable no-unused-vars */
import { useState, useMemo, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCE-nQJP2pLpP7eUfH--JeJd41ccktoAF4",
  authDomain: "fintrack-13de0.firebaseapp.com",
  projectId: "fintrack-13de0",
  storageBucket: "fintrack-13de0.firebasestorage.app",
  messagingSenderId: "96194161236",
  appId: "1:96194161236:web:922668b5223de5ba655bc1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const CATEGORIES = {
  income: ["Gaji", "Freelance", "Investasi", "Bisnis", "Lainnya"],
  expense: ["Makanan", "Transport", "Kesehatan", "Pendidikan", "Hiburan", "Belanja", "Tagihan", "Lainnya"],
};

const MONTHS = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];

function formatRupiah(num) {
  return "Rp " + Math.abs(num).toLocaleString("id-ID");
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function toEmail(u) {
  return u.toLowerCase().replace(/[^a-z0-9]/g, "") + "@fintrack.app";
}

// ===================== LOGIN PAGE =====================
function AuthPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!username || !password) { setError("Username dan password harus diisi"); return; }
    if (username.length < 3) { setError("Username minimal 3 karakter"); return; }
    if (password.length < 6) { setError("Password minimal 6 karakter"); return; }
    setLoading(true);
    setError("");
    const fakeEmail = toEmail(username);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, fakeEmail, password);
      } else {
        await createUserWithEmailAndPassword(auth, fakeEmail, password);
      }
    } catch (e) {
      if (e.code === "auth/user-not-found" || e.code === "auth/wrong-password" || e.code === "auth/invalid-credential") setError("Username atau password salah");
      else if (e.code === "auth/email-already-in-use") setError("Username sudah dipakai, coba yang lain");
      else if (e.code === "auth/weak-password") setError("Password minimal 6 karakter");
      else setError("Terjadi kesalahan, coba lagi");
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#0f0e0c", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <img src="/logo-aksara.png" alt="AKSARA" style={{ height: 60, margin: "0 auto 16px", display: "block" }} />
          <div style={{ fontSize: 11, color: "#7a6f5e", letterSpacing: "0.15em", marginTop: 4 }}>PENCATATAN KEUANGAN PRIBADI</div>
        </div>
        <div style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 20, padding: 32 }}>
          <div style={{ display: "flex", background: "#0f0e0c", borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {["login", "register"].map(m => (
              <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
                flex: 1, background: mode === m ? "linear-gradient(135deg, #c9a84c, #e8c96a)" : "none",
                color: mode === m ? "#0f0e0c" : "#7a6f5e", border: "none", borderRadius: 8,
                padding: "9px 0", fontFamily: "inherit", fontSize: 13, cursor: "pointer", fontWeight: mode === m ? 700 : 400
              }}>
                {m === "login" ? "Masuk" : "Daftar"}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: "#7a6f5e", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>USERNAME</label>
              <input type="text" placeholder="Contoh: yusuff123" value={username} onChange={e => setUsername(e.target.value)}
                style={{ width: "100%", boxSizing: "border-box", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "11px 14px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }} />
              {mode === "register" && <div style={{ fontSize: 10, color: "#5a5040", marginTop: 4 }}>Minimal 3 karakter, tanpa spasi</div>}
            </div>
            <div>
              <label style={{ fontSize: 11, color: "#7a6f5e", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>PASSWORD</label>
              <input type="password" placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAuth()}
                style={{ width: "100%", boxSizing: "border-box", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "11px 14px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }} />
            </div>
            {error && <div style={{ background: "#1a1111", border: "1px solid #3a1818", borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#e05555" }}>⚠️ {error}</div>}
            <button onClick={handleAuth} disabled={loading} style={{
              background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0f0e0c", border: "none",
              borderRadius: 10, padding: "13px 0", fontFamily: "inherit", fontWeight: 700, fontSize: 14,
              cursor: "pointer", marginTop: 4, opacity: loading ? 0.7 : 1
            }}>
              {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Buat Akun"}
            </button>
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#3a3028" }}>
          ⚠️ Ingat username & password kamu — tidak bisa dipulihkan jika lupa
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN APP =====================
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [rekening, setRekening] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: "expense", amount: "", category: "", description: "", date: today(), rekeningId: "" });
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filterType, setFilterType] = useState("all");
  const [editId, setEditId] = useState(null);
  const [showRekeningForm, setShowRekeningForm] = useState(false);
  const [rekeningForm, setRekeningForm] = useState({ nama: "", saldo: "" });
  const [editRekeningId, setEditRekeningId] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => { setUser(u); setAuthLoading(false); });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) { setTransactions([]); setRekening([]); setLoading(false); return; }
    async function loadData() {
      setLoading(true);
      try {
        const qTx = query(collection(db, "transactions"), where("userId", "==", user.uid));
        const snapTx = await getDocs(qTx);
        setTransactions(snapTx.docs.map(d => ({ id: d.id, ...d.data() })));
        const qRek = query(collection(db, "rekening"), where("userId", "==", user.uid));
        const snapRek = await getDocs(qRek);
        setRekening(snapRek.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (e) { console.error("Error loading:", e); }
      setLoading(false);
    }
    loadData();
  }, [user]);

  const totalIncome = useMemo(() => transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [transactions]);
  const totalExpense = useMemo(() => transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [transactions]);
  const balance = totalIncome - totalExpense;
  const totalSaldoRekening = useMemo(() => rekening.reduce((s, r) => s + (r.saldo || 0), 0), [rekening]);

  const categoryTotals = useMemo(() => {
    const map = {};
    transactions.filter(t => t.type === "expense").forEach(t => { map[t.category] = (map[t.category] || 0) + t.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      const m = new Date(t.date).getMonth();
      if (!map[m]) map[m] = { income: 0, expense: 0 };
      map[m][t.type] += t.amount;
    });
    return map;
  }, [transactions]);

  const filtered = useMemo(() => {
    return [...transactions].filter(t => filterType === "all" || t.type === filterType).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [transactions, filterType]);

  async function handleSubmit() {
    if (!form.amount || !form.category || !form.description || !form.date) return;
    setSaving(true);
    const tx = { ...form, amount: parseFloat(form.amount), userId: user.uid };
    try {
      if (editId) {
        const oldTx = transactions.find(t => t.id === editId);
        if (oldTx && oldTx.rekeningId) {
          const oldRek = rekening.find(r => r.id === oldTx.rekeningId);
          if (oldRek) {
            const revertAmount = oldTx.type === "income" ? -oldTx.amount : oldTx.amount;
            const newSaldo = oldRek.saldo + revertAmount;
            await updateDoc(doc(db, "rekening", oldRek.id), { saldo: newSaldo });
            setRekening(prev => prev.map(r => r.id === oldRek.id ? { ...r, saldo: newSaldo } : r));
          }
        }
        await updateDoc(doc(db, "transactions", editId), tx);
        setTransactions(prev => prev.map(t => t.id === editId ? { ...tx, id: editId } : t));
        setEditId(null);
      } else {
        const docRef = await addDoc(collection(db, "transactions"), tx);
        setTransactions(prev => [...prev, { ...tx, id: docRef.id }]);
      }
      if (tx.rekeningId) {
        const rek = rekening.find(r => r.id === tx.rekeningId);
        if (rek) {
          const changeAmount = tx.type === "income" ? tx.amount : -tx.amount;
          const newSaldo = rek.saldo + changeAmount;
          await updateDoc(doc(db, "rekening", rek.id), { saldo: newSaldo });
          setRekening(prev => prev.map(r => r.id === rek.id ? { ...r, saldo: newSaldo } : r));
        }
      }
    } catch (e) { console.error("Error saving:", e); }
    setForm({ type: "expense", amount: "", category: "", description: "", date: today(), rekeningId: "" });
    setShowForm(false);
    setSaving(false);
  }

  async function handleSaveRekening() {
    if (!rekeningForm.nama) return;
    setSaving(true);
    const data = { nama: rekeningForm.nama, saldo: parseFloat(rekeningForm.saldo) || 0, userId: user.uid };
    try {
      if (editRekeningId) {
        await updateDoc(doc(db, "rekening", editRekeningId), data);
        setRekening(prev => prev.map(r => r.id === editRekeningId ? { ...data, id: editRekeningId } : r));
        setEditRekeningId(null);
      } else {
        const docRef = await addDoc(collection(db, "rekening"), data);
        setRekening(prev => [...prev, { ...data, id: docRef.id }]);
      }
    } catch (e) { console.error("Error saving rekening:", e); }
    setRekeningForm({ nama: "", saldo: "" });
    setShowRekeningForm(false);
    setSaving(false);
  }

  async function handleDeleteRekening(id) {
    try {
      await deleteDoc(doc(db, "rekening", id));
      setRekening(prev => prev.filter(r => r.id !== id));
    } catch (e) { console.error("Error deleting rekening:", e); }
  }

  function handleEditRekening(r) {
    setRekeningForm({ nama: r.nama, saldo: String(r.saldo) });
    setEditRekeningId(r.id);
    setShowRekeningForm(true);
  }

  function handleEdit(t) {
    setForm({ type: t.type, amount: String(t.amount), category: t.category, description: t.description, date: t.date, rekeningId: t.rekeningId || "" });
    setEditId(t.id);
    setShowForm(true);
    setActiveTab("transaksi");
  }

  async function handleDelete(id) {
    try {
      await deleteDoc(doc(db, "transactions", id));
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (e) { console.error("Error deleting:", e); }
  }

  async function handleLogout() { await signOut(auth); setTransactions([]); setRekening([]); }

  const maxMonth = Math.max(...Object.values(monthlyData).flatMap(m => [m.income, m.expense]), 1);

  if (authLoading) {
    return (
      <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#0f0e0c", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <img src="/logo-aksara.png" alt="AKSARA" style={{ height: 50, opacity: 0.7 }} />
        <div style={{ color: "#e8c96a", fontSize: 16 }}>Memuat...</div>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div style={{ fontFamily: "'Georgia', serif", minHeight: "100vh", background: "#0f0e0c", color: "#e8e0d0" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1714 0%, #0f0e0c 100%)", borderBottom: "1px solid #2a2520", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <img src="/logo-aksara.png" alt="AKSARA" style={{ height: 32 }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, letterSpacing: "0.05em", color: "#e8c96a" }}>FINTRACK</div>
              <div style={{ fontSize: 10, color: "#7a6f5e" }}>{user.email.replace("@fintrack.app", "")}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ type: "expense", amount: "", category: "", description: "", date: today(), rekeningId: "" }); setActiveTab("transaksi"); }}
              style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0f0e0c", border: "none", borderRadius: 8, padding: "8px 18px", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              + Tambah
            </button>
            <button onClick={handleLogout} style={{ background: "none", color: "#7a6f5e", border: "1px solid #2a2520", borderRadius: 8, padding: "8px 14px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>Keluar</button>
          </div>
        </div>
      </div>

      <div style={{ background: "#1a1714", borderBottom: "1px solid #2a2520" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", padding: "0 24px" }}>
          {["dashboard", "transaksi", "rekening", "laporan"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              background: "none", border: "none", color: activeTab === tab ? "#e8c96a" : "#7a6f5e",
              padding: "14px 16px", fontFamily: "inherit", fontSize: 13, cursor: "pointer",
              borderBottom: activeTab === tab ? "2px solid #e8c96a" : "2px solid transparent"
            }}>
              {tab === "dashboard" ? "📊 Dashboard" : tab === "transaksi" ? "📋 Transaksi" : tab === "rekening" ? "🏦 Rekening" : "📈 Laporan"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>

        {showForm && (
          <div style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 16, padding: 24, marginBottom: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 18, color: "#e8c96a" }}>{editId ? "✏️ Edit Transaksi" : "➕ Transaksi Baru"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, color: "#7a6f5e", display: "block", marginBottom: 6 }}>JENIS</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value, category: "" }))}
                  style={{ width: "100%", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 12px", color: form.type === "income" ? "#4caf78" : "#e05555", fontFamily: "inherit", fontSize: 14 }}>
                  <option value="income">⬆ Pemasukan</option>
                  <option value="expense">⬇ Pengeluaran</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a6f5e", display: "block", marginBottom: 6 }}>JUMLAH (Rp)</label>
                <input type="number" placeholder="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 12px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a6f5e", display: "block", marginBottom: 6 }}>KATEGORI</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  style={{ width: "100%", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 12px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }}>
                  <option value="">Pilih kategori</option>
                  {CATEGORIES[form.type].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a6f5e", display: "block", marginBottom: 6 }}>REKENING</label>
                <select value={form.rekeningId} onChange={e => setForm(f => ({ ...f, rekeningId: e.target.value }))}
                  style={{ width: "100%", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 12px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }}>
                  <option value="">Pilih rekening</option>
                  {rekening.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a6f5e", display: "block", marginBottom: 6 }}>TANGGAL</label>
                <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 12px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7a6f5e", display: "block", marginBottom: 6 }}>DESKRIPSI</label>
                <input type="text" placeholder="Keterangan..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{ width: "100%", boxSizing: "border-box", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 12px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <button onClick={handleSubmit} disabled={saving} style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0f0e0c", border: "none", borderRadius: 8, padding: "10px 24px", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
                {saving ? "Menyimpan..." : editId ? "Simpan" : "Tambah"}
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); }} style={{ background: "none", color: "#7a6f5e", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 20px", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>Batal</button>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "Saldo", value: balance, color: balance >= 0 ? "#e8c96a" : "#e05555", bg: "#1a1714", icon: "💰" },
                { label: "Total Pemasukan", value: totalIncome, color: "#4caf78", bg: "#111a14", icon: "⬆" },
                { label: "Total Pengeluaran", value: totalExpense, color: "#e05555", bg: "#1a1111", icon: "⬇" },
              ].map(card => (
                <div key={card.label} style={{ background: card.bg, border: "1px solid #2a2520", borderRadius: 16, padding: "20px 22px" }}>
                  <div style={{ fontSize: 11, color: "#7a6f5e", letterSpacing: "0.12em", marginBottom: 10 }}>{card.icon} {card.label.toUpperCase()}</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: card.color }}>{formatRupiah(card.value)}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 16, padding: "20px 24px", marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontSize: 13, color: "#b0a080" }}>Tingkat Tabungan (Saving Rate)</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#e8c96a" }}>{totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%</div>
              </div>
              <div style={{ height: 10, background: "#0f0e0c", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${totalIncome > 0 ? Math.min(100, Math.max(0, (balance / totalIncome) * 100)) : 0}%`, background: "linear-gradient(90deg, #c9a84c, #e8c96a)", borderRadius: 99 }} />
              </div>
            </div>
            <div style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 16, padding: "20px 24px" }}>
              <div style={{ fontSize: 13, color: "#b0a080", marginBottom: 18 }}>PENGELUARAN PER KATEGORI</div>
              {categoryTotals.length === 0 && <div style={{ color: "#5a5040", fontSize: 13 }}>Belum ada data pengeluaran.</div>}
              {categoryTotals.map(([cat, total]) => {
                const pct = totalExpense > 0 ? (total / totalExpense) * 100 : 0;
                return (
                  <div key={cat} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                      <span style={{ color: "#c8b890" }}>{cat}</span>
                      <span style={{ color: "#e05555" }}>{formatRupiah(total)} <span style={{ color: "#5a5040" }}>({Math.round(pct)}%)</span></span>
                    </div>
                    <div style={{ height: 6, background: "#0f0e0c", borderRadius: 99 }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #a03030, #e05555)", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "transaksi" && (
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
              {["all", "income", "expense"].map(f => (
                <button key={f} onClick={() => setFilterType(f)} style={{
                  background: filterType === f ? "#e8c96a" : "none", color: filterType === f ? "#0f0e0c" : "#7a6f5e",
                  border: "1px solid " + (filterType === f ? "#e8c96a" : "#2a2520"), borderRadius: 8, padding: "7px 16px",
                  fontFamily: "inherit", fontSize: 12, cursor: "pointer", fontWeight: filterType === f ? 700 : 400
                }}>
                  {f === "all" ? "Semua" : f === "income" ? "⬆ Pemasukan" : "⬇ Pengeluaran"}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filtered.length === 0 && <div style={{ color: "#5a5040", padding: "40px 0", textAlign: "center" }}>Belum ada transaksi.</div>}
              {filtered.map(t => {
                const rek = rekening.find(r => r.id === t.rekeningId);
                return (
                  <div key={t.id} style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: t.type === "income" ? "#111a14" : "#1a1111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                        {t.type === "income" ? "⬆" : "⬇"}
                      </div>
                      <div>
                        <div style={{ fontSize: 14, color: "#d4c8a8", fontWeight: 600 }}>{t.description}</div>
                        <div style={{ fontSize: 11, color: "#5a5040", marginTop: 2 }}>{t.category}{rek ? ` · ${rek.nama}` : ""} · {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: t.type === "income" ? "#4caf78" : "#e05555" }}>
                        {t.type === "income" ? "+" : "-"}{formatRupiah(t.amount)}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => handleEdit(t)} style={{ background: "none", border: "1px solid #2a2520", borderRadius: 6, padding: "4px 10px", color: "#b0a080", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                        <button onClick={() => handleDelete(t.id)} style={{ background: "none", border: "1px solid #3a1818", borderRadius: 6, padding: "4px 10px", color: "#e05555", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Hapus</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "rekening" && (
          <div>
            <div style={{ background: "linear-gradient(135deg, #1a1714, #111a14)", border: "1px solid #2a2520", borderRadius: 16, padding: "24px", marginBottom: 20, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#7a6f5e", letterSpacing: "0.15em", marginBottom: 8 }}>TOTAL SALDO</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#e8c96a" }}>{formatRupiah(totalSaldoRekening)}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={() => { setShowRekeningForm(!showRekeningForm); setEditRekeningId(null); setRekeningForm({ nama: "", saldo: "" }); }}
                style={{ background: "none", color: "#e8c96a", border: "1px solid #e8c96a", borderRadius: 8, padding: "8px 16px", fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                + Tambah Rekening
              </button>
            </div>
            {showRekeningForm && (
              <div style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 16, padding: 20, marginBottom: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e8c96a", marginBottom: 14 }}>{editRekeningId ? "✏️ Edit Rekening" : "➕ Rekening Baru"}</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, color: "#7a6f5e", display: "block", marginBottom: 6 }}>NAMA REKENING</label>
                    <input type="text" placeholder="Contoh: BNI, Dana, OVO" value={rekeningForm.nama} onChange={e => setRekeningForm(f => ({ ...f, nama: e.target.value }))}
                      style={{ width: "100%", boxSizing: "border-box", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 12px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, color: "#7a6f5e", display: "block", marginBottom: 6 }}>SALDO AWAL (Rp)</label>
                    <input type="number" placeholder="0" value={rekeningForm.saldo} onChange={e => setRekeningForm(f => ({ ...f, saldo: e.target.value }))}
                      style={{ width: "100%", boxSizing: "border-box", background: "#0f0e0c", border: "1px solid #2a2520", borderRadius: 8, padding: "10px 12px", color: "#e8e0d0", fontFamily: "inherit", fontSize: 14 }} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <button onClick={handleSaveRekening} disabled={saving} style={{ background: "linear-gradient(135deg, #c9a84c, #e8c96a)", color: "#0f0e0c", border: "none", borderRadius: 8, padding: "9px 20px", fontFamily: "inherit", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {saving ? "Menyimpan..." : "Simpan"}
                  </button>
                  <button onClick={() => setShowRekeningForm(false)} style={{ background: "none", color: "#7a6f5e", border: "1px solid #2a2520", borderRadius: 8, padding: "9px 16px", fontFamily: "inherit", fontSize: 13, cursor: "pointer" }}>Batal</button>
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rekening.length === 0 && <div style={{ color: "#5a5040", padding: "40px 0", textAlign: "center" }}>Belum ada rekening. Klik "+ Tambah Rekening"!</div>}
              {rekening.map(r => (
                <div key={r.id} style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "#111a14", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏦</div>
                    <div>
                      <div style={{ fontSize: 15, color: "#d4c8a8", fontWeight: 600 }}>{r.nama}</div>
                      <div style={{ fontSize: 11, color: "#5a5040", marginTop: 2 }}>Rekening</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#e8c96a" }}>{formatRupiah(r.saldo)}</div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => handleEditRekening(r)} style={{ background: "none", border: "1px solid #2a2520", borderRadius: 6, padding: "4px 10px", color: "#b0a080", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                      <button onClick={() => handleDeleteRekening(r.id)} style={{ background: "none", border: "1px solid #3a1818", borderRadius: 6, padding: "4px 10px", color: "#e05555", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Hapus</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "laporan" && (
          <div>
            <div style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 16, padding: "24px", marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: "#b0a080", marginBottom: 24 }}>GRAFIK BULANAN</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160 }}>
                {MONTHS.map((m, i) => {
                  const d = monthlyData[i] || { income: 0, expense: 0 };
                  const incH = d.income > 0 ? Math.max(8, (d.income / maxMonth) * 140) : 0;
                  const expH = d.expense > 0 ? Math.max(8, (d.expense / maxMonth) * 140) : 0;
                  return (
                    <div key={m} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                      <div style={{ display: "flex", gap: 2, alignItems: "flex-end", width: "100%" }}>
                        <div style={{ flex: 1, height: incH, background: "linear-gradient(180deg, #4caf78, #2a7a4a)", borderRadius: "3px 3px 0 0" }} />
                        <div style={{ flex: 1, height: expH, background: "linear-gradient(180deg, #e05555, #a02020)", borderRadius: "3px 3px 0 0" }} />
                      </div>
                      <div style={{ fontSize: 9, color: "#5a5040" }}>{m}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#7a6f5e" }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#4caf78" }} />Pemasukan</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#7a6f5e" }}><div style={{ width: 10, height: 10, borderRadius: 2, background: "#e05555" }} />Pengeluaran</div>
              </div>
            </div>
            <div style={{ background: "#1a1714", border: "1px solid #2a2520", borderRadius: 16, padding: "24px" }}>
              <div style={{ fontSize: 13, color: "#b0a080", marginBottom: 18 }}>RINGKASAN LAPORAN KEUANGAN</div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #2a2520" }}>
                    <th style={{ padding: "8px 0", color: "#7a6f5e", fontWeight: 600, textAlign: "left", fontSize: 11 }}>KETERANGAN</th>
                    <th style={{ padding: "8px 0", color: "#7a6f5e", fontWeight: 600, textAlign: "right", fontSize: 11 }}>JUMLAH</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #1e1c18" }}>
                    <td style={{ padding: "12px 0", color: "#c8b890" }}>Total Pemasukan</td>
                    <td style={{ padding: "12px 0", color: "#4caf78", textAlign: "right", fontWeight: 600 }}>+{formatRupiah(totalIncome)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #1e1c18" }}>
                    <td style={{ padding: "12px 0", color: "#c8b890" }}>Total Pengeluaran</td>
                    <td style={{ padding: "12px 0", color: "#e05555", textAlign: "right", fontWeight: 600 }}>-{formatRupiah(totalExpense)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #1e1c18" }}>
                    <td style={{ padding: "12px 0", color: "#c8b890" }}>Total Saldo Rekening</td>
                    <td style={{ padding: "12px 0", color: "#e8c96a", textAlign: "right", fontWeight: 600 }}>{formatRupiah(totalSaldoRekening)}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #2a2520" }}>
                    <td style={{ padding: "12px 0", color: "#c8b890" }}>Jumlah Transaksi</td>
                    <td style={{ padding: "12px 0", color: "#e8e0d0", textAlign: "right", fontWeight: 600 }}>{transactions.length} transaksi</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "14px 0", color: "#e8c96a", fontWeight: 700, fontSize: 15 }}>Saldo Bersih</td>
                    <td style={{ padding: "14px 0", color: balance >= 0 ? "#e8c96a" : "#e05555", textAlign: "right", fontWeight: 700, fontSize: 15 }}>
                      {balance >= 0 ? "+" : "-"}{formatRupiah(balance)}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div style={{ marginTop: 18, padding: "14px 16px", background: "#0f0e0c", borderRadius: 10, fontSize: 12, color: "#7a6f5e", lineHeight: 1.7 }}>
                <strong style={{ color: "#b0a080" }}>📌 Analisis:</strong> Tingkat tabungan saat ini <strong style={{ color: "#e8c96a" }}>{totalIncome > 0 ? Math.round((balance / totalIncome) * 100) : 0}%</strong>. {totalIncome > 0 && balance / totalIncome >= 0.2 ? "Keuangan dalam kondisi sehat! ✅" : totalIncome > 0 ? "Disarankan meningkatkan tabungan minimal 20%. ⚠️" : "Tambahkan transaksi untuk melihat analisis."}
              </div>
            </div>
          </div>
        )}

        <div style={{ borderTop: "1px solid #2a2520", marginTop: 40, padding: "24px", textAlign: "center" }}>
          <div style={{ fontSize: 13, color: "#5a5040" }}>{" "}<span style={{ color: "#e8c96a", fontWeight: 700 }}>AKSARA CLASS A-25</span></div>
          <div style={{ fontSize: 11, color: "#3a3028", marginTop: 6 }}>github.com/muhammadyusuff857-cyber/fintrack</div>
        </div>
      </div>
    </div>
  );
}
