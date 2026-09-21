import React, { useState, useEffect } from "react";
import API from "./components/axios";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import NeracaN2 from "./components/NeracaN2";
import RekapN2 from "./components/RekapN2";
import BacksheetPospay from "./components/BacksheetPospay";
import BacksheetRemittance from "./components/BacksheetRemittance";
import BacksheetCoreGiro from "./components/BacksheetCoreGiro";
import BacksheetKurlog from "./components/BacksheetKurlog";
import OrderPKB from "./components/OrderPKB";
import Samsat from "./components/Samsat";
import RekapOrderPKB from "./components/RekapOrderPKB";
import OrderMaterai from "./components/OrderMaterai";
import RiwayatMaterai from "./components/RiwayatMaterai";
import OrderPerangko from "./components/OrderPerangko";
import RiwayatPerangko from "./components/RiwayatPerangko";
import PermintaanBarang from "./components/PermintaanBarang";
import RiwayatPermintaanBarang from "./components/RiwayatPermintaanBarang";
import KelolaKantor from "./components/KelolaKantor";
import KelolaUser from "./components/KelolaUser";
import KelolaBarang from "./components/KelolaBarang";
import AgenPos from "./components/AgenPos";
import RiwayatAgenPos from "./components/RiwayatAgenPos";
import PenjualanBeras from "./components/PenjualanBeras";
import LaporanPenjualan from "./components/LaporanPenjualan";
import KirimanKorporat from "./components/KirimanKorporat";
import RiwayatKorporat from "./components/RiwayatKorporat";
import Profil from "./components/Profil";
import Notifikasi from "./components/Notifikasi";

/* IMPORT CSS MODULAR SESUAI LETAK FOLDER COMPONENTS */
import "./components/Dashboard.css";
import "./components/Sidebar.css";
import "./components/NeracaBaru.css";
import "./components/Rekap.css";
import "./components/Notifikasi.css";

/* =========================================================
   APP
   ========================================================= */
