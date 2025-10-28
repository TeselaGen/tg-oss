# CLAUDE.md - Guía de Comprensión del Proyecto TG-OSS

## 🎯 ¿Qué es este Proyecto?

Este es **tg-oss** (Teselagen Open Source), un **monorepo** que contiene herramientas para editar y visualizar secuencias de ADN/proteínas. El componente principal es **OVE (Open Vector Editor)** - un editor visual de vectores genéticos construido con React y Redux.

## 📦 Estructura del Monorepo

El proyecto está organizado en packages bajo `/packages`:

### Packages Principales:

1. **@teselagen/ove** - Editor visual de secuencias DNA/AA (el componente más importante)

   - DEMO: https://teselagen.github.io/tg-oss/ove
   - PATH: `packages/ove`
   - Construido con React & Redux
   - Permite ver/manipular secuencias de DNA y proteínas

2. **@teselagen/ui** - Componentes React reutilizables

   - DEMO: https://teselagen.github.io/tg-oss/ui
   - PATH: `packages/ui`

3. **@teselagen/bio-parsers** - Parsers para formatos biológicos

   - PATH: `packages/bio-parsers`
   - Formatos: genbank, fasta, json, snapgene, geneious, jbei-xml

4. **@teselagen/sequence-utils** - Utilidades para secuencias biológicas

   - PATH: `packages/sequence-utils`

5. **@teselagen/range-utils** - Utilidades para rangos biológicos

   - PATH: `packages/range-utils`

6. **@teselagen/file-utils** - Utilidades para archivos y blobs

   - PATH: `packages/file-utils`

7. **Otros packages**: bounce-loader, shared-demo, uploader

## 🚀 Cómo Correr el Proyecto

### Pre-requisitos

- Node.js >= v18 (configurado: 18.18.0 en volta)
- Yarn >= 1.22.21
- NX CLI (se instala con las dependencias)

### Setup Inicial

```bash
# 1. Instalar dependencias
yarn

# 2. Correr el editor OVE (principal)
nx run ove:start
# Navega a: http://127.0.0.1:8805 (o el puerto que indique)

# 3. Correr UI demo
nx run ui:start
```

### Comandos NX Útiles

El proyecto usa **NX** para gestionar tareas y cache:

```bash
# Correr un comando específico de un package
nx run <package-name>:<command>

# Ejemplos:
nx run ove:start          # Iniciar demo de OVE
nx run ui:start           # Iniciar demo de UI
nx run ove:build          # Compilar OVE
nx run ove:launch-e2e     # Correr tests de Cypress

# Correr comando en múltiples packages
nx run-many --target:build
nx run-many --target:test
```

### Tests

```bash
# Tests unitarios (desde root)
bun test

# Tests E2E con Cypress
nx run ove:launch-e2e
nx run ui:launch-e2e
```

## 🏗️ Arquitectura del Proyecto

### Tecnologías

- **Build Tool**: Vite (vite.config.ts, vite.react.config.ts)
- **Monorepo**: NX (nx.json)
- **Package Manager**: Yarn Workspaces
- **Testing**: Bun (unit tests) + Cypress (e2e)
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

### Estructura de Archivos

```
tg-oss/
├── packages/           # Todos los packages del monorepo
│   ├── ove/           # Editor principal
│   ├── ui/            # Componentes UI
│   ├── bio-parsers/   # Parsers de archivos bio
│   └── ...
├── example-demos/     # Ejemplos de uso
├── docs/              # Documentación
├── nx.json            # Configuración NX
├── package.json       # Dependencies root
├── tsconfig.base.json # TypeScript config
└── vite.config.ts     # Vite config
```

## 🔧 Desarrollo

### Flujo de Trabajo

1. Fork del repositorio
2. `yarn` para instalar dependencias
3. Modificar código
4. Agregar demos/tests si es necesario
5. Correr tests: `nx run ove:launch-e2e`
6. Pull request mencionando @tnrich

### Publicación de Packages

```bash
# Publicar un package
nx run ui:publish
nx run ove:publish

# Publicar versión beta
nx run ui:publish-beta

# Publicar múltiples
nx run-many --target=publish --projects=bio-parsers,ove,sequence-utils,ui
```

## 📝 Características Clave de OVE

### Uso en React

```jsx
import { Editor, SimpleCircularOrLinearView } from "@teselagen/ove"

// Editor completo (requiere setup de Redux store)
<Editor {...editorProps}/>

// Vista simple sin Redux
<SimpleCircularOrLinearView
  sequenceData={{
    circular: true,
    sequence: "gagagagag",
    features: [{ id: "feat1", name: "Feature" }]
  }}
/>
```

### Uso Universal (sin React)

```html
<link rel="stylesheet" href="https://unpkg.com/@teselagen/ove/style.css" />
<script src="https://unpkg.com/@teselagen/ove/index.umd.js"></script>
<script>
  const editor = window.createVectorEditor(domNode, editorProps);
  editor.updateEditor(editorState);
</script>
```

### Datos que Maneja

- Secuencias de DNA y Proteínas
- Features (características genéticas)
- Parts (partes de construcción)
- Primers (cebadores)
- Cutsites (sitios de corte)
- ORFs (marcos de lectura)
- Translations (traducciones)
- Alignments (alineamientos)

## 🔗 Links Importantes

- **Demo OVE**: https://teselagen.github.io/tg-oss/ove/#/Editor
- **Demo UI**: https://teselagen.github.io/tg-oss/ui
- **Desktop App**: https://github.com/teselagen/ove-electron
- **Cypress Dashboard**: https://dashboard.cypress.io/#/projects/1zj5vc/runs
- **Repo Demo React**: https://github.com/tnrich/ove-react-demo-repo

## 🤝 Filosofía del Repo

- **Monorepo** con múltiples packages bajo `/packages`
- **Dos tipos de packages**:
  - Utils packages (solo utilidades)
  - UI packages (con demo y tests e2e)
- Config files de cada package extienden del root
- NX cachea resultados para builds eficientes
- Pre-commit hooks corren tests automáticamente

## 📄 Licencia

MIT License

## 🐛 Issues y Contribuciones

Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para guía completa de contribución.

---

**Nota**: Este proyecto tiene front y back corriendo en otra parte. Este repositorio es específicamente para el **editor de secuencias genéticas** que se puede integrar en otras aplicaciones.
