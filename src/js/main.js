var LikeFM = LikeFM || {
    // названия статей в шаблонизаторе
    indexPageAn:        "index",
    playlistPageAn:     "playlist",
    videoPageAn:        "video",
    trendPageAn:        "trend",
};

LikeFM.resizeHandlers = LikeFM.resizeHandlers || {};
LikeFM.initializers = LikeFM.initializers || {};
LikeFM.initedPages = LikeFM.initedPages || {};

// инициализация общих для всего сайта обработчиков
LikeFM.initCommon = () => {
    if (LikeFM.isInited) return;

    isDocReady(() => {
        const { documentElement: root, body } = document;
        let viewportWidth = body.clientWidth;

        // функционал логотипа
        [ ...document.querySelectorAll(".logo") ].forEach((logo) => {
            logo.addEventListener("click", (event) => {
                const logoLink = event.target.closest(".logo__link");
                if (logoLink !== null) {
                    // при клике на лого всегда закрываем открытый плейлист
                    togglePlaylist(false);

                    // если нажимаем на ссылку в логотипе
                    // и мы находимся в этот момент на главной
                    // прокручиваем к началу страницы
                    if ( getArticleName() === "index" ) {
                        root.scrollTop = 0;
                    }
                }

                const logoBtn = event.target.closest(".logo__play-btn");
                if (logoBtn !== null) {
                    runLogoLikesAnimation(logo);
                }
            });

            // при наведении курсора мыши на красный прямоугольник в логотипе
            // запускаем его анимацию
            const logoBtn = logo.querySelector(".logo__play-btn");

            logoBtn.addEventListener("pointerenter", (event) => {
                const logoImg = logo.querySelector(".logo__img");
                logoImg.classList.add("logo__img_animated");
            });
        });
        document.addEventListener("animationend", (event) => {
            const isLogoIcon = event.target.classList.contains("logo__icon");
            const isLikeIcon = event.target.classList.contains("logo-likes__like");

            if (!isLogoIcon && !isLikeIcon) return;

            if (isLogoIcon) {
                const logoImg = event.target.closest(".logo__img");

                logoImg.classList.remove("logo__img_animated");
            }

            if (isLikeIcon && event.target.parentElement.lastElementChild === event.target) {
                const wrap = document.getElementById("js-logo-likes");
                wrap.classList.remove("logo-likes_visible");
            }
        });

        // генерируем все необходимое для анимации всплывающих лайков
        (() => {
            const wrap = document.createElement("DIV");
            wrap.className = "logo-likes";
            wrap.id = "js-logo-likes";

            for (let i = 1; i <= 5; i++) {
                const like = document.createElement("DIV");
                like.className = `logo-likes__like logo-likes__like_n_${i}`;
                wrap.append(like);
            }

            body.append(wrap);
        })();

        function runLogoLikesAnimation(logo) {
            const wrap = document.getElementById("js-logo-likes");
            const logoCoords = logo.getBoundingClientRect();
            const top = logoCoords.top - 35;

            wrap.style.top = `${top < 0 ? 0 : top}px`;
            wrap.style.left = `${logoCoords.left}px`;
            wrap.style.width = `${logo.offsetWidth}px`;
            wrap.classList.add("logo-likes_visible");

            // setTimeout(() => {
            //     wrap.style.display = "none";
            // }, 1000);
        }

        // если нажимаем на ссылку в меню
        // и мы находимся в этот момент на этой странице
        // прокручиваем к началу страницы
        const menuList = document.querySelector(".menu");
        menuList.addEventListener("click", (event) => {
            const link = event.target.closest(".menu__link");

            if (link === null) return;

            const an = getArticleName();
            const targetAn = getArticleName(link.href);

            if (an === targetAn) {
                root.scrollTop = 0;
            }
        });

        const menu = document.querySelector(".menu-wrap");
        let isMenuOpened = false;

        // по умолчанию меню скрыто через display: none
        // для анимации нужно сначала его показать через display: block/flex
        // а затем запустить анимацию появления
        const MENU_VISIBLE_CLASSNAME =      "menu-wrap_visible";
        const MENU_ANIMATION_CLASSNAME =    "menu-wrap_appeared";
        const toggleMenuBtn = document.querySelector(".toggle-menu-btn");

        toggleMenuBtn.addEventListener("click", (event) => {
            // если есть класс анимации, значит меню
            // либо в процессе анимации (появления)
            // либо анимация появления уже проиграла и оно просто открыто
            // соответственно, если класса нет, то
            // либо проигрывается анимация скрытия
            // либо меню скрыто совсем через display: none
            const isMenuAppeared = menu.classList.contains(MENU_ANIMATION_CLASSNAME);

            toggleMenu(!isMenuAppeared);
        });

        const toggleThemeBtn = document.querySelector(".js-theme-btn");
        const toggleThemePlaceholder = document.querySelector(".page-header__btn-placeholder");

        const openSearchBtn = document.querySelector(".open-search-btn");
        const searchForm = document.querySelector(".search");
        const closeSearchBtn = searchForm.querySelector(".search__close");
        const searchInput = searchForm.querySelector(".search__input");

        // по умолчанию форма скрыта через display: none
        // для анимации нужно сначала его показать через display: block/flex
        // а затем запустить анимацию появления
        const SEARCH_VISIBLE_CLASSNAME =      "search_visible";
        const SEARCH_ANIMATION_CLASSNAME =    "search_appeared";

        // показать/скрыть форму поиска
        openSearchBtn.addEventListener("click", (event) => {
            toggleSearchForm(true);
        });
        closeSearchBtn.addEventListener("click", (event) => {
            toggleSearchForm(false);
        });

        // при переходе на другую страницу, скрываем меню и плейлист
        // и делаем активной соотв-ую ссылку в меню
        History.Adapter.bind(window, 'statechange', () => {
            togglePlaylist(false);
            toggleMenu(false);

            const an = getArticleName();
            setActiveMenuLink(an);
        });

        function toggleMenu(show) {
            isMenuOpened = show;

            toggleAnimation({
                show,
                el: menu,
                visibleClass: MENU_VISIBLE_CLASSNAME,
                animationClass: MENU_ANIMATION_CLASSNAME,
                onStateToggle: (show) => {
                    toggleBodyScrolling(show);

                    // при открытии меню кнопка открытия формы поиска
                    // меняется на кнопку смены темы
                    toggleThemeBtn.classList.toggle("toggle-theme-btn_visible", show);
                    toggleThemePlaceholder.classList.toggle("page-header__btn-placeholder_visible", show);
                    openSearchBtn.classList.toggle("open-search-btn_hidden", show);

                    toggleMenuBtn.classList.toggle("toggle-menu-btn_active", show);
                    toggleMenuBtn.setAttribute("aria-label", show ? "Закрыть меню" : "Открыть меню");
                },
                onBeforeShowing: () => {
                    menu.scrollTop = 0;
                },
            });
        }

        function toggleSearchForm(show) {
            // const show = !openSearchBtn.classList.contains("open-search-btn_active");

            openSearchBtn.classList.toggle("open-search-btn_active", show);

            toggleAnimation({
                show,
                el: searchForm,
                visibleClass: SEARCH_VISIBLE_CLASSNAME,
                animationClass: SEARCH_ANIMATION_CLASSNAME,
                onStateToggle: (show) => {
                    openSearchBtn.classList.toggle("open-search-btn_active", show);

                    if (show) {
                        searchInput.focus();
                    }
                },
            });
        }

        // форма обратной связи
        document.addEventListener("formResponse", (event) => {
            const { form, data: response } = event.detail;
            const isError = response.status === 0;
            let responseOutput = form.querySelector(".feedback-form__reponse");

            if (responseOutput === null) {
                responseOutput = document.createElement("DIV");
                responseOutput.className = "feedback-form__reponse";
                form.append(responseOutput);
            }

            responseOutput.textContent = isError ? response.result : "Ваше сообщение успешно отправлено";
            responseOutput.classList.toggle("feedback-form__reponse_errored", isError);

            if (!isError) {
                form.reset();
                form
                    .querySelector("button[type='submit'], input[type='submit']")
                    .disabled = true;
            }
        });

        // замена иконок для пунктов меню
        const menuLinksMap = {};

        [ ...menuList.querySelectorAll(".menu__link") ].forEach((link) => {
            menuLinksMap[ getArticleName(link.href) ] = link;
        });

        /**
         * делает активной соответствующую ссылку в главном меню
         * и меняем иконку у ссылки на заполненную
         * (через заливку одной и той же svg-иконки сделать не вышло)
         * @param {String} [an] - название страницы (статьи)
         */
        function setActiveMenuLink(an) {
            for (const page in menuLinksMap) {
                const link = menuLinksMap[page];
                const isActive = page === an;

                link.classList.toggle("menu__link_active", isActive);

                const useTag = link.querySelector(".menu__icon use");

                if (useTag === null) continue;

                const url = useTag.getAttribute("xlink:href");
                const iconName = link.dataset.icon;
                const tmp = url.split("#");
                const path = tmp[0];

                useTag.setAttribute("xlink:href", `${path}#${iconName}${isActive ? "_filled" : ""}`);
            }
        }

        // на разрешениях <= 991
        // трек запускается при клике на сам плеер
        // а не только по кнопке воспроизведения
        // кроме главного плеера - по клику на него открывается плейлист
        document.addEventListener("click", (event) => {
            if (viewportWidth > 991) return;

            const { target } = event;
            const isLikeBtnClick = target.closest(".like-btn") !== null;
            const isPlayBtnClick = target.closest(".play-btn") !== null;

            if (isLikeBtnClick || isPlayBtnClick) return;

            const player = target.closest(".player");

            if (player === null) return;

            const isMainPlayer = player.classList.contains("player_view_main");

            if (isMainPlayer) return;

            const playBtn = player.querySelector(".player__play-btn");

            playBtn.click();
        });

        // по умолчанию плейлист скрыт через display: none
        // для анимации нужно сначала его показать через display: block/flex
        // а затем запустить анимацию появления
        const PLAYLIST_VISIBLE_CLASSNAME =      "main-playlist_visible";
        const PLAYLIST_ANIMATION_CLASSNAME =    "main-playlist_appeared";
        const playlist = document.querySelector(".main-playlist");
        const mainPlayer = document.querySelector(".main-player");
        const togglePlaylistBtn = document.querySelector(".main-player__expand-btn");
        let isAdsLoaded = false;

        // показать/скрыть плейлист
        mainPlayer.addEventListener("click", (event) => {
            const { target } = event;
            const isTogglePlaylistBtn = target === togglePlaylistBtn;
            const isPlayerText = target.closest(".player__inner") !== null;

            if (!isTogglePlaylistBtn && !isPlayerText) return;

            // если есть класс анимации, значит плейлист
            // либо в процессе анимации (появления)
            // либо анимация появления уже проиграла и он просто открыт
            // соответственно, если класса нет, то
            // либо проигрывается анимация скрытия
            // либо плейлист скрыт совсем через display: none
            const isPlaylistOpened = playlist.classList.contains(PLAYLIST_ANIMATION_CLASSNAME);

            togglePlaylist(!isPlaylistOpened);
        });

        function togglePlaylist(show) {
            toggleAnimation({
                show,
                el: playlist,
                visibleClass: PLAYLIST_VISIBLE_CLASSNAME,
                animationClass: PLAYLIST_ANIMATION_CLASSNAME,
                onStateToggle: async (show) => {
                    toggleBodyScrolling(show);

                    togglePlaylistBtn.classList.toggle("main-player__expand-btn_expanded", show);
                    togglePlaylistBtn.setAttribute("aria-label", show ? "Скрыть плейлист" : "Показать плейлист");

                    if (show && !isAdsLoaded) {
                        const response = await fetch("/D_300x600-1");
                        const html = await response.text();

                        if (response.status === 404) return;

                        const placement = playlist.querySelector(".layout-grid__aside");
                        placement.innerHTML = html;
                        isAdsLoaded = true;
                    }
                },
                onBeforeShowing: () => {
                    playlist.scrollTop = 0;
                },
            });
        }

        // инициализируем DatePicker во всплывающем плейлисте
        initDatePicker( document.querySelector(".main-playlist .history-form__input_t_date") );

        // при открытии попапцев убираем возможность скролла на body
        function toggleBodyScrolling(isPopupVisible) {
            const paddingRight = isPopupVisible ? `${getScrollbarWidth()}px` : "";
            const overflow = isPopupVisible ? "hidden" : "";

            body.style.paddingRight = paddingRight;
            body.style.overflow = overflow;
        }

        // при ресайзе на десктопные ширины, убираем лишние классы с меню
        window.addEventListener("resize", throttle(function() {
            viewportWidth = body.clientWidth;

            if (viewportWidth > 991 && isMenuOpened) {
                toggleMenu(false);
            }
        }, window, 200));

        // переключение темы
        let isDefaultTheme = null;
        let currentTheme = null;
        setThemeParams();

        toggleThemeBtn.addEventListener("click", (event) => {
            const targetTheme = currentTheme === "light" ? "dark" : "light";
            const isTargetDark = targetTheme === "dark";
            const isTargetLight = targetTheme === "light";

            root.classList.toggle("dark-theme", isTargetDark);
            root.classList.toggle("light-theme", isTargetLight);

            if (isTargetDark) {
                document.cookie = `tpl_theme=dark${isTargetDark ? "" : "; max-age=0"}`;
            }
            else {
                document.cookie = `tpl_theme=light${isTargetLight ? "" : "; max-age=0"}`;
            }

            toggleThemeBtn.setAttribute("aria-label", `Переключиться на ${isTargetDark ? "светлую" : "темную"} тему`);

            setThemeParams();
        });

        window.matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", setThemeParams);

        function setThemeParams() {
            const hasLight = root.classList.contains("light-theme");
            const hasDark = root.classList.contains("dark-theme");

            isDefaultTheme = !hasLight && !hasDark;

            if (isDefaultTheme) {
                currentTheme = (
                        window.matchMedia
                    &&  window.matchMedia("(prefers-color-scheme: dark)").matches
                ) ? "dark" : "light";
            }
            else {
                currentTheme = hasLight ? "light" : "dark";
            }

            toggleThemeBtn.classList.toggle("toggle-theme-btn_state_dark", currentTheme === "dark");
        }

        // кнопки лайков
        const roundLikes = (val) => val > 999
            ? `${Math.round(val / 100) / 10}K`
            : val;
        const changeLikesCount = ({ likesEl, btn, explicitLikes = -1 }) => {
            let textNode = likesEl.childNodes[ likesEl.childNodes.length - 1 ];
            likesEl.removeChild(textNode);

            // если явного значения передано не было считаем, что
            // нам просто нужно увеличить значение счетчика лайков на 1
            let newValue = explicitLikes === -1
                ? +(btn.dataset.likes) + 1
                : explicitLikes;
            textNode = document.createTextNode( roundLikes(newValue) );

            likesEl.appendChild(textNode);
        };
        const changeLikeBtnData = ({ component, btn, id, likes }) => {
            btn.dataset.id = id;
            btn.dataset.likes = likes;
            btn.style.display = "";
            btn.classList.remove("like-btn__btn_fading");
            btn.querySelector(".like-btn__icon")
                .style.display = "";
            const result = btn.querySelector(".like-btn__result");

            if (result !== null) {
                result.remove();
            }

            component.classList.remove("like-btn_disabled");
            component.title = "";
            component.style.display = "";
        };
        const disableLikeBtn = ({ btn, increment = false }) => {
            const component = btn.closest(".like-btn");

            // помечаем компонент серым цветом
            component.classList.add("like-btn_disabled");

            // увеличиваем значение на 1
            if (increment) {
                changeLikesCount({
                    likesEl: component.querySelector(".like-btn__likes"),
                    btn,
                });
            }

            // устанавливаем title для фидбека

            component.title = "Вы уже голосовали за данный трек";

            if (!increment) {
                MP.notify("Вы уже голосовали за данный трек", "def");
            }

            btn.style.display = "none";
            btn.classList.remove("like-btn__btn_fading");
            btn.querySelector(".like-btn__icon")
                .style.display = "";

            const result = btn.querySelector(".like-btn__result");

            if (result !== null) {
                result.remove();
            }
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
                    disableLikeBtn({
                        btn: this,
                        increment: true,
                    });
                }, { once: true });

                const result = document.createElement("SPAN");
                result.className = "like-btn__result";
                result.textContent = "+1";

                this.append(result);
                // анимация исцезновения кнопки
                this.classList.add("like-btn__btn_fading");
            },
            errorCallback: function (respond, self) {
                disableLikeBtn({ btn: this });
            }
        });

        // меняем название текущего потока при смене города вещания
        const backToLiveBtn = mainPlayer.querySelector(".main-player__back-to-live");
        const cityPopup = document.querySelector(".city-popup");

        cityPopup.addEventListener("click", (event) => {
            const cityBtn = event.target.closest(".city-list__btn");

            if (cityBtn === null) return;

            Object.assign(backToLiveBtn.dataset, cityBtn.dataset);

            const channelName = cityBtn.textContent.trim();

            [ ...document.querySelectorAll(".city-change-btn") ].forEach((btn) => {
                btn.textContent = channelName;
            });

            const cityID = cityBtn.dataset.idstation;

            // дергаем статью, чтобы запомнить выбор пользователя
            if (cityID) {
                fetch(`/detectOfCityUser/${cityID}`);
            }

            toggleSocketTitles(true);
            toggleBackToLiveBtn(false);
            togglePopup(cityPopup, false);
        });

        LikeFM.titlesTickerInstance = new TitlesTicker({
            selector: ".player__inner",
            tickingClass: "player__line_ticking",
        });

        const mainPlayerLikeComponent = document.querySelector(".main-player__like-btn");
        const mainPlayerLikeBtn = mainPlayerLikeComponent.querySelector(".like-btn__btn");
        const socketTitles = document.getElementById("js-socket-titles");
        const sampleTitles = document.getElementById("js-sample-titles");
        const sampleArtist = sampleTitles.querySelector(".player__artist");
        const sampleTitle = sampleTitles.querySelector(".player__track");

        // при воспроизведении сэмпла песни
        // подставляем названия текущего семпла в главный плеер
        // и меняем обложку трека и данные на лайк-кнопке
        // на каждой кнопке .js-sample-btn должны быть следующие атрибуты:
        // data-track-artist -   название исполнителя
        // data-track-title -    название трека (может быть пустым)
        // data-uid-track -      id трека
        // data-likes -          количество лайков
        // data-cover -          обложка трека
        document.addEventListener("click", (event) => {
            const sampleBtn = event.target.closest(".js-sample-btn");

            if (sampleBtn === null) return;

            const { trackArtist, trackTitle, uidTrack, likes, cover } = sampleBtn.dataset;
            sampleArtist.textContent = trackArtist;
            sampleTitle.textContent = trackTitle;

            mainPlayerLikeComponent.style.display = uidTrack && likes ? "" : "none";

            if (uidTrack && likes) {
                changeLikesCount({
                    likesEl: mainPlayerLikeComponent.querySelector(".like-btn__likes"),
                    btn: mainPlayerLikeBtn,
                    explicitLikes: likes,
                });

                changeLikeBtnData({
                    component: mainPlayerLikeComponent,
                    btn: mainPlayerLikeBtn,
                    id: uidTrack,
                    likes,
                });
            }

            mainPlayer
                .querySelector("img.player__cover")
                .src = cover || "/design/images/design-images/track-placeholder.svg";

            toggleSocketTitles(false);
            toggleBackToLiveBtn(true);
        });

        backToLiveBtn.addEventListener("click", (event) => {
            toggleSocketTitles(true);

            toggleBackToLiveBtn(false);
        });

        function toggleBackToLiveBtn(show) {
            toggleAnimation({
                show,
                el: backToLiveBtn,
                visibleClass: "main-player__back-to-live_visible",
                animationClass: "main-player__back-to-live_appeared",
            });
        }

        function toggleSocketTitles(show) {
            socketTitles.style.display = show ? "" : "none";
            sampleTitles.style.display = show ? "none" : "";
        }

        const mainAudio = document.querySelector("audio[data-player='likefm-main-player']");
        const mainPlaylist = document.getElementById("js-main-playlist");

        // при смене трека, добавляем последний в историю эфира
        mainAudio.addEventListener("alEventHistory", (event) => {
            const { titleExecutorFull, titleTrack, sample, cover } = event.detail.titlesData.short;
            const { startSongString, startSong } = event.detail.titlesData.stat;
            const { uidTrack, balSummaObject } = event.detail.titlesData.poll;
            let time;

            if (startSongString === undefined) {
                const tmp = new Date(startSong * 1000);
                time = `${tmp.getHours()}:${tmp.getMinutes()}`;
            }
            else {
                time = startSongString.substring(0, 5);
            }

            if (titleExecutorFull === "" && titleTrack === "" || mainPlaylist === null) return;

            const latestSongArtist = mainPlaylist
                .firstElementChild
                .querySelector(".player__artist")
                .textContent
                .trim()
                .toLocaleLowerCase();
            const artistToCheck = titleExecutorFull
                .trim()
                .toLocaleLowerCase();

            // если последняя песня в истории уже есть - ничего не выводим
            if (latestSongArtist === artistToCheck) return;

            // подставляем данные, пришедшие с сокетов
            const newPlaylistItem = mainPlaylist.lastElementChild.cloneNode(true);
            const inner = newPlaylistItem.querySelector(".player__inner");

            LikeFM.titlesTickerInstance.unobserveElement(
                mainPlaylist.lastElementChild.querySelector(".player__inner")
            );
            mainPlaylist.lastElementChild.remove();

            let timeNode = newPlaylistItem.querySelector(".player__time");
            if (timeNode === null) {
                timeNode = document.createElement("DIV");
                timeNode.className = "player__time";
                newPlaylistItem.querySelector(".player")
                    .prepend(timeNode);
            }

            timeNode.textContent = time;

            const artistNode = newPlaylistItem.querySelector(".player__artist");
            artistNode.textContent = titleExecutorFull;

            const isCoverExist = cover && cover.cover50;
            let coverNode = newPlaylistItem.querySelector(".player__cover");
            const isImgNode = coverNode.nodeName === "IMG";

            if (isCoverExist) {
                if (isImgNode) {
                    coverNode.src = cover.cover50;
                }
                else {
                    coverNode.outerHTML = `<img class="player__cover" src="${cover.cover50}" alt="Обложка трека ${titleExecutorFull} - ${titleTrack}" width="50" height="50">`;
                }
            }
            else if (isImgNode) {
                coverNode.outerHTML = `
                    <div class="player__cover">
                        <div class="cover-placeholder">
                            <img class="cover-placeholder__icon" src="${cover.cover50}" alt="" width="40" height="40">
                        </div>
                    </div>
                `;
            }

            // элемент с названием песни может быть не у всех треков
            let trackNode = newPlaylistItem.querySelector(".player__track");

            if (titleTrack) {
                if (trackNode === null) {
                    trackNode = document.createElement("DIV");
                    trackNode.className = "player__track";
                    inner.append(trackNode);
                }

                trackNode.textContent = titleTrack;
            }
            else if (trackNode !== null) {
                trackNode.remove();
            }

            let playBtn = newPlaylistItem.querySelector(".player__play-btn");

            playBtn.outerHTML = sample
                // если ссылка на семпл есть - выводим кнопку для воспроизвенения семпла
                ? `
                    <button
                        class="js-sample-btn play-btn play play-btn_s_sm player__play-btn play-btn-wrap__btn"
                        type="button"

                        aria-label="Начать воспроизведение"
                        data-player-button="likefm-main-player"
                        data-broadcast-button="${`` || performance.now() /* любое уникальное значение */}"
                        data-track="${sample}"
                        data-pause="true"
                        data-typecontent="sample"

                        data-track-artist="${titleExecutorFull}"
                        data-track-title="${titleTrack}"
                    >
                        <svg class="play-btn__icon play-btn__icon_t_play" width="66" height="54">
                            <use xlink:href="/design/images/design-images/sprite.svg?ver=3#play"></use>
                        </svg>
                        <svg class="play-btn__icon" width="66" height="54">
                            <use xlink:href="/design/images/design-images/sprite.svg?ver=3#pause"></use>
                        </svg>
                    </button>
                `
                // если ссылки на семпл нет - выводим заглушку
                : `
                    <div class="play-btn play play-btn_disabled play-btn_s_sm player__play-btn play-btn-wrap__btn" title="трек не найден">
                        <svg class="play-btn__icon play-btn__icon_t_play" width="66" height="54">
                            <use xlink:href="/design/images/design-images/sprite.svg?ver=3#play"></use>
                        </svg>
                    </div>
                `;

            const likeBtn = newPlaylistItem.querySelector(".like-btn");
            const likeBtnNode = likeBtn.querySelector(".like-btn__btn");

            changeLikesCount({
                likesEl: likeBtn.querySelector(".like-btn__likes"),
                btn: likeBtnNode,
                explicitLikes: balSummaObject,
            });

            changeLikeBtnData({
                component: likeBtn,
                btn: likeBtnNode,
                id: uidTrack,
                likes: balSummaObject,
            });

            likeBtn.title = "";
            likeBtn.setAttribute("aria-label", `Поставить лайк треку "${titleExecutorFull} - ${titleTrack}"`);

            mainPlaylist.prepend(newPlaylistItem);
            LikeFM.titlesTickerInstance.observeElement(inner);
        });

        // при смене титров меняем кол-во лайков на кнопке
        // и скрываем кнопку, если реклама или титры "Like FM"
        // и проверяем нужна ли новым титрами бегущая строка
        document.addEventListener("titlesEvent", (event) => {
            const { titleTrack,  titleExecutorFull } = event.detail.result.short;
            const { balSummaObject, uidTrack } = event.detail.result.poll;

            if (titleTrack === "" && titleExecutorFull === "") {
                mainPlayerLikeComponent.style.display = "none";

                return;
            }

            changeLikesCount({
                likesEl: mainPlayerLikeComponent.querySelector(".like-btn__likes"),
                btn: mainPlayerLikeBtn,
                explicitLikes: balSummaObject,
            });

            changeLikeBtnData({
                component: mainPlayerLikeComponent,
                btn: mainPlayerLikeBtn,
                id: uidTrack,
                likes: balSummaObject,
            });

            LikeFM.titlesTickerInstance.manualCheckForTicking(socketTitles);
        });

        // при отсутствии титров, скрываем кнопку лайка в главной плеере
        mainAudio.addEventListener("alEventStreamFail", (event) => {
            mainPlayerLikeComponent.style.display = "none";
        });

        const videoPopup = document.querySelector(".popup_content_video");
        const videoPopupCloseBtn = videoPopup.querySelector(".popup__close");
        const videoPlacement = videoPopup.querySelector(".iframe-wrap");

        document.addEventListener("click", (event) => {
            const videoBtn = event.target.closest(".js-video-btn");

            if (videoBtn === null || !videoBtn.dataset.ytLink) return;

            [ ...document.querySelectorAll("audio") ].forEach((player) => {
                player.pause();
            })

            videoPlacement.innerHTML = `
                <iframe class="iframe-wrap__video" src="${videoBtn.dataset.ytLink}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            `;

            togglePopup(videoPopup, true);
        });

        // при закрытии попапа с видео, удаляем iframe из дома
        videoPopupCloseBtn.addEventListener("click", (event) => {
            videoPlacement.innerHTML = "";
        });

        // обработчики форм:
        // 1) поиск по сайту
        // 2) поиск по истории эфира
        document.addEventListener("submit", (event) => {
            const form = event.target;
            const isSearchForm = form.matches("form.search");
            const isHistoryForm = form.matches("form.history-form");

            if (!isSearchForm && !isHistoryForm) return;

            event.preventDefault();

            if (isSearchForm) return seachFormHandler(form);

            if (isHistoryForm) return historyFormHandler(form);
        });

        function seachFormHandler(form) {
            const val = encodeURIComponent(
                form
                    .querySelector("input[name='query']")
                    .value
            );

            MPAjax.loader.currentProps = {};

            const StateData = {
                place: MPAjax.PlaceID,
                source: MPAjax.SourceID,
                replaces: MPAjax.ReplaceList,
            };

            MPAjax.ReplaceList = [{
                place: StateData.place,
                source: StateData.source,
                "type": "mainBlock"
            }];
            History.pushState(StateData, null, `/search/query/${val}`);

            form.reset();
        }

        async function historyFormHandler(form) {
            const isMainPlaylistForm = form.classList.contains("main-playlist__form");
            const {
                date: dateInput,
                timefrom: fromInput,
                timeto: toInput,
            } = form;

            dateInput.setCustomValidity("");
            fromInput.setCustomValidity("");
            toInput.setCustomValidity("");

            const isDateValid = dateInput.checkValidity();
            const isFromValid = fromInput.checkValidity();
            const isToValid = toInput.checkValidity();
            const isValid = isDateValid && isFromValid && isToValid;

            dateInput.setCustomValidity(isDateValid ? "": "Необходимый формат дд.мм.гггг");
            fromInput.setCustomValidity(isFromValid ? "": "Необходимый формат чч:мм");
            toInput.setCustomValidity(isToValid ? "": "Необходимый формат чч:мм");

            dateInput.classList.toggle("invalid", !isDateValid);
            fromInput.classList.toggle("invalid", !isFromValid);
            toInput.classList.toggle("invalid", !isToValid);

            if (!isValid) return form.reportValidity();

            const date = encodeURIComponent(dateInput.value);
            const timefrom = encodeURIComponent(fromInput.value);
            const timeto = encodeURIComponent(toInput.value);
            const url = `${isMainPlaylistForm ? "/playlist" : form.getAttribute("action")}/date/${date}/timeto/${timeto}/timefrom/${timefrom}`;

            // для формы во всплывающем плейлисте
            // при сабмите редиректим на /playlist
            if (isMainPlaylistForm) {
                MPAjax.loader.currentProps = {};

                const StateData = {
                    place: MPAjax.PlaceID,
                    source: MPAjax.SourceID,
                    replaces: MPAjax.ReplaceList,
                };

                MPAjax.ReplaceList = [{
                    place: StateData.place,
                    source: StateData.source,
                    "type": "mainBlock"
                }];
                History.pushState(StateData, null, url);

                togglePlaylist(false);

                return;
            }

            const response = await fetch(url, {
                method: "GET",
            });
            const data = await response.text();
            const responseOutput = document.getElementById("search-result");

            if (responseOutput !== null) {
                responseOutput.innerHTML = data;
            }
        }

        let feedbackTimeOut = null;
        const feedback = document.querySelector(".clipboard-feedback");
        const clipboardFeedback = (isSuccess) => {
            feedback.textContent = isSuccess ? "Ссылка скопирована в буфер обмена" : "Не удалось скопировать ссылку в буфер обмена";

            clearTimeout(feedbackTimeOut);

            toggleAnimation({
                show: true,
                el: feedback,
                visibleClass: "clipboard-feedback_visible",
                animationClass: "clipboard-feedback_appeared",
            });

            feedbackTimeOut = setTimeout(() => {
                toggleAnimation({
                    show: false,
                    el: feedback,
                    visibleClass: "clipboard-feedback_visible",
                    animationClass: "clipboard-feedback_appeared",
                });
            }, 2000);
        };
        // запрашиваем права на запись в буфер обмена
        // navigator.permissions.query({ name: "clipboard-write" })
        //     .then((result) => {
        //         LikeFM.CLIPBOARD_PERMISSION = result.state === "granted" || result.state === "prompt";
        //     })
        //     .catch((error) => {
        //         // в firefox не нужно запрашивать доступ к буферу
        //         if (error.message == "'clipboard-write' (value of 'name' member of PermissionDescriptor) is not a valid value for enumeration PermissionName.") {
        //             LikeFM.CLIPBOARD_PERMISSION = true;
        //         }
        //         // не, ну а че
        //         else {
        //             console.log(error);
        //         }
        //     });

        // скопировать ссылку на новость в буфер
        document.addEventListener("click", (event) => {
            // if (!LikeFM.CLIPBOARD_PERMISSION) return;

            const isShareBtn = event.target.classList.contains("news-article__share");

            if (!isShareBtn) return;

            // navigator.clipboard.writeText(event.target.dataset.link)
            //     .then(() => { clipboardFeedback(true) })
            //     .catch(() => { clipboardFeedback(false) });

            const url = event.target.dataset.link;
            const textarea = document.createElement("textarea");
            textarea.textContent = url;
            textarea.style.position = "fixed";
            document.body.appendChild(textarea);
            textarea.select();

            try {
                document.execCommand("copy");
                clipboardFeedback(true);
            } catch (error) {
                console.error(`Copy clipboard error on: ${url}`);
                clipboardFeedback(false);
            } finally {
                document.body.removeChild(textarea);
            }
        });

        // общие обработчики для попапов

        // показать попап
        document.addEventListener("click", (event) => {
            const popupBtn = event.target.closest(".js-popup-btn");

            if (popupBtn === null) return;

            togglePopup(popupBtn.dataset.popupTarget, true);
            toggleBodyScrolling("lockScroll" in popupBtn.dataset);
        });

        // закрыть попап
        document.addEventListener("click", (event) => {
            const { target } = event;
            const isCloseBtnClick = target.closest(".popup__close") !== null;

            if (!isCloseBtnClick) return;

            const popup = target.closest(".popup");

            togglePopup(popup, false);
            toggleBodyScrolling(false);
        });

        function togglePopup(popup, show) {
            let popupDOMNode = null;

            if (typeof popup === "string") {
                popupDOMNode = document.querySelector(popup);
            }
            else if (popup instanceof HTMLElement) {
                popupDOMNode = popup;
            }

            if (popupDOMNode === null) return;

            toggleAnimation({
                show,
                el: popupDOMNode,
                visibleClass: "popup_visible",
                animationClass: "popup_appeared",
            });
        }

        LikeFM.isInited = true;

        /**
         * туглит элемент из состояния display: none (через css-классы)
         * и затем (через тик requestAnimationFrame) вешает класс анимации, и наоборот:
         * снимает класс анимации и после скрытия элемента, по transitionend,
         * скрывает в display: none (снимая класс видимости)
         * при первом вызове, вешает на элемент обработчик события transitionend
         * для обратного скрытия в display: none
         * !!! подходит только для элементов, которые общие для всего сайта
         * !!! в противном случае будет сохраняться ссылка на удаленные дом-ноды
         * !!! и будет утечечка памяти ¯\_(ツ)_/¯
         * 
         * @param {HTMLElement} el - DOM-элемент, который нужно проанимировать
         * @param {Boolean} show - состояние, в которое должен быть установлен элемент
         * @param {String} visibleClass - класс видимости, переключает элемент из display: none
         * @param {String} animationClass - класс запуска анимации
         * @param {Function} [onStateToggle] - функция будет вызываться на каждом этапе анимации (появление/скрытие)
         * @param {Function} [onBeforeShowing] - функция будет вызываться только перед показом блока
         */
        function toggleAnimation({
            show,
            el,
            visibleClass,
            animationClass,
            onStateToggle,
            onBeforeShowing,
        }) {
            toggleAnimation.initedElements = toggleAnimation.initedElements || [];

            if ( !toggleAnimation.initedElements.includes(el) ) {
                el.addEventListener("transitionend", (event) => {
                    if ( !el.classList.contains(animationClass) ) {
                        el.classList.remove(visibleClass);
                    }
                });
                toggleAnimation.initedElements.push(el);
            }

            requestAnimationFrame((now) => {
                el.classList.toggle(show ? visibleClass : animationClass, show);

                if (typeof onStateToggle === "function") {
                    onStateToggle(show);
                }

                if (!show) return;

                requestAnimationFrame((now) => {
                    el.classList.toggle(show ? animationClass : visibleClass, show);

                    if (typeof onBeforeShowing === "function") {
                        onBeforeShowing();
                    }
                });
            });
        }
    });
};

