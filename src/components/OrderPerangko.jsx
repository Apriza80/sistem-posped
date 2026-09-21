import React, { useState, useEffect } from "react";
import API from "./axios";
import "./OrderPerangko.css";

function OrderPerangko({ userActive, onSimpanOrderPerangko }) {
  const [tanggal] = useState(new Date().toISOString().split("T")[0]);

  // Ambil daftar harga master dari localStorage, fallback ke kelipatan 500 s.d 10000 jika belum ada
  const [daftarHarga, setDaftarHarga] = useState(() => {
    const saved = localStorage.getItem("master_daftar_harga_perangko");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        /* ignore */
      }
    }
    const def = [];
    for (let i = 500; i <= 10000; i += 500) def.push(i);
    return def;
  });

  const [hargaSatuan, setHargaSatuan] = useState(daftarHarga[0] || 1000);
  const [jumlahKeping, setJumlahKeping] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // State tambahan untuk Riwayat & Pagination
  const [daftarRiwayat, setDaftarRiwayat] = useState([]);
  const [filterTanggalRiwayat, setFilterTanggalRiwayat] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Ambil data riwayat & sinkronisasi harga master saat komponen dimuat
  useEffect(() => {
    fetchRiwayatOrderPerangko();

    const handleStorageChange = () => {
      const saved = localStorage.getItem("master_daftar_harga_perangko");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setDaftarHarga(parsed);
          if (!parsed.includes(Number(hargaSatuan))) {
            setHargaSatuan(parsed[0]);
          }
        } catch (e) {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [hargaSatuan]);

  const fetchRiwayatOrderPerangko = async () => {
    try {
      const res = await API.get("/order-perangko");
      const dataFromServer = res.data.data || res.data;
      setDaftarRiwayat(dataFromServer);
    } catch (err) {
      console.error("Gagal mengambil riwayat order perangko:", err);
    }
  };

  // Hitung total nilai otomatis (Harga Satuan x Jumlah Keping)
  const totalNilai = Number(hargaSatuan) * (Number(jumlahKeping) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jumlahKeping || jumlahKeping <= 0) {
      alert("Harap masukkan jumlah keping perangko dengan benar!");
      return;
    }

    const payload = {
      tanggal: tanggal,
      nominal_perangko: Number(hargaSatuan),
      jumlah_keping: Number(jumlahKeping),
      total_nilai: totalNilai,
    };

    try {
      setSubmitting(true);
      const res = await API.post("/order-perangko", payload);

      if (onSimpanOrderPerangko) {
        onSimpanOrderPerangko(res.data.data);
      }

      // Reset form & refresh riwayat
      setJumlahKeping("");
      fetchRiwayatOrderPerangko();
      setCurrentPage(1);
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0][0];
        alert(firstError);
      } else {
        alert("Gagal menyimpan order perangko. Cek kembali koneksi.");
      }
      console.error(err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  // Filter pencarian murni berdasarkan tanggal riwayat
  const filteredRiwayat = daftarRiwayat.filter((item) => {
    return !filterTanggalRiwayat || item.tanggal === filterTanggalRiwayat;
  });

  // Reset halaman ke 1 jika filter tanggal berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTanggalRiwayat]);

  // Logika Pagination (10 data per halaman)
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRiwayat.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRiwayat.length / itemsPerPage) || 1;

  return (
    <div className="order-materai-container" style={{ paddingBottom: "80px" }}>
      <div className="page-header-box">
        <h2 className="page-main-title">Order Perangko</h2>
      </div>

      <div className="order-materai-card">
        <form onSubmit={handleSubmit}>
          {/* TANGGAL */}
          <div className="form-group">
            <label>Tanggal</label>
            <input
              type="date"
              className="form-control"
              value={tanggal}
              readOnly
              style={{
                backgroundColor: "#f1f5f9",
                cursor: "not-allowed",
                fontWeight: "600",
              }}
            />
          </div>

          {/* DROPDOWN PILIHAN HARGA PERANGKO MENGIKUTI MASTER */}
          <div className="form-group">
            <label>Perangko (Nominal)</label>
            <select
              className="form-control"
              value={hargaSatuan}
              onChange={(e) => setHargaSatuan(e.target.value)}
            >
              {daftarHarga.map((harga) => (
                <option key={harga} value={harga}>
                  Rp {harga.toLocaleString("id-ID")}
                </option>
              ))}
            </select>
          </div>

          {/* KANTOR USER */}
          <div className="form-group">
            <label>Kantor User</label>
            <input
              type="text"
              className="form-control form-control-disabled"
              value={
                userActive ? userActive.kantor : "Kantor Pos Sidoarjo 61200"
              }
              disabled
            />
          </div>

          {/* JUMLAH KEPING */}
          <div className="form-group">
            <label>Jumlah Keping</label>
            <input
              type="number"
              className="form-control"
              placeholder="Masukkan jumlah keping..."
              value={jumlahKeping}
              onChange={(e) => setJumlahKeping(e.target.value)}
              required
              min="1"
            />
          </div>

          {/* TOTAL NILAI (OTOMATIS) */}
          <div className="form-group form-group-last">
            <label>Total Nilai</label>
            <input
              type="text"
              className="form-control form-control-highlight"
              value={`Rp ${totalNilai.toLocaleString("id-ID")}`}
              disabled
            />
          </div>

          {/* TOMBOL SIMPAN DI KANAN BAWAH */}
          <div className="form-action-box">
            <button
              type="submit"
              className="btn-simpan-materai"
              disabled={submitting}
            >
              {submitting
                ? "Menyimpan..."
                : `Simpan Order Perangko (Rp ${Number(
                    hargaSatuan,
                  ).toLocaleString("id-ID")})`}
            </button>
          </div>
        </form>
      </div>

      {/* TABEL RIWAYAT ORDER PERANGKO PETUGAS DI BAWAH FORM INPUT */}
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
            📜 Riwayat Order Perangko
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", marginTop: "4px" }}>
            Daftar riwayat pesanan perangko yang telah diajukan.
          </p>
        </div>

        {/* FILTER TANGGAL KHUSUS */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            value={filterTanggalRiwayat}
            onChange={(e) => setFilterTanggalRiwayat(e.target.value)}
            style={{
              width: "220px",
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
                <th style={{ padding: "12px" }}>Nominal Satuan</th>
                <th style={{ padding: "12px" }}>Jumlah Keping</th>
                <th style={{ padding: "12px" }}>Total Nilai</th>
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
                    <td style={{ padding: "12px" }}>
                      Rp{" "}
                      {Number(item.nominal_perangko || 1000).toLocaleString(
                        "id-ID",
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {item.jumlah_keping} Pcs
                    </td>
                    <td style={{ padding: "12px", fontWeight: "600" }}>
                      Rp{" "}
                      {(
                        Number(item.nominal_perangko || 1000) *
                        Number(item.jumlah_keping || 0)
                      ).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#64748b",
                      fontStyle: "italic",
                    }}
                  >
                    Belum ada data riwayat order perangko sesuai tanggal
                    tersebut.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION / TOMBOL NAVIGASI HALAMAN */}
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

export default OrderPerangko;
