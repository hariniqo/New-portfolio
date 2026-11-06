(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;
  var toast = document.getElementById('toast');
  function say(msg, ok) {
    if (!toast) return alert(msg);
    toast.textContent = msg; toast.style.color = ok ? '#7CFC9A' : '';
    setTimeout(function () { toast.textContent = ''; }, 6000);
  }
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var btn = form.querySelector('button[type=submit]');
    var data = Object.fromEntries(new FormData(form).entries());
    if (!data.name || !data.email || !data.message) return say('Please fill in all fields.', false);
    btn.disabled = true;
    try {
      var res = await fetch((window.API_BASE || '') + '/api/contact', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
      });
      var out = await res.json().catch(function () { return {}; });
      if (!res.ok) throw new Error(out.error || 'Could not send message.');
      form.reset(); say('Thanks! Your message was sent.', true);
    } catch (err) { say(err.message, false); }
    finally { btn.disabled = false; }
  });
})();
