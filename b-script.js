// Функция для генерации смарт-контракта на основе введенных данных
function generateTokenContract(tokenName, tokenSymbol, initialSupply, mintable, burnable, ownable, pausable, feeOnTransfer, referralReward, batchTransfer, freezeAccount, burnFrom, lockTokens, airdrop, donate) {
    let contract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ${tokenName} is ERC20, Ownable {
    mapping(address => bool) public frozenAccounts;
    mapping(address => uint256) public lockTime;
    mapping(address => address) public referrers; // Mapping for referrers

    constructor() ERC20("${tokenName}", "${tokenSymbol}") {
        _mint(msg.sender, ${initialSupply} * (10 ** decimals()));
    }

    `;

    if (batchTransfer) {
        contract += `
    function batchTransfer(address[] memory recipients, uint256 amount) public {
        for (uint256 i = 0; i < recipients.length; i++) {
            _transfer(msg.sender, recipients[i], amount);
        }
    }
`;
    }

    if (freezeAccount) {
        contract += `
    function freezeAccount(address target, bool freeze) public onlyOwner {
        frozenAccounts[target] = freeze;
    }

    modifier notFrozen(address _address) {
        require(!frozenAccounts[_address], "Account is frozen");
        _;
    }
`;
    }

    if (burnFrom) {
        contract += `
    function burnFrom(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }
`;
    }

    if (lockTokens) {
        contract += `
    function lock(address account, uint256 time) public onlyOwner {
        lockTime[account] = block.timestamp + time;
    }

    modifier notLocked(address _address) {
        require(block.timestamp >= lockTime[_address], "Tokens are locked");
        _;
    }
`;
    }

    if (airdrop) {
        contract += `
    function airdrop(address[] memory recipients, uint256 amount) public onlyOwner {
        for (uint256 i = 0; i < recipients.length; i++) {
            _mint(recipients[i], amount);
        }
    }
`;
    }

    if (donate) {
        contract += `
    function donate(uint256 amount) public {
        _transfer(msg.sender, charityAddress, amount); // Здесь нужна переменная charityAddress
    }
`;
    }

    if (mintable) {
        contract += `
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
`;
    }

    if (burnable) {
        contract += `
    function burn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
`;
    }

    if (pausable) {
        contract += `
    function pause() public onlyOwner {
        // Implement suspend logic
    }

    function unpause() public onlyOwner {
        // Implement resume logic
    }
`;
    }

    // Referral reward logic
    if (referralReward > 0) {
        contract += `
    function setReferrer(address referrer) public {
        require(referrers[msg.sender] == address(0), "Referrer already set");
        referrers[msg.sender] = referrer;
    }

    function _transfer(address sender, address recipient, uint256 amount) internal override {
        super._transfer(sender, recipient, amount);

        address referrer = referrers[recipient];
        if (referrer != address(0)) {
            uint256 reward = amount * ${referralReward} / 100;
            super._transfer(sender, referrer, reward); 
        }
    }
`;
    }

    contract += `
}
`;

    return contract;
}

// Функция для открытия модального окна
function openModal() {
    document.getElementById('modal').style.display = 'block';
}

// Функция для закрытия модального окна
function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// Функция для генерации контракта и отображения его в модальном окне
function setupGenerateButton() {
    document.getElementById('generateButton').addEventListener('click', function () {
        const tokenName = document.getElementById('tokenName').value;
        const tokenSymbol = document.getElementById('tokenSymbol').value;
        const initialSupply = document.getElementById('initialSupply').value;
        const feeOnTransfer = document.getElementById('feeOnTransfer').value;
        const referralReward = document.getElementById('referralReward').value;
        const mintable = document.getElementById('mintable').checked;
        const burnable = document.getElementById('burnable').checked;
        const ownable = document.getElementById('ownable').checked;
        const pausable = document.getElementById('pausable').checked;

        // Получение значений новых чекбоксов
        const batchTransfer = document.getElementById('batchTransfer').checked;
        const freezeAccount = document.getElementById('freezeAccount').checked;
        const burnFrom = document.getElementById('burnFrom').checked;
        const lockTokens = document.getElementById('lockTokens').checked;
        const airdrop = document.getElementById('airdrop').checked;
        const donate = document.getElementById('donate').checked;

        // Генерация контракта с новыми параметрами
        const contractCode = generateTokenContract(
            tokenName,
            tokenSymbol,
            initialSupply,
            mintable,
            burnable,
            ownable,
            pausable,
            feeOnTransfer,
            referralReward,
            batchTransfer,
            freezeAccount,
            burnFrom,
            lockTokens,
            airdrop,
            donate
        );

        // Отображение сгенерированного кода в модальном окне
        document.getElementById('generatedCode').textContent = contractCode;
        openModal();
    });
}

// Обновление значения ползунка и текста
document.getElementById('feeOnTransfer').addEventListener('input', function () {
    document.getElementById('feeValue').textContent = this.value;
});

// Запрет выделения текста
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('modal').addEventListener('mousedown', function(e) {
        e.preventDefault(); // Запретить выделение
    });

    // Инициализация кнопки генерации
    setupGenerateButton();
});

// Подсветка синтаксиса
function highlightSyntax(code) {
    return code
        .replace(/\b(function|contract|pragma|import|is|returns|event|require|public|private|internal|external|if|else|for|while|return|new|delete|try|catch|finally|throw|emit|view|pure|payable|nonpayable|override|virtual|this)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(_mint|_burn|msg|sender|owner)\b/g, '<span class="function">$1</span>')
        .replace(/"([^"]*)"/g, '<span class="string">"$1"</span>')
        .replace(/\/\/.*/g, '<span class="comment">$&</span>')
        .replace(/\b(uint256|int256|address|bool|string|mapping)\b/g, '<span class="variable">$1</span>');
}

// Отображение с подсветкой синтаксиса
function displayGeneratedCode() {
    const tokenName = document.getElementById('tokenName').value || 'MyToken';
    const tokenSymbol = document.getElementById('tokenSymbol').value || 'MTK';
    const initialSupply = document.getElementById('initialSupply').value || 1000000;
    const feeOnTransfer = document.getElementById('feeOnTransfer').value || 0;
    const referralReward = document.getElementById('referralReward').value || 10;
    const mintable = document.getElementById('mintable').checked;
    const burnable = document.getElementById('burnable').checked;
    const ownable = document.getElementById('ownable').checked;
    const pausable = document.getElementById('pausable').checked;

    const contractCode = generateTokenContract(tokenName, tokenSymbol, initialSupply, mintable, burnable, ownable, pausable, feeOnTransfer, referralReward);
    document.getElementById('generatedCode').innerHTML = highlightSyntax(contractCode);
}

// Функция генерации кода и вызов displayGeneratedCode для отображения
document.getElementById('generateButton').addEventListener('click', function () {
    displayGeneratedCode();
    openModal();
});


// СКАН УЯЗВИМОСТЕЙ
document.addEventListener('DOMContentLoaded', () => {
    // Запускаем сканирование при нажатии на кнопку
    document.getElementById('scanButton').addEventListener('click', startVulnerabilityScan);

    function startVulnerabilityScan() {
        const scanButton = document.getElementById('scanButton');
        const progressBar = document.getElementById('progressBar');
        const scanStatus = document.getElementById('scanStatus');
        const scanResult = document.getElementById('scanResult');
        const generatedCode = document.getElementById('generatedCode').textContent; // Получаем код из #generatedCode
        const steps = [
            "Checking for overflow...",
            "Checking for unauthorized access...",
            "Function logic analysis...",
            "Scanning common vulnerabilities..."
        ];
        let stepIndex = 0;
        scanResult.innerHTML = ''; // Очистка предыдущих результатов
        progressBar.style.width = '0%';
        progressBar.classList.remove('secure', 'vulnerable'); // Удаляем прошлые классы

        // Скрыть кнопку после нажатия
        scanButton.style.display = 'none';

              // Получаем значения полей Token Name и Token Symbol
        const tokenName = document.getElementById('tokenName').value;
        const tokenSymbol = document.getElementById('tokenSymbol').value;

        // Проверка на корректность имени токена
        const tokenNameRegex = /^[A-Za-z0-9]{3,30}$/;
        if (!tokenName || !tokenNameRegex.test(tokenName)) {
            scanStatus.textContent = 'Error: Invalid token name!';
            scanResult.innerHTML = `
                <div class="error">The token name must contain from 3 to 30 characters and consist only of letters and numbers.</div>
                <div class="example">Example of a correct name: ExampleToken</div>
            `;
            return; // Останавливаем дальнейшее выполнение функции сканирования
        }

        // Проверка на корректность символа токена
        const tokenSymbolRegex = /^[A-Z0-9]{3,5}$/;
        if (!tokenSymbol || !tokenSymbolRegex.test(tokenSymbol)) {
            scanStatus.textContent = 'Error: Invalid token symbol!';
            scanResult.innerHTML = `
                <div class="error">The token symbol must be 3 to 5 capital letters or numbers.</div>
                <div class="example">Example of a correct character: EXM</div>
            `;
            return; // Останавливаем дальнейшее выполнение функции сканирования
        }
      
      // Начало выполнения сканирования
        const interval = setInterval(() => {
            if (stepIndex < steps.length) {
                // Обновляем статус и прогресс
                scanStatus.textContent = steps[stepIndex];
                progressBar.style.width = `${((stepIndex + 1) / steps.length) * 100}%`;
                stepIndex++;
            } else {
                clearInterval(interval);
                displayScanResult(generatedCode);
            }
        }, 2000); // Переход на следующий шаг каждые 2 секунды
    }

    function displayScanResult(code) {
        const progressBar = document.getElementById('progressBar');
        const scanStatus = document.getElementById('scanStatus');
        const scanResult = document.getElementById('scanResult');

        const vulnerabilities = checkForVulnerabilities(code);

        if (!vulnerabilities.length) {
            progressBar.classList.add('secure');
            scanStatus.textContent = 'Your code is protected';
            scanResult.innerHTML = '<div class="secure-icon">✔️</div> <div>Your code is protected</div>';
        } else {
            progressBar.classList.add('vulnerable');
            scanStatus.textContent = 'Scan completed: Vulnerabilities detected!';
            scanResult.innerHTML = `
                <div class="vulnerable-icon">⚠️</div> 
                <div>Оvulnerabilities discovered</div>
                <ul>
                    ${vulnerabilities.map(vuln => `<li>${vuln}</li>`).join('')}
                </ul>
            `;
        }
    }

    function checkForVulnerabilities(code) {
        const vulnerabilities = [];

        // Пример простого анализа для уязвимостей
        if (/\b\d{10,}\b/.test(code)) {
            vulnerabilities.push('Possible overflow due to large numbers');
        }

        if (/\b(admin|password|root)\b/i.test(code)) {
            vulnerabilities.push('Possibility of unauthorized access (admin, password, root)');
        }

        if (/\b(OR\s1=1|--|;--|DROP\sTABLE)\b/i.test(code)) {
            vulnerabilities.push('Possible SQL injection');
        }

        return vulnerabilities;
    }
});

// Функция для скачивания кода смарт-контракта
function downloadCode() {
    const code = document.getElementById('generatedCode').textContent;
    const blob = new Blob([code], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'SmartContract.sol';
    link.click();
}

// Привязка обработчика к кнопке скачивания
document.getElementById('downloadButton').addEventListener('click', downloadCode);

// ДОКУМЕНТЫ ===============

function downloadMultipleDocs() {
    const contractFunctions = `
        Документация для смарт-контракта:
        1. Функция batchTransfer: Передача токенов нескольким получателям.
        2. Функция freezeAccount: Замораживает аккаунты для предотвращения транзакций.
        3. Функция mint: Создание новых токенов.
        (добавьте все функции, выбранные пользователем)
    `;
  
    const deploymentPlan = `
        Пошаговый план развертывания смарт-контракта:
        1. Подготовка к развертыванию:
            - Выбор блокчейна (Ethereum, Binance Smart Chain, и т.д.)
            - Установка необходимых инструментов (Truffle, Hardhat, Remix)
        2. Проверка кода на уязвимости:
            - Использование инструментов для анализа безопасности.
            - Проверка наличия ошибок в коде.
        3. Развертывание контракта:
            - Создание и использование кошелька.
            - Выполнение транзакции на выбранном блокчейне.
        4. Возможные ошибки при развертывании и их решение.
    `;

    const managementGuide = `
        Руководство по управлению смарт-контрактом:
        1. Как управлять токеном через сервисы:
            - Использование Etherscan для мониторинга токенов.
            - Использование Metamask для отправки транзакций.
        2. Бесплатные сервисы для управления:
            - MyEtherWallet, Etherscan и другие.
        3. Как использовать токен:
            - Для создания пула ликвидности на децентрализованных биржах.
            - Как делать обмены и управлять своим токеном.
    `;

    const listingGuide = `
        Как подавать заявки на листинг на DEX биржах:
        1. Процесс подачи заявки:
            - Составление описания токена.
            - Выбор платформы для листинга (например, Uniswap, PancakeSwap).
        2. Бесплатные варианты:
            - Составление листинга на низкообъемных DEX.
            - Как получить поддержку сообщества для листинга.
    `;

    const additionalResources = `
        Дополнительные ресурсы для улучшения работы с токеном:
        1. Как продвигать токен:
            - Использование социальных сетей.
            - Создание сообщества для популяризации токена.
        2. Как отслеживать и анализировать производительность:
            - Использование аналитических платформ.
            - Как получить популярность на основе сообщества и маркетинга.
    `;

    const docs = [
        { content: contractFunctions, name: 'ContractFunctions.txt' },
        { content: deploymentPlan, name: 'DeploymentPlan.txt' },
        { content: managementGuide, name: 'ManagementGuide.txt' },
        { content: listingGuide, name: 'ListingGuide.txt' },
        { content: additionalResources, name: 'AdditionalResources.txt' }
    ];

    docs.forEach(doc => {
        const blob = new Blob([doc.content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = doc.name;
        link.click();
    });
}

// Привязка обработчика к кнопке скачивания нескольких документов
document.getElementById('downloadDocsButton').addEventListener('click', downloadMultipleDocs);


// ИНФО МОДАЛ

document.addEventListener('DOMContentLoaded', () => {
    // Слушатель для значка "i"
    const infoIcon = document.getElementById('infoIcon');
    const modal = document.getElementById('infoModal');
    const closeModal = document.getElementById('closeModal');

    // Открытие модального окна при клике на значок "i"
    infoIcon.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});

// ОПЛАТА ======================
// Функция для получения значения параметра из URL
function getUrlParameter(name) {
    var urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Проверяем, если статус "paid", то показываем контейнер
window.onload = function() {
    var paymentStatus = getUrlParameter("status");

    if (paymentStatus === "paid") {
        document.getElementById("downloadContainer").style.display = "block"; // Показываем контейнер
 document.getElementById("PayContainer").style.display = "none"; // Скрываем контейнер с оплатой
    }
};

window.onload = function() {
    var paymentStatus = getUrlParameter("status");

    if (paymentStatus === "paid") {
        localStorage.setItem("paymentStatus", "paid"); // Сохраняем статус
    }

    if (localStorage.getItem("paymentStatus") === "paid") {
        document.getElementById("downloadContainer").style.display = "block";
 document.getElementById("PayContainer").style.display = "none"; // Скрываем контейнер с оплатой
    }
};
