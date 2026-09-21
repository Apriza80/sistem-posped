import React from "react";
import "./Dashboard.css";

function Dashboard({ setActiveTab, userActive }) {
  const role = (userActive?.role || "").toLowerCase();

  // Daftar menu card utama yang disesuaikan lengkap dengan akses role Petugas, Admin, & Agen Pos
  const allMenuCards = [
    {
      title: "Neraca N2",
      desc: "Akses dan kelola data neraca laporan",
      target: "Neraca N2",
      allowedRoles: ["superadmin", "admin", "petugas", "petugas loket"],
    },
    {
      title: "Rekap N2",
      desc: "Lihat rekapitulasi data neraca dan laporan",
      target: "Rekap N2",
      allowedRoles: ["superadmin", "admin", "petugas", "petugas loket"],
    },
    {
      title: "Backsheet",
      desc: "Kelola dokumen dan lembar backsheet",
      target: "Backsheet Pospay",
      allowedRoles: ["superadmin", "admin", "petugas", "petugas loket"],
    },
    {
      title: "Order",
      desc: "Pantau daftar order dan pemesanan layanan (PKB, Materai, Perangko)",
      target: "Order PKB",
      allowedRoles: ["superadmin", "admin", "petugas", "petugas loket"],
    },
    {
      title: "Permintaan Barang",
      desc: "Kelola dan ajukan permintaan barang operasional",
      target: "Permintaan Barang (Per7)",
      allowedRoles: ["superadmin", "admin", "petugas", "petugas loket"],
    },
    {
      title: "Penjualan",
      desc: "Lihat rekapitulasi transaksi penjualan beras & produk",
      target: "Penjualan Beras",
      allowedRoles: ["superadmin", "admin", "petugas", "petugas loket"],
    },
    {
      title: "Kiriman Korporat",
      desc: "Pantau data dan pengiriman korporat",
      target: "Kiriman Korporat",
      allowedRoles: ["superadmin", "admin", "petugas", "petugas loket"],
    },
    {
      title: "Agen Pos",
      desc: "Kelola data order, produk, dan transaksi agen pos",
      target: "Agen Pos",
      allowedRoles: ["superadmin", "admin", "agenpos"],
    },
    {
      title: "Samsat",
      desc: "Kelola layanan dan data Samsat",
      target: "Samsat",
      allowedRoles: ["superadmin", "admin", "samsat"],
    },
    {
      title: "Administrasi",
      desc: "Kelola User, Kantor, dan Master Barang",
      target: "Kelola Barang",
      allowedRoles: ["superadmin", "admin"],
    },
  ];

  // Menyaring card berdasarkan role user yang aktif (fleksibel mengecek substring role)
  const menuCards = allMenuCards.filter((menu) =>
    menu.allowedRoles.some((r) => role.includes(r)),
  );

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>
      <p style={{ color: "#64748b", marginBottom: "24px", fontSize: "14px" }}>
        Selamat datang kembali,{" "}
        <strong>{userActive?.nama || userActive?.name || role}</strong>. Silakan
        pilih menu di bawah untuk mulai mengelola sistem.
      </p>

      {/* Grid Kartu Menu Interaktif */}
      <div className="stats-grid">
        {menuCards.map((menu, idx) => (
          <div
            className="stat-card"
            key={idx}
            onClick={() => {
              if (setActiveTab) {
                setActiveTab(menu.target);
              }
            }}
            title={`Klik untuk buka ${menu.title}`}
          >
            <div
              className="stat-title"
              style={{
                fontSize: "18px",
                fontWeight: "700",
                color: "#17365d",
                marginBottom: "8px",
              }}
            >
              {menu.title}
            </div>

            <div
              className="stat-sub"
              style={{
                fontSize: "13px",
                color: "#64748b",
                lineHeight: "1.4",
              }}
            >
              {menu.desc}
            </div>

            <div
              className="dashboard-menu-arrow"
              style={{
                marginTop: "12px",
                fontSize: "12px",
                color: "#075da8",
                fontWeight: "600",
              }}
            >
              Buka Menu →
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
