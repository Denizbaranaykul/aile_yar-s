document.addEventListener('DOMContentLoaded', () => {

    // Tema değiştirme
    const btnThemeToggle = document.getElementById('btn-theme-toggle');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        btnThemeToggle.textContent = '🌙';
    }

    btnThemeToggle.addEventListener('click', () => {
        body.classList.toggle('light-theme');
        if (body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
            btnThemeToggle.textContent = '🌙';
        } else {
            localStorage.setItem('theme', 'dark');
            btnThemeToggle.textContent = '☀️';
        }
    });


    let kalanSorular = [];
    let maviTakimPuan = 0;
    let kirmiziTakimPuan = 0;
    let aktifSoru = null;

    // HTML elementleri
    const questionTitle = document.getElementById('question-title');
    const answerBoard = document.getElementById('answer-board');
    const maviSkorLabel = document.getElementById('mavi-skor');
    const kirmiziSkorLabel = document.getElementById('kirmizi-skor');
    const cevapInput = document.getElementById('cevap-input');
    const btnCevapKontrol = document.getElementById('btn-cevap-kontrol');
    const btnSoruGoster = document.getElementById('btn-soru-goster');
    const btnYeniSoru = document.getElementById('btn-yeni-soru');
    const controlsContainer = document.querySelector('.moderator-panel .controls');
    const gameOverPanel = document.getElementById('game-over-panel');
    const winnerAnnouncement = document.getElementById('winner-announcement');
    const btnRestartGame = document.getElementById('btn-restart-game');
    const moderatorFeedback = document.getElementById('moderator-feedback');
    const btnOyunuBitir = document.getElementById('btn-oyunu-bitir');

    // Ses efektleri
    const soundCorrect = document.getElementById('sound-correct');
    const soundWrong = document.getElementById('sound-wrong');
    const soundWin = document.getElementById('sound-win');

    function oyunuSifirla() {
        kalanSorular = [...sorular].sort(() => Math.random() - 0.5);
        maviTakimPuan = 0;
        kirmiziTakimPuan = 0;
        skorGuncelle();
        gameOverPanel.classList.add('hidden');
        controlsContainer.classList.remove('hidden');
        yeniSoruBaslat();
    }

    function yeniSoruBaslat() {
        if (kalanSorular.length === 0) {
            moderatorFeedback.textContent = "Tüm sorular soruldu!";
            oyunBitti();
            return;
        }
        aktifSoru = kalanSorular.pop();
        aktifSoru.cevaplar.forEach(c => c.bulundu = false);
        questionTitle.textContent = "Soru Yükleniyor...";
        answerBoard.innerHTML = '';
        moderatorFeedback.textContent = '';
        for (let i = 0; i < 5; i++) {
            const answerBox = document.createElement('div');
            answerBox.classList.add('answer-box');
            answerBox.id = `answer-${i}`;
            answerBox.innerHTML = `
                <div class="front"><span>CEVAP ${i + 1}</span></div>
                <div class="back"><span class="answer-text"></span><span class="answer-puan"></span></div>`;
            answerBoard.appendChild(answerBox);
        }
        btnSoruGoster.disabled = false;
        cevapInput.disabled = true;
        btnCevapKontrol.disabled = true;
        cevapInput.value = '';
    }

    function soruGoster() {
        questionTitle.textContent = aktifSoru.soru;
        btnSoruGoster.disabled = true;
        cevapInput.disabled = false;
        btnCevapKontrol.disabled = false;
        cevapInput.focus();
    }

    function cevapKontrolEt() {
        const seciliTakim = document.querySelector('input[name="takim-secimi"]:checked');
        if (!seciliTakim) {
            moderatorFeedback.textContent = "Lütfen cevap hakkı olan takımı seçin!";
            setTimeout(() => { moderatorFeedback.textContent = '' }, 2000);
            return;
        }
        const girilenCevap = cevapInput.value.trim().toLocaleLowerCase('tr');
        if (girilenCevap === "") return;
        const bulunanCevap = aktifSoru.cevaplar.find(c => c.cevap.toLocaleLowerCase('tr') === girilenCevap);
        if (bulunanCevap && !bulunanCevap.bulundu) {
            bulunanCevap.bulundu = true;
            const cevapIndex = aktifSoru.cevaplar.indexOf(bulunanCevap);
            const answerBox = document.getElementById(`answer-${cevapIndex}`);
            answerBox.querySelector('.back .answer-text').textContent = bulunanCevap.cevap.toUpperCase();
            answerBox.querySelector('.back .answer-puan').textContent = bulunanCevap.puan;
            answerBox.classList.add('visible');
            if (seciliTakim.value === 'mavi') maviTakimPuan += bulunanCevap.puan;
            else kirmiziTakimPuan += bulunanCevap.puan;
            skorGuncelle();
            soundCorrect.play();
            moderatorFeedback.textContent = '';
        } else {
            soundWrong.play();
            moderatorFeedback.textContent = `"${cevapInput.value}" yanlış veya bilinen bir cevap!`;
            const panel = document.querySelector('.moderator-panel');
            panel.classList.add('shake-animation');
            setTimeout(() => {
                panel.classList.remove('shake-animation');
                moderatorFeedback.textContent = '';
            }, 2000);
        }
        cevapInput.value = '';
        cevapInput.focus();
    }

    function skorGuncelle() {
        maviSkorLabel.textContent = maviTakimPuan;
        kirmiziSkorLabel.textContent = kirmiziTakimPuan;
    }

    function oyunBitti() {
        let kazananMesaji = "";
        if (maviTakimPuan > kirmiziTakimPuan) kazananMesaji = "🏆 MAVİ TAKIM KAZANDI 🏆";
        else if (kirmiziTakimPuan > maviTakimPuan) kazananMesaji = "🏆 KIRMIZI TAKIM KAZANDI 🏆";
        else kazananMesaji = "Oyun Berabere Bitti!";
        winnerAnnouncement.textContent = kazananMesaji;
        controlsContainer.classList.add('hidden');
        gameOverPanel.classList.remove('hidden');
        soundWin.play();
    }

    // Clickleri dinliyolar
    btnYeniSoru.addEventListener('click', yeniSoruBaslat);
    btnSoruGoster.addEventListener('click', soruGoster);
    btnCevapKontrol.addEventListener('click', cevapKontrolEt);
    cevapInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') cevapKontrolEt();
    });
    btnRestartGame.addEventListener('click', oyunuSifirla);
    btnOyunuBitir.addEventListener('click', oyunBitti);

    oyunuSifirla();
});