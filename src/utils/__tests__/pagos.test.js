import { describe, it, expect } from 'vitest';
import { paisesPermitidos } from '../pagos';

describe('paisesPermitidos', () => {
  it('el admin ve los dos', () => {
    expect(paisesPermitidos({ finanzas_pagos_us: false, finanzas_pagos_mx: false }, true)).toEqual(['US', 'MX']);
  });

  it('cada quien ve solo el país que tiene encendido', () => {
    expect(paisesPermitidos({ finanzas_pagos_us: true, finanzas_pagos_mx: false }, false)).toEqual(['US']);
    expect(paisesPermitidos({ finanzas_pagos_us: false, finanzas_pagos_mx: true }, false)).toEqual(['MX']);
    expect(paisesPermitidos({ finanzas_pagos_us: false, finanzas_pagos_mx: false }, false)).toEqual([]);
  });

  it('mientras los permisos no existan en el servidor, nadie pierde la pantalla', () => {
    expect(paisesPermitidos({ finanzas_pagos: true }, false)).toEqual(['US', 'MX']);
    expect(paisesPermitidos(undefined, false)).toEqual(['US', 'MX']);
  });
});
