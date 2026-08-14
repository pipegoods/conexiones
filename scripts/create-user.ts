/**
 * Creates or updates an internal admin account.
 *
 *   npm run create-user -- correo@ejemplo.com "Nombre Apellido" "contraseña" admin
 *
 * The role is optional and defaults to "operator". Existing accounts have their
 * name, password, and role updated, which also supports password resets.
 */
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

async function main() {
  const [email, name, password, role = 'operator'] = process.argv.slice(2);

  if (!email || !name || !password) {
    console.error('Uso: npm run create-user -- <correo> <"Nombre Apellido"> <contraseña> [admin|operator]');
    process.exit(1);
  }

  if (!['admin', 'operator'].includes(role)) {
    console.error(`Rol inválido: "${role}". Usa "admin" u "operator".`);
    process.exit(1);
  }

  if (password.length < 10) {
    console.error('La contraseña debe tener al menos 10 caracteres.');
    process.exit(1);
  }

  if (!process.env.DATABASE_URL) {
    console.error('Falta DATABASE_URL en .env.local');
    process.exit(1);
  }

  // Deferred import: these modules read DATABASE_URL at load time.
  const { db, users } = await import('../src/db');
  const { hashPassword } = await import('../src/lib/password');

  const passwordHash = await hashPassword(password);

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
    .limit(1);

  if (existing) {
    await db
      .update(users)
      .set({ name, passwordHash, role: role as 'admin' | 'operator', active: true })
      .where(sql`id = ${existing.id}`);
    console.log(`✔ Cuenta actualizada: ${email} (${role})`);
  } else {
    await db.insert(users).values({
      email,
      name,
      passwordHash,
      role: role as 'admin' | 'operator',
    });
    console.log(`✔ Cuenta creada: ${email} (${role})`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('No se pudo crear la cuenta:', error);
  process.exit(1);
});
