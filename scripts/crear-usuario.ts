/**
 * Crea o actualiza una cuenta del panel interno.
 *
 *   npm run usuario -- correo@ejemplo.com "Nombre Apellido" "contraseña" admin
 *
 * El rol es opcional y por defecto es "operador". Si el correo ya existe, se
 * actualizan nombre, contraseña y rol (sirve para resetear una clave olvidada).
 */
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';

config({ path: '.env.local' });

async function main() {
  const [email, nombre, password, rol = 'operador'] = process.argv.slice(2);

  if (!email || !nombre || !password) {
    console.error('Uso: npm run usuario -- <correo> <"Nombre Apellido"> <contraseña> [admin|operador]');
    process.exit(1);
  }

  if (!['admin', 'operador'].includes(rol)) {
    console.error(`Rol inválido: "${rol}". Usa "admin" u "operador".`);
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

  // Importación diferida: estos módulos leen DATABASE_URL al cargarse.
  const { db, usuarios } = await import('../src/db');
  const { hashPassword } = await import('../src/lib/password');

  const passwordHash = await hashPassword(password);

  const [existente] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(sql`lower(${usuarios.email}) = ${email.toLowerCase()}`)
    .limit(1);

  if (existente) {
    await db
      .update(usuarios)
      .set({ nombre, passwordHash, rol: rol as 'admin' | 'operador', activo: true })
      .where(sql`id = ${existente.id}`);
    console.log(`✔ Cuenta actualizada: ${email} (${rol})`);
  } else {
    await db.insert(usuarios).values({
      email,
      nombre,
      passwordHash,
      rol: rol as 'admin' | 'operador',
    });
    console.log(`✔ Cuenta creada: ${email} (${rol})`);
  }

  process.exit(0);
}

main().catch((error) => {
  console.error('No se pudo crear la cuenta:', error);
  process.exit(1);
});
