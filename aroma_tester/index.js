const root = document.querySelector("#root");

async function getData() {
    const data = await fetch('../chosen-parfums.json')
        .then(result => result.json());

    return data;
}


async function createForm() {
    const data = await getData();
    let content = '<div class="form">';

    const notes = (elem) => {
        let content = ``;
        for (let i = 0; i < elem.pyramid.length; i++) {
            content += `
                <li>${elem.pyramid[i]}</li>
            `
        };
        return content;
    }

    for (let i = 0; i <= data.length; i++) {
        if (data[i]) {
            content += `
                            <div class="form-item">
                                <div class="form-img">
                                    <img src=${data[i]?.img} alt="parfume image">
                                </div>
                                <div class="item-info">
                                    <h2 class="title"> <a target="_blank"href=${data[i].link}>${data[i]?.analog}</a></h2>
                                    <ul class="notes-list">
                                        ${notes(data[i])}
                                    </ul>
                                    <input class="input" type="text" placeholder="Enter custom parfume №" data-answer=${data[i]?.customNumber}>
                                </div>
                            </div>
                        `;
            if (i === data.length - 1) {
                content += `
                            <button class="submit" id="submit">check the result</button>
                            <div class="results">Here will be your result</div>
                        </div>
                    `
            };
        }
    }

    return root.innerHTML = content;
};

createForm();

function validateInput(inputs) {
    let passed = 0;

    for (let i = 0; i <= inputs.length; i++) {
        if (inputs[i]) {
            const value = inputs[i].value;

            if (value == '') {
                document.querySelector('#submit').innerText = 'please fill in all fields!';
                document.querySelector('#submit').classList.add('error');
                inputs[i].classList.add('error');
            } else {
                passed++;
                inputs[i].classList.remove('error');
            }
        }
    };
    console.log(passed)
    return passed == inputs.length;
};

function checkAllAnswers(inputs) {
    let result = 0;
    for (let i = 0; i <= inputs.length; i++) {
        if (inputs[i]) {
            const value = inputs[i].value;
            const answer = inputs[i].dataset.answer;
            console.log(value, answer);
            if (value === answer) {
                inputs[i].closest('.form-item').classList.add('passed');
                result++;
            } else {
                inputs[i].closest('.form-item').classList.add('failed');
            }
        }
    };
    document.querySelector('.results').innerText = `Правильных ответов: ${result}`;
}



document.addEventListener('click', e => {
    const target = e.target;

    if (target.classList.contains('submit')) {
        const inputs = document.querySelectorAll('.input');
        target.classList.remove('error');
        target.innerText = 'check the result';
        if (validateInput(inputs)) {
            checkAllAnswers(inputs);
            target.innerText = 'done!';
        }
    }
});

document.addEventListener('input', e => {
    const target = e.target;

    if (target.classList.contains('input')) {
        const value = target.value;
        const prefix = '№';
        if (value.indexOf(prefix) == 0) {
            return;
        } else {
            if (prefix.indexOf(value) >= 0) {
                target.value = prefix;
            } else {
                target.value = prefix + value;
            }
        }
    }
});