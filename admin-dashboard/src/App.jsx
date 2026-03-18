import React, { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"

// ✅ MAIN APP (AUTH ONLY)
export default function App() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (!session) {
    return (
      <div style={{ padding: 50 }}>
        <h2>Admin Login</h2>

        <input
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={() =>
            supabase.auth.signInWithPassword({ email, password })
          }
        >
          Login
        </button>
      </div>
    )
  }

  return <Dashboard />
}

// ✅ DASHBOARD (SEPARATE COMPONENT)
function Dashboard() {
  const [books, setBooks] = useState([])
  const [form, setForm] = useState({})
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*")
    setBooks(data || [])
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const uploadFile = async (file, bucket) => {
    const fileName = Date.now() + "-" + file.name

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file)

    if (error) {
      alert(error.message)
      return null
    }

    return `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/${bucket}/${fileName}`
  }

  const handleFile = async (e, field, bucket) => {
    const file = e.target.files[0]
    if (!file) return

    const preview = URL.createObjectURL(file)
    setForm(prev => ({ ...prev, [`${field}_preview`]: preview }))

    const url = await uploadFile(file, bucket)
    if (url) {
      setForm(prev => ({ ...prev, [field]: url }))
    }
  }

  const saveBook = async () => {
    if (editingId) {
      await supabase.from("books").update(form).eq("id", editingId)
    } else {
      await supabase.from("books").insert([form])
    }

    setForm({})
    setEditingId(null)
    fetchBooks()
  }

  const editBook = (b) => {
    setForm(b)
    setEditingId(b.id)
  }

  const deleteBook = async (id) => {
    await supabase.from("books").delete().eq("id", id)
    fetchBooks()
  }

  return (
    <div className="container">

      <h1 style={{ color: "gold" }}>Admin Dashboard</h1>

      {/* FORM CARD */}
      <div className="card">
        <h3>{editingId ? "Edit Book" : "Add Book"}</h3>

        <input className="input" name="title" placeholder="Title" onChange={handleChange} value={form.title || ""} />
        <input className="input" name="genre" placeholder="Genre" onChange={handleChange} value={form.genre || ""} />
        <input className="input" name="trailer_url" placeholder="Trailer URL" onChange={handleChange} value={form.trailer_url || ""} />
        <input className="input" name="buy_color" placeholder="Buy Color Link" onChange={handleChange} value={form.buy_color || ""} />
        <input className="input" name="buy_bw" placeholder="Buy B&W Link" onChange={handleChange} value={form.buy_bw || ""} />

        <textarea className="input" name="description" placeholder="Description" onChange={handleChange} value={form.description || ""} />

        {/* POSTER */}
        <p>Poster</p>
        <input type="file" onChange={(e) => handleFile(e, "poster_url", "posters")} />
        {(form.poster_url_preview || form.poster_url) && (
          <img
            src={form.poster_url_preview || form.poster_url}
            className="preview"
          />
        )}

        {/* LOGO */}
        <p>Logo</p>
        <input type="file" onChange={(e) => handleFile(e, "logo_url", "logos")} />
        {(form.logo_url_preview || form.logo_url) && (
          <img
            src={form.logo_url_preview || form.logo_url}
            className="preview"
          />
        )}

        {/* CAST */}
        <textarea
          className="input"
          placeholder="Cast JSON"
          onChange={(e) => {
            try {
              setForm({ ...form, cast: JSON.parse(e.target.value) })
            } catch {
              alert("Invalid JSON")
            }
          }}
          value={JSON.stringify(form.cast || [])}
        />

        <button className="btn" onClick={saveBook}>
          {editingId ? "Update Book" : "Add Book"}
        </button>
      </div>

      {/* BOOK LIST */}
      {books.map((b) => (
        <div key={b.id} className="card">
          <h3>{b.title}</h3>
          <p style={{ color: "gold" }}>{b.genre}</p>

          <div style={{ display: "flex", gap: 10 }}>
            <img src={b.poster_url} className="preview" />
            <img src={b.logo_url} className="preview" />
          </div>

          <button className="btn" onClick={() => editBook(b)}>
            Edit
          </button>

          <button
            className="btn"
            style={{ background: "crimson" }}
            onClick={() => deleteBook(b.id)}
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
