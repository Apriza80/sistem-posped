import React, { useState, useEffect } from "react";
import API from "./axios"; // Sesuaikan jalur file axios kamu jika berada di folder lain
import "./PenjualanBeras.css";
import "./LaporanPenjualan.css";

function PenjualanBeras({ userActive }) {
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [jenisBeras] = useState("SPHP"); // Dikunci tetap SPHP
  const [jumlahTerjual, setJumlahTerjual] = useState("");
  // Harga per sak dikunci, bernilai tetap dari ketetapan pusat/admin
  const [hargaPerSak] = useState("62500");

  const [riwayatPenjualan, setRiwayatPenjualan] = useState([]);
  const [stokTersedia, setStokTersedia] = useState(0);

  // State untuk search kantor & filter tanggal riwayat & pagination
  const [searchTermKantor, setSearchTermKantor] = useState("");
  const [filterTanggalRiwayat, setFilterTanggalRiwayat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const namaKantorAktif = userActive?.kantor || "Kantor Pos KC Sidoarjo 61200";

  const totalPenjualanInput =
    (Number(jumlahTerjual) || 0) * (Number(hargaPerSak) || 0);

  // =========================================================
  // LOAD DATA DARI BACKEND LARAVEL
  // =========================================================
  const loadDataBackend = async () => {
    try {
      // 1. Ambil Riwayat Penjualan dari backend (kirim parameter kantor jika petugas)
      const resPenjualan = await API.get("/penjualan-beras", {
        params: { nama_kantor: namaKantorAktif },
      });
      if (resPenjualan.data && resPenjualan.data.status === "success") {
        setRiwayatPenjualan(resPenjualan.data.data);
      }

      // 2. Ambil Stok Berdasarkan Kantor Aktif User
      const resStok = await API.get("/stok-beras", {
        params: { nama_kantor: namaKantorAktif },
      });
      if (resStok.data && resStok.data.status === "success") {
        setStokTersedia(resStok.data.data.sisa_stok || 0);
      }
    } catch (error) {
      console.error("Gagal memuat data dari backend:", error);
    }
  };

  useEffect(() => {
    loadDataBackend();
  }, [namaKantorAktif]);

  // =========================================================
  // SIMPAN PENJUALAN KE BACKEND LARAVEL
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!jumlahTerjual || !hargaPerSak) {
      alert("Harap isi Jumlah Terjual (Sak) dan Harga per Sak!");
      return;
    }

    const jumlah = Number(jumlahTerjual);

    if (jumlah <= 0) {
      alert("Jumlah terjual harus lebih dari 0 Sak!");
      return;
    }

    if (jumlah > stokTersedia) {
      alert(
        `Stok tidak cukup! Sisa stok kantor saat ini hanya ${stokTersedia} Sak.`,
      );
      return;
    }

    try {
      const payload = {
        tanggal,
        jenis_beras: jenisBeras,
        terjual: jumlah,
        harga_per_sak: Number(hargaPerSak),
      };

      const response = await API.post("/penjualan-beras", payload);

      if (response.data && response.data.status === "success") {
        alert(response.data.message || "Penjualan beras berhasil dicatat!");
        setJumlahTerjual("");
        loadDataBackend(); // Refresh data tabel dan sisa stok terbaru
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Gagal menyimpan penjualan:", error);
      alert(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan transaksi ke server.",
      );
    }
  };

  // =========================================================
  // FILTER RIWAYAT (BERDASARKAN KANTOR & TANGGAL)
  // =========================================================
  const filteredData = riwayatPenjualan.filter((item) => {
    const kantorItem = String(
      item.nama_kantor || namaKantorAktif,
    ).toLowerCase();
    const matchKantor = kantorItem.includes(searchTermKantor.toLowerCase());

    const matchTanggal =
      !filterTanggalRiwayat || item.tanggal === filterTanggalRiwayat;

    return matchKantor && matchTanggal;
  });

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTermKantor, filterTanggalRiwayat]);

  // Logika Pagination (10 data per halaman)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  // =========================================================
  // TOTAL PENDAPATAN
  // =========================================================
  const totalPendapatanKeseluruhan = filteredData.reduce(
    (acc, curr) => acc + (Number(curr.total_harga) || 0),
    0,
  );

  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div className="pb-page-container">
      {/* =====================================================
          HEADER
      ===================================================== */}
      <div className="pb-top-banner">
        <div className="pb-banner-title">
          <span className="pb-accent-bar"></span>

          <div>
            <h2>Penjualan Beras ({namaKantorAktif})</h2>

            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                marginTop: "4px",
              }}
            >
              Input transaksi dan pantau riwayat penjualan beras terhubung ke
              database.
            </p>
          </div>
        </div>
      </div>

      {/* =====================================================
          TOTAL STOK TERSEDIA
      ===================================================== */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="pb-main-card"
          style={{
            marginBottom: "0",
            padding: "20px",
          }}
        >
          <div
            style={{
              fontSize: "24px",
              marginBottom: "8px",
            }}
          >
            📦
          </div>

          <h4
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#1e293b",
              marginBottom: "4px",
            }}
          >
            Total Stok Tersedia
          </h4>

          <p
            style={{
              fontSize: "14px",
              color: "#64748b",
              margin: "0",
            }}
          >
            <strong
              style={{
                color: "#0d9488",
                fontSize: "16px",
              }}
            >
              {stokTersedia} Sak
            </strong>{" "}
            stok beras tersedia dari admin.
          </p>
        </div>
      </div>

      {/* =====================================================
          FORM PENJUALAN
      ===================================================== */}
      <div
        className="pb-main-card"
        style={{
          marginBottom: "24px",
        }}
      >
        <div
          style={{
            marginBottom: "16px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Form Input Penjualan Beras
          </h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            {/* TANGGAL */}
            <div className="pb-field-group">
              <label>Tanggal Transaksi</label>

              <input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="pb-input-control"
                required
              />
            </div>

            {/* JENIS BERAS (DIKUNCI) */}
            <div className="pb-field-group">
              <label>Jenis Beras</label>

              <input
                type="text"
                value={jenisBeras}
                disabled
                className="pb-input-control"
                style={{
                  fontWeight: "bold",
                  color: "#334155",
                  background: "#f8fafc",
                  cursor: "not-allowed",
                }}
              />
            </div>

            {/* JUMLAH TERJUAL */}
            <div className="pb-field-group">
              <label>Jumlah Terjual (Sak)</label>

              <input
                type="number"
                placeholder="Masukkan jumlah sak yang terjual hari ini"
                value={jumlahTerjual}
                onChange={(e) => setJumlahTerjual(e.target.value)}
                className="pb-input-control"
                min="1"
                required
              />
            </div>

            {/* HARGA PER SAK (DIKUNCI / KETETAPAN PUSAT) */}
            <div className="pb-field-group">
              <label>Harga per Sak (5 Kg) - Ketetapan Pusat</label>

              <input
                type="text"
                value={`Rp${Number(hargaPerSak).toLocaleString("id-ID")}`}
                disabled
                className="pb-input-control"
                style={{
                  fontWeight: "bold",
                  color: "#334155",
                  background: "#f8fafc",
                  cursor: "not-allowed",
                }}
              />
            </div>

            {/* TOTAL */}
            <div className="pb-field-group">
              <label>Total Penjualan</label>

              <input
                type="text"
                value={`Rp${totalPenjualanInput.toLocaleString("id-ID")}`}
                disabled
                className="pb-input-control"
                style={{
                  fontWeight: "bold",
                  color: "#0d9488",
                  background: "#f8fafc",
                }}
              />
            </div>
          </div>

          <div
            className="pb-form-footer"
            style={{
              marginTop: "24px",
            }}
          >
            <button type="submit" className="pb-btn-submit">
              Simpan Penjualan Beras
            </button>
          </div>
        </form>
      </div>

      {/* =====================================================
          RIWAYAT PENJUALAN
      ===================================================== */}
      <div className="lp-card">
        <div
          className="lp-header"
          style={{
            marginBottom: "16px",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              Riwayat Penjualan Beras Kantor Anda
            </h3>
          </div>
        </div>

        {/* SEARCH KANTOR & FILTER TANGGAL BERDAMPINGAN */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            placeholder="Cari berdasarkan nama kantor..."
            value={searchTermKantor}
            onChange={(e) => setSearchTermKantor(e.target.value)}
            className="lp-search-input"
            style={{ flex: "1", minWidth: "240px" }}
          />
          <input
            type="date"
            value={filterTanggalRiwayat}
            onChange={(e) => setFilterTanggalRiwayat(e.target.value)}
            style={{
              width: "200px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
              backgroundColor: "#fff",
            }}
          />
        </div>

        {/* TOTAL PENDAPATAN */}
        <div className="lp-summary-box">
          <span className="lp-summary-title">
            Total Pendapatan Keseluruhan:
          </span>

          <span className="lp-summary-value">
            Rp {totalPendapatanKeseluruhan.toLocaleString("id-ID")}
          </span>
        </div>

        {/* TABLE */}
        <div className="lp-table-responsive">
          <table className="lp-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Kantor</th>
                <th>Stok Admin</th>
                <th>Terjual</th>
                <th>Sisa Stok</th>
                <th>Total Harga</th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{indexOfFirstItem + index + 1}</td>

                    <td>{item.tanggal}</td>

                    <td>
                      <span className="lp-badge-kantor">
                        {item.nama_kantor || namaKantorAktif}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#0d9488",
                        }}
                      >
                        {item.stok_admin} Sak
                      </span>
                    </td>

                    <td>{item.terjual} Sak</td>

                    <td>
                      <span
                        style={{
                          fontWeight: "600",
                          color: "#2563eb",
                        }}
                      >
                        {item.sisa_stok} Sak
                      </span>
                    </td>

                    <td
                      style={{
                        fontWeight: "600",
                        color: "#0d9488",
                      }}
                    >
                      Rp {(item.total_harga || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="lp-empty-row">
                    Belum ada data riwayat penjualan beras sesuai filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION / TOMBOL HALAMAN */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "20px",
              paddingTop: "12px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <div style={{ fontSize: "13px", color: "#64748b" }}>
              Menampilkan {indexOfFirstItem + 1} -{" "}
              {Math.min(indexOfLastItem, filteredData.length)} dari{" "}
              {filteredData.length} data
            </div>
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: currentPage === 1 ? "#f1f5f9" : "#ffffff",
                  color: currentPage === 1 ? "#94a3b8" : "#334155",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Sebelumnya
              </button>

              <span
                style={{
                  padding: "6px 12px",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#334155",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Hal. {currentPage} dari {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background:
                    currentPage === totalPages ? "#f1f5f9" : "#ffffff",
                  color: currentPage === totalPages ? "#94a3b8" : "#334155",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PenjualanBeras;
