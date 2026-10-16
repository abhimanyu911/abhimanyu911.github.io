(() => {
  'use strict';

  /* ------------------------------------------------------------------
     DATA
     ------------------------------------------------------------------ */
  const LOCS = {
    barnsdall: { name: 'Barnsdall Art Park', short: 'Barnsdall', lat: 34.1006, lon: -118.2944 },
    ucla:      { name: 'UCLA Botanical + Sculpture Gardens', short: 'UCLA', lat: 34.0705, lon: -118.4425 }
  };

  // Forecast snapshot taken Fri Oct 16, 2026 (NWS + AccuWeather; see page footnote).
  // Sunsets are approximate fallbacks; the live call replaces them when it succeeds.
  const DAYS = [
    { id: 'sat17', date: '2026-10-17', dow: 'Sat', dowLong: 'Saturday', md: 'Oct 17', next: false,
      alert: 'Heat advisory till 8 pm', sunset: '18:21',
      wx: { barnsdall: { hi: 93, lo: 66, cond: 'Sunny and hot' },
            ucla:      { hi: 90, lo: 66, cond: 'Very warm, sunny' } } },
    { id: 'sun18', date: '2026-10-18', dow: 'Sun', dowLong: 'Sunday', md: 'Oct 18', next: false,
      alert: '', sunset: '18:20',
      wx: { barnsdall: { hi: 85, lo: 65, cond: 'Sunny' },
            ucla:      { hi: 85, lo: 63, cond: 'Plenty of sunshine' } } },
    { id: 'sat24', date: '2026-10-24', dow: 'Sat', dowLong: 'Saturday', md: 'Oct 24', next: true,
      alert: '', sunset: '18:13',
      wx: { barnsdall: { hi: 81, lo: 63, cond: 'Sun and a few clouds' },
            ucla:      { hi: 73, lo: 61, cond: 'Plenty of sunshine' } } },
    { id: 'sun25', date: '2026-10-25', dow: 'Sun', dowLong: 'Sunday', md: 'Oct 25', next: true,
      alert: '', sunset: '18:12',
      wx: { barnsdall: { hi: 83, lo: 62, cond: 'Plenty of sunshine' },
            ucla:      { hi: 78, lo: 60, cond: 'Partly sunny' } } }
  ];

  const CELLS = {
    barnsdall: [
      'Hilltop lawn', 'Olive shade', 'Hollyhock House', 'Spot the dome', 'Hills view',
      'Golden hour', 'Palm skyline', 'Pine grove', 'Free parking', 'Read a chapter',
      'Snack swap', 'Bird song', 'FREE ★ mat + music', 'Making out', 'Dog spotting',
      'Cloud shapes', 'Mr. Bright&shy;side', 'Stair cardio', 'Mat selfie', 'Wright trivia',
      'Laugh attack', 'Art gallery', 'Sunset', 'City lights', 'One more song'
    ],
    ucla: [
      'Botanic stroll', 'Find the stream', 'Giant euca&shy;lyptus', 'Dino plants', 'The Nest',
      'Janss Steps', 'Spot a Rodin', 'Name a sculp&shy;ture', 'Art critics', 'Royce Hall',
      'Coral trees', 'Snack swap', 'FREE ★ mat + music', 'Bird song', 'Making out',
      'Squirrel cameo', 'Read a chapter', 'Let It Happen', 'Lawn nap', 'Mat selfie',
      'Laugh attack', 'Golden hour', 'Sunset', 'Brome&shy;liads', 'One more song'
    ]
  };

  // Clock times as minutes after midnight (12:30 pm = 750). 'sunset' = optional bonus, timed live.
  const PLANS = {
    barnsdall: [
      [750, 'Meet at the bottom of the hill', 'Free parking on site, right off Hollywood Blvd (4800 Hollywood Blvd).'],
      [765, 'Climb up and claim a spot', 'Up the stairs to the hilltop lawn.'],
      [780, 'Lunch on the lawn', '(Y)our snacks and drinks come out.'],
      [840, 'Chat, laugh, wander', 'Talk about everything and nothing (since our lips will be busy). Maybe a slow lap around Hollyhock House, Frank Lloyd Wright\'s first LA house, with its stylised hollyhock flowers cast into the walls.'],
      [900, 'Read side by side', 'Books out. We read next to each other and maybe demonstrate passages which are too abstract.'],
      [960, 'One more song', 'Pack up whenever we feel like it. The grounds are open until 10 pm, so no rush.'],
      ['sunset', 'Bonus round: stay for sunset?', 'If we\'re having too much fun to leave, the sun drops behind the Hollywood Hills and the Observatory catches the last light.']
    ],
    ucla: [
      [750, 'Meet at the Botanical Garden', 'Parking Structure 3 is the closest to the Sculpture Garden (check UCLA Transportation for the weekend rate). We start at the Botanical Garden on the south side of campus.'],
      [760, 'Botanical Garden stroll', 'A slow loop through the Mathias Botanical Garden: giant eucalyptus, cycads that look like dinosaur (nice callback, huh?) food, and the ginkgo-shaded amphitheatre called the Nest.'],
      [800, 'Walk across campus', 'About fifteen minutes north, past Royce Hall and the top of the Janss Steps, to the Sculpture Garden.'],
      [815, 'Mat down, lunch out', 'We set up on the lawn in the shade of the coral trees, playlist on, and (y)our snacks and drinks come out.'],
      [870, 'Chat, laugh, play art critic', 'Rodin, Calder, Henry Moore, Barbara Hepworth and more than seventy other pieces to (watch us) make out (literally and then) backstories for.'],
      [915, 'Read side by side', 'Books out. We read next to each other and maybe demonstrate passages which are too abstract.'],
      [975, 'One more song', 'I walk you back to Rochelle, whenever we feel like it.'],
      ['sunset', 'Bonus round: stay for sunset?', 'If we\'re still going strong, golden light through the coral trees.']
    ]
  };

  const TRACKS = [
    ['Weekend (feat. Miguel)', 'Mac Miller'],
    ['Someday', 'The Strokes'],
    ['Youngblood', '5 Seconds of Summer'],
    ['Rollercoaster', 'Bleachers'],
    ['Let It Happen', 'Tame Impala'],
    ['Your Love Is My Drug', 'Kesha'],
    ['When You Were Young', 'The Killers'],
    ['Basket Case', 'Green Day'],
    ['Good News', 'Mac Miller'],
    ['Last Nite', 'The Strokes'],
    ['She Looks So Perfect', '5 Seconds of Summer'],
    ['I Wanna Get Better', 'Bleachers'],
    ['The Less I Know The Better', 'Tame Impala'],
    ['Tik Tok', 'Kesha'],
    ['Mr. Brightside', 'The Killers'],
    ['Good Riddance (Time of Your Life)', 'Green Day']
  ];

  // ---- Where "Send it to Abhi" delivers. Fill in at least one. ----
  const ABHI = {
    phone: '+14244672052',  // e.g. '+13105551234' -> opens Messages / iMessage with the text pre-filled
    email: 'abhimanyu911@ucla.edu'   // e.g. 'abhi@example.com' -> used on Windows/Linux laptops that can't text
  };

  const LINES = (() => {
    const l = [];
    for (let r = 0; r < 5; r++) l.push([0, 1, 2, 3, 4].map(c => r * 5 + c));
    for (let c = 0; c < 5; c++) l.push([0, 1, 2, 3, 4].map(r => r * 5 + c));
    l.push([0, 6, 12, 18, 24], [4, 8, 12, 16, 20]);
    return l;
  })();

  const state = { pick: null, day: 'sun18', live: { barnsdall: {}, ucla: {} } };

  /* ------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const toMin = hhmm => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
  function fmt(min, round = true) {
    if (round) min = Math.round(min / 5) * 5;
    const h = Math.floor(min / 60), m = ((min % 60) + 60) % 60;
    return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'pm' : 'am'}`;
  }
  function wmo(code) {
    if (code === 0) return 'Clear';
    if (code === 1) return 'Mostly clear';
    if (code === 2) return 'Partly cloudy';
    if (code === 3) return 'Overcast';
    if (code === 45 || code === 48) return 'Fog';
    if (code >= 51 && code <= 57) return 'Drizzle';
    if (code >= 61 && code <= 67) return 'Rain';
    if (code >= 71 && code <= 77) return 'Snow (!?)';
    if (code >= 80 && code <= 82) return 'Showers';
    if (code >= 95) return 'Thunderstorms';
    return '—';
  }
  const dayObj = id => DAYS.find(d => d.id === id);
  const liveFor = (day, loc) => state.live[loc][day.date];
  function sunsetFor(day, loc) {
    const l = liveFor(day, loc || 'barnsdall');
    return (l && /^\d\d:\d\d$/.test(l.sunset)) ? l.sunset : day.sunset;
  }

  /* ------------------------------------------------------------------
     WEATHER
     ------------------------------------------------------------------ */
  function locRow(day, k) {
    const w = day.wx[k];
    const l = liveFor(day, k);
    const live = l
      ? `<span class="live">Live: ${l.hi}°/${l.lo}° · ${wmo(l.code)}${l.pop != null ? ` · ${l.pop}% rain` : ''}</span>`
      : '';
    return `<span class="loc-row" data-loc="${k}">
        <span class="loc-name">${LOCS[k].short}</span>
        <span class="temps">${w.hi}°<span class="lo">/${w.lo}°</span></span>
        <span class="cond">${w.cond}</span>${live}
      </span>`;
  }

  function renderWeather() {
    const groups = [
      ['This weekend', 'Oct 17–18 · 7-day forecast', DAYS.slice(0, 2)],
      ['Next weekend', 'Oct 24–25 · long-range', DAYS.slice(2, 4)]
    ];
    $('#weekends').innerHTML = groups.map(([title, sub, days]) => `
      <div class="weekend">
        <h3>${title} <small>${sub}</small></h3>
        <div class="days">
          ${days.map(d => `
            <button class="day" type="button" data-day="${d.id}" aria-pressed="${state.day === d.id}">
              <span class="day-top"><span class="day-name">${d.dow}</span><span class="day-date">${d.md}</span></span>
              ${d.alert ? `<span class="chip alert">${d.alert}</span>` : ''}
              ${locRow(d, 'barnsdall')}
              ${locRow(d, 'ucla')}
              <span class="sunset">Sunset ≈ ${fmt(toMin(sunsetFor(d, state.pick)), false)}</span>
            </button>`).join('')}
        </div>
      </div>`).join('');
  }

  /* ------------------------------------------------------------------
     CARDS
     ------------------------------------------------------------------ */
  function renderCards() {
    $$('.grid').forEach(grid => {
      const loc = grid.dataset.loc;
      grid.innerHTML = CELLS[loc].map((label, i) => {
        const free = i === 12;
        return `<button type="button" class="cell${free ? ' free daubed' : ''}" data-i="${i}" aria-pressed="${free}">${label}</button>`;
      }).join('');
    });
  }

  function pick(loc) {
    state.pick = loc;
    document.body.dataset.pick = loc;
    $$('.card').forEach(c => {
      const on = c.dataset.loc === loc;
      c.classList.toggle('picked', on);
      c.classList.toggle('dimmed', !on);
      $('.pick-btn', c).textContent = on ? 'Picked! See the plan ↓' : 'Switch to this one';
    });
    renderWeather();
    renderPlan();
    renderSummary();
  }

  function checkBingo(card) {
    const on = $$('.cell', card).map(c => c.classList.contains('daubed'));
    const has = LINES.some(line => line.every(i => on[i]));
    if (has && !card.dataset.bingo) {
      card.dataset.bingo = '1';
      const b = $('.bingo-burst', card);
      b.classList.remove('show');
      void b.offsetWidth; // restart animation
      b.classList.add('show');
    } else if (!has) {
      delete card.dataset.bingo;
    }
  }

  function onCardClick(e) {
    const card = e.currentTarget;
    const loc = card.dataset.loc;
    if (e.target.closest('a')) return; // map links just open
    if (state.pick !== loc) { pick(loc); return; }
    if (e.target.closest('.pick-btn')) {
      $('#plan').scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const cell = e.target.closest('.cell');
    if (cell && !cell.classList.contains('free')) {
      const now = cell.classList.toggle('daubed');
      cell.setAttribute('aria-pressed', String(now));
      checkBingo(card);
    }
  }

  /* ------------------------------------------------------------------
     PLAN
     ------------------------------------------------------------------ */
  function renderDayChips() {
    $('#daychips').innerHTML = DAYS.map(d =>
      `<button type="button" class="chipbtn" data-day="${d.id}" aria-pressed="${state.day === d.id}">${d.dow} ${d.md}</button>`
    ).join('');
  }

  function renderPlan() {
    const body = $('#plan-body');
    if (!state.pick) {
      body.innerHTML = '<p class="plan-empty">Pick a card in step 2 and the timeline for that day shows up here.</p>';
      return;
    }
    const loc = state.pick;
    const day = dayObj(state.day);
    const w = day.wx[loc];
    const l = liveFor(day, loc);
    const hi = l ? l.hi : w.hi;
    const S = toMin(sunsetFor(day, loc));

    const notes = [];
    if (day.alert) notes.push(['hot', `${day.alert} on ${day.dowLong}. Midday is peak heat, so shade is non-negotiable: extra water and the coldest drinks you can find.`]);
    else if (hi >= 88) notes.push(['hot', `It's a warm one (around ${hi}°), so we stay in the shade and keep the drinks cold.`]);
    if (day.next) notes.push(['cool', 'This is a long-range forecast, so the numbers may still shift. Showers are expected midweek, but the weekend itself currently looks dry.']);
    if (l && l.pop != null && l.pop >= 30) notes.push(['cool', `The live forecast now shows a ${l.pop}% chance of rain. We should keep a backup day in mind.`]);
    if (hi <= 75) notes.push(['cool', `Mild, around ${hi}°. Lovely in the sun, but bring a layer in case we stay till sunset.`]);

    body.innerHTML = `
      <div class="plan-where"><span>${LOCS[loc].name}</span><span>${day.dowLong}, ${day.md}</span></div>
      ${notes.length ? `<ul class="notes">${notes.map(([c, t]) => `<li class="${c}">${t}</li>`).join('')}</ul>` : ''}
      <ol class="timeline">
        ${PLANS[loc].map(([off, title, desc]) => `
          <li class="${off === 'sunset' ? 'sun' : ''}">
            <time>${off === 'sunset' ? fmt(S, false) : fmt(off, false)}</time>
            <div><h4>${title}</h4><p>${desc}</p></div>
          </li>`).join('')}
      </ol>`;
  }

  /* ------------------------------------------------------------------
     PLAYLIST
     ------------------------------------------------------------------ */
  function renderTracks() {
    $('#tracks').innerHTML = TRACKS.map(([song, artist]) => {
      const q = encodeURIComponent(`${song.replace(/\s*\(feat\..*\)/, '')} ${artist}`);
      return `<li><a href="https://open.spotify.com/search/${q}" target="_blank" rel="noopener">
        <span class="song">${song}</span><span class="artist">${artist}</span></a></li>`;
    }).join('');
  }

  /* ------------------------------------------------------------------
     SUMMARY / SHARE
     ------------------------------------------------------------------ */
  function summaryText() {
    if (!state.pick) return '';
    const day = dayObj(state.day);
    const start = PLANS[state.pick][0][0];
    return `Picnic: ${LOCS[state.pick].name}, ${day.dowLong} ${day.md}. Meet at ${fmt(start, false)}.`;
  }

  function renderSummary() {
    const text = summaryText();
    $('#summary').textContent = text || 'Pick a day in step 1 and a card in step 2, and your answer shows up here, ready to send.';
    $('#copy').disabled = !text;
    $('#share').disabled = !text;
    $('#copy-status').textContent = '';
  }

  function copyText(text) {
    const done = () => { $('#copy-status').textContent = 'Copied. Paste it to Abhi.'; };
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    }
    fallbackCopy(text, done);
    return Promise.resolve();
  }
  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); }
    catch (_) { $('#copy-status').textContent = 'Could not copy automatically. Long-press the text above instead.'; }
    document.body.removeChild(ta);
  }

  function sendToAbhi(text) {
    const ua = navigator.userAgent;
    const canText = /iPhone|iPad|iPod|Android|Macintosh/i.test(ua); // Macs open Messages too
    const status = $('#copy-status');
    if (ABHI.phone && canText) {
      status.textContent = 'Opening Messages… just hit send.';
      location.href = `sms:${ABHI.phone}?&body=${encodeURIComponent(text)}`;
      return;
    }
    if (ABHI.email) {
      status.textContent = 'Opening your email… just hit send.';
      location.href = `mailto:${ABHI.email}?subject=${encodeURIComponent('Picnic pick')}&body=${encodeURIComponent(text)}`;
      return;
    }
    if (navigator.share) {
      navigator.share({ title: 'Alice & Abhi · Picnic', text, url: location.href }).catch(() => {});
    } else {
      copyText(text);
    }
  }

  /* ------------------------------------------------------------------
     LIVE FORECAST (Open-Meteo, no key needed)
     ------------------------------------------------------------------ */
  async function loadLive() {
    const status = $('#live-status');
    try {
      await Promise.all(Object.entries(LOCS).map(async ([k, l]) => {
        const url = 'https://api.open-meteo.com/v1/forecast'
          + `?latitude=${l.lat}&longitude=${l.lon}`
          + '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunset'
          + '&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles&forecast_days=16';
        const r = await fetch(url);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = (await r.json()).daily;
        d.time.forEach((t, i) => {
          state.live[k][t] = {
            hi: Math.round(d.temperature_2m_max[i]),
            lo: Math.round(d.temperature_2m_min[i]),
            code: d.weather_code[i],
            pop: d.precipitation_probability_max[i],
            sunset: String(d.sunset[i] || '').slice(11, 16)
          };
        });
      }));
      const any = DAYS.some(day => liveFor(day, 'barnsdall'));
      status.textContent = any
        ? `Live check from Open-Meteo, pulled ${new Date().toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}. Sunset times and the plan now use it too.`
        : 'Live forecast loaded, but these dates are outside its window now, so you are seeing the Oct 16 snapshot.';
      renderWeather();
      renderPlan();
      renderSummary();
    } catch (err) {
      status.textContent = 'Live update unavailable right now, so you are seeing the Oct 16 snapshot.';
    }
  }

  /* ------------------------------------------------------------------
     WIRE UP
     ------------------------------------------------------------------ */
  function setDay(id) {
    if (!dayObj(id)) return;
    state.day = id;
    renderWeather();
    renderDayChips();
    renderPlan();
    renderSummary();
  }

  let started = false;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  function init() {
    if (started) return;
    started = true;

    renderWeather();
    renderCards();
    renderDayChips();
    renderPlan();
    renderTracks();
    renderSummary();

    $('#weekends').addEventListener('click', e => {
      const b = e.target.closest('.day');
      if (b) setDay(b.dataset.day);
    });
    $('#daychips').addEventListener('click', e => {
      const b = e.target.closest('.chipbtn');
      if (b) setDay(b.dataset.day);
    });
    $$('.card').forEach(c => c.addEventListener('click', onCardClick));

    $('#copy').addEventListener('click', () => copyText(summaryText()));
    $('#share').addEventListener('click', () => {
      const text = summaryText();
      if (!text) return;
      sendToAbhi(text);
    });

    loadLive();
  }
})();
