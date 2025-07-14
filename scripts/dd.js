const headerHTML = document.querySelector('header')
const header = new NuekComponent(headerHTML,'../components/Header.nuek');
const footer = new NuekComponent('footer','../components/Footer.nuek');

const search = document.getElementById('faq-search');
  const faqs = document.querySelectorAll('#faq-list details');

  search.addEventListener('input', e => {
    const term = e.target.value.toLowerCase();
    faqs.forEach(detail => {
      const text = detail.textContent.toLowerCase();
      detail.style.display = text.includes(term) ? 'block' : 'none';
    });
  });