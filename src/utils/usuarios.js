// "Driver" es la única categoría de chofer; cualquier otro tipo (Admin, Administrativo, etc.)
// se agrupa como Administradores, así los nombres inconsistentes en BD no rompen la división.
export const isDriver = (type) => String(type || '').trim().toLowerCase() === 'driver';
