import React, { useState, useEffect } from "react";
import API from "./axios";
import "./Samsat.css";

function Samsat({ userActive }) {
  const [dataRekapSamsat, setDataRekapSamsat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterKantor, setFilterKantor] = useState("Semua Kantor");
  const [filterTanggal, setFilterTanggal] = useState("");

  // State daftar kantor dari database & paginasi
  const [daftarKantor, setDaftarKantor] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ==============================
  // AMBIL DATA DARI BACKEND
  // ==============================
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/samsat/rekap-pkb");
      setDataRekapSamsat(res.data.data ?? res.data);
    } catch (err) {
      console.error(
        err.response?.data?.message || "Gagal mengambil data rekap samsat",
      );
    } finally {
      setLoading(false);
    }
  };

  // Ambil daftar kantor dari database
  const fetchDaftarKantor = async () => {
    try {
      const res = await API.get("/kantor-cabang");
      const rawData = res.data.data ?? res.data;
      setDaftarKantor(Array.isArray(rawData) ? rawData : []);
    } catch (error) {
      console.error("Gagal mengambil daftar kantor:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDaftarKantor();
  }, []);

  // Reset ke halaman 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterKantor, filterTanggal]);

  const filteredData = dataRekapSamsat.filter((item) => {
    const matchKantor =
      filterKantor === "Semua Kantor" ||
      item.kantor_pos === filterKantor ||
      item.kantor === filterKantor;
    const matchTanggal = !filterTanggal || item.tanggal === filterTanggal;
    return matchKantor && matchTanggal;
  });

  const sortedAndGroupedData = [...filteredData].sort((a, b) => b.id - a.id);

  // Logika Paginasi
  const totalPages = Math.ceil(sortedAndGroupedData.length / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedAndGroupedData.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // ==============================
  // PRATINJAU & DOWNLOAD PDF
  // ==============================
  const handleCetakPDF = () => {
    const previewWindow = window.open("", "_blank");

    const rowsHTML = sortedAndGroupedData
      .map(
        (item, index) => `
        <tr>
          <td style="text-align: center;">${index + 1}</td>
          <td>${item.tanggal || ""}</td>
          <td><strong>${item.kantor_pos || item.kantor || ""}</strong></td>
          <td>${item.nopol || ""}</td>
          <td>${item.nama_pemilik || ""}</td>
          <td>${item.no_bayar || ""}</td>
          <td style="text-align: center;">${item.status || ""}</td>
        </tr>
      `,
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap Order Samsat (PKB)</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #000;
            margin: 0;
            padding: 20px;
            background-color: #f1f5f9;
          }
          .preview-toolbar {
            position: sticky;
            top: 0;
            background: #00529c;
            color: white;
            padding: 14px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .btn-group-action {
            display: flex;
            gap: 10px;
          }
          .btn-opt {
            border: none;
            padding: 8px 18px;
            font-size: 13px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-save { background-color: #10b981; color: white; }
          .btn-print { background-color: #f59e0b; color: white; }
          .paper-page {
            background: white;
            padding: 30px;
            border-radius: 6px;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
          }
          h2 { text-align: center; margin-bottom: 25px; color: #1e293b; font-size: 18px; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #333;
            padding: 8px 10px;
            font-size: 12px;
          }
          th {
            background-color: #e2e8f0;
            text-align: left;
          }
          @media print {
            body { background: white; padding: 0; }
            .preview-toolbar { display: none !important; }
            .paper-page { box-shadow: none; padding: 0; max-width: none; }
          }
        </style>
      </head>
      <body>
        <div class="preview-toolbar">
          <strong>Pratinjau Cetak - Rekap Order Samsat (PKB)</strong>
          <div class="btn-group-action">
            <button class="btn-opt btn-save" onclick="downloadPDFDirect()">Download PDF</button>
            <button class="btn-opt btn-print" onclick="window.print()">Print</button>
          </div>
        </div>

        <div class="paper-page" id="pdf-content">
          <h2>Rekap Order Samsat (PKB)</h2>
          <table>
            <thead>
              <tr>
                <th style="width: 6%; text-align: center;">NO</th>
                <th style="width: 15%;">TANGGAL</th>
                <th style="width: 24%;">KANTOR POS</th>
                <th style="width: 14%;">NOPOL</th>
                <th style="width: 21%;">NAMA PEMILIK</th>
                <th style="width: 10%;">NO BAYAR</th>
                <th style="width: 10%; text-align: center;">STATUS</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML || '<tr><td colspan="7" style="text-align: center;">Tidak ada data</td></tr>'}
            </tbody>
          </table>
        </div>

        <script>
          function downloadPDFDirect() {
            const element = document.getElementById("pdf-content");
            const opt = {
              margin: 10,
              filename: "Rekap_Order_Samsat.pdf",
              image: { type: "jpeg", quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true },
              jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
            };
            html2pdf().set(opt).from(element).save();
          }
        </script>
      </body>
      </html>
    `;

    previewWindow.document.write(htmlContent);
    previewWindow.document.close();
  };

  return (
    <div className="neraca-container">
      {/* JUDUL & TOMBOL CETAK PDF DI ATAS */}
      <div
        className="page-header-box"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2 className="page-main-title">Rekap Order Samsat (PKB)</h2>
        </div>
        <button
          onClick={handleCetakPDF}
          style={{
            backgroundColor: "#0d9488",
            color: "white",
            border: "none",
            padding: "10px 18px",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px",
          }}
        >
          📥 Cetak / Download PDF
        </button>
      </div>

      {/* KARTU FILTER */}
      <div className="card filter-card" style={{ marginTop: "16px" }}>
        <div className="filter-grid">
          <div>
            <label>KANTOR POS</label>
            <select
              value={filterKantor}
              onChange={(e) => setFilterKantor(e.target.value)}
            >
              <option value="Semua Kantor">Semua Kantor</option>
              {daftarKantor.map((k) => (
                <option key={k.id} value={k.nama_kantor}>
                  {k.nama_kantor}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>FILTER TANGGAL</label>
            <input
              type="date"
              value={filterTanggal}
              onChange={(e) => setFilterTanggal(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABEL REKAP */}
      <div className="card table-card" style={{ marginTop: "20px" }}>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>NO</th>
                <th>TANGGAL</th>
                <th>KANTOR POS</th>
                <th>NOPOL</th>
                <th>NAMA PEMILIK</th>
                <th>NO BAYAR</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="table-empty">
                    Memuat data...
                  </td>
                </tr>
              ) : currentItems.length > 0 ? (
                currentItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{indexOfFirstItem + index + 1}</td>
                    <td>{item.tanggal}</td>
                    <td style={{ fontWeight: "600", color: "#00529c" }}>
                      {item.kantor_pos || item.kantor}
                    </td>
                    <td>{item.nopol}</td>
                    <td>{item.nama_pemilik}</td>
                    <td>{item.no_bayar}</td>
                    <td>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "bold",
                          backgroundColor:
                            item.status === "Kirim" ? "#dcfce7" : "#fef9c3",
                          color:
                            item.status === "Kirim" ? "#15803d" : "#854d0e",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="table-empty">
                    Belum ada data rekap order Samsat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "16px",
              padding: "12px 16px",
              borderTop: "1px solid #e2e8f0",
              fontSize: "14px",
              color: "#475569",
            }}
          >
            <div>
              Menampilkan{" "}
              {sortedAndGroupedData.length > 0 ? indexOfFirstItem + 1 : 0} -{" "}
              {Math.min(indexOfLastItem, sortedAndGroupedData.length)} dari{" "}
              {sortedAndGroupedData.length} data
            </div>
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor: currentPage === 1 ? "#f1f5f9" : "white",
                  cursor: currentPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                Sebelumnya
              </button>
              <span style={{ padding: "6px 10px", fontWeight: "600" }}>
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  backgroundColor:
                    currentPage === totalPages ? "#f1f5f9" : "white",
                  cursor:
                    currentPage === totalPages ? "not-allowed" : "pointer",
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

export default Samsat;
