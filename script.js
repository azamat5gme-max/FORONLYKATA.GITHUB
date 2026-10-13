'use strict';
    (() => {
      const story = document.getElementById('story');
      const pages = Array.from(document.querySelectorAll('[data-page]'));
      const dots = Array.from(document.querySelectorAll('[data-goto]'));
      const back = document.getElementById('back-button');
      const next = document.getElementById('next-button');
      const nextLabel = document.getElementById('next-label');
      const arrow = document.getElementById('button-arrow');
      const restart = document.getElementById('restart-button');
      const petals = document.getElementById('petals');
      const announcement = document.getElementById('announcement');
      const motionToggle = document.getElementById('motion-toggle');
      const motionLabel = document.getElementById('motion-label');
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      const chapters = ['The little letter', 'Happy with you', 'Here for you', 'A hug for you'];
      const captions = ['Sealed with a little love', 'My favorite place is with you', 'You can be yourself with me', 'Me + you. One big hug.'];
      const buttonLabels = ['Open your letter', 'A little reminder', 'A hug, if you’d like', 'One more hug'];
      const artDescriptions = [
        'A rose-colored envelope with a heart and a handwritten letter inside.',
        'Two smiling teddy bears, labeled me and you, standing together.',
        'The two teddy bears shelter together under a pink umbrella.',
        'The teddy bear labeled me moves close and wraps its arms around the bear labeled you. A heart appears above them.'
      ];
      let step = 0;
      let still = reducedMotion.matches;
      let hugTimer;
      let clearTimer;
      let replaying = false;
      let replayFrame;

      function clearHearts() {
        window.clearTimeout(clearTimer);
        petals.replaceChildren();
      }

      function setMotion(value) {
        still = value;
        document.body.dataset.still = String(still);
        motionToggle.setAttribute('aria-pressed', String(still));
        motionToggle.setAttribute('aria-label', still ? 'Resume animations' : 'Pause animations');
        motionLabel.textContent = still ? 'Animation paused' : 'Pause animation';
        if (still) clearHearts();
      }

      function releaseHearts() {
        clearHearts();
        if (still || reducedMotion.matches) return;
        const colors = ['#ad5268', '#c78d78', '#c08b9a'];
        for (let i = 0; i < 16; i++) {
          const heart = document.createElement('span');
          heart.className = 'petal';
          heart.textContent = i % 3 === 0 ? '♡' : '♥';
          heart.style.setProperty('--x', (7 + Math.random() * 86) + '%');
          heart.style.setProperty('--color', colors[i % colors.length]);
          heart.style.setProperty('--size', (12 + Math.random() * 15) + 'px');
          heart.style.setProperty('--duration', (3.6 + Math.random() * 1.2) + 's');
          heart.style.setProperty('--delay', (Math.random() * .7) + 's');
          heart.style.setProperty('--drift', (-35 + Math.random() * 70) + 'px');
          petals.appendChild(heart);
        }
        clearTimer = window.setTimeout(clearHearts, 5800);
      }

      function beginHug() {
        if (step !== 3) return;
        story.dataset.hugging = 'true';
        releaseHearts();
      }

      function showPage(index, focusHeading = true) {
        window.clearTimeout(hugTimer);
        window.cancelAnimationFrame(replayFrame);
        replaying = false;
        next.disabled = false;
        clearHearts();
        step = Math.max(0, Math.min(pages.length - 1, index));
        story.dataset.hugging = 'false';
        story.dataset.step = String(step);
        pages.forEach((page, i) => { page.hidden = i !== step; });
        dots.forEach((dot, i) => {
          if (i === step) dot.setAttribute('aria-current', 'step');
          else dot.removeAttribute('aria-current');
        });
        back.hidden = step === 0;
        restart.hidden = step !== 3;
        nextLabel.textContent = buttonLabels[step];
        arrow.textContent = step === 3 ? '♡' : '↗';
        document.getElementById('chapter-number').textContent = String(step + 1).padStart(2, '0') + ' / 04';
        document.getElementById('chapter-name').textContent = chapters[step];
        document.getElementById('art-caption').textContent = captions[step];
        document.getElementById('art-title').textContent = chapters[step];
        document.getElementById('art-description').textContent = artDescriptions[step];
        document.getElementById('keyboard-hint').textContent = step === 3
          ? 'Press Space for another hug. Left arrow goes back.'
          : 'You can also press Space to turn the page.';
        if (focusHeading) {
          const heading = pages[step].querySelector('h1');
          heading.focus({preventScroll: true});
          // If the page is scrolled on a phone, bring the new message into view.
          const rect = heading.getBoundingClientRect();
          if (rect.top < 0 || rect.bottom > window.innerHeight) {
            heading.scrollIntoView({block: 'start', behavior: 'auto'});
          }
        }
        if (step === 3) {
          if (still || reducedMotion.matches) beginHug();
          else hugTimer = window.setTimeout(beginHug, 160);
        }
      }

      function replayHug() {
        if (replaying) return;
        window.clearTimeout(hugTimer);
        clearHearts();
        if (still || reducedMotion.matches) {
          story.dataset.hugging = 'true';
          announcement.textContent = announcement.textContent === 'Sending you another big hug. ♡'
            ? 'Another hug, just for you. ♡' : 'Sending you another big hug. ♡';
          return;
        }
        replaying = true;
        next.disabled = true;
        story.dataset.hugging = 'false';
        replayFrame = window.requestAnimationFrame(() => {
          hugTimer = window.setTimeout(() => {
            beginHug();
            replaying = false;
            next.disabled = false;
            announcement.textContent = 'Sending you another big hug. ♡';
          }, 1650);
        });
      }

      function goNext() { if (step < 3) showPage(step + 1); else replayHug(); }
      next.addEventListener('click', goNext);
      back.addEventListener('click', () => showPage(step - 1));
      restart.addEventListener('click', () => showPage(0));
      dots.forEach(dot => dot.addEventListener('click', () => showPage(Number(dot.dataset.goto))));
      motionToggle.addEventListener('click', () => setMotion(!still));
      reducedMotion.addEventListener('change', event => setMotion(event.matches));
      document.addEventListener('keydown', event => {
        if (event.repeat || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.target.closest('button, a, input, textarea, select, [contenteditable="true"]')) return;
        if (event.code === 'Space' || event.key === 'ArrowRight') {
          event.preventDefault();
          goNext();
        } else if (event.key === 'ArrowLeft' && step > 0) {
          event.preventDefault();
          showPage(step - 1);
        }
      });
      setMotion(still);
      showPage(0, false);
    })();