// главная
LikeFM.initializers[LikeFM.indexPageAn] = () => {
    isDocReady(() => {
        const { body } = document;

        const sliderWrap = document.querySelector(".index-slider");
        const sliderPagination = document.querySelector(".index-slider__pagination");
        const sliderBullets = [ ...sliderPagination.querySelectorAll(".index-slider__bullet") ];
        let mainSlider = null;
        let currentSliderMode = false; // "desktop" / "mobile" / false
        let currentActiveIndex = null;

        // переходим по ссылке с баннера
        // только при клике на активный слайд
        sliderWrap.addEventListener("click", (event) => {
            if (body.clientWidth < 992) return;

            const link = event.target.closest(".index-slider__slide");

            if (
                    link === null
                ||  mainSlider === null
                ||  +link.dataset.swiperSlideIndex === currentActiveIndex
            ) return;

            event.preventDefault();
        }, true);

        // запускаем "автоплей" слайдера руками,
        // т.к. есть баг с паузой при взаимодействии
        // https://github.com/nolimits4web/swiper/issues/4047
        sliderWrap.addEventListener("pointerenter", (event) => {
            if (mainSlider === null || currentSliderMode !== "desktop") return;

            mainSlider.autoplay.pause();
        });
        sliderWrap.addEventListener("pointerleave", (event) => {
            if (mainSlider === null || currentSliderMode !== "desktop") return;

            mainSlider.autoplay.start();
        });

        const newTracksSlider = new Swiper(".new-tracks-slider", {
            slidesPerView: "auto",
            slideToClickedSlide: false,
            threshold: 10,
        });

        const newsList = document.querySelector(".index-news-slider");
        let newsSlider = null;

        if (newsList !== null) {
            newsSlider = new Swiper(newsList, {
                slidesPerView: 1,
                spaceBetween: 15,
                loop: true,
                autoHeight: true,
                navigation: {
                    disabledClass: "index-news-slider__btn_disabled",
                    prevEl: ".index-news-slider__btn_t_prev",
                    nextEl: ".index-news-slider__btn_t_next",
                }
            });
        }

        checkIndexPageSliders();

        sliderPagination.addEventListener("click", (event) => {
            const btn = event.target.closest(".index-slider__bullet");

            if (mainSlider === null || btn === null) return;

            mainSlider.slideToLoop( sliderBullets.indexOf(btn) );
        });

        const an = getArticleName();
        LikeFM.resizeHandlers[an] = throttle(checkIndexPageSliders, window, 200);
        window.addEventListener("resize", LikeFM.resizeHandlers[an]);

        function checkIndexPageSliders() {
            let viewportWidth = body.clientWidth;

            if (viewportWidth > 991) {
                switch(currentSliderMode) {
                    case false:
                    case "mobile":
                        initMainSlider("desktop");
                        break;
                    default:
                        break;
                }
            }
            else {
                switch(currentSliderMode) {
                    case false:
                    case "desktop":
                        initMainSlider("mobile");
                        break;
                    default:
                        break;
                }
            }
        }

        /**
         * нельзя поменять тип эффекта с использованием свойства breakpoint,
         * поэтому нужно разобрать слайдер и собрать с новыми параметрами
         * https://swiperjs.com/swiper-api#param-breakpoints
         * @param {String} mode -   может принимать только 2 значения:
         *                          "desktop" или "mobile"
         */
        function initMainSlider(mode) {
            if (currentSliderMode !== false) {
                mainSlider.destroy();
            }

            let activeBullet = null;
            const setActiveBullet = (index) => {
                if (activeBullet !== null) {
                    activeBullet.classList.remove("index-slider__bullet_active");
                }

                sliderBullets[index].classList.add("index-slider__bullet_active");
                activeBullet = sliderBullets[index];
            };

            const sliderParams = mode === "desktop"
                ? {
                    effect: "cards",
                    loop: true,
                    loopAdditionalSlides: 4,
                    autoplay: {
                        delay: 4000,
                    },
                    slideToClickedSlide: true,
                }
                : {
                    slidesPerView: "auto",
                    spaceBetween: 10,
                };
            sliderParams.on = {
                init(swiper) {
                    setActiveBullet(swiper.realIndex);
                    currentActiveIndex = swiper.realIndex;
                },
                activeIndexChange(swiper) {
                    setActiveBullet(swiper.realIndex);
                },
                slideChangeTransitionEnd(swiper) {
                    currentActiveIndex = swiper.realIndex;
                }
            };

            mainSlider = new Swiper8(".index-slider__slider", sliderParams);
            currentSliderMode = mode;
        }
    });
};

