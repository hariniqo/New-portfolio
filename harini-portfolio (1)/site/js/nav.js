/* Mobile menu toggle: opens/closes the hamburger panel, closes on link tap, Esc, outside tap, or resize to desktop. */
(function(){
  var nav=document.querySelector('nav[aria-label="Primary"]'),btn=document.getElementById('menu');
  if(!nav||!btn)return;
  function set(open){
    nav.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open?'true':'false');
    btn.setAttribute('aria-label',open?'Close menu':'Open menu');
  }
  btn.addEventListener('click',function(){set(!nav.classList.contains('open'))});
  nav.addEventListener('click',function(e){if(e.target.closest('a.l'))set(false)});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){set(false);btn.focus()}});
  document.addEventListener('click',function(e){if(!nav.contains(e.target))set(false)});
  window.addEventListener('resize',function(){if(window.innerWidth>=900)set(false)});
})();
