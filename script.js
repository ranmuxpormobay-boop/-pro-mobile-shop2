const GAS_URL = 'https://script.google.com/macros/s/AKfycbwgoJckFHdVnM9rA8Z0mIcLuVKQko80DlgH1YPMdyo-KoVVEOy4VZy2OsmwBfoDsINnJg/exec';

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'cb_' + Date.now() + Math.floor(Math.random() * 1000);
    window[callbackName] = (data) => {
      delete window[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };
    const script = document.createElement('script');
    script.src = url + (url.includes('?') ? '&' : '?') + 'callback=' + callbackName;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

function saveToSheet(sheet, data) {
  const url = `${GAS_URL}?sheet=${encodeURIComponent(sheet)}&data=${encodeURIComponent(JSON.stringify(data))}`;
  return jsonp(url);
}

function loadFromSheet(sheet) {
  const url = `${GAS_URL}?sheet=${encodeURIComponent(sheet)}&action=read`;
  return jsonp(url);
}

function saveLocal(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadLocal(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

document.addEventListener('DOMContentLoaded', () => {
  // Add Product Page
  const productForm = document.getElementById('product-form');
  if (productForm) {
    let products = loadLocal('products');
    const listDiv = document.getElementById('product-list');
    const searchInput = document.getElementById('product-search');
    function render(filter = '') {
      const rows = products
        .filter((p) => p.name.includes(filter))
        .map(
          (p, i) =>
            `<tr><td>${i + 1}</td><td>${p.name}</td><td>${p.desc}</td><td>${p.price}</td><td>${p.qty}</td></tr>`
        )
        .join('');
      listDiv.innerHTML =
        `<table><tr><th>#</th><th>ชื่อ</th><th>คำอธิบาย</th><th>ราคา</th><th>คงเหลือ</th></tr>${rows}</table>`;
    }
    render();
    searchInput && searchInput.addEventListener('input', (e) => render(e.target.value));
    productForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('p-name').value,
        desc: document.getElementById('p-desc').value,
        price: document.getElementById('p-price').value,
        qty: document.getElementById('p-qty').value,
      };
      products.push(data);
      saveLocal('products', products);
      Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
      saveToSheet('products', data).then(() => Swal.fire('บันทึกสำเร็จ', '', 'success'));
      productForm.reset();
      render();
    });
    document.getElementById('load-products').addEventListener('click', () => {
      Swal.fire({ title: 'กำลังโหลด...', didOpen: () => Swal.showLoading() });
      loadFromSheet('products').then((res) => {
        if (Array.isArray(res)) {
          products = res;
          saveLocal('products', products);
          render();
        }
        Swal.close();
      });
    });
  }

  // Repair Page
  const repairForm = document.getElementById('repair-form');
  if (repairForm) {
    let repairs = loadLocal('repairs');
    const listDiv = document.getElementById('repair-list');
    function render() {
      const rows = repairs
        .map(
          (r, i) =>
            `<tr><td>${i + 1}</td><td>${r.name}</td><td>${r.model}</td><td>${r.estimate}</td></tr>`
        )
        .join('');
      listDiv.innerHTML =
        `<table><tr><th>#</th><th>ชื่อลูกค้า</th><th>รุ่น</th><th>ประเมินราคา</th></tr>${rows}</table>`;
    }
    render();
    document.getElementById('repair-search-btn').addEventListener('click', () => {
      const model = document.getElementById('r-model').value;
      const products = loadLocal('products');
      const found = products.find((p) => p.name === model || p.desc.includes(model));
      document.getElementById('r-estimate').value = found ? found.price : 'ไม่พบ';
    });
    repairForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('r-name').value,
        model: document.getElementById('r-model').value,
        estimate: document.getElementById('r-estimate').value,
      };
      repairs.push(data);
      saveLocal('repairs', repairs);
      Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
      saveToSheet('repairs', data).then(() => Swal.fire('บันทึกสำเร็จ', '', 'success'));
      repairForm.reset();
      render();
    });
  }

  // Member Page
  const memberForm = document.getElementById('member-form');
  if (memberForm) {
    let members = loadLocal('members');
    const listDiv = document.getElementById('member-list');
    function render() {
      const rows = members
        .map(
          (m, i) =>
            `<tr><td>${i + 1}</td><td>${m.name}</td><td>${m.model}</td><td>${m.down}</td><td>${m.month}</td><td>${m.total}</td></tr>`
        )
        .join('');
      listDiv.innerHTML =
        `<table><tr><th>#</th><th>ชื่อ</th><th>รุ่น</th><th>ดาวน์</th><th>ผ่อน/เดือน</th><th>ยอดรวม</th></tr>${rows}</table>`;
    }
    render();
    memberForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        name: document.getElementById('m-name').value,
        model: document.getElementById('m-model').value,
        down: document.getElementById('m-down').value,
        month: document.getElementById('m-month').value,
        total: document.getElementById('m-total').value,
      };
      members.push(data);
      saveLocal('members', members);
      Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
      saveToSheet('members', data).then(() => Swal.fire('บันทึกสำเร็จ', '', 'success'));
      memberForm.reset();
      render();
    });
    document.getElementById('load-members').addEventListener('click', () => {
      Swal.fire({ title: 'กำลังโหลด...', didOpen: () => Swal.showLoading() });
      loadFromSheet('members').then((res) => {
        if (Array.isArray(res)) {
          members = res;
          saveLocal('members', members);
          render();
        }
        Swal.close();
      });
    });
  }

  // Sales Report Page
  const saleForm = document.getElementById('sale-form');
  if (saleForm) {
    let sales = loadLocal('sales');
    const listDiv = document.getElementById('sale-list');
    const ctx = document.getElementById('sale-chart');
    let chart;
    function render() {
      const rows = sales
        .map((s, i) => `<tr><td>${i + 1}</td><td>${s.date}</td><td>${s.amount}</td></tr>`)
        .join('');
      listDiv.innerHTML =
        `<table><tr><th>#</th><th>วันที่</th><th>ยอดขาย</th></tr>${rows}</table>`;
      if (chart) chart.destroy();
      chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sales.map((s) => s.date),
          datasets: [
            {
              label: 'ยอดขาย',
              data: sales.map((s) => s.amount),
              backgroundColor: '#ff9800',
            },
          ],
        },
      });
    }
    render();
    saleForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = {
        date: document.getElementById('s-date').value,
        amount: Number(document.getElementById('s-amount').value),
      };
      sales.push(data);
      saveLocal('sales', sales);
      Swal.fire({ title: 'กำลังบันทึก...', didOpen: () => Swal.showLoading() });
      saveToSheet('sales', data).then(() => Swal.fire('บันทึกสำเร็จ', '', 'success'));
      saleForm.reset();
      render();
    });
    document.getElementById('load-sales').addEventListener('click', () => {
      Swal.fire({ title: 'กำลังโหลด...', didOpen: () => Swal.showLoading() });
      loadFromSheet('sales').then((res) => {
        if (Array.isArray(res)) {
          sales = res;
          saveLocal('sales', sales);
          render();
        }
        Swal.close();
      });
    });
  }
});
