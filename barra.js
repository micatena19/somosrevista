// Anuncios del sitio. Todo sale de data/anuncios.json (sección "Anuncios" del panel).
const _e = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

// Devuelve los anuncios activos, no vencidos, que van en ese lugar (si no se eligió ninguno, van en todos).
async function anunciosActivos(lugar) {
  let a = [];
  try { a = await (await fetch('data/anuncios.json?v=' + Date.now())).json(); } catch (x) {}
  const hoy = new Date().toLocaleDateString('en-CA');
  return a.filter(x => {
    if (!x.activo || !(x.titulo || x.imagen || x.logo)) return false;
    if (x.hasta && String(x.hasta).slice(0, 10) < hoy) return false;
    const d = [].concat(x.donde || []).join(' ').toLowerCase();
    return !d || d.includes(lugar);
  });
}

// Barra fija debajo del menú: se queda hasta que la persona la cierre con la cruz.
async function barraAnuncio() {
  const cont = document.getElementById('barra-anuncio');
  if (!cont) return;
  const ROTACION_MS = 2500; // 2500 = cambia de anuncio cada 2,5 segundos
  const a = await anunciosActivos('barra');
  if (!a.length) return;
  const clave = a.map(x => (x.titulo || '') + (x.imagen || '')).join('|');
  try { if (sessionStorage.getItem('somos-barra') === clave) return; } catch (x) {}
  const slide = (x, i) => {
    const dentro = `${x.imagen ? `<img src="${_e(x.imagen)}" alt="">` : ''}<span class="barra-txt"><b>${_e(x.titulo)}</b> ${_e(x.texto)}</span>${x.enlace ? `<span class="barra-btn">${_e(x.boton || 'Más información')} →</span>` : ''}`;
    return x.enlace ? `<a class="barra-slide${i ? '' : ' on'}" href="${_e(x.enlace)}" target="_blank" rel="noopener">${dentro}</a>` : `<div class="barra-slide${i ? '' : ' on'}">${dentro}</div>`;
  };
  cont.innerHTML = `<div class="barra"><span class="barra-tag">Anuncio</span><div class="barra-slides">${a.map(slide).join('')}</div><button class="barra-x" aria-label="Cerrar anuncio">×</button></div>`;
  const barra = cont.querySelector('.barra'), sl = [...cont.querySelectorAll('.barra-slide')];
  let i = 0, t;
  if (sl.length > 1) t = setInterval(() => { i = (i + 1) % sl.length; sl.forEach((s, k) => s.classList.toggle('on', k === i)); }, ROTACION_MS);
  cont.querySelector('.barra-x').onclick = () => { clearInterval(t); barra.remove(); try { sessionStorage.setItem('somos-barra', clave); } catch (x) {} };
}

// Sección "Nos acompañan" (inicio): logos de los anunciantes, con link.
async function auspiciantes() {
  const box = document.getElementById('auspiciantes-grid');
  if (!box) return;
  const a = await anunciosActivos('acompa');
  if (!a.length) return;
  box.innerHTML = a.map(x => {
    const img = x.logo || x.imagen;
    const dentro = img ? `<img src="${_e(img)}" alt="${_e(x.titulo || 'Anunciante')}">` : `<span>${_e(x.titulo)}</span>`;
    return x.enlace ? `<a class="auspiciante" href="${_e(x.enlace)}" target="_blank" rel="noopener" title="${_e(x.titulo)}">${dentro}</a>` : `<div class="auspiciante">${dentro}</div>`;
  }).join('');
  box.closest('section').hidden = false;
}

// Tarjeta de publicidad dentro de la grilla de notas (se llama después de armar las notas).
async function tarjetaAnuncio() {
  const grid = document.querySelector('.notas-grid');
  const notas = grid ? grid.querySelectorAll('.nota-card') : [];
  if (!notas.length) return;
  const a = await anunciosActivos('tarjeta');
  if (!a.length) return;
  const x = a[Math.floor(Math.random() * a.length)];
  const card = document.createElement('article');
  card.className = 'nota-card';
  card.innerHTML = `${x.imagen ? `<img src="${_e(x.imagen)}" alt="${_e(x.titulo)}">` : ''}<div class="nota-content"><div class="nota-cat">Publicidad</div>${x.titulo ? `<h3 class="nota-title">${_e(x.titulo)}</h3>` : ''}${x.texto ? `<p class="nota-sub">${_e(x.texto)}</p>` : ''}${x.enlace ? `<a href="${_e(x.enlace)}" target="_blank" rel="noopener" class="btn btn-outline">${_e(x.boton || 'Más información')}</a>` : ''}</div>`;
  if (notas.length >= 2) notas[1].after(card); else grid.appendChild(card);
}

const _iniciarAnuncios = () => { barraAnuncio(); auspiciantes(); };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', _iniciarAnuncios); else _iniciarAnuncios();
