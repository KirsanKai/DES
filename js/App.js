class App {
    constructor() {
        this.inputText = document.getElementById('inputText');
        this.inputKey = document.getElementById('inputKey');
        this.inputCode = document.getElementById('inputCode');
        this.chooseAction = document.getElementById('chooseAction');
        this.buttonEnter = document.getElementById('buttonEnter');
        this.currentAction = null;

        this.sizeOfBlock = 128; // В DES размер блока 64 бит, но поскольку в unicode символ в два раза длинее, то увеличим блок тоже в два раза
        this.sizeOfChar = 16; // Размер одного символа
        this.shiftKey = 2; // Сдвиг ключа 
        this.quantityOfRounds = 16; // Количество раундов
        this.blocks = []; // Блоки для деления

        this.chooseAction.addEventListener('change', () => {
            this.currentAction = this.chooseAction.value;
        });
        this.buttonEnter.addEventListener('click', () => {
            if (this.currentAction) {
                this[this.currentAction]();
            }
        });
    }

    // Дополнить строку до правильного размера (по умолчанию знаком "*", можно поменять на пробел)
    stringToRightLength(input) {
        while (((input.length * this.sizeOfChar) % this.sizeOfBlock) != 0) {
            input += "*";
        }
        return input;
    }

    // Поделить строку на блоки
    сutStringIntoBlocks(input) {
        const blocksLength = (input.length * this.sizeOfChar) / this.sizeOfBlock;
        this.blocks = [];
        const lengthOfBlock = input.length / blocksLength;

        for (let i = 0; i < blocksLength; i++) {
            this.blocks[i] = input.substring(i * lengthOfBlock, (i + 1) * lengthOfBlock);
            this.blocks[i] = this.stringToBinaryFormat(this.blocks[i]);
        }
    }

    // Поделить бинарный код на блоки
    cutBinaryStringIntoBlocks(input) {
        const blocksLength = input.length / this.sizeOfBlock;
        this.blocks = [];
        const lengthOfBlock = input.length / blocksLength
        for (let i = 0; i < blocksLength; i++) {
            this.blocks[i] = input.substring(i * lengthOfBlock, (i + 1) * lengthOfBlock);
        }
    }

    // Перевести строку в бинарный код (по умолчению до 16 бит)
    stringToBinaryFormat(input) {
        let output = "";
        for (let i = 0; i < input.length; i++) {
            let char_binary = input[i].charCodeAt(0).toString(2);
            while (char_binary.length < this.sizeOfChar) {
                char_binary = "0" + char_binary;
            }
            output += char_binary;
        }
        return output;
    }

    // Перевести бинарный код в символьный
    stringFromBinaryToNormalFormat(input) {
        let output = "";
        for (let i = 0; i < input.length / this.sizeOfChar; i++) {
            let char_binary = input.substring(i * this.sizeOfChar, (i + 1) * this.sizeOfChar);
            output += String.fromCharCode(parseInt(char_binary, 2));
        }
        return output;
    }

    // Дополнить ключ символами 
    correctKeyWord(input, lengthKey) {
        if (input.length > lengthKey) {
            input = input.substring(0, lengthKey);
        } else {
            while (input.length < lengthKey) {
                input = "0" + input;
            }
        }
        return input;
    }

    // Один раунд DES шифрования
    encodeDES_OneRound(input, key) {
        const L = input.substring(0, input.length / 2);
        const R = input.substring(input.length / 2);
        return (R + this.XOR(L, this.f(R, key)));
    }

    // Один раунд DES дешифрования 
    decodeDES_OneRound(input, key) {
        const L = input.substring(0, input.length / 2);
        const R = input.substring(input.length / 2);

        return (this.XOR(this.f(L, key), R) + L);
    }

    // XOR
    XOR(s1, s2) {
        let result = "";
        for (let i = 0; i < s1.length; i++) {
            const a = s1[i] - 0;
            const b = s2[i] - 0;
            if (a ^ b)
                result += "1";
            else
                result += "0";
        }
        return result;
    }

    // Логическая фунция (по умолчанию стоит XOR)
    f(s1, s2) {
        return this.XOR(s1, s2);
    }

    // Циклический сдвиг ">>"
    keyToNextRound(key) {
        for (let i = 0; i < this.shiftKey; i++) {
            key = key[key.length - 1] + key;
            key = key.slice(0, key.length - 1);
        }
        return key;
    }

    // Циклический сдвиг "<<"
    keyToPrevRound(key) {
        for (let i = 0; i < this.shiftKey; i++) {
            key = key + key[0];
            key = key.slice(1);
        }
        return key;
    }

    // Закодировать
    toCode() {
        let text = this.inputText.value;
        let key = this.inputKey.value;
        text = this.stringToRightLength(text);
        this.сutStringIntoBlocks(text);
        key = this.correctKeyWord(key, text.length / (2 * this.blocks.length));
        key = this.stringToBinaryFormat(key);
        for (let j = 0; j < this.quantityOfRounds; j++) {
            for (let i = 0; i < this.blocks.length; i++) {
                this.blocks[i] = this.encodeDES_OneRound(this.blocks[i], key);
            }
            key = this.keyToNextRound(key);
        }
        key = this.keyToPrevRound(key);
        key = this.stringFromBinaryToNormalFormat(key);
        let code = "";
        for (let i = 0; i < this.blocks.length; i++) {
            code += this.blocks[i];
        }
        code = this.stringFromBinaryToNormalFormat(code);
        this.inputKey.value = key;
        this.inputCode.value = code;
    }

    // Декордировать
    toDecode() {
        let code = this.inputCode.value;
        let key = this.inputKey.value;
        key = this.stringToBinaryFormat(key);
        code = this.stringToBinaryFormat(code);
        this.cutBinaryStringIntoBlocks(code);
        for (let j = 0; j < this.quantityOfRounds; j++) {
            for (let i = 0; i < this.blocks.length; i++) {
                this.blocks[i] = this.decodeDES_OneRound(this.blocks[i], key);
            }
            key = this.keyToPrevRound(key);
        }
        key = this.keyToNextRound(key);
        key = this.stringFromBinaryToNormalFormat(key);
        let text = "";
        for (let i = 0; i < this.blocks.length; i++) {
            text += this.blocks[i];
        }
        text = this.stringFromBinaryToNormalFormat(text);
        this.inputKey.value = key;
        this.inputText.value = text;
    }
}