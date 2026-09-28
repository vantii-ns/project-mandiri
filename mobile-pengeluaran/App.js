import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import {
  getPengeluaran,
  getPengeluaranById,
  getKategori,
  tambahPengeluaran,
  ubahPengeluaran,
  hapusPengeluaran,
} from './src/api';

export default function App() {
  // =========================
  // STATE UTAMA
  // =========================

  const [screen, setScreen] = useState('list');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form tambah
  const [judul, setJudul] = useState('');
  const [nominal, setNominal] = useState('');
  const [kategori, setKategori] = useState(null);

  // Kategori
  const [categories, setCategories] = useState([]);
  const [loadingKategori, setLoadingKategori] = useState(false);

  // Validasi
  const [formError, setFormError] = useState(false);

  // Simpan
  const [saving, setSaving] = useState(false);

  // Detail
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState('');

  // Edit
  const [editJudul, setEditJudul] = useState('');
  const [editNominal, setEditNominal] = useState('');

  // =========================
  // AMBIL DATA PENGELUARAN
  // =========================

  async function ambilData() {
    try {
      setLoading(true);
      setError('');

      const data = await getPengeluaran();
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // AMBIL KATEGORI
  // =========================

  async function ambilKategori() {
    try {
      setLoadingKategori(true);

      const data = await getKategori();
      setCategories(data);
    } catch (err) {
      Alert.alert(
        'Gagal',
        'Gagal mengambil data kategori.'
      );
    } finally {
      setLoadingKategori(false);
    }
  }

  // =========================
  // LOAD AWAL
  // =========================

  useEffect(() => {
    ambilData();
  }, []);

  // =========================
  // RESET FORM
  // =========================

  function resetForm() {
    setJudul('');
    setNominal('');
    setKategori(null);
    setFormError(false);
    setSaving(false);
  }

  // =========================
  // BUKA FORM TAMBAH
  // =========================

  function bukaTambah() {
    resetForm();
    setScreen('add');
  }

  // =========================
  // BUKA PILIH KATEGORI
  // =========================

  async function bukaKategori() {
    if (categories.length === 0) {
      await ambilKategori();
    }

    setScreen('category');
  }

  // =========================
  // PILIH KATEGORI
  // =========================

  function pilihKategori(item) {
    setKategori(item);
    setScreen('add-filled');
  }

  // =========================
  // SIMPAN PENGELUARAN
  // =========================

  async function simpanPengeluaran() {
    const judulBersih = judul.trim();
    const nominalAngka = Number(nominal);

    if (!judulBersih || !nominal || nominalAngka < 1) {
      setFormError(true);
      return;
    }

    try {
      setSaving(true);
      setFormError(false);

      // Masuk ke frame "Menyimpan"
      setScreen('saving');

      await tambahPengeluaran({
        judul: judulBersih,
        nominal: nominalAngka,
        id_kategori: kategori ? kategori.id : null,
      });

      // Sedikit delay supaya state loading terlihat
      await new Promise((resolve) => setTimeout(resolve, 600));

      resetForm();

      await ambilData();

      setScreen('list');
    } catch (err) {
      setSaving(false);
      setScreen('add');
      Alert.alert(
        'Gagal',
        'Gagal menyimpan pengeluaran.'
      );
    }
  }

  // =========================
  // BUKA DETAIL
  // =========================

  async function bukaDetail(id) {
    setSelectedId(id);
    setDetail(null);
    setDetailError('');
    setLoadingDetail(true);
    setScreen('detail');

    try {
      const data = await getPengeluaranById(id);

      setDetail(data);

      // Isi form edit
      setEditJudul(data.judul || '');
      setEditNominal(String(data.nominal || ''));
    } catch (err) {
      setDetailError(err.message);
    } finally {
      setLoadingDetail(false);
    }
  }

  // =========================
  // BUKA EDIT
  // =========================

  function bukaEdit() {
    if (!detail) return;

    setEditJudul(detail.judul || '');
    setEditNominal(String(detail.nominal || ''));

    setScreen('edit');
  }

  // =========================
  // SIMPAN EDIT
  // =========================

  async function simpanEdit() {
    const judulBersih = editJudul.trim();
    const nominalAngka = Number(editNominal);

    if (!judulBersih || !editNominal || nominalAngka < 1) {
      Alert.alert(
        'Data belum lengkap',
        'Judul dan nominal harus diisi dengan benar.'
      );
      return;
    }

    try {
      setSaving(true);

      await ubahPengeluaran(selectedId, {
        judul: judulBersih,
        nominal: nominalAngka,
      });

      await new Promise((resolve) => setTimeout(resolve, 600));

      setSaving(false);

      await ambilData();

      setScreen('list');
    } catch (err) {
      setSaving(false);

      Alert.alert(
        'Gagal',
        'Gagal mengubah pengeluaran.'
      );
    }
  }

  // =========================
  // KONFIRMASI HAPUS
  // =========================

  function bukaKonfirmasiHapus() {
    setScreen('delete-confirm');
  }

  // =========================
  // HAPUS
  // =========================

  async function konfirmasiHapus() {
    try {
      setSaving(true);

      await hapusPengeluaran(selectedId);

      await new Promise((resolve) => setTimeout(resolve, 300));

      await ambilData();

      setSaving(false);
      setDetail(null);
      setSelectedId(null);

      setScreen('list');
    } catch (err) {
      setSaving(false);

      Alert.alert(
        'Gagal',
        'Gagal menghapus pengeluaran.'
      );
    }
  }

  // ============================================================
  // FRAME 01 - DAFTAR
  // ============================================================

  if (screen === 'list') {
    // Loading awal
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Memuat data...
          </Text>
        </View>
      );
    }

    // Error loading
    if (error) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>
            Daftar pengeluaran
          </Text>

          <Pressable
            style={styles.button}
            onPress={ambilData}
          >
            <Text style={styles.buttonText}>
              Muat ulang
            </Text>
          </Pressable>

          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>
              Gagal memuat
            </Text>

            <Text style={styles.errorText}>
              Gagal memuat data pengeluaran
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>

        <Text style={styles.title}>
          Daftar pengeluaran
        </Text>

        <Pressable
          style={styles.button}
          onPress={bukaTambah}
        >
          <Text style={styles.buttonText}>
            Tambah pengeluaran
          </Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={ambilData}
        >
          <Text style={styles.buttonText}>
            Muat ulang
          </Text>
        </Pressable>

        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={
            items.length === 0
              ? styles.emptyList
              : styles.list
          }
          renderItem={({ item }) => (
            <View style={styles.card}>

              <Text style={styles.cardTitle}>
                {item.judul}
              </Text>

              <Text style={styles.cardText}>
                {formatTanggal(item.tanggal)}
              </Text>

              <Text style={styles.cardText}>
                {item.kategori || 'Tanpa kategori'}
              </Text>

              <Text style={styles.cardText}>
                Rp {formatRupiah(item.nominal)}
              </Text>

              <Pressable
                onPress={() => bukaDetail(item.id)}
              >
                <Text style={styles.detailText}>
                  Lihat detail
                </Text>
              </Pressable>

            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                Belum ada pengeluaran
              </Text>
            </View>
          }
        />

      </View>
    );
  }

  // ============================================================
  // FRAME 02 - TAMBAH KOSONG
  // ============================================================

  if (screen === 'add') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={styles.title}>
            Tambah pengeluaran
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => {
              resetForm();
              setScreen('list');
            }}
          >
            <Text style={styles.buttonText}>
              Kembali
            </Text>
          </Pressable>

          <Text style={styles.label}>
            Judul
          </Text>

          <TextInput
            value={judul}
            onChangeText={setJudul}
            placeholder="Masukan Judul"
            placeholderTextColor="#64748B"
            style={[
              styles.input,
              formError && !judul.trim()
                ? styles.inputError
                : null,
            ]}
          />

          {formError && !judul.trim() && (
            <Text style={styles.validationText}>
              Judul wajib diisi
            </Text>
          )}

          <Text style={styles.label}>
            Nominal rupiah
          </Text>

          <TextInput
            value={nominal}
            onChangeText={setNominal}
            placeholder="Masukan Nominal"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            style={[
              styles.input,
              formError &&
              (!nominal || Number(nominal) < 1)
                ? styles.inputError
                : null,
            ]}
          />

          {formError &&
            (!nominal || Number(nominal) < 1) && (
              <Text style={styles.validationText}>
                Nominal harus positif
              </Text>
            )}

          <Text style={styles.label}>
            Kategori opsional
          </Text>

          <Pressable
            style={styles.input}
            onPress={bukaKategori}
          >
            <Text
              style={{
                color: kategori
                  ? '#475569'
                  : '#64748B',
              }}
            >
              {kategori
                ? kategori.nama
                : 'Pilih Kategori'}
            </Text>
          </Pressable>

          <View style={styles.formBottom}>

            <Text style={styles.serverText}>
              Tanggal otomatis dari server
            </Text>

            <Pressable
              style={styles.button}
              onPress={simpanPengeluaran}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                Simpan
              </Text>
            </Pressable>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  // FRAME 03 - PILIH KATEGORI
  // ============================================================

  if (screen === 'category') {
    return (
      <View style={styles.formContainer}>

        <Text style={styles.title}>
          Pilih kategori
        </Text>

        <Text style={styles.subtitle}>
          Pilih kategori untuk pengeluaranmu
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => setScreen('add')}
        >
          <Text style={styles.buttonText}>
            Kembali
          </Text>
        </Pressable>

        {loadingKategori ? (
          <View style={styles.categoryLoading}>
            <ActivityIndicator />
          </View>
        ) : (
          <ScrollView
            style={{ marginTop: 16 }}
            showsVerticalScrollIndicator={false}
          >

            {/* Tanpa kategori */}
            <Pressable
              style={styles.categoryItem}
              onPress={() =>
                pilihKategori({
                  id: null,
                  nama: 'Tanpa kategori',
                })
              }
            >
              <View style={styles.radio} />

              <Text style={styles.categoryText}>
                Tanpa kategori
              </Text>
            </Pressable>

            {categories.map((item) => (
              <Pressable
                key={String(item.id)}
                style={styles.categoryItem}
                onPress={() =>
                  pilihKategori(item)
                }
              >
                <View
                  style={[
                    styles.radio,
                    kategori?.id === item.id
                      ? styles.radioSelected
                      : null,
                  ]}
                />

                <Text style={styles.categoryText}>
                  {item.nama}
                </Text>
              </Pressable>
            ))}

          </ScrollView>
        )}

        <View style={styles.bottomFixed}>
          <Pressable
            style={styles.button}
            onPress={() => setScreen('add')}
          >
            <Text style={styles.buttonText}>
              Pilih kategori
            </Text>
          </Pressable>
        </View>

      </View>
    );
  }

  // ============================================================
  // FRAME 04 - TAMBAH TERISI
  // ============================================================

  if (screen === 'add-filled') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >

          <Text style={styles.title}>
            Tambah pengeluaran
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => setScreen('add')}
          >
            <Text style={styles.buttonText}>
              Kembali
            </Text>
          </Pressable>

          <Text style={styles.label}>
            Judul
          </Text>

          <TextInput
            value={judul}
            onChangeText={setJudul}
            placeholder="Masukan Judul"
            placeholderTextColor="#64748B"
            style={styles.input}
          />

          <Text style={styles.label}>
            Nominal rupiah
          </Text>

          <TextInput
            value={nominal}
            onChangeText={setNominal}
            placeholder="Masukan Nominal"
            placeholderTextColor="#64748B"
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>
            Kategori opsional
          </Text>

          <Pressable
            style={styles.input}
            onPress={bukaKategori}
          >
            <Text style={styles.inputText}>
              {kategori
                ? kategori.nama
                : 'Pilih Kategori'}
            </Text>
          </Pressable>

          <View style={styles.formBottom}>

            <Text style={styles.serverText}>
              Tanggal otomatis dari server
            </Text>

            <Pressable
              style={styles.button}
              onPress={simpanPengeluaran}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                Simpan
              </Text>
            </Pressable>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  // FRAME 05 - ERROR VALIDASI
  // ============================================================

  if (screen === 'form-error') {
    return null;
  }

  // ============================================================
  // FRAME 06 - MENYIMPAN
  // ============================================================

  if (screen === 'saving') {
    return (
      <View style={styles.formContainer}>

        <Text style={styles.title}>
          Tambah pengeluaran
        </Text>

        <Pressable
          style={styles.button}
          disabled
        >
          <Text style={styles.buttonText}>
            Kembali
          </Text>
        </Pressable>

        <Text style={styles.label}>
          Judul
        </Text>

        <View style={styles.inputDisabled}>
          <Text style={styles.inputText}>
            {judul}
          </Text>
        </View>

        <Text style={styles.label}>
          Nominal rupiah
        </Text>

        <View style={styles.inputDisabled}>
          <Text style={styles.inputText}>
            Rp. {formatRupiah(nominal)}
          </Text>
        </View>

        <Text style={styles.label}>
          Kategori opsional
        </Text>

        <View style={styles.inputDisabled}>
          <Text style={styles.inputText}>
            {kategori?.nama || 'Tanpa kategori'}
          </Text>
        </View>

        <View style={styles.formBottom}>

          <Text style={styles.serverText}>
            Tanggal otomatis dari server
          </Text>

          <View style={styles.buttonDisabled}>
            <ActivityIndicator color="#64748B" />

            <Text style={styles.savingText}>
              Menyimpan...
            </Text>
          </View>

        </View>

      </View>
    );
  }

  // ============================================================
  // FRAME 08 - DETAIL
  // ============================================================

  if (screen === 'detail') {
    if (loadingDetail) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Memuat detail...
          </Text>
        </View>
      );
    }

    if (detailError || !detail) {
      return (
        <View style={styles.container}>

          <Text style={styles.title}>
            Daftar pengeluaran
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => setScreen('list')}
          >
            <Text style={styles.buttonText}>
              Kembali
            </Text>
          </Pressable>

          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              Data tidak ditemukan
            </Text>
          </View>

        </View>
      );
    }

    return (
      <View style={styles.formContainer}>

        <Text style={styles.title}>
          Detail Pengeluaran
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => setScreen('list')}
        >
          <Text style={styles.buttonText}>
            Kembali
          </Text>
        </Pressable>

        <View style={styles.detailCard}>

          <View style={styles.detailTopRow}>

            <Text style={styles.detailTitle}>
              {detail.judul}
            </Text>

            <Text style={styles.detailDate}>
              {formatTanggal(detail.tanggal)}
            </Text>

          </View>

          <Text style={styles.detailInfo}>
            Rp. {formatRupiah(detail.nominal)}
          </Text>

          <Text style={styles.detailInfo}>
            ID Kategori{' '}
            {detail.id_kategori ?? '-'}
          </Text>

          <Text style={styles.detailInfo}>
            Catatan
          </Text>

          <Text style={styles.detailNote}>
            {detail.catatan || 'Belum ada catatan'}
          </Text>

        </View>

        <View style={styles.detailButtons}>

          <Pressable
            style={styles.button}
            onPress={bukaEdit}
          >
            <Text style={styles.buttonText}>
              Edit
            </Text>
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={bukaKonfirmasiHapus}
          >
            <Text style={styles.buttonText}>
              Hapus
            </Text>
          </Pressable>

        </View>

      </View>
    );
  }

  // ============================================================
  // FRAME 09 - EDIT
  // ============================================================

  if (screen === 'edit') {
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
        >

          <Text style={styles.title}>
            Edit Pengeluaran
          </Text>

          <Pressable
            style={styles.button}
            onPress={() => setScreen('detail')}
          >
            <Text style={styles.buttonText}>
              Kembali
            </Text>
          </Pressable>

          <Text style={styles.label}>
            Judul
          </Text>

          <TextInput
            value={editJudul}
            onChangeText={setEditJudul}
            style={styles.input}
          />

          <Text style={styles.label}>
            Nominal rupiah
          </Text>

          <TextInput
            value={editNominal}
            onChangeText={setEditNominal}
            keyboardType="numeric"
            style={styles.input}
          />

          <Text style={styles.label}>
            Kategori opsional
          </Text>

          <View style={styles.input}>
            <Text style={styles.inputText}>
              {detail?.kategori || 'Tanpa kategori'}
            </Text>
          </View>

          <View style={styles.formBottom}>

            <Text style={styles.serverText}>
              Tanggal otomatis dari server
            </Text>

            <Pressable
              style={
                saving
                  ? styles.buttonDisabled
                  : styles.button
              }
              onPress={simpanEdit}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#64748B" />
              ) : (
                <Text style={styles.buttonText}>
                  Simpan
                </Text>
              )}
            </Pressable>

          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ============================================================
  // FRAME 11 - KONFIRMASI HAPUS
  // ============================================================

  if (screen === 'delete-confirm') {
    return (
      <View style={styles.deleteContainer}>

        <Text style={styles.deleteTitle}>
          Konfigurasi Hapus
        </Text>

        <View style={styles.confirmBox}>

          <Text style={styles.confirmText}>
            Apakah kamu yakin ingin
            menghapus data ini?
          </Text>

          <Text style={styles.confirmItem}>
            “{detail?.judul}”
          </Text>

        </View>

        <View style={styles.deleteButtons}>

          <Pressable
            style={styles.button}
            onPress={() => setScreen('detail')}
          >
            <Text style={styles.buttonText}>
              Batal
            </Text>
          </Pressable>

          <Pressable
            style={
              saving
                ? styles.buttonDisabled
                : styles.button
            }
            onPress={konfirmasiHapus}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#64748B" />
            ) : (
              <Text style={styles.buttonText}>
                Hapus
              </Text>
            )}
          </Pressable>

        </View>

      </View>
    );
  }

  // ============================================================
  // DEFAULT
  // ============================================================

  return (
    <View style={styles.loadingContainer}>
      <Text>Memuat aplikasi...</Text>
    </View>
  );
}


