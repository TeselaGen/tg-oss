Avoid opening the browser if ![alt text](image.png)possible, but if you do, use the following URLs to test the components:
http://localhost:8805/#/Editor
http://localhost:8805/#/ImportFeaturesDialog
...etc

# Dark Mode CSS Variables

This project uses CSS variables to handle dark mode. These variables are defined in `packages/ui/src/style.css` and are automatically updated when the `bp3-dark` class is applied to the `body` element.

## Available Variables

| Variable     | Light Mode             | Dark Mode               | Usage                                           |
| :----------- | :--------------------- | :---------------------- | :---------------------------------------------- |
| `--base1`    | `#ffffff` (White)      | `#393a3a` (Dark Gray)   | Primary background color                        |
| `--base2`    | `#cdcdcd` (Light Gray) | `#293742` (Darker Gray) | Secondary background or accent                  |
| `--base3`    | `#a1a3a5` (Gray)       | `#959697` (Medium Gray) | Borders or secondary text                       |
| `--reversed` | `#293742` (Dark Gray)  | `#cdcdcd` (Light Gray)  | High-contrast elements (opposite of background) |

## Best Practices

### 1. Use Variables Instead of Hardcoded Colors

Instead of hardcoding white or gray backgrounds, use the base variables. This ensures the component will look correct in both light and dark modes without extra CSS.

**Bad:**

```css
.my-component {
  background-color: #ffffff;
  border: 1px solid #cdcdcd;
}
```

**Good:**

```css
.my-component {
  background-color: var(--base1);
  border: 1px solid var(--base3);
}
```

**Best:**

- Don't use any extra styles if not needed

### 2. Scoping with `.bp3-dark`

If you need to apply specific styles ONLY in dark mode that cannot be handled by variables, use the `.bp3-dark` class.

```css
.bp3-dark .my-special-icon {
  filter: invert(1);
}
```

### 3. OVE-Specific Dark Mode

For Open Vector Editor (OVE) specific overrides, check `packages/ove/src/Editor/darkmode.css`. This file contains many specific overrides for SVG elements and editor components.

## Examples

### Card with Border

```css
.tg-card {
  background: var(--base1);
  border: 1px solid var(--base3);
  padding: 10px;
}
```

### High-Contrast Text/Icon

```css
.important-label {
  color: var(--reversed);
}
```
