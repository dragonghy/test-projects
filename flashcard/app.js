// ===== Flashcard App (M1 + M2) =====
(function () {
    'use strict';

    // ===== Constants =====
    const STORAGE_KEY = 'flashcard_data';

    // ===== State =====
    let appData = { decks: [] };
    let currentDeckId = null;
    let currentCardIndex = 0;
    let isFlipped = false;
    let editingDeckId = null;
    let editingCardId = null;
    let deleteCallback = null;

    // Study mode state
    let studyCards = [];        // ordered card references for study
    let isStudyShuffle = false;

    // Quiz mode state
    let quizCards = [];          // ordered card references for quiz
    let quizCardIndex = 0;
    let quizIsFlipped = false;
    let quizResults = [];        // { cardId, correct: true/false }
    let isQuizShuffle = true;

    // Search state
    let searchQuery = '';

    // ===== DOM Elements =====
    const $ = (id) => document.getElementById(id);

    // Views
    const deckListView = $('deckListView');
    const deckDetailView = $('deckDetailView');
    const studyView = $('studyView');
    const quizView = $('quizView');
    const quizResultView = $('quizResultView');

    // Deck list
    const deckList = $('deckList');
    const emptyState = $('emptyState');
    const addDeckBtn = $('addDeckBtn');
    const importDeckHomeBtn = $('importDeckHomeBtn');

    // Deck detail
    const backToDeckListBtn = $('backToDeckListBtn');
    const startStudyBtn = $('startStudyBtn');
    const startQuizBtn = $('startQuizBtn');
    const addCardBtn = $('addCardBtn');
    const exportDeckBtn = $('exportDeckBtn');
    const editDeckBtn = $('editDeckBtn');
    const deleteDeckBtn = $('deleteDeckBtn');
    const deckDetailName = $('deckDetailName');
    const deckDetailDesc = $('deckDetailDesc');
    const deckDetailCount = $('deckDetailCount');
    const cardList = $('cardList');
    const cardEmptyState = $('cardEmptyState');
    const searchEmptyState = $('searchEmptyState');
    const searchInput = $('searchInput');
    const masterySummary = $('masterySummary');
    const masteryBar = $('masteryBar');
    const masteryPercent = $('masteryPercent');

    // Study mode
    const exitStudyBtn = $('exitStudyBtn');
    const studyProgressText = $('studyProgressText');
    const studyProgressBar = $('studyProgressBar');
    const flashcardContainer = $('flashcardContainer');
    const flashcard = $('flashcard');
    const cardFront = $('cardFront');
    const cardBack = $('cardBack');
    const prevCardBtn = $('prevCardBtn');
    const nextCardBtn = $('nextCardBtn');
    const studyShuffleToggle = $('studyShuffleToggle');

    // Quiz mode
    const exitQuizBtn = $('exitQuizBtn');
    const quizProgressText = $('quizProgressText');
    const quizProgressBar = $('quizProgressBar');
    const quizFlashcardContainer = $('quizFlashcardContainer');
    const quizFlashcard = $('quizFlashcard');
    const quizCardFront = $('quizCardFront');
    const quizCardBack = $('quizCardBack');
    const quizActions = $('quizActions');
    const quizCorrectBtn = $('quizCorrectBtn');
    const quizIncorrectBtn = $('quizIncorrectBtn');
    const quizFlipHint = $('quizFlipHint');
    const quizShuffleToggle = $('quizShuffleToggle');

    // Quiz result
    const scoreNumber = $('scoreNumber');
    const scoreTotal = $('scoreTotal');
    const scorePercent = $('scorePercent');
    const retryQuizBtn = $('retryQuizBtn');
    const backToDeckFromQuizBtn = $('backToDeckFromQuizBtn');
    const wrongAnswersSection = $('wrongAnswersSection');
    const wrongAnswersList = $('wrongAnswersList');

    // Deck modal
    const deckModal = $('deckModal');
    const deckModalTitle = $('deckModalTitle');
    const deckNameInput = $('deckNameInput');
    const deckDescInput = $('deckDescInput');
    const closeDeckModal = $('closeDeckModal');
    const cancelDeckModal = $('cancelDeckModal');
    const saveDeckBtn = $('saveDeckBtn');

    // Card modal
    const cardModal = $('cardModal');
    const cardModalTitle = $('cardModalTitle');
    const cardFrontInput = $('cardFrontInput');
    const cardBackInput = $('cardBackInput');
    const closeCardModal = $('closeCardModal');
    const cancelCardModal = $('cancelCardModal');
    const saveCardBtn = $('saveCardBtn');

    // Confirm modal
    const confirmModal = $('confirmModal');
    const confirmMessage = $('confirmMessage');
    const closeConfirmModal = $('closeConfirmModal');
    const cancelConfirmBtn = $('cancelConfirmBtn');
    const confirmDeleteBtn = $('confirmDeleteBtn');

    // Import
    const importFileInput = $('importFileInput');

    // Toast
    const toast = $('toast');

    // Header
    const headerTitle = $('headerTitle');

    // ===== Utility Functions =====
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    function now() {
        return new Date().toISOString();
    }

    function shuffleArray(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ===== Toast Notification =====
    let toastTimer = null;
    function showToast(message, type) {
        if (toastTimer) clearTimeout(toastTimer);
        toast.textContent = message;
        toast.className = 'toast';
        if (type) toast.classList.add('toast-' + type);
        // Trigger reflow
        void toast.offsetWidth;
        toast.classList.add('active');
        toastTimer = setTimeout(() => {
            toast.classList.remove('active');
        }, 3000);
    }

    // ===== Data Persistence =====
    function loadData() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                appData = JSON.parse(raw);
                // Ensure stats exist on all cards (backwards compat)
                appData.decks.forEach(deck => {
                    deck.cards.forEach(card => {
                        if (!card.stats) {
                            card.stats = { correct: 0, incorrect: 0, lastStudied: null };
                        }
                    });
                });
            }
        } catch (e) {
            console.error('Failed to load data:', e);
            appData = { decks: [] };
        }
    }

    function saveData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
        } catch (e) {
            console.error('Failed to save data:', e);
        }
    }

    // ===== View Management =====
    function showView(view) {
        [deckListView, deckDetailView, studyView, quizView, quizResultView].forEach(v => v.classList.remove('active'));
        view.classList.add('active');
    }

    // ===== Modal Management =====
    function openModal(modal) {
        modal.classList.add('active');
        const firstInput = modal.querySelector('input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    function closeModal(modal) {
        modal.classList.remove('active');
    }

    // ===== Deck CRUD =====
    function getDeck(id) {
        return appData.decks.find(d => d.id === id);
    }

    function createDeck(name, description) {
        const deck = {
            id: generateId(),
            name: name.trim(),
            description: (description || '').trim(),
            createdAt: now(),
            updatedAt: now(),
            cards: []
        };
        appData.decks.push(deck);
        saveData();
        return deck;
    }

    function updateDeck(id, name, description) {
        const deck = getDeck(id);
        if (!deck) return;
        deck.name = name.trim();
        deck.description = (description || '').trim();
        deck.updatedAt = now();
        saveData();
    }

    function deleteDeck(id) {
        appData.decks = appData.decks.filter(d => d.id !== id);
        saveData();
    }

    // ===== Card CRUD =====
    function getCard(deckId, cardId) {
        const deck = getDeck(deckId);
        if (!deck) return null;
        return deck.cards.find(c => c.id === cardId);
    }

    function addCard(deckId, front, back) {
        const deck = getDeck(deckId);
        if (!deck) return;
        const card = {
            id: generateId(),
            front: front.trim(),
            back: back.trim(),
            createdAt: now(),
            stats: {
                correct: 0,
                incorrect: 0,
                lastStudied: null
            }
        };
        deck.cards.push(card);
        deck.updatedAt = now();
        saveData();
        return card;
    }

    function updateCard(deckId, cardId, front, back) {
        const card = getCard(deckId, cardId);
        if (!card) return;
        card.front = front.trim();
        card.back = back.trim();
        const deck = getDeck(deckId);
        if (deck) deck.updatedAt = now();
        saveData();
    }

    function deleteCard(deckId, cardId) {
        const deck = getDeck(deckId);
        if (!deck) return;
        deck.cards = deck.cards.filter(c => c.id !== cardId);
        deck.updatedAt = now();
        saveData();
    }

    // ===== Statistics Helpers =====
    function getCardMastery(card) {
        const total = card.stats.correct + card.stats.incorrect;
        if (total === 0) return 'new';
        if (card.stats.correct > card.stats.incorrect) return 'mastered';
        return 'learning';
    }

    function getDeckMasteryPercent(deck) {
        if (deck.cards.length === 0) return 0;
        const studied = deck.cards.filter(c => (c.stats.correct + c.stats.incorrect) > 0);
        if (studied.length === 0) return 0;
        const mastered = studied.filter(c => c.stats.correct > c.stats.incorrect).length;
        return Math.round((mastered / deck.cards.length) * 100);
    }

    // ===== Render Functions =====
    function renderDeckList() {
        if (appData.decks.length === 0) {
            deckList.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';
        deckList.innerHTML = appData.decks.map(deck => {
            const masteryPct = getDeckMasteryPercent(deck);
            const hasStudied = deck.cards.some(c => (c.stats.correct + c.stats.incorrect) > 0);
            return `
            <div class="deck-card" data-deck-id="${deck.id}">
                <div class="deck-card-name">${escapeHtml(deck.name)}</div>
                <div class="deck-card-desc">${escapeHtml(deck.description) || '<span style="opacity:0.4">暂无描述</span>'}</div>
                <div class="deck-card-footer">
                    <span class="badge">${deck.cards.length} 张闪卡</span>
                    ${hasStudied ? `
                    <div class="deck-card-mastery">
                        <div class="deck-card-mastery-bar">
                            <div class="deck-card-mastery-fill" style="width:${masteryPct}%"></div>
                        </div>
                        <span>${masteryPct}%</span>
                    </div>` : ''}
                </div>
            </div>
        `}).join('');

        deckList.querySelectorAll('.deck-card').forEach(card => {
            card.addEventListener('click', () => {
                currentDeckId = card.dataset.deckId;
                searchQuery = '';
                searchInput.value = '';
                showDeckDetail();
            });
        });
    }

    function showDeckDetail() {
        const deck = getDeck(currentDeckId);
        if (!deck) return;

        deckDetailName.textContent = deck.name;
        deckDetailDesc.textContent = deck.description || '';
        deckDetailCount.textContent = `${deck.cards.length} 张闪卡`;

        startStudyBtn.disabled = deck.cards.length === 0;
        startQuizBtn.disabled = deck.cards.length === 0;

        // Mastery summary
        const hasStudied = deck.cards.some(c => (c.stats.correct + c.stats.incorrect) > 0);
        if (hasStudied && deck.cards.length > 0) {
            const pct = getDeckMasteryPercent(deck);
            masterySummary.style.display = 'flex';
            masteryBar.style.width = pct + '%';
            masteryPercent.textContent = pct + '%';
        } else {
            masterySummary.style.display = 'none';
        }

        renderCardList(deck);
        showView(deckDetailView);
    }

    function renderCardList(deck) {
        let cards = deck.cards;

        // Apply search filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            cards = cards.filter(c =>
                c.front.toLowerCase().includes(q) ||
                c.back.toLowerCase().includes(q)
            );
        }

        if (deck.cards.length === 0) {
            cardList.innerHTML = '';
            cardEmptyState.style.display = 'block';
            searchEmptyState.style.display = 'none';
            return;
        }

        cardEmptyState.style.display = 'none';

        if (cards.length === 0 && searchQuery) {
            cardList.innerHTML = '';
            searchEmptyState.style.display = 'block';
            return;
        }

        searchEmptyState.style.display = 'none';

        cardList.innerHTML = cards.map(card => {
            const mastery = getCardMastery(card);
            const total = card.stats.correct + card.stats.incorrect;
            let statsBadge = '';
            let masteryClass = '';
            if (mastery === 'mastered') {
                statsBadge = `<span class="card-stats-badge mastered">已掌握 ${card.stats.correct}/${total}</span>`;
                masteryClass = 'mastery-mastered';
            } else if (mastery === 'learning') {
                statsBadge = `<span class="card-stats-badge learning">学习中 ${card.stats.correct}/${total}</span>`;
                masteryClass = 'mastery-learning';
            } else {
                statsBadge = `<span class="card-stats-badge new-card">未学习</span>`;
                masteryClass = 'mastery-new';
            }

            return `
            <div class="card-item ${masteryClass}" data-card-id="${card.id}">
                <div class="card-item-content">
                    <div class="card-item-side">
                        <div class="label">正面</div>
                        <div class="text">${escapeHtml(card.front)}</div>
                    </div>
                    <div class="card-item-side">
                        <div class="label">背面</div>
                        <div class="text">${escapeHtml(card.back)}</div>
                    </div>
                </div>
                <div class="card-item-meta">
                    ${statsBadge}
                </div>
                <div class="card-item-actions">
                    <button class="btn btn-ghost edit-card-btn" data-card-id="${card.id}">编辑</button>
                    <button class="btn btn-danger-ghost delete-card-btn" data-card-id="${card.id}">删除</button>
                </div>
            </div>
        `}).join('');

        cardList.querySelectorAll('.edit-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openEditCardModal(btn.dataset.cardId);
            });
        });

        cardList.querySelectorAll('.delete-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                openDeleteCardConfirm(btn.dataset.cardId);
            });
        });
    }

    // ===== Study Mode =====
    function buildStudyCards() {
        const deck = getDeck(currentDeckId);
        if (!deck) return;
        studyCards = isStudyShuffle ? shuffleArray(deck.cards) : [...deck.cards];
    }

    function startStudy() {
        const deck = getDeck(currentDeckId);
        if (!deck || deck.cards.length === 0) return;

        currentCardIndex = 0;
        isFlipped = false;
        isStudyShuffle = studyShuffleToggle.checked;
        buildStudyCards();
        showView(studyView);
        renderStudyCard();
    }

    function renderStudyCard() {
        if (studyCards.length === 0) return;
        const card = studyCards[currentCardIndex];

        isFlipped = false;
        flashcard.classList.remove('flipped');

        cardFront.textContent = card.front;
        cardBack.textContent = card.back;

        const total = studyCards.length;
        const current = currentCardIndex + 1;
        studyProgressText.textContent = `第 ${current} / ${total} 张`;
        studyProgressBar.style.width = `${(current / total) * 100}%`;

        prevCardBtn.disabled = currentCardIndex === 0;
        nextCardBtn.disabled = currentCardIndex === total - 1;
    }

    function flipCard() {
        isFlipped = !isFlipped;
        if (isFlipped) {
            flashcard.classList.add('flipped');
        } else {
            flashcard.classList.remove('flipped');
        }
    }

    function prevCard() {
        if (currentCardIndex > 0) {
            currentCardIndex--;
            renderStudyCard();
        }
    }

    function nextCard() {
        if (currentCardIndex < studyCards.length - 1) {
            currentCardIndex++;
            renderStudyCard();
        }
    }

    // ===== Quiz Mode =====
    function buildQuizCards() {
        const deck = getDeck(currentDeckId);
        if (!deck) return;
        quizCards = isQuizShuffle ? shuffleArray(deck.cards) : [...deck.cards];
    }

    function startQuiz() {
        const deck = getDeck(currentDeckId);
        if (!deck || deck.cards.length === 0) return;

        quizCardIndex = 0;
        quizIsFlipped = false;
        quizResults = [];
        isQuizShuffle = quizShuffleToggle.checked;
        buildQuizCards();
        showView(quizView);
        renderQuizCard();
    }

    function renderQuizCard() {
        if (quizCards.length === 0) return;
        const card = quizCards[quizCardIndex];

        quizIsFlipped = false;
        quizFlashcard.classList.remove('flipped');

        quizCardFront.textContent = card.front;
        quizCardBack.textContent = card.back;

        const total = quizCards.length;
        const current = quizCardIndex + 1;
        quizProgressText.textContent = `第 ${current} / ${total} 张`;
        quizProgressBar.style.width = `${(current / total) * 100}%`;

        // Show flip hint, hide assessment buttons
        quizActions.style.display = 'none';
        quizFlipHint.style.display = 'block';
    }

    function flipQuizCard() {
        quizIsFlipped = !quizIsFlipped;
        if (quizIsFlipped) {
            quizFlashcard.classList.add('flipped');
            quizActions.style.display = 'flex';
            quizFlipHint.style.display = 'none';
        } else {
            quizFlashcard.classList.remove('flipped');
            quizActions.style.display = 'none';
            quizFlipHint.style.display = 'block';
        }
    }

    function quizAnswer(correct) {
        const card = quizCards[quizCardIndex];

        // Record result
        quizResults.push({ cardId: card.id, correct: correct });

        // Update card stats
        if (correct) {
            card.stats.correct++;
        } else {
            card.stats.incorrect++;
        }
        card.stats.lastStudied = now();
        saveData();

        // Move to next card or show results
        if (quizCardIndex < quizCards.length - 1) {
            quizCardIndex++;
            renderQuizCard();
        } else {
            showQuizResult();
        }
    }

    function showQuizResult() {
        const total = quizResults.length;
        const correctCount = quizResults.filter(r => r.correct).length;
        const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

        scoreNumber.textContent = correctCount;
        scoreTotal.textContent = `/ ${total}`;
        scorePercent.textContent = `正确率 ${pct}%`;

        // Wrong answers
        const wrongResults = quizResults.filter(r => !r.correct);
        if (wrongResults.length > 0) {
            wrongAnswersSection.style.display = 'block';
            wrongAnswersList.innerHTML = wrongResults.map(r => {
                const card = quizCards.find(c => c.id === r.cardId);
                if (!card) return '';
                return `
                    <div class="wrong-answer-item">
                        <div>
                            <div class="side-label">问题</div>
                            <div class="side-text">${escapeHtml(card.front)}</div>
                        </div>
                        <div>
                            <div class="side-label">答案</div>
                            <div class="side-text">${escapeHtml(card.back)}</div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            wrongAnswersSection.style.display = 'none';
        }

        showView(quizResultView);
    }

    // ===== Search =====
    function handleSearch() {
        searchQuery = searchInput.value.trim();
        const deck = getDeck(currentDeckId);
        if (deck) {
            renderCardList(deck);
        }
    }

    // ===== Import / Export =====
    function exportDeck() {
        const deck = getDeck(currentDeckId);
        if (!deck) return;

        const exportData = {
            name: deck.name,
            description: deck.description,
            cards: deck.cards.map(c => ({
                front: c.front,
                back: c.back
            }))
        };

        const json = JSON.stringify(exportData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${deck.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showToast('卡组已导出', 'success');
    }

    function triggerImport() {
        importFileInput.value = '';
        importFileInput.click();
    }

    function handleImportFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const data = JSON.parse(e.target.result);

                // Validate structure
                if (!data.name || typeof data.name !== 'string') {
                    showToast('导入失败：缺少卡组名称', 'error');
                    return;
                }
                if (!Array.isArray(data.cards)) {
                    showToast('导入失败：缺少闪卡数据', 'error');
                    return;
                }

                // Validate each card
                for (let i = 0; i < data.cards.length; i++) {
                    const c = data.cards[i];
                    if (!c.front || !c.back || typeof c.front !== 'string' || typeof c.back !== 'string') {
                        showToast(`导入失败：第 ${i + 1} 张闪卡数据无效`, 'error');
                        return;
                    }
                }

                // Create deck from imported data
                const deck = {
                    id: generateId(),
                    name: data.name.trim(),
                    description: (data.description || '').trim(),
                    createdAt: now(),
                    updatedAt: now(),
                    cards: data.cards.map(c => ({
                        id: generateId(),
                        front: c.front.trim(),
                        back: c.back.trim(),
                        createdAt: now(),
                        stats: { correct: 0, incorrect: 0, lastStudied: null }
                    }))
                };

                appData.decks.push(deck);
                saveData();
                renderDeckList();

                showToast(`成功导入「${deck.name}」(${deck.cards.length} 张闪卡)`, 'success');
            } catch (err) {
                showToast('导入失败：JSON 格式无效', 'error');
            }
        };
        reader.readAsText(file);
    }

    // ===== Modal Handlers =====
    function openCreateDeckModal() {
        editingDeckId = null;
        deckModalTitle.textContent = '新建卡组';
        deckNameInput.value = '';
        deckDescInput.value = '';
        openModal(deckModal);
    }

    function openEditDeckModal() {
        const deck = getDeck(currentDeckId);
        if (!deck) return;
        editingDeckId = currentDeckId;
        deckModalTitle.textContent = '编辑卡组';
        deckNameInput.value = deck.name;
        deckDescInput.value = deck.description;
        openModal(deckModal);
    }

    function handleSaveDeck() {
        const name = deckNameInput.value.trim();
        if (!name) {
            deckNameInput.focus();
            deckNameInput.style.borderColor = 'var(--color-danger)';
            setTimeout(() => { deckNameInput.style.borderColor = ''; }, 1500);
            return;
        }

        const desc = deckDescInput.value.trim();

        if (editingDeckId) {
            updateDeck(editingDeckId, name, desc);
            showDeckDetail();
        } else {
            createDeck(name, desc);
            renderDeckList();
        }

        closeModal(deckModal);
    }

    function openCreateCardModal() {
        editingCardId = null;
        cardModalTitle.textContent = '添加闪卡';
        cardFrontInput.value = '';
        cardBackInput.value = '';
        openModal(cardModal);
    }

    function openEditCardModal(cardId) {
        const card = getCard(currentDeckId, cardId);
        if (!card) return;
        editingCardId = cardId;
        cardModalTitle.textContent = '编辑闪卡';
        cardFrontInput.value = card.front;
        cardBackInput.value = card.back;
        openModal(cardModal);
    }

    function handleSaveCard() {
        const front = cardFrontInput.value.trim();
        const back = cardBackInput.value.trim();

        let hasError = false;
        if (!front) {
            cardFrontInput.style.borderColor = 'var(--color-danger)';
            setTimeout(() => { cardFrontInput.style.borderColor = ''; }, 1500);
            hasError = true;
        }
        if (!back) {
            cardBackInput.style.borderColor = 'var(--color-danger)';
            setTimeout(() => { cardBackInput.style.borderColor = ''; }, 1500);
            hasError = true;
        }
        if (hasError) {
            (front ? cardBackInput : cardFrontInput).focus();
            return;
        }

        if (editingCardId) {
            updateCard(currentDeckId, editingCardId, front, back);
        } else {
            addCard(currentDeckId, front, back);
        }

        closeModal(cardModal);
        showDeckDetail();
    }

    function openDeleteDeckConfirm() {
        confirmMessage.textContent = '确定要删除这个卡组吗？卡组内的所有闪卡也会被删除，此操作不可撤销。';
        deleteCallback = () => {
            deleteDeck(currentDeckId);
            currentDeckId = null;
            renderDeckList();
            showView(deckListView);
        };
        openModal(confirmModal);
    }

    function openDeleteCardConfirm(cardId) {
        confirmMessage.textContent = '确定要删除这张闪卡吗？此操作不可撤销。';
        deleteCallback = () => {
            deleteCard(currentDeckId, cardId);
            showDeckDetail();
        };
        openModal(confirmModal);
    }

    function handleConfirmDelete() {
        if (deleteCallback) {
            deleteCallback();
            deleteCallback = null;
        }
        closeModal(confirmModal);
    }

    // ===== Event Binding =====
    function bindEvents() {
        // Header: click to go home
        headerTitle.addEventListener('click', () => {
            showView(deckListView);
            renderDeckList();
        });

        // Deck list
        addDeckBtn.addEventListener('click', openCreateDeckModal);
        importDeckHomeBtn.addEventListener('click', triggerImport);

        // Deck detail
        backToDeckListBtn.addEventListener('click', () => {
            showView(deckListView);
            renderDeckList();
        });
        startStudyBtn.addEventListener('click', startStudy);
        startQuizBtn.addEventListener('click', startQuiz);
        addCardBtn.addEventListener('click', openCreateCardModal);
        exportDeckBtn.addEventListener('click', exportDeck);
        editDeckBtn.addEventListener('click', openEditDeckModal);
        deleteDeckBtn.addEventListener('click', openDeleteDeckConfirm);

        // Search
        searchInput.addEventListener('input', handleSearch);

        // Study mode
        exitStudyBtn.addEventListener('click', () => {
            showDeckDetail();
        });
        flashcardContainer.addEventListener('click', flipCard);
        prevCardBtn.addEventListener('click', prevCard);
        nextCardBtn.addEventListener('click', nextCard);

        // Study shuffle toggle
        studyShuffleToggle.addEventListener('change', () => {
            isStudyShuffle = studyShuffleToggle.checked;
            currentCardIndex = 0;
            buildStudyCards();
            renderStudyCard();
        });

        // Quiz mode
        exitQuizBtn.addEventListener('click', () => {
            showDeckDetail();
        });
        quizFlashcardContainer.addEventListener('click', () => {
            if (!quizIsFlipped) {
                flipQuizCard();
            }
        });
        quizCorrectBtn.addEventListener('click', () => quizAnswer(true));
        quizIncorrectBtn.addEventListener('click', () => quizAnswer(false));

        // Quiz shuffle toggle
        quizShuffleToggle.addEventListener('change', () => {
            isQuizShuffle = quizShuffleToggle.checked;
            // Restart quiz with new order
            quizCardIndex = 0;
            quizResults = [];
            buildQuizCards();
            renderQuizCard();
        });

        // Quiz result
        retryQuizBtn.addEventListener('click', startQuiz);
        backToDeckFromQuizBtn.addEventListener('click', () => {
            showDeckDetail();
        });

        // Import file handler
        importFileInput.addEventListener('change', handleImportFile);

        // Deck modal
        closeDeckModal.addEventListener('click', () => closeModal(deckModal));
        cancelDeckModal.addEventListener('click', () => closeModal(deckModal));
        saveDeckBtn.addEventListener('click', handleSaveDeck);

        // Card modal
        closeCardModal.addEventListener('click', () => closeModal(cardModal));
        cancelCardModal.addEventListener('click', () => closeModal(cardModal));
        saveCardBtn.addEventListener('click', handleSaveCard);

        // Confirm modal
        closeConfirmModal.addEventListener('click', () => closeModal(confirmModal));
        cancelConfirmBtn.addEventListener('click', () => closeModal(confirmModal));
        confirmDeleteBtn.addEventListener('click', handleConfirmDelete);

        // Close modals on overlay click
        [deckModal, cardModal, confirmModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            // If a modal is open, handle Enter/Escape
            if (deckModal.classList.contains('active')) {
                if (e.key === 'Escape') closeModal(deckModal);
                if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') handleSaveDeck();
                return;
            }
            if (cardModal.classList.contains('active')) {
                if (e.key === 'Escape') closeModal(cardModal);
                return;
            }
            if (confirmModal.classList.contains('active')) {
                if (e.key === 'Escape') closeModal(confirmModal);
                if (e.key === 'Enter') handleConfirmDelete();
                return;
            }

            // Don't intercept when typing in search
            if (document.activeElement === searchInput) {
                if (e.key === 'Escape') {
                    searchInput.blur();
                    searchInput.value = '';
                    searchQuery = '';
                    const deck = getDeck(currentDeckId);
                    if (deck) renderCardList(deck);
                }
                return;
            }

            // Study mode keyboard shortcuts
            if (studyView.classList.contains('active')) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    prevCard();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    nextCard();
                } else if (e.key === ' ') {
                    e.preventDefault();
                    flipCard();
                } else if (e.key === 'Escape') {
                    showDeckDetail();
                }
                return;
            }

            // Quiz mode keyboard shortcuts
            if (quizView.classList.contains('active')) {
                if (e.key === ' ') {
                    e.preventDefault();
                    if (!quizIsFlipped) {
                        flipQuizCard();
                    }
                } else if (e.key === '1' && quizIsFlipped) {
                    e.preventDefault();
                    quizAnswer(true);
                } else if (e.key === '2' && quizIsFlipped) {
                    e.preventDefault();
                    quizAnswer(false);
                } else if (e.key === 'Escape') {
                    showDeckDetail();
                }
                return;
            }

            // Quiz result keyboard
            if (quizResultView.classList.contains('active')) {
                if (e.key === 'Escape') {
                    showDeckDetail();
                }
                return;
            }
        });
    }

    // ===== Init =====
    function init() {
        loadData();
        renderDeckList();
        bindEvents();
    }

    init();
})();
