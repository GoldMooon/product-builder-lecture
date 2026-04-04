
class LottoBall extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });
        const number = this.getAttribute('number');
        const color = this.getBallColor(number);

        const circle = document.createElement('div');
        circle.style.backgroundColor = color;
        circle.style.width = '50px';
        circle.style.height = '50px';
        circle.style.borderRadius = '50%';
        circle.style.display = 'flex';
        circle.style.justifyContent = 'center';
        circle.style.alignItems = 'center';
        circle.style.color = 'white';
        circle.style.fontSize = '24px';
        circle.textContent = number;

        shadow.appendChild(circle);
    }

    getBallColor(number) {
        const num = parseInt(number, 10);
        if (num <= 10) return '#fbc400'; // yellow
        if (num <= 20) return '#69c8f2'; // blue
        if (num <= 30) return '#ff7272'; // red
        if (num <= 40) return '#aaa'; // gray
        return '#b0d840'; // green
    }
}

customElements.define('lotto-ball', LottoBall);


document.getElementById('generate-btn').addEventListener('click', () => {
    const numberDisplay = document.getElementById('number-display');
    numberDisplay.innerHTML = '';

    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    for (const number of sortedNumbers) {
        const lottoBall = document.createElement('lotto-ball');
        lottoBall.setAttribute('number', number);
        numberDisplay.appendChild(lottoBall);
    }
});
