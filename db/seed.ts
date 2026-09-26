import { db } from './connection.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

async function seed() {
  // ── 1. Test şirketi ──────────────────────────────────────────
  const { rows: existing } = await db.query(
    `SELECT id FROM companies WHERE slug = 'test'`
  );

  let companyId: string;

  if (existing.length > 0) {
    companyId = existing[0].id;
    console.log('✓ Test şirketi zaten var:', companyId);
  } else {
    const { rows } = await db.query(
      `INSERT INTO companies (name, slug, plan, max_users, tax_number, contact_email, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      ['PDKS Test A.Ş.', 'test', 'starter', 50, '1234567890', 'info@pdkstest.com', '02121234567']
    );
    companyId = rows[0].id;

    // Şirket ayarları
    await db.query(
      `INSERT INTO settings (company_id, company_name) VALUES ($1, $2)`,
      [companyId, 'PDKS Test A.Ş.']
    );

    // Varsayılan mola kuralları
    await db.query(
      `INSERT INTO break_rules (company_id, threshold_hours, deduction_minutes) VALUES
       ($1, 4.0, 15), ($1, 7.5, 60)`,
      [companyId]
    );

    console.log('✓ Test şirketi oluşturuldu:', companyId);
  }

  // ── 2. Şirket admin kullanıcısı ──────────────────────────────
  const { rows: adminExisting } = await db.query(
    `SELECT id FROM users WHERE company_id = $1 AND personnel_id = 'admin'`,
    [companyId]
  );

  if (adminExisting.length > 0) {
    console.log('✓ Admin kullanıcı zaten var.');
  } else {
    const hash = await bcrypt.hash('admin123', 12);
    await db.query(
      `INSERT INTO users (company_id, personnel_id, password_hash, name, role)
       VALUES ($1, $2, $3, $4, $5)`,
      [companyId, 'admin', hash, 'Sistem Yöneticisi', 'admin']
    );
    console.log('✓ Şirket admin kullanıcısı oluşturuldu:');
    console.log('  Vergi No : 1234567890');
    console.log('  Personel ID: admin');
    console.log('  Şifre    : admin123');
  }

  // ── 3. SuperAdmin (sistemin tek süper yöneticisi) ─────────────
  const { rows: saExisting } = await db.query(
    `SELECT id FROM superadmins WHERE username = 'superadmin'`
  );

  if (saExisting.length > 0) {
    console.log('✓ SuperAdmin zaten var.');
  } else {
    const saPassword = process.env.SUPERADMIN_PASSWORD || 'superadmin123';
    const saHash = await bcrypt.hash(saPassword, 12);
    await db.query(
      `INSERT INTO superadmins (username, password_hash, name)
       VALUES ($1, $2, $3)`,
      ['superadmin', saHash, 'Süper Yönetici']
    );
    console.log('✓ SuperAdmin oluşturuldu:');
    console.log('  Kullanıcı adı: superadmin');
    console.log(`  Şifre        : ${saPassword}`);
    console.log('  ⚠️  .env dosyasındaki SUPERADMIN_PASSWORD değerini değiştir!');
  }

  await db.end();
  console.log('\n✅ Seed tamamlandı.');
}

seed().catch((err) => {
  console.error('Seed hatası:', err);
  process.exit(1);
});
