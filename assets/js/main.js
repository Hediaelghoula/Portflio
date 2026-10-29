/* ============================================================
   Hedia Elghoula — Portfolio
   Interactions & behaviours
   ============================================================ */
(function () {
  "use strict";

  const doc = document;
  const root = doc.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = doc) => ctx.querySelector(sel);
  const $$ = (sel, ctx = doc) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Theme ---------- */
  const themeToggle = $("#themeToggle");
  const STORAGE_KEY = "hedia-portfolio-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (themeToggle) {
      themeToggle.setAttribute("aria-pressed", String(theme === "light"));
      themeToggle.setAttribute("aria-label", theme === "light" ? "Activer le thème sombre" : "Activer le thème clair");
    }
    const meta = doc.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "light" ? "#f5f8fc" : "#05080f");
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }
  applyTheme(savedTheme === "light" || savedTheme === "dark" ? savedTheme : "dark");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      applyTheme(next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* ignore */ }
    });
  }

  /* ---------- Header, progress, back to top ---------- */
  const header = $("#siteHeader");
  const scrollBar = $("#scrollBar");
  const toTop = $("#toTop");

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle("is-scrolled", y > 12);
    if (scrollBar) {
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      scrollBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }
    if (toTop) toTop.classList.toggle("is-visible", y > 640);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Mobile navigation ---------- */
  const menuToggle = $("#menuToggle");
  const navClose = $("#navClose");
  const mainNav = $("#mainNav");
  const navLinks = $$(".nav-link");

  function setNav(open) {
    if (!mainNav || !menuToggle) return;
    mainNav.classList.toggle("is-open", open);
    doc.body.classList.toggle("nav-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
    if (open) {
      const first = mainNav.querySelector("a, button");
      if (first) first.focus({ preventScroll: true });
    }
  }

  if (menuToggle) menuToggle.addEventListener("click", () => setNav(!mainNav.classList.contains("is-open")));
  if (navClose) navClose.addEventListener("click", () => setNav(false));
  navLinks.forEach((link) => link.addEventListener("click", () => setNav(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mainNav && mainNav.classList.contains("is-open")) {
      setNav(false);
      if (menuToggle) menuToggle.focus();
    }
  });

  /* ---------- Scroll spy ---------- */
  const spySections = ["accueil", "a-propos", "projets", "parcours", "competences", "contact"]
    .map((id) => doc.getElementById(id))
    .filter(Boolean);

  function updateActiveLink() {
    const offset = window.innerHeight * 0.32;
    let current = spySections[0] ? spySections[0].id : null;
    spySections.forEach((section) => {
      if (section.getBoundingClientRect().top <= offset) current = section.id;
    });
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-active", isActive);
      if (isActive) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", updateActiveLink, { passive: true });
  updateActiveLink();

  /* ---------- Typewriter ---------- */
  const typed = $("#typed");
  if (typed) {
    const words = JSON.parse(typed.dataset.words || '["systèmes embarqués"]');
    if (reduceMotion) {
      typed.textContent = words[0];
    } else {
      let wordIndex = 0;
      let charIndex = 0;
      let deleting = false;

      function tick() {
        const word = words[wordIndex];
        if (!deleting) {
          charIndex++;
          typed.textContent = word.slice(0, charIndex);
          if (charIndex === word.length) {
            deleting = true;
            return setTimeout(tick, 2100);
          }
          return setTimeout(tick, 65 + Math.random() * 45);
        }
        charIndex--;
        typed.textContent = word.slice(0, charIndex);
        if (charIndex === 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          return setTimeout(tick, 320);
        }
        return setTimeout(tick, 32);
      }
      setTimeout(tick, 700);
    }
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$("[data-reveal]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = ((i % 4) * 55) + "ms";
      revealObserver.observe(el);
    });

    // Fallback: reveal anything already in the viewport (also covers
    // browsers/panes where IntersectionObserver callbacks are throttled).
    let revealTicking = false;
    function revealInView() {
      const limit = window.innerHeight * 0.98;
      revealEls.forEach((el) => {
        if (el.classList.contains("is-visible")) return;
        const rect = el.getBoundingClientRect();
        if (rect.top < limit && rect.bottom > 0) {
          el.classList.add("is-visible");
          revealObserver.unobserve(el);
        }
      });
      revealTicking = false;
    }
    function requestRevealCheck() {
      if (revealTicking) return;
      revealTicking = true;
      window.setTimeout(() => {
        revealInView();
        revealTicking = false;
      }, 90);
    }
    window.addEventListener("scroll", requestRevealCheck, { passive: true });
    window.addEventListener("resize", requestRevealCheck);
    window.addEventListener("load", revealInView);
    revealInView();
  }

  /* ---------- Animated counters ---------- */
  const counters = $$(".count");
  if (counters.length) {
    const animateCount = (el) => {
      const target = Number(el.dataset.count || 0);
      const duration = 1300;
      const start = performance.now();
      function frame(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = String(Math.round(target * eased));
        if (progress < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    };

    if (reduceMotion || !("IntersectionObserver" in window)) {
      counters.forEach((el) => { el.textContent = el.dataset.count; });
    } else {
      const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });
      counters.forEach((el) => counterObserver.observe(el));
    }
  }

  /* ---------- Project filters ---------- */
  const filterButtons = $$(".filter-btn");
  const projectCards = $$(".project-card");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filter = btn.dataset.filter;
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      projectCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        const show = filter === "all" || categories.includes(filter);
        card.classList.toggle("is-hidden", !show);
        if (show) {
          card.classList.add("is-visible");
          card.style.animation = "none";
          void card.offsetWidth;
          card.style.animation = "cardIn .45s cubic-bezier(.22,1,.36,1) both";
        }
      });
    });
  });

  /* ---------- Project modal ---------- */
  const projects = {
    sentinelle: {
      title: "Sentinelle IoT",
      kicker: "Projet académique · EPI Digital School",
      badge: "IoT · IA · Web",
      image: "assets/img/project-sentinelle.svg",
      alt: "Supervision du système de détection d'intrusion Sentinelle IoT",
      desc: "Un système de sécurité connecté qui détecte les intrusions, contrôle les accès et centralise la supervision d'un site en temps réel. Le projet couvre toute la chaîne : capteurs, vision embarquée, API et tableau de bord.",
      features: [
        "Détection de mouvement et capture vidéo via ESP32-CAM",
        "Contrôle d'accès et alertes en temps réel",
        "Modèle de vision entraîné avec TensorFlow",
        "API Flask et supervision Angular synchronisée avec Firebase",
        "Prototypage et validation du montage sur Wokwi"
      ],
      stack: ["ESP32", "ESP32-CAM", "Python", "TensorFlow", "Flask", "Angular", "Firebase", "Wokwi"],
      role: "Conception du montage, développement du firmware, intégration du modèle de détection, API et interface de supervision."
    },
    glowix: {
      title: "Glowix",
      kicker: "Projet académique · EPI Digital School",
      badge: "IoT · Web · Mobile",
      image: "assets/img/project-glowix.svg",
      alt: "Tableau de bord et application mobile Glowix",
      desc: "Glowix collecte les mesures environnementales d'un site industriel, les transmet via MQTT et les restitue sur un tableau de bord web et une application mobile, avec alertes de seuil.",
      features: [
        "Acquisition des données environnementales par capteurs ESP32",
        "Transmission temps réel via MQTT et synchronisation Firebase",
        "Dashboard web et application mobile React Native / Expo",
        "Alertes de dépassement de seuil et automatisations",
        "Suivi multi-zones et historique des mesures"
      ],
      stack: ["ESP32", "C/C++", "MQTT", "Firebase", "React Native", "Expo"],
      role: "Firmware ESP32, architecture MQTT, modélisation des données Firebase et développement des interfaces web et mobile."
    },
    robot: {
      title: "SécuriBot",
      kicker: "Projet académique · EPI Digital School",
      badge: "IoT · Robotique",
      image: "assets/img/project-robot.svg",
      alt: "Robot mobile SécuriBot en patrouille",
      desc: "Robot mobile autonome dédié à la sécurité domestique : patrouille, évitement d'obstacles, détection d'intrusions et supervision à distance via Node-RED.",
      features: [
        "Patrouille autonome et évitement d'obstacles",
        "Détection de présence et remontée d'alerte via MQTT",
        "Écran OLED pour l'état et les mesures locales",
        "Dashboard de supervision Node-RED",
        "Commande et suivi à distance"
      ],
      stack: ["STM32", "C/C++", "MQTT", "L298N", "OLED SSD1306", "Node-RED"],
      role: "Programmation STM32, pilotage des moteurs, intégration des capteurs, communication MQTT et flux Node-RED."
    },
    fraude: {
      title: "Bouclier",
      kicker: "Stage de fin d'études · OXYDEV · 2024",
      badge: "Web",
      image: "assets/img/project-fraude.svg",
      alt: "Tableau de bord de l'application anti-fraude Bouclier",
      desc: "Application web de détection et de prévention des fraudes, pensée pour centraliser les transactions à risque, suivre les alertes et faciliter la décision des analystes.",
      features: [
        "Interfaces de suivi des transactions et des alertes",
        "Tableaux de bord de synthèse et de reporting",
        "Gestion des utilisateurs et des accès",
        "Modélisation des données et requêtes MySQL",
        "Interface responsive avec Bootstrap"
      ],
      stack: ["Symfony", "PHP", "MySQL", "Bootstrap"],
      role: "Conception et développement de l'application web, de la base de données aux interfaces."
    },
    maklada: {
      title: "Maklada",
      kicker: "Stage d'été · Maklada · 2023",
      badge: "Web",
      image: "assets/img/project-maklada.svg",
      alt: "Interface d'inventaire de Maklada",
      desc: "Application web de gestion du parc informatique : inventaire des équipements, suivi des affectations, maintenance et reporting pour l'équipe IT.",
      features: [
        "Inventaire centralisé des équipements",
        "Suivi des affectations et des utilisateurs",
        "Gestion des interventions de maintenance",
        "Tableaux de bord et exports",
        "Interfaces responsive en HTML/CSS"
      ],
      stack: ["Laravel", "PHP", "PostgreSQL", "HTML/CSS"],
      role: "Développement des modules de gestion, modélisation PostgreSQL et intégration front-end."
    },
    autocare: {
      title: "AutoCare",
      kicker: "Projet académique · EPI Digital School",
      badge: "Web · Mobile",
      image: "assets/img/project-autocare.svg",
      alt: "Agenda et application mobile AutoCare",
      desc: "Plateforme de gestion des services d'entretien automobile : réservation de rendez-vous, suivi des interventions et historique complet du véhicule, côté client comme côté garage.",
      features: [
        "Prise de rendez-vous et calendrier des interventions",
        "Historique et carnet d'entretien du véhicule",
        "Suivi des statuts côté garage",
        "Application mobile Expo et back-office Angular",
        "Base MongoDB pour les services et véhicules"
      ],
      stack: ["Angular", "React Native", "Expo", "MongoDB"],
      role: "Conception des parcours, développement du back-office web et de l'application mobile."
    }
  };

  const modal = $("#projectModal");
  const modalImage = $("#modalImage");
  const modalBadge = $("#modalBadge");
  const modalKicker = $("#modalKicker");
  const modalTitle = $("#modalTitle");
  const modalDesc = $("#modalDesc");
  const modalFeatures = $("#modalFeatures");
  const modalStack = $("#modalStack");
  const modalRole = $("#modalRole");
  let lastFocused = null;

  function openModal(id) {
    const data = projects[id];
    if (!data || !modal) return;
    lastFocused = doc.activeElement;

    modalImage.src = data.image;
    modalImage.alt = data.alt;
    modalBadge.textContent = data.badge;
    modalKicker.textContent = data.kicker;
    modalTitle.textContent = data.title;
    modalDesc.textContent = data.desc;
    modalRole.textContent = data.role;
    modalFeatures.innerHTML = data.features.map((f) => "<li>" + f + "</li>").join("");
    modalStack.innerHTML = data.stack.map((s) => "<li>" + s + "</li>").join("");

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    doc.body.classList.add("modal-open");
    const panel = modal.querySelector(".modal-panel");
    const closeBtn = modal.querySelector(".modal-close");
    panel.scrollTop = 0;
    window.setTimeout(() => {
      if (!modal.classList.contains("is-open")) return;
      (closeBtn || panel).focus({ preventScroll: true });
      panel.scrollTop = 0;
    }, 80);
  }

  function closeModal() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    doc.body.classList.remove("modal-open");
    modalImage.src = "";
    if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus({ preventScroll: true });
  }

  $$(".project-media").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = btn.closest(".project-card");
      if (card) openModal(card.dataset.project);
    });
  });

  if (modal) {
    $$("[data-close-modal]", modal).forEach((el) => el.addEventListener("click", closeModal));
    doc.addEventListener("keydown", (e) => {
      if (!modal.classList.contains("is-open")) return;
      if (e.key === "Escape") { closeModal(); return; }
      if (e.key === "Tab") {
        const focusables = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal)
          .filter((el) => el.offsetParent !== null);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Copy email ---------- */
  const copyBtn = $("#copyEmail");
  const email = "hediaelghoula5@gmail.com";
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const tooltip = copyBtn.querySelector(".copy-tooltip");
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(email);
        } else {
          const ta = doc.createElement("textarea");
          ta.value = email;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          doc.body.appendChild(ta);
          ta.select();
          doc.execCommand("copy");
          ta.remove();
        }
        copyBtn.classList.add("copied");
        if (tooltip) tooltip.textContent = "Copié !";
        setTimeout(() => {
          copyBtn.classList.remove("copied");
          if (tooltip) tooltip.textContent = "Copier";
        }, 2000);
      } catch (err) {
        window.location.href = "mailto:" + email;
      }
    });
  }

  /* ---------- Contact form ---------- */
  const form = $("#contactForm");
  const formStatus = $("#formStatus");

  function setError(field, message) {
    const wrap = field.closest(".field");
    const slot = wrap ? wrap.querySelector(".field-error") : null;
    if (wrap) wrap.classList.toggle("has-error", Boolean(message));
    if (slot) slot.textContent = message || "";
    field.setAttribute("aria-invalid", message ? "true" : "false");
  }

  if (form) {
    const fields = ["name", "email", "subject", "message"].map((id) => doc.getElementById(id));

    fields.forEach((field) => {
      if (!field) return;
      field.addEventListener("input", () => {
        if (field.closest(".field")?.classList.contains("has-error")) setError(field, "");
        if (formStatus) formStatus.textContent = "";
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      let valid = true;
      const values = {};

      fields.forEach((field) => {
        if (!field) return;
        const value = field.value.trim();
        values[field.name] = value;
        let error = "";
        if (!value) {
          error = "Ce champ est requis.";
        } else if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
          error = "Merci de saisir une adresse email valide.";
        }
        setError(field, error);
        if (error) valid = false;
      });

      if (!valid) {
        const firstError = form.querySelector(".has-error input, .has-error textarea");
        if (firstError) firstError.focus();
        if (formStatus) {
          formStatus.style.color = "#fb7185";
          formStatus.textContent = "Merci de vérifier les champs en rouge.";
        }
        return;
      }

      const subject = encodeURIComponent("[Portfolio] " + values.subject);
      const body = encodeURIComponent(
        "Bonjour Hedia,\n\n" + values.message + "\n\n—\n" + values.name + "\n" + values.email
      );
      window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;

      if (formStatus) {
        formStatus.style.color = "";
        formStatus.textContent = "Votre messagerie va s'ouvrir avec le message pré-rempli.";
      }
    });
  }

  /* ---------- Year ---------- */
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Cursor glow (desktop only) ---------- */
  if (!reduceMotion && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    const glow = doc.createElement("div");
    glow.className = "cursor-glow";
    glow.setAttribute("aria-hidden", "true");
    doc.body.appendChild(glow);

    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let cx = gx;
    let cy = gy;
    let raf = null;

    window.addEventListener("pointermove", (e) => {
      gx = e.clientX;
      gy = e.clientY;
      glow.style.opacity = "1";
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    doc.addEventListener("mouseleave", () => { glow.style.opacity = "0"; });

    function loop() {
      cx += (gx - cx) * 0.12;
      cy += (gy - cy) * 0.12;
      glow.style.transform = "translate(" + cx + "px, " + cy + "px) translate(-50%, -50%)";
      if (Math.abs(gx - cx) > 0.5 || Math.abs(gy - cy) > 0.5) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    }
  }
})();
