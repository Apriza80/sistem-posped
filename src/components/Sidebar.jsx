import React, { useState, useEffect } from "react";

function Sidebar({ isOpen, activeMenu, setActiveMenu, userActive }) {
  const role = userActive?.role || "";

  const [openSubmenu, setOpenSubmenu] = useState({
    neraca: false,
    backsheet: false,
    order: false,
    penjualan: false,
    samsat: false,
    agenPos: false,
    kirimanKorporat: false,
    rekapLaporan: false,
    administrasi: false,
  });

  // Otomatis buka dropdown yang sesuai berdasarkan activeMenu yang sedang dipilih (termasuk dari Dashboard)
  useEffect(() => {
    setOpenSubmenu({
      neraca: activeMenu === "Neraca N2" || activeMenu === "Rekap N2",
      backsheet:
        activeMenu.includes("Pospay") ||
        activeMenu.includes("Backsheet") ||
        activeMenu === "Remittance" ||
        activeMenu === "Core Giro System" ||
        activeMenu === "Kurlog",
      order:
        activeMenu.startsWith("Order") ||
        activeMenu === "Permintaan Barang (Per7)",
      penjualan: activeMenu === "Penjualan Beras",
      samsat: activeMenu === "Samsat",
      agenPos: activeMenu === "Agen Pos",
      kirimanKorporat: activeMenu === "Kiriman Korporat",
      rekapLaporan:
        activeMenu.includes("Riwayat") ||
        activeMenu === "Riwayat Penjualan" ||
        activeMenu === "Riwayat Korporat",
      administrasi:
        activeMenu === "Kelola User" ||
        activeMenu === "Kelola Kantor" ||
        activeMenu === "Kelola Barang",
    });
  }, [activeMenu]);

  const toggleSubmenu = (key) => {
    setOpenSubmenu((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <nav className="nav-list">
        {/* Dashboard */}
        <button
          className={`nav-item ${activeMenu === "Dashboard" ? "active" : ""}`}
          onClick={() => setActiveMenu("Dashboard")}
        >
          <div className="nav-left-content">
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Dashboard</span>
          </div>
        </button>

        {/* Neraca (Superadmin, Admin, Petugas, Oranger) */}
        {["superadmin", "admin", "petugas", "oranger"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item nav-parent ${activeMenu.includes("N2") ? "active" : ""}`}
              onClick={() => toggleSubmenu("neraca")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Neraca</span>
              </div>
              <span
                className={`arrow-icon ${openSubmenu.neraca ? "rotate" : ""}`}
              >
                ›
              </span>
            </button>
            {openSubmenu.neraca && (
              <div className="submenu-list">
                <button
                  className={`submenu-item ${activeMenu === "Neraca N2" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Neraca N2")}
                >
                  Neraca N2
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Rekap N2" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Rekap N2")}
                >
                  Rekap N2
                </button>
              </div>
            )}
          </div>
        )}

        {/* Backsheet (Superadmin, Admin, Petugas, Oranger) */}
        {["superadmin", "admin", "petugas", "oranger"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item nav-parent ${activeMenu.includes("Pospay") || activeMenu.includes("Backsheet") || activeMenu === "Remittance" || activeMenu === "Core Giro System" || activeMenu === "Kurlog" ? "active" : ""}`}
              onClick={() => toggleSubmenu("backsheet")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Backsheet</span>
              </div>
              <span
                className={`arrow-icon ${openSubmenu.backsheet ? "rotate" : ""}`}
              >
                ›
              </span>
            </button>
            {openSubmenu.backsheet && (
              <div className="submenu-list">
                {role !== "oranger" && (
                  <button
                    className={`submenu-item ${activeMenu === "Backsheet Pospay" || activeMenu === "Pospay" ? "active-sub" : ""}`}
                    onClick={() => setActiveMenu("Backsheet Pospay")}
                  >
                    Pospay
                  </button>
                )}
                <button
                  className={`submenu-item ${activeMenu === "Kurlog" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Kurlog")}
                >
                  Kurlog
                </button>
                {role !== "oranger" && (
                  <>
                    <button
                      className={`submenu-item ${activeMenu === "Remittance" ? "active-sub" : ""}`}
                      onClick={() => setActiveMenu("Remittance")}
                    >
                      Remittance
                    </button>
                    <button
                      className={`submenu-item ${activeMenu === "Core Giro System" ? "active-sub" : ""}`}
                      onClick={() => setActiveMenu("Core Giro System")}
                    >
                      Core Giro System
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Order (Superadmin, Admin, Petugas) */}
        {["superadmin", "admin", "petugas"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item nav-parent ${
                activeMenu.startsWith("Order") ||
                activeMenu === "Permintaan Barang (Per7)"
                  ? "active"
                  : ""
              }`}
              onClick={() => toggleSubmenu("order")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Order</span>
              </div>
              <span
                className={`arrow-icon ${openSubmenu.order ? "rotate" : ""}`}
              >
                ›
              </span>
            </button>
            {openSubmenu.order && (
              <div className="submenu-list">
                <button
                  className={`submenu-item ${activeMenu === "Order PKB" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Order PKB")}
                >
                  Order PKB
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Order Materai" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Order Materai")}
                >
                  Order Materai
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Order Perangko" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Order Perangko")}
                >
                  Order Perangko
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Permintaan Barang (Per7)" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Permintaan Barang (Per7)")}
                >
                  Permintaan Barang (Per7)
                </button>
              </div>
            )}
          </div>
        )}

        {/* Penjualan (Superadmin, Admin, Petugas) */}
        {["superadmin", "admin", "petugas"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item ${activeMenu === "Penjualan Beras" ? "active" : ""}`}
              onClick={() => setActiveMenu("Penjualan Beras")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Penjualan</span>
              </div>
            </button>
          </div>
        )}

        {/* Agen Pos (Superadmin, Admin, Agen Pos) */}
        {["superadmin", "admin", "agenpos"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item ${activeMenu === "Agen Pos" ? "active" : ""}`}
              onClick={() => setActiveMenu("Agen Pos")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Agen Pos</span>
              </div>
            </button>
          </div>
        )}

        {/* Kiriman Korporat (Superadmin, Admin, Petugas, Mitra) */}
        {["superadmin", "admin", "petugas", "mitra"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item ${activeMenu === "Kiriman Korporat" ? "active" : ""}`}
              onClick={() => setActiveMenu("Kiriman Korporat")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Kiriman Korporat</span>
              </div>
            </button>
          </div>
        )}

        {/* Samsat (Superadmin, Admin, Samsat) */}
        {["superadmin", "admin", "samsat"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item ${activeMenu === "Samsat" ? "active" : ""}`}
              onClick={() => setActiveMenu("Samsat")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Samsat</span>
              </div>
            </button>
          </div>
        )}

        {/* Rekap Laporan (Hanya Superadmin & Admin - Petugas TIDAK) */}
        {["superadmin", "admin"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item nav-parent ${activeMenu.includes("Riwayat") || activeMenu === "Riwayat Penjualan" || activeMenu === "Riwayat Korporat" ? "active" : ""}`}
              onClick={() => toggleSubmenu("rekapLaporan")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Rekap Laporan</span>
              </div>
              <span
                className={`arrow-icon ${openSubmenu.rekapLaporan ? "rotate" : ""}`}
              >
                ›
              </span>
            </button>
            {openSubmenu.rekapLaporan && (
              <div className="submenu-list">
                <button
                  className={`submenu-item ${activeMenu === "Riwayat Penjualan" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Riwayat Penjualan")}
                >
                  Riwayat Penjualan
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Riwayat Order PKB" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Riwayat Order PKB")}
                >
                  Riwayat Order PKB
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Riwayat Order Materai" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Riwayat Order Materai")}
                >
                  Riwayat Order Materai
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Riwayat Order Perangko" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Riwayat Order Perangko")}
                >
                  Riwayat Order Perangko
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Riwayat Permintaan Barang" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Riwayat Permintaan Barang")}
                >
                  Riwayat Permintaan Barang
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Riwayat Agen Pos" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Riwayat Agen Pos")}
                >
                  Riwayat Agen Pos
                </button>
                <button
                  className={`submenu-item ${activeMenu === "Riwayat Korporat" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Riwayat Korporat")}
                >
                  Riwayat Korporat
                </button>
              </div>
            )}
          </div>
        )}

        {/* Administrasi (Superadmin & Admin - Kelola User & Kantor khusus Superadmin) */}
        {["superadmin", "admin"].includes(role) && (
          <div className="menu-group">
            <button
              className={`nav-item nav-parent ${activeMenu === "Kelola User" || activeMenu === "Kelola Kantor" || activeMenu === "Kelola Barang" ? "active" : ""}`}
              onClick={() => toggleSubmenu("administrasi")}
            >
              <div className="nav-left-content">
                <span className="nav-icon">🔲</span>
                <span className="nav-text">Administrasi</span>
              </div>
              <span
                className={`arrow-icon ${openSubmenu.administrasi ? "rotate" : ""}`}
              >
                ›
              </span>
            </button>
            {openSubmenu.administrasi && (
              <div className="submenu-list">
                {role === "superadmin" && (
                  <>
                    <button
                      className={`submenu-item ${activeMenu === "Kelola User" ? "active-sub" : ""}`}
                      onClick={() => setActiveMenu("Kelola User")}
                    >
                      Kelola User
                    </button>
                    <button
                      className={`submenu-item ${activeMenu === "Kelola Kantor" ? "active-sub" : ""}`}
                      onClick={() => setActiveMenu("Kelola Kantor")}
                    >
                      Kelola Kantor
                    </button>
                  </>
                )}
                <button
                  className={`submenu-item ${activeMenu === "Kelola Barang" ? "active-sub" : ""}`}
                  onClick={() => setActiveMenu("Kelola Barang")}
                >
                  Kelola Barang
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </aside>
  );
}

export default Sidebar;