// плейлист (история эфира)
LikeFM.initializers[LikeFM.playlistPageAn] = () => {
    if (LikeFM.initedPages[LikeFM.playlistPageAn]) return;
    initDatePicker( document.querySelector("#MPAjaxMainBlock .history-form__input_t_date") );
    addMask();
};

// видео
LikeFM.initializers[LikeFM.videoPageAn] = () => {
    $("#js-video-loader").loader({
        action: "click",
        contentWrapper: "#js-video-list",
        href: "/video__load",
        parameter: "page",
        initPage: 2,
        onPageLoad: false,
        callbacks: {
            onClick: function(params){}, // выполняется при любом клике на loader-блок.
            onScroll: function(params){}, // выполняется при любом скролле, независимо от положения на экране loader-блока
            onInit: function(params){}, // выполняется при подключении плагина
            beforeLoad: function(params) {}, // выполняется при подгрузке контента после CLICK или SCROLL
            receiveData: function(data) {}, // выполняется при получении данных по запросу
            afterLoad: function(params) {}, // выполняется после подгрузки контента
            destroyCallback: function(params) {
                this.elements.trigger.remove();
            }, // выполняется при удалении обработчика клика/скролла
        }
    });
};

// тренд-чарт
LikeFM.initializers[LikeFM.trendPageAn] = () => {
    $("#js-trend-loader").loader({
        action: "click",
        contentWrapper: "#js-trend-list",
        href: "/thrend__load",
        parameter: "page",
        initPage: 2,
        onPageLoad: false,
        callbacks: {
            onClick: function(params){}, // выполняется при любом клике на loader-блок.
            onScroll: function(params){}, // выполняется при любом скролле, независимо от положения на экране loader-блока
            onInit: function(params){}, // выполняется при подключении плагина
            beforeLoad: function(params) {}, // выполняется при подгрузке контента после CLICK или SCROLL
            receiveData: function(data) {}, // выполняется при получении данных по запросу
            afterLoad: function(params) {}, // выполняется после подгрузки контента
            destroyCallback: function(params) {
                this.elements.trigger.remove();
            }, // выполняется при удалении обработчика клика/скролла
        }
    });
};

