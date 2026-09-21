import React, { useState, useEffect } from "react";
import API from "./axios"; // Menggunakan instance axios yang membawa Bearer Token Sanctum
import "./Notifikasi.css";

function Notifikasi({ setActiveMenu, setShowNotification, userActive }) {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ambil data notifikasi dari API backend saat komponen dibuka dan lakukan auto-refresh setiap 5 detik
  useEffect(() => {
    fetchNotifikasi();

    const interval = setInterval(() => {
      fetchNotifikasi();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifikasi = async () => {
    try {
      setLoading(false); // Set false agar background refresh tidak kedap-kedip loading
      const response = await API.get("/notifikasi");

      // Menyesuaikan struktur response dari backend: response.data.data
      let dataNotif = response.data.data || [];

      // JIKA ROLE SAMSAT: Saring khusus notifikasi yang berkaitan dengan Order PKB
      if (userActive?.role === "samsat") {
        dataNotif = dataNotif.filter((item) => {
          const judul = item.judul?.toLowerCase() || "";
          const pesan = item.pesan?.toLowerCase() || "";
          const target = item.menu_target?.toLowerCase() || "";
          const tipe = item.tipe?.toLowerCase() || "";

          // Cek apakah notifikasi ini benar-benar terkait PKB / Order / Samsat
          return (
            judul.includes("pkb") ||
            pesan.includes("pkb") ||
            judul.includes("samsat") ||
            pesan.includes("samsat") ||
            target.includes("samsat") ||
            target.includes("pkb") ||
            tipe === "order"
          );
        });
      }

      setNotifs(dataNotif);
    } catch (error) {
      console.error("Gagal memuat notifikasi dari server:", error);
    } finally {
      setLoading(false);
    }
  };

  // Menghitung jumlah unread langsung dari state atau dari response backend (response.data.unread_count)
  const unreadCount = notifs.filter((item) => !item.is_read).length;

  // Fungsi saat item notifikasi diklik
  const handleItemClick = async (id, menuTarget) => {
    // 1. UPDATE STATE LOKAL SECARA INSTAN (BIAR TITIK MERAH LANGSUNG HILANG)
    setNotifs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: true } : item)),
    );

    try {
      // 2. KIRIM PERINTAH KE BACKEND
      await API.put(`/notifikasi/${id}/read`);
    } catch (error) {
      console.error("Gagal menandai notifikasi dibaca di server:", error);
    }

    // 3. PINDAHKAN HALAMAN & TUTUP POPUP
    if (setActiveMenu) {
      if (userActive?.role === "samsat") {
        setActiveMenu("Samsat");
      } else if (menuTarget) {
        setActiveMenu(menuTarget);
      }
    }

    if (setShowNotification) {
      setShowNotification(false);
    }
  };

  // Fungsi tandai semua dibaca
  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await API.put("/notifikasi/read-all");

      // Update state lokal semua jadi true
      setNotifs((prev) => prev.map((item) => ({ ...item, is_read: true })));
    } catch (error) {
      console.error("Gagal menandai semua notifikasi dibaca:", error);
    }
  };

  const getIcon = (tipe) => {
    switch (tipe) {
      case "order":
        return "📦";
      case "permintaan":
        return "📄";
      case "korporat":
        return "🚚";
      case "agen":
        return "🏢";
      case "beras":
        return "🌾";
      default:
        return "🔔";
    }
  };

  const formatTanggal = (tanggal) => {
    return new Date(tanggal).toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  return (
    <div className="notifikasi-container">
      {/* HEADER */}
      <div className="notifikasi-header">
        <div className="notifikasi-title">
          <span>🔔</span>
          <span>Notifikasi</span>

          {unreadCount > 0 && (
            <span className="notifikasi-count">{unreadCount}</span>
          )}
        </div>

        {unreadCount > 0 && (
          <button className="mark-all-btn" onClick={handleMarkAllAsRead}>
            Tandai semua dibaca
          </button>
        )}
      </div>

      {/* LIST */}
      <div className="notifikasi-list">
        {loading ? (
          <div className="notifikasi-empty">Memuat notifikasi...</div>
        ) : notifs.length === 0 ? (
          <div className="notifikasi-empty">
            <div className="empty-icon">🔔</div>
            <div>Belum ada notifikasi</div>
          </div>
        ) : (
          notifs.map((item) => (
            <div
              key={item.id}
              className={`notifikasi-item ${item.is_read ? "read" : "unread"}`}
              onClick={() => handleItemClick(item.id, item.menu_target)}
            >
              <div className="notifikasi-item-icon">{getIcon(item.tipe)}</div>

              <div className="notifikasi-content">
                <div className="notifikasi-item-title">{item.judul}</div>

                <div className="notifikasi-item-message">{item.pesan}</div>

                <div className="notifikasi-time">
                  {formatTanggal(item.created_at)}
                </div>
              </div>

              {!item.is_read && <div className="unread-dot"></div>}
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      {notifs.length > 0 && (
        <div className="notifikasi-footer">Lihat semua aktivitas</div>
      )}
    </div>
  );
}

export default Notifikasi;
