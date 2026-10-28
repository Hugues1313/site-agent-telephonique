/* ==========================================================================
   SCRIPT DU SITE (page unique index.html)
   --------------------------------------------------------------------------
    1. Emplacements à remplir (nom du produit, [À COMPLÉTER], coordonnées)
    2. Logo et captures d'écran (chargés automatiquement s'ils existent)
    3. En-tête et menu mobile
    4. Défilement fluide (Lenis) + GSAP / ScrollTrigger
    5. Animations génériques au scroll (data-apparition, data-cascade, data-parallaxe)
    6. Hero : apparition, conversation dans le téléphone, zoom au scroll
    7. Comment ça marche : ligne des étapes + aperçu de l'app à onglets
    8. Il n'invente pas : module à cocher
    9. Vous gardez la main : démo « appel en direct » + schéma du transfert
   10. Formulaire de démo
   La page reste entièrement lisible si GSAP ou Lenis ne se chargent pas.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var JETON_NOM = '[NOM DU PRODUIT]';
  var nomDefini = C.nomProduit && C.nomProduit !== JETON_NOM;
  var surligner = C.surlignerEmplacements !== false;

  // L'utilisateur préfère-t-il limiter les animations ?
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsapOk = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  var anime = gsapOk && !reduit;
  var lenis = null;


  /* 1. EMPLACEMENTS À REMPLIR ============================================== */

  // Coordonnées définies dans config.js (e-mail, téléphone)
  function appliquerContacts() {
    var contact = C.contact || {};
    document.querySelectorAll('[data-contact]').forEach(function (el) {
      var valeur = contact[el.dataset.contact];
      if (!valeur) return;
      el.textContent = valeur;
      el.href = el.dataset.contact === 'email' ? 'mailto:' + valeur : 'tel:' + valeur.replace(/[^\d+]/g, '');
    });
  }

  // Remplace [NOM DU PRODUIT] partout et surligne les [À COMPLÉTER…]
  function remplacerEmplacements() {
    var nom = nomDefini ? C.nomProduit : JETON_NOM;
    var motif = /\[NOM DU PRODUIT\]|\[À COMPLÉTER[^\]]*\]/g;

    // Titre de l'onglet et balises meta
    document.title = document.title.split(JETON_NOM).join(nom);
    document.querySelectorAll('meta[content*="[NOM DU PRODUIT]"]').forEach(function (m) {
      m.setAttribute('content', m.getAttribute('content').split(JETON_NOM).join(nom));
    });

    // Attributs (textes alternatifs, libellés accessibles…)
    ['alt', 'aria-label', 'title', 'placeholder', 'data-alt', 'data-capture-alt'].forEach(function (attr) {
      document.querySelectorAll('[' + attr + '*="[NOM DU PRODUIT]"]').forEach(function (el) {
        el.setAttribute(attr, el.getAttribute(attr).split(JETON_NOM).join(nom));
      });
    });

    // Textes de la page
    var noeuds = [];
    var parcours = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var parent = n.parentNode;
        if (!parent || /^(SCRIPT|STYLE|TEXTAREA|OPTION)$/.test(parent.nodeName)) return NodeFilter.FILTER_REJECT;
        motif.lastIndex = 0;
        return motif.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    while (parcours.nextNode()) noeuds.push(parcours.currentNode);

    noeuds.forEach(function (n) {
      // Pas de surlignage possible dans un SVG : simple remplacement du texte
      if (n.parentNode.namespaceURI === 'http://www.w3.org/2000/svg' || !surligner) {
        n.nodeValue = n.nodeValue.split(JETON_NOM).join(nom);
        return;
      }
      var fragment = document.createDocumentFragment();
      var texte = n.nodeValue;
      var debut = 0;
      var m;
      motif.lastIndex = 0;
      while ((m = motif.exec(texte))) {
        if (m.index > debut) fragment.appendChild(document.createTextNode(texte.slice(debut, m.index)));
        if (m[0] === JETON_NOM && nomDefini) {
          fragment.appendChild(document.createTextNode(nom));
        } else {
          var marque = document.createElement('mark');
          marque.className = 'a-remplir';
          marque.textContent = m[0];
          fragment.appendChild(marque);
        }
        debut = m.index + m[0].length;
      }
      if (debut < texte.length) fragment.appendChild(document.createTextNode(texte.slice(debut)));
      n.parentNode.replaceChild(fragment, n);
    });
  }


  /* 2. LOGO ET CAPTURES ==================================================== */

  // Teste si une image existe, puis appelle « succes » si elle se charge
  function siImageExiste(src, succes) {
    var img = new Image();
    img.onload = function () { succes(src); };
    img.src = src;
  }

  // Le cadre « Logo » est remplacé par le logo indiqué dans config.js
  function chargerLogo() {
    var cadres = document.querySelectorAll('[data-logo]');
    if (!cadres.length || !C.logo) return;
    siImageExiste(C.logo, function (src) {
      cadres.forEach(function (cadre) {
        var img = document.createElement('img');
        img.src = src;
        img.alt = cadre.dataset.alt || '';
        cadre.textContent = '';
        cadre.appendChild(img);
        cadre.classList.add('logo-charge');
      });
    });
  }

  // Les onglets de l'aperçu marqués data-capture="xxx.png" affichent la
  // vraie capture (à la place de la maquette HTML) quand elle est activée dans
  // config.js. La phrase d'explication de l'onglet est conservée.
  function chargerCaptures() {
    var actives = C.captures || {};
    document.querySelectorAll('[data-capture]').forEach(function (bloc) {
      if (!actives[bloc.dataset.capture]) return;
      siImageExiste(bloc.dataset.capture, function (src) {
        Array.prototype.slice.call(bloc.children).forEach(function (enfant) {
          if (!enfant.classList.contains('panneau-phrase')) enfant.remove();
        });
        var img = document.createElement('img');
        img.src = src;
        img.alt = bloc.dataset.captureAlt || '';
        img.className = 'capture-img';
        bloc.appendChild(img);
        if (gsapOk) ScrollTrigger.refresh();
      });
    });
  }


  /* 3. EN-TÊTE ET MENU MOBILE ============================================== */
  function initEntete() {
    var entete = document.getElementById('entete');
    if (!entete) return;
    var burger = entete.querySelector('.burger');

    // Fond de l'en-tête dès qu'on a défilé
    function majFond() { entete.classList.toggle('defile', window.scrollY > 10); }
    majFond();
    window.addEventListener('scroll', majFond, { passive: true });

    function basculer(ouvrir) {
      entete.classList.toggle('ouvert', ouvrir);
      burger.setAttribute('aria-expanded', String(ouvrir));
      burger.setAttribute('aria-label', ouvrir ? 'Fermer le menu' : 'Ouvrir le menu');
    }

    burger.addEventListener('click', function () { basculer(!entete.classList.contains('ouvert')); });
    // Fermeture : clic sur un lien, touche Échap, passage en grand écran
    entete.querySelectorAll('.nav-principale a').forEach(function (a) {
      a.addEventListener('click', function () { basculer(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && entete.classList.contains('ouvert')) { basculer(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 1021px)').addEventListener('change', function (e) {
      if (e.matches) basculer(false);
    });
  }


  /* 4. DÉFILEMENT FLUIDE + GSAP ============================================ */
  function initDefilement() {
    if (gsapOk) {
      gsap.registerPlugin(ScrollTrigger);
      // Évite les recalculs quand la barre d'adresse de Safari iOS apparaît/disparaît
      ScrollTrigger.config({ ignoreMobileResize: true });
    }

    // Pas de défilement fluide si l'utilisateur limite les animations
    if (reduit || typeof window.Lenis === 'undefined') return;

    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    window.lenis = lenis;

    if (gsapOk) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (temps) { lenis.raf(temps * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function boucle(t) { lenis.raf(t); requestAnimationFrame(boucle); })(0);
    }

    // Liens d'ancre (#comment, #demo…) : défilement fluide sous l'en-tête
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        var cible = id.length > 1 && document.querySelector(id);
        if (!cible) return;
        e.preventDefault();
        lenis.scrollTo(cible, { offset: -(document.getElementById('entete').offsetHeight) });
      });
    });
  }


  /* 5. ANIMATIONS GÉNÉRIQUES AU SCROLL =====================================
       data-apparition            → apparaît en glissant vers le haut
       data-apparition="zoom"     → apparaît en zoomant
       data-apparition="gauche"   → glisse depuis la gauche ("droite" aussi)
       data-delai="0.2"           → retarde l'apparition (en secondes)
       data-cascade               → les enfants apparaissent l'un après l'autre
       data-cascade="zoom"        → idem, avec un léger zoom
       data-parallaxe="0.2"       → l'élément défile un peu plus lentement   */
  function initAnimations() {
    if (!anime) return;

    gsap.utils.toArray('[data-apparition]').forEach(function (el) {
      var type = el.dataset.apparition;
      var depart = { opacity: 0, y: 40 };
      if (type === 'zoom') depart = { opacity: 0, scale: 0.94 };
      if (type === 'gauche') depart = { opacity: 0, x: -48 };
      if (type === 'droite') depart = { opacity: 0, x: 48 };
      gsap.from(el, Object.assign(depart, {
        duration: 1, ease: 'power3.out',
        delay: parseFloat(el.dataset.delai || 0),
        scrollTrigger: { trigger: el, start: 'top 88%', once: true }
      }));
    });

    gsap.utils.toArray('[data-cascade]').forEach(function (groupe) {
      var zoom = groupe.dataset.cascade === 'zoom';
      gsap.from(groupe.children, {
        opacity: 0, y: zoom ? 20 : 30, scale: zoom ? 0.9 : 1,
        duration: 0.9, ease: 'power3.out', stagger: 0.12,
        scrollTrigger: { trigger: groupe, start: 'top 85%', once: true }
      });
    });

    gsap.utils.toArray('[data-parallaxe]').forEach(function (el) {
      var force = parseFloat(el.dataset.parallaxe) || 0.2;
      gsap.to(el, {
        yPercent: -force * 100, ease: 'none',
        scrollTrigger: { trigger: el.closest('section') || el, start: 'top top', end: 'bottom top', scrub: true }
      });
    });
  }


  /* 6. HERO ================================================================ */
  function initHero() {
    if (!anime || !document.querySelector('.hero')) return;

    // Apparition au chargement
    gsap.from('.hero-texte > *', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', stagger: 0.1, delay: 0.1 });
    gsap.from('.telephone', { opacity: 0, y: 70, scale: 0.92, duration: 1.3, ease: 'power3.out', delay: 0.25 });

    // Notifications : apparition, puis légère flottaison continue
    gsap.utils.toArray('.notif').forEach(function (notif, i) {
      gsap.from(notif, {
        opacity: 0, scale: 0.8, y: 20, duration: 0.8, ease: 'back.out(1.6)', delay: 1.2 + i * 0.4,
        onComplete: function () {
          gsap.to(notif, { y: '-=8', duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        }
      });
    });

    // La conversation se déroule en boucle dans le téléphone
    var lignes = gsap.utils.toArray('.tel-ligne');
    var tl = gsap.timeline({ repeat: -1, repeatDelay: 0.6, delay: 1.2 });
    tl.set(lignes, { opacity: 0, y: 12 });
    lignes.forEach(function (ligne, i) {
      tl.to(ligne, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' }, i === 0 ? 0.3 : '+=1.1');
    });
    tl.to(lignes, { opacity: 0, duration: 0.4, delay: 2.8 });

    var mm = gsap.matchMedia();

    // Ordinateur : le hero est épinglé, le téléphone zoome, le texte s'efface
    mm.add('(min-width: 901px)', function () {
      gsap.timeline({ scrollTrigger: { trigger: '.hero', start: 'top top', end: '+=70%', scrub: 0.6, pin: true } })
        .to('.hero-texte', { y: -90, opacity: 0, ease: 'none' }, 0)
        .to('.hero-visuel-int', { scale: 1.22, x: '-18%', ease: 'none' }, 0)
        .to('.notif-1', { x: -80, y: -60, opacity: 0, ease: 'none' }, 0)
        .to('.notif-2', { x: 90, y: 40, opacity: 0, ease: 'none' }, 0)
        .to('.hero-defiler', { opacity: 0, ease: 'none' }, 0);
    });

    // Mobile : pas d'épinglage (plus confortable sur iPhone), simple zoom doux
    mm.add('(max-width: 900px)', function () {
      gsap.to('.hero-visuel-int', {
        scale: 1.08, y: -30, ease: 'none',
        scrollTrigger: { trigger: '.hero-visuel', start: 'top 70%', end: 'bottom top', scrub: true }
      });
    });
  }


  /* 7. COMMENT ÇA MARCHE =================================================== */

  // La ligne qui relie les 3 étapes se remplit au scroll
  function initEtapes() {
    var plein = document.querySelector('.etapes-ligne-plein');
    if (!plein || !anime) return;
    var mm = gsap.matchMedia();
    mm.add('(min-width: 861px)', function () {
      gsap.fromTo(plein, { scaleX: 0 }, {
        scaleX: 1, ease: 'none',
        scrollTrigger: { trigger: '.etapes', start: 'top 75%', end: 'bottom 60%', scrub: true }
      });
    });
    mm.add('(max-width: 860px)', function () {
      gsap.fromTo(plein, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: '.etapes', start: 'top 70%', end: 'bottom 70%', scrub: true }
      });
    });
  }

  // Aperçu de l'app : 3 onglets (clic, ou flèches gauche/droite au clavier)
  function initOnglets() {
    var liste = document.querySelector('.onglets[role="tablist"]');
    if (!liste) return;
    var onglets = Array.prototype.slice.call(liste.querySelectorAll('[role="tab"]'));
    var reperes = document.querySelectorAll('.app-nav [data-pour]');

    function activer(onglet, donnerFocus) {
      onglets.forEach(function (o) {
        var actif = o === onglet;
        o.setAttribute('aria-selected', String(actif));
        o.tabIndex = actif ? 0 : -1;
        var panneau = document.getElementById(o.getAttribute('aria-controls'));
        panneau.hidden = !actif;
        if (actif && anime) {
          gsap.fromTo(panneau.children, { opacity: 0, y: 12 },
            { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.06, overwrite: true });
        }
      });
      // La barre latérale de la maquette suit l'onglet actif
      var cle = onglet.id.replace('onglet-', '');
      reperes.forEach(function (r) { r.classList.toggle('actif', r.dataset.pour === cle); });
      if (donnerFocus) onglet.focus();
      if (gsapOk) ScrollTrigger.refresh();
    }

    onglets.forEach(function (o, i) {
      o.addEventListener('click', function () { activer(o); });
      o.addEventListener('keydown', function (e) {
        var pas = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!pas) return;
        e.preventDefault();
        activer(onglets[(i + pas + onglets.length) % onglets.length], true);
      });
    });
  }


  /* 8. IL N'INVENTE PAS ====================================================
     Le visiteur coche les infos de la fiche ; la réponse de l'agent à la même
     question s'adapte. Exemple fictif : « Vous êtes ouverts lundi midi ?
     On serait 10. » */
  function initApprendre() {
    var bloc = document.querySelector('[data-apprendre]');
    if (!bloc) return;
    var cases = bloc.querySelectorAll('input[type="checkbox"]');
    var reponse = bloc.querySelector('.apprendre-reponse');
    var bulle = bloc.querySelector('.apprendre-agent');
    var jauge = bloc.querySelector('.apprendre-jauge .jauge i');
    var pourcentage = bloc.querySelector('[data-pourcentage]');
    var verdict = bloc.querySelector('.apprendre-verdict');
    var VERDICTS = [
      ['Message pour le gérant', 'badge-alerte'],
      ['Réponse partielle', 'badge-transfert'],
      ['Réponse précise', 'badge-info'],
      ['Réponse complète', 'badge-ok']
    ];

    function composer(infos) {
      if (!infos.horaires && !infos.groupes && !infos.tarifs) {
        return "Je n'ai pas encore cette information. Je note votre numéro, le gérant vous rappelle.";
      }
      var phrases = [];
      phrases.push(infos.horaires ? 'Nous sommes fermés le lundi, mais ouverts dès mardi midi.' : 'Je note votre demande pour lundi midi.');
      if (infos.groupes) phrases.push('Pour un groupe de 10, je vous passe le gérant pour tout organiser.');
      else if (!infos.horaires) phrases.push('Le gérant vous confirmera la disponibilité.');
      if (infos.tarifs) phrases.push('Pour info, nous avons un menu groupe à 28 € par personne.');
      return phrases.join(' ');
    }

    function maj() {
      var infos = {};
      var nb = 0;
      cases.forEach(function (c) { infos[c.name] = c.checked; if (c.checked) nb++; });
      var pct = 25 + nb * 25;
      jauge.style.width = pct + '%';
      pourcentage.textContent = pct + ' %';
      verdict.textContent = VERDICTS[nb][0];
      verdict.className = 'badge apprendre-verdict ' + VERDICTS[nb][1];
      // Petit fondu pendant le changement de réponse
      bulle.classList.add('change');
      setTimeout(function () {
        reponse.textContent = composer(infos);
        bulle.classList.remove('change');
      }, reduit ? 0 : 220);
    }

    cases.forEach(function (c) { c.addEventListener('change', maj); });
    maj();
  }


  /* 9. VOUS GARDEZ LA MAIN =================================================
     Démo « appel en direct » (exemple fictif d'un garage) : la conversation
     s'écrit quand la carte arrive à l'écran. « Reprendre la main » interrompt
     l'agent à tout moment. */
  var REPLIQUES = [
    { qui: 'agent', nom: 'Agent', texte: "Garage Martin, bonjour ! Que puis-je faire pour vous ?" },
    { qui: 'client', nom: 'Client', texte: "Bonjour, ma voiture grince quand je freine, depuis hier." },
    { qui: 'agent', nom: 'Agent', texte: "Je peux vous proposer un contrôle des freins jeudi à 9h ou vendredi à 14h. Qu'est-ce qui vous arrange ?" },
    { qui: 'client', nom: 'Client', texte: "Jeudi 9h. Et ça coûte combien, à peu près ?" },
    { qui: 'agent', nom: 'Agent', texte: "Le contrôle est à 45 €, déduits si vous faites la réparation chez nous. Je vous note pour jeudi ?" },
    { qui: 'client', nom: 'Client', texte: "Oui, au nom de Moreau. Merci !" }
  ];
  var REPRISE = { qui: 'vous', nom: 'Vous', texte: "Bonjour, ici le patron, je prends le relais. Je vous écoute !" };

  function initDirect() {
    var bloc = document.querySelector('[data-direct]');
    if (!bloc) return;
    var fil = bloc.querySelector('.direct-fil');
    var bouton = bloc.querySelector('[data-reprendre]');
    var boutonTexte = bouton.querySelector('span');
    var etat = bloc.querySelector('.direct-etat');
    var etatTexte = bloc.querySelector('.direct-etat-txt');
    var minuteur = bloc.querySelector('.direct-minuteur');

    var generation = 0;      // permet d'interrompre une conversation en cours
    var mode = 'attente';    // attente | agent | vous | fini
    var secondes = 0, chrono = null;

    function attendre(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    function changerMode(nouveau) {
      mode = nouveau;
      etat.dataset.etat = nouveau;
      etatTexte.textContent = { attente: 'En attente', agent: "L'agent répond", vous: 'Vous êtes en ligne', fini: 'Appel terminé' }[nouveau];
      var rejouer = nouveau === 'vous' || nouveau === 'fini';
      boutonTexte.textContent = rejouer ? 'Rejouer la démo' : 'Reprendre la main';
      bouton.dataset.mode = rejouer ? 'rejouer' : 'reprendre';
    }

    function afficherChrono() {
      var m = Math.floor(secondes / 60), s = secondes % 60;
      minuteur.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }
    function demarrerChrono() {
      clearInterval(chrono);
      secondes = 0; afficherChrono();
      chrono = setInterval(function () { secondes++; afficherChrono(); }, 1000);
    }
    function arreterChrono() { clearInterval(chrono); }

    function defilerBas() { fil.scrollTop = fil.scrollHeight; }

    function ajouterSysteme(texte) {
      var p = document.createElement('p');
      p.className = 'direct-ligne direct-systeme';
      p.textContent = texte;
      fil.appendChild(p);
      defilerBas();
    }

    // Écrit une réplique lettre par lettre (ou d'un coup si mouvement réduit)
    async function ecrire(replique, gen) {
      var p = document.createElement('p');
      p.className = 'direct-ligne direct-' + replique.qui + ' en-cours';
      var qui = document.createElement('span');
      qui.className = 'direct-qui';
      qui.textContent = replique.nom;
      var texte = document.createElement('span');
      texte.className = 'direct-texte';
      p.appendChild(qui); p.appendChild(texte);
      fil.appendChild(p);
      defilerBas();

      if (reduit) { texte.textContent = replique.texte; p.classList.remove('en-cours'); return true; }
      for (var i = 1; i <= replique.texte.length; i++) {
        if (gen !== generation) { p.classList.remove('en-cours'); return false; }
        texte.textContent = replique.texte.slice(0, i);
        if (i % 12 === 0) defilerBas();
        await attendre(replique.texte[i - 1] === ' ' ? 14 : 24);
      }
      p.classList.remove('en-cours');
      defilerBas();
      return true;
    }

    async function jouer() {
      var gen = ++generation;
      fil.innerHTML = '';
      changerMode('agent');
      demarrerChrono();
      ajouterSysteme("L'agent a décroché");
      for (var i = 0; i < REPLIQUES.length; i++) {
        if (!(await ecrire(REPLIQUES[i], gen))) return;
        await attendre(reduit ? 0 : 700);
        if (gen !== generation) return;
      }
      ajouterSysteme('Appel terminé · résumé envoyé ✓');
      arreterChrono();
      changerMode('fini');
    }

    async function reprendre() {
      var gen = ++generation;  // interrompt l'agent
      ajouterSysteme("Vous avez repris l'appel. L'agent s'est retiré.");
      changerMode('vous');
      await attendre(reduit ? 0 : 500);
      await ecrire(REPRISE, gen);
    }

    bouton.addEventListener('click', function () {
      if (mode === 'agent') reprendre();
      else { arreterChrono(); jouer(); }
    });

    // Démarre automatiquement quand la carte est bien visible à l'écran
    var observateur = new IntersectionObserver(function (entrees) {
      if (entrees[0].isIntersecting && mode === 'attente') {
        jouer();
        observateur.disconnect();
      }
    }, { threshold: 0.5 });
    observateur.observe(bloc);
  }

  // Schéma du transfert : les éléments s'enchaînent
  function initFlux() {
    var flux = document.querySelector('[data-flux]');
    if (!flux || !anime) return;
    gsap.timeline({ scrollTrigger: { trigger: flux, start: 'top 80%', once: true } })
      .from(flux.querySelector('.flux-noeud'), { opacity: 0, scale: 0.85, duration: 0.6, ease: 'back.out(1.6)' })
      .from(flux.querySelector('.flux-ligne'), { clipPath: 'inset(0 100% 100% 0)', duration: 0.5, ease: 'power2.inOut' })
      .from(flux.querySelectorAll('.flux-issue'), { opacity: 0, y: 24, duration: 0.7, ease: 'power3.out', stagger: 0.2 });
  }


  /* 10. FORMULAIRE DE DÉMO =================================================
     Pour l'instant, AUCUNE donnée n'est envoyée : on affiche seulement un
     message de confirmation. Pour recevoir les demandes, il faudra brancher
     un service d'envoi de formulaire (ex. Formspree) à cet endroit. */
  function initFormulaire() {
    var form = document.querySelector('[data-formulaire-demo]');
    if (!form) return;
    var erreur = form.querySelector('.formulaire-erreur');
    var confirmation = form.parentNode.querySelector('[data-confirmation]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        erreur.hidden = false;
        var premier = form.querySelector(':invalid');
        if (premier) premier.focus();
        return;
      }
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus();
      if (anime) gsap.from(confirmation, { opacity: 0, scale: 0.94, duration: 0.6, ease: 'power3.out' });
      if (gsapOk) ScrollTrigger.refresh();
    });
    form.addEventListener('input', function () { erreur.hidden = true; });
  }


  /* LANCEMENT ============================================================== */
  appliquerContacts();
  remplacerEmplacements();
  chargerLogo();
  chargerCaptures();
  initEntete();
  initDefilement();
  initAnimations();
  initHero();
  initEtapes();
  initOnglets();
  initApprendre();
  initDirect();
  initFlux();
  initFormulaire();

  // Année en cours dans le pied de page
  document.querySelectorAll('[data-annee]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Recalcule les positions une fois les polices chargées
  if (gsapOk && document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
