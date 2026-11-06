(function(){
  var box=document.createElement('div');box.className='lbx';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label','Image preview');
  var big=document.createElement('img');var x=document.createElement('button');x.type='button';x.setAttribute('aria-label','Close image');x.innerHTML='&times;';
  box.appendChild(big);box.appendChild(x);document.body.appendChild(box);
  function close(){box.classList.remove('on');big.removeAttribute('src');document.body.style.overflow=''}
  document.addEventListener('click',function(e){
    var im=e.target.closest&&e.target.closest('.bento img');
    if(im){big.src=im.currentSrc||im.src;big.alt=im.alt||'';box.classList.add('on');document.body.style.overflow='hidden';x.focus();return}
    if(box.classList.contains('on')&&(e.target===x||e.target===box))close();
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close()});
})();
