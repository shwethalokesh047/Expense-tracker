const API = '/api/expenses';
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other'];

const $ = (id) => document.getElementById(id);
const form = $('expenseForm');
const money = (n) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => new Date().toISOString().slice(0, 10);

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

async function request(url, options = {}) {
  const res = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}

function filterQuery() {
  const p = new URLSearchParams();
  if ($('search').value.trim()) p.set('search', $('search').value.trim());
  if ($('filterCategory').value !== 'All') p.set('category', $('filterCategory').value);
  if ($('filterMonth').value) p.set('month', $('filterMonth').value);
  const s = p.toString();
  return s ? '?' + s : '';
}

// ---------- READ ----------
async function loadExpenses() {
  try {
    const expenses = await request(API + filterQuery());
    const body = $('expenseBody');
    body.innerHTML = expenses.map((e) => `
      <tr>
        <td>${new Date(e.date).toLocaleDateString('en-GB', { timeZone: 'UTC' })}</td>
        <td>${esc(e.title)}${e.note ? `<span class="note">${esc(e.note)}</span>` : ''}</td>
        <td><span class="badge">${esc(e.category)}</span></td>
        <td class="right"><strong>${money(e.amount)}</strong></td>
        <td class="right">
          <button class="icon-btn" title="Edit" data-edit="${e._id}">✏️</button>
          <button class="icon-btn" title="Delete" data-del="${e._id}">🗑️</button>
        </td>
      </tr>`).join('');
    $('emptyMsg').classList.toggle('hidden', expenses.length > 0);
    loadSummary();
  } catch (err) { toast(err.message); }
}

async function loadSummary() {
  try {
    const s = await request(API + '/summary' + filterQuery());
    $('totalAmount').textContent = money(s.total);
    $('totalCount').textContent = s.count;
    $('topCategory').textContent = s.byCategory[0] ? s.byCategory[0].category : '—';
    $('chart').innerHTML = s.byCategory.length
      ? s.byCategory.map((c) => {
          const pct = s.total ? (c.total / s.total) * 100 : 0;
          return `<div class="bar-row">
            <div class="bar-label"><span>${esc(c.category)}</span><span>${money(c.total)} (${pct.toFixed(0)}%)</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div></div>`;
        }).join('')
      : '<p class="muted">No data yet.</p>';
  } catch (err) { toast(err.message); }
}

// ---------- CREATE / UPDATE ----------
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  $('formError').textContent = '';
  const payload = {
    title: $('title').value.trim(),
    amount: parseFloat($('amount').value),
    category: $('category').value,
    date: $('date').value,
    note: $('note').value.trim(),
  };
  if (!payload.title) return ($('formError').textContent = 'Please enter a title.');
  if (!(payload.amount > 0)) return ($('formError').textContent = 'Amount must be greater than 0.');
  if (!payload.date) return ($('formError').textContent = 'Please choose a date.');

  const id = $('expenseId').value;
  try {
    if (id) {
      await request(`${API}/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      toast('Expense updated');
    } else {
      await request(API, { method: 'POST', body: JSON.stringify(payload) });
      toast('Expense added');
    }
    resetForm();
    loadExpenses();
  } catch (err) { $('formError').textContent = err.message; }
});

function resetForm() {
  form.reset();
  $('expenseId').value = '';
  $('date').value = today();
  $('formTitle').textContent = 'Add Expense';
  $('submitBtn').textContent = 'Add Expense';
  $('cancelBtn').classList.add('hidden');
  $('formError').textContent = '';
}

async function startEdit(id) {
  try {
    const e = await request(`${API}/${id}`);
    $('expenseId').value = e._id;
    $('title').value = e.title;
    $('amount').value = e.amount;
    $('category').value = e.category;
    $('date').value = e.date.slice(0, 10);
    $('note').value = e.note || '';
    $('formTitle').textContent = 'Edit Expense';
    $('submitBtn').textContent = 'Update Expense';
    $('cancelBtn').classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (err) { toast(err.message); }
}

// ---------- DELETE ----------
async function deleteExpense(id) {
  if (!confirm('Delete this expense?')) return;
  try {
    await request(`${API}/${id}`, { method: 'DELETE' });
    toast('Expense deleted');
    if ($('expenseId').value === id) resetForm();
    loadExpenses();
  } catch (err) { toast(err.message); }
}

// ---------- Events ----------
$('expenseBody').addEventListener('click', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (btn.dataset.edit) startEdit(btn.dataset.edit);
  if (btn.dataset.del) deleteExpense(btn.dataset.del);
});
$('cancelBtn').addEventListener('click', resetForm);
$('clearFilters').addEventListener('click', () => {
  $('search').value = ''; $('filterCategory').value = 'All'; $('filterMonth').value = '';
  loadExpenses();
});
let timer;
$('search').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(loadExpenses, 300); });
$('filterCategory').addEventListener('change', loadExpenses);
$('filterMonth').addEventListener('change', loadExpenses);

// ---------- Init ----------
$('category').innerHTML = CATEGORIES.map((c) => `<option>${c}</option>`).join('');
$('filterCategory').innerHTML = ['All', ...CATEGORIES].map((c) => `<option>${c}</option>`).join('');
$('date').value = today();
loadExpenses();
