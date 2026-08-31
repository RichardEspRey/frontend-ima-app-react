# 0001 — No usar un proveedor de identidad externo

**Fecha:** 2026-08-31 · **Estado:** aceptada

## Contexto

La API PHP de IMA no autentica: la identidad del usuario es un `id_usuario` entero que
manda el cliente en cada POST. No hay sesión, cookie ni token. Adivinar el id de un admin
—un entero chico— basta para pasar cualquier validación de rol con un `curl`.

Se evaluó contratar Auth0, Clerk o Firebase Auth.

## Decisión

No se contrata un proveedor de identidad externo. Cuando llegue la fase 2, `Auth.php`
emitirá un token propio (JWT firmado o token opaco en una tabla `sessions`).

## Razones

1. **El trabajo real está en el backend, no en el login.** Un IdP emite un token, pero
   alguien tiene que verificarlo en los 36 endpoints PHP. Ese trabajo hay que hacerlo
   igual, con o sin proveedor. Si hay que hacerlo igual, emitir el token desde `Auth.php`
   cuesta prácticamente lo mismo.
2. **Rompería la app móvil.** Consume los mismos endpoints y su código no vive en este
   repo. Migrar la identidad obliga a migrar la móvil el mismo día.
3. **No hay caso de uso que lo justifique.** No hay registro público, ni login social, ni
   SSO corporativo, ni multi-tenant. Son decenas de usuarios internos.

## Consecuencias

- La fase 2 incluye emitir y verificar tokens en PHP, coordinado con la app móvil.
- El frontend construye la costura ahora: `shared/auth/authService.js` es el único archivo
  que sabe cómo se obtiene y se adjunta la identidad. Cambiar de mecanismo será un archivo.
- Lo bueno de un IdP —expiración, revocación, hash fuerte, bitácora— se implementa a mano.
  Es una tabla y unas líneas de PHP, no un proyecto.
