/* Punch-the-ticket interaction + running tally. */

const tickets = Array.from(document.querySelectorAll('.ticket'));
const tally = document.getElementById('tally');

const lines = [
  'Nothing punched yet',
  'One punched · good start',
  'Two punched · narrowing it down',
  'Three punched · ambitious',
  'Four punched · we have a problem',
  'All five punched · long night ahead'
];

function update() {
  const n = tickets.filter(t => t.classList.contains('picked')).length;
  tally.textContent = lines[n];
}

tickets.forEach(ticket => {
  const btn = ticket.querySelector('.punch');

  ticket.addEventListener('click', () => {
    const picked = ticket.classList.toggle('picked');
    btn.setAttribute('aria-pressed', String(picked));
    btn.textContent = picked ? 'Punched' : 'Punch';
    update();
  });
});
