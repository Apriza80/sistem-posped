import React, { useState } from "react";
import API from "./axios"; // Import file axios yang baru dibuat (sesuaikan path foldernya)
import "./Login.css";

function Login({ onLoginSuccess }) {
  const [nippos, setNippos] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!nippos || !password) {
      alert("Harap masukkan Nippos/NIP/Noppen dan Password!");
      setLoading(false);
      return;
    }

    try {
      // Mengirim data login (nippos dan password) ke backend tanpa kantor_cabang
      const response = await API.post("/login", {
        nippos: nippos,
        password: password,
      });

      const data = response.data;

      // Simpan token JWT ke localStorage jika backend mengembalikannya
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      // Ambil data user langsung dari respons backend secara aman
      const userDataObj = data.user || data;

      const userActiveData = {
        id: userDataObj.id || userDataObj.nippos || null,
        nippos: userDataObj.nippos || nippos,
        nama: userDataObj.name || userDataObj.nama || data.name || nippos,
        role: userDataObj.role || data.role || "Petugas Loket",
        kantor:
          userDataObj.kantor || userDataObj.kantor_cabang || "KC SIDOARJO", // Otomatis mengikuti data dari database user
      };

      onLoginSuccess(userActiveData);
    } catch (error) {
      // Menangani error dari server atau koneksi terputus
      if (error.response) {
        setErrorMsg(
          error.response.data.message ||
            "Login gagal, periksa kembali data Anda.",
        );
      } else if (error.request) {
        setErrorMsg(
          "Tidak dapat terhubung ke server backend. Pastikan server aktif.",
        );
      } else {
        setErrorMsg("Terjadi kesalahan pada sistem.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div
            className="brand-posind"
            style={{
              marginBottom: "12px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <img
              src="/logo-pos.jpeg"
              alt="Logo Pos Indonesia"
              style={{ width: "120px", height: "auto", objectFit: "contain" }}
            />
          </div>
          <h2 style={{ color: "#1e293b", fontSize: "20px", margin: "0" }}>
            Aplikasi Penyimpanan Digital
          </h2>
          <p style={{ color: "#64748b", fontSize: "13px", marginTop: "4px" }}>
            Silakan login menggunakan Nippos/NIP/Noppen Anda
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#991b1b",
              padding: "10px",
              borderRadius: "6px",
              fontSize: "13px",
              marginBottom: "16px",
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLoginSubmit} style={{ marginTop: "20px" }}>
          <div style={{ marginBottom: "16px" }}>
            <label>Nippos/NIP/Noppen</label>
            <input
              type="text"
              placeholder="Masukkan Nippos / NIP / Noppen"
              value={nippos}
              onChange={(e) => setNippos(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label>PASSWORD</label>
            <input
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              fontSize: "15px",
              backgroundColor: "#2b6fb7",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Memproses..." : "Masuk Aplikasi"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
