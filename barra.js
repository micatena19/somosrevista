// Barra de anuncios que se muestra arriba de las notas.
function barraAnuncio() {
  const cont = document.getElementById('barra-anuncio');
  if (!cont) return;
  const ROTACION_MS = 2500; // cada cuántos milisegundos cambia de anuncio (2500 = 2,5 segundos)
  const e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  (async () => {
    let a = [];
    try { a = await (await fetch('data/anuncios.json?v=' + Date.now())).json(); } catch (x) {}
    const hoy = new Date().toLocaleDateString('en-CA');
    const dd = x => String(x.donde || '').toLowerCase();
    const enBarra = x => !dd(x) || dd(x).includes('barra') || dd(x) === 'ambos';
    a = a.filter(x => x.activo && enBarra(x) && (x.titulo || x.imagen) && (!x.hasta || String(x.hasta).slice(0, 10) >= hoy));
    if (!a.length) return;
    const clave = a.map(x => (x.titulo || '') + (x.imagen || '')).join('|');
    try { if (sessionStorage.getItem('somos-barra') === clave) return; } catch (x) {}
    const slide = (x, i) => {
      const dentro = `${x.imagen ? `<img src="${e(x.imagen)}" alt="">` : ''}<span class="barra-txt"><b>${e(x.titulo)}</b> ${e(x.texto)}</span>${x.enlace ? `<span class="barra-btn">${e(x.boton || 'Más información')} →</span>` : ''}`;
      return x.enlace ? `<a class="barra-slide${i ? '' : ' on'}" href="${e(x.enlace)}" target="_blank" rel="noopener">${dentro}</a>` : `<div class="barra-slide${i ? '' : ' on'}">${dentro}</div>`;
    };
    cont.innerHTML = `<div class="barra"><span class="barra-tag">Anuncio</span><div class="barra-slides">${a.map(slide).join('')}</div><button class="barra-x" aria-label="Cerrar anuncio">×</button></div>`;
    const barra = cont.querySelector('.barra'), sl = [...cont.querySelectorAll('.barra-slide')];
    let i = 0, t;
    if (sl.length > 1) t = setInterval(() => { i = (i + 1) % sl.length; sl.forEach((s, k) => s.classList.toggle('on', k === i)); }, ROTACION_MS);
    cont.querySelector('.barra-x').onclick = () => { clearInterval(t); barra.remove(); try { sessionStorage.setItem('somos-barra', clave); } catch (x) {} };
  })();
}
