// !!!!!!!!!!!!!!!!!!
// новые элементы, за которыми нужна слежка нужно добавлять руками через
// MPAjax.commonCallback + TitlesTicker.observeElement
// старые элементы, за которыми слежка больше не нужна удаляем руками через
// MPAjax.beforeInsertCallback + TitlesTicker.unobserveElement
// !!!!!!!!!!!!!!!!!!

/**
 * следит за нодами с названием трека/исполнителя,
 * которые полностью влезают во вьюпорт
 * и навешивает на них класс с анимацией бегущей строки, в том случае
 * если название не вмещается полностью в одну строку
 * 
 * @constructor
 * @property { String } selector - селектор для отслеживаемых элементов
 * @property { String } tickingClass - css-класс анимации бегущей строки
 * 
 * добавляет элемент на отслеживание,
 * используется при переходах на новые страницы
 * @public @method observeElement
 * @param { HTMLElement } el - дом-нода с селектором равным selector из конструктора
 * 
 * снимает слежку за элементами,
 * используется при уходе со страниц с отслеживаемыми элементами
 * @public @method unobserveElement(HTMLElement)
 * @param { HTMLElement } el - дом-нода с селектором равным selector из конструктора
 * 
 * используется только главного плеера,
 * метод дергается каждый раз при обновлении титров
 * @public @method manualCheckForTicking(HTMLElement)
 * @param { HTMLElement } el - дом-нода #js-socket-titles
 */

class TitlesTicker {
    constructor({
        selector,
        tickingClass,
    }) {
        this._selector = selector;
        this._tickingClass = tickingClass;

        this._observerCallback = this._observerCallback.bind(this);
        this._observer = new IntersectionObserver(this._observerCallback, {
            rootMargin: "-90px 0px 0px 0px",
            threshold: 1.0,
        });

        [ ...document.querySelectorAll(this._selector) ].forEach((item) => {
            this.observeElement(item);
        });
    }

    observeElement(el) {
        this._observer.observe(el);
    }

    unobserveElement(el){
        this._observer.unobserve(el)
    }

    manualCheckForTicking(el) {
        const lines = [ ...el.querySelectorAll(".player__track, .player__artist") ];

        lines.forEach((line) => {
            const tick = this._checkForTicking(el, line);
            this._toggleTicking(line, tick);
        });
    }

    _checkForTicking(parentEl, innerEl) {
        return innerEl.scrollWidth > parentEl.offsetWidth;
    }

    _toggleTicking(el, tick) {
        el.classList.toggle(this._tickingClass, tick);
    }

    _observerCallback(entries, observer) {
        entries.forEach((entry) => {
            const { target } = entry;
            const lines = [ ...target.querySelectorAll(".player__track, .player__artist") ];

            lines.forEach((line) => {
                const tick = (
                        entry.intersectionRatio === 1
                    &&  this._checkForTicking(target, line)
                );
                this._toggleTicking(line, tick);
            });
        });
    };
}