import React, { useState, useEffect } from "react";
import "./Rekap.css";

function RekapN2({ dataRekap, onEdit, onHapus }) {
  const [filterTanggal, setFilterTanggal] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredData = dataRekap.filter((item) => {
    // Match tanggal (jika tanggal diisi, cocokkan persis secara otomatis tanpa tombol reset)
    const matchTanggal = !filterTanggal || item.tanggal === filterTanggal;
    return matchTanggal;
  });

  // Reset ke halaman 1 setiap kali filter tanggal berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTanggal]);

  // Hitung pemotongan data untuk pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  /*
   * =========================================================
   * HELPER ANGKA
   * =========================================================
   */
  const num = (val) => {
    if (val === null || val === undefined || val === "") {
      return 0;
    }
    if (typeof val === "number") {
      return val;
    }
    return Number(String(val).replace(/\./g, "").replace(/,/g, "")) || 0;
  };

  const getRemisePensiun = (item) =>
    num(item.details?.pengeluaran?.remisePensiunKprk?.nilai);

  const getRemiseVa = (item) =>
    num(item.details?.pengeluaran?.remiseVaKprk?.nilai);

  const getRemiseTunai = (item) =>
    num(item.details?.pengeluaran?.remiseTunaiKprk?.nilai);

  const getRemiseBansos = (item) =>
    num(item.details?.pengeluaran?.remiseBansosKprk?.nilai);

  const getSaldoOperasional = (item) =>
    num(item.details?.pengeluaran?.saldoDitahanHariIniOperasional?.nilai);

  const getSaldoPensiun = (item) =>
    num(item.details?.pengeluaran?.saldoDitahanHariIniPensiun?.nilai);

  const getSaldoBansos = (item) =>
    num(item.details?.pengeluaran?.saldoDitahanHariIniBansos?.nilai);

  /*
   * =========================================================
   * PRATINJAU & DOWNLOAD PDF
   * =========================================================
   */
  const previewPDF = (item) => {
    const previewWindow = window.open("", "_blank");

    const remisePensiun = getRemisePensiun(item);
    const remiseVa = getRemiseVa(item);
    const remiseTunai = getRemiseTunai(item);
    const remiseBansos = getRemiseBansos(item);

    const totalPengirimanRemise =
      remisePensiun + remiseVa + remiseTunai + remiseBansos;

    const saldoOperasional = getSaldoOperasional(item);
    const saldoPensiun = getSaldoPensiun(item);
    const saldoBansos = getSaldoBansos(item);

    const totalSaldoTahan = saldoOperasional + saldoPensiun + saldoBansos;

    // Helper untuk merender baris pendapatan (hanya tampil jika nama rekening / label diisi)
    const renderPendapatanRow = (key, defaultLabel) => {
      const rowData = item.details?.pendapatan?.[key];
      const label = rowData?.label ? rowData.label : defaultLabel;
      // Jika ini baris kosong custom dan labelnya kosong/tidak diisi, jangan tampilkan di PDF
      if (
        key.startsWith("kosongPendapatan") &&
        (!rowData?.label || rowData.label.trim() === "")
      ) {
        return "";
      }
      return `
        <tr>
          <td>${label}</td>
          <td class="text-center">${rowData?.sat || ""}</td>
          <td class="text-right">${num(rowData?.nilai).toLocaleString("id-ID")}</td>
        </tr>
      `;
    };

    // Helper untuk merender baris pengeluaran (hanya tampil jika nama rekening / label diisi)
    const renderPengeluaranRow = (key, defaultLabel) => {
      const rowData = item.details?.pengeluaran?.[key];
      const label = rowData?.label ? rowData.label : defaultLabel;
      // Jika ini baris kosong custom dan labelnya kosong/tidak diisi, jangan tampilkan di PDF
      if (
        key.startsWith("kosongPengeluaran") &&
        (!rowData?.label || rowData.label.trim() === "")
      ) {
        return "";
      }
      return `
        <tr>
          <td>${label}</td>
          <td class="text-center">${rowData?.sat || ""}</td>
          <td class="text-right">${num(rowData?.nilai).toLocaleString("id-ID")}</td>
        </tr>
      `;
    };

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Laporan Neraca N2 - ${item.kode}</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            font-size: 10px;
            color: #000;
            margin: 0;
            padding: 15px;
            background-color: #f1f5f9;
          }
          .preview-toolbar {
            position: sticky;
            top: 0;
            background: #00529c;
            color: white;
            padding: 12px 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .btn-group-action {
            display: flex;
            gap: 10px;
          }
          .btn-opt {
            border: none;
            padding: 8px 16px;
            font-size: 12px;
            font-weight: bold;
            border-radius: 6px;
            cursor: pointer;
          }
          .btn-save {
            background-color: #10b981;
            color: white;
          }
          .btn-print {
            background-color: #f59e0b;
            color: white;
          }
          .paper-page {
            background: white;
            padding: 24px;
            border-radius: 6px;
            max-width: 820px;
            margin: 0 auto;
          }
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #000;
            padding-bottom: 6px;
            margin-bottom: 10px;
          }
          .header-title {
            text-align: center;
            font-size: 15px;
            font-weight: bold;
            flex-grow: 1;
          }
          .grid-container {
            display: flex;
            gap: 12px;
          }
          .col-half {
            width: 50%;
          }
          .table-neraca {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
            table-layout: fixed;
          }
          .table-neraca th,
          .table-neraca td {
            border: 1px solid #000;
            padding: 4px 5px;
            font-size: 9px;
          }
          .table-neraca th:nth-child(1),
          .table-neraca td:nth-child(1) {
            width: 55%;
          }
          .table-neraca th:nth-child(2),
          .table-neraca td:nth-child(2) {
            width: 15%;
            text-align: center;
          }
          .table-neraca th:nth-child(3),
          .table-neraca td:nth-child(3) {
            width: 30%;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .bg-total { background-color: #e0f2fe; }
          .bg-subhead { background-color: #fef08a; }
          .bg-blue { background-color: #bfdbfe; }
          .bg-green { background-color: #dcfce7; }
          .bg-pink { background-color: #ffe4e6; }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
          }
          .sig-box {
            width: 30%;
            text-align: center;
          }
          .sig-space { height: 55px; }
          .sig-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
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
          <strong>Laporan Neraca N2 - ${item.kode}</strong>
          <div class="btn-group-action">
            <button class="btn-opt btn-save" onclick="downloadPDFDirect()">Download PDF</button>
            <button class="btn-opt btn-print" onclick="window.print()">Print</button>
          </div>
        </div>

        <div class="paper-page" id="pdf-content">
          <div class="header-top">
            <div><strong>POSPED</strong></div>
            <div class="header-title">NERACA N2</div>
            <div><strong>${item.tanggal || ""}</strong></div>
          </div>

          <div style="margin-bottom: 10px;">
            <strong>Nama Petugas:</strong> ${item.nama || item.nama_petugas || "Petugas Loket"}<br />
            <strong>KPC / Kantor:</strong> ${item.kantor || item.kpc_kantor || ""}
          </div>

          <div class="grid-container">
            <!-- PENDAPATAN -->
            <div class="col-half">
              <table class="table-neraca">
                <thead>
                  <tr>
                    <th>NAMA REKENING</th>
                    <th>SAT</th>
                    <th>NOMINAL (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="bg-subhead"><td colspan="3" class="text-center">PENDAPATAN</td></tr>
                  ${renderPendapatanRow("mileBm", "PENDAPATAN MILE BM")}
                  ${renderPendapatanRow("mileOl1", "PENDAPATAN MILE OL")}
                  ${renderPendapatanRow("mileOl2", "PENDAPATAN MILE OL")}
                  ${renderPendapatanRow("mileOm1", "PENDAPATAN MILE OM")}
                  ${renderPendapatanRow("mileOm2", "PENDAPATAN MILE OM")}
                  ${renderPendapatanRow("weselpos", "WESELPOS ALL")}
                  ${renderPendapatanRow("remitance", "RAK-AW REMITANCE ALL")}
                  ${renderPendapatanRow("pospayBm", "RAK-AW POSPAY BM")}
                  ${renderPendapatanRow("pospayOl1", "RAK-AW POSPAY OL")}
                  ${renderPendapatanRow("pospayOl2", "RAK-AW POSPAY OL")}
                  ${renderPendapatanRow("prangko", "PRANGKO")}
                  ${renderPendapatanRow("pembelianMeterai", "PEMBELIAN METERAI")}
                  ${renderPendapatanRow("kosongPendapatan1", "")}
                  ${renderPendapatanRow("kosongPendapatan2", "")}
                  ${renderPendapatanRow("kosongPendapatan3", "")}
                  <tr class="bg-total">
                    <td><strong>JUMLAH PENERIMAAN</strong></td>
                    <td></td>
                    <td class="text-right"><strong>${num(item.totalPendapatanTransaksi).toLocaleString("id-ID")}</strong></td>
                  </tr>
                  <tr class="bg-subhead"><td colspan="3" class="text-center">PENERIMAAN REMISE DARI KPRK</td></tr>
                  <tr>
                    <td>1. TOTAL PENERIMAAN REMISE OPERASIONAL</td>
                    <td class="text-center">${item.details?.pendapatan?.remiseOperasional?.sat || ""}</td>
                    <td class="text-right">${num(item.details?.pendapatan?.remiseOperasional?.nilai).toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>2. TOTAL PENERIMAAN REMISE PENSIUN</td>
                    <td class="text-center">${item.details?.pendapatan?.remisePensiun?.sat || ""}</td>
                    <td class="text-right">${num(item.details?.pendapatan?.remisePensiun?.nilai).toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>3. TOTAL PENERIMAAN REMISE BANSOS</td>
                    <td class="text-center">${item.details?.pendapatan?.remiseBansos?.sat || ""}</td>
                    <td class="text-right">${num(item.details?.pendapatan?.remiseBansos?.nilai).toLocaleString("id-ID")}</td>
                  </tr>
                  <tr class="bg-total">
                    <td><strong>JUMLAH PENERIMAAN PANJAR DARI KASIR</strong></td>
                    <td></td>
                    <td class="text-right"><strong>${num(item.totalPanjarPenerimaan).toLocaleString("id-ID")}</strong></td>
                  </tr>
                  <tr>
                    <td>1. SALDO DITAHAN KEMARIN OPERASIONAL</td>
                    <td class="text-center">${item.details?.pendapatan?.saldoDitahanKemarinOperasional?.sat || ""}</td>
                    <td class="text-right">${num(item.details?.pendapatan?.saldoDitahanKemarinOperasional?.nilai).toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>2. SALDO DITAHAN KEMARIN PENSIUN</td>
                    <td class="text-center">${item.details?.pendapatan?.saldoDitahanKemarinPensiun?.sat || ""}</td>
                    <td class="text-right">${num(item.details?.pendapatan?.saldoDitahanKemarinPensiun?.nilai).toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>3. SALDO DITAHAN KEMARIN BANSOS</td>
                    <td class="text-center">${item.details?.pendapatan?.saldoDitahanKemarinBansos?.sat || ""}</td>
                    <td class="text-right">${num(item.details?.pendapatan?.saldoDitahanKemarinBansos?.nilai).toLocaleString("id-ID")}</td>
                  </tr>
                  <tr class="bg-total">
                    <td><strong>SALDO DITAHAN ALL</strong></td>
                    <td></td>
                    <td class="text-right"><strong>${num(item.totalSaldoDitahanAll).toLocaleString("id-ID")}</strong></td>
                  </tr>
                  <tr class="bg-blue">
                    <td><strong>JUMLAH PENERIMAAN KAS</strong></td>
                    <td></td>
                    <td class="text-right"><strong>${num(item.penerimaan).toLocaleString("id-ID")}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- PENGELUARAN -->
            <div class="col-half">
              <table class="table-neraca">
                <thead>
                  <tr>
                    <th>NAMA REKENING</th>
                    <th>SAT</th>
                    <th>NOMINAL (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="bg-subhead"><td colspan="3" class="text-center">PENGELUARAN</td></tr>
                  ${renderPengeluaranRow("mileInvoice1", "MILE INVOICE")}
                  ${renderPengeluaranRow("mileInvoice2", "MILE INVOICE")}
                  ${renderPengeluaranRow("mileInvoice3", "MILE INVOICE")}
                  ${renderPengeluaranRow("mileLpu1", "MILE LPU")}
                  ${renderPengeluaranRow("mileLpu2", "MILE LPU")}
                  ${renderPengeluaranRow("mileLpu3", "MILE LPU")}
                  ${renderPengeluaranRow("penarikanWesel", "PENARIKAN WESEL")}
                  ${renderPengeluaranRow("penarikanPospay", "PENARIKAN POSPAY")}
                  ${renderPengeluaranRow("penarikanBtn", "PENARIKAN BTN")}
                  ${renderPengeluaranRow("qriss", "QRISS")}
                  ${renderPengeluaranRow("penarikanPensiun", "PENARIKAN PENSIUN")}
                  ${renderPengeluaranRow("penarikanBansos", "PENARIKAN BANSOS")}
                  ${renderPengeluaranRow("kosongPengeluaran1", "")}
                  ${renderPengeluaranRow("kosongPengeluaran2", "")}
                  ${renderPengeluaranRow("kosongPengeluaran3", "")}
                  <tr class="bg-total">
                    <td><strong>JUMLAH PENGELUARAN TRANSAKSI</strong></td>
                    <td></td>
                    <td class="text-right"><strong>${num(item.totalPengeluaranTransaksi).toLocaleString("id-ID")}</strong></td>
                  </tr>
                  <tr class="bg-subhead"><td colspan="3" class="text-center">PENGIRIMAN REMISE KE KPRK</td></tr>
                  <tr>
                    <td>1. PENGIRIMAN REMIS PENSIUN</td>
                    <td class="text-center">${item.details?.pengeluaran?.remisePensiunKprk?.sat || ""}</td>
                    <td class="text-right">${remisePensiun.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>2. TOTAL PENGIRIMAN REMISE VA</td>
                    <td class="text-center">${item.details?.pengeluaran?.remiseVaKprk?.sat || ""}</td>
                    <td class="text-right">${remiseVa.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>3. TOTAL PENGIRIMAN REMISE TUNAI</td>
                    <td class="text-center">${item.details?.pengeluaran?.remiseTunaiKprk?.sat || ""}</td>
                    <td class="text-right">${remiseTunai.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>4. TOTAL PENGIRIMAN REMISE BANSOS</td>
                    <td class="text-center">${item.details?.pengeluaran?.remiseBansosKprk?.sat || ""}</td>
                    <td class="text-right">${remiseBansos.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr class="bg-total">
                    <td><strong>JUMLAH PENGIRIMAN REMISE</strong></td>
                    <td></td>
                    <td class="text-right"><strong>${totalPengirimanRemise.toLocaleString("id-ID")}</strong></td>
                  </tr>
                  <tr>
                    <td>1. SALDO DITAHAN HARI INI OPERASIONAL</td>
                    <td class="text-center">${item.details?.pengeluaran?.saldoDitahanHariIniOperasional?.sat || ""}</td>
                    <td class="text-right">${saldoOperasional.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>2. SALDO DITAHAN HARI INI PENSIUN</td>
                    <td class="text-center">${item.details?.pengeluaran?.saldoDitahanHariIniPensiun?.sat || ""}</td>
                    <td class="text-right">${saldoPensiun.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td>3. SALDO DITAHAN HARI INI BANSOS</td>
                    <td class="text-center">${item.details?.pengeluaran?.saldoDitahanHariIniBansos?.sat || ""}</td>
                    <td class="text-right">${saldoBansos.toLocaleString("id-ID")}</td>
                  </tr>
                  <tr class="bg-green">
                    <td><strong>SALDO HARI INI ALL</strong></td>
                    <td></td>
                    <td class="text-right"><strong>${totalSaldoTahan.toLocaleString("id-ID")}</strong></td>
                  </tr>
                  <tr class="bg-pink">
                    <td><strong>JUMLAH PENGELUARAN KAS</strong></td>
                    <td></td>
                    <td class="text-right"><strong>${num(item.pengeluaran).toLocaleString("id-ID")}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="signatures">
            <div class="sig-box">
              <div><strong>SPV Operasi Pelayanan</strong></div>
              <div class="sig-space"></div>
              <div><strong>Administrator</strong></div>
              <div class="sig-line"></div>
              <div>NIPPOS: ____________________</div>
            </div>
            <div class="sig-box">
              <div><strong>Branch Manager</strong></div>
              <div class="sig-space"></div>
              <div><strong>Administrator</strong></div>
              <div class="sig-line"></div>
              <div>NIPPOS: ____________________</div>
            </div>
            <div class="sig-box">
              <div><strong>Petugas Loket</strong></div>
              <div class="sig-space"></div>
              <div><strong>${item.nama || item.nama_petugas || "Administrator"}</strong></div>
              <div class="sig-line"></div>
              <div>NIPPOS: ____________________</div>
            </div>
          </div>
        </div>

        <script>
          function downloadPDFDirect() {
            const element = document.getElementById("pdf-content");
            const opt = {
              margin: 5,
              filename: "Neraca_N2_${item.kode || "laporan"}.pdf",
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
    <>
      <h1 className="page-title">Rekap N2</h1>
      <p className="page-subtitle">
        POSPED · Riwayat, Edit & Download Laporan Neraca N2
      </p>

      {/* FILTER BAR (Hanya Date Picker saja tanpa Dropdown Kantor & Tanpa Tombol Reset) */}
      <div
        className="card filter-bar"
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <input
          type="date"
          className="search-input"
          style={{ maxWidth: "220px" }}
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
        />
      </div>

      {/* LIST KARTU REKAP */}
      <div className="rekap-card-list">
        {currentItems.length > 0 ? (
          currentItems.map((item, index) => {
            const absoluteIndex = indexOfFirstItem + index;
            const remisePensiun = getRemisePensiun(item);
            const remiseVa = getRemiseVa(item);
            const remiseTunai = getRemiseTunai(item);
            const remiseBansos = getRemiseBansos(item);

            const totalPengirimanRemise =
              remisePensiun + remiseVa + remiseTunai + remiseBansos;

            const saldoOperasional = getSaldoOperasional(item);
            const saldoPensiun = getSaldoPensiun(item);
            const saldoBansos = getSaldoBansos(item);

            const totalSaldoTahan =
              saldoOperasional + saldoPensiun + saldoBansos;

            const namaPetugasTampil =
              item.nama || item.nama_petugas || "Petugas Loket";
            const kantorTampil = item.kantor || item.kpc_kantor || "-";

            return (
              <div className="rekap-item-card" key={item.id}>
                <div className="rekap-card-header">
                  <div className="rekap-user-info">
                    <span className="rekap-number">#{absoluteIndex + 1}</span>
                    <div>
                      <h3 className="rekap-nama">{namaPetugasTampil}</h3>
                      <p className="rekap-subinfo">
                        {kantorTampil} •{" "}
                        <span className="rekap-date">{item.tanggal}</span>
                      </p>
                    </div>
                  </div>

                  <div className="action-buttons-wrapper">
                    <button
                      className="btn-action-compact btn-edit-compact"
                      onClick={() => onEdit(item)}
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      className="btn-action-compact btn-delete-compact"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (
                          window.confirm(
                            "Apakah Anda yakin ingin menghapus laporan ini?",
                          )
                        ) {
                          onHapus(item.id);
                        }
                      }}
                    >
                      🗑️ Hapus
                    </button>

                    <button
                      className="btn-action-compact btn-pdf-compact"
                      onClick={() => previewPDF(item)}
                    >
                      📄 PDF
                    </button>
                  </div>
                </div>

                <div className="rekap-card-body">
                  {/* BLOK PENGIRIMAN REMISE */}
                  <div className="rekap-detail-block block-remise">
                    <div className="block-title">PENGIRIMAN REMISE</div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "8px",
                      }}
                    >
                      <div className="detail-item">
                        <span>REMISE PENSIUN:</span>
                        <strong>
                          Rp {remisePensiun.toLocaleString("id-ID")}
                        </strong>
                      </div>
                      <div className="detail-item">
                        <span>REMISE VA:</span>
                        <strong>Rp {remiseVa.toLocaleString("id-ID")}</strong>
                      </div>
                      <div className="detail-item">
                        <span>REMISE TUNAI:</span>
                        <strong>
                          Rp {remiseTunai.toLocaleString("id-ID")}
                        </strong>
                      </div>
                      <div className="detail-item">
                        <span>REMISE BANSOS:</span>
                        <strong>
                          Rp {remiseBansos.toLocaleString("id-ID")}
                        </strong>
                      </div>
                    </div>

                    <div className="total-item-bottom">
                      <span>JUMLAH:</span>
                      <strong className="text-blue">
                        Rp {totalPengirimanRemise.toLocaleString("id-ID")}
                      </strong>
                    </div>
                  </div>

                  {/* BLOK SALDO TAHAN */}
                  <div className="rekap-detail-block block-saldo">
                    <div className="block-title">SALDO TAHAN</div>
                    <div className="grid-details-3col">
                      <div className="detail-item">
                        <span>OPERASIONAL:</span>
                        <strong>
                          Rp {saldoOperasional.toLocaleString("id-ID")}
                        </strong>
                      </div>
                      <div className="detail-item">
                        <span>PENSIUN:</span>
                        <strong>
                          Rp {saldoPensiun.toLocaleString("id-ID")}
                        </strong>
                      </div>
                      <div className="detail-item">
                        <span>BANSOS:</span>
                        <strong>
                          Rp {saldoBansos.toLocaleString("id-ID")}
                        </strong>
                      </div>
                    </div>

                    <div className="total-item-bottom">
                      <span>JUMLAH:</span>
                      <strong className="text-teal">
                        Rp {totalSaldoTahan.toLocaleString("id-ID")}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="card empty-card-msg">
            Belum ada data Neraca N2 yang tersimpan sesuai tanggal yang dipilih.
          </div>
        )}
      </div>

      {/* PENGATURAN NAVIGASI HALAMAN (PAGINATION) */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "16px",
            marginTop: "20px",
            marginBottom: "30px",
          }}
        >
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{
              padding: "8px 16px",
              backgroundColor: currentPage === 1 ? "#cbd5e1" : "#00529c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            ← Sebelumnya
          </button>

          <span
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#334155",
            }}
          >
            Halaman {currentPage} dari {totalPages}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            style={{
              padding: "8px 16px",
              backgroundColor:
                currentPage === totalPages ? "#cbd5e1" : "#00529c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
              fontWeight: "bold",
              fontSize: "13px",
            }}
          >
            Berikutnya →
          </button>
        </div>
      )}
    </>
  );
}

export default RekapN2;