// ============================================================
// HELPER
// ============================================================

function formatRupiah(value) {
  const number = Number(value) || 0;

  return number.toLocaleString('id-ID');
}

function formatTanggal(value) {
  if (!value) {
    return '-';
  }

  // Jika format YYYY-MM-DD
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    return `${match[3]}/${match[2]}/${match[1]}`;
  }

  return String(value);
}


// ============================================================
// STYLE
// ============================================================

const styles = StyleSheet.create({

  // =========================
  // CONTAINER
  // =========================

  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 70,
  },

  formContainer: {
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 70,
    paddingBottom: 20,
  },

  deleteContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingTop: 70,
  },

  // =========================
  // TITLE
  // =========================

  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 16,
  },

  subtitle: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: -12,
    marginBottom: 8,
  },

  // =========================
  // BUTTON
  // =========================

  button: {
    minHeight: 48,
    backgroundColor: '#0F766E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 8,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  buttonDisabled: {
    minHeight: 48,
    backgroundColor: '#CBD5E1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  // =========================
  // CARD
  // =========================

  list: {
    paddingTop: 8,
    paddingBottom: 20,
  },

  card: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },

  cardText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 6,
  },

  detailText: {
    fontSize: 11,
    color: '#475569',
    textAlign: 'right',
    marginTop: 2,
  },

  // =========================
  // FORM
  // =========================

  label: {
    fontSize: 12,
    color: '#475569',
    marginTop: 14,
    marginBottom: 6,
  },

  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    color: '#0F172A',
  },

  inputDisabled: {
    minHeight: 48,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },

  inputText: {
    color: '#475569',
    fontSize: 13,
  },

  inputError: {
    borderColor: '#B91C1C',
  },

  validationText: {
    color: '#B91C1C',
    fontSize: 10,
    marginTop: 3,
  },

  serverText: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 8,
  },

  formBottom: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingTop: 30,
  },

  // =========================
  // CATEGORY
  // =========================

  categoryItem: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryText: {
    color: '#0F172A',
    fontSize: 13,
    marginLeft: 10,
  },

  radio: {
    width: 14,
    height: 14,
    borderWidth: 1,
    borderColor: '#94A3B8',
    borderRadius: 7,
  },

  radioSelected: {
    borderWidth: 4,
    borderColor: '#0F766E',
  },

  categoryLoading: {
    marginTop: 30,
    alignItems: 'center',
  },

  bottomFixed: {
    marginTop: 'auto',
    paddingTop: 10,
  },

  // =========================
  // DETAIL
  // =========================

  detailCard: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },

  detailTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },

  detailDate: {
    fontSize: 11,
    color: '#64748B',
  },

  detailInfo: {
    fontSize: 12,
    color: '#475569',
    marginTop: 7,
  },

  detailNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },

  detailButtons: {
    marginTop: 'auto',
    paddingBottom: 20,
  },

  // =========================
  // DELETE
  // =========================

  deleteTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'left',
    marginBottom: 16,
  },

  confirmBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 30,
    marginTop: 150,
    alignItems: 'center',
  },

  confirmText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },

  confirmItem: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },

  deleteButtons: {
    marginTop: 'auto',
    paddingBottom: 20,
  },

  // =========================
  // LOADING
  // =========================

  loadingContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: '#475569',
    fontSize: 13,
  },

  savingText: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },

  // =========================
  // ERROR
  // =========================

  errorBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 20,
    marginTop: 100,
    alignItems: 'center',
  },

  errorTitle: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 5,
  },

  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    textAlign: 'center',
  },

  // =========================
  // EMPTY
  // =========================

  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  emptyBox: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },

  emptyText: {
    color: '#475569',
    fontSize: 12,
  },
});