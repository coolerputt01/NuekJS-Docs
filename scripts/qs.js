const headerHTML = document.querySelector('header')
const header = new NuekComponent(headerHTML,'../components/Header.nuek');
const footer = new NuekComponent('footer','../components/Footer.nuek');

const buttons = document.querySelectorAll('.tabs button')
  const panes = document.querySelectorAll('.tab-pane')

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'))
      btn.classList.add('active')

      panes.forEach(p => {
        p.classList.remove('active')
        if (p.id === btn.dataset.tab) {
          p.classList.add('active')
        }
      })
    })
  })