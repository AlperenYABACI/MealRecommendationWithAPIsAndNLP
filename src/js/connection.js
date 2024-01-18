const sql = require('mssql');

// Bağlantı konfigürasyonu
const config = {
  user: 'sa',
  password: '1327',
  server: 'localhost',
  database: 'bitirme_proj_yemek'
};

// Bağlantı fonksiyonu
const connectDB = async () => {
  try {
    // Bağlantı oluştur
    await sql.connect(config);
    console.log('SQL Server ile bağlantı başarılı.');

    // Sorguyu çalıştır
    const result = await sql.query('SELECT * FROM dbo.users');
    console.dir(result);

    // Bağlantıyı kapat
    await sql.close();
    console.log('Bağlantı kapatıldı.');
  } catch (err) {
    console.error('SQL Server bağlantı hatası:', err);
  }
};

// Bağlantıyı başlat
connectDB();
