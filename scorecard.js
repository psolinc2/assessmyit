(function () {
  var CATS = [
    { name: "Responsiveness and trust", q: [
      "When you have an IT issue, do you usually hear back within the time you expect?",
      "Do you work with the same small group of people who understand your firm and your staff?",
      "If a major issue happened tonight, do you know exactly who to call?",
      "Do you view your IT provider as a trusted advisor rather than someone who only fixes problems?"] },
    { name: "Security and risk", q: [
      "Are you confident that everyone who accesses firm data, partners included, is properly protected with modern security controls?",
      "Would you be alerted if someone in the firm fell for a phishing email or other scam?",
      "Would you know if a security weakness existed inside your firm and remained unresolved?",
      "Has anyone helped you understand the cybersecurity requirements being imposed by clients, courts, insurers or regulators?"] },
    { name: "Backup and continuity", q: [
      "If a file from an active matter disappeared tomorrow, are you confident it could be recovered?",
      "If ransomware encrypted every computer in the office, do you know how long you would be down?",
      "Could your firm keep operating for a week if your case management system became unavailable?",
      "Has anyone proven to you that your data can actually be recovered after a disaster?"] },
    { name: "Strategy and planning", q: [
      "Do you receive regular reviews that explain what is working, what is not, and what should be improved?",
      "Do you know what major technology expenses are likely over the next 12 months?",
      "Have you ever received a written review explaining where your firm is exposed to technology, security or compliance risk?",
      "Can your IT provider show how technology problems affect staff productivity or billable time?"] },
    { name: "Ownership and control", q: [
      "Does the firm, not your IT company, control its Microsoft 365 account, domain names and critical passwords?",
      "If you requested all of your firm's technology documentation tomorrow, would you receive it without resistance?",
      "Is there a documented process for setting up and removing access when attorneys and staff join or leave?",
      "If your IT company disappeared tomorrow, could another firm take over without starting from scratch?"] },
    { name: "Client and professional duties", q: [
      "If your largest client audited your cybersecurity practices tomorrow, would you feel prepared to show them evidence?",
      "Has anyone reviewed whether your technology practices meet your professional obligations to safeguard client information?",
      "Are you confident your cyber insurance application accurately reflects your current environment?",
      "If a data breach occurred tomorrow, does everyone know who needs to be notified and what happens next?"] }
  ];
  var PRIORITY = [5, 9, 10, 17]; // 1-indexed question numbers; a 0 here is flagged
  var ASK = {
    1: "Ask for response and resolution targets in writing, and the last three months of actual results.",
    2: "Ask who your named contacts are and who covers them.",
    3: "Ask for the emergency number and ask them to test it with you.",
    4: "Ask what your provider would do for the firm in a serious incident: who speaks to clients, the insurer and regulators, and who makes the decisions.",
    5: "Ask for proof that MFA is enforced for every account, including partners and shared mailboxes, and for the conditional access settings behind it.",
    6: "Ask what phishing training or testing was done in the last 12 months, and how staff report suspicious email.",
    7: "Ask for a monthly device report showing missing patches and protection, and what was fixed.",
    8: "Ask for a short written summary of what your clients, insurer and regulators require, and where you stand.",
    9: "Ask for the date and written result of the last restore test of a matter folder or mailbox.",
    10: "Ask for the written disaster recovery plan, with recovery time and data loss targets, and the last time it was tested.",
    11: "Ask which systems the firm depends on, what each one's vendor outage plan is, and what the manual fallback is.",
    12: "Ask for the date and written result of the last two restore tests, and the backup and restore test schedule.",
    13: "Ask for a quarterly review on the calendar with real numbers.",
    14: "Ask for a 12 month budget forecast including hardware and license renewals.",
    15: "Ask for a short written risk list with owners and dates.",
    16: "Ask for a trend of ticket volume by user and category, so lost time is visible.",
    17: "Confirm who owns the Microsoft 365 tenant and domain registration, who holds global admin, and where the passwords are kept.",
    18: "Ask for current network, systems and account documentation, delivered to you.",
    19: "Ask for the onboarding and offboarding checklist.",
    20: "Ask for a written transition plan and exit terms. Read your contract for term, auto-renewal and notice.",
    21: "Ask for an evidence package: security controls in place, backup results, training records and policies.",
    22: "Ask for a written mapping of your controls to your duties of competence and confidentiality (ABA Model Rules 1.1 and 1.6(c), and California State Bar guidance).",
    23: "Compare your insurance application answers with what is actually deployed.",
    24: "Ask for the written incident response plan, with contacts, notification steps and carrier notice timing."
  };
  var root = document.getElementById("questions");
  var n = 0, flat = [];
  CATS.forEach(function (c, ci) {
    var sec = document.createElement("section");
    sec.className = "cat";
    sec.innerHTML = "<h2>" + (ci + 1) + ". " + c.name + "</h2>";
    c.q.forEach(function (text) {
      n++;
      flat.push({ n: n, cat: ci, text: text });
      var d = document.createElement("div");
      d.className = "q";
      d.innerHTML = "<p>" + n + ". " + text + "</p><div class='opts'>" +
        "<label><input type='radio' name='q" + n + "' value='2'> Yes</label>" +
        "<label><input type='radio' name='q" + n + "' value='1'> Partly or not sure</label>" +
        "<label><input type='radio' name='q" + n + "' value='0'> No</label></div>";
      sec.appendChild(d);
    });
    root.appendChild(sec);
  });

  var bar = document.getElementById("bar"), count = document.getElementById("count");
  function answers() {
    var a = [];
    flat.forEach(function (f) {
      var el = document.querySelector("input[name=q" + f.n + "]:checked");
      a.push(el ? parseInt(el.value, 10) : null);
    });
    return a;
  }
  function update() {
    var a = answers(), done = a.filter(function (x) { return x !== null; }).length;
    count.textContent = done + " of 24 answered";
    bar.style.width = (done / 24 * 100) + "%";
  }
  root.addEventListener("change", update);
  update();

  function tierFor(s) {
    if (s <= 20) return { t: "Significant exposure", line: "Your firm may have material gaps in security, continuity, ownership or risk management that deserve attention.",
      body: "Your answers suggest you have an IT vendor that fixes problems when you report them, but gives you little visibility into what is protected or what happens in a bad week. That is common, and it is often nobody's fault. The areas below are the ones worth raising with your provider first. Most of them cost little to fix." };
    if (s <= 36) return { t: "Reasonably protected, with gaps", line: "Your firm appears to have the fundamentals in place, but several areas should be reviewed before they become larger problems.",
      body: "You probably get responsive help day to day. The weak spots are usually proof: tested recovery, written plans and regular reporting. The items below are what to ask for at your next review. If your provider can't produce them, that is useful to know before your renewal date." };
    return { t: "Well positioned", line: "Your firm shows strong oversight of technology, security and business continuity, although periodic review is still recommended.",
      body: "Review the flagged items, and make sure the paperwork (recovery plan, account ownership, exit terms) is current and held by the firm, not only by the provider." };
  }

  var result = document.getElementById("result");
  var state = null;
  document.getElementById("see").addEventListener("click", function () {
    var a = answers();
    if (a.indexOf(null) !== -1) {
      var first = a.indexOf(null) + 1;
      alert("Question " + first + " is not answered yet.");
      var el = document.querySelector("input[name=q" + first + "]");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    var total = a.reduce(function (x, y) { return x + y; }, 0);
    var tier = tierFor(total);
    var cats = CATS.map(function (c, ci) {
      var s = 0, m = c.q.length * 2;
      flat.forEach(function (f, i) { if (f.cat === ci) s += a[i]; });
      return { name: c.name, s: s, m: m };
    });
    var order = flat.map(function (f, i) { return { n: f.n, text: f.text, s: a[i] }; })
      .sort(function (x, y) { return x.s - y.s || x.n - y.n; }).slice(0, 3);
    var flags = PRIORITY.filter(function (p) { return a[p - 1] === 0; });
    state = { total: total, tier: tier.t, cats: cats, low: order, flags: flags, a: a };

    var h = "<div class='score'>" + total + " <span style='font-size:20px;color:#5b6578'>/ 48</span></div>" +
      "<h2 style='margin-top:10px'>" + tier.t + "</h2><p><strong>" + tier.line + "</strong></p><p>" + tier.body + "</p>" +
      "<h3>By category</h3>";
    cats.forEach(function (c) {
      h += "<div class='catrow'><span>" + c.name + "</span><div class='bar'><i style='width:" + (c.s / c.m * 100) + "%'></i></div><span>" + c.s + "/" + c.m + "</span></div>";
    });
    if (flags.length) {
      h += "<h3>Priority items</h3>";
      flags.forEach(function (p) {
        h += "<div class='flag'>Question " + p + ": " + flat[p - 1].text + "</div>";
      });
    }
    var concern = cats.map(function (c) { return { name: c.name, r: c.s / c.m }; })
      .filter(function (c) { return c.r < 1; })
      .sort(function (x, y) { return x.r - y.r; }).slice(0, 3);
    if (concern.length) {
      h += "<h3>Your biggest areas of concern</h3><p>Based on your answers, these appear to be the areas of greatest operational risk if left unresolved:</p><ul class='clean'>";
      concern.forEach(function (c) { h += "<li>" + c.name + "</li>"; });
      h += "</ul>";
    }
    h += "<h3>Three weakest answers</h3><ul class='clean'>";
    order.forEach(function (o) { h += "<li>" + o.text + "</li>"; });
    h += "</ul>";
    document.getElementById("resultbody").innerHTML = h;
    result.style.display = "block";
    result.scrollIntoView({ behavior: "smooth" });
  });

  var form = document.getElementById("lead");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!state) return;
    var ask = state.a.map(function (s, i) { return { n: i + 1, score: s, text: flat[i].text, ask: ASK[i + 1] }; });
    var fd = new FormData(form);
    fd.append("score", state.total);
    fd.append("tier", state.tier);
    fd.append("flags", state.flags.join(","));
    fd.append("answers", JSON.stringify(state.a));
    fd.append("page", location.pathname);
    var btn = form.querySelector("button");
    btn.disabled = true; btn.textContent = "Sending...";
    fetch("submit.php", { method: "POST", body: fd })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) {
          form.style.display = "none";
          var t = document.getElementById("thanks");
          t.style.display = "block";
          var rep = "<h3>Your detailed report</h3><div class='tablewrap'><table><tr><th>#</th><th>Question</th><th>Your answer</th><th>What to ask for</th></tr>";
          ask.forEach(function (x) {
            var lab = x.score === 2 ? "Yes" : x.score === 1 ? "Partly / not sure" : "No";
            rep += "<tr><td>" + x.n + "</td><td>" + x.text + "</td><td>" + lab + "</td><td>" + (x.score === 2 ? "Nothing needed. Keep a copy of the evidence." : x.ask) + "</td></tr>";
          });
          rep += "</table></div><p class='note'>Print or save this page as a PDF for your records.</p>";
          document.getElementById("report").innerHTML = rep;
        } else {
          btn.disabled = false; btn.textContent = "Show my detailed report";
          alert((j && j.error) || "Something went wrong. Please try again.");
        }
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = "Show my detailed report";
        alert("Something went wrong. Please try again.");
      });
  });
})();
