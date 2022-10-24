document.addEventListener("click", (event) => {
    const playBtn = event.target.closest(".play-btn");

    if (playBtn === null ) return;

    playBtn.classList.toggle("play");

    setTimeout(() => {
        playBtn.classList.toggle("pause");
    }, 600);
});

const logo = document.querySelector(".logo__link");
logo.addEventListener("click", (event) => {
    event.preventDefault();
});

document.addEventListener("click", (event) => {
    const menuLink = event.target.closest(".menu__link");

    if (menuLink === null ) return;

    event.preventDefault();
});

document.addEventListener("keydown", (event) => {
    if (event.code !== "KeyL") return;

    document.documentElement.classList.toggle("dark-theme");
});

const likeBtns = [ ...document.querySelectorAll(".like-btn__btn") ];
likeBtns.forEach((btn) => {
    btn.addEventListener("click", function(event) {
        const roundLikes = (val) => val > 999
            ? `${Math.round(val / 100) / 10}K`
            : val;
        const disableLikeBtn = (btn, increment) => {
            const component = btn.closest(".like-btn");

            // помечаем компонент серым цветом
            component.classList.add("like-btn_disabled");

            // увеличиваем значение на 1
            if (increment) {
                const likes = component.querySelector(".like-btn__likes");
                let textNode = likes.childNodes[ likes.childNodes.length - 1 ];
                likes.removeChild(textNode);

                const newValue = +(btn.dataset.likes) + 1;
                textNode = document.createTextNode( roundLikes(newValue) );

                likes.appendChild(textNode);
            }

            // устанавливаем title для фидбека

            component.title = "Вы уже голосовали за данный трек";

            btn.remove();
        };
        const poll = new SimplePoll({
            selector: ".js-poll",
            pollID: 1,
            url: "/api/poll/poll/",
            // в коллбеках this будет указывать на сам кликнутый элемент
            successCallback: function (respond, self) {
                // скрываем иконку лайка
                this.querySelector(".like-btn__icon")
                    .style.display = "none";
                // по окончании анимации изчезновения кнопки
                // удаляем ее из ДОМа
                this.addEventListener("animationend", (event) => {
                    disableLikeBtn(this, true);
                }, { once: true });

                const result = document.createElement("SPAN");
                result.className = "like-btn__result";
                result.textContent = "+1";

                this.append(result);
                // анимация исцезновения кнопки
                this.classList.add("like-btn__btn_fading");
            },
            errorCallback: function (respond, self) {
                disableLikeBtn(this, false);
            }
        });
        const roll = Math.round( Math.random() );

        if (roll === 1) return disableLikeBtn(this, false);

        // скрываем иконку лайка
        this.querySelector(".like-btn__icon")
            .style.display = "none";
        // по окончании анимации изчезновения кнопки
        // удаляем ее из ДОМа
        this.addEventListener("animationend", (event) => {
            disableLikeBtn(this, true);
        }, { once: true });

        const result = document.createElement("SPAN");
        result.className = "like-btn__result";
        result.textContent = "+1";

        this.append(result);
        this.classList.add("like-btn__btn_fading");
    });
});

var MP = {
    ParseQueryString(url) {
        const page = window.location.pathname
            .replace("/", "")
            .replace(".html", "");

        return {
            an: page
        };
    }
}

var History = { Adapter() {} };

var SimplePoll = function() {};