# 💻 Nexus Pro 16 — 3D Interactive Laptop Shop & Customizer

An ultra-modern, interactive 3D Laptop Customizer and E-Commerce store built with **Three.js**, **WebGL**, and **Vanilla JavaScript**. 

Visitors can rotate the laptop **360°**, zoom in/out, animate the display lid **open and close**, switch body colors in real time, change screen wallpapers, and experience an interactive **Buy Now** checkout flow.

---

## 🌟 Features

* **🔄 360° Orbit Rotation & Zoom**: Smooth mouse drag rotation and scroll-to-zoom using Three.js `OrbitControls`.
* **💻 Interactive Lid Control**: Open and close the laptop display lid smoothly (0° to 120°) via a slider or quick preset buttons.
* **🎨 Real-Time Metallic Color Customizer**: Switch between 5 premium finishes:
  * *Space Black* (`#1b1c20`)
  * *Starlight Silver* (`#d6d8df`)
  * *Midnight Blue* (`#0f172a`)
  * *Rose Metallic* (`#c58b88`)
  * *Cyber Emerald* (`#043832`)
* **🖥️ Screen Wallpaper Switcher**: Dynamic HTML5 Canvas texturing for the 3D display panel (Cyber Code, Cosmic Nebula, Minimal OS).
* **📷 Preset Camera Angles**: Instant camera positioning for *Front*, *Keyboard*, *Side*, *Top*, and *Auto 360° Spin Mode*.
* **🛒 Interactive "Buy Now" Checkout**: Modal dialog with active configuration summary and purchase simulation.

---

## 🛠️ Technology Stack

* **Core**: HTML5, CSS3, JavaScript (ES6+ Modules)
* **3D Engine**: [Three.js](https://threejs.org/) (v0.160.0)
* **Controls**: Three.js OrbitControls
* **Icons & Fonts**: FontAwesome 6, Google Fonts (Outfit & Hind Siliguri)

---

## 🚀 How to Run Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/atiqur-rahman-pro/laptop-3d-shop.git
   cd laptop-3d-shop
   ```

2. **Start a local dev server:**
   ```bash
   npx serve .
   ```
   *or*
   ```bash
   npm start
   ```

3. **Open in browser:**  
   Navigate to `http://localhost:8080` (or `http://localhost:3000`)

---

## 🌐 Live GitHub Pages Deployment

To host this project for free on GitHub Pages:

1. Push code to your GitHub repo (`main` branch).
2. Go to **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, select **Deploy from a branch**.
4. Choose Branch: `main` / Folder: `/ (root)` and click **Save**.
5. Your live link will be:  
   `https://atiqur-rahman-pro.github.io/laptop-3d-shop/`

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
