const API_URL = 'http://192.168.110.43:3000';

export async function getPengeluaran() {
  const response = await fetch(`${API_URL}/pengeluaran`);

  if (!response.ok) {
    throw new Error('Gagal mengambil data pengeluaran');
  }

  return response.json();
}

export async function getPengeluaranById(id) {
  const response = await fetch(`${API_URL}/pengeluaran/${id}`);

  if (!response.ok) {
    throw new Error('Gagal mengambil detail pengeluaran');
  }

  return response.json();
}

export async function getKategori() {
  const response = await fetch(`${API_URL}/kategori`);

  if (!response.ok) {
    throw new Error('Gagal mengambil data kategori');
  }

  return response.json();
}

export async function tambahPengeluaran(data) {
  const response = await fetch(`${API_URL}/pengeluaran`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Gagal menambahkan pengeluaran');
  }

  return response.json();
}

export async function ubahPengeluaran(id, data) {
  const response = await fetch(`${API_URL}/pengeluaran/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Gagal mengubah pengeluaran');
  }

  return response.json();
}

export async function hapusPengeluaran(id) {
  const response = await fetch(`${API_URL}/pengeluaran/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Gagal menghapus pengeluaran');
  }
}