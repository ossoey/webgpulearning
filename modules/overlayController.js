// modules/overlayController.js
export class OverlayController {
  constructor({ sliderEl, valueEl, target = document.documentElement }) {
    this.sliderEl = sliderEl;
    this.valueEl = valueEl;
    this.target = target; // element that owns the CSS variable (root by default)

    // init from slider’s value
    this.setOpacity(parseFloat(this.sliderEl.value));

    // wire events
    this.sliderEl.addEventListener('input', () => {
      this.setOpacity(parseFloat(this.sliderEl.value));
    });
  }

  setOpacity(v) {
    // clamp defensively
    const val = Math.max(0, Math.min(1, isFinite(v) ? v : 0));
    this.target.style.setProperty('--overlay-opacity', String(val));
    if (this.valueEl) this.valueEl.textContent = val.toFixed(2);
  }
}
