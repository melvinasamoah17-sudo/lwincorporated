/* Schools map: visited schools (blue pins) and every other senior high school
   in Greater Accra (red dots), with day/night tiles, a live Accra clock,
   "locate me" tracking and a school search. Needs Leaflet loaded first. */
(function () {
  var shell = document.getElementById('liveMapShell');
  var mapEl = document.getElementById('schoolsMap');
  if (!shell || !mapEl || typeof L === 'undefined') return;

  // Schools Living Waters has visited. Keep in the same order as the list card.
  var visited = [
    ["Accra Academy", 5.5715232, -0.2438172],
    ["Accra Girls SHS", 5.5969834, -0.1929681],
    ["Accra High School", 5.5675623, -0.2000479],
    ["Achimota School", 5.6282132, -0.2127761],
    ["Benkum SHS", 5.9422848, -0.0898632],
    ["Diaspora Girls SHS", 5.8187043, -0.2667207],
    ["Forces SHS", 5.592864, -0.161052],
    ["Ghanata SHS", 5.8858378, -0.1073621],
    ["Labone SHS", 5.5644744, -0.1712557],
    ["Mangoase SHS", 5.9432486, -0.2967663],
    ["Nifa SHS", 6.027203, -0.0780929],
    ["Nungua SHS", 5.6065, -0.0773],
    ["St John's Grammar SHS", 5.6386688, -0.2451259],
    ["St. Thomas Aquinas SHS", 5.5655, -0.1775],
    ["Tema Technical SHS", 5.6662796, -0.0035298],
    ["Wesley Grammar SHS", 5.5700027, -0.2605206],
    ["West Africa SHS (WASS)", 5.70639, -0.17444]
  ];

  // Key-free tile sources: OpenStreetMap for day, Esri Dark Gray (base + labels) for night.
  var ESRI = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/';
  var LAYERS = {
    day: L.layerGroup([
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      })
    ]),
    night: L.layerGroup([
      L.tileLayer(ESRI + 'World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
        maxNativeZoom: 16, maxZoom: 19
      }),
      L.tileLayer(ESRI + 'World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxNativeZoom: 16, maxZoom: 19
      })
    ])
  };

  var map = L.map(mapEl, { preferCanvas: true, zoomControl: false, scrollWheelZoom: false, maxZoom: 19 });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  // Let the page scroll normally; zoom with the wheel only after the map is clicked.
  map.on('click', function () { map.scrollWheelZoom.enable(); });
  mapEl.addEventListener('mouseleave', function () { map.scrollWheelZoom.disable(); });

  var activeLayer = null;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function directions(lat, lng) {
    return 'https://www.google.com/maps/dir/?api=1&destination=' + lat + ',' + lng;
  }
  function coords(lat, lng) {
    return lat.toFixed(5) + '°, ' + Math.abs(lng).toFixed(5) + '°' + (lng < 0 ? 'W' : 'E');
  }

  /* ---------- Day / night ---------- */
  var THEME_KEY = 'lw-map-theme';
  function accraHour() {
    // Accra is on GMT all year (no daylight saving).
    return new Date().getUTCHours();
  }
  function autoTheme() {
    var h = accraHour();
    return (h >= 6 && h < 18) ? 'day' : 'night';
  }
  var themeBtn = document.getElementById('mapThemeToggle');
  function setTheme(theme, remember) {
    shell.setAttribute('data-theme', theme);
    if (activeLayer) map.removeLayer(activeLayer);
    activeLayer = LAYERS[theme].addTo(map);
    if (themeBtn) {
      var night = theme === 'night';
      themeBtn.setAttribute('aria-pressed', night ? 'true' : 'false');
      themeBtn.innerHTML = night ? '<span aria-hidden="true">&#9728;&#65039;</span> Day mode' : '<span aria-hidden="true">&#127769;</span> Night mode';
    }
    if (remember) { try { localStorage.setItem(THEME_KEY, theme); } catch (e) {} }
  }
  var saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  setTheme(saved === 'day' || saved === 'night' ? saved : autoTheme(), false);
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      setTheme(shell.getAttribute('data-theme') === 'night' ? 'day' : 'night', true);
    });
  }

  /* ---------- Live Accra clock ---------- */
  var clockEl = document.getElementById('mapClock');
  function tick() {
    if (!clockEl) return;
    var d = new Date();
    var hh = ('0' + d.getUTCHours()).slice(-2), mm = ('0' + d.getUTCMinutes()).slice(-2), ss = ('0' + d.getUTCSeconds()).slice(-2);
    clockEl.textContent = hh + ':' + mm + ':' + ss;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- Visited schools: blue pulsing pins ---------- */
  var visitedIcon = L.divIcon({
    className: 'lw-pin-visited',
    html: '<span class="lw-pulse"></span><svg viewBox="0 0 24 34" aria-hidden="true"><path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 34 12 34s12-13.2 12-22.1C24 5.3 18.6 0 12 0z"/><circle cx="12" cy="12" r="4.6"/></svg>',
    iconSize: [26, 36],
    iconAnchor: [13, 35],
    popupAnchor: [0, -32]
  });
  var visitedMarkers = [];
  var searchIndex = [];
  visited.forEach(function (s) {
    var m = L.marker([s[1], s[2]], { icon: visitedIcon, zIndexOffset: 1000, title: s[0] + ' (visited)' })
      .addTo(map)
      .bindPopup(
        '<div class="lw-pop">' +
          '<span class="lw-tag lw-tag-visited">&#10003; Visited</span>' +
          '<strong>' + esc(s[0]) + '</strong>' +
          '<span class="lw-coords">' + coords(s[1], s[2]) + '</span>' +
          '<a href="' + directions(s[1], s[2]) + '" target="_blank" rel="noopener">Get directions &rarr;</a>' +
        '</div>'
      );
    visitedMarkers.push(m);
    searchIndex.push({ name: s[0], marker: m, visited: true });
  });

  var allBounds = L.featureGroup(visitedMarkers).getBounds();
  map.fitBounds(allBounds.pad(0.15));

  function focus(marker) {
    var ll = marker.getLatLng();
    map.flyTo(ll, Math.max(map.getZoom(), 15), { duration: 0.8 });
    map.once('moveend', function () { marker.openPopup(); });
  }

  // Clicking a school in the list card flies to its pin.
  var listItems = document.querySelectorAll('.schools-list-card li');
  listItems.forEach(function (li, i) {
    if (!visitedMarkers[i]) return;
    li.setAttribute('tabindex', '0');
    li.setAttribute('role', 'button');
    li.addEventListener('click', function () { focus(visitedMarkers[i]); shell.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
    li.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); li.click(); } });
  });

  /* ---------- Unvisited schools: red dots ---------- */
  var cntVisited = document.getElementById('cntVisited');
  var cntUnvisited = document.getElementById('cntUnvisited');
  if (cntVisited) cntVisited.textContent = visited.length;

  function near(a, b) {
    // ~350 m: treat as the same school as a visited pin.
    var dLat = (a[0] - b[0]) * 111000, dLng = (a[1] - b[1]) * 111000 * Math.cos(a[0] * Math.PI / 180);
    return Math.sqrt(dLat * dLat + dLng * dLng) < 350;
  }

  var src = mapEl.getAttribute('data-schools');
  if (src) {
    fetch(src).then(function (r) { return r.json(); }).then(function (list) {
      var count = 0;
      list.forEach(function (s) {
        var ll = [s.lat, s.lng];
        for (var i = 0; i < visited.length; i++) {
          if (near(ll, [visited[i][1], visited[i][2]])) return;
        }
        var m = L.circleMarker(ll, {
          radius: 6, color: '#ffffff', weight: 1.5, fillColor: '#E53935', fillOpacity: 0.9
        }).addTo(map);
        m.bindTooltip(esc(s.name), { direction: 'top', offset: [0, -6] });
        m.bindPopup(
          '<div class="lw-pop">' +
            '<span class="lw-tag lw-tag-unvisited">Not yet visited</span>' +
            '<strong>' + esc(s.name) + '</strong>' +
            (s.area ? '<span class="lw-area">&#128205; ' + esc(s.area) + '</span>' : '') +
            '<span class="lw-coords">' + coords(s.lat, s.lng) + '</span>' +
            '<a href="' + directions(s.lat, s.lng) + '" target="_blank" rel="noopener">Get directions &rarr;</a>' +
            '<a href="/contact" class="lw-invite">Invite Living Waters to this school</a>' +
          '</div>'
        );
        m.on('click', function () {
          map.flyTo(ll, Math.max(map.getZoom(), 15), { duration: 0.8 });
        });
        searchIndex.push({ name: s.name, marker: m, visited: false });
        count++;
      });
      if (cntUnvisited) cntUnvisited.textContent = count;
      fillSearch();
    }).catch(function () {
      if (cntUnvisited) cntUnvisited.textContent = '–';
      fillSearch();
    });
  } else {
    fillSearch();
  }

  /* ---------- Search ---------- */
  var searchInput = document.getElementById('mapSearch');
  var searchList = document.getElementById('mapSearchList');
  function fillSearch() {
    if (!searchList) return;
    searchIndex.sort(function (a, b) { return a.name.localeCompare(b.name); });
    searchList.innerHTML = searchIndex.map(function (s) {
      return '<option value="' + esc(s.name) + '"></option>';
    }).join('');
  }
  if (searchInput) {
    var go = function () {
      var q = searchInput.value.trim().toLowerCase();
      if (!q) return;
      var hit = null;
      for (var i = 0; i < searchIndex.length; i++) {
        if (searchIndex[i].name.toLowerCase() === q) { hit = searchIndex[i]; break; }
      }
      if (!hit) {
        for (var j = 0; j < searchIndex.length; j++) {
          if (searchIndex[j].name.toLowerCase().indexOf(q) !== -1) { hit = searchIndex[j]; break; }
        }
      }
      if (hit) focus(hit.marker);
    };
    searchInput.addEventListener('change', go);
    searchInput.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); go(); } });
  }

  /* ---------- Locate me (live position) ---------- */
  var locateBtn = document.getElementById('mapLocate');
  var meMarker = null, meCircle = null, tracking = false, firstFix = true;
  var meIcon = L.divIcon({ className: 'lw-me', html: '<span></span>', iconSize: [18, 18], iconAnchor: [9, 9] });
  if (locateBtn) {
    if (!('geolocation' in navigator)) { locateBtn.hidden = true; }
    locateBtn.addEventListener('click', function () {
      if (tracking) {
        map.stopLocate();
        tracking = false;
        locateBtn.setAttribute('aria-pressed', 'false');
        if (meMarker) { map.removeLayer(meMarker); meMarker = null; }
        if (meCircle) { map.removeLayer(meCircle); meCircle = null; }
        return;
      }
      tracking = true;
      firstFix = true;
      locateBtn.setAttribute('aria-pressed', 'true');
      map.locate({ watch: true, enableHighAccuracy: true, setView: false });
    });
  }
  map.on('locationfound', function (e) {
    if (!meMarker) {
      meMarker = L.marker(e.latlng, { icon: meIcon, zIndexOffset: 2000, title: 'You are here' }).addTo(map).bindPopup('<div class="lw-pop"><strong>You are here</strong></div>');
      meCircle = L.circle(e.latlng, { radius: e.accuracy, color: '#34B36A', weight: 1, fillColor: '#34B36A', fillOpacity: 0.12, interactive: false }).addTo(map);
    } else {
      meMarker.setLatLng(e.latlng);
      meCircle.setLatLng(e.latlng).setRadius(e.accuracy);
    }
    if (firstFix) { firstFix = false; map.flyTo(e.latlng, Math.max(map.getZoom(), 13), { duration: 0.8 }); }
  });
  map.on('locationerror', function () {
    tracking = false;
    if (locateBtn) locateBtn.setAttribute('aria-pressed', 'false');
    alert('We couldn’t get your location. Please allow location access and try again.');
  });
})();