/**
 * на некоторых страницах нужны дополнительные обработчики "resize" для слайдеров
 * при уходе на другую страницу нужно их снять,
 * чтобы не плодить кучу одинаковых обработчиков
 * и чтобы не держать лишнюю память
 * 
 * @param {String} [pageToExclude] - имя страницы, на которую переходим (с нее не снимается)
 *                                   если параметр опущен, снимаются все обработчики
 */
LikeFM.removeResizeHandlers = (pageToExclude = null) => {
    for (const an in LikeFM.resizeHandlers) {
        if (an === pageToExclude) continue;

        window.removeEventListener("resize", LikeFM.resizeHandlers[an]);
        delete LikeFM.resizeHandlers[an];
        delete LikeFM.initedPages[an];
    }
};

onPageEnter();

/**
 * инициализируем необходимые для страниц скрипты
 * и снимаем лишние обработчики
 */
function onPageEnter() {
    isDocReady(() => {
        LikeFM.initCommon();

        const an = getArticleName();

        if (typeof LikeFM.initializers[an] === "function") {
            LikeFM.initializers[an]();
        }

        LikeFM.removeResizeHandlers(an);

        // после появления нового контента в ДОМе
        // устанавливаем слежку за плеерами
        const root = document.getElementById("MPAjaxMainBlock");
        const elementsObserve = [ ...root.querySelectorAll(".player__inner") ];
        elementsObserve.forEach((el) => {
            LikeFM.titlesTickerInstance.observeElement(el);
        });
    });
}

