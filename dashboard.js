// Dashboard uses the same diaryEntries storage as the journal form.
const dashboardEntries = document.getElementById('entries');
if (dashboardEntries) {
    const entries = getEntries();
    const today = new Date();
    const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const todayKey = dateKey(today);
    const dates = new Set(entries.map(entry => entry.date));
    const formatDate = value => {
        const date = new Date(`${value}T12:00:00`);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    document.getElementById('today-label').textContent = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('total-count').textContent = entries.length;
    document.getElementById('month-count').textContent = entries.filter(entry => String(entry.date).slice(0, 7) === todayKey.slice(0, 7)).length;
    document.getElementById('month-label').textContent = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    const cursor = new Date(today);
    if (!dates.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
    let streak = 0;
    while (dates.has(dateKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
    document.getElementById('streak-count').replaceChildren(document.createTextNode(`${streak} `));
    const unit = document.createElement('span'); unit.textContent = 'hari';
    document.getElementById('streak-count').append(unit);
    let activeDays = 0;
    for (let offset = 6; offset >= 0; offset--) {
        const day = new Date(today); day.setDate(day.getDate() - offset);
        const count = entries.filter(entry => entry.date === dateKey(day)).length;
        if (count) activeDays++;
        const column = document.createElement('div'); column.className = 'activity-day';
        const marker = document.createElement('span'); marker.className = `activity-marker${count ? ' is-active' : ''}${offset === 0 ? ' is-today' : ''}`;
        marker.textContent = count ? '✓' : '·';
        column.setAttribute('aria-label', `${formatDate(dateKey(day))}: ${count} jurnal`);
        column.title = `${formatDate(dateKey(day))}: ${count} jurnal`;
        const label = document.createElement('small'); label.textContent = day.toLocaleDateString('id-ID', { weekday: 'short' });
        column.append(marker, label); document.getElementById('weekly-activity').append(column);
    }
    document.getElementById('weekly-summary').textContent = `${activeDays} dari 7 hari diisi dengan cerita.`;
    if (dates.has(todayKey)) {
        document.getElementById('today-title').textContent = 'Hari ini sudah tercatat!';
        document.getElementById('today-message').textContent = 'Terima kasih sudah meluangkan waktu untuk dirimu. Masih ada cerita lain?';
        document.getElementById('today-link').firstChild.textContent = 'Tulis cerita lainnya ';
    }
    const search = document.getElementById('journal-search');
    const sort = document.getElementById('journal-sort');
    function renderDashboard() {
        const query = search.value.trim().toLocaleLowerCase('id-ID');
        const filtered = entries.filter(entry => `${entry.title} ${entry.content}`.toLocaleLowerCase('id-ID').includes(query)).sort((a, b) => {
            const order = String(b.date).localeCompare(String(a.date)) || Number(b.id) - Number(a.id);
            return sort.value === 'oldest' ? -order : order;
        });
        dashboardEntries.replaceChildren();
        document.getElementById('result-count').textContent = `${filtered.length} jurnal`;
        if (!filtered.length) {
            const empty = document.createElement('div'); empty.className = 'empty-state';
            const icon = document.createElement('span'); icon.className = 'empty-icon'; icon.textContent = '✿';
            const heading = document.createElement('h3'); heading.textContent = entries.length ? 'Jurnal tidak ditemukan' : 'Cerita pertamamu dimulai di sini';
            const text = document.createElement('p'); text.textContent = entries.length ? 'Coba kata kunci lain untuk menemukan ceritamu.' : 'Tulis tentang harimu, hal yang kamu syukuri, atau kenangan kecil yang berarti.';
            empty.append(icon, heading, text);
            if (!entries.length) { const link = document.createElement('a'); link.href = 'form.html'; link.className = 'add-btn'; link.textContent = '+ Tulis jurnal pertama'; empty.append(link); }
            dashboardEntries.append(empty);
        }
        filtered.forEach(entry => {
            const card = document.createElement('article'); card.className = 'entry-card';
            const date = document.createElement('p'); date.className = 'entry-date'; date.textContent = formatDate(entry.date);
            const title = document.createElement('h3'); title.className = 'entry-title'; title.textContent = entry.title;
            card.append(date, title);
            if (entry.image && /^data:image\//i.test(entry.image)) { const img = document.createElement('img'); img.src = entry.image; img.alt = `Foto jurnal ${entry.title}`; img.className = 'entry-img'; img.loading = 'lazy'; card.append(img); }
            const content = document.createElement('p'); content.className = 'entry-excerpt'; content.textContent = entry.content.length > 160 ? `${entry.content.slice(0, 160)}…` : entry.content;
            const actions = document.createElement('div'); actions.className = 'entry-actions';
            const edit = document.createElement('a'); edit.href = `form.html?id=${encodeURIComponent(entry.id)}`; edit.className = 'edit-btn'; edit.textContent = 'Baca & edit ↗';
            const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-btn'; remove.textContent = 'Hapus'; remove.setAttribute('aria-label', `Hapus jurnal ${entry.title}`); remove.addEventListener('click', () => deleteEntry(entry.id));
            actions.append(edit, remove); card.append(content, actions); dashboardEntries.append(card);
        });
    }
    search.addEventListener('input', renderDashboard);
    sort.addEventListener('change', renderDashboard);
    renderDashboard();
}
