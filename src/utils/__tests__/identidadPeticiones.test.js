import { describe, it, expect } from 'vitest';
import { conIdentidad } from '../identidadPeticiones';

const API = 'http://imaexpressllc.com/API';
const conf = { apiHost: API, usuarioId: 14, app: 'Desktop 1.6.0' };

describe('conIdentidad', () => {
  it('agrega usuario y app a un formulario, sin tocar el original', () => {
    const fd = new FormData();
    fd.append('op', 'desuscribir');
    fd.append('user_id', '18');

    const nuevas = conIdentidad(`${API}/Notifications.php`, { method: 'POST', body: fd }, conf);

    expect(nuevas.body.get('_usuario')).toBe('14');
    expect(nuevas.body.get('_app')).toBe('Desktop 1.6.0');
    expect(nuevas.body.get('user_id')).toBe('18');
    expect(fd.has('_usuario')).toBe(false);
  });

  it('agrega los campos a un cuerpo de texto op=…', () => {
    const nuevas = conIdentidad(`${API}/formularios.php`, { method: 'POST', body: 'op=getAll_diesel' }, conf);
    expect(nuevas.body).toBe('op=getAll_diesel&_app=Desktop%201.6.0&_usuario=14');
  });

  it('no repite un campo que la pantalla ya mandó', () => {
    const fd = new FormData();
    fd.append('op', 'x');
    fd.append('_usuario', '99');
    expect(conIdentidad(`${API}/a.php`, { body: fd }, conf).body.getAll('_usuario')).toEqual(['99']);
  });

  it('sin sesión manda la app pero no el usuario', () => {
    const fd = new FormData();
    fd.append('op', 'new_login');
    const nuevas = conIdentidad(`${API}/Auth.php`, { body: fd }, { ...conf, usuarioId: undefined });
    expect(nuevas.body.has('_usuario')).toBe(false);
    expect(nuevas.body.get('_app')).toBe('Desktop 1.6.0');
  });

  it('no toca peticiones que no son de la API', () => {
    const opciones = { body: 'op=x' };
    expect(conIdentidad('https://api.dolar.mx/tipo', opciones, conf)).toBe(opciones);
    expect(conIdentidad('https://nominatim.openstreetmap.org/x', opciones, conf)).toBe(opciones);
  });

  it('no toca peticiones sin cuerpo ni cuerpos que no son formulario', () => {
    const sinCuerpo = { method: 'GET' };
    expect(conIdentidad(`${API}/Tracking.php`, sinCuerpo, conf)).toBe(sinCuerpo);
    expect(conIdentidad(`${API}/Tracking.php`, undefined, conf)).toBeUndefined();
    const json = { body: JSON.stringify({ a: 1 }) };
    expect(conIdentidad(`${API}/x.php`, json, conf)).toBe(json);
  });

  it('también con URLSearchParams', () => {
    const nuevas = conIdentidad(`${API}/x.php`, { body: new URLSearchParams({ op: 'save' }) }, conf);
    expect(nuevas.body.get('_usuario')).toBe('14');
  });
});
