(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const fmt = n => n.toLocaleString("ar-EG") + " ج.م";
  const img = k => `assets/img/${k}.jpg`;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const state = {
    cat: "all", age: "all", q: "", sort: "def",
    cart: JSON.parse(localStorage.getItem("bm_cart") || "[]")
  };

  const finalPrice = p => p.offer ? Math.round(p.price * (1 - STORE.weeklyOffer / 100)) : p.price;
  const ageLabel = p => {
    const f = m => m < 12 ? `${m} شهر` : `${Math.round(m / 12)} سنة`;
    return `من ${p.ages[0] === 0 ? "الولادة" : f(p.ages[0])} لـ ${f(p.ages[1])}`;
  };

  /* ---------------- INTRO ---------------- */
  const intro = $("#intro");
  function endIntro() {
    intro.classList.add("gone");
    document.body.classList.remove("intro-on");
    sessionStorage.setItem("bm_intro", "1");
  }
  function openWardrobe() {
    if (reduced) return endIntro();
    intro.classList.add("leaving");
    $("#wardrobe").classList.add("open");
    setTimeout(() => $("#wardrobe").classList.add("zoom"), 700);
    setTimeout(endIntro, 1500);
  }
  $("#openWardrobe").onclick = openWardrobe;
  $("#wardrobe").onclick = openWardrobe;
  $("#skipIntro").onclick = endIntro;
  document.addEventListener("keydown", e => {
    if (!intro.classList.contains("gone") && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openWardrobe(); }
  });
  if (sessionStorage.getItem("bm_intro")) endIntro();
  setTimeout(() => intro.classList.add("ready"), 2200); // safety: never leave intro invisible

  /* ---------------- FILTERS ---------------- */
  $("#ageChips").innerHTML = AGE_FILTERS.map(a => `<button data-age="${a.id}" class="${a.id === "all" ? "on" : ""}">${a.label}</button>`).join("");
  $("#ageChips").onclick = e => {
    const b = e.target.closest("button"); if (!b) return;
    state.age = b.dataset.age;
    $$("#ageChips button").forEach(x => x.classList.toggle("on", x === b));
    render(); scrollShop();
  };
  $("#catTabs").onclick = e => { const b = e.target.closest("button"); if (b) setCat(b.dataset.c); };
  $("#searchInput").oninput = e => { state.q = e.target.value.trim(); render(); };
  $("#sortSel").onchange = e => { state.sort = e.target.value; render(); };
  $$("[data-goto]").forEach(b => b.onclick = () => { setCat(b.dataset.goto); scrollShop(); });
  $$(".nav a[data-cat]").forEach(a => a.onclick = () => { setCat(a.dataset.cat); closeNav(); });
  $$(".nav a:not([data-cat])").forEach(a => a.onclick = closeNav);
  $("#showOffers").onclick = () => { setCat("offer"); scrollShop(); };
  $("#showSchool").onclick = () => { setCat("all"); state.q = ""; state.school = true; render(); scrollShop(); };

  function setCat(c) {
    state.cat = c; state.school = false;
    $$("#catTabs button").forEach(x => x.classList.toggle("on", x.dataset.c === c));
    render();
  }
  function scrollShop() { $("#shop").scrollIntoView({ behavior: reduced ? "auto" : "smooth" }); }

  function filtered() {
    const r = AGE_FILTERS.find(a => a.id === state.age).r;
    let list = PRODUCTS.filter(p =>
      (state.cat === "all" || (state.cat === "offer" ? p.offer : p.cat === state.cat || p.also === state.cat)) &&
      (state.age === "all" || (p.ages[0] < r[1] && p.ages[1] > r[0])) &&
      (!state.q || p.name.includes(state.q)) &&
      (!state.school || p.school));
    if (state.sort === "low") list = [...list].sort((a, b) => finalPrice(a) - finalPrice(b));
    if (state.sort === "high") list = [...list].sort((a, b) => finalPrice(b) - finalPrice(a));
    return list;
  }

  function render() {
    const list = filtered();
    const ageTxt = state.age === "all" ? "" : ` لسن ${AGE_FILTERS.find(a => a.id === state.age).label}`;
    $("#resultLine").textContent = `${list.length} قطعة${ageTxt}${state.school ? " - كولكشن المدارس" : ""}`;
    $("#grid").innerHTML = list.length ? list.map((p, i) => `
      <article class="card" style="animation-delay:${i * 40}ms">
        <div class="card-img" data-open-p="${p.id}">
          ${p.offer ? `<span class="badge">-${STORE.weeklyOffer}%</span>` : ""}
          ${p.school ? `<span class="badge school">مدارس</span>` : ""}
          <img src="${img(p.img)}" alt="${p.name}" loading="lazy">
        </div>
        <div class="card-body">
          <h4>${p.name}</h4>
          <span class="ages">${ageLabel(p)}</span>
          <div class="swatches">${p.colors.map(c => `<i style="background:${c}"></i>`).join("")}</div>
          <div class="card-foot">
            <span class="price"><b>${finalPrice(p)}</b> <small>ج.م</small>${p.offer ? `<s>${p.price}</s>` : ""}</span>
            <button class="add" data-open-p="${p.id}" aria-label="أضف ${p.name}">+</button>
          </div>
        </div>
      </article>`).join("")
      : `<div class="empty"><b>مفيش قطع بالاختيارات دي</b><br>جربي سن تاني أو امسحي البحث.</div>`;
  }
  $("#grid").onclick = e => { const t = e.target.closest("[data-open-p]"); if (t) openProduct(t.dataset.openP); };

  /* ---------------- SCHOOL LIST ---------------- */
  $("#schoolList").innerHTML = PRODUCTS.filter(p => p.school).slice(0, 4).map(p =>
    `<li data-open-p="${p.id}"><img src="${img(p.img)}" alt=""><span>${p.name}</span><b>${finalPrice(p)} ج.م</b></li>`).join("");
  $("#schoolList").onclick = e => { const t = e.target.closest("[data-open-p]"); if (t) openProduct(t.dataset.openP); };

  /* ---------------- OVERLAYS ---------------- */
  const veil = $("#veil");
  function openLayer(el) { $$(".modal.on,.drawer.on").forEach(x => x.classList.remove("on")); el.classList.add("on"); veil.classList.add("on"); document.body.classList.add("lock"); }
  function closeAll() { $$(".modal.on,.drawer.on").forEach(x => x.classList.remove("on")); veil.classList.remove("on"); document.body.classList.remove("lock"); }
  veil.onclick = closeAll;
  document.addEventListener("click", e => {
    if (e.target.closest("[data-close]")) closeAll();
    const o = e.target.closest("[data-open]"); if (o) { if (o.dataset.open === "sizeGuide") openSizeGuide(); }
  });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeAll(); });

  /* size guide */
  function openSizeGuide(hlAge) {
    $("#sizeTable tbody").innerHTML = SIZE_GUIDE.map(r => `<tr class="${hlAge && r[0] === hlAge ? "hl" : ""}">${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("");
    openLayer($("#sizeGuide"));
  }

  /* search */
  $("#openSearch").onclick = () => { openLayer($("#searchModal")); setTimeout(() => $("#quickSearch").focus(), 200); quick(""); };
  $("#quickSearch").oninput = e => quick(e.target.value.trim());
  function quick(q) {
    const res = PRODUCTS.filter(p => !q || p.name.includes(q)).slice(0, 6);
    $("#quickResults").innerHTML = res.length ? res.map(p => `<button data-open-p="${p.id}"><img src="${img(p.img)}" alt=""><span>${p.name}</span></button>`).join("") : `<p class="muted">مفيش نتايج</p>`;
  }
  $("#quickResults").onclick = e => { const t = e.target.closest("[data-open-p]"); if (t) openProduct(t.dataset.openP); };

  /* nav */
  $("#burger").onclick = () => $("#nav").classList.toggle("open");
  function closeNav() { $("#nav").classList.remove("open"); }

  /* ---------------- PRODUCT ---------------- */
  let sel = {};
  function openProduct(id) {
    const p = PRODUCTS.find(x => x.id === id);
    const sizes = sizesFor(p);
    sel = { p, size: null, color: p.colors[0], qty: 1 };
    const m = $("#productModal");
    m.innerHTML = `<button class="x" data-close>×</button>
      <div class="pm">
        <div class="pm-img"><img src="${img(p.img)}" alt="${p.name}"></div>
        <div class="pm-body">
          <span class="eyebrow">${{ boys: "ولادي", girls: "بناتي", baby: "بيبي" }[p.cat]}${p.also ? " / بناتي" : ""}</span>
          <h3>${p.name}</h3>
          <div class="pm-price"><b>${fmt(finalPrice(p))}</b>${p.offer ? `<s>${fmt(p.price)}</s>` : ""}</div>
          <div><div class="lbl">اللون</div><div class="opts" id="pmColors">${p.colors.map((c, i) => `<button class="copt ${i ? "" : "on"}" data-c="${c}" style="background:${c}" aria-label="لون"></button>`).join("")}</div></div>
          <div><div class="lbl"><span>المقاس (حسب السن)</span><button data-open="sizeGuide">جدول المقاسات</button></div>
            <div class="opts" id="pmSizes">${sizes.map(s => `<button class="opt" data-s="${s}">${s}</button>`).join("")}</div></div>
          <div><div class="lbl">الكمية</div><div class="qty"><button data-q="1">+</button><b id="pmQty">1</b><button data-q="-1">−</button></div></div>
          <div class="note">قطن مريح على جلد الأطفال، وسهل في الغسيل. ${p.offer ? `عليه خصم الأسبوع ${STORE.weeklyOffer}%.` : ""}</div>
          <p class="err" id="pmErr"></p>
          <button class="btn btn-coral full" id="pmAdd">أضيفي للسلة</button>
        </div>
      </div>`;
    openLayer(m);
    $("#pmColors").onclick = e => { const b = e.target.closest(".copt"); if (!b) return; sel.color = b.dataset.c; $$("#pmColors .copt").forEach(x => x.classList.toggle("on", x === b)); };
    $("#pmSizes").onclick = e => { const b = e.target.closest(".opt"); if (!b) return; sel.size = b.dataset.s; $("#pmErr").textContent = ""; $$("#pmSizes .opt").forEach(x => x.classList.toggle("on", x === b)); };
    m.querySelector(".qty").onclick = e => { const b = e.target.closest("[data-q]"); if (!b) return; sel.qty = Math.max(1, sel.qty + +b.dataset.q); $("#pmQty").textContent = sel.qty; };
    $("#pmAdd").onclick = () => {
      if (!sel.size) { $("#pmErr").textContent = "اختاري المقاس الأول"; return; }
      addToCart(sel.p.id, sel.size, sel.color, sel.qty);
      closeAll(); toast("اتضافت للسلة"); setTimeout(openCart, 350);
    };
  }

  /* ---------------- CART ---------------- */
  function save() {
    localStorage.setItem("bm_cart", JSON.stringify(state.cart));
    const n = state.cart.reduce((a, b) => a + b.qty, 0);
    const c = $("#cartCount"); c.textContent = n; c.classList.add("bump"); setTimeout(() => c.classList.remove("bump"), 300);
  }
  function addToCart(id, size, color, qty) {
    const k = state.cart.find(i => i.id === id && i.size === size && i.color === color);
    k ? k.qty += qty : state.cart.push({ id, size, color, qty });
    save();
  }
  const subtotal = () => state.cart.reduce((a, i) => a + finalPrice(PRODUCTS.find(p => p.id === i.id)) * i.qty, 0);
  const drawer = $("#drawer");
  const stepsBar = n => `<div class="steps">${[1, 2, 3].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</div>`;
  $("#openCart").onclick = openCart;

  function openCart() {
    const items = state.cart;
    drawer.innerHTML = `<div class="dh"><h3>السلة</h3><button class="x" data-close>×</button></div>${stepsBar(1)}
      <div class="db">${items.length ? items.map((i, k) => {
        const p = PRODUCTS.find(x => x.id === i.id);
        return `<div class="line-item"><img src="${img(p.img)}" alt=""><div><h5>${p.name}</h5><small>مقاس ${i.size} <i style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${i.color};vertical-align:middle"></i></small><br>
          <div class="qty" data-k="${k}"><button data-d="1">+</button><b>${i.qty}</b><button data-d="-1">−</button></div></div>
          <b style="font-family:var(--latin)">${finalPrice(p) * i.qty}</b><button class="rm" data-rm="${k}" aria-label="حذف">×</button></div>`;
      }).join("") : `<div class="empty">السلة فاضية<br>اختاري قطعة من الكتالوج</div>`}</div>
      <div class="df">${items.length ? `
        <div class="row"><span>المنتجات</span><span>${fmt(subtotal())}</span></div>
        <div class="row"><span>الشحن</span><span>${fmt(STORE.shipping)}</span></div>
        <div class="row total"><span>الإجمالي</span><b>${fmt(subtotal() + STORE.shipping)}</b></div>
        <button class="btn btn-coral full" id="toCheckout">إتمام الطلب</button>` : `<button class="btn btn-ink full" data-close>تسوقي</button>`}</div>`;
    openLayer(drawer);
    drawer.querySelector(".db").onclick = e => {
      const rm = e.target.closest("[data-rm]"); if (rm) { state.cart.splice(+rm.dataset.rm, 1); save(); return openCart(); }
      const d = e.target.closest("[data-d]"); if (d) { const it = state.cart[+d.closest("[data-k]").dataset.k]; it.qty += +d.dataset.d; if (it.qty < 1) state.cart.splice(state.cart.indexOf(it), 1); save(); openCart(); }
    };
    const go = $("#toCheckout"); if (go) go.onclick = checkout;
  }

  function checkout() {
    drawer.querySelector(".steps").outerHTML = stepsBar(2);
    drawer.querySelector(".dh h3").textContent = "بيانات التوصيل";
    drawer.querySelector(".db").innerHTML = `<form class="form" id="coForm" novalidate>
      <input name="name" placeholder="اسم ولي الأمر" autocomplete="name">
      <input name="phone" placeholder="رقم الموبايل" inputmode="tel" autocomplete="tel">
      <div class="two"><select name="gov">${["الشرقية", "القاهرة", "الجيزة", "القليوبية", "الدقهلية", "الغربية", "الإسكندرية", "محافظة تانية"].map(g => `<option>${g}</option>`).join("")}</select><input name="city" placeholder="المدينة / المنطقة"></div>
      <input name="address" placeholder="العنوان بالتفصيل">
      <div class="lbl" style="margin:4px 0 0">طريقة الاستلام</div>
      <div class="pay"><label><input type="radio" name="ship" value="توصيل للبيت" checked>توصيل للبيت</label><label><input type="radio" name="ship" value="استلام من فرع الزقازيق">من الفرع</label></div>
      <textarea name="notes" rows="2" placeholder="ملاحظات (اختياري)"></textarea>
      <p class="err" id="coErr"></p></form>`;
    drawer.querySelector(".df").innerHTML = `<div class="row total"><span>الإجمالي</span><b>${fmt(subtotal() + STORE.shipping)}</b></div>
      <button class="btn btn-coral full" id="placeOrder">مراجعة وإرسال</button><button class="btn btn-ghost full" id="backCart">رجوع للسلة</button>`;
    $("#backCart").onclick = openCart;
    $("#placeOrder").onclick = placeOrder;
  }

  function placeOrder() {
    const f = Object.fromEntries(new FormData($("#coForm")));
    const err = $("#coErr");
    if (!f.name.trim()) return err.textContent = "اكتبي الاسم";
    if (!/^01[0125]\d{8}$/.test(f.phone.trim())) return err.textContent = "رقم الموبايل لازم 11 رقم ويبدأ بـ 01";
    if (f.ship === "توصيل للبيت" && !f.address.trim()) return err.textContent = "اكتبي العنوان";
    const id = "BM-" + Math.floor(1000 + Math.random() * 9000);
    const ship = f.ship === "توصيل للبيت" ? STORE.shipping : 0;
    const lines = state.cart.map(i => { const p = PRODUCTS.find(x => x.id === i.id); return `- ${p.name} | مقاس ${i.size} | ${i.qty} × ${finalPrice(p)}`; }).join("\n");
    const msg = `طلب جديد ${id}\n${lines}\nالإجمالي: ${subtotal() + ship} ج.م\nالاسم: ${f.name}\nالموبايل: ${f.phone}\nالاستلام: ${f.ship}${f.ship === "توصيل للبيت" ? `\nالعنوان: ${[f.gov, f.city, f.address].filter(Boolean).join(" - ")}` : ""}${f.notes ? `\nملاحظات: ${f.notes}` : ""}`;

    drawer.querySelector(".steps").outerHTML = stepsBar(3);
    drawer.querySelector(".dh h3").textContent = "إرسال الطلب";
    drawer.querySelector(".db").innerHTML = `<div class="done-head"><span class="muted">رقم الطلب</span><b>${id}</b></div>
      <div class="phone"><div class="screen"><div class="wa-top"><span class="av">ب</span><div>بومبا وميمونة<small>متصل الآن</small></div></div><div class="wa-chat" id="waChat"></div></div></div>
      <p class="sim-note">محاكاة: كده الطلب بيوصل المحل على الواتساب.</p>`;
    drawer.querySelector(".df").innerHTML = `<a class="btn btn-ink full" target="_blank" rel="noopener" href="https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}">افتح الطلب في واتساب</a>
      <button class="btn btn-ghost full" data-close>تمام</button>`;
    simulateChat(msg, f.name);
    state.cart = []; save();
  }

  function simulateChat(msg, name) {
    const chat = $("#waChat");
    const add = (html, cls = "") => { const d = document.createElement("div"); d.className = "bubble " + cls; d.innerHTML = html; chat.appendChild(d); chat.scrollTop = chat.scrollHeight; return d; };
    add(msg.replace(/</g, "&lt;") + `<span class="tick">✓✓</span>`);
    setTimeout(() => { const t = document.createElement("div"); t.className = "typing"; t.innerHTML = "<i></i><i></i><i></i>"; chat.appendChild(t); chat.scrollTop = chat.scrollHeight;
      setTimeout(() => { t.remove(); add(`أهلاً ${name.replace(/</g, "")}، طلبك وصلنا. هنكلمك خلال ساعات للتأكيد.`, "in"); }, 1400);
    }, reduced ? 0 : 900);
  }

  /* ---------------- COUNTDOWN (to next Friday midnight) ---------------- */
  function tick() {
    const now = new Date(), end = new Date(now);
    end.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7)); end.setHours(0, 0, 0, 0);
    let s = Math.max(0, (end - now) / 1000);
    const d = Math.floor(s / 86400); s %= 86400; const h = Math.floor(s / 3600); s %= 3600; const m = Math.floor(s / 60), sec = Math.floor(s % 60);
    $("#countdown").innerHTML = [[d, "يوم"], [h, "ساعة"], [m, "دقيقة"], [sec, "ثانية"]].map(([v, l]) => `<div><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
  }
  tick(); setInterval(tick, 1000);

  /* ---------------- TOAST ---------------- */
  let tt;
  function toast(t) { const el = $("#toast"); el.textContent = t; el.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("on"), 1800); }

  render(); save();
})();
