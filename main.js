/**
 * LottoBall Component
 * Displays a single lotto number with dynamic range-based coloring.
 */
class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['number', 'delay'];
    }

    attributeChangedCallback() {
        this.render();
    }

    getRangeClass(num) {
        if (num <= 10) return 'range1';
        if (num <= 20) return 'range2';
        if (num <= 30) return 'range3';
        if (num <= 40) return 'range4';
        return 'range5';
    }

    getRangeColor(num) {
        const colors = {
            range1: '#f59e0b',
            range2: '#3b82f6',
            range3: '#ef4444',
            range4: '#6b7280',
            range5: '#22c55e'
        };
        return colors[this.getRangeClass(num)];
    }

    render() {
        const number = parseInt(this.getAttribute('number') || '0', 10);
        const delay = this.getAttribute('delay') || '0';
        const color = this.getRangeColor(number);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                .ball {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #fff;
                    background: ${color};
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
                    transform: scale(0.9);
                    opacity: 0;
                    animation: pop 0.35s ease forwards;
                    animation-delay: ${delay}s;
                }
                @keyframes pop {
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                @media (max-width: 600px) {
                    .ball {
                        width: 52px;
                        height: 52px;
                        font-size: 1rem;
                    }
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }
}

/**
 * LottoGenerator Component
 * Manages the UI and logic for generating multiple sets of lotto numbers.
 */
class LottoGenerator extends HTMLElement {
    constructor() {
        super();
        this.history = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // Initial generation
        this.pickNumbers();
    }

    setupEventListeners() {
        const pickBtn = this.querySelector('#pickBtn');
        if (pickBtn) {
            pickBtn.addEventListener('click', () => this.pickNumbers());
        }
    }

    generateMainNumbers() {
        const selected = new Set();
        while (selected.size < 6) {
            selected.add(Math.floor(Math.random() * 45) + 1);
        }
        return [...selected].sort((a, b) => a - b);
    }

    generateBonusNumber(mainNumbers) {
        let bonus;
        do {
            bonus = Math.floor(Math.random() * 45) + 1;
        } while (mainNumbers.includes(bonus));
        return bonus;
    }

    pickNumbers() {
        const setCountEl = this.querySelector('#setCount');
        const includeBonusEl = this.querySelector('#includeBonus');
        
        const count = setCountEl ? Number(setCountEl.value) : 5;
        const includeBonus = includeBonusEl ? includeBonusEl.checked : false;

        const results = Array.from({ length: count }, () => {
            const main = this.generateMainNumbers();
            return {
                main,
                bonus: includeBonus ? this.generateBonusNumber(main) : null,
            };
        });

        this.history.unshift({ count, includeBonus, results, timestamp: new Date() });
        this.renderResults(results, includeBonus);
        this.renderHistory();
    }

    renderResults(results, includeBonus) {
        const resultGrid = this.querySelector('#resultGrid');
        if (!resultGrid) return;

        resultGrid.innerHTML = '';

        results.forEach((item, idx) => {
            const card = document.createElement('article');
            card.className = 'result-card';

            const title = document.createElement('h3');
            title.className = 'result-title';
            title.textContent = `${idx + 1}번째 추천 번호`;
            card.appendChild(title);

            const numberWrap = document.createElement('div');
            numberWrap.className = 'numbers';

            item.main.forEach((num, index) => {
                const ball = document.createElement('lotto-ball');
                ball.setAttribute('number', num);
                ball.setAttribute('delay', index * 0.06);
                numberWrap.appendChild(ball);
            });

            if (includeBonus) {
                const bonusLabel = document.createElement('span');
                bonusLabel.className = 'bonus-label';
                bonusLabel.textContent = '+ 보너스';
                numberWrap.appendChild(bonusLabel);

                const bonusBall = document.createElement('lotto-ball');
                bonusBall.setAttribute('number', item.bonus);
                bonusBall.setAttribute('delay', (item.main.length + 1) * 0.06);
                numberWrap.appendChild(bonusBall);
            }

            card.appendChild(numberWrap);
            resultGrid.appendChild(card);
        });
    }

    renderHistory() {
        const historyList = this.querySelector('#historyList');
        if (!historyList) return;

        historyList.innerHTML = '';

        if (this.history.length === 0) {
            historyList.innerHTML = '<li class="empty-text">아직 추천 기록이 없습니다.</li>';
            return;
        }

        this.history.slice(0, 5).forEach((entry, index) => {
            const li = document.createElement('li');
            const title = `<strong>${index + 1}. ${entry.count}세트 추천</strong>`;
            const bonusText = entry.includeBonus ? " (보너스 포함)" : "";
            
            const lines = entry.results
                .map((result, idx) => {
                    const base = result.main.join(' / ');
                    const line = entry.includeBonus ? `${base} + 보너스 ${result.bonus}` : base;
                    return `세트 ${idx + 1}: ${line}`;
                })
                .join('<br />');

            li.innerHTML = `${title}${bonusText}<br />${lines}`;
            historyList.appendChild(li);
        });
    }

    render() {
        // We assume the light DOM already has the necessary structure from index.html
        // If it was empty, we could populate it here, but we'll respect the user's HTML.
    }
}

// Register Custom Elements
customElements.define('lotto-ball', LottoBall);
customElements.define('lotto-generator', LottoGenerator);
