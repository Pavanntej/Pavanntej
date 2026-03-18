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

    const url = await uploadFile(file, bucket)
    if (url) {
      setForm((prev) => ({ ...prev, [field]: url }))
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
    <div style={{ padding: 20 }}>
      <h2>Dashboard</h2>

      {/* INPUTS */}
      <input name="title" placeholder="Title" onChange={handleChange} value={form.title || ""} />
      <input name="genre" placeholder="Genre" onChange={handleChange} value={form.genre || ""} />
      <input name="trailer_url" placeholder="Trailer URL" onChange={handleChange} value={form.trailer_url || ""} />
      <input name="buy_color" placeholder="Buy Color Link" onChange={handleChange} value={form.buy_color || ""} />
      <input name="buy_bw" placeholder="Buy BW Link" onChange={handleChange} value={form.buy_bw || ""} />

      <textarea name="description" placeholder="Description" onChange={handleChange} value={form.description || ""} />

      {/* FILE UPLOADS */}
      <p>Poster</p>
      <input type="file" onChange={(e) => handleFile(e, "poster_url", "posters")} />

      <p>Logo</p>
      <input type="file" onChange={(e) => handleFile(e, "logo_url", "logos")} />

      {/* CAST */}
      <textarea
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

      <button onClick={saveBook}>
        {editingId ? "Update" : "Add"}
      </button>

      {/* LIST */}
      {books.map((b) => (
        <div key={b.id}>
          <h3>{b.title}</h3>
          <button onClick={() => editBook(b)}>Edit</button>
          <button onClick={() => deleteBook(b.id)}>Delete</button>
        </div>
      ))}
    </div>
  )
}
