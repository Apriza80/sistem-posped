import React, { useState, useEffect } from "react";
import API from "./axios";
import "./NeracaBaru.css";

function NeracaN2({ onSimpanData, editData, userActive }) {
  const [nama, setNama] = useState("");
  const [kpc, setKpc] = useState("");
  const [tanggal, setTanggal] = useState("");

  const initialPendapatan = {
    mileBm: { label: "PENDAPATAN MILE BM", sat: "", nilai: "" },
    mileOl1: { label: "PENDAPATAN MILE OL", sat: "", nilai: "" },
    mileOl2: { label: "PENDAPATAN MILE OL", sat: "", nilai: "" },
    mileOm1: { label: "PENDAPATAN MILE OM", sat: "", nilai: "" },
    mileOm2: { label: "PENDAPATAN MILE OM", sat: "", nilai: "" },
    weselpos: { label: "PENDAPATAN WESELPOS ALL", sat: "", nilai: "" },
    remitance: { label: "RAK-AW REMITANCE ALL", sat: "", nilai: "" },
    pospayBm: { label: "RAK-AW POSPAY BM", sat: "", nilai: "" },
    pospayOl1: { label: "RAK-AW POSPAY OL", sat: "", nilai: "" },
    pospayOl2: { label: "RAK-AW POSPAY OL", sat: "", nilai: "" },
    prangko: { label: "PRANGKO", sat: "", nilai: "" },
    pembelianMeterai: { label: "PEMBELIAN METERAI", sat: "", nilai: "" },
    kosongPendapatan1: { label: "", sat: "", nilai: "" },
    kosongPendapatan2: { label: "", sat: "", nilai: "" },
    kosongPendapatan3: { label: "", sat: "", nilai: "" },
    remiseOperasional: {
      label: "1. TOTAL PENERIMAAN REMISE OPERASIONAL",
      sat: "",
      nilai: "",
    },
    remisePensiun: {
      label: "2. TOTAL PENERIMAAN REMISE PENSIUN",
      sat: "",
      nilai: "",
    },
    remiseBansos: {
      label: "3. TOTAL PENERIMAAN REMISE BANSOS",
      sat: "",
      nilai: "",
    },
    saldoDitahanKemarinOperasional: {
      label: "1. SALDO DITAHAN KEMARIN OPERASIONAL",
      sat: "",
      nilai: "",
    },
    saldoDitahanKemarinPensiun: {
      label: "2. SALDO DITAHAN KEMARIN PENSIUN",
      sat: "",
      nilai: "",
    },
    saldoDitahanKemarinBansos: {
      label: "3. SALDO DITAHAN KEMARIN BANSOS",
      sat: "",
      nilai: "",
    },
  };

  const initialPengeluaran = {
    mileInvoice1: { label: "MILE INVOICE", sat: "", nilai: "" },
    mileInvoice2: { label: "MILE INVOICE", sat: "", nilai: "" },
    mileInvoice3: { label: "MILE INVOICE", sat: "", nilai: "" },
    mileLpu1: { label: "MILE LPU", sat: "", nilai: "" },
    mileLpu2: { label: "MILE LPU", sat: "", nilai: "" },
    mileLpu3: { label: "MILE LPU", sat: "", nilai: "" },
    penarikanWesel: { label: "PENARIKAN WESEL", sat: "", nilai: "" },
    penarikanPospay: { label: "PENARIKAN POSPAY", sat: "", nilai: "" },
    penarikanBtn: { label: "PENARIKAN BTN", sat: "", nilai: "" },
    qriss: { label: "QRISS", sat: "", nilai: "" },
    penarikanPensiun: { label: "PENARIKAN PENSIUN", sat: "", nilai: "" },
    penarikanBansos: { label: "PENARIKAN BANSOS", sat: "", nilai: "" },
    kosongPengeluaran1: { label: "", sat: "", nilai: "" },
    kosongPengeluaran2: { label: "", sat: "", nilai: "" },
    kosongPengeluaran3: { label: "", sat: "", nilai: "" },
    remisePensiunKprk: {
      label: "1. PENGIRIMAN REMIS PENSIUN",
      sat: "",
      nilai: "",
    },
    remiseVaKprk: {
      label: "2. TOTAL PENGIRIMAN REMISE VA",
      sat: "",
      nilai: "",
    },
    remiseTunaiKprk: {
      label: "3. TOTAL PENGIRIMAN REMISE TUNAI",
      sat: "",
      nilai: "",
    },
    remiseBansosKprk: {
      label: "4. TOTAL PENGIRIMAN REMISE BANSOS",
      sat: "",
      nilai: "",
    },
    saldoDitahanHariIniOperasional: {
      label: "1. SALDO DITAHAN HARI INI OPERASIONAL",
      sat: "",
      nilai: "",
    },
    saldoDitahanHariIniPensiun: {
      label: "2. SALDO DITAHAN HARI INI PENSIUN",
      sat: "",
      nilai: "",
    },
    saldoDitahanHariIniBansos: {
      label: "3. SALDO DITAHAN HARI INI BANSOS",
      sat: "",
      nilai: "",
    },
  };

  const [pendapatan, setPendapatan] = useState(initialPendapatan);
  const [pengeluaran, setPengeluaran] = useState(initialPengeluaran);

  useEffect(() => {
    if (editData) {
      setNama(editData.nama || "");
      setKpc(editData.kantor || "");
      setTanggal(editData.tanggal || "");

      if (editData.details) {
        const formattedPendapatan = {};
        Object.keys(editData.details.pendapatan || {}).forEach((k) => {
          const item = editData.details.pendapatan[k];
          formattedPendapatan[k] = {
            label:
              item?.label !== undefined
                ? String(item.label)
                : initialPendapatan[k]?.label || "",
            sat: item?.sat !== undefined ? String(item.sat) : "",
            nilai: item?.nilai !== undefined ? String(item.nilai) : "",
          };
        });

        const formattedPengeluaran = {};
        Object.keys(editData.details.pengeluaran || {}).forEach((k) => {
          const item = editData.details.pengeluaran[k];
          formattedPengeluaran[k] = {
            label:
              item?.label !== undefined
                ? String(item.label)
                : initialPengeluaran[k]?.label || "",
            sat: item?.sat !== undefined ? String(item.sat) : "",
            nilai: item?.nilai !== undefined ? String(item.nilai) : "",
          };
        });

        setPendapatan({ ...initialPendapatan, ...formattedPendapatan });
        setPengeluaran({ ...initialPengeluaran, ...formattedPengeluaran });
      }
    } else {
      setNama(userActive?.nama || userActive?.name || "");
      setKpc(userActive?.kantor || "Kantor Pos Sidoarjo 61200");
      setTanggal(new Date().toISOString().split("T")[0]);
      setPendapatan(initialPendapatan);
      setPengeluaran(initialPengeluaran);
    }
  }, [editData, userActive]);

  const handleIsiDataDummy = () => {
    setNama(userActive?.nama || userActive?.name || "Cece Zia");
    setKpc(userActive?.kantor || "Kantor Pos Sidoarjo 61200");
    setTanggal(new Date().toISOString().split("T")[0]);

    setPendapatan({
      mileBm: { label: "PENDAPATAN MILE BM", sat: "Lbr", nilai: "1.500.000" },
      mileOl1: { label: "PENDAPATAN MILE OL", sat: "Lbr", nilai: "2.500.000" },
      mileOl2: { label: "PENDAPATAN MILE OL", sat: "Lbr", nilai: "1.000.000" },
      mileOm1: { label: "PENDAPATAN MILE OM", sat: "Pcs", nilai: "3.000.000" },
      mileOm2: { label: "PENDAPATAN MILE OM", sat: "Pcs", nilai: "500.000" },
      weselpos: {
        label: "PENDAPATAN WESELPOS ALL",
        sat: "Trx",
        nilai: "4.000.000",
      },
      remitance: {
        label: "RAK-AW REMITANCE ALL",
        sat: "Trx",
        nilai: "2.000.000",
      },
      pospayBm: { label: "RAK-AW POSPAY BM", sat: "Trx", nilai: "3.500.000" },
      pospayOl1: { label: "RAK-AW POSPAY OL", sat: "Trx", nilai: "1.200.000" },
      pospayOl2: { label: "RAK-AW POSPAY OL", sat: "Trx", nilai: "800.000" },
      prangko: { label: "PRANGKO", sat: "Lbr", nilai: "500.000" },
      pembelianMeterai: {
        label: "PEMBELIAN METERAI",
        sat: "Keping",
        nilai: "1.000.000",
      },
      kosongPendapatan1: {
        label: "PENDAPATAN LAIN 1",
        sat: "Pcs",
        nilai: "250.000",
      },
      kosongPendapatan2: {
        label: "PENDAPATAN LAIN 2",
        sat: "Pcs",
        nilai: "150.000",
      },
      kosongPendapatan3: { label: "", sat: "", nilai: "" },
      remiseOperasional: {
        label: "1. TOTAL PENERIMAAN REMISE OPERASIONAL",
        sat: "Trx",
        nilai: "5.000.000",
      },
      remisePensiun: {
        label: "2. TOTAL PENERIMAAN REMISE PENSIUN",
        sat: "Trx",
        nilai: "10.000.000",
      },
      remiseBansos: {
        label: "3. TOTAL PENERIMAAN REMISE BANSOS",
        sat: "Trx",
        nilai: "15.000.000",
      },
      saldoDitahanKemarinOperasional: {
        label: "1. SALDO DITAHAN KEMARIN OPERASIONAL",
        sat: "Trx",
        nilai: "2.000.000",
      },
      saldoDitahanKemarinPensiun: {
        label: "2. SALDO DITAHAN KEMARIN PENSIUN",
        sat: "Trx",
        nilai: "3.000.000",
      },
      saldoDitahanKemarinBansos: {
        label: "3. SALDO DITAHAN KEMARIN BANSOS",
        sat: "Trx",
        nilai: "1.000.000",
      },
    });

    setPengeluaran({
      mileInvoice1: { label: "MILE INVOICE", sat: "Lbr", nilai: "1.000.000" },
      mileInvoice2: { label: "MILE INVOICE", sat: "Lbr", nilai: "500.000" },
      mileInvoice3: { label: "MILE INVOICE", sat: "Lbr", nilai: "300.000" },
      mileLpu1: { label: "MILE LPU", sat: "Pcs", nilai: "1.200.000" },
      mileLpu2: { label: "MILE LPU", sat: "Pcs", nilai: "800.000" },
      mileLpu3: { label: "MILE LPU", sat: "Pcs", nilai: "400.000" },
      penarikanWesel: {
        label: "PENARIKAN WESEL",
        sat: "Trx",
        nilai: "2.500.000",
      },
      penarikanPospay: {
        label: "PENARIKAN POSPAY",
        sat: "Trx",
        nilai: "1.500.000",
      },
      penarikanBtn: { label: "PENARIKAN BTN", sat: "Trx", nilai: "2.000.000" },
      qriss: { label: "QRISS", sat: "Trx", nilai: "600.000" },
      penarikanPensiun: {
        label: "PENARIKAN PENSIUN",
        sat: "Trx",
        nilai: "8.000.000",
      },
      penarikanBansos: {
        label: "PENARIKAN BANSOS",
        sat: "Trx",
        nilai: "12.000.000",
      },
      kosongPengeluaran1: {
        label: "BIAYA OPERASIONAL",
        sat: "Pcs",
        nilai: "300.000",
      },
      kosongPengeluaran2: { label: "", sat: "", nilai: "" },
      kosongPengeluaran3: { label: "", sat: "", nilai: "" },
      remisePensiunKprk: {
        label: "1. PENGIRIMAN REMIS PENSIUN",
        sat: "Trx",
        nilai: "3.000.000",
      },
      remiseVaKprk: {
        label: "2. TOTAL PENGIRIMAN REMISE VA",
        sat: "Trx",
        nilai: "4.500.000",
      },
      remiseTunaiKprk: {
        label: "3. TOTAL PENGIRIMAN REMISE TUNAI",
        sat: "Trx",
        nilai: "5.500.000",
      },
      remiseBansosKprk: {
        label: "4. TOTAL PENGIRIMAN REMISE BANSOS",
        sat: "Trx",
        nilai: "2.500.000",
      },
      saldoDitahanHariIniOperasional: {
        label: "1. SALDO DITAHAN HARI INI OPERASIONAL",
        sat: "Trx",
        nilai: "1.500.000",
      },
      saldoDitahanHariIniPensiun: {
        label: "2. SALDO DITAHAN HARI INI PENSIUN",
        sat: "Trx",
        nilai: "2.000.000",
      },
      saldoDitahanHariIniBansos: {
        label: "3. SALDO DITAHAN HARI INI BANSOS",
        sat: "Trx",
        nilai: "1.000.000",
      },
    });
  };

  const handleKeyDown = (e, colIndex, rowIndex, section) => {
    const key = e.key;
    let targetCol = colIndex;
    let targetRow = rowIndex;

    if (key === "ArrowDown" || key === "Enter") {
      e.preventDefault();
      targetRow += 1;
    } else if (key === "ArrowUp") {
      e.preventDefault();
      targetRow -= 1;
    } else if (key === "ArrowRight") {
      if (colIndex < 1) {
        e.preventDefault();
        targetCol += 1;
      }
    } else if (key === "ArrowLeft") {
      if (colIndex > 0) {
        e.preventDefault();
        targetCol -= 1;
      }
    } else {
      return;
    }

    const nextInput = document.querySelector(
      `input[data-section="${section}"][data-col="${targetCol}"][data-row="${targetRow}"]`,
    );
    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  };

  const handlePendapatanChange = (key, field, value) => {
    let processedValue = value;
    if (field === "nilai") {
      const clean = value.replace(/\D/g, "");
      processedValue = clean ? Number(clean).toLocaleString("id-ID") : "";
    }
    setPendapatan((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { label: "", sat: "", nilai: "" }),
        [field]: processedValue,
      },
    }));
  };

  const handlePengeluaranChange = (key, field, value) => {
    let processedValue = value;
    if (field === "nilai") {
      const clean = value.replace(/\D/g, "");
      processedValue = clean ? Number(clean).toLocaleString("id-ID") : "";
    }
    setPengeluaran((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { label: "", sat: "", nilai: "" }),
        [field]: processedValue,
      },
    }));
  };

  const num = (val) => Number(String(val).replace(/\./g, "")) || 0;

  const totalPendapatanTransaksi =
    num(pendapatan.mileBm?.nilai) +
    num(pendapatan.mileOl1?.nilai) +
    num(pendapatan.mileOl2?.nilai) +
    num(pendapatan.mileOm1?.nilai) +
    num(pendapatan.mileOm2?.nilai) +
    num(pendapatan.weselpos?.nilai) +
    num(pendapatan.remitance?.nilai) +
    num(pendapatan.pospayBm?.nilai) +
    num(pendapatan.pospayOl1?.nilai) +
    num(pendapatan.pospayOl2?.nilai) +
    num(pendapatan.prangko?.nilai) +
    num(pendapatan.pembelianMeterai?.nilai) +
    num(pendapatan.kosongPendapatan1?.nilai) +
    num(pendapatan.kosongPendapatan2?.nilai) +
    num(pendapatan.kosongPendapatan3?.nilai);

  const totalPanjarPenerimaan =
    num(pendapatan.remiseOperasional?.nilai) +
    num(pendapatan.remisePensiun?.nilai) +
    num(pendapatan.remiseBansos?.nilai);

  const totalSaldoDitahanAll =
    num(pendapatan.saldoDitahanKemarinOperasional?.nilai) +
    num(pendapatan.saldoDitahanKemarinPensiun?.nilai) +
    num(pendapatan.saldoDitahanKemarinBansos?.nilai);

  const totalPenerimaanKas =
    totalPendapatanTransaksi + totalPanjarPenerimaan + totalSaldoDitahanAll;

  const totalPengeluaranTransaksi =
    num(pengeluaran.mileInvoice1?.nilai) +
    num(pengeluaran.mileInvoice2?.nilai) +
    num(pengeluaran.mileInvoice3?.nilai) +
    num(pengeluaran.mileLpu1?.nilai) +
    num(pengeluaran.mileLpu2?.nilai) +
    num(pengeluaran.mileLpu3?.nilai) +
    num(pengeluaran.penarikanWesel?.nilai) +
    num(pengeluaran.penarikanPospay?.nilai) +
    num(pengeluaran.penarikanBtn?.nilai) +
    num(pengeluaran.qriss?.nilai) +
    num(pengeluaran.penarikanPensiun?.nilai) +
    num(pengeluaran.penarikanBansos?.nilai) +
    num(pengeluaran.kosongPengeluaran1?.nilai) +
    num(pengeluaran.kosongPengeluaran2?.nilai) +
    num(pengeluaran.kosongPengeluaran3?.nilai);

  const totalSetoranLoket =
    num(pengeluaran.remisePensiunKprk?.nilai) +
    num(pengeluaran.remiseVaKprk?.nilai) +
    num(pengeluaran.remiseTunaiKprk?.nilai) +
    num(pengeluaran.remiseBansosKprk?.nilai);

  const totalSaldoDitahanHariIniAll =
    num(pengeluaran.saldoDitahanHariIniOperasional?.nilai) +
    num(pengeluaran.saldoDitahanHariIniPensiun?.nilai) +
    num(pengeluaran.saldoDitahanHariIniBansos?.nilai);

  const saldoHariIniAll = totalSaldoDitahanHariIniAll;
  const totalPengeluaranKas = totalPenerimaanKas;

  const handleSimpan = async (e) => {
    e.preventDefault();
    if (!nama || !kpc || !tanggal) {
      alert("Harap isi Nama Petugas, KPC / Kantor, dan Tanggal Laporan!");
      return;
    }

    const payload = {
      nama_petugas: nama,
      kpc_kantor: kpc,
      tanggal: tanggal,
      jumlah_penerimaan_kas: totalPenerimaanKas,
      jumlah_pengeluaran_kas: totalPengeluaranKas,
      ringkasan: {
        jumlah_penerimaan: totalPendapatanTransaksi,
        jumlah_panjar_kasir: totalPanjarPenerimaan,
        saldo_ditahan_kemarin_all: totalSaldoDitahanAll,
        jumlah_pengeluaran_transaksi: totalPengeluaranTransaksi,
        jumlah_setoran_loket: totalSetoranLoket,
        saldo_hari_ini_all: saldoHariIniAll,
      },
      pendapatan_details: pendapatan,
      pengeluaran_details: pengeluaran,
    };

    try {
      let response;
      if (editData) {
        response = await API.put(`/neraca-n2/${editData.id}`, payload);
      } else {
        response = await API.post("/neraca-n2", payload);
      }

      const savedData = response?.data?.data || {};

      const dataSimpanLokal = {
        id: savedData.id || editData?.id || Date.now(),
        kode: editData
          ? editData.kode
          : `N2-${tanggal.replace(/-/g, "")}-${Math.floor(Math.random() * 90 + 10)}`,
        nama: nama,
        kantor: kpc,
        tanggal: tanggal,
        penerimaan: totalPenerimaanKas,
        pengeluaran: totalPengeluaranKas,
        details: { pendapatan, pengeluaran },
      };

      onSimpanData(dataSimpanLokal);
    } catch (error) {
      console.error("Gagal menyimpan ke backend:", error);
      const dataSimpanLokal = {
        id: editData ? editData.id : Date.now(),
        kode: editData ? editData.kode : `N2-${tanggal.replace(/-/g, "")}-01`,
        nama: nama,
        kantor: kpc,
        tanggal: tanggal,
        penerimaan: totalPenerimaanKas,
        pengeluaran: totalPengeluaranKas,
        details: { pendapatan, pengeluaran },
      };
      onSimpanData(dataSimpanLokal);
    }
  };

  const listPendapatanKeys = [
    "mileBm",
    "mileOl1",
    "mileOl2",
    "mileOm1",
    "mileOm2",
    "weselpos",
    "remitance",
    "pospayBm",
    "pospayOl1",
    "pospayOl2",
    "prangko",
    "pembelianMeterai",
    "kosongPendapatan1",
    "kosongPendapatan2",
    "kosongPendapatan3",
    "remiseOperasional",
    "remisePensiun",
    "remiseBansos",
    "saldoDitahanKemarinOperasional",
    "saldoDitahanKemarinPensiun",
    "saldoDitahanKemarinBansos",
  ];

  const listPengeluaranKeys = [
    "mileInvoice1",
    "mileInvoice2",
    "mileInvoice3",
    "mileLpu1",
    "mileLpu2",
    "mileLpu3",
    "penarikanWesel",
    "penarikanPospay",
    "penarikanBtn",
    "qriss",
    "penarikanPensiun",
    "penarikanBansos",
    "kosongPengeluaran1",
    "kosongPengeluaran2",
    "kosongPengeluaran3",
    "remisePensiunKprk",
    "remiseVaKprk",
    "remiseTunaiKprk",
    "remiseBansosKprk",
    "saldoDitahanHariIniOperasional",
    "saldoDitahanHariIniPensiun",
    "saldoDitahanHariIniBansos",
  ];

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    tableLayout: "fixed",
  };
  const colNameStyle = { width: "55%", textAlign: "left", paddingLeft: "8px" };
  const colSatStyle = { width: "15%", textAlign: "center" };
  const colValStyle = { width: "30%", textAlign: "right" };

  return (
    <div className="neraca-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 className="page-title">
            {editData ? "Edit Neraca N2" : "Neraca N2"}
          </h1>
        </div>
        <button
          type="button"
          onClick={handleIsiDataDummy}
          style={{
            backgroundColor: "#00529c",
            color: "white",
            border: "none",
            padding: "9px 18px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          }}
        >
          ⚡ Isi Data Dummy Instan
        </button>
      </div>

      <form onSubmit={handleSimpan}>
        <div className="card form-header-card" style={{ marginTop: "12px" }}>
          <div className="form-row">
            <div className="form-group">
              <label>NAMA:</label>
              <input
                type="text"
                value={nama}
                readOnly
                className="form-control"
                style={{
                  backgroundColor: "#f1f5f9",
                  cursor: "not-allowed",
                  fontWeight: "600",
                }}
              />
            </div>
            <div className="form-group">
              <label>KPC / KANTOR:</label>
              <input
                type="text"
                value={kpc}
                readOnly
                className="form-control"
                style={{
                  backgroundColor: "#f1f5f9",
                  cursor: "not-allowed",
                  fontWeight: "600",
                }}
              />
            </div>
            <div className="form-group">
              <label>TANGGAL:</label>
              <input
                type="date"
                value={tanggal}
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
        </div>

        <div className="neraca-sheet-grid">
          {/* PENDAPATAN */}
          <div className="sheet-column">
            <div className="sheet-header header-pendapatan">PENDAPATAN</div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={colNameStyle}>NAMA REKENING</th>
                  <th style={colSatStyle}>SAT</th>
                  <th style={colValStyle}>NILAI (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {listPendapatanKeys.map((key, rowIndex) => {
                  const item = pendapatan[key] || {
                    label: "",
                    sat: "",
                    nilai: "",
                  };
                  const isCustomRow = key.startsWith("kosongPendapatan");
                  return (
                    <React.Fragment key={key}>
                      {rowIndex === 15 && (
                        <>
                          <tr className="row-total">
                            <td style={colNameStyle}>JUMLAH PENERIMAAN</td>
                            <td style={colSatStyle}></td>
                            <td style={colValStyle}>
                              {totalPendapatanTransaksi.toLocaleString("id-ID")}
                            </td>
                          </tr>
                          <tr className="subhead-yellow">
                            <td colSpan="3" style={{ textAlign: "center" }}>
                              PENERIMAAN REMISE DARI KPRK
                            </td>
                          </tr>
                        </>
                      )}
                      {rowIndex === 18 && (
                        <tr className="row-total">
                          <td style={colNameStyle}>
                            JUMLAH PENERIMAAN PANJAR DARI KASIR
                          </td>
                          <td style={colSatStyle}></td>
                          <td style={colValStyle}>
                            {totalPanjarPenerimaan.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={colNameStyle}>
                          {isCustomRow ? (
                            <input
                              type="text"
                              className="input-table"
                              placeholder="Ketik Nama Rekening..."
                              style={{
                                textAlign: "left",
                                width: "100%",
                                boxSizing: "border-box",
                              }}
                              value={item.label}
                              onChange={(e) =>
                                handlePendapatanChange(
                                  key,
                                  "label",
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            <span style={{ paddingLeft: "4px" }}>
                              {item.label}
                            </span>
                          )}
                        </td>
                        <td style={colSatStyle}>
                          <input
                            type="text"
                            className="input-table"
                            data-section="pendapatan"
                            data-col="0"
                            data-row={rowIndex}
                            style={{
                              textAlign: "center",
                              width: "100%",
                              boxSizing: "border-box",
                            }}
                            value={item.sat}
                            onChange={(e) =>
                              handlePendapatanChange(key, "sat", e.target.value)
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, 0, rowIndex, "pendapatan")
                            }
                          />
                        </td>
                        <td style={colValStyle}>
                          <input
                            type="text"
                            className="input-table"
                            placeholder="0"
                            data-section="pendapatan"
                            data-col="1"
                            data-row={rowIndex}
                            style={{
                              textAlign: "right",
                              width: "100%",
                              boxSizing: "border-box",
                            }}
                            value={item.nilai}
                            onChange={(e) =>
                              handlePendapatanChange(
                                key,
                                "nilai",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, 1, rowIndex, "pendapatan")
                            }
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}

                <tr className="row-highlight-blue">
                  <td style={colNameStyle}>SALDO DITAHAN ALL</td>
                  <td style={colSatStyle}></td>
                  <td style={colValStyle}>
                    {totalSaldoDitahanAll.toLocaleString("id-ID")}
                  </td>
                </tr>
                <tr className="row-highlight-blue">
                  <td style={colNameStyle}>JUMLAH PENERIMAAN KAS</td>
                  <td style={colSatStyle}></td>
                  <td style={colValStyle}>
                    <strong>
                      {totalPenerimaanKas.toLocaleString("id-ID")}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* PENGELUARAN */}
          <div className="sheet-column">
            <div className="sheet-header header-pengeluaran">PENGELUARAN</div>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={colNameStyle}>NAMA REKENING</th>
                  <th style={colSatStyle}>SAT</th>
                  <th style={colValStyle}>NILAI (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {listPengeluaranKeys.map((key, rowIndex) => {
                  const item = pengeluaran[key] || {
                    label: "",
                    sat: "",
                    nilai: "",
                  };
                  const isCustomRow = key.startsWith("kosongPengeluaran");
                  return (
                    <React.Fragment key={key}>
                      {rowIndex === 15 && (
                        <>
                          <tr className="row-total">
                            <td style={colNameStyle}>
                              JUMLAH PENGELUARAN TRANSAKSI
                            </td>
                            <td style={colSatStyle}></td>
                            <td style={colValStyle}>
                              {totalPengeluaranTransaksi.toLocaleString(
                                "id-ID",
                              )}
                            </td>
                          </tr>
                          <tr className="subhead-yellow">
                            <td colSpan="3" style={{ textAlign: "center" }}>
                              PENGIRIMAN REMISE KE KPRK
                            </td>
                          </tr>
                        </>
                      )}
                      {rowIndex === 19 && (
                        <tr className="row-total">
                          <td style={colNameStyle}>
                            JUMLAH SETORAN LOKET PADA KASIR
                          </td>
                          <td style={colSatStyle}></td>
                          <td style={colValStyle}>
                            {totalSetoranLoket.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td style={colNameStyle}>
                          {isCustomRow ? (
                            <input
                              type="text"
                              className="input-table"
                              placeholder="Ketik Nama Rekening..."
                              style={{
                                textAlign: "left",
                                width: "100%",
                                boxSizing: "border-box",
                              }}
                              value={item.label}
                              onChange={(e) =>
                                handlePengeluaranChange(
                                  key,
                                  "label",
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            <span style={{ paddingLeft: "4px" }}>
                              {item.label}
                            </span>
                          )}
                        </td>
                        <td style={colSatStyle}>
                          <input
                            type="text"
                            className="input-table"
                            data-section="pengeluaran"
                            data-col="0"
                            data-row={rowIndex}
                            style={{
                              textAlign: "center",
                              width: "100%",
                              boxSizing: "border-box",
                            }}
                            value={item.sat}
                            onChange={(e) =>
                              handlePengeluaranChange(
                                key,
                                "sat",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, 0, rowIndex, "pengeluaran")
                            }
                          />
                        </td>
                        <td style={colValStyle}>
                          <input
                            type="text"
                            className="input-table"
                            placeholder="0"
                            data-section="pengeluaran"
                            data-col="1"
                            data-row={rowIndex}
                            style={{
                              textAlign: "right",
                              width: "100%",
                              boxSizing: "border-box",
                            }}
                            value={item.nilai}
                            onChange={(e) =>
                              handlePengeluaranChange(
                                key,
                                "nilai",
                                e.target.value,
                              )
                            }
                            onKeyDown={(e) =>
                              handleKeyDown(e, 1, rowIndex, "pengeluaran")
                            }
                          />
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}

                <tr className="row-highlight-green">
                  <td style={colNameStyle}>SALDO HARI INI ALL</td>
                  <td style={colSatStyle}></td>
                  <td style={colValStyle}>
                    <strong>{saldoHariIniAll.toLocaleString("id-ID")}</strong>
                  </td>
                </tr>
                <tr className="row-highlight-pink">
                  <td style={colNameStyle}>JUMLAH PENGELUARAN KAS</td>
                  <td style={colSatStyle}></td>
                  <td style={colValStyle}>
                    <strong>
                      {totalPengeluaranKas.toLocaleString("id-ID")}
                    </strong>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            marginTop: "16px",
            textAlign: "right",
            paddingBottom: "20px",
          }}
        >
          <button
            type="submit"
            className="btn-search"
            style={{
              padding: "10px 24px",
              fontSize: "14px",
              backgroundColor: "#00529c",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            💾 {editData ? "Perbarui Laporan" : "Simpan ke Rekap N2"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default NeracaN2;
