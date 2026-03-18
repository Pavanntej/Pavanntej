import React, { useEffect, useState } from "react"
import { supabase } from "./lib/supabase"
import { motion } from "framer-motion"
import "./index.css"

export default function App() {
  const [books, setBooks] = useState([])

  useEffect(() => {
    fetchBooks()
  }, [])

  const fetchBooks = async () => {
    const { data } = await supabase.from("books").select("*")
    setBooks(data || [])
  }

  return (
    <div>

      {/* HEADER */}
      <div style={{
        display: "flex",
        overflowX: "auto",
        padding: 20,
        gap: 20,
        background: "#000"
      }}>
        {books.map(b => (
          <img
            key={b.id}
            src={b.logo_url}
            style={{ height: 60, cursor: "pointer" }}
            onClick={() =>
              document.getElementById(b.id).scrollIntoView({ behavior: "smooth" })
            }
          />
        ))}
      </div>

      {/* SECTIONS */}
      {books.map((b, index) => (
        <section key={b.id} id={b.id} className="section">

          {/* BACKGROUND BLEND */}
          <div
            className="overlay-bg"
            style={{ backgroundImage: `url(${b.poster_url})` }}
          />

          {/* LEFT */}
          <motion.div
            className="glass"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{ width: "50%", zIndex: 1 }}
          >
            <img src={b.logo_url} style={{ width: 220 }} />

            <p style={{ color: "gold", marginTop: 10 }}>{b.genre}</p>

            <div style={{ marginTop: 20 }}>
              <button className="btn" onClick={() => window.open(b.buy_color)}>
                Buy Color
              </button>

              <button className="btn" onClick={() => window.open(b.buy_bw)}>
                Buy B&W
              </button>

              <button
                className="btn"
                onClick={() =>
                  navigator.share({
                    title: b.title,
                    url: window.location.href
                  })
                }
              >
                Share
              </button>
            </div>

            <p style={{ marginTop: 20, lineHeight: 1.6 }}>
              {b.description}
            </p>

            {/* CAST */}
            <div style={{ display: "flex", gap: 15, marginTop: 20 }}>
              {b.cast?.map((c, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <img
                    src={c.image}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid gold"
                    }}
                  />
                  <p style={{ fontSize: 12 }}>{c.name}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT TRAILER */}
          <motion.div
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              width: "50%",
              display: "flex",
              justifyContent: "center",
              zIndex: 1
            }}
          >
            <iframe
              width="320"
              height="570"
              src={b.trailer_url + "?autoplay=1&mute=1"}
              allow="autoplay"
              style={{
                borderRadius: 20,
                boxShadow: "0 0 40px rgba(255,215,0,0.3)"
              }}
            />
          </motion.div>
        </section>
      ))}

      {/* FOOTER CONTACT */}
      <div style={{
        padding: 40,
        textAlign: "center",
        background: "#000"
      }}>
        <h3>Contact</h3>

        <a href="https://wa.me/YOUR_NUMBER" className="btn">WhatsApp</a>
        <a href="mailto:YOUR_EMAIL" className="btn">Email</a>

        <div style={{ marginTop: 20 }}>
          <a href="#">Instagram</a> | <a href="#">YouTube</a>
        </div>
      </div>
    </div>
  )
}
