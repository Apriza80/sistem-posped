import React, { useState, useEffect } from "react";
import API from "./axios";
import "./OrderPKB.css";

function OrderPKB({ userActive, onSimpanOrder, setActiveMenu }) {
  const [user] = useState(userActive?.nama || "Cece Zia");
  const [kantor] = useState(userActive?.kantor || "Kantor Pos Krembung");
  const [tanggalOrder] = useState(new Date().toISOString().split("T")[0]);
  const [nama, setName] = useState("");
  const [platNomor, setPlatNomor] = useState("");
  const [noBuktiBayar, setNoBuktiBayar] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State tambahan untuk riwayat order PKB & Pagination
  const [daftarRiwayat, setDaftarRiwayat] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTanggalRiwayat, setFilterTanggalRiwayat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil data riwayat saat komponen dimuat
  useEffect(() => {
    fetchRiwayatOrder();
  }, []);

  const fetchRiwayatOrder = async () => {
    try {
      const res = await API.get("/order-pkb");
      const dataFromServer = res.data.data || res.data;
      setDaftarRiwayat(dataFromServer);
    } catch (err) {
      console.error("Gagal mengambil riwayat order PKB:", err);
    }
  };

  const handleKirimOrder = async (e) => {
    e.preventDefault();
    if (!nama || !platNomor || !noBuktiBayar) {
      alert("Harap isi Nama, Plat Nomor, dan No. Bukti Bayar secara lengkap!");
      return;
    }

    const payload = {
      tanggal: tanggalOrder,
      nama_pemilik: nama,
      nopol: platNomor,
      no_bayar: noBuktiBayar,
    };

    try {
      setSubmitting(true);
      const res = await API.post("/order-pkb", payload);

      if (onSimpanOrder) {
        onSimpanOrder(res.data.data);
      }

      // Reset form tanpa mengarahkan ke menu Samsat
      setName("");
      setPlatNomor("");
      setNoBuktiBayar("");

      // Refresh tabel riwayat otomatis setelah berhasil kirim
      fetchRiwayatOrder();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        alert(firstError);
      } else {
        alert("Gagal mengirim order. Cek kembali koneksi.");
      }
      console.error(err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter pencarian berdasarkan teks (nama/nopol/no_bayar) dan filter tanggal riwayat
  const filteredRiwayat = daftarRiwayat.filter((item) => {
    const keyword = searchTerm.toLowerCase();
    const namaPemilik = String(item.nama_pemilik || "").toLowerCase();
    const nopol = String(item.nopol || "").toLowerCase();
    const noBayar = String(item.no_bayar || "").toLowerCase();

    const matchText =
      !searchTerm ||
      namaPemilik.includes(keyword) ||
      nopol.includes(keyword) ||
      noBayar.includes(keyword);

    const matchTanggal =
      !filterTanggalRiwayat || item.tanggal === filterTanggalRiwayat;

    return matchText && matchTanggal;
  });

  // Reset halaman ke 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTanggalRiwayat]);

  // Logika Pagination (10 data per halaman)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRiwayat.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage) || 1;

  return (
    <div className="neraca-container" style={{ paddingBottom: "80px" }}>
      {/* JUDUL HALAMAN UTAMA */}
      <div className="page-header-box">
        <h2 className="page-main-title">Order Percetakan PKB</h2>
      </div>

      {/* KARTU FORM INPUT */}
      <div className="card form-card" style={{ marginTop: "16px" }}>
        <form onSubmit={handleKirimOrder}>
          <div className="form-grid-3">
            <div>
              <label>User</label>
              <input
                type="text"
                value={user}
                disabled
                className="input-disabled"
              />
            </div>
            <div>
              <label>Kantor</label>
              <input
                type="text"
                value={kantor}
                disabled
                className="input-disabled"
              />
            </div>
            <div>
              <label>Tanggal Order</label>
              <input
                type="date"
                value={tanggalOrder}
                readOnly
                className="form-control"
                style={{
                  backgroundColor: "#f1f5f9",
                  cursor: "not-allowed",
                  fontWeight: "600",
                }}
              />
            </div>
          </div>

          <div className="form-grid-3" style={{ marginTop: "16px" }}>
            <div>
              <label>Nama</label>
              <input
                type="text"
                placeholder="Nama pemilik kendaraan"
                value={nama}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label>Plat Nomor</label>
              <input
                type="text"
                placeholder="Contoh: L 1234 AB"
                value={platNomor}
                onChange={(e) => setPlatNomor(e.target.value)}
              />
            </div>
            <div>
              <label>No. Bukti Bayar</label>
              <input
                type="text"
                placeholder="Nomor bukti bayar"
                value={noBuktiBayar}
                onChange={(e) => setNoBuktiBayar(e.target.value)}
              />
            </div>
          </div>

          <div
            className="form-footer-row"
            style={{ justifyContent: "flex-end", marginTop: "24px" }}
          >
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Mengirim..." : "Kirim Order"}
            </button>
          </div>
        </form>
      </div>

      {/* TABEL RIWAYAT ORDER PKB DI BAWAH FORM INPUT */}
      <div
        className="card"
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "#ffffff",
          borderRadius: "12px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b" }}>
            📜 Riwayat Order Percetakan PKB
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
            Daftar riwayat pesanan percetakan PKB yang telah diajukan.
          </p>
        </div>

        {/* INPUT PENCARIAN & FILTER TANGGAL */}
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
            placeholder="Cari berdasarkan nama, plat nomor, atau no bukti bayar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              minWidth: "240px",
              padding: "10px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "14px",
            }}
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

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "2px solid #e2e8f0",
                  color: "#475569",
                  fontSize: "13px",
                }}
              >
                <th style={{ padding: "12px" }}>No</th>
                <th style={{ padding: "12px" }}>Tanggal</th>
                <th style={{ padding: "12px" }}>Nama Pemilik</th>
                <th style={{ padding: "12px" }}>Plat Nomor (Nopol)</th>
                <th style={{ padding: "12px" }}>No. Bukti Bayar</th>
                <th style={{ padding: "12px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr
                    key={item.id || index}
                    style={{
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "14px",
                      color: "#1e293b",
                    }}
                  >
                    <td style={{ padding: "12px" }}>
                      {indexOfFirstItem + index + 1}
                    </td>
                    <td style={{ padding: "12px" }}>{item.tanggal}</td>
                    <td style={{ padding: "12px", fontWeight: "600" }}>
                      {item.nama_pemilik}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          background: "#f1f5f9",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: "600",
                          color: "#334155",
                        }}
                      >
                        {item.nopol}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>{item.no_bayar}</td>
                    <td style={{ padding: "12px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background:
                            item.status === "Kirim" ||
                            item.status === "Selesai" ||
                            item.status === "Disetujui"
                              ? "#dcfce7"
                              : "#fef9c3",
                          color:
                            item.status === "Kirim" ||
                            item.status === "Selesai" ||
                            item.status === "Disetujui"
                              ? "#166534"
                              : "#854d0e",
                        }}
                      >
                        {item.status || "Kirim"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#64748b",
                      fontStyle: "italic",
                    }}
                  >
                    Belum ada data riwayat order PKB yang sesuai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* TOMBOL NAVIGASI / PAGINATION */}
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
              {Math.min(indexOfLastItem, filteredRiwayat.length)} dari{" "}
              {filteredRiwayat.length} data
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

export default OrderPKB;
