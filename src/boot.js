/* The loading screen in index.html, driven from here. The car reports what
   it is doing (downloading, building shaders, warming up) and the bar follows
   it; when the car is ready to drive the screen fades and the page takes
   over. It never holds anyone for more than CAP, whatever the network does.
   Nothing here waits on animation frames, so it stays right in a tab the
   browser is throttling. */

const CAP = 15000;
let shown = 0, done = false;

const root = () => document.getElementById("boot");

function show(p, label) {
  const el = root();
  if (!el) return;
  if (label) el.querySelector(".l").textContent = label;
  el.querySelector(".bar i").style.transform = `scaleX(${p})`;
  el.querySelector(".p").textContent = `${Math.round(p * 100)}%`;
}

/** progress 0-1, and what is happening now */
export function bootProgress(p, label) {
  if (done) return;
  shown = Math.max(shown, Math.min(0.99, p));
  show(shown, label);
}

/** the car is ready (or is not coming): fade out and hand over */
export function bootDone() {
  if (done) return;
  done = true;
  show(1, "Ready");
  setTimeout(() => {
    document.documentElement.classList.remove("booting");
    window.dispatchEvent(new Event("boot:done"));
    const el = root();
    if (!el) return;
    el.classList.add("out");
    setTimeout(() => el.remove(), 800);
  }, 250);
}

bootProgress(0.04, "Starting up");
setTimeout(bootDone, CAP);
