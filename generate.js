const styles = [
  {t: 2, e: 'g', c: '#242f3e'}, // landscape geometry (dark gray)
  {t: 1, e: 'g', c: '#748191'}, // road geometry (light gray for visibility!)
  {t: 5, e: 'g', c: '#17263c'}, // water geometry (dark blue)
  {t: 3, e: 'g', c: '#263c3f'}, // poi geometry (dark green)
  {t: 6, e: 'l.t.f', c: '#d59563'}, // admin labels
  {t: 1, e: 'l.t.f', c: '#ffffff'} // road labels
];
const params = styles.map(s => `s.t:${s.t}|s.e:${s.e}|p.c:${s.c.replace('#', '')}`).join(',');
console.log('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&apistyle=' + encodeURIComponent(params));
