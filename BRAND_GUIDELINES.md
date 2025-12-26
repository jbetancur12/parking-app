# Aparca Brand Guidelines 🎨

This document serves as the single source of truth for the **Aparca** visual identity within the codebase. All new UI changes, components, or pages **MUST** adhere to these guidelines to ensure consistency.

## 1. Color Palette

The application uses a custom Tailwind configuration. Always use these utility classes instead of hardcoded hex values.

| Color Name | Tailwind Class | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Brand Blue** | `*-brand-blue` | `#003B5C` | **Primary Brand Color**. Used for Main Headers, Sidebars, Primary Borders, Focus Rings, and Text emphasis. |
| **Brand Yellow** | `*-brand-yellow` | `#FFC72C` | **Accent/Action Color**. Used for Primary CTA Buttons, Highlights, and Focus states. |
| **Brand Green** | `*-brand-green` | `#00A859` | **Success/Positive Action**. Used for "Start Shift", "Income", "Confirm" buttons. |
| **Brand White** | `*-brand-white` | `#F8FAFC` | Backgrounds (off-white). |

### Semantic Colors
*   **Errors/Debts**: `text-red-600`, `bg-red-50`, `border-red-500`
*   **Success/Income**: `text-brand-green` (or `text-green-600`), `bg-green-50`
*   **Neutral/Text**: `text-gray-800` (Headings), `text-gray-600` (Body)

---

## 2. Typography

We use a dual-font system.

### Headers (`font-display`)
*   **Font Family**: `Montserrat`
*   **Usage**: Page Titles `<h1>`, Section Headers `<h2>`, Card Titles `<h3>`, Big Stats numbers.
*   **Class**: `font-display` (e.g., `font-display font-bold text-brand-blue`)

### Body (`font-sans`)
*   **Font Family**: `Inter` (Tailwind default)
*   **Usage**: Paragraphs, Table data, Form labels, Inputs.
*   **Class**: Default (no class needed, or `font-sans`)

---

## 3. Component Styles

### Buttons
Do not use default Tailwind blue buttons. Use semantic brand buttons.

*   **Primary Action (Yellow)**:
    ```jsx
    <button className="bg-brand-yellow text-brand-blue font-bold px-4 py-2 rounded-lg hover:bg-yellow-400 shadow-md transition-transform active:scale-95">
    ```

*   **Secondary/Info Action (Blue)**:
    ```jsx
    <button className="bg-brand-blue text-white font-bold px-4 py-2 rounded-lg hover:bg-blue-800 shadow-md">
    ```

*   **Positive Action (Green)**:
    ```jsx
    <button className="bg-brand-green text-white font-bold px-4 py-2 rounded-lg hover:bg-green-600">
    ```

### Tables
Use the "Clean Brand" style.

*   **Header**: `bg-brand-blue/5` background with `text-brand-blue` font.
*   **Rows**: `hover:bg-blue-50/50` for interactivity.
*   **Structure**: Rounded corners `rounded-lg`, `overflow-hidden`.

```jsx
<thead className="bg-brand-blue/5">
    <tr>
        <th className="px-6 py-4 text-left text-xs font-bold text-brand-blue uppercase tracking-wider">Title</th>
    </tr>
</thead>
```

### Forms & Inputs
Inputs should feel solid and use the brand blue for focus.

*   **Input Style**:
    ```jsx
    <input className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all" />
    ```

### Cards
*   **Standard Card**: `bg-white rounded-xl shadow-md border border-gray-100`
*   **Metric Card**: Add a left border for accent.
    ```jsx
    <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-brand-blue">
    ```

---

## 4. Logo Usage

*   **Light Backgrounds**: Use standard colored logo (`/LogoTexto.png`).
*   **Dark Backgrounds (Sidebar)**: Use **White** logo.
    *   *Implementation*: `<img src="/LogoTexto.png" className="brightness-0 invert" />`
*   **Favicon/Icons**: Use `Logo.png` (Symbol only).

---

## 5. CSS/Tailwind Config Reference

Ensure `tailwind.config.js` includes:

```js
theme: {
  extend: {
    colors: {
      brand: {
        blue: '#003B5C',
        yellow: '#FFC72C',
        green: '#00A859',
        white: '#F8FAFC',
      }
    },
    fontFamily: {
      display: ['Montserrat', 'sans-serif'],
    }
  }
}
```
