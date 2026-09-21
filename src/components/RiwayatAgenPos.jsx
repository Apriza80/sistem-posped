import React, { useState, useEffect } from "react";
import API from "./axios";
import "./RiwayatAgenPos.css";

// Ambil base domain dari axios
const API_DOMAIN = API.defaults.baseURL.replace(/\/api\/?$/, "");

function buildFileUrl(item) {
  if (item.file_url) return item.file_url;

  if (item.file_path) {
    const cleanPath = item.file_path
      .replace(/^\/+/, "")
      .replace(/^storage\//, "");

    return `${API_DOMAIN}/storage/${cleanPath}`;
  }

  if (item.buktiBayarUrl) return item.buktiBayarUrl;

  return null;
}

function RiwayatAgenPos({ onEdit, userActive }) {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter tanggal
  const [selectedDate, setSelectedDate] = useState("");

  const [listData, setListData] = useState([]);
  const [selectedItemView, setSelectedItemView] = useState(null);

  // State khusus untuk pop-up baca keterangan panjang
  const [selectedKeteranganView, setSelectedKeteranganView] = useState("");

  // State untuk Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // =========================================================
  // AMBIL DATA DARI BACKEND API
  // =========================================================
  const fetchRiwayatAdmin = async () => {
    try {
      const response = await API.get("/agen-pos");

      if (response.data.status === "success") {
        setListData(response.data.data);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat agen pos admin:", error);
    }
  };

  useEffect(() => {
    fetchRiwayatAdmin();
  }, [userActive]);

  // =========================================================
  // FILTER DATA
  // =========================================================
  const filteredData = listData.filter((item) => {
    // -----------------------------
    // Filter pencarian teks
    // -----------------------------
    const cocokPencarian = Object.values(item).some((val) =>
      String(val || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
    );

    // -----------------------------
    // Filter tanggal
    // -----------------------------
    const cocokTanggal =
      !selectedDate ||
      String(item.tanggal || "").substring(0, 10) === selectedDate;

    return cocokPencarian && cocokTanggal;
  });

  // =========================================================
  // PAGINATION
  // =========================================================
  const indexOfLastItem = currentPage * itemsPerPage;

  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  // =========================================================
  // RESET HALAMAN JIKA FILTER BERUBAH
  // =========================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  // =========================================================
  // UPDATE STATUS
  // =========================================================
  const handleStatusChange = async (id, newStatus) => {
    try {
      await API.put(`/agen-pos/${id}`, {
        status: newStatus,
      });

      setListData((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status: newStatus } : item,
        ),
      );
    } catch (error) {
      console.error("Gagal memperbarui status di server:", error);

      alert("Gagal memperbarui status ke server.");
    }
  };

  // =========================================================
  // UPDATE CATATAN LOKAL
  // =========================================================
  const handleLocalCatatanChange = (id, value) => {
    setListData((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, catatan_user: value } : item,
      ),
    );
  };

  // =========================================================
  // SIMPAN CATATAN SAAT BLUR
  // =========================================================
  const handleBlurCatatan = async (id, catatanBaru) => {
    try {
      await API.put(`/agen-pos/${id}`, {
        catatan_user: catatanBaru,
      });
    } catch (error) {
      console.error("Gagal memperbarui catatan di server:", error);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================
  const handleConfirmDelete = async (id) => {
    if (
      window.confirm(
        "Apakah Cece yakin ingin menghapus data riwayat agen pos ini?",
      )
    ) {
      try {
        await API.delete(`/agen-pos/${id}`);

        setListData((prev) => prev.filter((item) => item.id !== id));

        alert("Data berhasil dihapus dari server!");
      } catch (error) {
        console.error("Gagal menghapus data dari server:", error);

        alert("Gagal menghapus data dari server.");
      }
    }
  };

  // =========================================================
  // MODAL VIEW
  // =========================================================
  const handleOpenView = (item) => {
    setSelectedItemView(item);
  };

  const handleCloseView = () => {
    setSelectedItemView(null);
  };

  return (
    <div className="rpb-container">
      {/* =====================================================
          CSS KHUSUS KOMPONEN
         ===================================================== */}
      <style>
        {`
          /* ================================================
             FILTER SEARCH + TANGGAL
             ================================================ */

          .rpb-filter-container {
            display: flex !important;
            align-items: center !important;
            gap: 12px !important;
            width: 100% !important;
            margin-bottom: 16px !important;
            flex-wrap: nowrap !important;
            box-sizing: border-box !important;
          }

          .rpb-search-wrapper {
            flex: 1 1 auto !important;
            width: auto !important;
            min-width: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .rpb-date-wrapper {
            flex: 0 0 180px !important;
            width: 180px !important;
            min-width: 180px !important;
            max-width: 180px !important;
            display: block !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .rpb-date-input {
            display: block !important;
            width: 180px !important;
            min-width: 180px !important;
            max-width: 180px !important;
            height: 42px !important;
            min-height: 42px !important;
            max-height: 42px !important;
            margin: 0 !important;
            padding: 6px 10px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
            background: #ffffff !important;
            color: #334155 !important;
            font-size: 13px !important;
            box-sizing: border-box !important;
          }

          /* ================================================
             RESET TANGGAL
             ================================================ */

          .rpb-date-clear {
            position: absolute !important;
            margin-left: 5px !important;
            margin-top: 4px !important;
            width: auto !important;
            min-width: 0 !important;
            max-width: none !important;
            height: 30px !important;
            min-height: 30px !important;
            max-height: 30px !important;
            padding: 4px 8px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 6px !important;
            background: #f8fafc !important;
            color: #475569 !important;
            font-size: 11px !important;
            line-height: 1 !important;
            cursor: pointer !important;
            box-sizing: border-box !important;
          }

          .rpb-date-clear:hover {
            background: #f1f5f9 !important;
          }

          /* ================================================
             PAGINATION
             ================================================ */

          .rpb-pagination-container {
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            margin-top: 16px !important;
            padding: 0 8px !important;
            box-sizing: border-box !important;
            gap: 10px !important;
          }

          .rpb-pagination-info {
            display: inline-block !important;
            width: auto !important;
            height: auto !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            color: #64748b !important;
            font-size: 12px !important;
            font-weight: 400 !important;
            line-height: 1.4 !important;
            white-space: nowrap !important;
            box-sizing: border-box !important;
          }

          .rpb-pagination-buttons {
            display: flex !important;
            align-items: center !important;
            justify-content: flex-end !important;
            gap: 6px !important;
            width: auto !important;
            height: auto !important;
            min-width: 0 !important;
            min-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }

          .rpb-pagination-button {
            display: inline-flex !important;
            align-items: center !important;
            justify-content: center !important;
            flex: 0 0 auto !important;
            width: auto !important;
            min-width: 0 !important;
            max-width: none !important;
            height: 30px !important;
            min-height: 30px !important;
            max-height: 30px !important;
            margin: 0 !important;
            padding: 4px 9px !important;
            border: 1px solid #cbd5e1 !important;
            border-radius: 5px !important;
            background: #ffffff !important;
            color: #334155 !important;
            font-family: inherit !important;
            font-size: 11px !important;
            font-weight: 600 !important;
            line-height: 1 !important;
            white-space: nowrap !important;
            box-sizing: border-box !important;
            cursor: pointer !important;
          }

          .rpb-pagination-button:disabled {
            background: #f1f5f9 !important;
            color: #94a3b8 !important;
            border-color: #e2e8f0 !important;
            cursor: not-allowed !important;
            opacity: 1 !important;
          }

          .rpb-pagination-button:not(:disabled):hover {
            background: #eff6ff !important;
            border-color: #93c5fd !important;
            color: #1d4ed8 !important;
          }

          /* ================================================
             RESPONSIVE
             ================================================ */

          @media (max-width: 768px) {
            .rpb-filter-container {
              flex-wrap: wrap !important;
              align-items: center !important;
            }

            .rpb-search-wrapper {
              flex: 1 1 100% !important;
              width: 100% !important;
            }

            .rpb-date-wrapper {
              flex: 0 0 180px !important;
              width: 180px !important;
            }

            .rpb-pagination-container {
              flex-direction: column !important;
              align-items: center !important;
              justify-content: center !important;
            }

            .rpb-pagination-info {
              white-space: normal !important;
              text-align: center !important;
            }

            .rpb-pagination-buttons {
              justify-content: center !important;
            }
          }
        `}
      </style>

      {/* =====================================================
          HEADER
         ===================================================== */}
      <div className="rpb-header">
        <h1 className="rpb-title">Riwayat Agen Pos (Admin)</h1>
      </div>

      <div className="rpb-card">
        {/* ===================================================
            SEARCH + FILTER TANGGAL
           =================================================== */}
        <div className="rpb-filter-container">
          {/* Pencarian */}
          <div className="rpb-search-wrapper">
            <input
              type="text"
              placeholder="Cari riwayat agen pos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rpb-search-input"
              style={{
                width: "100%",
                height: "42px",
                boxSizing: "border-box",
                margin: 0,
              }}
            />
          </div>

          {/* Filter tanggal
              TANPA tulisan "Tanggal:" */}
          <div className="rpb-date-wrapper">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rpb-date-input"
            />

            {/* Tombol reset tanggal */}
            {selectedDate && (
              <button
                type="button"
                onClick={() => setSelectedDate("")}
                className="rpb-date-clear"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ===================================================
            INFO HASIL FILTER
           =================================================== */}
        {(searchTerm || selectedDate) && (
          <div
            style={{
              marginBottom: "12px",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            Menampilkan{" "}
            <strong
              style={{
                color: "#334155",
              }}
            >
              {filteredData.length}
            </strong>{" "}
            data
            {selectedDate && (
              <>
                {" "}
                untuk tanggal{" "}
                <strong
                  style={{
                    color: "#334155",
                  }}
                >
                  {selectedDate}
                </strong>
              </>
            )}
          </div>
        )}

        {/* ===================================================
            TABEL DATA RESPONSIF
           =================================================== */}
        <div className="rpb-table-responsive">
          <table
            className="rpb-table"
            style={{
              width: "max-content",
              minWidth: "100%",
            }}
          >
            <thead>
              <tr>
                <th>No</th>

                <th
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  Tanggal
                </th>

                {/* Nama Agen tetap satu baris */}
                <th
                  style={{
                    minWidth: "250px",
                    whiteSpace: "nowrap",
                  }}
                >
                  Nama Agen
                </th>

                <th
                  style={{
                    width: "110px",
                    maxWidth: "110px",
                  }}
                >
                  Keterangan
                </th>

                <th>Metode</th>

                <th>Produk</th>

                <th>Detail Order</th>

                <th>Status</th>

                <th>Catatan User</th>

                <th
                  style={{
                    textAlign: "center",
                  }}
                >
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              <div></div>

              {currentData.length > 0 ? (
                currentData.map((item, index) => {
                  const produk =
                    item.jenis_produk ||
                    item.jenisProduk ||
                    item.produk ||
                    item.jenis ||
                    "Materai";

                  const keping = Number(
                    item.jumlah_keping ||
                      item.jumlahKeping ||
                      item.keping ||
                      item.qty ||
                      item.jumlah ||
                      0,
                  );

                  const nominal = Number(
                    item.nominal_perangko ||
                      item.nominalPerangko ||
                      item.harga_satuan ||
                      item.nominal ||
                      (String(produk).toLowerCase().includes("perangko")
                        ? 500
                        : 10000),
                  );

                  const total =
                    item.total_nilai ||
                    item.totalNilai ||
                    item.total ||
                    nominal * keping;

                  const metode =
                    item.metode_pembayaran ||
                    item.metode ||
                    item.metodePembayaran ||
                    "Tunai";

                  const rowNumber = indexOfFirstItem + index + 1;

                  const teksKet = item.keterangan || "-";

                  const isPanjang = teksKet.length > 30;

                  const teksPendek = isPanjang
                    ? teksKet.substring(0, 30) + "..."
                    : teksKet;

                  const teksNamaAgen = item.nama_agen || item.namaAgen || "-";

                  return (
                    <tr key={item.id}>
                      {/* NO */}
                      <td>{rowNumber}</td>

                      {/* TANGGAL */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.tanggal}
                      </td>

                      {/* NAMA AGEN */}
                      <td
                        style={{
                          minWidth: "250px",
                          whiteSpace: "nowrap",
                          wordBreak: "normal",
                          overflowWrap: "normal",
                          verticalAlign: "middle",
                        }}
                      >
                        {teksNamaAgen}
                      </td>

                      {/* KETERANGAN */}
                      <td
                        style={{
                          width: "110px",
                          maxWidth: "110px",
                          whiteSpace: "normal",
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        <span>{teksPendek}</span>

                        {isPanjang && (
                          <button
                            type="button"
                            onClick={() => setSelectedKeteranganView(teksKet)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#2563eb",
                              cursor: "pointer",
                              fontSize: "12px",
                              fontWeight: "600",
                              marginLeft: "4px",
                              padding: "0",
                              textDecoration: "underline",
                            }}
                          >
                            [Lihat]
                          </button>
                        )}
                      </td>

                      {/* METODE */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        {metode}
                      </td>

                      {/* PRODUK */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#2563eb",
                          }}
                        >
                          {produk}
                        </span>
                      </td>

                      {/* DETAIL ORDER */}
                      <td
                        style={{
                          whiteSpace: "nowrap",
                        }}
                      >
                        <span>
                          {keping} Keping (@Rp {nominal.toLocaleString("id-ID")}
                          ) = <b>Rp {Number(total).toLocaleString("id-ID")}</b>
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <select
                          value={item.status || "Order"}
                          onChange={(e) =>
                            handleStatusChange(item.id, e.target.value)
                          }
                          className={`rpb-status-select ${
                            (item.status || "Order") === "Kirim"
                              ? "select-dipenuhi"
                              : "select-order"
                          }`}
                          style={{
                            width: "95px",
                            padding: "6px 8px",
                            fontSize: "13px",
                            fontWeight: "600",
                          }}
                        >
                          <option value="Order">Order</option>

                          <option value="Kirim">Kirim</option>
                        </select>
                      </td>

                      {/* CATATAN USER */}
                      <td>
                        <input
                          type="text"
                          placeholder="Tulis catatan..."
                          value={item.catatan_user || item.catatanAdmin || ""}
                          onChange={(e) =>
                            handleLocalCatatanChange(item.id, e.target.value)
                          }
                          onBlur={(e) =>
                            handleBlurCatatan(item.id, e.target.value)
                          }
                          style={{
                            padding: "6px 10px",
                            borderRadius: "6px",
                            border: "1px solid #cbd5e1",
                            width: "130px",
                            fontSize: "13px",
                          }}
                        />
                      </td>

                      {/* AKSI */}
                      <td
                        style={{
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        <div
                          className="rpb-action-buttons"
                          style={{
                            display: "flex",
                            gap: "4px",
                            justifyContent: "center",
                          }}
                        >
                          <button
                            onClick={() => handleOpenView(item)}
                            className="rpb-btn-action"
                            style={{
                              backgroundColor: "#eff6ff",
                              color: "#1d4ed8",
                              border: "none",
                              padding: "5px 8px",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            👁️ View
                          </button>

                          <button
                            onClick={() => onEdit && onEdit(item)}
                            className="rpb-btn-action rpb-btn-edit"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            ✏️ Edit
                          </button>

                          <button
                            onClick={() => handleConfirmDelete(item.id)}
                            className="rpb-btn-action rpb-btn-delete"
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="10" className="rpb-empty-row">
                    {selectedDate || searchTerm
                      ? "Data tidak ditemukan."
                      : "Belum ada data riwayat agen pos."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ===================================================
            PAGINATION
           =================================================== */}
        {totalPages > 1 && (
          <div className="rpb-pagination-container">
            {/* Informasi pagination */}
            <span className="rpb-pagination-info">
              Halaman {currentPage} dari {totalPages} • Total{" "}
              {filteredData.length} data
            </span>

            {/* Tombol pagination */}
            <div className="rpb-pagination-buttons">
              <button
                type="button"
                className="rpb-pagination-button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                ◀ Sebelumnya
              </button>

              <button
                type="button"
                className="rpb-pagination-button"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Selanjutnya ▶
              </button>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          MODAL KETERANGAN
         ===================================================== */}
      {selectedKeteranganView && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1100,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "400px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <h3
              style={{
                marginBottom: "12px",
                color: "#1e293b",
              }}
            >
              Detail Lengkap
            </h3>

            <p
              style={{
                backgroundColor: "#f8fafc",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                wordBreak: "break-all",
                whiteSpace: "pre-wrap",
                fontSize: "14px",
                color: "#334155",
                lineHeight: "1.5",
              }}
            >
              {selectedKeteranganView}
            </p>

            <div
              style={{
                textAlign: "right",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedKeteranganView("")}
                style={{
                  padding: "8px 16px",
                  background: "#2b6fb7",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MODAL VIEW ADMIN
         ===================================================== */}
      {selectedItemView && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            style={{
              background: "white",
              padding: "24px",
              borderRadius: "12px",
              width: "450px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h3>Detail Agen Pos (Admin View)</h3>

            <p>
              <strong>Nama Agen:</strong>{" "}
              {selectedItemView.nama_agen || selectedItemView.namaAgen}
            </p>

            <p>
              <strong>Tanggal:</strong> {selectedItemView.tanggal}
            </p>

            <p>
              <strong>Metode:</strong>{" "}
              {selectedItemView.metode_pembayaran ||
                selectedItemView.metode ||
                "Tunai"}
            </p>

            <p>
              <strong>Keterangan:</strong> {selectedItemView.keterangan || "-"}
            </p>

            <div
              style={{
                marginTop: "12px",
              }}
            >
              <strong>Bukti Pembayaran:</strong>

              <div
                style={{
                  marginTop: "8px",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  padding: "8px",
                  textAlign: "center",
                  backgroundColor: "#f8fafc",
                }}
              >
                {buildFileUrl(selectedItemView) ? (
                  <div>
                    {(() => {
                      const rawUrl = buildFileUrl(selectedItemView);

                      const finalImgUrl = rawUrl.includes("ngrok-free.dev")
                        ? `${rawUrl}?ngrok-skip-browser-warning=true`
                        : rawUrl;

                      return (
                        <>
                          <img
                            src={finalImgUrl}
                            alt="Bukti Bayar"
                            style={{
                              maxWidth: "100%",
                              maxHeight: "200px",
                              objectFit: "contain",
                              borderRadius: "4px",
                              marginBottom: "8px",
                            }}
                          />

                          <div>
                            <a
                              href={finalImgUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: "12px",
                                color: "#2b6fb7",
                                fontWeight: "600",
                                textDecoration: "underline",
                              }}
                            >
                              🔍 Buka Gambar di Tab Baru
                            </a>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <span
                    style={{
                      color: "#777",
                      fontSize: "13px",
                    }}
                  >
                    Tidak ada file bukti pembayaran yang diunggah.
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                onClick={handleCloseView}
                style={{
                  padding: "8px 16px",
                  background: "#2b6fb7",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RiwayatAgenPos;