function App() {
  const [userActive, setUserActive] = useState(null);
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const [previousMenu, setPreviousMenu] = useState("Dashboard"); // Menyimpan menu terakhir sebelum ke Profil
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  /* =========================================================
     FOTO PROFIL
     ========================================================= */
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    if (userActive) {
      const userId =
        userActive?.id ||
        userActive?.nippos ||
        userActive?.username ||
        "default";

      const savedImage = localStorage.getItem(`profile_image_${userId}`);

      if (savedImage) {
        setProfileImage(savedImage);
      } else {
        setProfileImage("");
      }
    }
  }, [userActive]);

  /* =========================================================
     NOTIFIKASI
     ========================================================= */
  const [showNotification, setShowNotification] = useState(false);

  /* =========================================================
     DATA REKAP N2
     ========================================================= */
  const [dataRekap, setDataRekap] = useState([
    {
      id: 1,
      kode: "N2-20260831-01",
      nama: "Zia",
      kantor: "Kantor Pos Sidoarjo 61200",
      tanggal: "2026-08-31",
      remiseVa: 4500000,
      remiseTunai: 5500000,
      remiseBansos: 2500000,
      saldoOperasional: 1500000,
      saldoPensiun: 2000000,
      saldoBansos: 1000000,
      penerimaan: 72700000,
      pengeluaran: 72700000,
      status: "Verified",
    },
  ]);

  /* =========================================================
     FUNGSI MEMBACA JSON DARI BACKEND
     ========================================================= */
  const parseJsonJikaPerlu = (value) => {
    if (!value) {
      return {};
    }

    if (typeof value === "object") {
      return value;
    }

    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch (error) {
        console.error("Gagal parse JSON:", error);
        return {};
      }
    }

    return {};
  };

  /* =========================================================
     AMBIL BAGIAN DATA PENDAPATAN / PENGELUARAN
     ========================================================= */
  const ambilBagianDetail = (data, namaBagian) => {
    if (!data || typeof data !== "object") {
      return {};
    }

    if (data[namaBagian] && typeof data[namaBagian] === "object") {
      return data[namaBagian];
    }

    if (
      data.details &&
      data.details[namaBagian] &&
      typeof data.details[namaBagian] === "object"
    ) {
      return data.details[namaBagian];
    }

    return data;
  };

  /* =========================================================
     AMBIL NILAI UANG
     ========================================================= */
  const ambilNilai = (data, namaField) => {
    if (!data || typeof data !== "object") {
      return 0;
    }

    const field = data[namaField];

    if (field && typeof field === "object") {
      return Number(field.nilai ?? field.value ?? field.jumlah ?? 0);
    }

    return Number(field ?? 0);
  };

  /* =========================================================
     AMBIL DATA REKAP N2 DARI BACKEND (DIAMANKAN DARI ERROR 403)
     ========================================================= */
  useEffect(() => {
    const roleUser = String(userActive?.role || "").toLowerCase();
    if (
      !userActive ||
      roleUser === "agenpos" ||
      roleUser.includes("mitra") ||
      roleUser.includes("pickuper") ||
      roleUser.includes("kurir")
    ) {
      return;
    }

    let masihAktif = true;

    const ambilDataRekapN2 = async () => {
      try {
        const response = await API.get("/neraca-n2");

        const dataBackend = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const dataFormat = dataBackend.map((item) => {
          const pendapatanMentah = parseJsonJikaPerlu(item.pendapatan_details);
          const pengeluaranMentah = parseJsonJikaPerlu(
            item.pengeluaran_details,
          );
          const pendapatan = ambilBagianDetail(pendapatanMentah, "pendapatan");
          const pengeluaran = ambilBagianDetail(
            pengeluaranMentah,
            "pengeluaran",
          );

          const remisePensiun = ambilNilai(pengeluaran, "remisePensiunKprk");
          const remiseVa = ambilNilai(pengeluaran, "remiseVaKprk");
          const remiseTunai = ambilNilai(pengeluaran, "remiseTunaiKprk");
          const remiseBansos = ambilNilai(pengeluaran, "remiseBansosKprk");

          const saldoOperasional = ambilNilai(
            pengeluaran,
            "saldoDitahanHariIniOperasional",
          );
          const saldoPensiun = ambilNilai(
            pengeluaran,
            "saldoDitahanHariIniPensiun",
          );
          const saldoBansos = ambilNilai(
            pengeluaran,
            "saldoDitahanHariIniBansos",
          );

          return {
            ...item,
            id: item.id,
            nama:
              item.nama ||
              item.nama_petugas ||
              item.user?.name ||
              "Petugas Loket",
            nama_petugas:
              item.nama_petugas ||
              item.nama ||
              item.user?.name ||
              "Petugas Loket",
            kantor: item.kantor || item.kpc_kantor || "-",
            kpc_kantor: item.kpc_kantor || item.kantor || "-",
            kode:
              item.kode ||
              `N2-${String(item.tanggal || "")
                .split("T")[0]
                .replace(/-/g, "")}-${item.id}`,
            tanggal: item.tanggal ? String(item.tanggal).split("T")[0] : "",
            penerimaan: Number(
              item.penerimaan ?? item.jumlah_penerimaan_kas ?? 0,
            ),
            jumlah_penerimaan_kas: Number(
              item.jumlah_penerimaan_kas ?? item.penerimaan ?? 0,
            ),
            pengeluaran: Number(
              item.pengeluaran ?? item.jumlah_pengeluaran_kas ?? 0,
            ),
            jumlah_pengeluaran_kas: Number(
              item.jumlah_pengeluaran_kas ?? item.pengeluaran ?? 0,
            ),
            details: {
              pendapatan: pendapatan,
              pengeluaran: pengeluaran,
            },
            remisePensiun: remisePensiun,
            remiseVa: remiseVa,
            remiseTunai: remiseTunai,
            remiseBansos: remiseBansos,
            saldoOperasional: saldoOperasional,
            saldoPensiun: saldoPensiun,
            saldoBansos: saldoBansos,
            status: item.status || "Verified",
          };
        });

        if (masihAktif) {
          setDataRekap(dataFormat);
        }
      } catch (error) {
        console.error("Gagal mengambil data Rekap N2:", error);
      }
    };

    ambilDataRekapN2();

    return () => {
      masihAktif = false;
    };
  }, [userActive]);

  /* =========================================================
     EDIT REKAP
     ========================================================= */
  const [editData, setEditData] = useState(null);

  const simpanRekap = (laporan) => {
    if (editData) {
      setDataRekap((prev) =>
        prev.map((item) => (item.id === laporan.id ? laporan : item)),
      );
      setEditData(null);
      alert("Laporan berhasil diperbarui!");
    } else {
      setDataRekap((prev) => [laporan, ...prev]);
      alert("Laporan berhasil disimpan ke Rekap N2!");
    }

    setActiveMenu("Rekap N2");
  };

  const handleStartEdit = (item) => {
    setEditData(item);
    setActiveMenu("Neraca N2");
  };

  const handleHapusRekap = async (id) => {
    try {
      await API.delete(`/neraca-n2/${id}`);
    } catch (error) {
      console.error("Gagal menghapus dari backend:", error);
    }

    setDataRekap((prev) => prev.filter((item) => item.id !== id));
  };

  const [dataOrderPKB, setDataOrderPKB] = useState([
    {
      id: 1,
      tanggal_order: "2026-09-02",
      kantor: "Kantor Pos Jabon",
      petugas: "Cece Zia",
      plat_nomor: "W 1111 AA",
      nama_pemilik: "Agus Santoso",
      no_bukti_bayar: "TRX-001",
      status: "Order",
      catatan: "",
    },
  ]);

  const [dataOrderMaterai, setDataOrderMaterai] = useState([
    {
      id: 1,
      tanggal: "2026-09-02",
      nama_kantor: "Kantor Pos Tulangan",
      keping: 2,
      harga_satuan: 10000,
      sesi: "Pagi",
    },
  ]);

  const [dataOrderPerangko, setDataOrderPerangko] = useState([
    {
      id: 1,
      tanggal: "2026-09-02",
      nama_kantor: "Kantor Pos Sidoarjo 61200",
      keping: 10,
      harga_satuan: 1000,
    },
  ]);

  const [daftarMasterBarang, setDaftarMasterBarang] = useState([
    {
      id: 13,
      namaBarang: "Resi Mile",
      satuan: "Pcs",
      petugasInput: "Moh Ganda Sutiawan",
    },
  ]);

  const [dataPermintaanBarang, setDataPermintaanBarang] = useState([
    {
      id: 1,
      kode: "PER7-20260902-01",
      tanggal: "2026-09-02",
      namaBarang: "Beras SPHP",
      jumlah: 50,
      satuan: "Sak",
      status: "Order",
      keterangan: "Permintaan rutin mingguan",
    },
  ]);

  const [dataAgenPos, setDataAgenPos] = useState([
    {
      id: 1,
      tanggal: "2026-09-02",
      namaKantor: "Kantor Pos Sidoarjo 61200",
      namaAgen: "Agen Pos Sidoarjo Kota",
      keterangan: "Pendaftaran awal mitra agen",
      status: "Order",
      metode: "Tunai",
      catatanAdmin: "",
    },
  ]);

  const [editDataAgen, setEditDataAgen] = useState(null);

  const [dataPenjualan, setDataPenjualan] = useState([
    {
      id: 1,
      tanggal: "2026-09-08",
      nama_kantor: "KC SIDOARJO",
      petugas: "Cece Zia",
      kategori: "Beras",
      nama_produk: "Beras SPHP",
      jumlah: 10,
      harga_satuan: 62500,
      total_harga: 625000,
      metode: "Tunai",
    },
  ]);

  const handleSimpanPenjualan = (dataBaru) => {
    setDataPenjualan((prev) => [dataBaru, ...prev]);
    alert("Penjualan Beras berhasil disimpan!");
    setActiveMenu("Riwayat Penjualan");
  };

  const handleHapusPenjualan = (id) => {
    setDataPenjualan((prev) => prev.filter((item) => item.id !== id));
  };

  const [editDataPermintaan, setEditDataPermintaan] = useState(null);

  const handleSimpanOrderPKB = (orderBaru) => {
    const dataLengkap = {
      id: Date.now(),
      status: "Order",
      petugas: userActive ? userActive.nama || userActive.name : "Cece Zia",
      catatan: "",
      ...orderBaru,
    };

    setDataOrderPKB((prev) => [dataLengkap, ...prev]);
    alert(
      "Order PKB berhasil dikirim dan tersinkronisasi ke Samsat & Rekap Order!",
    );

    if (userActive?.role !== "petugas") {
      setActiveMenu("Riwayat Order PKB");
    }
  };

  const handleSimpanOrderMaterai = (materaiBaru) => {
    const nilaiKeping = Number(
      materaiBaru.keping ??
        materaiBaru.jumlah ??
        materaiBaru.jumlah_keping ??
        materaiBaru.qty ??
        0,
    );

    const dataLengkap = {
      id: Date.now(),
      tanggal: materaiBaru.tanggal || new Date().toISOString().split("T")[0],
      nama_kantor:
        materaiBaru.nama_kantor ||
        materaiBaru.kantor ||
        userActive?.kantor ||
        "Kantor Pos Sidoarjo 61200",
      keping: nilaiKeping,
      harga_satuan: Number(materaiBaru.harga_satuan || 10000),
      sesi: materaiBaru.sesi || "Pagi",
    };

    setDataOrderMaterai((prev) => [dataLengkap, ...prev]);
    alert("Order Materai berhasil disimpan!");

    if (userActive?.role !== "petugas") {
      setActiveMenu("Riwayat Order Materai");
    }
  };

  const handleSimpanOrderPerangko = (perangkoBaru) => {
    setDataOrderPerangko((prev) => [perangkoBaru, ...prev]);
    alert("Order Perangko berhasil disimpan dan masuk ke Riwayat!");

    if (userActive?.role !== "petugas") {
      setActiveMenu("Riwayat Order Perangko");
    }
  };

  const handleSimpanPermintaanBarang = (barangBaru) => {
    if (editDataPermintaan) {
      setDataPermintaanBarang((prev) =>
        prev.map((item) =>
          item.id === barangBaru.id
            ? { ...barangBaru, status: item.status || "Order" }
            : item,
        ),
      );
      setEditDataPermintaan(null);
      alert("Permintaan barang berhasil diperbarui!");
    } else {
      const dataBaruWithStatus = { ...barangBaru, status: "Order" };
      setDataPermintaanBarang((prev) => [dataBaruWithStatus, ...prev]);
      alert("Permintaan barang berhasil disimpan!");
    }

    if (userActive?.role !== "petugas") {
      setActiveMenu("Riwayat Permintaan Barang");
    }
  };

  const handleStartEditPermintaan = (item) => {
    setEditDataPermintaan(item);
    setActiveMenu("Permintaan Barang (Per7)");
  };

  const handleHapusPermintaan = (id) => {
    setDataPermintaanBarang((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateStatus = (id, statusBaru) => {
    setDataPermintaanBarang((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: statusBaru } : item,
      ),
    );
  };

  const handleSimpanAgenPos = (agenBaru) => {
    if (editDataAgen) {
      setDataAgenPos((prev) =>
        prev.map((item) => (item.id === agenBaru.id ? agenBaru : item)),
      );
      setEditDataAgen(null);
      alert("Data Agen Pos berhasil diperbarui!");
    } else {
      setDataAgenPos((prev) => [agenBaru, ...prev]);
      alert("Agen Pos berhasil disimpan!");
    }

    if (userActive?.role !== "agenpos") {
      setActiveMenu("Riwayat Agen Pos");
    } else {
      setActiveMenu("Agen Pos");
    }
  };

  const handleStartEditAgen = (item) => {
    setEditDataAgen(item);
    setActiveMenu("Agen Pos");
  };

  const handleHapusAgen = (id) => {
    setDataAgenPos((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateStatusAgen = (id, statusBaru) => {
    setDataAgenPos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: statusBaru } : item,
      ),
    );
  };

  const handleUpdateCatatanAgen = (id, catatanBaru) => {
    setDataAgenPos((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, catatanAdmin: catatanBaru } : item,
      ),
    );
  };

  /* =========================================================
     JIKA BELUM LOGIN
     ========================================================= */
  if (!userActive) {
    return (
      <Login
        onLoginSuccess={(userData) => {
          setUserActive(userData);
          const roleLogin = String(userData?.role || "").toLowerCase();
          if (roleLogin.includes("pickuper") || roleLogin.includes("kurir")) {
            setActiveMenu("Kiriman Korporat");
            setPreviousMenu("Kiriman Korporat");
          } else {
            setActiveMenu("Dashboard");
            setPreviousMenu("Dashboard");
          }
        }}
      />
    );
  }

  const roleUserLogin = String(userActive?.role || "").toLowerCase();
  const isPickuperOnly =
    roleUserLogin.includes("pickuper") || roleUserLogin.includes("kurir");

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="navbar-left">
          {!isPickuperOnly && (
            <button
              className="hamburger-btn"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              ≡
            </button>
          )}

          <div className="logo-brand-container">
            <div className="brand-posind">
              <span className="posind-main">
                POS <span className="dot-i">i</span> ND
              </span>
              <span className="posind-sub">Logistik Indonesia</span>
            </div>

            <div className="brand-posped">
              <span className="posped-main">
                <span className="posped-pos">POS</span>
                <span className="posped-ped">PED</span>
              </span>
              <span className="posped-sub">Pos Penyimpanan Digital</span>
            </div>
          </div>
        </div>

        <div
          className="navbar-right"
          style={{ display: "flex", alignItems: "center" }}
        >
          {/* ICON LONCENG (Hanya muncul untuk Admin & Superadmin) */}
          {(userActive?.role === "admin" ||
            userActive?.role === "superadmin") && (
            <div style={{ position: "relative", marginRight: "20px" }}>
              <button
                onClick={() => setShowNotification(!showNotification)}
                style={{
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: "24px",
                  padding: "5px",
                  position: "relative",
                }}
                title="Notifikasi"
              >
                🔔
                <span
                  style={{
                    position: "absolute",
                    top: "3px",
                    right: "2px",
                    width: "8px",
                    height: "8px",
                    background: "#ef4444",
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              </button>

              {showNotification && (
                <Notifikasi
                  setActiveMenu={(menu) => {
                    if (activeMenu !== "Profil") {
                      setPreviousMenu(activeMenu);
                    }
                    setActiveMenu(menu);
                  }}
                  setShowNotification={setShowNotification}
                />
              )}
            </div>
          )}

          <button
            onClick={() => {
              if (activeMenu !== "Profil") {
                setPreviousMenu(activeMenu);
              }
              setActiveMenu("Profil");
              setShowNotification(false);
            }}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "0",
            }}
            title="Profil"
          >
            <div
              className="avatar-circle"
              style={{
                overflow: "hidden",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Foto Profil"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                (userActive.nama || userActive.name || "Z")
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="user-text" style={{ textAlign: "left" }}>
              <span className="name">{userActive.nama || userActive.name}</span>
              <span className="role">
                {userActive.role}{" "}
                {userActive.kantor && userActive.kantor !== "-"
                  ? `(${userActive.kantor})`
                  : ""}
              </span>
            </div>
          </button>

          {/* TOMBOL LOGOUT DENGAN KONFIRMASI */}
          <button
            onClick={() => {
              if (
                window.confirm("Apakah Anda yakin ingin keluar dari aplikasi?")
              ) {
                setUserActive(null);
              }
            }}
            style={{
              marginLeft: "16px",
              padding: "6px 12px",
              fontSize: "12px",
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {isSidebarOpen && !isPickuperOnly && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="main-wrapper">
        {!isPickuperOnly && (
          <Sidebar
            isOpen={isSidebarOpen}
            activeMenu={activeMenu}
            userActive={userActive}
            setActiveMenu={(menu) => {
              if (menu === "Neraca N2" && activeMenu !== "Neraca N2") {
                setEditData(null);
              }
              if (
                menu === "Permintaan Barang (Per7)" &&
                activeMenu !== "Permintaan Barang (Per7)"
              ) {
                setEditDataPermintaan(null);
              }
              if (menu === "Agen Pos" && activeMenu !== "Agen Pos") {
                setEditDataAgen(null);
              }
              if (menu !== "Profil") {
                setPreviousMenu(menu);
              }
              setActiveMenu(menu);
            }}
          />
        )}

        <main
          className="content-area"
          style={isPickuperOnly ? { marginLeft: "0", width: "100%" } : {}}
        >
          {activeMenu === "Profil" && (
            <Profil
              userActive={userActive}
              setUserActive={setUserActive}
              profileImage={profileImage}
              setProfileImage={setProfileImage}
              onBack={() => setActiveMenu(previousMenu || "Dashboard")}
            />
          )}

          {activeMenu === "Dashboard" && (
            <Dashboard
              setActiveTab={(menu) => {
                setPreviousMenu(menu);
                setActiveMenu(menu);
              }}
              userActive={userActive}
            />
          )}

          {activeMenu === "Neraca N2" && (
            <NeracaN2
              onSimpanData={simpanRekap}
              editData={editData}
              userActive={userActive}
            />
          )}

          {activeMenu === "Rekap N2" && (
            <RekapN2
              dataRekap={dataRekap}
              onEdit={handleStartEdit}
              onHapus={handleHapusRekap}
            />
          )}

          {activeMenu === "Riwayat Order PKB" && (
            <RekapOrderPKB
              dataRiwayat={dataOrderPKB}
              setDataRiwayat={setDataOrderPKB}
              userActive={userActive}
            />
          )}

          {activeMenu === "Order PKB" && (
            <OrderPKB
              userActive={userActive}
              onSimpanOrder={handleSimpanOrderPKB}
              setActiveMenu={setActiveMenu}
            />
          )}

          {activeMenu === "Order Materai" && (
            <OrderMaterai
              userActive={userActive}
              onSimpanOrderMaterai={handleSimpanOrderMaterai}
            />
          )}

          {activeMenu === "Riwayat Order Materai" && (
            <RiwayatMaterai
              userActive={userActive}
              dataOrderMaterai={dataOrderMaterai}
              setDataOrderMaterai={setDataOrderMaterai}
            />
          )}

          {activeMenu === "Order Perangko" && (
            <OrderPerangko
              userActive={userActive}
              onSimpanOrderPerangko={handleSimpanOrderPerangko}
            />
          )}

          {activeMenu === "Riwayat Order Perangko" && (
            <RiwayatPerangko
              userActive={userActive}
              dataOrderPerangko={dataOrderPerangko}
              setDataOrderPerangko={setDataOrderPerangko}
            />
          )}

          {activeMenu === "Permintaan Barang (Per7)" && (
            <PermintaanBarang
              onSimpanData={handleSimpanPermintaanBarang}
              editData={editDataPermintaan}
              userActive={userActive}
              dataListRiwayat={dataPermintaanBarang}
            />
          )}

          {activeMenu === "Riwayat Permintaan Barang" && (
            <RiwayatPermintaanBarang userActive={userActive} />
          )}

          {activeMenu === "Penjualan Beras" && (
            <PenjualanBeras
              userActive={userActive}
              onSimpanData={handleSimpanPenjualan}
            />
          )}

          {activeMenu === "Riwayat Penjualan" && (
            <LaporanPenjualan
              dataPenjualan={dataPenjualan}
              onDelete={handleHapusPenjualan}
            />
          )}

          {activeMenu === "Kiriman Korporat" && (
            <KirimanKorporat userActive={userActive} />
          )}

          {activeMenu === "Riwayat Korporat" && (
            <RiwayatKorporat userActive={userActive} />
          )}

          {activeMenu === "Agen Pos" && (
            <AgenPos
              userActive={userActive}
              onSimpanData={handleSimpanAgenPos}
              editData={editDataAgen}
              dataList={dataAgenPos}
            />
          )}

          {activeMenu === "Riwayat Agen Pos" && (
            <RiwayatAgenPos
              dataList={dataAgenPos}
              onEdit={handleStartEditAgen}
              onDelete={handleHapusAgen}
              onUpdateStatus={handleUpdateStatusAgen}
              onUpdateCatatan={handleUpdateCatatanAgen}
              userActive={userActive}
            />
          )}

          {activeMenu === "Kelola Kantor" &&
            userActive?.role === "superadmin" && (
              <KelolaKantor userActive={userActive} />
            )}

          {activeMenu === "Kelola User" &&
            userActive?.role === "superadmin" && (
              <KelolaUser userActive={userActive} />
            )}

          {activeMenu === "Kelola Barang" && (
            <KelolaBarang
              daftarMasterBarang={daftarMasterBarang}
              setDaftarMasterBarang={setDaftarMasterBarang}
              userActive={userActive}
            />
          )}

          {activeMenu === "Samsat" && (
            <Samsat dataRekapSamsat={dataOrderPKB} userActive={userActive} />
          )}

          {activeMenu === "Backsheet Pospay" && (
            <BacksheetPospay userActive={userActive} />
          )}

          {activeMenu === "Remittance" && (
            <BacksheetRemittance userActive={userActive} />
          )}

          {activeMenu === "Core Giro System" && (
            <BacksheetCoreGiro userActive={userActive} />
          )}

          {activeMenu === "Kurlog" && (
            <BacksheetKurlog userActive={userActive} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