/**
 * перед тем как вставить данные в дом
 * при переходе на другую страницу
 */
function beforeInsertCallback() {
    isDocReady(() => {
        // прекращаем слежку за нодами, которые будут удалены
        const root = document.getElementById("MPAjaxMainBlock");
        const elementsToUnobserve = [ ...root.querySelectorAll(".player__inner") ];
        elementsToUnobserve.forEach((el) => {
            LikeFM.titlesTickerInstance.unobserveElement(el);
        });
    });
}

// вспомогательные функции

function throttle(fn, ctx, ms) {
    let pendingCall = null;
    let lastCall = -ms;

    const decorator = function() {
        const now = performance.now();
        const diff = now - lastCall;
        const args = arguments;
        clearTimeout(pendingCall);

        if (diff >= ms) {
            lastCall = now;
            fn.call(ctx, ...args);
        }
        else {
            pendingCall = setTimeout(decorator, ms - diff, ...args);
        }
    };

    return decorator;
}

function initDatePicker(input) {
    if (input === null) return;

    const today = new Date();
    today.setHours(23);
    today.setMinutes(59);
    today.setSeconds(59);

    const datePicker = new Datepicker(input, {
        language: "ru",
        maxDate: today,
    });
}

function addMask() {
    const fields = document.querySelectorAll(`[data-mask]`);
    fields.forEach((field) => field.addEventListener(`input`, maskListener(field)));
}

function maskListener(field) {
    return () => {
        const mask = field.dataset.mask, value = field.value, maskLength = mask.length;
        const literalPattern = /[0\*]/, numberPattern = /[0-9]/;
        let newValue = ``, valueIndex = 0, maskIndex = 0;
        for (; maskIndex < maskLength;) {
            if (maskIndex >= value.length) break;
            if (mask[maskIndex] === `0` && value[valueIndex].match(numberPattern) === null) break;
            // found a literal
            while (mask[maskIndex].match(literalPattern) === null) {
                if (value[valueIndex] === mask[maskIndex]) break;
                newValue += mask[maskIndex++];
            }
            newValue += value[valueIndex++];
            maskIndex++;
        }
        field.value = newValue;
    };
}

function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
}

function getArticleName(url = window.location.href) {
    return MP.ParseQueryString(url).an || "index";
}