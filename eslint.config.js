import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import boundaries from 'eslint-plugin-boundaries'
import jsdoc from 'eslint-plugin-jsdoc'

const CAPAS = ['app', 'pages', 'features', 'entities', 'shared']

const ZONA_REFACTORIZADA = [
  'src/shared/**/*.{js,jsx}',
  'src/entities/**/*.{js,jsx}',
  'src/features/**/*.{js,jsx}',
  'src/pages/**/*.{js,jsx}',
  'src/app/**/*.{js,jsx}',
]

const reglasJsdoc = {
  'jsdoc/require-jsdoc': ['error', {
    publicOnly: true,
    require: {
      FunctionDeclaration: true,
      ArrowFunctionExpression: true,
      FunctionExpression: true,
      ClassDeclaration: true,
    },
  }],
  'jsdoc/require-description': 'error',
  'jsdoc/require-param': 'error',
  'jsdoc/require-param-description': 'error',
  'jsdoc/require-param-name': 'error',
  'jsdoc/require-returns': 'error',
  'jsdoc/require-returns-description': 'error',
  'jsdoc/check-param-names': 'error',
  'jsdoc/check-tag-names': ['error', { definedTags: ['endpoint'] }],
  'jsdoc/check-alignment': 'error',
  'jsdoc/no-undefined-types': 'off',
}

export default [
  // src/no-usadas es código congelado: no se toca, así que tampoco se le
  // exige el estándar nuevo. Si alguna de esas pantallas vuelve a la vida,
  // sale de aquí y se migra como las demás.
  { ignores: ['dist', 'release', 'docs/api', 'node_modules', 'src/no-usadas'] },

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      jsdoc,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-restricted-syntax': ['error',
        {
          selector: 'JSXAttribute[name.name="dangerouslySetInnerHTML"]',
          message: 'Prohibido: es la vía de XSS. Renderiza el contenido como texto.',
        },
        {
          selector: 'MemberExpression[property.name="innerHTML"]',
          message: 'Prohibido: es la vía de XSS. Usa textContent o React.',
        },
      ],
    },
  },

  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { boundaries },
    settings: {
      'boundaries/include': ['src/**/*.{js,jsx}'],
      'boundaries/elements': CAPAS.map((capa) => ({
        type: capa,
        pattern: `src/${capa}/*`,
        capture: ['slice'],
      })),
    },
    rules: {
      'boundaries/dependencies': ['warn', {
        default: 'disallow',
        policies: [
          {
            from: { element: { type: 'app' } },
            allow: { to: { element: { types: { anyOf: ['pages', 'features', 'entities', 'shared'] } } } },
          },
          {
            from: { element: { type: 'pages' } },
            allow: { to: { element: { types: { anyOf: ['features', 'entities', 'shared'] } } } },
          },
          {
            from: { element: { type: 'features' } },
            allow: { to: { element: { types: { anyOf: ['entities', 'shared'] } } } },
          },
          {
            // Se permite entities -> entities a propósito. `payroll` y `personal`
            // comparten vocabulario del dominio de nómina (tipo de nómina,
            // frecuencia de pago); prohibirlo obligaría a duplicar esas verdades
            // en dos sitios, que es peor que el acoplamiento que evita. Es la
            // misma relajación que contempla FSD con su notación `@x`.
            from: { element: { type: 'entities' } },
            allow: { to: { element: { types: { anyOf: ['entities', 'shared'] } } } },
          },
          {
            from: { element: { type: 'shared' } },
            allow: { to: { element: { type: 'shared' } } },
          },
        ],
      }],
    },
  },

  // Controles con aspecto propio: el aspecto vive en un componente, no en una
  // guía que alguien tiene que recordar.
  //
  // Las pestañas y los selectores de filtro existían con cuatro aspectos
  // distintos repartidos por la app, y el que el equipo quería estaba copiado a
  // mano en algunas pantallas. Escribir la regla en la documentación no evitó
  // ninguna de esas copias; esto sí, porque falla antes de llegar a revisión.
  //
  // `shared/ui` queda fuera: es justo donde vive la única implementación.
  {
    files: ['src/**/*.{js,jsx}'],
    ignores: ['src/shared/ui/**', 'src/no-usadas/**'],
    rules: {
      'no-restricted-imports': ['error', {
        paths: [{
          name: '@mui/material',
          importNames: ['Tabs', 'Tab', 'ToggleButtonGroup', 'ToggleButton'],
          message:
            'Usa <Pestanas> o <Selector> de shared/ui. Si te falta una capacidad, ' +
            'agrégasela al componente compartido en vez de armar el control aquí.',
        }],
      }],
    },
  },

  {
    files: ZONA_REFACTORIZADA,
    rules: reglasJsdoc,
  },

  {
    files: ['src/**/*.{js,jsx}'],
    ignores: [...ZONA_REFACTORIZADA, 'src/test/**', 'src/**/__tests__/**'],
    rules: Object.fromEntries(
      Object.entries(reglasJsdoc).map(([regla, valor]) => [
        regla,
        Array.isArray(valor) ? ['warn', ...valor.slice(1)] : (valor === 'off' ? 'off' : 'warn'),
      ]),
    ),
  },

  {
    files: ['src/test/**/*.{js,jsx}', 'src/**/__tests__/**/*.{js,jsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'boundaries/element-types': 'off',
    },
  },

  {
    files: ['**/*.cjs', 'preload.js'],
    languageOptions: { globals: { ...globals.node }, sourceType: 'commonjs' },
    rules: { 'jsdoc/require-jsdoc': 'off' },
  },

  {
    files: ['vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node }, sourceType: 'module' },
    rules: { 'jsdoc/require-jsdoc': 'off' },
  },
]
