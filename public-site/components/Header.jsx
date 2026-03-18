import React from "react"
import { useNavigate } from "react-router-dom"

export default function Header({ books }) {
  const navigate = useNavigate()

  return (
    <div style={{
      position: "fixed",
      top: 0,
      width: "100%",
      display: "flex",
      gap: 20,
      padding: 15,
      overflowX: "auto",
      backdropFilter: "blur(20px)",
      background: "rgba(0,0,0,0.4)",
      zIndex: 1000
    }}>
      {books.map(b => (
        <img
          key={b.id}
          src={b.logo_url}
          style={{ height: 50, cursor: "pointer" }}
          onClick={() => navigate(`/book/${b.id}`)}
        />
      ))}
    </div>
  )
}
